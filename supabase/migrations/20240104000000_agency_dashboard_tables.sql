-- Add service types enum
create type service_type as enum ('cee_certificate', 'photography', 'videography', 'virtual_tour', 'floor_plan');

-- Add commission status enum
create type commission_status as enum ('pending', 'processing', 'paid');

-- Create agency_users table to link users to agencies
create table if not exists public.agency_users (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  role text not null check (role in ('owner', 'admin', 'staff')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, agency_id)
);

-- Create customers table for end customers
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  name text not null,
  email text not null,
  phone text,
  address jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, email)
);

-- Create services table for service catalog
create table if not exists public.services (
  id uuid default uuid_generate_v4() primary key,
  service_type service_type not null unique,
  name text not null,
  description text,
  base_price numeric not null check (base_price >= 0),
  credits_required integer not null default 1,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create agency_pricing table for custom agency pricing
create table if not exists public.agency_pricing (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  service_type service_type not null,
  markup_percentage numeric not null default 20 check (markup_percentage >= 0 and markup_percentage <= 100),
  custom_price numeric,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, service_type)
);

-- Create agency_earnings table for commission tracking
create table if not exists public.agency_earnings (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade not null,
  amount numeric not null check (amount >= 0),
  commission_rate numeric not null check (commission_rate >= 0 and commission_rate <= 100),
  status commission_status default 'pending',
  payout_date date,
  stripe_payout_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add missing fields to orders table
alter table public.orders 
  add column if not exists customer_id uuid references public.customers(id),
  add column if not exists service_type service_type not null default 'cee_certificate',
  add column if not exists total_amount numeric not null default 0 check (total_amount >= 0),
  add column if not exists commission_amount numeric default 0 check (commission_amount >= 0);

-- Add status field to properties table
alter table public.properties
  add column if not exists status text not null default 'active' check (status in ('active', 'inactive', 'archived'));

-- Create indexes for better performance
create index if not exists idx_agency_users_user_id on public.agency_users(user_id);
create index if not exists idx_agency_users_agency_id on public.agency_users(agency_id);
create index if not exists idx_customers_agency_id on public.customers(agency_id);
create index if not exists idx_customers_email on public.customers(email);
create index if not exists idx_agency_pricing_agency_id on public.agency_pricing(agency_id);
create index if not exists idx_agency_earnings_agency_id on public.agency_earnings(agency_id);
create index if not exists idx_agency_earnings_status on public.agency_earnings(status);
create index if not exists idx_agency_earnings_created_at on public.agency_earnings(created_at desc);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_service_type on public.orders(service_type);

-- Enable RLS on new tables
alter table public.agency_users enable row level security;
alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.agency_pricing enable row level security;
alter table public.agency_earnings enable row level security;

-- RLS Policies for agency_users
create policy "Users can view their agency associations"
  on public.agency_users for select
  using (user_id = auth.uid() or 
    exists (
      select 1 from public.agency_users au
      where au.user_id = auth.uid() 
      and au.agency_id = agency_users.agency_id 
      and au.role in ('owner', 'admin')
    )
  );

-- RLS Policies for customers
create policy "Agency members can view their customers"
  on public.customers for select
  using (
    exists (
      select 1 from public.agency_users
      where agency_users.user_id = auth.uid()
      and agency_users.agency_id = customers.agency_id
    )
  );

create policy "Agency members can create customers"
  on public.customers for insert
  with check (
    exists (
      select 1 from public.agency_users
      where agency_users.user_id = auth.uid()
      and agency_users.agency_id = customers.agency_id
    )
  );

create policy "Agency members can update their customers"
  on public.customers for update
  using (
    exists (
      select 1 from public.agency_users
      where agency_users.user_id = auth.uid()
      and agency_users.agency_id = customers.agency_id
    )
  );

-- RLS Policies for services (public read, admin write)
create policy "Anyone can view active services"
  on public.services for select
  using (active = true);

-- RLS Policies for agency_pricing
create policy "Agency members can view their pricing"
  on public.agency_pricing for select
  using (
    exists (
      select 1 from public.agency_users
      where agency_users.user_id = auth.uid()
      and agency_users.agency_id = agency_pricing.agency_id
    )
  );

create policy "Agency admins can manage their pricing"
  on public.agency_pricing for all
  using (
    exists (
      select 1 from public.agency_users
      where agency_users.user_id = auth.uid()
      and agency_users.agency_id = agency_pricing.agency_id
      and agency_users.role in ('owner', 'admin')
    )
  );

-- RLS Policies for agency_earnings
create policy "Agency members can view their earnings"
  on public.agency_earnings for select
  using (
    exists (
      select 1 from public.agency_users
      where agency_users.user_id = auth.uid()
      and agency_users.agency_id = agency_earnings.agency_id
    )
  );

-- Insert default services
insert into public.services (service_type, name, description, base_price, credits_required) values
  ('cee_certificate', 'Certificado Energético (CEE)', 'Certificado de eficiencia energética oficial', 120, 1),
  ('photography', 'Fotografía Profesional', 'Sesión de fotografía profesional de la propiedad', 80, 1),
  ('videography', 'Videografía', 'Video profesional de la propiedad', 150, 1),
  ('virtual_tour', 'Tour Virtual 360°', 'Tour virtual interactivo de la propiedad', 200, 2),
  ('floor_plan', 'Plano Profesional', 'Plano técnico detallado de la propiedad', 60, 1)
on conflict (service_type) do nothing;

-- Function to calculate commission for an order
create or replace function public.calculate_order_commission(
  p_order_id uuid
)
returns numeric as $$
declare
  v_order record;
  v_agency_pricing record;
  v_commission_rate numeric;
  v_commission_amount numeric;
begin
  -- Get order details
  select o.*, s.base_price
  into v_order
  from public.orders o
  join public.services s on s.service_type = o.service_type
  where o.id = p_order_id;

  -- Get agency pricing
  select *
  into v_agency_pricing
  from public.agency_pricing
  where agency_id = v_order.agency_id
  and service_type = v_order.service_type
  and active = true;

  -- Calculate commission rate (default 20% if not set)
  v_commission_rate := coalesce(v_agency_pricing.markup_percentage, 20);
  
  -- Calculate commission amount
  v_commission_amount := v_order.total_amount * (v_commission_rate / 100);

  -- Update order with commission amount
  update public.orders
  set commission_amount = v_commission_amount
  where id = p_order_id;

  -- Create earnings record
  insert into public.agency_earnings (
    agency_id, order_id, amount, commission_rate, status
  ) values (
    v_order.agency_id, p_order_id, v_commission_amount, v_commission_rate, 'pending'
  );

  return v_commission_amount;
end;
$$ language plpgsql security definer;