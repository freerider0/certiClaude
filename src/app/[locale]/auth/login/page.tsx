import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Sign In - CertiFast',
  description: 'Sign in to your CertiFast account',
};

export default async function LoginPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  
  // Check if user is already authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Check if user is an admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminUser) {
      redirect({ href: '/admin/dashboard', locale });
    }

    // Check if user has an agency
    const { data: agencyUser } = await supabase
      .from('agency_users')
      .select('agency_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (agencyUser?.agency_id) {
      redirect({ href: '/agency/dashboard', locale });
    } else {
      redirect({ href: '/onboarding', locale });
    }
  }

  return <LoginForm />;
}