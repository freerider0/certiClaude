'use client';

import { useRouter } from 'next/navigation';
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
  ChevronLeft, 
  MoreVertical, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type OrderWithDetails, type OrderStatus } from '@/types/orders';
import { updateOrderStatus } from '@/lib/orders/update-order';
import { toast } from 'sonner';

interface OrderHeaderProps {
  order: OrderWithDetails;
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

export function OrderHeader({ order }: OrderHeaderProps) {
  const router = useRouter();
  const status = statusConfig[order.status as OrderStatus];

  const formatServiceName = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      toast.success('Order status updated');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getNextStatus = (): OrderStatus | null => {
    const workflow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'assigned',
      assigned: 'scheduled',
      scheduled: 'in_progress',
      in_progress: 'completed',
      processing: 'completed',
      completed: 'delivered',
      delivered: null,
      cancelled: null,
    };
    return workflow[order.status as OrderStatus];
  };

  const nextStatus = getNextStatus();

  return (
    <div className="space-y-4">
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/agency/orders')}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {formatServiceName(order.service_type)}
            </h1>
            <p className="text-muted-foreground">
              Order #{order.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={cn("gap-1", status.color)}>
            <status.icon className="h-3 w-3" />
            {status.label}
          </Badge>

          {nextStatus && (
            <Button
              onClick={() => handleStatusUpdate(nextStatus)}
              className="cursor-pointer"
            >
              Mark as {statusConfig[nextStatus].label}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </DropdownMenuItem>
              {order.customer && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = `mailto:${order.customer.email}`;
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email Customer
                  </DropdownMenuItem>
                  {order.customer.phone && (
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = `tel:${order.customer.phone}`;
                      }}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call Customer
                    </DropdownMenuItem>
                  )}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleStatusUpdate('cancelled')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}