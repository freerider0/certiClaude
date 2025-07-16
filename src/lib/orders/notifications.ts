import { createClient } from '@/lib/supabase/server';
import { type OrderNotification, type OrderStatus } from '@/types/orders';

interface NotificationData {
  orderId: string;
  orderNumber: string;
  serviceName: string;
  propertyAddress: string;
  scheduledDate?: string;
  scheduledTime?: string;
  customerName?: string;
  customerEmail?: string;
  providerName?: string;
  newStatus?: OrderStatus;
  documentType?: string;
}

export async function createOrderNotification(
  type: OrderNotification['type'],
  data: NotificationData
) {
  const supabase = await createClient();
  
  // Generate notification title and message based on type
  let title = '';
  let message = '';
  
  switch (type) {
    case 'status_change':
      title = `Order Status Updated`;
      message = `Order #${data.orderNumber} for ${data.serviceName} at ${data.propertyAddress} is now ${data.newStatus?.replace('_', ' ')}.`;
      break;
      
    case 'new_assignment':
      title = `New Service Assignment`;
      message = `You have been assigned to ${data.serviceName} at ${data.propertyAddress} on ${data.scheduledDate} at ${data.scheduledTime}.`;
      break;
      
    case 'reminder':
      title = `Service Reminder`;
      message = `Reminder: ${data.serviceName} scheduled at ${data.propertyAddress} tomorrow at ${data.scheduledTime}.`;
      break;
      
    case 'document_uploaded':
      title = `Document Uploaded`;
      message = `A new ${data.documentType} has been uploaded for order #${data.orderNumber}.`;
      break;
      
    case 'message':
      title = `New Message`;
      message = `You have a new message regarding order #${data.orderNumber}.`;
      break;
  }
  
  // Store notification in database (if you have a notifications table)
  // For now, we'll just return the notification object
  const notification: OrderNotification = {
    type,
    orderId: data.orderId,
    title,
    message,
    recipientId: '', // This would be determined based on the notification type
    data
  };
  
  // In a real implementation, you would:
  // 1. Store the notification in a notifications table
  // 2. Send email notification if enabled
  // 3. Send push notification if enabled
  // 4. Update in-app notification badge
  
  return notification;
}

export async function sendStatusChangeNotifications(
  orderId: string,
  oldStatus: OrderStatus,
  newStatus: OrderStatus
) {
  const supabase = await createClient();
  
  // Get order details
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      property:properties!orders_property_id_fkey (
        address,
        city
      ),
      customer:customers!orders_customer_id_fkey (
        first_name,
        last_name,
        email
      ),
      provider:providers!orders_provider_id_fkey (
        name,
        email,
        user_id
      ),
      service:services!orders_service_id_fkey (
        name
      )
    `)
    .eq('id', orderId)
    .single();
    
  if (!order) return;
  
  const notificationData: NotificationData = {
    orderId: order.id,
    orderNumber: order.id.slice(0, 8),
    serviceName: order.service?.name || order.service_type,
    propertyAddress: `${order.property?.address}, ${order.property?.city}`,
    scheduledDate: order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString() : undefined,
    scheduledTime: order.scheduled_time_slot,
    customerName: order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : undefined,
    customerEmail: order.customer?.email,
    providerName: order.provider?.name,
    newStatus
  };
  
  // Send notifications based on status change
  const notifications: OrderNotification[] = [];
  
  // Notify customer
  if (order.customer?.email) {
    const customerNotification = await createOrderNotification('status_change', notificationData);
    notifications.push(customerNotification);
    
    // Send email (implement email service)
    // await sendEmail(order.customer.email, customerNotification.title, customerNotification.message);
  }
  
  // Notify provider for new assignments
  if (newStatus === 'assigned' && order.provider?.user_id) {
    const providerNotification = await createOrderNotification('new_assignment', notificationData);
    notifications.push(providerNotification);
    
    // Send email to provider
    // await sendEmail(order.provider.email, providerNotification.title, providerNotification.message);
  }
  
  return notifications;
}

export async function sendReminderNotifications() {
  const supabase = await createClient();
  
  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  
  // Get all orders scheduled for tomorrow
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      property:properties!orders_property_id_fkey (
        address,
        city
      ),
      provider:providers!orders_provider_id_fkey (
        name,
        email,
        user_id
      ),
      customer:customers!orders_customer_id_fkey (
        first_name,
        last_name,
        email
      ),
      service:services!orders_service_id_fkey (
        name
      )
    `)
    .gte('scheduled_date', tomorrow.toISOString())
    .lt('scheduled_date', dayAfter.toISOString())
    .in('status', ['assigned', 'scheduled']);
    
  if (!orders) return;
  
  const notifications: OrderNotification[] = [];
  
  for (const order of orders) {
    const notificationData: NotificationData = {
      orderId: order.id,
      orderNumber: order.id.slice(0, 8),
      serviceName: order.service?.name || order.service_type,
      propertyAddress: `${order.property?.address}, ${order.property?.city}`,
      scheduledDate: new Date(order.scheduled_date).toLocaleDateString(),
      scheduledTime: order.scheduled_time_slot,
      providerName: order.provider?.name
    };
    
    // Send reminder to provider
    if (order.provider?.user_id) {
      const providerReminder = await createOrderNotification('reminder', notificationData);
      notifications.push(providerReminder);
    }
    
    // Send reminder to customer
    if (order.customer?.email) {
      const customerReminder = await createOrderNotification('reminder', notificationData);
      notifications.push(customerReminder);
    }
  }
  
  return notifications;
}

// This function would be called from a cron job or scheduled function
export async function processScheduledNotifications() {
  // Send reminder notifications for tomorrow's orders
  await sendReminderNotifications();
  
  // Check for overdue orders and send alerts
  // await sendOverdueNotifications();
  
  // Other scheduled notification tasks...
}