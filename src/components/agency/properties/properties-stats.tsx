import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Eye, MessageSquare, Calendar } from 'lucide-react';
import type { Property } from '@/app/[locale]/agency/properties/actions';

interface PropertiesStatsProps {
  properties: Property[];
}

export function PropertiesStats({ properties }: PropertiesStatsProps) {
  // Calculate stats
  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    pending: properties.filter(p => p.status === 'pending').length,
    sold: properties.filter(p => p.status === 'sold' || p.status === 'rented').length,
    totalViews: properties.reduce((sum, p) => sum + p.view_count, 0),
    totalLeads: properties.reduce((sum, p) => sum + p.lead_count, 0),
    viewsToday: 234, // Mock data for now
    scheduledTours: 3 // Mock data for now
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="text-green-600">Active: {stats.active}</span>
            <span className="text-yellow-600">Pending: {stats.pending}</span>
            <span className="text-gray-600">Sold: {stats.sold}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalViews.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            +{stats.viewsToday} today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLeads}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalLeads > 0 ? '+20% from last week' : 'No new leads'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tours Today</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.scheduledTours}</div>
          <p className="text-xs text-muted-foreground">
            Next at 2:00 PM
          </p>
        </CardContent>
      </Card>
    </div>
  );
}