import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
    }

    const db = await getDb();
    const user = db.users.find(u => u.email === session.user?.email);
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
    }

    const { targetEmail } = await request.json();
    if (!targetEmail) {
      return NextResponse.json({ error: 'Cílový e-mail chybí' }, { status: 400 });
    }

    const customHost = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    await sendEmail({
      to: targetEmail,
      subject: '🛠 Zkušební Odeslání z Administrace',
      html: `
        <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #10b981; border-radius: 12px; background: #e6ffed;">
          <h2 style="color: #10b981;">Spojení Úspěšné!</h2>
          <p>Tento e-mail byl manuálně vyvolán z administrace aplikace.</p>
          <hr />
          <ul style="font-size: 14px;">
             <li><strong>Aplikace z URL:</strong> ${customHost}</li>
             <li><strong>Odesílatel v Brevo:</strong> ${process.env.EMAIL_FROM}</li>
             <li><strong>Stav SMTP:</strong> V pořádku</li>
          </ul>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Ping odeslán' });
  } catch (error: any) {
    console.error("Test Email Error:", error);
    return NextResponse.json({ error: error.message || 'Chyba při odesílání.' }, { status: 500 });
  }
}
