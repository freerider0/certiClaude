// Base types from database
export interface Order {
  id: string;
  agency_id: string;
  property_id: string | null;
  customer_id: string | null;
  service_id: string | null;
  service_type: string;
  status: OrderStatus;
  provider_id?: string | null;
  scheduled_date?: string | null;
  scheduled_time_slot?: string | null;
  duration_minutes?: number | null;
  completed_date?: string | null;
  total_price: number;
  agency_commission?: number;
  notes?: string | null;
  internal_notes?: string | null;
  rating?: number | null;
  customer_feedback?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  agency_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string | null;
  services: string[];
  service_areas?: string[];
  is_owner: boolean;
  is_active: boolean;
  working_days?: string[];
  working_hours?: WorkingHours;
  time_slot_duration?: number;
  max_daily_orders?: number;
  rating?: number;
  completed_orders?: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDocument {
  id: string;
  order_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  file_size?: number | null;
  mime_type?: string | null;
  uploaded_by: string;
  is_public?: boolean;
  metadata?: any;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: string;
  notes?: string | null;
  created_at: string;
}

export interface OrderCommunication {
  id: string;
  order_id: string;
  sender_id: string;
  recipient_id?: string | null;
  message_type: MessageType;
  subject?: string | null;
  message: string;
  is_read?: boolean;
  created_at: string;
}

// Extended types with relations
export interface OrderWithDetails extends Order {
  property?: {
    id: string;
    address: string;
    city: string;
    postal_code: string;
    type: string;
    images?: string[];
  };
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  provider?: Provider;
  documents?: OrderDocument[];
  service?: {
    id: string;
    name: string;
    base_price: number;
  };
}

// Order status enum matching database
export type OrderStatus = 
  | 'pending'
  | 'assigned'
  | 'scheduled'
  | 'in_progress'
  | 'processing'
  | 'completed'
  | 'delivered'
  | 'cancelled';

// Service types
export type ServiceType = 
  | 'photography'
  | 'cee_certificate'
  | 'floor_plan'
  | 'virtual_tour'
  | 'videography';

// Document types
export type DocumentType = 
  | 'photo'
  | 'certificate'
  | 'floor_plan'
  | 'report'
  | 'invoice'
  | 'other';

// Message types
export type MessageType = 
  | 'internal'
  | 'customer'
  | 'provider'
  | 'system';

// Provider working hours
export interface WorkingHours {
  start: string; // "09:00"
  end: string;   // "18:00"
}

// Provider availability slot
export interface TimeSlot {
  time: string;      // "09:00"
  available: boolean;
  orderId?: string;  // If booked
}

export interface ProviderAvailability {
  date: string;
  availableSlots: TimeSlot[];
  bookedSlots: string[];
}

// Form types for creating/updating
export interface CreateOrderForm {
  propertyId: string;
  customerId?: string;
  serviceType: ServiceType;
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  notes?: string;
  urgency?: 'standard' | 'express';
  // Customer info if new
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface UpdateOrderForm {
  status?: OrderStatus;
  providerId?: string;
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  notes?: string;
  internalNotes?: string;
}

// Filter types
export interface OrderFilters {
  status?: OrderStatus[];
  serviceType?: ServiceType[];
  providerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  propertyId?: string;
  customerId?: string;
}

// Statistics types
export interface OrderStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completedToday: number;
  revenue: number;
  avgTurnaround: number;
}

export interface ProviderStats {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  rating: number;
  onTimeRate: number;
  revenue: number;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  orderId: string;
  serviceType: ServiceType;
  propertyAddress: string;
  status: OrderStatus;
  providerId?: string;
}

// Notification types
export interface OrderNotification {
  type: 'status_change' | 'new_assignment' | 'reminder' | 'document_uploaded' | 'message';
  orderId: string;
  title: string;
  message: string;
  recipientId: string;
  data?: Record<string, any>;
}