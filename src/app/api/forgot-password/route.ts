import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Nezadali jste e-mail' }, { status: 400 });
    }

    const db = await getDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ success: true, message: 'Pokud účet existuje, zaslali jsme vám e-mail na znovunastavení.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = Date.now() + 30 * 60 * 1000; 

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = tokenExpiration;
    await saveDb(db);

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: '🔑 Obnova hesla - Pondělní Florbálek',
      html: `
        <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px;">
          <h2>Obnova hesla k palubovce</h2>
          <p>Někdo (pravděpodobně ty) požádal o obnovení hesla.</p>
          <p>Kliknutím na modré tlačítko níže si nastavíš heslo nové:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 10px;">Obnovit mé heslo</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Tento odkaz platí 30 minut. Pokud o záchranu nestojíš, e-mail prosím ignoruj.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Pokud účet existuje, zaslali jsme vám e-mail na znovunastavení.' });

  } catch (error) {
    console.error("Mail Error:", error);
    return NextResponse.json({ error: 'Chyba serveru při odesílání.' }, { status: 500 });
  }
}
