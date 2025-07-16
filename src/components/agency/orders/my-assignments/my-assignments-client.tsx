'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  FileText,
  Camera,
  Ruler,
  Video,
  Upload
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type OrderWithDetails, type ServiceType } from '@/types/orders';
import { getProviderOrders } from '@/lib/orders/provider-orders';
import { updateOrderStatus } from '@/lib/orders/update-order';
import { toast } from 'sonner';

interface MyAssignmentsClientProps {
  providerId: string;
}

const serviceIcons: Record<ServiceType, any> = {
  photography: Camera,
  cee_certificate: FileText,
  floor_plan: Ruler,
  virtual_tour: Video,
  videography: Video,
};

export function MyAssignmentsClient({ providerId }: MyAssignmentsClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadOrders();
  }, [providerId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getProviderOrders(providerId);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as any);
      toast.success('Status updated successfully');
      await loadOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const upcomingOrders = orders.filter(o => 
    ['assigned', 'scheduled'].includes(o.status)
  );

  const activeOrders = orders.filter(o => 
    o.status === 'in_progress'
  );

  const completedOrders = orders.filter(o => 
    ['completed', 'delivered'].includes(o.status)
  );

  const formatServiceName = (type: string) => {
    return type.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  const OrderCard = ({ order }: { order: OrderWithDetails }) => {
    const ServiceIcon = serviceIcons[order.service_type as ServiceType] || FileText;
    
    return (
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push(`/agency/orders/${order.id}`)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <ServiceIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{formatServiceName(order.service_type)}</h3>
                <p className="text-sm text-muted-foreground">
                  #{order.id.slice(0, 8)}
                </p>
              </div>
            </div>
            {order.scheduled_date && (
              <Badge variant="outline">
                {format(new Date(order.scheduled_date), 'MMM d')}
              </Badge>
            )}
          </div>

          {order.property && (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{order.property.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.property.city}, {order.property.postal_code}
                  </p>
                </div>
              </div>

              {order.scheduled_date && order.scheduled_time_slot && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {format(new Date(order.scheduled_date), 'EEEE')} at {order.scheduled_time_slot}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
            {order.status === 'scheduled' && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                className="cursor-pointer"
              >
                Start Work
              </Button>
            )}
            {order.status === 'in_progress' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(order.id, 'completed')}
                  className="cursor-pointer"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/agency/orders/${order.id}#documents`)}
                  className="cursor-pointer"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </>
            )}
            {order.status === 'completed' && !order.documents?.length && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/agency/orders/${order.id}#documents`)}
                className="cursor-pointer"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Assignments</CardTitle>
        <CardDescription>
          Manage your service assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming" className="cursor-pointer">
              Upcoming ({upcomingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="cursor-pointer">
              In Progress ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="cursor-pointer">
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : upcomingOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No upcoming assignments
              </p>
            ) : (
              <div className="grid gap-4">
                {upcomingOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4 mt-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : activeOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active assignments
              </p>
            ) : (
              <div className="grid gap-4">
                {activeOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : completedOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No completed assignments
              </p>
            ) : (
              <div className="grid gap-4">
                {completedOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}