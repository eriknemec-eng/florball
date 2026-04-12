import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { ProfileClient } from './ProfileClient';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Můj Profil</h1>
        <p className="text-zinc-400">Nastavte si preferované jméno a post, pod kterým budete vystupovat a hrát.</p>
      </div>
      
      <ProfileClient user={user} />
    </div>
  );
}
