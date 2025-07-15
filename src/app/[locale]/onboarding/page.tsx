import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';

export default async function OnboardingPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Check if user already has an agency
  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single();

  // If user already has an agency, redirect to dashboard
  if (profile?.agency_id) {
    redirect('/dashboard');
  }

  return <OnboardingFlow userId={user.id} userEmail={user.email || ''} />;
}