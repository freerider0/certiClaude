'use client';

import { OrderCard } from './order-card';
import { Skeleton } from '@/components/ui/skeleton';
import { type OrderWithDetails } from '@/types/orders';

interface OrdersListProps {
  orders: OrderWithDetails[];
  loading: boolean;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
}

export function OrdersList({ orders, loading, onStatusUpdate }: OrdersListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[250px]" />
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onStatusUpdate={onStatusUpdate}
        />
      ))}
    </div>
  );
}