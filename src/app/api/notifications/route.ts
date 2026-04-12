import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action, email, payload } = data;

    // Prázdné těla funkcí připravené pro integraci s Brevo API
    if (action === 'sendMatchInvite') {
      console.log(`[Brevo API Stub] Odesílání pozvánky na zápas pro e-mail: ${email}`);
      // Zde bude: await fetch('https://api.brevo.com/v3/smtp/email', { ... })
    } else if (action === 'sendSpotAvailable') {
      console.log(`[Brevo API Stub] Odesílání notifikace o uvolnění místa pro e-mail: ${email}`);
    } else {
      console.warn(`[Brevo API Stub] Neznámá akce: ${action}`);
    }

    return NextResponse.json({ success: true, message: 'Notification stub hit' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
