import { Suspense } from 'react';
import { PropertiesHeader } from '@/components/agency/properties/properties-header';
import { PropertiesStats } from '@/components/agency/properties/properties-stats';
import { PropertiesGrid } from '@/components/agency/properties/properties-grid';
import { PropertiesFilters } from '@/components/agency/properties/properties-filters';
import { getProperties } from './actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

function PropertiesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse bg-muted/50 rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse bg-muted/50 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default async function PropertiesPage() {
  // Check authentication
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect({ href: '/auth/login', locale });
  }

  // Get properties data
  const properties = await getProperties();

  return (
    <div className="space-y-6">
      <PropertiesHeader />
      
      <Suspense fallback={<PropertiesSkeleton />}>
        <PropertiesStats properties={properties} />
        <PropertiesFilters />
        <PropertiesGrid properties={properties} />
      </Suspense>
    </div>
  );
}