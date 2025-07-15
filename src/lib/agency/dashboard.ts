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

    // Get the agency ID for the current user
    const { data: agencyUser, error: agencyError } = await supabase
      .from('agency_users')
      .select('agency_id, role')
      .eq('user_id', currentUserId)
      .single();

    if (agencyError || !agencyUser) {
      throw new Error('Agency not found');
    }

    const agencyId = agencyUser.agency_id;

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
        role: agencyUser.role
      }
    };

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    
    // Return mock data for development
    return {
      stats: {
        revenue: { value: 12345, trend: '+12%', currency: '€' },
        properties: { value: 24, trend: '+3' },
        pendingOrders: { value: 7, trend: '-2' },
        customers: { value: 156, trend: '+8' }
      },
      recentOrders: [],
      earningsChart: [
        { month: 'Jan', total: 2400, paid: 1800, pending: 600 },
        { month: 'Feb', total: 3200, paid: 2400, pending: 800 },
        { month: 'Mar', total: 2800, paid: 2100, pending: 700 },
        { month: 'Apr', total: 3600, paid: 2700, pending: 900 },
        { month: 'May', total: 3100, paid: 2300, pending: 800 },
        { month: 'Jun', total: 4200, paid: 3150, pending: 1050 }
      ],
      agencyInfo: { id: '1', role: 'agency_owner' }
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