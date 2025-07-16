import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { agencyNavItems } from '@/config/navigation/agency-nav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const locale = await getLocale();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: '/auth/login', locale });
  }

  // Check if user belongs to an agency
  const { data: agencyUser } = await supabase
    .from('agency_users')
    .select('agency_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  // Redirect to onboarding if user has no agency association
  if (!agencyUser?.agency_id) {
    console.log('User has no agency association');
    redirect({ href: '/onboarding', locale });
  }

  // Get user metadata from auth.users
  const userData = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agency User',
    email: user.email || '',
    image: user.user_metadata?.avatar_url || undefined,
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