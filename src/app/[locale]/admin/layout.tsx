import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { adminNavItems, type NavItem } from '@/config/navigation/admin-nav';
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

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single();

  // Check if user is admin
  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const userData = {
    name: profile?.full_name || user.email?.split('@')[0] || 'Admin',
    email: user.email || '',
    image: profile?.avatar_url || undefined,
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