'use client';

import { createClient } from '@/lib/supabase/client';
import { type OrderWithDetails } from '@/types/orders';

export async function getProviderOrders(providerId: string): Promise<OrderWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      property:properties!orders_property_id_fkey (
        id,
        address,
        city,
        postal_code,
        type,
        images
      ),
      customer:customers!orders_customer_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      service:services!orders_service_id_fkey (
        id,
        name,
        base_price
      ),
      documents:order_documents!order_documents_order_id_fkey (
        id,
        document_type,
        file_name,
        file_url
      )
    `)
    .eq('provider_id', providerId)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time_slot', { ascending: true });

  if (error) {
    console.error('Error fetching provider orders:', error);
    throw error;
  }

  return data as OrderWithDetails[];
}