'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    position: 'player',
    password: '',
    passwordConfirm: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.passwordConfirm) {
      setError('Hesla se neshodují.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Něco se pokazilo');
      
      // Úspěch - hned přesměrujeme ke standardnímu přihlášení
      router.push('/login?registered=true');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-zinc-800/50 p-8 rounded-3xl border border-zinc-700/50 backdrop-blur-sm shadow-xl">
        <Link href="/login" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Zpět na přihlášení
        </Link>

        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-6">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Nová Registrace</h2>
        <p className="text-zinc-400 mb-8 text-sm">Vytvořte si účet. Zabere to přesně 3 minuty.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2 font-semibold">Tvé Jméno</label>
            <input 
              type="text" 
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Např. Tomáš" 
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2 font-semibold">E-mail</label>
            <input 
              type="email" 
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              placeholder="tomas@email.cz" 
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2 font-semibold">Post na Hřišti</label>
            <select 
              value={form.position}
              onChange={(e) => setForm({...form, position: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
            >
              <option value="player">Hráč z pole</option>
              <option value="goalie">Brankář</option>
              <option value="versatile">Univerzál (Hraje / Chytá)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2 font-semibold">Heslo</label>
              <input 
                type="password" 
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                required
                minLength={6}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2 font-semibold">Znovu</label>
              <input 
                type="password" 
                value={form.passwordConfirm}
                onChange={(e) => setForm({...form, passwordConfirm: e.target.value})}
                required
                minLength={6}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 px-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Založit Účet'}
          </button>
        </form>
      </div>
    </div>
  );
}
