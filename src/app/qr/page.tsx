import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { QrCode, Wallet, ArrowLeft } from 'lucide-react';
import { getDb } from '@/lib/db';
import Link from 'next/link';

export default async function QRPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const db = await getDb();
  const settings = db.settings || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 -ml-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-zinc-400" />
        </Link>
        <h2 className="text-2xl font-bold text-white">Platba příspěvků</h2>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-6 relative">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
            <Wallet className="w-8 h-8 text-red-500" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">QR platba</h3>
            {user.isSubscriber && !user.hasPaid ? (
              <p className="text-sm text-red-400 font-medium max-w-sm mx-auto bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                Očekávaná částka za sezónní předplatné je aktuálně <strong className="text-white">{settings.seasonFee || 500} Kč</strong>.
              </p>
            ) : (!user.isSubscriber && (user.debt || 0) > 0) ? (
              <p className="text-sm text-amber-400 font-medium max-w-sm mx-auto bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                Prosíme o úhradu sekery za odehrané zápasy v celkové hodnotě <strong className="text-white">{user.debt} Kč</strong>.
              </p>
            ) : (
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                Níže najdeš sdílený QR kód pro zaplacení florbalových příspěvků. Oskenuj ho bankovní aplikací (částku doplň ručně).
              </p>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border-4 border-zinc-200 w-64 h-64 flex flex-col items-center justify-center text-zinc-400 gap-2 shadow-inner overflow-hidden">
            {settings.qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.qrCodeUrl} alt="QR platba" className="w-full h-full object-contain" />
            ) : (
              <>
                <QrCode size={120} strokeWidth={1} className="text-zinc-300" />
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 text-center">QR kód nenastaven</span>
              </>
            )}
          </div>

          <div className="bg-zinc-950 p-5 rounded-2xl w-full border border-zinc-800 text-center space-y-2">
            <div className="text-sm text-zinc-500 mb-1">Číslo účtu k platbě:</div>
            <div className="font-mono text-xl font-bold text-white tracking-widest">
              {settings.qrBankAccount || '123456789/0000'}
            </div>
            <div className="text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-800/50 flex flex-col gap-1">
              <span>Nezapomeň k převodu jako &quot;Zprávu pro příjemce&quot; vždy uvést své jméno:</span>
              <strong className="text-white text-sm">{user.name}</strong>
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}
