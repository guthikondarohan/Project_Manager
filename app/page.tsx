import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/auth';
import DashboardClient from '@/components/DashboardClient';

export default async function Dashboard() {
  const user = await getUserFromCookies();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <main>
      <DashboardClient user={user} />
    </main>
  );
}
