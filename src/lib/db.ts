import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from './firebase';
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
      capacity: 14
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

    parsed.matches.forEach(m => {
       if (m.lockPhase === 'phase1_open' && new Date(m.deadline).getTime() < nowTs && m.status === 'open') {
           m.lockPhase = 'phase2_locked';
           needsDbSave = true;
           
           // Rozdělení podle pozic pro vyhodnocení top N
           const players = m.responses.filter(r => r.status === 'going_player');
           const goalies = m.responses.filter(r => r.status === 'going_goalie');

           // Sortovací klíč: 1) isSubscriber (true first), 2) timestamp (older first)
           const sortStrategy = (a: any, b: any) => {
              const uA = parsed.users.find(u => u.uid === a.uid);
              const uB = parsed.users.find(u => u.uid === b.uid);
              const subA = uA?.isSubscriber ? 1 : 0;
              const subB = uB?.isSubscriber ? 1 : 0;
              if (subA !== subB) return subB - subA; // 1 before 0
              return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
           };

           players.sort(sortStrategy);
           goalies.sort(sortStrategy);

           // Ostatní odpovědi (maybe, not_going) necháme beze změny
           const newResponses: typeof m.responses = m.responses.filter(r => !r.status.startsWith('going'));

           // Rozřazení hráčů (max 12 hraje, zbytek reserve)
           players.forEach((p, idx) => {
              newResponses.push({
                 ...p,
                 status: idx < 12 ? 'playing_player' : 'reserve_player'
              });
           });

           // Rozřazení gólmanů (max 2 hrají, zbytek reserve)
           goalies.forEach((g, idx) => {
              newResponses.push({
                 ...g,
                 status: idx < 2 ? 'playing_goalie' : 'reserve_goalie'
              });
           });

           m.responses = newResponses;
       }
    });

    if (needsDbSave) {
      await saveDb(parsed);
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
