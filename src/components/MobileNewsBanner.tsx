'use client';

import { useState } from 'react';
import { Pin, Info, X, ChevronRight } from 'lucide-react';
import type { News } from '@/lib/db';

interface MobileNewsBannerProps {
  allNews: News[];
}

export function MobileNewsBanner({ allNews }: MobileNewsBannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (allNews.length === 0) return null;

  // The most recent news, completely ignoring the pinned status!
  const topNews = [...allNews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const pinnedNews = allNews.filter(n => n.isPinned);
  const regularNews = allNews.filter(n => !n.isPinned);

  return (
    <>
      <section className="md:hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
             Nová zpráva na nástěnce
           </h3>
           <button 
             onClick={() => setIsOpen(true)}
             className="text-[11px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider flex items-center transition-colors"
           >
             Zobrazit vše ({allNews.length}) <ChevronRight size={14} className="ml-0.5" />
           </button>
        </div>

        <button 
          onClick={() => setIsOpen(true)}
          className="w-full text-left bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-start gap-3 relative overflow-hidden transition-transform active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
          <div className="relative mt-0.5 shrink-0">
            {topNews.isPinned ? <Pin size={18} className="text-emerald-400 rotate-45" /> : <Info size={18} className="text-emerald-400" />}
          </div>
          <div className="relative flex-1 min-w-0">
            <h4 className="text-sm font-bold text-emerald-50 mb-1 line-clamp-1">{topNews.title}</h4>
            <p className="text-sm text-emerald-100/90 leading-relaxed line-clamp-2">{topNews.content}</p>
          </div>
        </button>
      </section>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 pb-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative w-full max-w-lg max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 shrink-0">
              <h3 className="text-lg font-bold text-white">Všechny aktuality</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto overscroll-contain space-y-4">
              {pinnedNews.length > 0 && (
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
                </div>
              )}
              
              {regularNews.length > 0 && (
                <div className="space-y-3 pt-2">
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
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
