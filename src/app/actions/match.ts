'use server';

import { getDb, saveDb } from '@/lib/db';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

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

  // Fake Stub trigger for mail (kdykoliv se někdo odhlásí v uzamčený fázi a uvolní kapacitu)
  if (match.lockPhase === 'phase2_locked' && statusText === 'not_going') {
      const pPlaying = responses.filter(r => r.status === 'playing_player').length;
      if (pPlaying < 12) {
          console.log(`[BREVO STUB] Uvolnilo se místo pro HRÁČE! Odesílám mail všem 'reserve_player' a nepřihlášeným u zápasu ${matchId}.`);
      }
      const gPlaying = responses.filter(r => r.status === 'playing_goalie').length;
      if (gPlaying < 2) {
          console.log(`[BREVO STUB] Uvolnilo se místo pro GÓLMANA! Odesílám mail všem 'reserve_goalie' a nepřihlášeným u zápasu ${matchId}.`);
      }
  }

  await saveDb(db);
  revalidatePath('/dashboard');
}

  // ... už zapsáno nahoře
