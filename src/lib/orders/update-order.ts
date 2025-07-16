'use client';

import { createClient } from '@/lib/supabase/client';
import { type OrderStatus } from '@/types/orders';

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, notes?: string) {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Start a transaction by updating order and creating history entry
  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (orderError) throw orderError;

  // Create status history entry
  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert({
      order_id: orderId,
      new_status: newStatus,
      changed_by: user.id,
      notes
    });

  if (historyError) throw historyError;

  // If status is 'assigned' and no provider is set, assign to current user's provider profile
  if (newStatus === 'assigned') {
    // Get user's provider profile
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (provider) {
      await supabase
        .from('orders')
        .update({ provider_id: provider.id })
        .eq('id', orderId);
    }
  }

  // If status is 'completed', set completed_date
  if (newStatus === 'completed') {
    await supabase
      .from('orders')
      .update({ completed_date: new Date().toISOString() })
      .eq('id', orderId);
  }

  return { success: true };
}

export async function updateOrderDetails(orderId: string, updates: {
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  providerId?: string;
  notes?: string;
  internalNotes?: string;
}) {
  const supabase = createClient();
  
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (updates.scheduledDate) {
    updateData.scheduled_date = updates.scheduledDate.toISOString();
  }
  if (updates.scheduledTimeSlot !== undefined) {
    updateData.scheduled_time_slot = updates.scheduledTimeSlot;
  }
  if (updates.providerId !== undefined) {
    updateData.provider_id = updates.providerId;
  }
  if (updates.notes !== undefined) {
    updateData.notes = updates.notes;
  }
  if (updates.internalNotes !== undefined) {
    updateData.internal_notes = updates.internalNotes;
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) throw error;

  return { success: true };
}