'use server';

import { getDb, saveDb } from '@/lib/db';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/mailer';

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
}

export async function updateSettings(whatsappLink: string, qrCodeUrl?: string, qrBankAccount?: string, seasonFee?: number, matchFee?: number) {
  await checkAdmin();
  const db = await getDb();
  if (!db.settings) {
    db.settings = {};
  }
  db.settings.whatsappLink = whatsappLink.trim();
  if (qrCodeUrl !== undefined) db.settings.qrCodeUrl = qrCodeUrl.trim();
  if (qrBankAccount !== undefined) db.settings.qrBankAccount = qrBankAccount.trim();
  if (seasonFee !== undefined && !isNaN(seasonFee)) db.settings.seasonFee = seasonFee;
  if (matchFee !== undefined && !isNaN(matchFee)) db.settings.matchFee = matchFee;
  await saveDb(db);
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/qr');
}

export async function toggleUserStatus(uid: string, field: 'isSubscriber' | 'hasPaid') {
  await checkAdmin();
  const db = await getDb();
  const user = db.users.find(u => u.uid === uid);
  if (user) {
    user[field] = !user[field];
    await saveDb(db);
    revalidatePath('/admin');
  }
}

export async function toggleUserRole(uid: string) {
  await checkAdmin();
  // Zásadní ochrana proti zamknutí sebe sama jako hlavního admina (root account)
  if (uid === 'admin1') {
    throw new Error('Nelze odebrat administrátorská práva hlavnímu adminovi.');
  }
  
  const db = await getDb();
  const user = db.users.find(u => u.uid === uid);
  if (user) {
    user.role = user.role === 'admin' ? 'player' : 'admin';
    await saveDb(db);
    revalidatePath('/admin');
  }
}

export async function changeUserPosition(uid: string, position: 'player' | 'goalie' | 'versatile') {
  await checkAdmin();
  const db = await getDb();
  const user = db.users.find(u => u.uid === uid);
  if (user) {
    user.position = position;
    await saveDb(db);
    revalidatePath('/admin');
  }
}

export async function addNews(title: string, content: string, isPinned: boolean = false) {
  await checkAdmin();
  const db = await getDb();
  db.news.unshift({
    id: 'n' + Date.now(),
    title,
    content,
    createdAt: new Date().toISOString(),
    isPinned
  });
  await saveDb(db);
  revalidatePath('/dashboard');
  revalidatePath('/admin');
}

export async function createCustomMatch(dateIso: string, capacity: number, title: string, deadlineIso: string) {
  await checkAdmin();
  const db = await getDb();
  
  const newMatch = {
    id: 'm_' + Date.now(),
    title,
    date: dateIso,
    status: 'open' as const,
    deadline: deadlineIso,
    lockPhase: 'phase1_open' as const,
    capacity,
    responses: []
  };
  db.matches.push(newMatch);
  
  await saveDb(db);
  revalidatePath('/dashboard');
  revalidatePath('/admin');
  
  return { id: newMatch.id, title: newMatch.title, date: newMatch.date };
}

export async function addMatchTemplate(title: string, dayOfWeek: number, time: string, capacity: number, deadlineDaysBefore: number, deadlineTime: string) {
  await checkAdmin();
  const db = await getDb();
  
  db.templates.push({
    id: 't_' + Date.now(),
    title,
    dayOfWeek,
    time,
    deadlineDaysBefore,
    deadlineTime,
    capacity
  });
  
  await saveDb(db);
  revalidatePath('/admin');
}

export async function deleteMatchTemplate(templateId: string) {
  await checkAdmin();
  const db = await getDb();
  
  db.templates = db.templates.filter(t => t.id !== templateId);
  
  await saveDb(db);
  revalidatePath('/admin');
}

export async function createMatchFromTemplate(templateId: string) {
  await checkAdmin();
  const db = await getDb();
  
  const template = db.templates.find(t => t.id === templateId);
  if (!template) throw new Error('Šablona nenalezena');
  
  const today = new Date();
  const day = today.getDay(); // 0=Sunday, 1=Monday
  
  // Calculate days until the required dayOfWeek
  let daysUntil = template.dayOfWeek - day;
  if (daysUntil <= 0) {
     const [hour, minute] = template.time.split(':').map(Number);
     // If it's today, but the time has already passed, schedule for next week
     if (daysUntil === 0 && (today.getHours() > hour || (today.getHours() === hour && today.getMinutes() >= minute))) {
         daysUntil += 7;
     } else if (daysUntil < 0) {
         daysUntil += 7;
     }
  }
  
  const matchDate = new Date(today);
  matchDate.setDate(today.getDate() + daysUntil);
  const [hour, minute] = template.time.split(':').map(Number);
  matchDate.setHours(hour, minute, 0, 0);

  const deadlineDate = new Date(matchDate);
  deadlineDate.setDate(matchDate.getDate() - (template.deadlineDaysBefore || 1));
  const [dHour, dMinute] = (template.deadlineTime || '12:00').split(':').map(Number);
  deadlineDate.setHours(dHour, dMinute, 0, 0);

  const newMatch = {
    id: 'm_' + Date.now(),
    title: template.title,
    date: matchDate.toISOString(),
    status: 'open' as const,
    deadline: deadlineDate.toISOString(),
    lockPhase: 'phase1_open' as const,
    capacity: template.capacity,
    responses: []
  };

  db.matches.push(newMatch);
  
  await saveDb(db);
  revalidatePath('/dashboard');
  revalidatePath('/admin');

  return { id: newMatch.id, title: newMatch.title, date: newMatch.date };
}

export async function deleteMatch(matchId: string) {
  await checkAdmin();
  const db = await getDb();
  db.matches = db.matches.filter(m => m.id !== matchId);
  await saveDb(db);
  revalidatePath('/dashboard');
  revalidatePath('/admin');
}

export async function editMatch(matchId: string, title: string, dateIso: string, capacity: number, deadlineIso: string) {
  await checkAdmin();
  const db = await getDb();
  const match = db.matches.find(m => m.id === matchId);
  if (match) {
    match.title = title;
    match.date = dateIso;
    match.capacity = Number(capacity);
    match.deadline = deadlineIso;
    await saveDb(db);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
  }
}

export async function cancelMatch(matchId: string) {
  await checkAdmin();
  const db = await getDb();
  const match = db.matches.find(m => m.id === matchId);
  if (match) {
    match.status = 'cancelled';
    await saveDb(db);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
  }
}

export async function deleteNews(newsId: string) {
  await checkAdmin();
  const db = await getDb();
  db.news = db.news.filter(n => n.id !== newsId);
  await saveDb(db);
  revalidatePath('/dashboard');
  revalidatePath('/admin');
}

export async function toggleNewsPin(newsId: string) {
  await checkAdmin();
  const db = await getDb();
  const newsItem = db.news.find(n => n.id === newsId);
  if (newsItem) {
    newsItem.isPinned = !newsItem.isPinned;
    await saveDb(db);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
  }
}

export async function deleteUser(uid: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  if (uid === 'admin1' || currentUser.email === 'admin@florbal.cz' ? false : (currentUser.email === 'erik.nemec@me.com' && uid === currentUser.uid)) {
     throw new Error('Nelze smazat hlavní systémový účet.');
  }

  // Nemůžu smazat sám sebe jako admin (ochrana)
  if (currentUser.uid === uid) {
     throw new Error('Nemůžete smazat svůj vlastní účet.');
  }

  const db = await getDb();
  
  // Odebrání z databáze uživatelů
  db.users = db.users.filter(u => u.uid !== uid);
  
  // Bylo by vhodné smazat i jeho přihlášky k zápasům? Ano.
  for (const match of db.matches) {
     if (match.responses) {
        match.responses = match.responses.filter(r => r.uid !== uid);
     }
  }

  await saveDb(db);
  revalidatePath('/admin');
}

export async function resetSubscribers() {
  await checkAdmin();
  const db = await getDb();
  let modified = false;
  db.users.forEach(u => {
    if (u.isSubscriber) {
      u.hasPaid = false;
      modified = true;
    }
  });
  if (modified) {
    await saveDb(db);
    revalidatePath('/admin');
  }
}

export async function resolveDebt(uid: string, amount: number) {
  await checkAdmin();
  const db = await getDb();
  const user = db.users.find(u => u.uid === uid);
  if (user && user.debt && user.debt >= amount) {
    user.debt -= amount;
    await saveDb(db);
    revalidatePath('/admin');
    revalidatePath('/dashboard');
  }
}

export async function evaluateMatchAttendance(matchId: string, attendedUserIds: string[]) {
  await checkAdmin();
  const db = await getDb();
  
  const matchFee = db.settings?.matchFee || 50;
  let modified = false;
  
  // Nalezneme vsechny uzivatele, kteri jsou v seznamu a nemaji predplatne
  attendedUserIds.forEach(uid => {
    const user = db.users.find(u => u.uid === uid);
    if (user && !user.isSubscriber) {
       user.debt = (user.debt || 0) + matchFee;
    }
  });
  
  // Zápas se musí vždy označit jako vyhodnocený/uzavřený
  const match = db.matches.find(m => m.id === matchId);
  if (match) {
     match.status = 'closed';
  }
  
  await saveDb(db);
  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export async function sendMatchInvitationEmail(matchId: string) {
  await checkAdmin();
  const db = await getDb();
  
  const match = db.matches.find(m => m.id === matchId);
  if (!match) throw new Error('Zápas nenalezen');

  const targetEmails = db.users
     .filter(u => u.emailNotifications !== false)
     .map(u => u.email);

  if (targetEmails.length === 0) return;

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const matchDate = new Date(match.date);
  const dateStr = matchDate.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'numeric' });
  const timeStr = matchDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  
  await sendEmail({
     to: targetEmails,
     subject: `🏑 Vypsán nový florbal: ${match.title || 'Trénink'}`,
     html: `<h3>Nový termín otevřen!</h3><p>Právě byl vypsán nový florbalový zápas na <b>${dateStr} v ${timeStr}</b>.</p><p>Kdo dřív přijde, ten hraje.</p><br/><a href="${baseUrl}/dashboard" style="background:#10b981;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;">Přihlásit se na zápas</a>`
  });
}
