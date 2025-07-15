import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { agencyNavItems, type NavItem } from '@/config/navigation/agency-nav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: '/auth/login', locale: 'es' });
  }

  // Get user profile with agency
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, agency_id')
    .eq('id', user.id)
    .single();

  // Check if user belongs to an agency
  if (!profile?.agency_id) {
    redirect({ href: '/onboarding', locale: 'es' });
  }

  const userData = {
    name: profile?.full_name || user.email?.split('@')[0] || 'Agency User',
    email: user.email || '',
    image: profile?.avatar_url || undefined,
  };


  return (
    <DashboardLayout
      navItems={agencyNavItems}
      user={userData}
      header={
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Agency Dashboard</h1>
        </div>
      }
    >
      {children}
    </DashboardLayout>
  );
}