'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Camera,
  Ruler,
  Video
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { type OrderWithDetails, type ServiceType } from '@/types/orders';
import { getOrdersForCalendar } from '@/lib/orders/calendar-orders';

interface OrdersCalendarClientProps {
  agencyId: string;
  providerId?: string;
}

interface CalendarOrder extends OrderWithDetails {
  color?: string;
}

const serviceConfig: Record<ServiceType, { icon: any; color: string }> = {
  photography: { icon: Camera, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  cee_certificate: { icon: FileText, color: 'bg-green-100 text-green-800 border-green-200' },
  floor_plan: { icon: Ruler, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  virtual_tour: { icon: Video, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  videography: { icon: Video, color: 'bg-pink-100 text-pink-800 border-pink-200' },
};

export function OrdersCalendarClient({ agencyId, providerId }: OrdersCalendarClientProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState<CalendarOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'my'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadOrders();
  }, [currentDate, view, providerId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      const data = await getOrdersForCalendar(
        agencyId,
        startDate,
        endDate,
        view === 'my' ? providerId : undefined
      );
      
      // Add colors based on service type
      const ordersWithColors = data.map(order => ({
        ...order,
        color: serviceConfig[order.service_type as ServiceType]?.color || 'bg-gray-100 text-gray-800'
      }));
      
      setOrders(ordersWithColors);
    } catch (error) {
      console.error('Error loading calendar orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getOrdersForDay = (date: Date) => {
    return orders.filter(order => {
      if (!order.scheduled_date) return false;
      return isSameDay(new Date(order.scheduled_date), date);
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatServiceName = (type: string) => {
    return type.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Calendar Grid */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl">
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                {providerId && (
                  <Select value={view} onValueChange={(v: 'all' | 'my') => setView(v)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="my">My Assignments</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="cursor-pointer"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {/* Week day headers */}
              {weekDays.map(day => (
                <div
                  key={day}
                  className="bg-background p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const dayOrders = getOrdersForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelectedDay = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "bg-background min-h-[100px] p-2 cursor-pointer transition-colors",
                      !isCurrentMonth && "text-muted-foreground bg-muted/30",
                      isSelectedDay && "ring-2 ring-primary",
                      isTodayDate && "bg-primary/5"
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        isTodayDate && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {dayOrders.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayOrders.length}
                        </Badge>
                      )}
                    </div>
                    
                    {dayOrders.length > 0 && (
                      <div className="space-y-1">
                        {dayOrders.slice(0, 3).map((order) => {
                          const ServiceIcon = serviceConfig[order.service_type as ServiceType]?.icon || FileText;
                          return (
                            <div
                              key={order.id}
                              className={cn(
                                "text-xs p-1 rounded border flex items-center gap-1 truncate",
                                order.color
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/agency/orders/${order.id}`);
                              }}
                            >
                              <ServiceIcon className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {order.scheduled_time_slot}
                              </span>
                            </div>
                          );
                        })}
                        {dayOrders.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{dayOrders.length - 3} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Details Sidebar */}
      <div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a day'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <ScrollArea className="h-[500px] pr-4">
                {getOrdersForDay(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No orders scheduled
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 cursor-pointer"
                      onClick={() => router.push('/agency/orders/new')}
                    >
                      Schedule Order
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getOrdersForDay(selectedDate).map((order) => {
                      const ServiceIcon = serviceConfig[order.service_type as ServiceType]?.icon || FileText;
                      
                      return (
                        <Card
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => router.push(`/agency/orders/${order.id}`)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2 mb-2">
                              <div className={cn(
                                "p-1.5 rounded",
                                order.color?.replace('text-', 'bg-').replace('-800', '-100')
                              )}>
                                <ServiceIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {formatServiceName(order.service_type)}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {order.scheduled_time_slot}
                                </div>
                              </div>
                            </div>
                            
                            {order.property && (
                              <div className="space-y-2 text-xs">
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                                  <span className="flex-1">
                                    {order.property.address}, {order.property.city}
                                  </span>
                                </div>
                                
                                {order.provider && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <span>{order.provider.name}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <Badge 
                              variant="outline" 
                              className="text-xs mt-2"
                            >
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Click on a day to view orders
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}