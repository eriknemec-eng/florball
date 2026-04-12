import { getCurrentUser } from '@/app/actions/auth';
import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MatchCard } from '@/components/MatchCard';
import { MobileNewsBanner } from '@/components/MobileNewsBanner';
import { MessageCircle, Info, Pin, LayoutGrid } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const db = await getDb();
  
  const cutoffTime = Date.now() - 4 * 60 * 60 * 1000; // 4 hours after match date
  const rawMatches = db.matches.map(m => {
    const isLocked = m.lockPhase === 'phase2_locked' || m.status === 'closed';
    return { ...m, isLocked };
  });
  
  const matches = rawMatches
    .filter(m => new Date(m.date).getTime() > cutoffTime)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pinnedNews = db.news.filter(n => n.isPinned);
  const regularNews = db.news.filter(n => !n.isPinned);

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Levý hlavní sloupec (Zápasy) */}
      <div className="flex-1 space-y-8">
        {/* Vítejte sekce */}
        <section className="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Ahoj, {user.name.split(' ')[0]}!</h2>
            <p className="text-zinc-400">Tady je tvůj přehled událostí.</p>
          </div>
          
          {db.settings?.whatsappLink && (
            <a 
              href={db.settings.whatsappLink.trim()}
              target="_blank"
              style={{ backgroundColor: '#25D366', color: 'white' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all shrink-0 shadow-sm hover:brightness-110"
            >
              <MessageCircle size={16} />
              WhatsApp Skupina
            </a>
          )}
        </section>

        {/* Mobile News Banner (Varianta A) - Zobrazí pouze 1 nejnovější Nástěnku na mobilech + Modal */}
        <MobileNewsBanner allNews={db.news} />

        {/* Finance Alert Box */}
        {(user.isSubscriber && !user.hasPaid) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse-slow">
            <div>
              <h3 className="text-red-500 font-bold mb-1">Nová sezóna / Nezlacené příspěvky!</h3>
              <p className="text-red-500/80 text-sm">Nezapomeň prosím včas uhradit aktuální předplatné. Ještě to u tebe nemáme odškrtnuté.</p>
            </div>
            <a href="/qr" className="shrink-0 bg-red-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-red-600 transition-colors">
               Zaplatit QR ({db.settings?.seasonFee || 500} Kč)
            </a>
          </div>
        )}

        {(!user.isSubscriber && user.debt && user.debt > 0) ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse-slow">
            <div>
              <h3 className="text-amber-500 font-bold mb-1">Visí ti u nás nedoplatky za zápasy</h3>
              <p className="text-amber-500/80 text-sm">Aktuální nezaplacená částka je <strong className="text-amber-400">{user.debt} Kč</strong>. Prosím pošlí to QR kódem, případně to pořeš osobně na hřišti.</p>
            </div>
            <a href="/qr" className="shrink-0 bg-amber-500 text-zinc-950 font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-amber-400 transition-colors">
               Zaplatit QR ({user.debt} Kč)
            </a>
          </div>
        ) : null}

        {/* Zápasy */}
        <section className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <LayoutGrid size={16} /> Program zápasů
            </h3>
          </div>
          <div className="space-y-6 pb-2">
            {matches.map(match => (
              <MatchCard key={match.id} match={match} currentUser={user} allUsers={db.users} whatsappLink={db.settings?.whatsappLink} />
            ))}
            {matches.length === 0 && (
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                <p className="text-zinc-500 font-medium">V tuto chvíli nejsou vypsány žádné zápasy.</p>
                <p className="text-zinc-600 text-sm mt-1">Počkej, až administrátor vypíše další termín.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Pravý postranní sloupec (Aktuality a Akce) - Na mobilech Skrytý (Varianta A) */}
      <div className="hidden md:block w-full md:w-80 lg:w-96 space-y-8">



        {/* Připnuté / Stálé novinky */}
        {(pinnedNews.length > 0 || regularNews.length > 0) && (
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Nástěnka & Aktuality</h3>
            
            <div className="space-y-3">
              {pinnedNews.map(item => (
                <div key={item.id} className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                  <div className="flex items-start gap-3 relative">
                    <div className="mt-0.5"><Pin size={18} className="text-emerald-400 rotate-45" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-100 mb-1 flex flex-col items-start gap-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Stálé Info</span>
                        {item.title}
                      </h4>
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap mt-2">{item.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {regularNews.map(item => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Info size={18} className="text-zinc-500" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100 mb-1">{item.title}</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                      <p className="text-xs text-zinc-600 mt-3 font-medium">
                        {new Date(item.createdAt).toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

    </div>
  );
}
