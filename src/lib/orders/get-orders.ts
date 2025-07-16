'use client';

import { createClient } from '@/lib/supabase/client';
import { type OrderFilters, type OrderWithDetails } from '@/types/orders';

export async function getOrders(filters: OrderFilters): Promise<OrderWithDetails[]> {
  const supabase = createClient();

  // Start building the query
  let query = supabase
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
      provider:providers!orders_provider_id_fkey (
        id,
        name,
        email,
        phone
      ),
      service:services!orders_service_id_fkey (
        id,
        name,
        base_price
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters.serviceType && filters.serviceType.length > 0) {
    query = query.in('service_type', filters.serviceType);
  }

  if (filters.providerId) {
    query = query.eq('provider_id', filters.providerId);
  }

  if (filters.propertyId) {
    query = query.eq('property_id', filters.propertyId);
  }

  if (filters.customerId) {
    query = query.eq('customer_id', filters.customerId);
  }

  if (filters.dateFrom) {
    query = query.gte('scheduled_date', filters.dateFrom.toISOString());
  }

  if (filters.dateTo) {
    query = query.lte('scheduled_date', filters.dateTo.toISOString());
  }

  if (filters.search) {
    // Search in order ID, property address, or customer name
    query = query.or(`id.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  // Additional client-side filtering for search (property and customer data)
  let filteredData = data || [];
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredData = filteredData.filter(order => {
      const propertyMatch = order.property?.address?.toLowerCase().includes(searchLower) ||
                          order.property?.city?.toLowerCase().includes(searchLower);
      const customerMatch = order.customer?.first_name?.toLowerCase().includes(searchLower) ||
                          order.customer?.last_name?.toLowerCase().includes(searchLower) ||
                          order.customer?.email?.toLowerCase().includes(searchLower);
      const idMatch = order.id.toLowerCase().includes(searchLower);
      
      return propertyMatch || customerMatch || idMatch;
    });
  }

  return filteredData as OrderWithDetails[];
}