import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewOrderFlow } from '@/components/agency/orders/new/new-order-flow';

export default async function NewOrderPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Get user's agency
  const { data: agencyUser } = await supabase
    .from('agency_users')
    .select('agency_id')
    .eq('user_id', user.id)
    .single();

  if (!agencyUser) {
    redirect('/onboarding');
  }

  // Get agency's properties for selection
  const { data: properties } = await supabase
    .from('properties')
    .select('id, address, city, postal_code, type, images')
    .eq('agency_id', agencyUser.agency_id)
    .order('created_at', { ascending: false });

  // Get agency's customers
  const { data: customers } = await supabase
    .from('customers')
    .select('id, first_name, last_name, email, phone')
    .eq('agency_id', agencyUser.agency_id)
    .order('created_at', { ascending: false });

  // Get user's provider profile
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<div>Loading...</div>}>
        <NewOrderFlow 
          properties={properties || []}
          customers={customers || []}
          currentProvider={provider}
          agencyId={agencyUser.agency_id}
        />
      </Suspense>
    </div>
  );
}