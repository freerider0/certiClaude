'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Calendar, ListTodo } from 'lucide-react';

interface MyAssignmentsHeaderProps {
  providerName: string;
}

export function MyAssignmentsHeader({ providerName }: MyAssignmentsHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
        <p className="text-muted-foreground">
          Welcome back, {providerName}. Here are your service assignments.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/agency/orders')}
          className="cursor-pointer"
        >
          <ListTodo className="mr-2 h-4 w-4" />
          All Orders
        </Button>
        <Button
          onClick={() => router.push('/agency/orders/calendar')}
          className="cursor-pointer"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Calendar View
        </Button>
      </div>
    </div>
  );
}