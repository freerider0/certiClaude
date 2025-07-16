import { notFound } from 'next/navigation';
import { PropertyHeader } from '@/components/agency/properties/detail/property-header';
import { PropertyTabs } from '@/components/agency/properties/detail/property-tabs';
import { PropertyQuickActions } from '@/components/agency/properties/detail/property-quick-actions';
import { getPropertyById } from '../actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  // Check authentication
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect({ href: '/auth/login', locale });
  }

  // Get property data
  const property = await getPropertyById(params.id);
  
  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PropertyHeader property={property} />
      <PropertyTabs property={property} />
      <PropertyQuickActions property={property} />
    </div>
  );
}