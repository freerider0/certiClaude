'use server';

import { getAgencyDashboardData } from '@/lib/agency/dashboard';
import { createClient } from '@/lib/supabase/server';

export async function getDashboardData() {
  // Verify authentication in the server action
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return await getAgencyDashboardData(user.id);
}