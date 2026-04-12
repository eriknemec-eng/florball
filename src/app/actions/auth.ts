'use server';

import { getServerSession } from 'next-auth';
import { getDb, saveDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function getCurrentUser() {
  const session = await getServerSession() as any;
  if (!session || !session.user || !session.user.email) return null;
  
  const db = await getDb();
  return db.users.find((u: any) => u.email === session.user.email) || null;
}

export async function updateUserProfile(name: string, position: 'player' | 'goalie' | 'versatile', emailNotifications?: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const db = await getDb();
  const dbUser = db.users.find(u => u.uid === user.uid);
  if (dbUser) {
    if (name.trim().length > 1) {
       dbUser.name = name.trim();
    }
    dbUser.position = position;
    if (emailNotifications !== undefined) {
       dbUser.emailNotifications = emailNotifications;
    }
    await saveDb(db);
  }
}

export async function logout() {
  redirect('/api/auth/signout');
}

export async function changeUserPassword(oldPass: string, newPass: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const db = await getDb();
  const dbUser = db.users.find(u => u.uid === user.uid);
  if (!dbUser) throw new Error('User not found');

  if (!dbUser.passwordHash) {
     throw new Error('Účet nepoužívá heslo (přihlášení přes sociální síť).');
  }

  const isValid = await bcrypt.compare(oldPass, dbUser.passwordHash);
  if (!isValid) {
     throw new Error('Zadané současné heslo není správné.');
  }

  if (newPass.length < 5) {
     throw new Error('Nové heslo musí mít alespoň 5 znaků.');
  }

  dbUser.passwordHash = await bcrypt.hash(newPass, 10);
  await saveDb(db);
  return { success: true };
}
