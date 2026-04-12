'use client';

import { useState } from 'react';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Něco se pokazilo');
      
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (message) {
      return (
          <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
            <div className="w-full max-w-sm bg-zinc-800/50 p-8 rounded-3xl border border-emerald-500/50 backdrop-blur-sm shadow-xl text-center">
               <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-4">E-mail odeslán</h2>
               <p className="text-zinc-300 text-sm mb-8 leading-relaxed">
                   Pokud účet s tímto e-mailem existuje, odeslali jsme na něj instrukce k obnovení hesla.
               </p>
               <Link href="/login" className="w-full inline-block bg-white hover:bg-gray-100 text-zinc-900 font-semibold py-3 px-4 rounded-xl transition-all">
                  Rozumím, zpět na Login
               </Link>
            </div>
          </div>
      )
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm bg-zinc-800/50 p-8 rounded-3xl border border-zinc-700/50 backdrop-blur-sm shadow-xl">
        <Link href="/login" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Zpět na přihlášení
        </Link>
        
        <h2 className="text-2xl font-bold text-white mb-2">Zapomenuté heslo?</h2>
        <p className="text-zinc-400 mb-8 text-sm">Zadejte svůj e-mail a my vám tam obratem pošleme tajný odkaz pro resetování hesla.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Váš e-mail" 
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-4 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Odeslat žádost'}
          </button>
        </form>
      </div>
    </div>
  );
}
