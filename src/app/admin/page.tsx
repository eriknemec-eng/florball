import { getCurrentUser } from '../actions/auth';
import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AdminUsersTable, AdminNewsForm, AdminMatchesTable, AdminNewsTable, AdminTabs, AdminTemplatesBox, AdminCustomMatchForm, AdminNewTemplateForm, AdminSettingsForm, AdminFinanceBox, AdminEmails, AdminMatchesSection } from '@/components/AdminClient';
import { ShieldAlert } from 'lucide-react';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  const db = await getDb();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <section className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-500">
        <ShieldAlert size={20} className="shrink-0" />
        <div className="text-sm">
          <p className="font-bold mb-1">Administrátorský přístup</p>
          <p className="text-amber-500/80">Provedené změny se okamžitě projevují všem uživatelům.</p>
        </div>
      </section>

      <AdminTabs 
        matchesSection={
          <AdminMatchesSection matches={db.matches} templates={db.templates} users={db.users} whatsappLink={db.settings?.whatsappLink} />
        }
        usersSection={
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Registrovaní hráči ({db.users.length})</h3>
            <AdminUsersTable users={db.users} currentUser={user} />
          </section>
        }
        newsSection={
          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Napsat a Vydat</h3>
              <AdminNewsForm />
            </section>
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Vydané zprávy a stálé Info</h3>
              <AdminNewsTable news={db.news} />
            </section>
          </div>
        }
        settingsSection={
          <section className="space-y-4 max-w-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Globální nastavení</h3>
            <AdminSettingsForm defaultSettings={db.settings} />
          </section>
        }
        financeSection={
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Finance & Dlužníci</h3>
            <AdminFinanceBox users={db.users} whatsappLink={db.settings?.whatsappLink} />
          </section>
        }
        emailsSection={
          <section className="space-y-4">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Odesílač</h3>
             <AdminEmails currentUser={user} />
          </section>
        }
      />

    </div>
  );
}
