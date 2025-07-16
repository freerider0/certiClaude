'use client';

import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  type: 'status_change' | 'new_assignment' | 'reminder' | 'document_uploaded' | 'message';
  title: string;
  message: string;
  orderId: string;
  isRead: boolean;
  createdAt: string;
}

const notificationIcons = {
  status_change: CheckCircle,
  new_assignment: Calendar,
  reminder: Clock,
  document_uploaded: FileText,
  message: MessageSquare,
};

export function OrderNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_notifications', // You would need to create this table
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      // In a real implementation, you would fetch from a notifications table
      // For now, we'll use mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'new_assignment',
          title: 'New Photography Assignment',
          message: 'You have been assigned to a photography service at Carrer Major 123',
          orderId: 'order-123',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        },
        {
          id: '2',
          type: 'status_change',
          title: 'Order Completed',
          message: 'Energy Certificate for Rambla Catalunya 45 has been completed',
          orderId: 'order-124',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          type: 'reminder',
          title: 'Service Tomorrow',
          message: 'Reminder: Floor Plans service at Passeig de Gràcia 78 tomorrow at 10:00 AM',
          orderId: 'order-125',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    // Update notification as read
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    
    // In real implementation, update in database
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
    
    // In real implementation, update all in database
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setOpen(false);
    router.push(`/agency/orders/${notification.orderId}`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
              className="cursor-pointer text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No notifications yet
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-4 cursor-pointer",
                    !notification.isRead && "bg-muted/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    notification.type === 'new_assignment' && "bg-blue-100 text-blue-600",
                    notification.type === 'status_change' && "bg-green-100 text-green-600",
                    notification.type === 'reminder' && "bg-orange-100 text-orange-600",
                    notification.type === 'document_uploaded' && "bg-purple-100 text-purple-600",
                    notification.type === 'message' && "bg-pink-100 text-pink-600"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center cursor-pointer"
              onClick={() => {
                setOpen(false);
                router.push('/agency/notifications');
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}