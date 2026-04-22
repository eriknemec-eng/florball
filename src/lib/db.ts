import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { sendEmail } from './mailer';

export type Role = 'admin' | 'player';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: Role;
  isSubscriber: boolean;
  hasPaid: boolean;
  debt?: number;
  position?: 'player' | 'goalie' | 'versatile';
  emailNotifications?: boolean;
  passwordHash?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

export type MatchStatus = 
  // Fáze 1 (Před uzávěrkou)
  | 'going_player' | 'going_goalie' 
  // Fáze 2 (Po uzávěrce a FFF)
  | 'playing_player' | 'playing_goalie' 
  | 'reserve_player' | 'reserve_goalie'
  // Vyjádření
  | 'maybe' | 'not_going';

export interface MatchResponse {
  uid: string;
  status: MatchStatus;
  timestamp: string;
}

export interface Match {
  id: string;
  title?: string;
  date: string; // ISO string 
  status: 'open' | 'closed' | 'cancelled'; // manuálně uzavřeno adminem nebo zrušeno
  deadline: string; // ISO string deadline pro vytvoření čáry
  lockPhase: 'phase1_open' | 'phase2_locked';
  capacity: number;
  durationMinutes?: number;
  responses: MatchResponse[];
}

export interface News {
  id: string;
  title: string;
  content: string;
  createdAt: string; 
  isPinned?: boolean;
}

export interface MatchTemplate {
  id: string;
  title: string;
  dayOfWeek: number; // 0=Ne, 1=Po, 2=Út, 3=St, 4=Čt, 5=Pá, 6=So
  time: string;      // např. "18:30"
  deadlineDaysBefore: number; // 1 = sobota
  deadlineTime: string;       // "12:00"
  capacity: number;
  durationMinutes?: number;
}

export interface Database {
  users: User[];
  matches: Match[];
  news: News[];
  templates: MatchTemplate[];
  settings?: {
    whatsappLink?: string;
    qrCodeUrl?: string;
    qrBankAccount?: string;
    seasonFee?: number;
    matchFee?: number;
  };
}

const DEFAULT_DB: Database = {
  users: [
    { uid: 'admin1', email: 'erik.nemec@me.com', name: 'Erik', role: 'admin', isSubscriber: true, hasPaid: true, position: 'versatile' }
  ],
  matches: [],
  news: [],
  templates: [
    {
      id: 't_default1',
      title: 'Základní Trénink',
      dayOfWeek: 1, // Pondělí
      time: '18:30',
      deadlineDaysBefore: 2, // Sobota
      deadlineTime: '12:00',
      capacity: 14,
      durationMinutes: 90
    }
  ]
};

export async function getDb(): Promise<Database> {
  try {
    const docRef = doc(firestore, 'data', 'main');
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
       await saveDb(DEFAULT_DB);
       return DEFAULT_DB;
    }

    const parsed = snapshot.data() as Database;
    let needsSave = false;
    if (!parsed.templates) {
      parsed.templates = DEFAULT_DB.templates;
      needsSave = true;
    }
    
    // Nastavení DEFAULT pozice jen pro účely zpětné kompatibility pokud úplně chybí i po restartu.
    // Pro produkční DB chceme nechat u.position undefined, ale v mock data na to dejme pozor.

    parsed.matches.forEach(m => {
      // Default migration pro nové variables
      if (!m.deadline) {
         m.deadline = m.date; // fallback
      }
      if (!m.lockPhase) {
         m.lockPhase = 'phase1_open';
      }
      if (!m.durationMinutes) {
         m.durationMinutes = 90;
         needsSave = true;
      }

      m.responses.forEach((r: any) => {
        if (r.status === 'going') {
           // Default fallback is player if old data
           r.status = 'going_player';
           needsSave = true;
        } else if (r.status === 'substitute') {
           r.status = 'substitute_player';
           needsSave = true;
        }
      });
    });

    let needsDbSave = needsSave;
    const nowTs = new Date().getTime();
    const emailPromises: Promise<any>[] = [];

    parsed.matches.forEach(m => {
       if (m.lockPhase === 'phase1_open' && new Date(m.deadline).getTime() < nowTs && m.status === 'open') {
           m.lockPhase = 'phase2_locked';
           needsDbSave = true;
           
           // Rozdělení podle pozic pro vyhodnocení top N
           const players = m.responses.filter(r => r.status === 'going_player');
           const goalies = m.responses.filter(r => r.status === 'going_goalie');

           // Sortovací klíč: 1) isSubscriber (true first), 2) timestamp (older first)
           const sortStrategy = (a: any, b: any) => {
              const isGuestA = a.uid?.startsWith('guest_');
              const isGuestB = b.uid?.startsWith('guest_');
              const uA = parsed.users.find(u => u.uid === a.uid);
              const uB = parsed.users.find(u => u.uid === b.uid);
              const subA = (uA?.isSubscriber || isGuestA) ? 1 : 0;
              const subB = (uB?.isSubscriber || isGuestB) ? 1 : 0;
              if (subA !== subB) return subB - subA; // 1 before 0
              return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
           };

           players.sort(sortStrategy);
           goalies.sort(sortStrategy);

           // Ostatní odpovědi (maybe, not_going) necháme beze změny
           const newResponses: typeof m.responses = m.responses.filter(r => !r.status.startsWith('going'));

           const confirmedUids: string[] = [];
           const reserveUids: string[] = [];

           // Rozřazení hráčů (max 12 hraje, zbytek reserve)
           players.forEach((p, idx) => {
              const isCut = idx < 12;
              newResponses.push({
                 ...p,
                 status: isCut ? 'playing_player' : 'reserve_player'
              });
              if (isCut) confirmedUids.push(p.uid);
              else reserveUids.push(p.uid);
           });

           // Rozřazení gólmanů (max 2 hrají, zbytek reserve)
           goalies.forEach((g, idx) => {
              const isCut = idx < 2;
              newResponses.push({
                 ...g,
                 status: isCut ? 'playing_goalie' : 'reserve_goalie'
              });
              if (isCut) confirmedUids.push(g.uid);
              else reserveUids.push(g.uid);
           });

           m.responses = newResponses;
           
           // Rozeslání notifikačních e-mailů po uzávěrce (NEPŘEDPLATITELŮM)
           const confirmedEmails = parsed.users
              .filter(u => confirmedUids.includes(u.uid) && !u.isSubscriber && u.emailNotifications !== false)
              .map(u => u.email);
           
           const reserveEmails = parsed.users
              .filter(u => reserveUids.includes(u.uid) && !u.isSubscriber && u.emailNotifications !== false)
              .map(u => u.email);

           if (confirmedEmails.length > 0) {
              emailPromises.push(sendEmail({
                 to: confirmedEmails,
                 subject: `✅ Potvrzení účasti: ${m.title}`,
                 html: `<h3>Tvoje místo je oficiálně potvrzené!</h3>
                        <p>Uzávěrka pro zápas <strong>${m.title}</strong> právě proběhla a ty ses úspěšně vlezl do sestavy.</p>
                        <p>Počítáme s tebou. Kdyby se něco stalo a ty bys nemohl(a) dodatečně dorazit, musíš se ručně odhlásit v aplikaci, aby systém mohl zalarmovat náhradníky pod čarou.</p>
                        <br/><a href="https://pondelniflorbalek.cz/dashboard" style="background:#10b981;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Zobrazit zápas</a>`
              }).catch(console.error));
           }

           if (reserveEmails.length > 0) {
              emailPromises.push(sendEmail({
                 to: reserveEmails,
                 subject: `⚠️ Náhradník pod čarou: ${m.title}`,
                 html: `<h3>Kapacita zápasu se naplnila</h3>
                        <p>Bohužel na tebe v současné chvíli nevyšlo u zápasu <strong>${m.title}</strong> místo limitu a jsi veden(a) jako náhradník pod čarou.</p>
                        <p>Nic ale ještě není ztraceno! Jakmile se kdokoliv odhlásí na poslední chvíli, systém rozešle notifikaci s odkazem. Kdo z náhradníků na to klikne dřív, bere volné místo.</p>
                        <br/><a href="https://pondelniflorbalek.cz/dashboard" style="background:#f59e0b;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Zkontrolovat stav</a>`
              }).catch(console.error));
           }
       }
    });

    if (needsDbSave) {
      await saveDb(parsed);
      if (emailPromises.length > 0) {
         await Promise.allSettled(emailPromises);
      }
    }

    return parsed;
  } catch (error: any) {
    console.error("Firestore getDb Error:", error);
    return DEFAULT_DB;
  }
}

export async function saveDb(db: Database): Promise<void> {
  const docRef = doc(firestore, 'data', 'main');
  await setDoc(docRef, db);
}
