'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Home, Package, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  currency?: string;
}

interface StatsCardsProps {
  stats: {
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
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations('agencyDashboard');

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statCards: StatCard[] = [
    {
      title: t('stats.revenue'),
      value: formatCurrency(stats.revenue.value, stats.revenue.currency),
      description: t('stats.thisMonth'),
      icon: DollarSign,
      trend: stats.revenue.trend
    },
    {
      title: t('stats.activeProperties'),
      value: stats.properties.value,
      description: t('stats.currentlyManaged'),
      icon: Home,
      trend: stats.properties.trend
    },
    {
      title: t('stats.pendingOrders'),
      value: stats.pendingOrders.value,
      description: t('stats.awaitingCompletion'),
      icon: Package,
      trend: stats.pendingOrders.trend
    },
    {
      title: t('stats.totalCustomers'),
      value: stats.customers.value,
      description: t('stats.activeClients'),
      icon: Users,
      trend: stats.customers.trend
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            {stat.trend && (
              <div className="flex items-center mt-2">
                {stat.trend.startsWith('+') ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <p className={`text-xs font-medium ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend} {t('stats.fromLastMonth')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}