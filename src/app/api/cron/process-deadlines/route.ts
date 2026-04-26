import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { sendEmail } from '@/lib/mailer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Ochrana před spuštěním cizími lidmi
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    let needsDbSave = false;
    const nowTs = new Date().getTime();
    const emailPromises: Promise<any>[] = [];

    db.matches.forEach(m => {
       if (m.lockPhase === 'phase1_open' && new Date(m.deadline).getTime() < nowTs && m.status === 'open') {
           m.lockPhase = 'phase2_locked';
           needsDbSave = true;
           
           // Rozdělení podle pozic pro vyhodnocení top N
           const players = m.responses.filter(r => r.status === 'going_player');
           const goalies = m.responses.filter(r => r.status === 'going_goalie');

           // Sortovací klíč: 1) isSubscriber (true first), 2) timestamp (older first)
           const sortStrategy = (a: any, b: any) => {
              const isGuestA = a.uid?.startsWith('guest_');
              const isGuestB = b.uid?.startsWith('guest_');
              const uA = db.users.find(u => u.uid === a.uid);
              const uB = db.users.find(u => u.uid === b.uid);
              const subA = (uA?.isSubscriber || isGuestA) ? 1 : 0;
              const subB = (uB?.isSubscriber || isGuestB) ? 1 : 0;
              if (subA !== subB) return subB - subA; // 1 before 0
              return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
           };

           players.sort(sortStrategy);
           goalies.sort(sortStrategy);

           // Ostatní odpovědi (maybe, not_going) necháme beze změny
           const newResponses: typeof m.responses = m.responses.filter(r => !r.status.startsWith('going'));

           const confirmedUids: string[] = [];
           const reserveUids: string[] = [];

           // Rozřazení hráčů (max 12 hraje, zbytek reserve)
           players.forEach((p, idx) => {
              const isCut = idx < 12;
              newResponses.push({
                 ...p,
                 status: isCut ? 'playing_player' : 'reserve_player'
              });
              if (isCut) confirmedUids.push(p.uid);
              else reserveUids.push(p.uid);
           });

           // Rozřazení gólmanů (max 2 hrají, zbytek reserve)
           goalies.forEach((g, idx) => {
              const isCut = idx < 2;
              newResponses.push({
                 ...g,
                 status: isCut ? 'playing_goalie' : 'reserve_goalie'
              });
              if (isCut) confirmedUids.push(g.uid);
              else reserveUids.push(g.uid);
           });

           m.responses = newResponses;
           
           // Rozeslání notifikačních e-mailů po uzávěrce (NEPŘEDPLATITELŮM)
           const confirmedEmails = db.users
              .filter(u => confirmedUids.includes(u.uid) && !u.isSubscriber && u.emailNotifications !== false)
              .map(u => u.email);
           
           const reserveEmails = db.users
              .filter(u => reserveUids.includes(u.uid) && !u.isSubscriber && u.emailNotifications !== false)
              .map(u => u.email);

           if (confirmedEmails.length > 0) {
              emailPromises.push(sendEmail({
                 to: confirmedEmails,
                 subject: `✅ Potvrzení účasti: ${m.title}`,
                 html: `<h3>Tvoje místo je oficiálně potvrzené!</h3>
                        <p>Uzávěrka pro zápas <strong>${m.title}</strong> právě proběhla a ty ses úspěšně vlezl do sestavy.</p>
                        <p>Počítáme s tebou. Kdyby se něco stalo a ty bys nemohl(a) dodatečně dorazit, musíš se ručně odhlásit v aplikaci, aby systém mohl zalarmovat náhradníky pod čarou.</p>
                        <br/><a href="https://pondelniflorbalek.cz/dashboard" style="background:#10b981;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Zobrazit zápas</a>`
              }).catch(console.error));
           }

           if (reserveEmails.length > 0) {
              emailPromises.push(sendEmail({
                 to: reserveEmails,
                 subject: `⚠️ Náhradník pod čarou: ${m.title}`,
                 html: `<h3>Kapacita zápasu se naplnila</h3>
                        <p>Bohužel na tebe v současné chvíli nevyšlo u zápasu <strong>${m.title}</strong> místo limitu a jsi veden(a) jako náhradník pod čarou.</p>
                        <p>Nic ale ještě není ztraceno! Jakmile se kdokoliv odhlásí na poslední chvíli, systém rozešle notifikaci s odkazem. Kdo z náhradníků na to klikne dřív, bere volné místo.</p>
                        <br/><a href="https://pondelniflorbalek.cz/dashboard" style="background:#f59e0b;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Zkontrolovat stav</a>`
              }).catch(console.error));
           }
       }
    });

    if (needsDbSave) {
      await saveDb(db);
      if (emailPromises.length > 0) {
         await Promise.allSettled(emailPromises);
      }
      return NextResponse.json({ success: true, message: 'Zápasy zpracovány a e-maily odeslány.' });
    }

    return NextResponse.json({ success: true, message: 'Žádné zápasy k vyhodnocení.' });

  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
