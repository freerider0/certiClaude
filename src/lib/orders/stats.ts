import { createClient } from '@/lib/supabase/server';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export async function getOrderStats() {
  const supabase = await createClient();
  
  // Get current user's agency
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: agencyUser } = await supabase
    .from('agency_users')
    .select('agency_id')
    .eq('user_id', user.id)
    .single();

  if (!agencyUser) throw new Error('No agency found');

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  // Get all orders for the agency
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('agency_id', agencyUser.agency_id);

  // Calculate stats
  const stats = {
    active: 0,
    pending: 0,
    completedToday: 0,
    weekRevenue: 0,
    lastWeekRevenue: 0,
    revenueChange: 0,
    urgent: 0
  };

  if (orders) {
    orders.forEach(order => {
      // Active orders (in progress, scheduled, assigned)
      if (['assigned', 'scheduled', 'in_progress'].includes(order.status)) {
        stats.active++;
      }

      // Pending orders
      if (order.status === 'pending') {
        stats.pending++;
      }

      // Completed today
      if (order.status === 'completed' && order.completed_date) {
        const completedDate = new Date(order.completed_date);
        if (completedDate.toDateString() === now.toDateString()) {
          stats.completedToday++;
        }
      }

      // Week revenue
      if (order.created_at) {
        const orderDate = new Date(order.created_at);
        if (orderDate >= weekStart && orderDate <= weekEnd) {
          stats.weekRevenue += order.total_price || 0;
        }
        if (orderDate >= lastWeekStart && orderDate <= lastWeekEnd) {
          stats.lastWeekRevenue += order.total_price || 0;
        }
      }

      // Urgent orders (due today or overdue)
      if (order.scheduled_date && ['pending', 'assigned', 'scheduled'].includes(order.status)) {
        const dueDate = new Date(order.scheduled_date);
        if (dueDate <= now || dueDate.toDateString() === now.toDateString()) {
          stats.urgent++;
        }
      }
    });
  }

  // Calculate revenue change percentage
  if (stats.lastWeekRevenue > 0) {
    stats.revenueChange = Math.round(
      ((stats.weekRevenue - stats.lastWeekRevenue) / stats.lastWeekRevenue) * 100
    );
  } else if (stats.weekRevenue > 0) {
    stats.revenueChange = 100;
  }

  return stats;
}