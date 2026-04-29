import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { getCurrentUser, logout } from "./actions/auth";
import { ProfileSetup } from "@/components/ProfileSetup";
import { DesktopNav, MobileNav } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "pondelniflorbalek.cz",
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
              pondelniflorbalek.cz
            </h1>
            {user && (
              <div className="flex items-center gap-4">
                {/* Desktop Menu - Hidden on mobile */}
                <DesktopNav isAdmin={user.role === 'admin'} />

                <div className="flex items-center gap-3 text-sm text-zinc-400 border-l border-zinc-700 pl-4">
                  <Link href="/profile" className="hidden sm:inline hover:text-emerald-400 transition-colors cursor-pointer" title="Nastavení profilu">
                    {user.name}
                  </Link>
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
          {user && <MobileNav isAdmin={user.role === 'admin'} />}

        </div>
      </body>
    </html>
  );
}
