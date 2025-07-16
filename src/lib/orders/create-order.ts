'use client';

import { createClient } from '@/lib/supabase/client';
import { type CreateOrderForm } from '@/types/orders';

interface CreateOrderData extends CreateOrderForm {
  agencyId: string;
  providerId?: string;
}

export async function createOrder(data: CreateOrderData) {
  const supabase = createClient();

  try {
    // Calculate price based on service and urgency
    const basePrice = getServicePrice(data.serviceType);
    const totalPrice = data.urgency === 'express' ? basePrice * 1.5 : basePrice;
    const agencyCommission = totalPrice * 0.2; // 20% commission

    // If new customer, create customer first
    let customerId = data.customerId;
    if (!customerId && data.customerFirstName && data.customerLastName && data.customerEmail) {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          agency_id: data.agencyId,
          first_name: data.customerFirstName,
          last_name: data.customerLastName,
          email: data.customerEmail,
          phone: data.customerPhone || null
        })
        .select()
        .single();

      if (customerError) throw customerError;
      customerId = newCustomer.id;
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        agency_id: data.agencyId,
        property_id: data.propertyId,
        customer_id: customerId,
        service_type: data.serviceType,
        status: data.providerId ? 'assigned' : 'pending',
        provider_id: data.providerId || null,
        scheduled_date: data.scheduledDate?.toISOString() || null,
        scheduled_time_slot: data.scheduledTimeSlot || null,
        duration_minutes: getServiceDuration(data.serviceType),
        total_price: totalPrice,
        agency_commission: agencyCommission,
        notes: data.notes || null
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create initial status history
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        new_status: order.status,
        notes: 'Order created'
      });

    if (historyError) {
      console.error('Failed to create status history:', historyError);
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create order' 
    };
  }
}

function getServicePrice(serviceType: string): number {
  const prices: Record<string, number> = {
    photography: 150,
    cee_certificate: 120,
    floor_plan: 80,
    virtual_tour: 200,
    videography: 250
  };
  return prices[serviceType] || 100;
}

function getServiceDuration(serviceType: string): number {
  const durations: Record<string, number> = {
    photography: 180, // 3 hours
    cee_certificate: 120, // 2 hours
    floor_plan: 120, // 2 hours
    virtual_tour: 240, // 4 hours
    videography: 240 // 4 hours
  };
  return durations[serviceType] || 120;
}