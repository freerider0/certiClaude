import { createClient } from '@/lib/supabase/server';

interface DashboardStats {
  revenue: {
    value: number;
    trend: string;
    currency: string;
  };
  properties: {
    value: number;
    trend: string;
  };
  pendingOrders: {
    value: number;
    trend: string;
  };
  customers: {
    value: number;
    trend: string;
  };
}

interface EarningsChartData {
  month: string;
  total: number;
  paid: number;
  pending: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: any[];
  earningsChart: EarningsChartData[];
  agencyInfo: {
    id: string;
    role: string;
  };
}

export async function getAgencyDashboardData(userId?: string): Promise<DashboardData> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Unauthorized');
      }
      
      if (!user) {
        console.error('No user found in session');
        throw new Error('Unauthorized');
      }
      currentUserId = user.id;
    }

    // Get the agency ID from agency_users table
    const { data: agencyUser, error: agencyUserError } = await supabase
      .from('agency_users')
      .select('agency_id, role')
      .eq('user_id', currentUserId)
      .limit(1)
      .maybeSingle();

    if (agencyUserError || !agencyUser) {
      console.error('Agency user error:', agencyUserError);
      throw new Error('User is not associated with an agency');
    }

    const agencyId = agencyUser.agency_id;
    const userRole = agencyUser.role;

    // Fetch dashboard data in parallel
    const [
      revenueData,
      propertiesData,
      ordersData,
      customersData,
      recentOrdersData,
      earningsData
    ] = await Promise.all([
      // Total revenue this month
      supabase
        .from('agency_earnings')
        .select('amount')
        .eq('agency_id', agencyId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lte('created_at', new Date().toISOString()),

      // Active properties count
      supabase
        .from('properties')
        .select('id', { count: 'exact' })
        .eq('agency_id', agencyId)
        .eq('status', 'active'),

      // Orders data
      supabase
        .from('orders')
        .select('id, status')
        .eq('agency_id', agencyId),

      // Customers count
      supabase
        .from('customers')
        .select('id', { count: 'exact' })
        .eq('agency_id', agencyId),

      // Recent orders with details
      supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          service_type,
          total_amount,
          property:properties(address, city),
          customer:customers(name, email)
        `)
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false })
        .limit(5),

      // Earnings breakdown
      supabase
        .from('agency_earnings')
        .select('amount, status, created_at')
        .eq('agency_id', agencyId)
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString())
        .order('created_at', { ascending: true })
    ]);

    // Calculate statistics
    const currentMonthRevenue = revenueData.data?.reduce((sum, earning) => sum + earning.amount, 0) || 0;
    const activeProperties = propertiesData.count || 0;
    const pendingOrders = ordersData.data?.filter(order => order.status === 'pending').length || 0;
    const totalCustomers = customersData.count || 0;

    // Calculate trends (mock data for now - in production, compare with previous period)
    const revenueTrend = '+12%';
    const propertiesTrend = '+3';
    const ordersTrend = pendingOrders > 5 ? `+${pendingOrders - 5}` : `-${5 - pendingOrders}`;
    const customersTrend = '+8';

    // Process earnings for chart
    const earningsChart = processEarningsForChart(earningsData.data || []);

    return {
      stats: {
        revenue: {
          value: currentMonthRevenue,
          trend: revenueTrend,
          currency: '€'
        },
        properties: {
          value: activeProperties,
          trend: propertiesTrend
        },
        pendingOrders: {
          value: pendingOrders,
          trend: ordersTrend
        },
        customers: {
          value: totalCustomers,
          trend: customersTrend
        }
      },
      recentOrders: recentOrdersData.data || [],
      earningsChart,
      agencyInfo: {
        id: agencyId,
        role: userRole
      }
    };

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    
    // Log specific error details for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId: currentUserId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Return mock data for development with error indication
    return {
      stats: {
        revenue: { value: 0, trend: 'Error', currency: '€' },
        properties: { value: 0, trend: 'Error' },
        pendingOrders: { value: 0, trend: 'Error' },
        customers: { value: 0, trend: 'Error' }
      },
      recentOrders: [],
      earningsChart: [
        { month: 'Error', total: 0, paid: 0, pending: 0 }
      ],
      agencyInfo: { id: 'error', role: 'unknown' }
    };
  }
}

function processEarningsForChart(earnings: any[]): EarningsChartData[] {
  // Group earnings by month
  const monthlyEarnings = earnings.reduce((acc, earning) => {
    const month = new Date(earning.created_at).toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { total: 0, paid: 0, pending: 0 };
    }
    acc[month].total += earning.amount;
    if (earning.status === 'paid') {
      acc[month].paid += earning.amount;
    } else {
      acc[month].pending += earning.amount;
    }
    return acc;
  }, {} as Record<string, { total: number; paid: number; pending: number }>);

  // Convert to array format for charts
  return Object.entries(monthlyEarnings).map(([month, data]) => ({
    month,
    total: data.total,
    paid: data.paid,
    pending: data.pending
  }));
}