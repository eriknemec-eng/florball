'use server';

import { getServerSession } from 'next-auth';
import { getDb, saveDb } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const session = await getServerSession() as any;
  if (!session || !session.user || !session.user.email) return null;
  
  const db = await getDb();
  return db.users.find((u: any) => u.email === session.user.email) || null;
}

export async function setMyPosition(position: 'player' | 'goalie' | 'versatile') {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const db = await getDb();
  const dbUser = db.users.find(u => u.uid === user.uid);
  if (dbUser) {
    dbUser.position = position;
    await saveDb(db);
  }
}

export async function logout() {
  redirect('/api/auth/signout');
}
