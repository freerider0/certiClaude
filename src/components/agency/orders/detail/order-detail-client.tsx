'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderHeader } from './order-header';
import { OrderTimeline } from './order-timeline';
import { OrderInfo } from './order-info';
import { OrderDocuments } from './order-documents';
import { OrderCommunications } from './order-communications';
import { type OrderWithDetails } from '@/types/orders';

interface OrderDetailClientProps {
  order: OrderWithDetails & {
    status_history?: any[];
    communications?: any[];
  };
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <OrderHeader order={order} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="cursor-pointer">
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="cursor-pointer">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="documents" className="cursor-pointer">
            Documents {order.documents && order.documents.length > 0 && `(${order.documents.length})`}
          </TabsTrigger>
          <TabsTrigger value="communications" className="cursor-pointer">
            Messages {order.communications && order.communications.length > 0 && `(${order.communications.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OrderInfo order={order} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <OrderTimeline order={order} statusHistory={order.status_history || []} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <OrderDocuments order={order} documents={order.documents || []} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <OrderCommunications order={order} communications={order.communications || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}