'use server';

import { getDb, saveDb } from '@/lib/db';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/mailer';

export async function respondToMatch(matchId: string, statusText: 'going_player' | 'going_goalie' | 'not_going' | 'maybe') {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const db = await getDb(); // v tento moment se aplikuje lazy uzávěrka jestli je čas
  const matchIndex = db.matches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) throw new Error('Match not found');

  const match = db.matches[matchIndex];
  
  if (match.status === 'closed') {
    throw new Error('Match is explicitly closed');
  }

  let responses = match.responses || [];
  const existingIndex = responses.findIndex(r => r.uid === user.uid);

  // Zrušení odpovědi pokud klikl podruhé na to samé (toggle)
  if (existingIndex !== -1 && responses[existingIndex].status === statusText) {
     responses.splice(existingIndex, 1);
  } else {
     if (existingIndex !== -1) {
       responses.splice(existingIndex, 1);
     }
     
     if (statusText === 'not_going' || statusText === 'maybe') {
         responses.push({
           uid: user.uid,
           status: statusText,
           timestamp: new Date().toISOString()
         });
     } else {
         // Chce jít (going_player / going_goalie)
         if (match.lockPhase === 'phase1_open') {
             // Otevřená registrace - žádné kapacitní limity, všichni se sbírají!
             responses.push({
               uid: user.uid,
               status: statusText, // např. going_player
               timestamp: new Date().toISOString()
             });
         } else {
             // Zámeček padl, FFF (Kdo dřív přijde) nebo jít na čekací listinu
             const MAX_PLAYERS = 12;
             const MAX_GOALIES = 2;
             const currentlyPlayingPlayers = responses.filter(r => r.status === 'playing_player').length;
             const currentlyPlayingGoalies = responses.filter(r => r.status === 'playing_goalie').length;

             let finalStatus: any = statusText;
             
             if (statusText === 'going_player') {
                 finalStatus = currentlyPlayingPlayers < MAX_PLAYERS ? 'playing_player' : 'reserve_player';
             } else if (statusText === 'going_goalie') {
                 finalStatus = currentlyPlayingGoalies < MAX_GOALIES ? 'playing_goalie' : 'reserve_goalie';
             }

             responses.push({
               uid: user.uid,
               status: finalStatus,
               timestamp: new Date().toISOString()
             });
         }
     }
  }

  match.responses = responses;

  // Rozesílání emailů o uvolněné kapacitě při odhlášení
  if (match.lockPhase === 'phase2_locked' && statusText === 'not_going') {
      const baseUrl = 'https://pondelniflorbalek.cz';
      
      const pPlaying = responses.filter(r => r.status === 'playing_player').length;
      if (pPlaying < 12) {
          const reserveUids = responses.filter(r => r.status === 'reserve_player').map(r => r.uid);
          const reserveEmails = db.users
            .filter(u => reserveUids.includes(u.uid) && u.emailNotifications !== false)
            .map(u => u.email);
          
          if (reserveEmails.length > 0) {
              await sendEmail({
                  to: reserveEmails,
                  subject: '🔥 Uvolnilo se místo pro HRÁČE',
                  html: `<h3>Šance naskočit!</h3><p>Někdo se právě odhlásil ze zápasu a díky tomu se v poli uvolnilo místo. Kdo z náhradníků dřív přijde a potvrdí účast, ten hraje.</p><a href="${baseUrl}/dashboard" style="background:#10b981;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Jít rychle na palubovku</a>`
              });
          }
      }
      
      const gPlaying = responses.filter(r => r.status === 'playing_goalie').length;
      if (gPlaying < 2) {
          const reserveUids = responses.filter(r => r.status === 'reserve_goalie').map(r => r.uid);
          const reserveEmails = db.users
            .filter(u => reserveUids.includes(u.uid) && u.emailNotifications !== false)
            .map(u => u.email);
          
          if (reserveEmails.length > 0) {
              await sendEmail({
                  to: reserveEmails,
                  subject: '🔥 Uvolnilo se místo v BRÁNĚ',
                  html: `<h3>Šance na chytání!</h3><p>Jeden z gólmanů odpadl a uvolnilo se místo. Skoč po tom jako tygr!</p><a href="${baseUrl}/dashboard" style="background:#10b981;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Jít rychle na palubovku</a>`
              });
          }
      }
  }

  await saveDb(db);
  revalidatePath('/dashboard');
}

export async function addGuestToMatch(matchId: string, guestName: string, isGoalie: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');

  const db = await getDb();
  const matchIndex = db.matches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) throw new Error('Match not found');

  const match = db.matches[matchIndex];
  
  // Vytvoříme unikátní ID hosta: guest_čas_jméno (bez diakritiky/mezer pro bezpečí)
  const safeName = guestName.replace(/[^a-zA-Z0-9ěščřžýáíéůúÚŮĚŠČŘŽÝÁÍÉ]/g, '_');
  const guestUid = `guest_${Date.now()}_${safeName}`;
  const statusText = isGoalie ? 'going_goalie' : 'going_player';

  let responses = match.responses || [];

  if (match.lockPhase === 'phase1_open') {
      responses.push({
        uid: guestUid,
        status: statusText,
        timestamp: new Date().toISOString()
      });
  } else {
      const MAX_PLAYERS = 12;
      const MAX_GOALIES = 2;
      const currentlyPlayingPlayers = responses.filter(r => r.status === 'playing_player').length;
      const currentlyPlayingGoalies = responses.filter(r => r.status === 'playing_goalie').length;

      let finalStatus = statusText;
      
      if (statusText === 'going_player') {
          finalStatus = currentlyPlayingPlayers < MAX_PLAYERS ? 'playing_player' : 'reserve_player';
      } else if (statusText === 'going_goalie') {
          finalStatus = currentlyPlayingGoalies < MAX_GOALIES ? 'playing_goalie' : 'reserve_goalie';
      }

      responses.push({
        uid: guestUid,
        status: finalStatus as any,
        timestamp: new Date().toISOString()
      });
  }

  match.responses = responses;
  await saveDb(db);
  revalidatePath('/dashboard');
}

export async function adminRemoveUserFromMatch(matchId: string, uid: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');

  const db = await getDb();
  const matchIndex = db.matches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) throw new Error('Match not found');

  const match = db.matches[matchIndex];
  const responseIndex = match.responses.findIndex(r => r.uid === uid);
  
  if (responseIndex !== -1) {
     match.responses.splice(responseIndex, 1);
  }

  await saveDb(db);
  revalidatePath('/dashboard');
}
