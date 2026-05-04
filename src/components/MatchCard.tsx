'use client';

import { useTransition, useState, useEffect } from 'react';
import { User, MatchResponse } from '@/lib/db';
import { respondToMatch } from '@/app/actions/match';
import { Clock, Check, X, HelpCircle, AlertCircle, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: {
    id: string;
    date: string;
    status: 'open' | 'closed' | 'cancelled';
    deadline: string;
    lockPhase: 'phase1_open' | 'phase2_locked';
    capacity: number;
    responses: MatchResponse[];
    isLocked: boolean;
  };
  currentUser: User;
  allUsers?: User[];
  whatsappLink?: string;
  matchState?: 'upcoming' | 'ongoing' | 'ended';
}

export function MatchCard({ match, currentUser, allUsers = [], whatsappLink, matchState = 'upcoming' }: MatchCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showPlayers, setShowPlayers] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);
  const [cancelCopied, setCancelCopied] = useState(false);
  const [rosterCopied, setRosterCopied] = useState(false);

  const generateRosterText = () => {
    const playersList = (isPhase1 ? goingPlayersP1.slice(0, 12) : playingPlayersP2).map((r, i) => {
      const isGuest = r.uid?.startsWith('guest_');
      const u = allUsers.find(u => u.uid === r.uid);
      const name = u?.name || (isGuest ? r.uid.split('_').slice(2).join(' ') + ' (Host)' : r.uid);
      return `${i + 1}. ${name}`;
    }).join('\n') || 'Zatím nikdo.';

    const goaliesList = (isPhase1 ? goingGoaliesP1.slice(0, 2) : playingGoaliesP2).map((r, i) => {
      const isGuest = r.uid?.startsWith('guest_');
      const u = allUsers.find(u => u.uid === r.uid);
      const name = u?.name || (isGuest ? r.uid.split('_').slice(2).join(' ') + ' (Host)' : r.uid);
      return `${i + 1}. ${name}`;
    }).join('\n') || 'Zatím nikdo.';

    const reservePlayers = isPhase1 ? goingPlayersP1.slice(12) : reservePlayersP2;
    const reserveGoalies = isPhase1 ? goingGoaliesP1.slice(2) : reserveGoaliesP2;

    let reserveText = '';
    if (reservePlayers.length > 0 || reserveGoalies.length > 0) {
      reserveText = '\n\n🟡 Pod čarou:\n' + [...reservePlayers, ...reserveGoalies].map((r, i) => {
        const isGuest = r.uid?.startsWith('guest_');
        const u = allUsers.find(u => u.uid === r.uid);
        const name = u?.name || (isGuest ? r.uid.split('_').slice(2).join(' ') + ' (Host)' : r.uid);
        const pos = r.status.includes('goalie') ? ' (G)' : '';
        return `${i + 1}. ${name}${pos}`;
      }).join('\n');
    }

    return `🏑 Sestava pro zápas ${new Date(match.date).toLocaleDateString('cs-CZ')}\n\n🟢 Hráči v poli:\n${playersList}\n\n🥅 Gólmani:\n${goaliesList}${reserveText}`;
  };

  const handleShareRoster = () => {
    const text = generateRosterText();
    navigator.clipboard.writeText(text);
    setRosterCopied(true);
    setTimeout(() => setRosterCopied(false), 2000);
    
    let url = '';
    if (whatsappLink && whatsappLink.length > 5) {
      url = whatsappLink;
    } else {
      url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  const handleRespond = (status: 'going_player' | 'going_goalie' | 'not_going' | 'maybe') => {
    const wasHoldingSpot = myStatus && (myStatus.startsWith('going') || myStatus.startsWith('playing') || myStatus.startsWith('reserve'));
    const isLateCancel = match.lockPhase === 'phase2_locked' && status === 'not_going' && wasHoldingSpot;

    startTransition(() => {
      respondToMatch(match.id, status).then(() => {
        if (isLateCancel) {
          setShowWhatsAppPrompt(true);
        }
      });
    });
  };

  const responses = match.responses || [];
  const myResponse = responses.find(r => r.uid === currentUser.uid);
  const myStatus = myResponse?.status;

  const isPhase1 = match.lockPhase === 'phase1_open';
  const isClosedAdmin = match.status === 'closed';
  const isCancelledAdmin = match.status === 'cancelled';
  
  const userPos = currentUser.position || 'player';

  const maybe = responses.filter(r => r.status === 'maybe');
  const notGoing = responses.filter(r => r.status === 'not_going');

  // Sorted arrays for Phase 1 simulation 
  const sortStrategy = (a: MatchResponse, b: MatchResponse) => {
    const isGuestA = a.uid?.startsWith('guest_');
    const isGuestB = b.uid?.startsWith('guest_');
    const uA = allUsers.find(u => u.uid === a.uid);
    const uB = allUsers.find(u => u.uid === b.uid);
    const subA = (uA?.isSubscriber || isGuestA) ? 1 : 0;
    const subB = (uB?.isSubscriber || isGuestB) ? 1 : 0;
    if (subA !== subB) return subB - subA;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  };

  const goingPlayersP1 = responses.filter(r => r.status === 'going_player').sort(sortStrategy);
  const goingGoaliesP1 = responses.filter(r => r.status === 'going_goalie').sort(sortStrategy);
  
  const playingPlayersP2 = responses.filter(r => r.status === 'playing_player');
  const playingGoaliesP2 = responses.filter(r => r.status === 'playing_goalie');
  const reservePlayersP2 = responses.filter(r => r.status === 'reserve_player');
  const reserveGoaliesP2 = responses.filter(r => r.status === 'reserve_goalie');

  const pCount = isPhase1 ? goingPlayersP1.length : playingPlayersP2.length;
  const gCount = isPhase1 ? goingGoaliesP1.length : playingGoaliesP2.length;
  const rPlayersCount = reservePlayersP2.length;
  const rGoaliesCount = reserveGoaliesP2.length;

  // Jsou uzamčené kapacity plné? Logika je nyní spíš pro Fázi 3 (FFF).
  const isFullPlayersP2 = playingPlayersP2.length >= 12;
  const isFullGoaliesP2 = playingGoaliesP2.length >= 2;

  const matchDate = new Date(match.date);
  const deadlineDate = new Date(match.deadline);
  const isPastDeadline = now ? now.getTime() >= deadlineDate.getTime() : false;
  const visuallyEvaluating = isPhase1 && isPastDeadline;

  // Vyhodnocení toho, jestli se mi tlacitka vubec daji mackat
  const canClickPlayer = !visuallyEvaluating && matchState === 'upcoming' && !isCancelledAdmin && !isClosedAdmin && (isPhase1 || (!isFullPlayersP2 || myStatus === 'playing_player'));
  const canClickGoalie = !visuallyEvaluating && matchState === 'upcoming' && !isCancelledAdmin && !isClosedAdmin && (isPhase1 || (!isFullGoaliesP2 || myStatus === 'playing_goalie'));
  
  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group w-full">

      
      {myStatus?.startsWith('going') || myStatus?.startsWith('playing') ? <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" /> : null}
      {myStatus?.startsWith('reserve') ? <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" /> : null}
      {myStatus === 'not_going' ? <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" /> : null}

      <div className="flex justify-between items-start mb-5 relative z-10 w-full">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            {matchDate.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <div className="flex items-center text-zinc-400 text-sm gap-1.5">
            <Clock size={14} />
            <span>{matchDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        
        {isCancelledAdmin ? (
          <span className="bg-red-500/10 text-red-500 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/30 whitespace-nowrap text-right flex-shrink-0">
            ZRUŠENO ❌
          </span>
        ) : isClosedAdmin ? (
          <span className="bg-red-500/10 text-red-500 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border border-red-500/20 whitespace-nowrap text-right flex-shrink-0">
            Uzavřeno
          </span>
        ) : matchState === 'ended' ? (
          <span className="bg-zinc-800 text-zinc-500 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-700 whitespace-nowrap text-right flex-shrink-0">
            ZÁPAS JIŽ PROBĚHL
          </span>
        ) : matchState === 'ongoing' ? (
           <span className="bg-amber-500 text-zinc-950 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-amber-400 whitespace-nowrap text-right flex-shrink-0 animate-pulse">
             PRÁVĚ PROBÍHÁ 🟢
           </span>
        ) : visuallyEvaluating ? (
          <div className="text-right flex-shrink-0">
             <span className="bg-amber-500/10 text-amber-500 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/20 whitespace-nowrap mb-1 inline-block animate-pulse">
               ⏳ Vyhodnocuji...
             </span>
             <p className="text-[10px] text-zinc-500 mt-1">
               Prosím vyčkejte na rozřazení sestavy.
             </p>
          </div>
        ) : isPhase1 ? (
          <div className="text-right flex-shrink-0">
             <span className="bg-emerald-500/10 text-emerald-500 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap mb-1 inline-block">
               Otevřeno všem
             </span>
             <p className="text-[10px] text-zinc-500 mt-1">
               Uzávěrka: {deadlineDate.toLocaleDateString('cs-CZ')} {deadlineDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>
        ) : (
          <div className="text-right flex-shrink-0">
            <span className="bg-amber-500/20 text-amber-500 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-amber-500/50 whitespace-nowrap shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              PO UZÁVĚRCE (Útok na místa)
            </span>
          </div>
        )}
      </div>

      <div className="space-y-5 relative z-10">
        
        <div className="space-y-4">
          {/* Hráči do pole (Vždy chceme nakreslit ten bar, ale sítě fungují jinak ve Phase1) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium tracking-wide uppercase">Hráči v poli</span>
              <div className="flex items-center gap-2">
                {pCount < 10 && <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold animate-pulse">Je nás málo</span>}
                <span className={cn("font-bold text-xs", pCount < 10 ? "text-red-500" : pCount < 12 ? "text-amber-500" : "text-emerald-500")}>
                  {isPhase1 ? `${pCount} Přihlášeno (Limit 12)` : `${pCount} / 12`}
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden p-0.5">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  pCount < 10 ? "bg-red-500" : pCount < 12 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${Math.min((pCount / 12) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Gólmani */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium tracking-wide uppercase">Gólmani</span>
              <div className="flex items-center gap-2">
                 {gCount < 2 && <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold animate-pulse">Chybí gólman!</span>}
                 <span className={cn("font-bold text-xs", gCount < 2 ? "text-red-500" : "text-emerald-500")}>
                   {isPhase1 ? `${gCount} Přihlášeno (Limit 2)` : `${gCount} / 2`}
                 </span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden p-0.5">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  gCount < 2 ? "bg-red-500" : "bg-emerald-500"
                )}
                style={{ width: `${Math.min((gCount / 2) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-zinc-500 pt-1 px-1">
             <div className="flex gap-3">
               <span><strong className="text-zinc-300">{maybe.length}</strong> Možná</span>
               <span><strong className="text-zinc-300">{notGoing.length}</strong> Nejdu</span>
             </div>
             {(!isPhase1 && (rPlayersCount > 0 || rGoaliesCount > 0)) && (
               <span className="text-amber-500 font-semibold">{rPlayersCount + rGoaliesCount} Pod čarou</span>
             )}
          </div>
        </div>

        {/* Banner o volném místě po uzávěrce */}
        {(!isPhase1 && !isClosedAdmin && (!isFullPlayersP2 || !isFullGoaliesP2)) && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] text-center p-2.5 rounded-xl mb-3 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
             <strong>Rychlá záchrana!</strong> Uvolnila se místa po uzávěrce. Nyní funguje systém <em>„Kdo dřív přijde, ten hraje“</em>!
          </div>
        )}

        {/* Osobní ukazatel stavu */}
        {(() => {
           let indicatorState: 'confirmed' | 'reserve' | null = null;
           let reservePosition: number = 0;
         
           if (myStatus === 'playing_player' || myStatus === 'playing_goalie') {
              indicatorState = 'confirmed';
           } else if (myStatus === 'reserve_player') {
              indicatorState = 'reserve';
              reservePosition = reservePlayersP2.findIndex(r => r.uid === myResponse?.uid) + 1;
           } else if (myStatus === 'reserve_goalie') {
              indicatorState = 'reserve';
              reservePosition = reserveGoaliesP2.findIndex(r => r.uid === myResponse?.uid) + 1;
           } else if (myStatus === 'going_player') {
              const idx = goingPlayersP1.findIndex(r => r.uid === myResponse?.uid);
              if (idx !== -1 && idx < 12) {
                  indicatorState = 'confirmed';
              } else if (idx >= 12) {
                  indicatorState = 'reserve';
                  reservePosition = idx - 11;
              }
           } else if (myStatus === 'going_goalie') {
              const idx = goingGoaliesP1.findIndex(r => r.uid === myResponse?.uid);
              if (idx !== -1 && idx < 2) {
                  indicatorState = 'confirmed';
              } else if (idx >= 2) {
                  indicatorState = 'reserve';
                  reservePosition = idx - 1;
              }
           }

           if (indicatorState === 'confirmed') {
              return (
                 <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs text-center p-2.5 rounded-xl mb-3 flex items-center justify-center gap-2">
                    <Check size={16} className="fixed-stroke-[3]" />
                    <strong>Máš garantované místo v sestavě!</strong>
                 </div>
              );
           }
           
           if (indicatorState === 'reserve') {
              return (
                 <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs text-center p-2.5 rounded-xl mb-3 flex items-center justify-center gap-2 animate-pulse">
                    <AlertCircle size={16} />
                    <strong>Jsi pod čarou jako {reservePosition}. náhradník.</strong>
                 </div>
              );
           }
           
           return null;
        })()}

        {/* Tlačítka */}
        {(() => {
          const isMatchLocked = isClosedAdmin || isCancelledAdmin || matchState !== 'upcoming';
          
          if (isMatchLocked) {
             // ZAMČENÝ STAV
             if (!myStatus) {
                return (
                  <div className="pt-2 opacity-50">
                    <div className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-xs text-zinc-500 font-semibold py-4 text-center flex items-center justify-center gap-2 cursor-not-allowed">
                       <Clock size={16} /> Zápas uzamčen (Bez vyjádření)
                    </div>
                  </div>
                );
             } else {
                return (
                  <div className="pt-2 opacity-60">
                    <div className={cn(
                      "w-full border rounded-xl text-xs font-semibold py-4 text-center flex flex-col items-center justify-center gap-1 cursor-not-allowed",
                      myStatus?.startsWith('going') || myStatus?.startsWith('playing') ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      myStatus?.startsWith('reserve') ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      myStatus === 'not_going' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-zinc-800 text-zinc-400 border-zinc-700"
                    )}>
                       <span className="flex items-center gap-2">
                         🔒 Tvá volba: 
                         {myStatus === 'going_player' || myStatus === 'playing_player' ? 'Hraju (Pole)' : 
                          myStatus === 'going_goalie' || myStatus === 'playing_goalie' ? 'Hraju (Brána)' : 
                          myStatus === 'reserve_player' || myStatus === 'reserve_goalie' ? 'Pod čarou' : 
                          myStatus === 'not_going' ? 'Nejdu' : 'Možná'}
                       </span>
                    </div>
                  </div>
                );
             }
          }

          // AKTIVNÍ STAV (S TLAČÍTKY)
          return (
            <div className="pt-2">
              {!myStatus && (
                <div className="text-center mb-2 animate-pulse">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">👉 Čekáme na tvé vyjádření</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                
                <div className="flex flex-col gap-2 h-full">
                  {/* Tlačítko HRÁČ */}
                  {(userPos === 'player' || userPos === 'versatile') && (
                    <button 
                      onClick={() => handleRespond('going_player')}
                      disabled={isPending || !canClickPlayer}
                      className={cn(
                        "relative overflow-hidden flex-1 rounded-xl text-[10px] sm:text-xs font-semibold transition-all flex flex-col justify-center items-center gap-1 border px-1 py-2",
                        (myStatus === 'going_player' || myStatus === 'playing_player' || myStatus === 'reserve_player') 
                          ? myStatus === 'reserve_player'
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            : "bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-emerald-500/20 border-transparent"
                          : !myStatus 
                            ? "bg-emerald-500/5 text-emerald-400/80 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 animate-pulse" 
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-emerald-400 border-zinc-700/50",
                        (!canClickPlayer && myStatus !== 'going_player' && myStatus !== 'playing_player' && myStatus !== 'reserve_player') && "opacity-50 cursor-not-allowed hover:bg-zinc-800 hover:text-zinc-400 animate-none"
                      )}
                    >
                       <span className="flex items-center gap-1">
                         {myStatus === 'reserve_player' ? <AlertCircle size={14} /> : <Check size={14} className={myStatus === 'playing_player' || myStatus === 'going_player' ? 'stroke-[3]' : ''} />}
                         {myStatus === 'reserve_player' ? 'Pod čarou' : 'Jdu hrát'}
                       </span>
                    </button>
                  )}

                  {/* Tlačítko GÓLMAN */}
                  {(userPos === 'goalie' || userPos === 'versatile') && (
                     <button 
                       onClick={() => handleRespond('going_goalie')}
                       disabled={isPending || !canClickGoalie}
                       className={cn(
                         "relative overflow-hidden flex-1 rounded-xl text-[10px] sm:text-xs font-semibold transition-all flex flex-col justify-center items-center gap-1 border px-1 py-2",
                         (myStatus === 'going_goalie' || myStatus === 'playing_goalie' || myStatus === 'reserve_goalie') 
                           ? myStatus === 'reserve_goalie'
                             ? "bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                             : "bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-emerald-500/20 border-transparent"
                           : !myStatus 
                             ? "bg-emerald-500/5 text-emerald-400/80 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 animate-pulse" 
                             : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-emerald-400 border-zinc-700/50",
                         (!canClickGoalie && myStatus !== 'going_goalie' && myStatus !== 'playing_goalie' && myStatus !== 'reserve_goalie') && "opacity-50 cursor-not-allowed hover:bg-zinc-800 hover:text-zinc-400 animate-none"
                       )}
                     >
                        <span className="flex items-center gap-1">
                          {myStatus === 'reserve_goalie' ? <AlertCircle size={14} /> : <Check size={14} className={myStatus === 'playing_goalie' || myStatus === 'going_goalie' ? 'stroke-[3]' : ''} />}
                          {myStatus === 'reserve_goalie' ? 'Pod čarou' : 'Jdu (G)'}
                        </span>
                     </button>
                  )}
                </div>

                 {/* Možná */}
                 <button 
                  onClick={() => handleRespond('maybe')}
                  disabled={isPending}
                  className={cn(
                    "rounded-xl text-[10px] sm:text-sm font-semibold transition-all flex flex-col justify-center items-center gap-1 border h-full min-h-[64px]",
                    myStatus === 'maybe' 
                      ? "bg-zinc-700/80 text-white border-zinc-500 shadow-inner"
                      : !myStatus 
                        ? "bg-zinc-800/30 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300 animate-pulse"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 border-zinc-700/50"
                  )}
                >
                   <HelpCircle size={18} />
                   <span>Možná</span>
                </button>

                 {/* Nejdu */}
                 <button 
                  onClick={() => handleRespond('not_going')}
                  disabled={isPending}
                  className={cn(
                    "rounded-xl text-[10px] sm:text-sm font-semibold transition-all flex flex-col justify-center items-center gap-1 border h-full min-h-[64px]",
                    myStatus === 'not_going' 
                      ? "bg-red-500/10 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-opacity-20"
                      : !myStatus 
                        ? "bg-red-500/5 text-red-400/80 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 animate-pulse"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-red-400 border-zinc-700/50"
                  )}
                >
                   <X size={18} className={myStatus === 'not_going' ? 'stroke-[3]' : ''} />
                   <span>Nejdu</span>
                </button>

              </div>
            </div>
          );
        })()}
        
        <div className="col-span-2 md:col-span-1 border-t border-zinc-800/50 md:border-none pt-2 md:pt-0" />

        {myStatus?.startsWith('reserve') && (
           <p className="text-xs text-amber-500/80 text-center px-2">Jsi zapsán pod čarou. Pokud se uvolní místo, tlačítko ožije zeleně pro všechny (Kdo dřív přijde).</p>
        )}

        {currentUser.role === 'admin' && matchState === 'upcoming' && !isCancelledAdmin && !isClosedAdmin && (
          <div className="pt-2 border-t border-zinc-800/50 mt-2 flex flex-col sm:flex-row gap-2 justify-center items-center">
            <button
               onClick={() => {
                 const name = window.prompt("Zadej jméno Hosta (např. Kamilův bratr):");
                 if (!name) return;
                 const isGoalie = window.confirm("Jde do BRÁNY? (OK = Brána, Zrušit = Pole)");
                 startTransition(() => {
                    import('@/app/actions/match').then(m => m.addGuestToMatch(match.id, name, isGoalie));
                 });
               }}
               disabled={isPending}
               className="text-[10px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20"
            >
               + Přidat Hosta
            </button>
            <select
               className="text-[10px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20 outline-none cursor-pointer appearance-none text-center"
               value=""
               onChange={(e) => {
                  if (!e.target.value) return;
                  const uid = e.target.value;
                  const uName = allUsers.find(u => u.uid === uid)?.name;
                  const isGoalie = window.confirm(`Jde ${uName} do BRÁNY?\n\n(OK = Brána, Zrušit = Pole)`);
                  startTransition(() => {
                     import('@/app/actions/match').then(m => m.adminAddUserToMatch(match.id, uid, isGoalie));
                  });
               }}
               disabled={isPending}
               style={{ textAlignLast: 'center' }}
            >
               <option value="" disabled className="bg-zinc-900 text-zinc-400">+ Zapsat hráče ▾</option>
               {allUsers
                 .filter(u => !match.responses.some(r => r.uid === u.uid))
                 .sort((a, b) => a.name.localeCompare(b.name))
                 .map(u => (
                   <option key={u.uid} value={u.uid} className="bg-zinc-900 text-emerald-400">{u.name}</option>
               ))}
            </select>
          </div>
        )}

        {/* Tlačítko rozbalení seznamu hráčů */}
        <div className="pt-2 border-t border-zinc-800/50 mt-2">
           <div className="flex items-center justify-center gap-6">
             <button 
               onClick={() => setShowPlayers(!showPlayers)}
               className="py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-1 transition-colors"
             >
               {showPlayers ? 'Skrýt sestavu' : 'Zobrazit sestavu'}
               {showPlayers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
             </button>
             
             {currentUser.role === 'admin' && !isPhase1 && (
               <button 
                 onClick={handleShareRoster}
                 className="text-[10px] sm:text-xs font-semibold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#25D366]/20 transition-all flex-shrink-0"
               >
                 <Share2 size={12} />
                 {rosterCopied ? 'Zkopírováno' : 'Odeslat na WhatsApp'}
               </button>
             )}
           </div>
           
           {showPlayers && (
             <div className="mt-3 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200 bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800/50">
                
                {/* ---------- PLAYERS SECTION ---------- */}
                <div>
                  <h4 className="text-xs font-bold text-emerald-500 mb-2 uppercase tracking-wider">
                    Hráči v poli ({isPhase1 ? Math.min(goingPlayersP1.length, 12) : playingPlayersP2.length}/12)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(isPhase1 ? goingPlayersP1.slice(0, 12) : playingPlayersP2).map((r) => {
                       const isGuest = r.uid?.startsWith('guest_');
                       const u = allUsers.find(u => u.uid === r.uid);
                       const name = u?.name || (isGuest ? r.uid.split('_').slice(2).join(' ') + ' (Host)' : r.uid);
                       return (
                         <span key={r.uid} className="text-xs px-2 py-1 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 inline-flex items-center gap-1">
                           {name} {u?.isSubscriber && '⭐'}
                           {currentUser.role === 'admin' && matchState === 'upcoming' && !isCancelledAdmin && !isClosedAdmin && (
                              <button disabled={isPending} onClick={() => startTransition(() => { import('@/app/actions/match').then(m => m.adminRemoveUserFromMatch(match.id, r.uid)) })} className="text-red-500 ml-1 hover:text-red-400">
                                <X size={12} strokeWidth={3} />
                              </button>
                           )}
                         </span>
                       )
                    })}
                    {(isPhase1 ? goingPlayersP1.slice(0, 12) : playingPlayersP2).length === 0 && <span className="text-zinc-600 text-xs italic">Zatím nikdo.</span>}
                  </div>
                </div>

                {/* ---------- GOALIES SECTION ---------- */}
                <div>
                  <h4 className="text-xs font-bold text-emerald-500 mb-2 uppercase tracking-wider">
                    Brankáři ({isPhase1 ? Math.min(goingGoaliesP1.length, 2) : playingGoaliesP2.length}/2)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(isPhase1 ? goingGoaliesP1.slice(0, 2) : playingGoaliesP2).map((r) => {
                       const isGuest = r.uid?.startsWith('guest_');
                       const u = allUsers.find(u => u.uid === r.uid);
                       const name = u?.name || (isGuest ? r.uid.split('_').slice(2).join(' ') + ' (Host)' : r.uid);
                       return (
                         <span key={r.uid} className="text-xs px-2 py-1 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 inline-flex items-center gap-1">
                           {name} {u?.isSubscriber && '⭐'}
                           {currentUser.role === 'admin' && matchState === 'upcoming' && !isCancelledAdmin && !isClosedAdmin && (
                              <button disabled={isPending} onClick={() => startTransition(() => { import('@/app/actions/match').then(m => m.adminRemoveUserFromMatch(match.id, r.uid)) })} className="text-red-500 ml-1 hover:text-red-400">
                                <X size={12} strokeWidth={3} />
                              </button>
                           )}
                         </span>
                       )
                    })}
                    {(isPhase1 ? goingGoaliesP1.slice(0, 2) : playingGoaliesP2).length === 0 && <span className="text-zinc-600 text-xs italic">Zatím nikdo.</span>}
                  </div>
                </div>

                {/* ---------- RESERVE SECTION ---------- */}
                {((isPhase1 ? goingPlayersP1.slice(12) : reservePlayersP2).length > 0 || (isPhase1 ? goingGoaliesP1.slice(2) : reserveGoaliesP2).length > 0) && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-500 mb-2 uppercase tracking-wider">Pod čarou (Náhradníci)</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(isPhase1 ? goingPlayersP1.slice(12) : reservePlayersP2).map(r => {
                         const isGuest = r.uid?.startsWith('guest_');
                         const u = allUsers.find(u => u.uid === r.uid);
                         const name = u?.name || (isGuest ? r.uid.split('_').slice(2).join(' ') + ' (Host)' : r.uid);
                         return (
                           <span key={r.uid} className="bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded-md border border-amber-500/20 inline-flex items-center gap-1">
                              {name} {u?.isSubscriber && '⭐'} (Pole)
                              {currentUser.role === 'admin' && matchState === 'upcoming' && !isCancelledAdmin && !isClosedAdmin && (
                                <button disabled={isPending} onClick={() => startTransition(() => { import('@/app/actions/match').then(m => m.adminRemoveUserFromMatch(match.id, r.uid)) })} className="text-red-500 ml-1 hover:text-red-400"><X size={12} strokeWidth={3} /></button>
                              )}
                           </span>
                         )
                      })}
                      {(isPhase1 ? goingGoaliesP1.slice(2) : reserveGoaliesP2).map(r => {
                         const isGuest = r.uid?.startsWith('guest_');
                         const u = allUsers.find(u => u.uid === r.uid);
                         const name = u?.name || (isGuest ? r.uid.split('_').slice(2).join(' ') + ' (Host)' : r.uid);
                         return (
                           <span key={r.uid} className="bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded-md border border-amber-500/20 inline-flex items-center gap-1">
                              {name} {u?.isSubscriber && '⭐'} (Brána)
                              {currentUser.role === 'admin' && matchState === 'upcoming' && !isCancelledAdmin && !isClosedAdmin && (
                                <button disabled={isPending} onClick={() => startTransition(() => { import('@/app/actions/match').then(m => m.adminRemoveUserFromMatch(match.id, r.uid)) })} className="text-red-500 ml-1 hover:text-red-400"><X size={12} strokeWidth={3} /></button>
                              )}
                           </span>
                         )
                      })}
                    </div>
                  </div>
                )}

                {/* Možná */}
                {maybe.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Možná ({maybe.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {maybe.map(r => {
                         const name = allUsers.find(u => u.uid === r.uid)?.name || r.uid;
                         return <span key={r.uid} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md border border-zinc-700">{name}</span>
                      })}
                    </div>
                  </div>
                )}

                {/* Nejdou */}
                {notGoing.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">Nejdou ({notGoing.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {notGoing.map(r => {
                         const name = allUsers.find(u => u.uid === r.uid)?.name || r.uid;
                         return <span key={r.uid} className="bg-red-500/5 text-red-400/80 text-xs px-2 py-1 rounded-md border border-red-500/10 line-through">{name}</span>
                      })}
                    </div>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>

    {showWhatsAppPrompt && (() => {
        const cancelTextBody = `🚨 Sorry lidi, musím florbal (${matchDate.toLocaleDateString('cs-CZ')}) odpískat. Uvolnilo se tím pádem MÍSTO! 🏃‍♂️ Kdo se první přihlásí v appce, hraje. 🏑\n\nHlašte se v apce: https://pondelniflorbalek.cz`;
        
        const handleCopyAndGoCancel = () => {
          navigator.clipboard.writeText(cancelTextBody);
          setCancelCopied(true);
          let url = '';
          if (whatsappLink && whatsappLink.length > 5) {
            url = whatsappLink;
          } else {
            url = `whatsapp://send?text=${encodeURIComponent(cancelTextBody)}`;
          }
          window.open(url, '_blank');
          setTimeout(() => setShowWhatsAppPrompt(false), 2000);
        };

        return (
          <div className="fixed inset-0 min-h-[100dvh] bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" style={{ zIndex: 99999 }}>
            <div className="bg-zinc-900 border border-amber-500/20 p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center shadow-[0_0_100px_black] relative flex flex-col pt-6">
              <div className="flex justify-center mb-5 text-amber-500">
                 <Share2 size={36} />
              </div>
              
              <h3 className="text-white font-bold text-lg mb-2">Chceš to hodit do skupiny?</h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                Právě ses odhlásil pozdě a propadlo ti místo. Pošli to hned na WhatsApp, ať tu díru ještě někdo zvládne zalepit (Text se zkopíruje, jen dej <b>Vložit</b>).
              </p>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-700 text-xs italic text-zinc-300 font-mono whitespace-pre-wrap text-left mb-6">
                 {cancelTextBody}
              </div>
              
              <div className="flex items-center justify-between gap-2 border-t border-zinc-800 pt-3">
                 <button 
                  onClick={() => setShowWhatsAppPrompt(false)} 
                  className="px-4 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex-[0.5]"
                 >
                   Zrušit
                 </button>
                 <button 
                  onClick={handleCopyAndGoCancel} 
                  className="px-4 py-3 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all flex-1 flex items-center justify-center gap-2"
                 >
                   {!cancelCopied ? 'Zkopírovat a přesměrovat' : <><Check size={18} /> Zkopírováno!</>}
                 </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
