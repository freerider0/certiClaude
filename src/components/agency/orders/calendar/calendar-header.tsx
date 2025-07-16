'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, ListTodo } from 'lucide-react';

export function CalendarHeader() {
  const router = useRouter();

  return (
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
          <h1 className="text-2xl font-bold">Orders Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your service schedule
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/agency/orders/my-assignments')}
          className="cursor-pointer"
        >
          <ListTodo className="mr-2 h-4 w-4" />
          My Assignments
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