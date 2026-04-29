"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, UserRound } from 'lucide-react';

export function DesktopNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center gap-6 mr-6">
      <Link 
        href="/dashboard" 
        className={`flex items-center gap-2 transition-colors ${pathname === '/dashboard' ? 'text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-300'}`}
      >
        <Home size={18} />
        <span className="text-sm">Domů</span>
      </Link>
      {isAdmin && (
        <Link 
          href="/admin" 
          className={`flex items-center gap-2 transition-colors ${pathname === '/admin' ? 'text-cyan-400 font-semibold' : 'text-zinc-400 hover:text-zinc-300'}`}
        >
          <Settings size={18} />
          <span className="text-sm">Admin</span>
        </Link>
      )}
    </nav>
  );
}

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 px-6 py-3 flex justify-around z-20 shadow-[-0_-10px_40px_rgba(0,0,0,0.5)]">
      <Link 
        href="/dashboard" 
        className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/dashboard' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-400'}`}
      >
        <Home size={24} className={pathname === '/dashboard' ? 'fill-emerald-400/20' : ''} />
        <span className={`text-[10px] uppercase tracking-wider ${pathname === '/dashboard' ? 'font-bold' : 'font-medium'}`}>Domů</span>
      </Link>
      <Link 
        href="/profile" 
        className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/profile' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-400'}`}
      >
        <UserRound size={24} className={pathname === '/profile' ? 'fill-emerald-400/20' : ''} />
        <span className={`text-[10px] uppercase tracking-wider ${pathname === '/profile' ? 'font-bold' : 'font-medium'}`}>Profil</span>
      </Link>
      {isAdmin && (
        <Link 
          href="/admin" 
          className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/admin' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <Settings size={24} className={pathname === '/admin' ? 'fill-cyan-400/20' : ''} />
          <span className={`text-[10px] uppercase tracking-wider ${pathname === '/admin' ? 'font-bold' : 'font-medium'}`}>Admin</span>
        </Link>
      )}
    </nav>
  );
}
