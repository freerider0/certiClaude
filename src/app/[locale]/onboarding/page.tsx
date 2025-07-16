import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

type OnboardingStep = 'choose' | 'create-agency' | 'join-agency';

interface OnboardingPageProps {
  searchParams: {
    step?: string;
  };
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const locale = await getLocale();
    redirect({ href: '/auth/login', locale });
  }

  // Check if user already has an agency
  const { data: agencyUser } = await supabase
    .from('agency_users')
    .select('agency_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  // If user already has an agency, redirect to agency dashboard
  if (agencyUser?.agency_id) {
    const locale = await getLocale();
    redirect({ href: '/agency/dashboard', locale });
  }

  // Get current step from URL params, default to 'choose'
  const step = (searchParams.step as OnboardingStep) || 'choose';
  
  return <OnboardingFlow userId={user?.id || ''} userEmail={user?.email || ''} step={step} />;
}