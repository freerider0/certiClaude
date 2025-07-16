import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { AddPropertyFlow } from '@/components/agency/properties/add/add-property-flow';

export default async function AddPropertyPage() {
  // Check authentication
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect({ href: '/auth/login', locale });
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <AddPropertyFlow />
    </div>
  );
}