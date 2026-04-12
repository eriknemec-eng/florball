import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { Home, Settings, LogOut, QrCode } from 'lucide-react';
import { getCurrentUser, logout } from "./actions/auth";
import { ProfileSetup } from "@/components/ProfileSetup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Floorball Attendance",
  description: "Správa docházky pro florbal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="cs">
      <body className={`${inter.className} bg-zinc-950 text-slate-50 min-h-screen`}>
        <div className="w-full max-w-5xl mx-auto bg-zinc-950 md:bg-zinc-900 min-h-screen md:shadow-2xl relative flex flex-col pb-20 md:pb-0">
          
          {/* Header */}
          <header className="px-6 py-5 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 flex justify-between items-center sticky top-0 z-20">
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Floorball
            </h1>
            {user && (
              <div className="flex items-center gap-4">
                {/* Desktop Menu - Hidden on mobile */}
                <nav className="hidden md:flex items-center gap-6 mr-6">
                  <Link href="/qr" className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors">
                    <QrCode size={18} />
                    <span className="text-sm font-medium uppercase font-bold tracking-wide">QR platba</span>
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors">
                    <Home size={18} />
                    <span className="text-sm font-medium">Domů</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors">
                      <Settings size={18} />
                      <span className="text-sm font-medium">Admin</span>
                    </Link>
                  )}
                </nav>

                <div className="flex items-center gap-3 text-sm text-zinc-400 border-l border-zinc-700 pl-4">
                  <span className="hidden sm:inline">{user.name}</span>
                  <form action={logout}>
                    <button type="submit" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                      <LogOut size={16} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </header>

          <main className="flex-1 p-4 md:p-8 space-y-6">
            {children}
          </main>

          {user && !user.position && <ProfileSetup />}

          {/* Mobile Bottom Navigation - Hidden on desktop */}
          {user && (
            <nav className="md:hidden fixed bottom-0 w-full bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 px-6 py-3 flex justify-around z-20 shadow-[-0_-10px_40px_rgba(0,0,0,0.5)]">
              <Link href="/qr" className="flex flex-col items-center gap-1 text-red-500 hover:text-red-400 transition-colors">
                <QrCode size={24} />
                <span className="text-[10px] font-bold uppercase tracking-wider">QR Platba</span>
              </Link>
              <Link href="/dashboard" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-emerald-400 transition-colors">
                <Home size={24} />
                <span className="text-[10px] font-medium uppercase tracking-wider">Domů</span>
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-cyan-400 transition-colors">
                  <Settings size={24} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Admin</span>
                </Link>
              )}
            </nav>
          )}

        </div>
      </body>
    </html>
  );
}
