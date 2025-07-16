import { notFound } from 'next/navigation';
import { getPropertyById } from '../../actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { EditPropertyForm } from '@/components/agency/properties/edit/edit-property-form';

interface EditPropertyPageProps {
  params: {
    id: string;
  };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
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
      <EditPropertyForm property={property} />
    </div>
  );
}