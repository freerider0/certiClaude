import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrderDetailClient } from '@/components/agency/orders/detail/order-detail-client';

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const supabase = await createClient();
  
  // Fetch order with all relations
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      property:properties!orders_property_id_fkey (
        id,
        address,
        city,
        postal_code,
        province,
        type,
        size_m2,
        bedrooms,
        bathrooms,
        images
      ),
      customer:customers!orders_customer_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        postal_code
      ),
      provider:providers!orders_provider_id_fkey (
        id,
        name,
        email,
        phone,
        user_id
      ),
      service:services!orders_service_id_fkey (
        id,
        name,
        description,
        base_price
      ),
      documents:order_documents!order_documents_order_id_fkey (
        id,
        document_type,
        file_name,
        file_url,
        file_size,
        created_at,
        uploaded_by
      ),
      status_history:order_status_history!order_status_history_order_id_fkey (
        id,
        old_status,
        new_status,
        notes,
        created_at,
        changed_by
      ),
      communications:order_communications!order_communications_order_id_fkey (
        id,
        sender_id,
        recipient_id,
        message_type,
        subject,
        message,
        is_read,
        created_at
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}