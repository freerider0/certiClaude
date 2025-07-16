'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, MessageSquare, Calendar, Users } from 'lucide-react';
import type { Property } from '@/app/[locale]/agency/properties/actions';

interface PropertyAnalyticsTabProps {
  property: Property;
}

export function PropertyAnalyticsTab({ property }: PropertyAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.view_count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-600" /> +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.lead_count}</div>
            <p className="text-xs text-muted-foreground">
              {property.lead_count > 0 ? '2 new this week' : 'No new inquiries'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Tours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next: Tomorrow 2pm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.6%</div>
            <p className="text-xs text-muted-foreground">Views to inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
          <CardDescription>
            Where your property views are coming from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Idealista</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '45%' }} />
                </div>
                <span className="text-sm font-medium">45%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Direct Link</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '30%' }} />
                </div>
                <span className="text-sm font-medium">30%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Social Media</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '15%' }} />
                </div>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Google</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '10%' }} />
                </div>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}