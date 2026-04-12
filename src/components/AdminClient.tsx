'use client';

import { useTransition, useState } from 'react';
import { User, Match, News, MatchTemplate } from '@/lib/db';
import { cancelMatch, deleteMatch, toggleUserStatus, changeUserPosition, addNews, deleteNews, toggleNewsPin, deleteMatchTemplate, addMatchTemplate, updateSettings, toggleUserRole, resetSubscribers, resolveDebt, evaluateMatchAttendance, createMatchFromTemplate, createCustomMatch } from '@/app/actions/admin';
import { Ban, Check, X, Shield, Star, DollarSign, Send, Trash2, Pin, Calendar, CalendarPlus, ChevronLeft, ChevronRight, LayoutList, Users, MessageSquare, Plus, Settings, Banknote, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminTabs({
  matchesSection,
  usersSection,
  newsSection,
  settingsSection,
  financeSection
}: {
  matchesSection: React.ReactNode;
  usersSection: React.ReactNode;
  newsSection: React.ReactNode;
  settingsSection?: React.ReactNode;
  financeSection?: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'matches' | 'users' | 'news' | 'settings' | 'finance'>('matches');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('matches')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap border-b-2",
            activeTab === 'matches' 
              ? "text-emerald-500 border-emerald-500" 
              : "text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700"
          )}
        >
          <LayoutList size={18} />
          Správa Zápasů
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap border-b-2",
            activeTab === 'users' 
              ? "text-blue-500 border-blue-500" 
              : "text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700"
          )}
        >
          <Users size={18} />
          Hráči a Platby
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap border-b-2",
            activeTab === 'finance' 
              ? "text-red-500 border-red-500" 
              : "text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700"
          )}
        >
          <Banknote size={18} />
          Finance & Dlužníci
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap border-b-2",
            activeTab === 'news' 
              ? "text-amber-500 border-amber-500" 
              : "text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700"
          )}
        >
          <MessageSquare size={18} />
          Nástěnka & Aktuality
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap border-b-2",
            activeTab === 'settings' 
              ? "text-purple-500 border-purple-500" 
              : "text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700"
          )}
        >
          <Settings size={18} />
          Nastavení
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'matches' && matchesSection}
        {activeTab === 'users' && usersSection}
        {activeTab === 'finance' && financeSection}
        {activeTab === 'news' && newsSection}
        {activeTab === 'settings' && settingsSection}
      </div>
    </div>
  );
}

export function AdminUsersTable({ users, currentUser }: { users: User[], currentUser?: User }) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const isMainAdmin = currentUser?.email === 'admin@florbal.cz';
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const currentUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleToggle = (uid: string, field: 'isSubscriber' | 'hasPaid') => {
    startTransition(() => {
      toggleUserStatus(uid, field);
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 font-medium">Hráč</th>
              <th className="px-4 py-3 font-medium text-center">Post</th>
              <th className="px-4 py-3 font-medium text-center">Předplatitel</th>
              <th className="px-4 py-3 font-medium text-center">Platba</th>
              {isMainAdmin && <th className="px-4 py-3 font-medium text-center">Práva Admina</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {currentUsers.map(user => (
              <tr key={user.uid} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' && <Shield size={14} className="text-amber-500" />}
                    <div>
                      <div className="font-semibold text-zinc-200">{user.name}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <select 
                    value={user.position || 'player'}
                    onChange={(e) => startTransition(() => changeUserPosition(user.uid, e.target.value as any))}
                    disabled={isPending}
                    className="bg-zinc-950 border border-zinc-700 text-xs text-white rounded-lg px-2 py-1.5 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="player">Hráč</option>
                    <option value="goalie">Gólman</option>
                    <option value="versatile">Obojetník</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    disabled={isPending}
                    onClick={() => handleToggle(user.uid, 'isSubscriber')}
                    className={cn(
                      "p-1.5 rounded-lg border transition-all inline-flex",
                      user.isSubscriber 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                        : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                    )}
                  >
                    <Star size={16} fill={user.isSubscriber ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    disabled={isPending}
                    onClick={() => handleToggle(user.uid, 'hasPaid')}
                    className={cn(
                      "p-1.5 rounded-lg border transition-all inline-flex",
                      user.hasPaid 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                        : "bg-red-500/10 border-red-500/30 text-red-500"
                    )}
                  >
                    <DollarSign size={16} />
                  </button>
                </td>
                {isMainAdmin && (
                  <td className="px-4 py-3 text-center">
                    <button
                      disabled={isPending || user.uid === 'admin1'}
                      onClick={() => startTransition(() => toggleUserRole(user.uid))}
                      className={cn(
                        "p-1.5 rounded-lg border transition-all inline-flex",
                        user.role === 'admin'
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                          : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                      )}
                    >
                      <Shield size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-950/30">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs text-zinc-500">Stránka {currentPage} z {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminNewsForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form 
      action={(formData) => {
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const isPinned = formData.get('isPinned') === 'on';
        if (title && content) {
          startTransition(() => {
            addNews(title, content, isPinned);
          });
        }
      }}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl"
    >
      <div>
        <input 
          type="text" 
          name="title"
          placeholder="Nadpis novinky"
          required
          className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <textarea 
          name="content"
          placeholder="Text novinky..."
          required
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>
      <div className="flex items-center gap-2 px-1">
        <input 
          type="checkbox" 
          name="isPinned" 
          id="isPinned" 
          className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-blue-500 focus:ring-blue-500" 
        />
        <label htmlFor="isPinned" className="text-sm text-zinc-400 cursor-pointer">
          Připnout tuto rychlou zprávu / Trvalé Info
        </label>
      </div>
      <button 
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2"
      >
        <Send size={18} />
        Publikovat zprávu
      </button>
    </form>
  )
}

export function AdminSettingsForm({ defaultSettings }: { defaultSettings: any }) {
  const [isPending, startTransition] = useTransition();
  const [qrBase64, setQrBase64] = useState(defaultSettings?.qrCodeUrl || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX = 400;
          if (width > height) {
            if (width > MAX) { height *= MAX / width; width = MAX; }
          } else {
            if (height > MAX) { width *= MAX / height; height = MAX; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.fillStyle = 'white';
             ctx.fillRect(0, 0, width, height);
             ctx.drawImage(img, 0, 0, width, height);
             setQrBase64(canvas.toDataURL('image/jpeg', 0.8));
          }
        };
        if (event.target?.result) img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form 
      action={(formData) => {
        const link = formData.get('whatsappLink') as string;
        const bankAcc = formData.get('qrBankAccount') as string;
        const sFee = parseInt(formData.get('seasonFee') as string);
        const mFee = parseInt(formData.get('matchFee') as string);
        startTransition(() => {
          updateSettings(link, qrBase64, bankAcc, sFee, mFee);
        });
      }}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl"
    >
      <div>
        <label className="text-xs text-zinc-500 ml-1 mb-1 block">Odkaz / Pozvánka do WhatsApp skupiny</label>
        <input 
          type="url" 
          name="whatsappLink"
          defaultValue={defaultSettings?.whatsappLink || ''}
          placeholder="https://chat.whatsapp.com/..."
          className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="text-xs text-zinc-500 ml-1 mb-1 block">Nahrát obrázek sítě QR kódu</label>
        <div className="flex items-center gap-4">
          <label className="w-full bg-zinc-950 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-xl px-4 py-3 cursor-pointer transition-all flex items-center justify-center gap-2">
            <span className="text-sm">Vyber obrázek z galerie...</span>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {qrBase64 && (
            <div className="w-12 h-12 shrink-0 bg-white p-1 rounded-xl shadow-inner">
              <img src={qrBase64} alt="Náhled QR" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-500 ml-1 mb-1 block">Číslo bankovního účtu k platbám</label>
        <input 
          type="text" 
          name="qrBankAccount"
          defaultValue={defaultSettings?.qrBankAccount || ''}
          placeholder="123456789/0000"
          className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 ml-1 mb-1 block">Předplatné (Kč)</label>
          <input 
            type="number" 
            name="seasonFee"
            defaultValue={defaultSettings?.seasonFee || 500}
            min="0"
            className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 ml-1 mb-1 block">1 Zápas (Kč)</label>
          <input 
            type="number" 
            name="matchFee"
            defaultValue={defaultSettings?.matchFee || 50}
            min="0"
            className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      <button 
        type="submit"
        disabled={isPending}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all"
      >
        Uložit nastavení
      </button>
    </form>
  );
}

export function AdminMatchesTable({ matches, whatsappLink }: { matches: Match[], whatsappLink?: string }) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [evaluatingMatch, setEvaluatingMatch] = useState<Match | null>(null);
  const [shareMatch, setShareMatch] = useState<{title: string, date: string} | null>(null);
  const [shareMatchCustom, setShareMatchCustom] = useState<{title: string, textBody: string} | null>(null);
  const itemsPerPage = 6;

  // Sorting matches: newest to oldest dates
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedMatches.length / itemsPerPage);
  const currentMatches = sortedMatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id: string) => {
    if (window.confirm('Opravdu smazat tento zápas?')) {
      startTransition(() => {
        deleteMatch(id);
      });
    }
  };

  const handleCancel = (match: Match) => {
    if (window.confirm('Opravdu trvale ZRUŠIT tento zápas? Zmizí možnosti přihlašování a hráčům se zobrazí jako zrušený.')) {
      startTransition(() => {
        cancelMatch(match.id).then(() => {
           const matchDate = new Date(match.date);
           const cancelTextBody = `❌ ZRUŠENO: Florbal (${matchDate.toLocaleDateString('cs-CZ')}) je ZRUŠEN.\n\nDůvod: [doplňte důvod]\n\nLink: ${window.location.origin}`;
           setShareMatchCustom({ title: 'Sdílet zrušení', textBody: cancelTextBody });
        });
      });
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 font-medium">Datum zápasu</th>
              <th className="px-4 py-3 font-medium text-center">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {currentMatches.map(match => (
              <tr key={match.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-500" />
                    <div>
                      <div className="font-semibold text-zinc-200">
                        {match.title ? <span className="text-emerald-500">{match.title}</span> : 'Utkání'} • {new Date(match.date).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-zinc-500">Kapacita: {match.capacity} | Přihlášeno: {match.responses.filter(r => r.status === 'going').length}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    disabled={isPending}
                    onClick={() => setShareMatch({title: match.title || 'Florbal', date: match.date})}
                    className="mr-2 p-1.5 rounded-lg border bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all inline-flex"
                    title="Sdílet na WhatsApp"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    disabled={isPending || match.status === 'cancelled'}
                    onClick={() => {
                        setEvaluatingMatch(match);
                    }}
                    className={`mr-2 p-1.5 rounded-lg border ${match.status === 'cancelled' ? 'bg-zinc-800 border-zinc-700 text-zinc-600' : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'} transition-all inline-flex`}
                    title="Vyhodnotit docházku a finance"
                  >
                    <Check size={16} />
                  </button>
                  {match.status !== 'cancelled' && match.status === 'open' && (
                    <button
                      disabled={isPending}
                      onClick={() => handleCancel(match)}
                      className="mr-2 p-1.5 rounded-lg border bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20 transition-all inline-flex"
                      title="Zrušit zápas"
                    >
                      <Ban size={16} />
                    </button>
                  )}
                  <button
                    disabled={isPending}
                    onClick={() => handleDelete(match.id)}
                    className="p-1.5 rounded-lg border bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all inline-flex"
                    title="Smazat zápas"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {currentMatches.length === 0 && (
              <tr>
                 <td colSpan={2} className="px-4 py-6 text-center text-zinc-500">Zatím žádné vypsané zápasy.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-950/30">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs text-zinc-500">Stránka {currentPage} z {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
      
      {evaluatingMatch && (
        <EvaluateMatchModal 
          match={evaluatingMatch} 
          onClose={() => setEvaluatingMatch(null)} 
        />
      )}

      {shareMatch && (
        <WhatsAppShareModal 
          matchInfo={shareMatch}
          whatsappLink={whatsappLink}
          onClose={() => setShareMatch(null)}
        />
      )}
      
      {shareMatchCustom && (
        <WhatsAppShareModal 
          customModalTitle={shareMatchCustom.title}
          customTextBody={shareMatchCustom.textBody}
          whatsappLink={whatsappLink}
          onClose={() => setShareMatchCustom(null)}
        />
      )}
    </div>
  );
}

export function AdminNewsTable({ news }: { news: News[] }) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(news.length / itemsPerPage);
  const currentNews = news.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id: string) => {
    if (window.confirm('Opravdu smazat tuto aktualitu?')) {
      startTransition(() => {
        deleteNews(id);
      });
    }
  };

  const handleTogglePin = (id: string) => {
    startTransition(() => {
      toggleNewsPin(id);
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 font-medium">Aktualita</th>
              <th className="px-4 py-3 font-medium text-center">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {currentNews.map(item => (
              <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-semibold text-zinc-200">{item.title}</div>
                    <div className="text-xs text-zinc-500 line-clamp-1">{item.content}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => handleTogglePin(item.id)}
                      className={cn(
                        "p-1.5 rounded-lg border transition-all inline-flex",
                        item.isPinned
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-emerald-500"
                      )}
                      title={item.isPinned ? "Odšpendlit" : "Připnout nahoru"}
                    >
                      <Pin size={16} />
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all inline-flex"
                      title="Smazat zprávu"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentNews.length === 0 && (
              <tr>
                 <td colSpan={2} className="px-4 py-6 text-center text-zinc-500">Zatím žádné aktuality.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-950/30">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs text-zinc-500">Stránka {currentPage} z {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminTemplatesBox({ templates, whatsappLink }: { templates: MatchTemplate[], whatsappLink?: string }) {
  const [isPending, startTransition] = useTransition();
  const [shareMatch, setShareMatch] = useState<{title: string, date: string} | null>(null);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
      <div>
        <h3 className="font-bold text-white">Rychlé vypsání podle Šablony</h3>
        <p className="text-sm text-zinc-400">Přednastavené vzory pro usnadnění rutiny na jedno kliknutí.</p>
      </div>

      <div className="space-y-3 pt-2">
        {templates.map(t => (
          <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition gap-4">
            <div>
              <div className="font-semibold text-zinc-200 flex items-center gap-2">
                <CalendarPlus size={16} className="text-emerald-500" />
                {t.title}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Nejbližší {['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'][t.dayOfWeek]} v {t.time} • Kapacita {t.capacity}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                disabled={isPending}
                onClick={() => {
                  startTransition(() => {
                    createMatchFromTemplate(t.id).then((match) => {
                      setShareMatch(match);
                    });
                  });
                }}
                className="flex-1 sm:flex-none px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:opacity-90"
                style={{ backgroundColor: '#10b981', color: 'white' }}
              >
                Vytvořit zápas
              </button>
              <button 
                disabled={isPending}
                onClick={() => {
                  if(window.confirm('Opravdu smazat šablonu z tvých Rychlých Voleb?')) startTransition(() => { deleteMatchTemplate(t.id) })
                }}
                className="p-2 border border-red-500/20 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all shrink-0"
                title="Smazat šablonu"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-500">Zatím nemáš žádné uložené šablony.</p>
          </div>
        )}
      </div>

      {shareMatch && (
        <WhatsAppShareModal 
          matchInfo={{ title: shareMatch.title || 'Florbal', date: shareMatch.date }}
          whatsappLink={whatsappLink}
          onClose={() => setShareMatch(null)}
        />
      )}
    </div>
  );
}

export function AdminCustomMatchForm({ whatsappLink }: { whatsappLink?: string }) {
  const [isPending, startTransition] = useTransition();
  const [shareMatch, setShareMatch] = useState<{title: string, date: string} | null>(null);

  return (
    <form 
      action={(formData) => {
        const title = formData.get('title') as string;
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const deadlineDate = formData.get('deadlineDate') as string;
        const deadlineTime = formData.get('deadlineTime') as string;
        const capacity = parseInt(formData.get('capacity') as string);
        if (date && time && capacity && title && deadlineDate && deadlineTime) {
          const dt = new Date(`${date}T${time}`);
          const ddt = new Date(`${deadlineDate}T${deadlineTime}`);
          startTransition(() => {
            createCustomMatch(dt.toISOString(), capacity, title, ddt.toISOString()).then((match) => {
              setShareMatch(match);
            });
          });
        }
      }}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-5 shadow-xl h-full flex flex-col"
    >
      <div>
        <h3 className="font-bold text-white flex items-center gap-2">Vlastní termín zápasu</h3>
        <p className="text-sm text-zinc-400">Jednorázové vypsání mimo běžný rytmus.</p>
      </div>
      
      <div className="space-y-3 flex-1">
        <input type="text" name="title" defaultValue="Pondělní florbálek" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Datum zápasu</label>
            <input type="date" name="date" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Čas zápasu</label>
            <input type="time" name="time" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Uzávěrka Dne</label>
            <input type="date" name="deadlineDate" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Uzávěrka v (Čas)</label>
            <input type="time" name="deadlineTime" defaultValue="12:00" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 ml-1 mb-1 block">Kapacita</label>
          <input type="number" name="capacity" min="1" defaultValue="14" placeholder="Kapacita" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </div>
      </div>

      <button disabled={isPending} className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
         Vypsat jednorázovku
      </button>

      {shareMatch && (
        <WhatsAppShareModal 
          matchInfo={{ title: shareMatch.title || 'Florbal', date: shareMatch.date }}
          whatsappLink={whatsappLink}
          onClose={() => setShareMatch(null)}
        />
      )}
    </form>
  );
}

export function AdminNewTemplateForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form 
      action={(formData) => {
        const title = formData.get('title') as string;
        const dayOfWeek = parseInt(formData.get('dayOfWeek') as string);
        const time = formData.get('time') as string;
        const deadlineDaysBefore = parseInt(formData.get('deadlineDaysBefore') as string);
        const deadlineTime = formData.get('deadlineTime') as string;
        const capacity = parseInt(formData.get('capacity') as string);
        if (title && !isNaN(dayOfWeek) && time && capacity && !isNaN(deadlineDaysBefore) && deadlineTime) {
          startTransition(() => {
            addMatchTemplate(title, dayOfWeek, time, capacity, deadlineDaysBefore, deadlineTime);
          });
        }
      }}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-5 shadow-xl h-full flex flex-col"
    >
      <div>
        <h3 className="font-bold text-white">Nová vlastní šablona</h3>
        <p className="text-sm text-zinc-400">Ulož si oblíbený čas pro Rychlé vypsání.</p>
      </div>
      
      <div className="space-y-3 flex-1">
        <input type="text" name="title" defaultValue="Pondělní florbálek" placeholder="Název ročníku / hry" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Hrací den</label>
            <select name="dayOfWeek" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <option value="1">Pondělí</option>
              <option value="2">Úterý</option>
              <option value="3">Středa</option>
              <option value="4">Čtvrtek</option>
              <option value="5">Pátek</option>
              <option value="6">Sobota</option>
              <option value="0">Neděle</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Hrací čas</label>
            <input type="time" name="time" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Uzávěrka X dnů před</label>
            <input type="number" name="deadlineDaysBefore" min="0" defaultValue="1" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Uzávěrka v (Čas)</label>
            <input type="time" name="deadlineTime" defaultValue="12:00" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 ml-1 mb-1 block">Kapacita šablony</label>
          <input type="number" name="capacity" min="1" defaultValue="14" placeholder="Kapacita" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </div>
      </div>

      <button disabled={isPending} className="w-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 text-sm font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
         Uložit nastavení do Šablon
      </button>
    </form>
  );
}

export function AdminFinanceBox({ users }: { users: User[] }) {
  const [isPending, startTransition] = useTransition();
  const [copyStatus, setCopyStatus] = useState('');

  const subscribers = users.filter(u => u.isSubscriber);
  const debtors = users.filter(u => (u.debt || 0) > 0);

  const copyDebts = () => {
    const text = `Čau, visí tu nějaké nedoplatky za zápasy:\n` + 
                 debtors.map(d => `- ${d.name}: ${d.debt} Kč`).join('\n') +
                 `\nProsím zkoukněte apku a uhraďte to. Díky!`;
    navigator.clipboard.writeText(text);
    setCopyStatus('Zkopírováno!');
    
    // Attempt redirect
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`, '_blank');

    setTimeout(() => setCopyStatus(''), 2000);
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Měšec předplatitelů ({subscribers.length})</h3>
          <button 
            disabled={isPending}
            onClick={() => {
              if (window.confirm('Opravdu plošně resetovat předplatné všem stálým členům? Všem se objeví upozornění o dluhu.')) {
                startTransition(() => { resetSubscribers() });
              }
            }}
            className="text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20"
          >
            Nová Sezóna (Hromadný Reset)
          </button>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-950/50 text-zinc-500 border-b border-zinc-800 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Hráč</th>
                <th className="px-4 py-3 font-medium text-center">Formulář / E-mail</th>
                <th className="px-4 py-3 font-medium text-center">Status Platby</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {subscribers.map(u => (
                <tr key={u.uid} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-200">{u.name}</td>
                  <td className="px-4 py-3 text-center text-zinc-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => toggleUserStatus(u.uid, 'hasPaid'))}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-lg border transition-all inline-flex",
                        u.hasPaid 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                          : "bg-red-500/10 border-red-500/30 text-red-500"
                      )}
                    >
                      {u.hasPaid ? 'Uhrazeno' : 'Dluží Sezónu'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Sekera za zápasy ({debtors.length})</h3>
          {debtors.length > 0 && (
            <button 
              onClick={copyDebts}
              className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20 flex items-center gap-1"
            >
              <Send size={14} /> {copyStatus || 'Zkopírovat a přesměrovat'}
            </button>
          )}
        </div>
        
        {debtors.length === 0 ? (
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
            Nikdo nic nedluží. Všichni jednorázoví hráči jsou srovnaní.
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950/50 text-zinc-500 border-b border-zinc-800 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Hostující Hráč</th>
                  <th className="px-4 py-3 font-medium text-center">Dluh (Kč)</th>
                  <th className="px-4 py-3 font-medium text-center">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {debtors.map(u => (
                  <tr key={u.uid} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-zinc-200">{u.name}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-red-500">{u.debt} Kč</td>
                    <td className="px-4 py-3 text-center flex justify-center">
                      <AdminDebtUrovnatForm uid={u.uid} currentDebt={u.debt || 0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function AdminDebtUrovnatForm({ uid, currentDebt }: { uid: string, currentDebt: number }) {
  const [isPending, startTransition] = useTransition();
  return (
    <form 
      action={(data) => {
        const val = parseInt(data.get('amount') as string);
        if (val && val > 0) {
          startTransition(() => {
            resolveDebt(uid, val);
          });
        }
      }}
      className="flex gap-2 w-full max-w-[200px]"
    >
      <input 
        type="number" 
        name="amount" 
        defaultValue={currentDebt} 
        min="1"
        max={currentDebt}
        className="w-full min-w-0 bg-zinc-950 border border-zinc-700 text-white rounded-lg px-2 py-1 text-center text-xs focus:ring-emerald-500" 
      />
      <button 
        disabled={isPending}
        className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
      >
        Zaplatil
      </button>
    </form>
  );
}

export function EvaluateMatchModal({ match, onClose }: { match: Match, onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const respondents = match.responses.filter(r => r.status === 'going');
  const [checkedUids, setCheckedUids] = useState<string[]>(respondents.map(r => r.userId));

  const toggleCheck = (uid: string) => {
    setCheckedUids(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
  };

  const submitEvaluation = () => {
    if (window.confirm('Hráčům, kteří nemají předplatné a jsou zde zaškrtnutí, se přičte dluh za zápas. Pokračovat?')) {
      startTransition(() => {
        evaluateMatchAttendance(match.id, checkedUids).then(() => {
           onClose();
        });
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-bold text-lg text-white">Vyhodnocení docházky</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-2 border border-zinc-700 rounded-xl bg-zinc-800 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-sm text-zinc-400">
            Zkontroluj, kdo ze zapsaných lidí skutečně hrál. 
            Systém lidem <b className="text-amber-500">bez předplatného</b> automaticky přičte zápasový poplatek k jejich aktuálnímu dluhu.
          </p>
          <div className="space-y-2">
            {respondents.length === 0 && <p className="text-zinc-600 text-sm">Na tento zápas se nikdo nepřihlásil.</p>}
            {respondents.map((r, idx) => (
              <label key={r.userId} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 cursor-pointer hover:bg-zinc-800/80 transition-colors">
                <span className="font-semibold text-zinc-200">{idx + 1}. {r.userName}</span>
                <input 
                  type="checkbox" 
                  checked={checkedUids.includes(r.userId)} 
                  onChange={() => toggleCheck(r.userId)}
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900" 
                />
              </label>
            ))}
          </div>
        </div>
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/30 rounded-b-3xl">
          <button 
            disabled={isPending}
            onClick={submitEvaluation}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
          >
            {isPending ? 'Ukládám a počítám...' : 'Uzavřít a nahrát dluhy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppShareModal({ matchInfo, whatsappLink, onClose, customTextBody, customModalTitle }: { matchInfo?: {title: string, date: string}, whatsappLink?: string, onClose: () => void, customTextBody?: string, customModalTitle?: string }) {
  let textBody = customTextBody || '';
  if (!customTextBody && matchInfo) {
    const dateStr = new Date(matchInfo.date).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'numeric' });
    const timeStr = new Date(matchInfo.date).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    textBody = `🏑 Nový florbal: ${matchInfo.title}\n📅 ${dateStr} v ${timeStr}\n\nHlašte se v apce: ${window.location.origin}`;
  }

  const [copied, setCopied] = useState(false);
  const isDanger = customModalTitle?.toLowerCase().includes('zrušení') || customModalTitle?.toLowerCase().includes('zrušen');

  const handleCopyAndGo = () => {
    navigator.clipboard.writeText(textBody);
    setCopied(true);
    let url = '';
    if (whatsappLink && whatsappLink.length > 5) {
      url = whatsappLink;
    } else {
      url = `whatsapp://send?text=${encodeURIComponent(textBody)}`;
    }
    window.open(url, '_blank');
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-zinc-900 border ${isDanger ? 'border-orange-500/20' : 'border-emerald-500/20'} rounded-3xl w-full max-w-sm shadow-2xl flex flex-col pt-6`}>
        <div className="px-5 pb-3">
          <div className={`flex justify-center mb-3 ${isDanger ? 'text-orange-500' : 'text-emerald-500'}`}>
             <Share2 size={36} />
          </div>
          <h2 className="font-bold text-lg text-white mb-2 text-center">{customModalTitle || 'Publikovat událost'}</h2>
          <p className="text-sm text-zinc-400 text-center mb-4">Text níže se automaticky zkopíruje. Po otevření WhatsAppu ho do chatu jen <b>Vložte</b> (Zkopírovat a vložit).</p>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-700 text-xs italic text-zinc-300 font-mono whitespace-pre-wrap">
             {textBody}
          </div>
        </div>
        <div className="p-3 border-t border-zinc-800 flex items-center justify-between gap-2 mt-2">
           <button onClick={onClose} className="px-4 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex-[0.5]">Zavřít</button>
           <button onClick={handleCopyAndGo} className={`px-4 py-3 rounded-xl font-bold text-white ${isDanger ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'} transition-all flex-1 flex items-center justify-center gap-2`}>
             {!copied ? 'Zkopírovat a přesměrovat' : <><Check size={18} /> Zkopírováno!</>}
           </button>
        </div>
      </div>
    </div>
  );
}
