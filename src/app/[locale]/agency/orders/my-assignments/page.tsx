import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MyAssignmentsClient } from '@/components/agency/orders/my-assignments/my-assignments-client';
import { MyAssignmentsHeader } from '@/components/agency/orders/my-assignments/my-assignments-header';
import { TodaySchedule } from '@/components/agency/orders/my-assignments/today-schedule';
import { AssignmentStats } from '@/components/agency/orders/my-assignments/assignment-stats';

export default async function MyAssignmentsPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Get user's provider profile
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!provider) {
    // If no provider profile, redirect to orders
    redirect('/agency/orders');
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <MyAssignmentsHeader providerName={provider.name} />
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Suspense fallback={<div>Loading today's schedule...</div>}>
            <TodaySchedule providerId={provider.id} />
          </Suspense>
        </div>
        
        <div>
          <Suspense fallback={<div>Loading stats...</div>}>
            <AssignmentStats providerId={provider.id} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<div>Loading assignments...</div>}>
        <MyAssignmentsClient providerId={provider.id} />
      </Suspense>
    </div>
  );
}