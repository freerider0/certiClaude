import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  Star
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface AssignmentStatsProps {
  providerId: string;
}

export async function AssignmentStats({ providerId }: AssignmentStatsProps) {
  const supabase = await createClient();
  
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Get all orders for this provider
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('provider_id', providerId);

  // Calculate stats
  const stats = {
    activeAssignments: 0,
    completedThisWeek: 0,
    completedThisMonth: 0,
    averageRating: 0,
    totalCompleted: 0,
    upcomingThisWeek: 0
  };

  if (orders) {
    orders.forEach(order => {
      // Active assignments
      if (['assigned', 'scheduled', 'in_progress'].includes(order.status)) {
        stats.activeAssignments++;
        
        // Upcoming this week
        if (order.scheduled_date) {
          const scheduledDate = new Date(order.scheduled_date);
          if (scheduledDate >= weekStart && scheduledDate <= weekEnd) {
            stats.upcomingThisWeek++;
          }
        }
      }

      // Completed orders
      if (order.status === 'completed' || order.status === 'delivered') {
        stats.totalCompleted++;
        
        if (order.completed_date) {
          const completedDate = new Date(order.completed_date);
          
          // This week
          if (completedDate >= weekStart && completedDate <= weekEnd) {
            stats.completedThisWeek++;
          }
          
          // This month
          if (completedDate >= monthStart && completedDate <= monthEnd) {
            stats.completedThisMonth++;
          }
        }
      }
    });

    // Calculate average rating
    const ratedOrders = orders.filter(o => o.rating !== null);
    if (ratedOrders.length > 0) {
      stats.averageRating = ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length;
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Active Assignments</span>
            </div>
            <span className="text-2xl font-bold">{stats.activeAssignments}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>This Week</span>
            </div>
            <span className="text-sm font-medium">{stats.upcomingThisWeek} upcoming</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span>Completed This Week</span>
            </div>
            <span className="text-sm font-medium">{stats.completedThisWeek}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>This Month</span>
            </div>
            <span className="text-sm font-medium">{stats.completedThisMonth} completed</span>
          </div>

          {stats.averageRating > 0 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Average Rating</span>
              </div>
              <span className="text-sm font-medium">
                {stats.averageRating.toFixed(1)} / 5.0
              </span>
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Total completed: {stats.totalCompleted} orders
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}