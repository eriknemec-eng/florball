import { getCurrentUser } from '@/app/actions/auth';
import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MatchCard } from '@/components/MatchCard';
import { History, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const db = await getDb();
  
  const now = Date.now();
  const rawMatches = db.matches.map(m => {
    const isLocked = m.lockPhase === 'phase2_locked' || m.status === 'closed';
    const startTimeMs = new Date(m.date).getTime();
    const durationMs = (m.durationMinutes || 90) * 60 * 1000;
    const endTimeMs = startTimeMs + durationMs;
    
    let matchState: 'upcoming' | 'ongoing' | 'ended' = 'upcoming';
    if (now >= endTimeMs) matchState = 'ended';
    else if (now >= startTimeMs && now < endTimeMs) matchState = 'ongoing';

    return { ...m, isLocked, matchState, endTimeMs };
  });
  
  const endedMatches = rawMatches
    .filter(m => m.matchState === 'ended')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // descending

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             <History className="text-zinc-500" /> Historie odehraných zápasů
          </h2>
          <p className="text-zinc-400">Přehled všech ukončených a proběhlých událostí.</p>
        </div>
      </div>

      <div className="space-y-6 pb-2">
        {endedMatches.map(match => (
          <MatchCard key={match.id} match={match} currentUser={user} allUsers={db.users} matchState={match.matchState} />
        ))}
        
        {endedMatches.length === 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <p className="text-zinc-500 font-medium">Historie je zatím prázdná.</p>
            <p className="text-zinc-600 text-sm mt-1">Nebyly odehrány žádné zápasy.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
