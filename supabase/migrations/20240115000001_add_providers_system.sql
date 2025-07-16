-- Create providers table
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  services TEXT[] NOT NULL DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}',
  is_owner BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  working_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00"}',
  time_slot_duration INTEGER DEFAULT 60, -- in minutes
  max_daily_orders INTEGER DEFAULT 10,
  rating DECIMAL(3,2) DEFAULT 5.00,
  completed_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add provider-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id),
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_time_slot TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS completed_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS customer_feedback TEXT;

-- Create order documents table
CREATE TABLE IF NOT EXISTS order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('photo', 'certificate', 'floor_plan', 'report', 'invoice', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order status history table for tracking changes
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create provider availability table for complex scheduling
CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available_slots JSONB NOT NULL DEFAULT '[]', -- Array of time slots
  booked_slots JSONB NOT NULL DEFAULT '[]',
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, date)
);

-- Create order communications table
CREATE TABLE IF NOT EXISTS order_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  message_type TEXT NOT NULL CHECK (message_type IN ('internal', 'customer', 'provider', 'system')),
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_providers_agency_id ON providers(agency_id);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_services ON providers USING GIN(services);
CREATE INDEX idx_orders_provider_id ON orders(provider_id);
CREATE INDEX idx_orders_scheduled_date ON orders(scheduled_date);
CREATE INDEX idx_order_documents_order_id ON order_documents(order_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_provider_availability_date ON provider_availability(provider_id, date);
CREATE INDEX idx_order_communications_order_id ON order_communications(order_id);

-- Add RLS policies for providers
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers belong to agency" ON providers
  FOR ALL USING (
    agency_id IN (
      SELECT agency_id FROM agency_users 
      WHERE user_id = auth.uid()
    )
  );

-- Add RLS policies for order documents
ALTER TABLE order_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order documents belong to agency" ON order_documents
  FOR ALL USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE agency_id IN (
        SELECT agency_id FROM agency_users 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Add RLS policies for order status history
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order status history belongs to agency" ON order_status_history
  FOR ALL USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE agency_id IN (
        SELECT agency_id FROM agency_users 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Add RLS policies for provider availability
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provider availability belongs to agency" ON provider_availability
  FOR ALL USING (
    provider_id IN (
      SELECT id FROM providers 
      WHERE agency_id IN (
        SELECT agency_id FROM agency_users 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Add RLS policies for order communications
ALTER TABLE order_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order communications belong to agency" ON order_communications
  FOR ALL USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE agency_id IN (
        SELECT agency_id FROM agency_users 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create function to automatically create provider profile for agency owner
CREATE OR REPLACE FUNCTION create_owner_provider()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new agency is created, create a provider profile for the owner
  INSERT INTO providers (
    agency_id,
    user_id,
    name,
    email,
    is_owner,
    services
  )
  SELECT 
    NEW.agency_id,
    NEW.user_id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email),
    u.email,
    true,
    ARRAY['photography', 'cee_certificate', 'floor_plan', 'virtual_tour', 'videography']
  FROM auth.users u
  WHERE u.id = NEW.user_id
  AND NEW.role = 'owner';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create provider for agency owners
CREATE TRIGGER create_owner_provider_trigger
AFTER INSERT ON agency_users
FOR EACH ROW
EXECUTE FUNCTION create_owner_provider();

-- Update orders status enum if needed
DO $$ 
BEGIN
  -- Check if we need to add new statuses
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'assigned' 
    AND enumtypid = 'order_status'::regtype
  ) THEN
    ALTER TYPE order_status ADD VALUE 'assigned' AFTER 'pending';
    ALTER TYPE order_status ADD VALUE 'scheduled' AFTER 'assigned';
    ALTER TYPE order_status ADD VALUE 'in_progress' AFTER 'scheduled';
    ALTER TYPE order_status ADD VALUE 'delivered' AFTER 'completed';
  END IF;
END $$;