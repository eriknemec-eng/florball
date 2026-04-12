'use server';

import { getDb, saveDb } from '@/lib/db';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

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
  
  return { title: newMatch.title, date: newMatch.date };
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

  return { title: newMatch.title, date: newMatch.date };
}

export async function deleteMatch(matchId: string) {
  await checkAdmin();
  const db = await getDb();
  db.matches = db.matches.filter(m => m.id !== matchId);
  await saveDb(db);
  revalidatePath('/dashboard');
  revalidatePath('/admin');
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
       modified = true;
    }
  });
  
  // Volitelně můžeme zápas označit jako "evaluated: true" aby se finančně nehodnotil dvakrát
  // const match = db.matches.find(m => m.id === matchId);
  // if (match) match.isEvaluated = true;
  
  if (modified) {
    await saveDb(db);
    revalidatePath('/admin');
    revalidatePath('/dashboard');
  }
}
