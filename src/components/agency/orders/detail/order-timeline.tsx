'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  AlertCircle,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type OrderWithDetails, type OrderStatus } from '@/types/orders';

interface OrderTimelineProps {
  order: OrderWithDetails;
  statusHistory: Array<{
    id: string;
    old_status: OrderStatus | null;
    new_status: OrderStatus;
    notes?: string;
    created_at: string;
    changed_by: string;
  }>;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Order Created', color: 'text-yellow-600', icon: Package },
  assigned: { label: 'Provider Assigned', color: 'text-blue-600', icon: User },
  scheduled: { label: 'Service Scheduled', color: 'text-purple-600', icon: Calendar },
  in_progress: { label: 'Work Started', color: 'text-indigo-600', icon: Clock },
  processing: { label: 'Processing', color: 'text-orange-600', icon: Clock },
  completed: { label: 'Service Completed', color: 'text-green-600', icon: CheckCircle },
  delivered: { label: 'Delivered to Customer', color: 'text-emerald-600', icon: CheckCircle },
  cancelled: { label: 'Order Cancelled', color: 'text-red-600', icon: XCircle },
};

export function OrderTimeline({ order, statusHistory }: OrderTimelineProps) {
  // Build timeline from status history
  const timeline = [
    // Initial creation
    {
      id: 'created',
      status: 'pending' as OrderStatus,
      timestamp: order.created_at,
      notes: 'Order created',
    },
    // Status changes
    ...statusHistory.map(h => ({
      id: h.id,
      status: h.new_status,
      timestamp: h.created_at,
      notes: h.notes,
    })),
  ];

  // Sort by timestamp
  timeline.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {timeline.map((event, index) => {
            const config = statusConfig[event.status];
            const Icon = config.icon;
            const isLast = index === timeline.length - 1;
            
            return (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    isLast ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn("h-5 w-5", isLast ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{config.label}</h4>
                    {isLast && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getRelativeTime(event.timestamp)} • {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                  {event.notes && (
                    <p className="text-sm mt-2">{event.notes}</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show next expected status */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50">
                  <AlertCircle className="h-5 w-5 text-muted-foreground/50" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-muted-foreground">Next Step</h4>
                <p className="text-sm text-muted-foreground">
                  Waiting for status update...
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}