import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Phone,
  CheckCircle
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface TodayScheduleProps {
  providerId: string;
}

export async function TodaySchedule({ providerId }: TodayScheduleProps) {
  const supabase = await createClient();
  
  // Get today's and tomorrow's assignments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const { data: assignments } = await supabase
    .from('orders')
    .select(`
      *,
      property:properties!orders_property_id_fkey (
        id,
        address,
        city,
        postal_code,
        latitude,
        longitude
      ),
      customer:customers!orders_customer_id_fkey (
        first_name,
        last_name,
        phone
      )
    `)
    .eq('provider_id', providerId)
    .gte('scheduled_date', today.toISOString())
    .lt('scheduled_date', dayAfter.toISOString())
    .in('status', ['assigned', 'scheduled', 'in_progress'])
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time_slot', { ascending: true });

  const todayAssignments = assignments?.filter(a => 
    isToday(new Date(a.scheduled_date))
  ) || [];
  
  const tomorrowAssignments = assignments?.filter(a => 
    isTomorrow(new Date(a.scheduled_date))
  ) || [];

  const formatServiceName = (type: string) => {
    return type.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openNavigation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Schedule
        </CardTitle>
        <CardDescription>
          {todayAssignments.length} service{todayAssignments.length !== 1 ? 's' : ''} scheduled for today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayAssignments.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No assignments scheduled for today
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {formatServiceName(assignment.service_type)}
                        </p>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{assignment.scheduled_time_slot}</span>
                      </div>
                    </div>
                    <Link href={`/agency/orders/${assignment.id}`}>
                      <Button size="sm" variant="outline" className="cursor-pointer">
                        View Details
                      </Button>
                    </Link>
                  </div>

                  {assignment.property && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{assignment.property.address}</p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.property.city}, {assignment.property.postal_code}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openNavigation(
                            `${assignment.property?.address}, ${assignment.property?.city}, ${assignment.property?.postal_code}`
                          )}
                          className="cursor-pointer"
                        >
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {assignment.customer && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Customer: {assignment.customer.first_name} {assignment.customer.last_name}
                      </span>
                      {assignment.customer.phone && (
                        <a
                          href={`tel:${assignment.customer.phone}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {assignment.customer.phone}
                        </a>
                      )}
                    </div>
                  )}

                  {assignment.notes && (
                    <div className="text-sm bg-muted p-2 rounded">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notes:</p>
                      <p>{assignment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tomorrowAssignments.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Tomorrow ({format(tomorrow, 'EEEE, MMM d')})
            </p>
            <div className="space-y-2">
              {tomorrowAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {assignment.scheduled_time_slot} - {formatServiceName(assignment.service_type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.property?.address}
                    </p>
                  </div>
                  <Link href={`/agency/orders/${assignment.id}`}>
                    <Button size="sm" variant="ghost" className="cursor-pointer">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}