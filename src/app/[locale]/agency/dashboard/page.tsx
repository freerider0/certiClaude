import { StatsCards } from '@/components/agency/dashboard/stats-cards';
import { RecentOrders } from '@/components/agency/dashboard/recent-orders';
import { EarningsChart } from '@/components/agency/dashboard/earnings-chart';
import { CommissionOverview } from '@/components/agency/dashboard/commission-overview';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { getDashboardData } from './actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted/50" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 h-96 animate-pulse bg-muted/50" />
        <Card className="h-96 animate-pulse bg-muted/50" />
      </div>
    </div>
  );
}

export default async function AgencyDashboardPage() {
  try {
    const data = await getDashboardData();

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agency Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your agency&apos;s performance.
          </p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <StatsCards stats={data.stats} />
          
          <div className="grid gap-4 lg:grid-cols-3">
            <EarningsChart data={data.earningsChart} />
            <CommissionOverview agencyId={data.agencyInfo.id} />
          </div>

          <RecentOrders orders={data.recentOrders} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Dashboard page error:', error);
    throw error; // Let Next.js error boundary handle it
  }
}