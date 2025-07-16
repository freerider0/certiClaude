'use client';

import { useState, useEffect } from 'react';
import { OrdersFilters } from './orders-filters';
import { OrdersList } from './orders-list';
import { OrdersTable } from './orders-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Table } from 'lucide-react';
import { type OrderFilters, type OrderWithDetails } from '@/types/orders';
import { getOrders } from '@/lib/orders/get-orders';

export function OrdersClient() {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>({});

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders(filters);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // Update order status
    await loadOrders(); // Reload orders after update
  };

  return (
    <div className="space-y-4">
      <OrdersFilters onFilterChange={handleFilterChange} />

      <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'table')}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="grid" className="cursor-pointer">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table" className="cursor-pointer">
              <Table className="mr-2 h-4 w-4" />
              Table
            </TabsTrigger>
          </TabsList>
          <p className="text-sm text-muted-foreground">
            {orders.length} orders found
          </p>
        </div>

        <TabsContent value="grid" className="mt-4">
          <OrdersList 
            orders={orders} 
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <OrdersTable 
            orders={orders} 
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}