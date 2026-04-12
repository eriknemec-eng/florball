'use client';

import { useState, useTransition } from 'react';
import { Shield, ShieldAlert, ArrowRightLeft } from 'lucide-react';
import { updateUserProfile } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function ProfileSetup() {
  const [selected, setSelected] = useState<'player' | 'goalie' | 'versatile' | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    if (!selected) return;
    startTransition(() => {
      updateUserProfile('', selected).then(() => {
        router.refresh();
      });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Vyber si svůj post</h2>
        <p className="text-zinc-400 text-center mb-8 text-sm">
          Aplikace teď odděluje fronty. Na jaké pozici nastupuješ nejčastěji? (Tvou volbu pak půjde změnit přes admina).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => setSelected('player')}
            className={cn(
              "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
              selected === 'player'
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
            )}
          >
            <Shield size={28} />
            <span className="font-semibold text-sm">Hráč v poli</span>
          </button>

          <button
            onClick={() => setSelected('goalie')}
            className={cn(
              "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
              selected === 'goalie'
                ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
            )}
          >
            <ShieldAlert size={28} />
            <span className="font-semibold text-sm">Brankář</span>
          </button>

          <button
            onClick={() => setSelected('versatile')}
            className={cn(
              "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
              selected === 'versatile'
                ? "bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
            )}
          >
            <ArrowRightLeft size={28} />
            <span className="font-semibold text-sm">Obojetník</span>
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={!selected || isPending}
          className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Ukládám...' : 'Pokračovat do aplikace'}
        </button>
      </div>
    </div>
  );
}
