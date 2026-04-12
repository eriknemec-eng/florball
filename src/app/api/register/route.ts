import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, saveDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, position, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Vyplňte všechna povinná pole.' }, { status: 400 });
    }

    const db = await getDb();
    
    // Zjistíme jestli už email náhodou neexistuje
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (exists) {
      return NextResponse.json({ error: 'Tento e-mail již je registrován. Běžte se přihlásit.' }, { status: 400 });
    }

    // Hash hesla
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      uid: Math.random().toString(36).slice(2),
      email: email.toLowerCase(),
      name: name,
      role: 'player' as any,
      isSubscriber: false,
      hasPaid: false,
      position: position || 'player',
      passwordHash: passwordHash
    };

    db.users.push(newUser);
    await saveDb(db);

    return NextResponse.json({ success: true, message: 'Účet vytvořen' }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Chyba serveru při registraci.' }, { status: 500 });
  }
}
