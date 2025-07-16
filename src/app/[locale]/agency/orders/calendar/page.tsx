import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrdersCalendarClient } from '@/components/agency/orders/calendar/orders-calendar-client';
import { CalendarHeader } from '@/components/agency/orders/calendar/calendar-header';

export default async function OrdersCalendarPage() {
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

  // Get user's provider profile (if any)
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CalendarHeader />
      
      <Suspense fallback={<div>Loading calendar...</div>}>
        <OrdersCalendarClient 
          agencyId={agencyUser.agency_id}
          providerId={provider?.id}
        />
      </Suspense>
    </div>
  );
}