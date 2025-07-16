import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, DollarSign, Package, TrendingUp, Users, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations('adminDashboard');

  const stats = [
    {
      title: 'Total Revenue',
      value: '€234,567',
      description: 'Platform total this month',
      icon: DollarSign,
      trend: '+18%',
      breakdown: {
        saas: '€45,000',
        services: '€189,567'
      }
    },
    {
      title: 'Active Agencies',
      value: '42',
      description: 'Partner agencies',
      icon: Building2,
      trend: '+5'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      description: 'This month',
      icon: Package,
      trend: '+24%'
    },
    {
      title: 'Platform Users',
      value: '3,456',
      description: 'All user types',
      icon: Users,
      trend: '+127'
    },
    {
      title: 'Conversion Rate',
      value: '68%',
      description: 'Order completion',
      icon: TrendingUp,
      trend: '+3.2%'
    },
    {
      title: 'System Health',
      value: '99.9%',
      description: 'Uptime this month',
      icon: Activity,
      trend: 'Stable'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Complete overview of your SaaS platform performance and operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
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
                <p className={`text-xs mt-1 ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 
                  stat.trend === 'Stable' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {stat.trend} from last month
                </p>
              )}
              {stat.breakdown && (
                <div className="mt-2 pt-2 border-t space-y-1">
                  <p className="text-xs">SaaS: {stat.breakdown.saas}</p>
                  <p className="text-xs">Services: {stat.breakdown.services}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Platform notifications and issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <p className="text-sm">All systems operational</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <p className="text-sm">3 agencies pending verification</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Agencies</CardTitle>
            <CardDescription>By revenue generated this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Barcelona Properties</span>
                <span className="text-sm font-medium">€23,456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Madrid Homes</span>
                <span className="text-sm font-medium">€19,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Valencia Real Estate</span>
                <span className="text-sm font-medium">€17,890</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Admin Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <button className="p-3 text-left hover:bg-accent rounded-md">
            Review Pending Agencies
          </button>
          <button className="p-3 text-left hover:bg-accent rounded-md">
            Process Commission Payouts
          </button>
          <button className="p-3 text-left hover:bg-accent rounded-md">
            View Financial Reports
          </button>
          <button className="p-3 text-left hover:bg-accent rounded-md">
            Manage Service Catalog
          </button>
          <button className="p-3 text-left hover:bg-accent rounded-md">
            System Configuration
          </button>
          <button className="p-3 text-left hover:bg-accent rounded-md">
            View Platform Analytics
          </button>
        </CardContent>
      </Card>
    </div>
  );
}