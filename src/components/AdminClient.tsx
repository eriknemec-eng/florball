'use client';

import { useTransition, useState } from 'react';
import { User, Match, News, MatchTemplate } from '@/lib/db';
import { editMatch, cancelMatch, deleteUser, deleteMatch, toggleUserStatus, changeUserPosition, addNews, deleteNews, toggleNewsPin, deleteMatchTemplate, addMatchTemplate, updateSettings, toggleUserRole, resetSubscribers, resolveDebt, evaluateMatchAttendance, createMatchFromTemplate, createCustomMatch, sendMatchInvitationEmail, sendDebtReminderEmail } from '@/app/actions/admin';
import { Pencil, Ban, Check, X, Shield, Star, DollarSign, Send, Trash2, Pin, Calendar, CalendarPlus, ChevronLeft, ChevronRight, LayoutList, Users, MessageSquare, Plus, Settings, Banknote, Share2, ArrowLeft, Mail, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminTabs({
  addMatchSection,
  historySection,
  usersSection,
  newsSection,
  settingsSection,
  financeSection,
  emailsSection
}: {
  addMatchSection: React.ReactNode;
  historySection: React.ReactNode;
  usersSection: React.ReactNode;
  newsSection: React.ReactNode;
  settingsSection?: React.ReactNode;
  financeSection?: React.ReactNode;
  emailsSection?: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'add_match' | 'history' | 'users' | 'news' | 'settings' | 'finance' | 'emails' | null>(null);

  if (activeTab) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={() => setActiveTab(null)}
          className="flex items-center gap-2 px-4 py-2 border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all shadow-sm font-semibold mb-2"
        >
          <ArrowLeft size={18} /> Zpět do rozcestníku
        </button>
        
        <div>
          {activeTab === 'add_match' && <div key="add_match">{addMatchSection}</div>}
          {activeTab === 'history' && <div key="history">{historySection}</div>}
          {activeTab === 'users' && <div key="users">{usersSection}</div>}
          {activeTab === 'finance' && <div key="finance">{financeSection}</div>}
          {activeTab === 'news' && <div key="news">{newsSection}</div>}
          {activeTab === 'settings' && <div key="settings">{settingsSection}</div>}
          {activeTab === 'emails' && <div key="emails">{emailsSection}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto animate-in fade-in scale-95 duration-500">
      <button
        onClick={() => setActiveTab('add_match')}
        className="flex flex-col items-center justify-center p-5 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-zinc-800 hover:border-emerald-500/50 transition-all group shadow-sm text-center"
      >
        <div className="p-3 bg-emerald-500/10 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
          <CalendarPlus size={28} className="text-emerald-500" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Přidat zápas</h3>
        <p className="text-zinc-500 text-xs">Nové termíny a šablony</p>
      </button>

      <button
        onClick={() => setActiveTab('history')}
        className="flex flex-col items-center justify-center p-5 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-zinc-800 hover:border-emerald-500/50 transition-all group shadow-sm text-center"
      >
        <div className="p-3 bg-emerald-500/10 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
          <LayoutList size={28} className="text-emerald-500" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Zápasy a Zúčtování</h3>
        <p className="text-zinc-500 text-xs">Úpravy, rušení a vyhodnocení docházky.</p>
      </button>

      <button
        onClick={() => setActiveTab('users')}
        className="flex flex-col items-center justify-center p-5 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-zinc-800 hover:border-blue-500/50 transition-all group shadow-sm text-center"
      >
        <div className="p-3 bg-blue-500/10 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
          <Users size={28} className="text-blue-500" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Hráči a Nastavení</h3>
        <p className="text-zinc-500 text-xs">Tresty a smazání hráčů.</p>
      </button>

      <button
        onClick={() => setActiveTab('finance')}
        className="flex flex-col items-center justify-center p-5 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-zinc-800 hover:border-amber-500/50 transition-all group shadow-sm text-center"
      >
        <div className="p-3 bg-amber-500/10 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
          <Banknote size={28} className="text-amber-500" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Pokladna & Dlužníci</h3>
        <p className="text-zinc-500 text-xs">Stav účtů, předplatná a dluhy.</p>
      </button>

      <button
        onClick={() => setActiveTab('news')}
        className="flex flex-col items-center justify-center p-5 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-zinc-800 hover:border-purple-500/50 transition-all group shadow-sm text-center"
      >
        <div className="p-3 bg-purple-500/10 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
          <MessageSquare size={28} className="text-purple-500" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Nástěnka a Zprávy</h3>
        <p className="text-zinc-500 text-xs">Připínání trvalých oznámení.</p>
      </button>

      <button
        onClick={() => setActiveTab('settings')}
        className="flex flex-col items-center justify-center p-5 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-zinc-800 hover:border-zinc-500/50 transition-all group shadow-sm text-center"
      >
        <div className="p-3 bg-zinc-800 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
          <Settings size={28} className="text-zinc-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Globální Nastavení</h3>
        <p className="text-zinc-500 text-xs">Změna WhatsApp a cen.</p>
      </button>

      <button
        onClick={() => setActiveTab('emails')}
        className="flex flex-col items-center justify-center p-5 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-zinc-800 hover:border-rose-500/50 transition-all group shadow-sm text-center"
      >
        <div className="p-3 bg-rose-500/10 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
          <Send size={28} className="text-rose-500" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">E-mail Server</h3>
        <p className="text-zinc-500 text-xs">Testování odesílání přes Brevo.</p>
      </button>
    </div>
  );
}

export function AdminAddMatchSection({ templates, whatsappLink }: { templates: MatchTemplate[], whatsappLink?: string }) {
  return (
    <div className="space-y-6">
      <div className="space-y-6 animate-in fade-in duration-300">
        <AdminTemplatesBox templates={templates} whatsappLink={whatsappLink} />
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <AdminCustomMatchForm whatsappLink={whatsappLink} />
          </div>
          <div className="flex-1">
            <AdminNewTemplateForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminHistoryMatchSection({ matches, users, whatsappLink }: { matches: Match[], users: User[], whatsappLink?: string }) {
  const now = new Date().getTime();
  // Zápas čeká na zúčtování, pokud je open a už se odehrál (jeho datum začátku už proběhlo).
  const matchesToEvaluate = matches.filter(m => m.status === 'open' && new Date(m.date).getTime() < now);
  const otherMatches = matches.filter(m => !(m.status === 'open' && new Date(m.date).getTime() < now));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {matchesToEvaluate.length > 0 && (
        <div className="space-y-4 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
             <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500">Čeká na zúčtování ({matchesToEvaluate.length})</h3>
          </div>
          <AdminMatchesTable matches={matchesToEvaluate} users={users} whatsappLink={whatsappLink} />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Plánované zápasy a Historie</h3>
        </div>
        <AdminMatchesTable matches={otherMatches} users={users} whatsappLink={whatsappLink} />
      </div>

    </div>
  );
}

export function AdminUsersTable({ users, currentUser }: { users: User[], currentUser?: User }) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const isMainAdmin = currentUser?.email === 'admin@florbal.cz' || currentUser?.email === 'erik.nemec@me.com';
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
              {isMainAdmin && <th className="px-4 py-3 font-medium text-center">Práva Admina</th>}
              <th className="px-4 py-3 font-medium text-center">Akce</th>
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
                <td className="px-4 py-3 text-center">
                  <button
                    disabled={isPending || user.uid === 'admin1' || (currentUser?.email === 'admin@florbal.cz' ? false : currentUser?.uid === user.uid)}
                    onClick={() => {
                       if (confirm(`Opravdu chcete nenávratně smazat účet ${user.name} (${user.email})?`)) {
                          startTransition(() => deleteUser(user.uid));
                       }
                    }}
                    className="p-1.5 rounded-lg border bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all inline-flex disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Smazat účet hráče"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
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
  const [showToast, setShowToast] = useState(false);

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
          updateSettings(link, qrBase64, bankAcc, sFee, mFee).then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          });
        });
      }}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden"
    >
      
      {showToast && (
        <div className="absolute top-0 left-0 w-full bg-emerald-500 text-zinc-950 font-bold text-center text-sm py-2 animate-in slide-in-from-top-full fade-in z-10 shadow-lg">
          Nastavení úspěšně uloženo!
        </div>
      )}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

export function AdminMatchesTable({ matches, users, whatsappLink }: { matches: Match[], users: User[], whatsappLink?: string }) {
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [evaluatingMatch, setEvaluatingMatch] = useState<Match | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [shareMatch, setShareMatch] = useState<{id: string, title: string, date: string} | null>(null);
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
                      <div className="text-xs text-zinc-500">Kapacita: {match.capacity} | Přihlášeno: {match.responses.filter(r => ['going_player', 'going_goalie', 'playing_player', 'playing_goalie'].includes(r.status)).length}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    disabled={isPending}
                    onClick={() => setShareMatch({id: match.id, title: match.title || 'Florbal', date: match.date})}
                    className="mr-2 p-1.5 rounded-lg border bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all inline-flex"
                    title="Sdílet na WhatsApp"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    disabled={isPending || match.status === 'cancelled' || match.status === 'closed'}
                    onClick={() => {
                        setEvaluatingMatch(match);
                    }}
                    className={`mr-2 p-1.5 rounded-lg border ${match.status === 'cancelled' || match.status === 'closed' ? 'bg-zinc-800 border-zinc-700 text-zinc-600' : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'} transition-all inline-flex`}
                    title={match.status === 'closed' ? 'Již vyhodnoceno' : 'Vyhodnotit docházku a finance'}
                  >
                    <Banknote size={16} />
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
                  {match.status !== 'cancelled' && (
                    <button
                      disabled={isPending}
                      onClick={() => setEditingMatch(match)}
                      className="mr-2 p-1.5 rounded-lg border bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20 transition-all inline-flex"
                      title="Upravit parametry zápasu"
                    >
                      <Pencil size={16} />
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
          users={users} 
          onClose={() => setEvaluatingMatch(null)} 
        />
      )}

      {editingMatch && (
        <AdminEditMatchModal 
          match={editingMatch} 
          onClose={() => setEditingMatch(null)} 
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
  const [shareMatch, setShareMatch] = useState<{id: string, title: string, date: string} | null>(null);

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
                Nejbližší {['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'][t.dayOfWeek]} v {t.time} • Kap. {t.capacity} • Zámek {t.deadlineDaysBefore === 0 ? 'týž den' : `${t.deadlineDaysBefore} d. předem`} v {t.deadlineTime}
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
          matchInfo={{ id: shareMatch.id, title: shareMatch.title || 'Florbal', date: shareMatch.date }}
          whatsappLink={whatsappLink}
          onClose={() => setShareMatch(null)}
        />
      )}
    </div>
  );
}

export function AdminCustomMatchForm({ whatsappLink }: { whatsappLink?: string }) {
  const [isPending, startTransition] = useTransition();
  const [shareMatch, setShareMatch] = useState<{id: string, title: string, date: string} | null>(null);

  return (
    <form 
      action={(formData) => {
        const title = formData.get('title') as string;
        const dateL = formData.get('date') as string;
        const timeL = formData.get('time') as string;
        const dlDateL = formData.get('deadlineDate') as string;
        const dlTimeL = formData.get('deadlineTime') as string;
        const capacity = parseInt(formData.get('capacity') as string);
        const durationMinutes = parseInt(formData.get('durationMinutes') as string);
        if (title && capacity && dateL && timeL && dlDateL && dlTimeL && durationMinutes) {
          const dateIso = new Date(`${dateL}T${timeL}:00`).toISOString();
          const deadlineIso = new Date(`${dlDateL}T${dlTimeL}:00`).toISOString();
          startTransition(() => {
            createCustomMatch(dateIso, capacity, title, deadlineIso, durationMinutes).then(m => {
              setShareMatch(m);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Datum zápasu</label>
            <input type="date" name="date" required className="w-full min-w-0 max-w-full appearance-none bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Čas zápasu</label>
            <input type="time" name="time" required className="w-full min-w-0 max-w-full appearance-none bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Uzávěrka Dne</label>
            <input type="date" name="deadlineDate" required className="w-full min-w-0 max-w-full appearance-none bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Uzávěrka v (Čas)</label>
            <input type="time" name="deadlineTime" defaultValue="12:00" required className="w-full min-w-0 max-w-full appearance-none bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Kapacita</label>
            <input type="number" name="capacity" min="1" defaultValue="14" placeholder="Kapacita" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Délka trvání (minuty)</label>
            <input type="number" name="durationMinutes" min="1" defaultValue="90" placeholder="Minuty" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
      </div>

      <button disabled={isPending} className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
         Vypsat jednorázovku
      </button>

      {shareMatch && (
        <WhatsAppShareModal 
          matchInfo={{ id: shareMatch.id, title: shareMatch.title || 'Florbal', date: shareMatch.date }}
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
        const durationMinutes = parseInt(formData.get('durationMinutes') as string);
        if (title && !isNaN(dayOfWeek) && time && capacity && !isNaN(deadlineDaysBefore) && deadlineTime && durationMinutes) {
          startTransition(() => {
            addMatchTemplate(title, dayOfWeek, time, capacity, deadlineDaysBefore, deadlineTime, durationMinutes);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <input type="time" name="time" required className="w-full min-w-0 max-w-full appearance-none bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Uzávěrka X dnů před</label>
            <input type="number" name="deadlineDaysBefore" min="0" defaultValue="1" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Uzávěrka v (Čas)</label>
            <input type="time" name="deadlineTime" defaultValue="12:00" required className="w-full min-w-0 max-w-full appearance-none bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Kapacita šablony</label>
            <input type="number" name="capacity" min="1" defaultValue="14" placeholder="Kapacita" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Délka trvání (minuty)</label>
            <input type="number" name="durationMinutes" min="1" defaultValue="90" placeholder="Minuty" required className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
      </div>

      <button disabled={isPending} className="w-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 text-sm font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
         Uložit nastavení do Šablon
      </button>
    </form>
  );
}

export function AdminFinanceBox({ users, whatsappLink }: { users: User[], whatsappLink?: string }) {
  const [isPending, startTransition] = useTransition();
  const [shareMessage, setShareMessage] = useState<{title: string, textBody: string} | null>(null);

  const subscribers = users.filter(u => u.isSubscriber);
  const debtors = users.filter(u => (u.debt || 0) > 0);

  const allDebtors = users.filter(u => (u.isSubscriber && !u.hasPaid) || ((u.debt || 0) > 0));

  const openDebtsMessage = () => {
    if (allDebtors.length === 0) {
      alert('Aktuálně nikdo nedluží.');
      return;
    }
    
    const lines = allDebtors.map(u => {
      const owesSeason = u.isSubscriber && !u.hasPaid;
      const owesMatch = (u.debt || 0) > 0;
      if (owesSeason && owesMatch) return `- ${u.name}: Sezóna + Sekera (${u.debt} Kč)`;
      if (owesSeason) return `- ${u.name}: Předplatné na sezónu`;
      if (owesMatch) return `- ${u.name}: Sekera za zápasy (${u.debt} Kč)`;
      return '';
    }).filter(Boolean);

    const baseUrl = 'https://pondelniflorbalek.cz';
    const text = `Čau pardi, visí nám tu nějaké nedoplatky v klubové kase:\n\n` + 
                 lines.join('\n') +
                 `\n\nProsím mrkněte do apky na detaily a případně rovnou naskenujte QR platbu. Díky!\n${baseUrl}/qr`;
                 
    setShareMessage({ title: 'Upomenout přes WhatsApp', textBody: text });
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Měšec předplatitelů ({subscribers.length})</h3>
          
          <div className="flex flex-wrap gap-2">
            <button 
              disabled={isPending}
              onClick={() => {
                if (window.confirm('Opravdu plošně resetovat předplatné všem stálým členům? Všem se objeví upozornění o dluhu.')) {
                  startTransition(() => { resetSubscribers() });
                }
              }}
              className="text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20"
            >
              Nová Sezóna (Reset)
            </button>
            
            <button 
              disabled={isPending}
              onClick={() => {
                if (allDebtors.length === 0) {
                   alert('Aktuálně nikdo z hráčů nedluží.');
                   return;
                }
                if (window.confirm('Opravdu rozeslat upomínky e-mailem těmto dlužníkům?\n' + allDebtors.map(o => o.name).join(', '))) {
                   startTransition(() => {
                     import('@/app/actions/admin').then((m) => {
                       m.sendDebtReminderEmail().then(() => alert('Zprávy úspěšně odeslány.')).catch(err => alert('Chyba: ' + err.message));
                     });
                   });
                }
              }}
              className="text-xs font-semibold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20 inline-flex items-center gap-1"
            >
              <Mail size={14} /> E-mail všem
            </button>

            <button 
              disabled={isPending}
              onClick={openDebtsMessage}
              className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20 inline-flex items-center gap-1"
            >
              <Send size={14} /> WhatsApp všem
            </button>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto shadow-xl">
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Poslat zprávu e-mailem"
                        disabled={isPending || u.hasPaid}
                        onClick={() => {
                           if (window.confirm(`Opravdu chceš hráče ${u.name} upomenout mailem?`)) {
                              startTransition(() => { 
                                sendDebtReminderEmail(u.uid)
                                  .then(()=>alert('Dopis odeslán.'))
                                  .catch(err => alert('Chyba: ' + err.message));
                              });
                           }
                        }}
                        className="p-1.5 rounded-lg transition-all border border-transparent hover:border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20"
                      >
                         <Mail size={16} />
                      </button>
                      <span className={cn("font-bold text-xs uppercase ml-1 mr-1", u.hasPaid ? "text-emerald-500" : "text-red-500")}>
                        {u.hasPaid ? 'Uhrazeno' : 'Dluží Sezónu'}
                      </span>
                      <button
                        disabled={isPending}
                        onClick={() => startTransition(() => toggleUserStatus(u.uid, 'hasPaid'))}
                        className={cn(
                          "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                          u.hasPaid 
                            ? "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700" 
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                        )}
                      >
                        {u.hasPaid ? 'Zrušit' : 'Zaplatil'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Sekera za zápasy ({debtors.length})</h3>
        </div>
        
        {debtors.length === 0 ? (
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
            Nikdo nic nedluží. Všichni jednorázoví hráči jsou srovnaní.
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto shadow-xl">
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
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Poslat zprávu e-mailem"
                          disabled={isPending}
                          onClick={() => {
                             if (window.confirm(`Opravdu chceš hráče ${u.name} upomenout mailem (Sekera: ${u.debt} Kč)?`)) {
                                startTransition(() => { 
                                  sendDebtReminderEmail(u.uid)
                                    .then(()=>alert('Dopis odeslán.'))
                                    .catch(err => alert('Chyba: ' + err.message));
                                });
                             }
                          }}
                          className="mr-2 p-1.5 rounded-lg transition-all border border-transparent hover:border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20"
                        >
                           <Mail size={16} />
                        </button>
                        <AdminDebtUrovnatForm uid={u.uid} currentDebt={u.debt || 0} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {shareMessage && (
        <WhatsAppShareModal 
          customModalTitle={shareMessage.title}
          customTextBody={shareMessage.textBody}
          whatsappLink={whatsappLink}
          onClose={() => setShareMessage(null)}
        />
      )}
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

export function EvaluateMatchModal({ match, users, onClose }: { match: Match, users: User[], onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [hideSubscribers, setHideSubscribers] = useState(false);
  const [checkedPaidUids, setCheckedPaidUids] = useState<string[]>(match.attendanceDraft || []);

  // Stejná logika jako v MatchCard pro případ, že zápas nebyl formálně uzamčen přes Fázi 2
  const sortStrategy = (a: any, b: any) => {
    const isGuestA = a.uid?.startsWith('guest_');
    const isGuestB = b.uid?.startsWith('guest_');
    const uA = users.find(u => u.uid === a.uid);
    const uB = users.find(u => u.uid === b.uid);
    const subA = (uA?.isSubscriber || isGuestA) ? 1 : 0;
    const subB = (uB?.isSubscriber || isGuestB) ? 1 : 0;
    if (subA !== subB) return subB - subA; 
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); 
  };

  const players = match.responses.filter(r => r.status === 'going_player' || r.status === 'playing_player').sort(sortStrategy).slice(0, 12);
  const goalies = match.responses.filter(r => r.status === 'going_goalie' || r.status === 'playing_goalie').sort(sortStrategy).slice(0, 2);

  const deadlineMs = new Date(match.deadline).getTime();
  const lateCancellations = match.responses.filter(r => r.status === 'not_going' && new Date(r.timestamp).getTime() > deadlineMs);

  let respondents = [...goalies, ...players, ...lateCancellations];
  if (hideSubscribers) {
    respondents = respondents.filter(r => !users.find(u => u.uid === r.uid)?.isSubscriber);
  }

  const toggleCheck = (uid: string) => {
    setCheckedPaidUids(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
  };

  const saveDraft = () => {
    startTransition(() => {
      import('@/app/actions/admin').then(m => m.saveMatchAttendanceDraft(match.id, checkedPaidUids)).then(() => {
        alert('Koncept byl úspěšně uložen.');
        onClose();
      });
    });
  };

  const submitEvaluation = () => {
    // We check all respondents that belong to the confirmed cut (even if hidden from UI, they shouldn't suddenly become debtors if they are subscribers)
    // Actually, subscribers are protected anyway, but let's evaluate them safely.
    const fullRespondentsList = [...goalies, ...players];
    const uidsWithDebt = fullRespondentsList.map(r => r.uid).filter(uid => !checkedPaidUids.includes(uid) && !uid?.startsWith('guest_'));
    
    if (window.confirm('Všem NEZAŠKRTNUTÝM hráčům (bez předplatného) se připíše nový dluh k úhradě. Souhlasí to? Tato akce zápas definitivně uzavře.')) {
      startTransition(() => {
        import('@/app/actions/admin').then(m => m.evaluateMatchAttendance(match.id, uidsWithDebt)).then(() => {
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
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-sm text-zinc-300">
            <p className="mb-2"><b className="text-amber-500">Co s tím?</b> Zaškrtni ty hráče, kteří <b>zaplatili hotově na místě</b> (nebo už víš, že to poslali).</p>
            <p>Všichni <b className="text-white">nezaškrtnutí</b> (kromě majitelů předplatného) si automaticky vyslouží dluh v sekci Finance & Dlužníci.</p>
          </div>
          <div className="flex justify-between items-center bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
            <span className="text-sm font-semibold text-zinc-400">Předplatitelé zaplatili dopředu</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-zinc-500">Skrýt předplatitele z listu</span>
              <input type="checkbox" checked={hideSubscribers} onChange={e => setHideSubscribers(e.target.checked)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500" />
            </label>
          </div>
          <div className="space-y-2">
            {respondents.length === 0 && <p className="text-zinc-600 text-sm">Na tento zápas se nikdo nepřihlásil.</p>}
            {respondents.map((r, idx) => {
              const u = users.find(user => user.uid === r.uid);
              const isGuest = r.uid?.startsWith('guest_');
              const displayName = u?.name || (isGuest ? r.uid.split('_').slice(2).join(' ') + ' (Host)' : 'Neznámý hráč');
              const isSub = u?.isSubscriber;

              const isLateCancel = r.status === 'not_going';

              return (
                <label key={r.uid} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${(isSub || isGuest) ? 'bg-zinc-900 border-zinc-800 opacity-70 cursor-not-allowed' : 'bg-zinc-950/50 border-zinc-800 cursor-pointer hover:bg-zinc-800/80'}`}>
                  <span className={`font-semibold flex items-center gap-2 ${isLateCancel ? 'text-red-400' : 'text-zinc-200'} ${isGuest ? 'opacity-70' : ''}`}>
                    {idx + 1}. {displayName} 
                    {isSub && <span title="Předplatitel"><Star size={14} className="text-amber-500 fill-amber-500" /></span>}
                    {isLateCancel && <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 uppercase">Odhlášen po uzávěrce</span>}
                    {isGuest && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">Zaplaceno na ruku</span>}
                  </span>
                  <input 
                    type="checkbox" 
                    disabled={isSub || isGuest}
                    checked={(isSub || isGuest) ? true : checkedPaidUids.includes(r.uid)} 
                    onChange={() => !(isSub || isGuest) && toggleCheck(r.uid)}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 disabled:opacity-50" 
                  />
                </label>
              );
            })}
          </div>
        </div>
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/30 rounded-b-3xl flex flex-col sm:flex-row gap-3">
          <button 
            disabled={isPending}
            onClick={saveDraft}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
          >
            {isPending ? 'Ukládám...' : 'Uložit koncept'}
          </button>
          <button 
            disabled={isPending}
            onClick={submitEvaluation}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
          >
            Definitivně zaúčtovat
          </button>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppShareModal({ matchInfo, whatsappLink, onClose, customTextBody, customModalTitle }: { matchInfo?: {id: string, title: string, date: string}, whatsappLink?: string, onClose: () => void, customTextBody?: string, customModalTitle?: string }) {
  let textBody = customTextBody || '';
  if (!customTextBody && matchInfo) {
    const dateStr = new Date(matchInfo.date).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'numeric' });
    const timeStr = new Date(matchInfo.date).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    textBody = `🏑 Nový ${matchInfo.title.toLowerCase()}\n📅 ${dateStr} v ${timeStr}\n\nHlašte se v apce: https://pondelniflorbalek.cz`;
  }

  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isPending, startTransition] = useTransition();
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
  
  const handleSendEmail = () => {
     if (!matchInfo?.id) return;
     setEmailSending(true);
     startTransition(() => {
        sendMatchInvitationEmail(matchInfo.id).then(() => {
           setEmailSent(true);
           setEmailSending(false);
        }).catch(() => {
           alert('Chyba při odesílání.');
           setEmailSending(false);
        });
     });
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
        
        {/* Email option */}
        {!isDanger && matchInfo && (
           <div className="px-5 py-3 border-t border-zinc-800/50">
             <button
                onClick={handleSendEmail}
                disabled={emailSending || emailSent || isPending}
                className="w-full py-3 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
                {emailSending ? <div className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin"></div> : (emailSent ? <Check size={16} className="text-emerald-500" /> : <Mail size={16} className="text-zinc-400" />)}
                {emailSending ? 'Odesílám e-maily všem hráčům...' : (emailSent ? 'Rozesláno všem hráčům' : 'Rozeslat automatické pozvánky e-mailem')}
             </button>
           </div>
        )}

        <div className="p-3 border-t border-zinc-800 flex items-center justify-between gap-2">
           <button onClick={onClose} className="px-4 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex-[0.5]">Zavřít</button>
           <button onClick={handleCopyAndGo} className={`px-4 py-3 rounded-xl font-bold text-white ${isDanger ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'} transition-all flex-1 flex items-center justify-center gap-2`}>
             {!copied ? 'Kopírovat WhatsApp' : <><Check size={18} /> Zkopírováno!</>}
           </button>
        </div>
      </div>
    </div>
  );
}

export function AdminEmails({ currentUser }: { currentUser: User }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{id: string, text: string, ok: boolean} | null>(null);

  const templates = [
    { id: 'ping', name: 'Zkušební PING', desc: 'Čistý technický průstřel serverem bez formátování pro test doručitelnosti.' },
    { id: 'new-match', name: 'Nová událost (Zápas)', desc: 'Hromadná pozvánka, kterou lze nechat poslat okamžitě po vypsání termínu.' },
    { id: 'freed-player', name: 'Volné místo: Hráč v poli', desc: 'Hromadné avízo náhradníkům, že se nečekaně uvolnilo místo v poli.' },
    { id: 'freed-goalie', name: 'Volné místo: Gólman', desc: 'Hromadné avízo brankářům, že vypadl gólman ze sestavy.' },
    { id: 'password-reset', name: 'Zapomenuté heslo', desc: 'E-mail s unikátním jednorázovým odkazem na reset hesla.' },
    { id: 'reminder-sub', name: 'Upomínka: Jen předplatné', desc: 'E-mail odeslaný dlužícímu předplatiteli s čistým kontem zápasů.' },
    { id: 'reminder-match', name: 'Upomínka: Jen za zápasy', desc: 'E-mail odeslaný hráči co dluží na sekeře za odehrané zápasy.' },
    { id: 'reminder-both', name: 'Upomínka: Za oboje (Předplatitel se sekerou)', desc: 'E-mail odeslaný stálému členovi, který dluží jak sezónu, tak i dodatečné zápasy.' }
  ];
  
  const testEmail = async (templateId: string) => {
    setLoading(templateId);
    setResult(null);
    try {
      const res = await fetch('/api/admin/test-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: currentUser.email, templateId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ id: templateId, text: 'Zkušební šablona odeslána!', ok: true });
    } catch (err: any) {
      setResult({ id: templateId, text: 'Chyba: ' + err.message, ok: false });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-zinc-700/50">
        <h2 className="text-xl font-bold text-white mb-2">E-mailový Katalog Systému</h2>
        <p className="text-sm text-zinc-400">Zde najdeš výčet všech dynamických šablon v systému. Pomocí testování si každou z nich můžeš nechat poslat na svůj admin e-mail <strong>{currentUser.email}</strong> pro vizuální kontrolu.</p>
      </div>
      
      <div className="divide-y divide-zinc-700/50">
        {templates.map(tpl => (
           <div key={tpl.id} className="p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center hover:bg-zinc-800/30 transition-colors">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-white">{tpl.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <Check size={12} /> Aktivní
                    </span>
                 </div>
                 <p className="text-sm text-zinc-500">{tpl.desc}</p>
                 
                 {result?.id === tpl.id && (
                    <div className={cn("mt-3 text-sm font-medium", result.ok ? 'text-emerald-400' : 'text-red-400')}>
                       {result.ok ? '✅ ' : '❌ '}{result.text}
                    </div>
                 )}
              </div>
              
              <button 
                onClick={() => testEmail(tpl.id)}
                disabled={loading !== null}
                className="shrink-0 flex items-center gap-2 bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 text-white font-medium py-2 px-4 rounded-xl border border-zinc-700 transition-all disabled:opacity-50"
              >
                {loading === tpl.id 
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
                  : <Send size={16} />
                }
                Test na můj mail
              </button>
           </div>
        ))}
      </div>
    </div>
  );
}

export function AdminEditMatchModal({ match, onClose }: { match: Match, onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateLocal = formData.get('date') as string;
    const timeLocal = formData.get('time') as string;
    const deadlineDays = formData.get('deadlineDaysBefore') as string;
    const deadlineTime = formData.get('deadlineTime') as string;
    const capacityStr = formData.get('capacity') as string;
    const durationStr = formData.get('durationMinutes') as string;
    const titleStr = formData.get('title') as string;

    const dateObj = new Date(`${dateLocal}T${timeLocal}:00`);
    const matchDateIso = dateObj.toISOString();

    const [dlHours, dlMinutes] = deadlineTime.split(':').map(Number);
    const dlDateObj = new Date(dateObj.getTime());
    dlDateObj.setDate(dlDateObj.getDate() - Number(deadlineDays));
    dlDateObj.setHours(dlHours, dlMinutes, 0, 0);
    const deadlineIso = dlDateObj.toISOString();

    startTransition(() => {
      import('@/app/actions/admin').then((m) => {
        m.editMatch(match.id, titleStr || match.title || '', matchDateIso, Number(capacityStr || match.capacity), deadlineIso, Number(durationStr || match.durationMinutes || 90)).then(() => {
          onClose();
        });
      });
    });
  }

  // Pre-fill
  const md = new Date(match.date);
  const dld = new Date(match.deadline);

  // formatting yyyy-mm-dd format local timezone
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dYr = md.getFullYear();
  const dMo = pad(md.getMonth() + 1);
  const dDa = pad(md.getDate());
  const initialDateStr = `${dYr}-${dMo}-${dDa}`;
  const initialTimeStr = `${pad(md.getHours())}:${pad(md.getMinutes())}`;

  // calculate days between deadline and match
  // reset hours to midnight to compare just days
  const mdMidnight = new Date(md.getTime()); mdMidnight.setHours(0,0,0,0);
  const dlMidnight = new Date(dld.getTime()); dlMidnight.setHours(0,0,0,0);
  const diffTime = Math.abs(mdMidnight.getTime() - dlMidnight.getTime());
  const initialDeadlineDaysBefore = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const initialDeadlineTimeStr = `${pad(dld.getHours())}:${pad(dld.getMinutes())}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Pencil className="text-blue-500" size={18} /> Editace zápasu
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
           <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Popis (Název)</label>
              <input name="title" defaultValue={match.title || ''} type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Např. Přátelák, Nedělní hra..." />
           </div>

           <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Datum</label>
                <input name="date" required defaultValue={initialDateStr} type="date" className="w-full min-w-0 max-w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="w-24">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Čas</label>
                <input name="time" required defaultValue={initialTimeStr} type="time" className="w-full min-w-0 max-w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
           </div>

           <div className="flex gap-3">
             <div className="flex-1">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Max. kapacita v poli</label>
                <input name="capacity" defaultValue={match.capacity} type="number" min="1" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
             </div>
             <div className="flex-1">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Délka trvání (minuty)</label>
                <input name="durationMinutes" defaultValue={match.durationMinutes || 90} type="number" min="1" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
             </div>
           </div>

           <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Uzávěrka (Dní před termínem)</label>
              <div className="flex gap-2 items-center">
                 <input name="deadlineDaysBefore" required defaultValue={initialDeadlineDaysBefore} type="number" min="0" max="14" className="w-20 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-center" />
                 <span className="text-zinc-500 text-sm">dní před v</span>
                 <input name="deadlineTime" required defaultValue={initialDeadlineTimeStr} type="time" className="w-24 min-w-0 max-w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
           </div>

           <div className="pt-2">
             <button disabled={isPending} type="submit" className="w-full bg-blue-500 hover:bg-blue-600 font-bold text-white py-3 rounded-xl transition-colors">
                {isPending ? 'Ukládám...' : 'Uložit změny'}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
}




