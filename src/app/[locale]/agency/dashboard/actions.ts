'use server';

import { getAgencyDashboardData } from '@/lib/agency/dashboard';
import { createClient } from '@/lib/supabase/server';

export async function getDashboardData() {
  try {
    // Verify authentication in the server action
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Authentication error in dashboard action:', authError);
      throw new Error('Authentication failed');
    }
    
    if (!user) {
      console.error('No user found in dashboard action');
      throw new Error('Unauthorized');
    }
    
    console.log('Fetching dashboard data for user:', user.id);
    return await getAgencyDashboardData(user.id);
  } catch (error) {
    console.error('Dashboard action error:', error);
    throw error;
  }
}