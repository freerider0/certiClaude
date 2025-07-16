import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { adminNavItems } from '@/config/navigation/admin-nav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is admin by querying admin_users table
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    // Check if user has an agency association
    const { data: agencyUser } = await supabase
      .from('agency_users')
      .select('agency_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (agencyUser?.agency_id) {
      redirect('/agency/dashboard');
    } else {
      redirect('/auth/login');
    }
  }

  const userData = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
    email: user.email || '',
    image: user.user_metadata?.avatar_url || undefined,
  };

  return (
    <DashboardLayout
      navItems={adminNavItems}
      user={userData}
      header={
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Admin Portal</h1>
        </div>
      }
    >
      {children}
    </DashboardLayout>
  );
}