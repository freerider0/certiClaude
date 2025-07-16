'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Download } from 'lucide-react';

export function OrdersHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage service requests and track their progress
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/agency/orders/calendar')}
          className="cursor-pointer"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Calendar View
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // TODO: Implement export functionality
            alert('Export functionality coming soon!');
          }}
          className="cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button
          onClick={() => router.push('/agency/orders/new')}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>
    </div>
  );
}