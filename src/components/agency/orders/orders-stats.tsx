import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Euro,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { getOrderStats } from '@/lib/orders/stats';

export async function OrdersStats() {
  const stats = await getOrderStats();

  const cards = [
    {
      title: 'Active Orders',
      value: stats.active,
      description: 'Currently in progress',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending',
      value: stats.pending,
      description: 'Awaiting assignment',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      description: 'Finished services',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'This Week Revenue',
      value: `€${stats.weekRevenue.toLocaleString()}`,
      description: `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% vs last week`,
      icon: Euro,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: stats.revenueChange > 0 ? TrendingUp : undefined
    }
  ];

  // Add urgent orders card if any
  if (stats.urgent > 0) {
    cards.push({
      title: 'Urgent',
      value: stats.urgent,
      description: 'Due today or overdue',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {card.trend && <card.trend className="h-3 w-3" />}
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}