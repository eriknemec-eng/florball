import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, saveDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Chybný požadavek' }, { status: 400 });
    }

    const db = await getDb();
    
    // Najdi uživatele podle tokenu a zároveň validuj expiraci
    const user = db.users.find(u => u.resetPasswordToken === token && u.resetPasswordExpires && u.resetPasswordExpires > Date.now());

    if (!user) {
      return NextResponse.json({ error: 'Tento odkaz je neplatný, nebo mu již vypršela 30ti minutová platnost. Prosím vyžádejte si heslo znovu.' }, { status: 400 });
    }

    // Nastav nové heslo
    user.passwordHash = await bcrypt.hash(password, 10);
    
    // Znič token po použití!
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await saveDb(db);

    return NextResponse.json({ success: true, message: 'Heslo úspěšně změněno' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Chyba serveru při ukládání.' }, { status: 500 });
  }
}
