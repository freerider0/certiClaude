'use client';

import { createClient } from '@/lib/supabase/client';
import { type ProviderAvailability, type TimeSlot } from '@/types/orders';
import { format } from 'date-fns';

export async function getProviderAvailability(
  providerId: string, 
  date: Date
): Promise<ProviderAvailability> {
  const supabase = createClient();
  
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Get provider's working hours and settings
  const { data: provider } = await supabase
    .from('providers')
    .select('working_hours, working_days, time_slot_duration')
    .eq('id', providerId)
    .single();

  if (!provider) {
    throw new Error('Provider not found');
  }

  // Check if the selected day is a working day
  const dayName = format(date, 'EEEE').toLowerCase();
  const workingDays = provider.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  
  if (!workingDays.includes(dayName)) {
    return {
      date: dateStr,
      availableSlots: [],
      bookedSlots: []
    };
  }

  // Get existing bookings for this date
  const { data: bookings } = await supabase
    .from('orders')
    .select('scheduled_time_slot, duration_minutes')
    .eq('provider_id', providerId)
    .eq('scheduled_date', dateStr)
    .in('status', ['assigned', 'scheduled', 'in_progress']);

  // Generate time slots based on working hours
  const workingHours = provider.working_hours || { start: '09:00', end: '18:00' };
  const slotDuration = provider.time_slot_duration || 60; // minutes
  
  const slots: TimeSlot[] = [];
  const bookedSlots: string[] = [];
  
  // Parse working hours
  const [startHour, startMin] = workingHours.start.split(':').map(Number);
  const [endHour, endMin] = workingHours.end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  // Generate slots
  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Check if this slot is booked
    const isBooked = bookings?.some(booking => {
      if (!booking.scheduled_time_slot) return false;
      
      const [bookingHour, bookingMin] = booking.scheduled_time_slot.split(':').map(Number);
      const bookingStart = bookingHour * 60 + bookingMin;
      const bookingEnd = bookingStart + (booking.duration_minutes || 60);
      
      const slotEnd = minutes + slotDuration;
      
      // Check for overlap
      return (minutes < bookingEnd && slotEnd > bookingStart);
    }) || false;
    
    slots.push({
      time: timeStr,
      available: !isBooked
    });
    
    if (isBooked) {
      bookedSlots.push(timeStr);
    }
  }
  
  return {
    date: dateStr,
    availableSlots: slots,
    bookedSlots
  };
}