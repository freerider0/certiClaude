'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  User,
  Calendar,
  Camera,
  FileText,
  Home,
  Video,
  Ruler
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type OrderWithDetails, type OrderStatus, type ServiceType } from '@/types/orders';

interface OrderCardProps {
  order: OrderWithDetails;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800', icon: User },
  scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-800', icon: Calendar },
  in_progress: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-800', icon: Clock },
  processing: { label: 'Processing', color: 'bg-orange-100 text-orange-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const serviceIcons: Record<ServiceType, any> = {
  photography: Camera,
  cee_certificate: FileText,
  floor_plan: Ruler,
  virtual_tour: Video,
  videography: Video,
};

export function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const router = useRouter();
  const status = statusConfig[order.status as OrderStatus];
  const ServiceIcon = serviceIcons[order.service_type as ServiceType] || Camera;

  const handleViewDetails = () => {
    router.push(`/agency/orders/${order.id}`);
  };

  const getUrgencyColor = () => {
    if (!order.scheduled_date) return '';
    const dueDate = new Date(order.scheduled_date);
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) return 'border-red-500 bg-red-50';
    if (hoursUntilDue < 24) return 'border-orange-500 bg-orange-50';
    return '';
  };

  const formatServiceName = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-shadow cursor-pointer",
        getUrgencyColor()
      )}
      onClick={handleViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted">
              <ServiceIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {formatServiceName(order.service_type)}
              </h3>
              <p className="text-xs text-muted-foreground">
                #{order.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {order.status === 'pending' && (
                <DropdownMenuItem onClick={() => onStatusUpdate(order.id, 'assigned')}>
                  <User className="mr-2 h-4 w-4" />
                  Assign to Me
                </DropdownMenuItem>
              )}
              {order.status === 'scheduled' && (
                <DropdownMenuItem onClick={() => onStatusUpdate(order.id, 'in_progress')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Start Work
                </DropdownMenuItem>
              )}
              {order.status === 'in_progress' && (
                <DropdownMenuItem onClick={() => onStatusUpdate(order.id, 'completed')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Property Info */}
        {order.property && (
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium leading-none">
                  {order.property.address}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.property.city}, {order.property.postal_code}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-6">
              <Home className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {order.property.type}
              </p>
            </div>
          </div>
        )}

        {/* Customer Info */}
        {order.customer && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">
              {order.customer.first_name} {order.customer.last_name}
            </p>
          </div>
        )}

        {/* Schedule Info */}
        {order.scheduled_date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">
              {format(new Date(order.scheduled_date), 'PPp')}
            </p>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2">
          <Badge className={cn("gap-1", status.color)}>
            <status.icon className="h-3 w-3" />
            {status.label}
          </Badge>
          {order.total_price && (
            <p className="text-sm font-semibold">
              €{order.total_price.toFixed(2)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}