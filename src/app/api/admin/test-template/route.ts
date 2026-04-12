import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = await getDb();
    const currentUser = db.users.find(u => u.email === session.user?.email);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { targetEmail, templateId } = await req.json();

    if (!targetEmail || !templateId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (templateId === 'ping') {
        await sendEmail({
            to: targetEmail,
            subject: 'Systémový test funguje',
            html: '<p>Tento zkušební e-mail vyletěl přímo ze serveru Brevo, což znamená, že celá e-mailová propojka florbalové aplikace šlape bez chyby.</p>'
        });
    } else if (templateId === 'new-match') {
        await sendEmail({
            to: targetEmail,
            subject: `🏑 Vypsán nový florbal: Pondělní trénink (Test)`,
            html: `<h3>Nový termín otevřen!</h3><p>Právě byl vypsán nový florbalový zápas na <b>pondělí 13. 4. v 18:30</b>.</p><p>Kdo dřív přijde, ten hraje.</p><br/><a href="${baseUrl}/dashboard" style="background:#10b981;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;">Přihlásit se na zápas</a>`
        });
    } else if (templateId === 'freed-player') {
        await sendEmail({
            to: targetEmail,
            subject: '🔥 Uvolnilo se místo pro HRÁČE',
            html: `<h3>Šance naskočit!</h3><p>Někdo se právě odhlásil ze zápasu a díky tomu se v poli uvolnilo místo. Kdo z náhradníků dřív přijde a potvrdí účast, ten hraje.</p><a href="${baseUrl}/dashboard" style="background:#10b981;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Jít rychle na palubovku</a>`
        });
    } else if (templateId === 'freed-goalie') {
        await sendEmail({
            to: targetEmail,
            subject: '🔥 Uvolnilo se místo v BRÁNĚ',
            html: `<h3>Šance na chytání!</h3><p>Jeden z gólmanů odpadl a uvolnilo se místo. Skoč po tom jako tygr!</p><a href="${baseUrl}/dashboard" style="background:#10b981;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Jít rychle na palubovku</a>`
        });
    } else if (templateId === 'password-reset') {
        await sendEmail({
            to: targetEmail,
            subject: 'Obnova zapomenutého hesla',
            html: `<h3>Obnova hesla na tvůj účet</h3><p>Požádal jsi (nebo se pokoušíme simulovat žádost) o obnovu hesla.</p><p><a href="${baseUrl}/reset-password?token=DEMO_TESTOVACI_TOKEN" style="background:#3b82f6;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Zadej nové heslo</a></p><p>Link by normálně platil 1 hodinu.</p>`
        });
    } else {
        return NextResponse.json({ error: 'Neznámá šablona' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
