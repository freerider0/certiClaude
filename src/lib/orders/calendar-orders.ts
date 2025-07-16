'use client';

import { createClient } from '@/lib/supabase/client';
import { type OrderWithDetails } from '@/types/orders';

export async function getOrdersForCalendar(
  agencyId: string,
  startDate: Date,
  endDate: Date,
  providerId?: string
): Promise<OrderWithDetails[]> {
  const supabase = createClient();

  let query = supabase
    .from('orders')
    .select(`
      *,
      property:properties!orders_property_id_fkey (
        id,
        address,
        city,
        postal_code,
        type
      ),
      customer:customers!orders_customer_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      provider:providers!orders_provider_id_fkey (
        id,
        name,
        email
      ),
      service:services!orders_service_id_fkey (
        id,
        name,
        base_price
      )
    `)
    .eq('agency_id', agencyId)
    .gte('scheduled_date', startDate.toISOString())
    .lte('scheduled_date', endDate.toISOString())
    .not('status', 'eq', 'cancelled')
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time_slot', { ascending: true });

  // Filter by provider if specified
  if (providerId) {
    query = query.eq('provider_id', providerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching calendar orders:', error);
    throw error;
  }

  return data as OrderWithDetails[];
}