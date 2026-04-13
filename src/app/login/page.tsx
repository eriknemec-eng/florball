'use client';

import { signIn } from 'next-auth/react';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // V této testovací fázi (bez samostatné "Registrace" obrazovky) 
    // předpokládáme manuální tvorbu hashe, což budeme řešit dalším commitem.
    // Prozatím tohle volá existující credentials provider
    await signIn('credentials', { email, password, callbackUrl: '/dashboard' });
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm bg-zinc-800/50 p-8 rounded-3xl border border-zinc-700/50 backdrop-blur-sm shadow-xl">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 mb-6">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-6">Vstup do kabiny</h2>

        <button 
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full bg-white hover:bg-gray-100 text-zinc-900 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Pokračovat s Google
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-zinc-700"></div>
          <span className="flex-shrink-0 mx-4 text-zinc-500 text-sm">nebo E-mailem a heslem</span>
          <div className="flex-grow border-t border-zinc-700"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail" 
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Heslo" 
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          
          <div className="flex justify-end mt-1">
             <Link href="/forgot-password" className="text-sm text-zinc-400 hover:text-emerald-400">
                Zapomenuté heslo?
             </Link>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95"
          >
            {loading ? 'Ověřování...' : 'Přihlásit se'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-700/50 flex flex-col items-center gap-3">
          <p className="text-zinc-300">Nemáš u nás účet?</p>
          <Link 
            href="/register" 
            className="w-full border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 text-center font-semibold py-3 px-4 rounded-xl transition-all"
          >
            Zaregistrovat (zabere to 3 minuty)
          </Link>
        </div>
      </div>
    </div>
  );
}
