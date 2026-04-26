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

    if (needsSave) {
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
