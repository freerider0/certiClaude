import { Suspense } from 'react';
import { OrdersClient } from '@/components/agency/orders/orders-client';
import { OrdersHeader } from '@/components/agency/orders/orders-header';
import { OrdersStats } from '@/components/agency/orders/orders-stats';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <OrdersHeader />
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <OrdersStats />
      </Suspense>

      <Suspense fallback={<div>Loading orders...</div>}>
        <OrdersClient />
      </Suspense>
    </div>
  );
}