'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type OrderWithDetails, type OrderStatus } from '@/types/orders';

interface OrdersTableProps {
  orders: OrderWithDetails[];
  loading: boolean;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-800' },
  in_progress: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
  processing: { label: 'Processing', color: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export function OrdersTable({ orders, loading, onStatusUpdate }: OrdersTableProps) {
  const router = useRouter();

  const formatServiceName = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const status = statusConfig[order.status as OrderStatus];
            return (
              <TableRow 
                key={order.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/agency/orders/${order.id}`)}
              >
                <TableCell className="font-mono text-sm">
                  {order.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  {formatServiceName(order.service_type)}
                </TableCell>
                <TableCell>
                  {order.property ? (
                    <div>
                      <p className="font-medium text-sm">
                        {order.property.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.property.city}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {order.customer ? (
                    <div>
                      <p className="text-sm">
                        {order.customer.first_name} {order.customer.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer.email}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {order.scheduled_date ? (
                    <div>
                      <p className="text-sm">
                        {format(new Date(order.scheduled_date), 'PP')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.scheduled_date), 'p')}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not scheduled</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={cn(status.color)}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  €{order.total_price?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/agency/orders/${order.id}`);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      {order.status === 'pending' && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(order.id, 'assigned');
                          }}
                        >
                          Assign to me
                        </DropdownMenuItem>
                      )}
                      {order.status === 'scheduled' && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(order.id, 'in_progress');
                          }}
                        >
                          Start work
                        </DropdownMenuItem>
                      )}
                      {order.status === 'in_progress' && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(order.id, 'completed');
                          }}
                        >
                          Mark complete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}