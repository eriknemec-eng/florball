'use client';

import { useState } from 'react';
import { User } from '@/lib/db';
import { updateUserProfile } from '@/app/actions/auth';
import { changeUserPassword } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { UserRound, CircleDot, Mail, KeyRound, Lock, Bell, BellOff, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfileClient({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [position, setPosition] = useState<'player' | 'goalie' | 'versatile'>(user.position || 'player');
  const [emailNotifications, setEmailNotifications] = useState<boolean>(user.emailNotifications !== false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Heslo
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Křestní jméno musí mít alespoň 2 znaky');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateUserProfile(name, position, emailNotifications);
      setSuccess('Profil úspěšně aktualizován!');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError('Nepodařilo se uložit profil.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 5) {
      setPassError('Nové heslo musí mít alespoň 5 znaků.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPassError('Nová hesla se neshodují.');
      return;
    }
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');
    
    try {
      await changeUserPassword(oldPassword, newPassword);
      setPassSuccess('Heslo úspěšně změněno!');
      setOldPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err: any) {
      setPassError(err.message || 'Nepodařilo se změnit heslo.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-zinc-800/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">E-mailová adresa</label>
        <div className="relative">
           <input 
             type="email" 
             value={user.email}
             disabled
             className="w-full bg-zinc-900/50 border border-zinc-700/50 text-zinc-500 rounded-xl px-12 py-4 cursor-not-allowed font-medium"
           />
           <Mail className="absolute left-4 top-4 text-zinc-600" size={20} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tvé (křestní) Jméno</label>
        <div className="relative">
           <input 
             type="text" 
             value={name}
             onChange={(e) => setName(e.target.value)}
             className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-12 py-4 focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
             placeholder="Např. Erik"
             required
           />
           <UserRound className="absolute left-4 top-4 text-zinc-500" size={20} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Post na hřišti</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPosition('player')}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
              position === 'player' 
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" 
                : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
            )}
          >
            <CircleDot size={24} />
            <span className="font-bold">Hráč v poli</span>
          </button>
          
          <button
            type="button"
            onClick={() => setPosition('goalie')}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
              position === 'goalie' 
                ? "border-blue-500 bg-blue-500/10 text-blue-400" 
                : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
            )}
          >
            <CircleDot size={24} />
            <span className="font-bold">Brankář</span>
          </button>
          
          <button
            type="button"
            onClick={() => setPosition('versatile')}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
              position === 'versatile' 
                ? "border-purple-500 bg-purple-500/10 text-purple-400" 
                : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
            )}
          >
            <CircleDot size={24} />
            <span className="font-bold">Univerzál</span>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">E-mailové Notifikace</label>
        <button
          type="button"
          onClick={() => setEmailNotifications(!emailNotifications)}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
            emailNotifications
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-zinc-900 border-zinc-700 text-zinc-400 opacity-60"
          )}
        >
          <div className="flex items-center gap-3">
             <div className={cn("p-2 rounded-full", emailNotifications ? "bg-emerald-500/20" : "bg-zinc-800")}>
               {emailNotifications ? <Bell size={20} /> : <BellOff size={20} />}
             </div>
             <div className="text-left">
               <div className="font-bold">{emailNotifications ? 'Zapnuto' : 'Vypnuto'}</div>
             </div>
          </div>
          <div className={cn("w-10 h-6 rounded-full transition-colors relative", emailNotifications ? "bg-emerald-500" : "bg-zinc-700")}>
            <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm", emailNotifications ? "right-1" : "left-1")} />
          </div>
        </button>
        <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
          Pokud se domlouváme přes skupinový WhatsApp, nepotřebuješ, aby tě systém upozorňoval e-mailem ještě navíc. Pokud ale nechceš nic zmeškat, nech notifikace bez obav zapnuté.
        </p>
      </div>

      <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 rounded-xl font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          Zpět na palubovku
        </button>
        <button
          type="submit"
          disabled={loading || name.trim().length < 2}
          className="px-8 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          {loading ? 'Ukládám...' : 'Uložit profil'}
        </button>
      </div>
    </form>

    {/* Změna Hesla */}
    {user.passwordHash && (
      <form onSubmit={handlePasswordSubmit} className="bg-zinc-800/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock size={20} className="text-zinc-400" /> Změna hesla
          </h3>
          <p className="text-sm text-zinc-400 mt-1">Pokud ses registroval přes e-mail, můžeš si zde změnit heslo.</p>
        </div>

        {passError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-sm font-medium">
            {passError}
          </div>
        )}
        
        {passSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl text-sm font-medium">
            {passSuccess}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Současné heslo</label>
            <div className="relative">
               <input 
                 type={showOldPassword ? "text" : "password"} 
                 value={oldPassword}
                 onChange={(e) => setOldPassword(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl pl-12 pr-12 py-4 focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                 placeholder="••••••••"
                 required
               />
               <KeyRound className="absolute left-4 top-4 text-zinc-500" size={20} />
               <button
                 type="button"
                 onClick={() => setShowOldPassword(!showOldPassword)}
                 className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
               >
                 {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Nové heslo</label>
            <div className="relative">
               <input 
                 type={showNewPassword ? "text" : "password"} 
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl pl-12 pr-12 py-4 focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                 placeholder="Nové tajemství"
                 required
               />
               <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
               <button
                 type="button"
                 onClick={() => setShowNewPassword(!showNewPassword)}
                 className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
               >
                 {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Nové heslo znovu</label>
            <div className="relative">
               <input 
                 type={showNewPasswordConfirm ? "text" : "password"} 
                 value={newPasswordConfirm}
                 onChange={(e) => setNewPasswordConfirm(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl pl-12 pr-12 py-4 focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                 placeholder="Potvrzení nového hesla"
                 required
               />
               <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
               <button
                 type="button"
                 onClick={() => setShowNewPasswordConfirm(!showNewPasswordConfirm)}
                 className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
               >
                 {showNewPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Doporučujeme vymyslet heslo o délce min. 5 znaků.</p>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={passLoading || newPassword.length < 5 || !oldPassword || newPassword !== newPasswordConfirm}
            className="px-8 py-3 rounded-xl font-bold bg-zinc-700 hover:bg-zinc-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passLoading ? 'Zpracovávám...' : 'Změnit heslo'}
          </button>
        </div>
      </form>
    )}
    </div>
  );
}
