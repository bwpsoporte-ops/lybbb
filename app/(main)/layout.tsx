import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Sidebar } from './sidebar';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.mustChangePassword) {
    redirect('/change-password');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={session} />
      <main className="flex-1 lg:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
