-- Initial database schema for Certifast
-- Clean schema without profiles table - uses auth.users directly
-- Updated: 2025-07-15 - Removed profiles table confusion

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('owner', 'admin', 'staff'); -- Updated roles for agency_users
create type order_status as enum ('pending', 'processing', 'completed', 'cancelled');
create type property_type as enum ('apartment', 'house', 'office', 'commercial', 'industrial', 'other');
create type certificate_status as enum ('draft', 'pending_review', 'approved', 'issued');
create type service_type as enum ('cee_certificate', 'photography', 'videography', 'virtual_tour', 'floor_plan');
create type commission_status as enum ('pending', 'processing', 'paid');

-- Create agencies table
create table public.agencies (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references auth.users(id) on delete cascade not null, -- Agency owner
  name text not null,
  logo_url text,
  contact_email text,
  contact_phone text,
  address jsonb,
  settings jsonb default '{}',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  subscription_tier text check (subscription_tier in ('basic', 'pro', 'enterprise')),
  credits_balance integer default 0 check (credits_balance >= 0),
  credits_included integer default 0,
  subscription_current_period_end timestamptz,
  default_payment_method_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create agency_users table to link users to agencies
create table public.agency_users (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  role user_role not null default 'staff',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, agency_id)
);

-- Create admin_users table for system administrators
create table public.admin_users (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  created_by uuid references auth.users(id),
  notes text
);

create table public.profiles (
    id uuid references auth.users not null primary key,
  avatar_url text,
    full_name text,
  -- Add a flag for your onboarding flow
  onboarding_complete boolean default false not null
  created_at timestamptz default now(),
  updated_at timestamp with time zone,
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Allow users to view their own profile
create policy "Public profiles are viewable by everyone." on profiles
  for select using (user_id = auth.uid());

-- Allow users to update their own profile
create policy "Users can insert their own profile." on profiles
  for insert with check (user_id = auth.uid());

create policy "Users can update own profile." on profiles
  for update using (user_id = auth.uid());

-- a trigger to create a profile for each new user
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- the trigger to fire the function
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create properties table
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  created_by uuid references auth.users(id) not null,
  reference_code text unique,
  address jsonb not null,
  property_type property_type not null,
  area_m2 numeric not null check (area_m2 > 0),
  floors integer,
  year_built integer,
  metadata jsonb default '{}',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create floor_plans table
create table public.floor_plans (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null,
  floor_number integer default 0,
  plan_data jsonb not null,
  image_url text,
  area_m2 numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create certificates table
create table public.certificates (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  certificate_number text unique,
  status certificate_status default 'draft',
  energy_rating text check (energy_rating in ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  co2_rating text check (co2_rating in ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  energy_consumption numeric,
  co2_emissions numeric,
  valid_until date,
  data jsonb not null default '{}',
  pdf_url text,
  xml_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  issued_at timestamptz
);

-- Create customers table
create table public.customers (
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

-- Create services table
create table public.services (
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

-- Create agency_pricing table
create table public.agency_pricing (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  service_type service_type not null,
  markup_percentage numeric not null default 20 check (markup_percentage >= 0 and markup_percentage <= 100),
  fixed_markup numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agency_id, service_type)
);

-- Create orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  certificate_id uuid references public.certificates(id),
  customer_id uuid references public.customers(id) on delete set null,
  created_by uuid references auth.users(id) not null,
  status order_status default 'pending',
  service_type service_type not null,
  amount numeric not null check (amount >= 0),
  base_price numeric not null,
  agency_price numeric not null,
  total_amount numeric not null,
  stripe_payment_intent_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Create agency_earnings table
create table public.agency_earnings (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade not null,
  amount numeric not null check (amount >= 0),
  commission_rate numeric not null check (commission_rate >= 0 and commission_rate <= 100),
  status commission_status default 'pending',
  payout_date timestamptz,
  stripe_transfer_id text,
  created_at timestamptz default now()
);

-- Create credits_transactions table
create table public.credits_transactions (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  type text not null check (type in ('subscription_grant', 'purchase', 'usage', 'refund', 'adjustment')),
  amount integer not null,
  balance_after integer not null,
  order_id uuid references public.orders(id),
  description text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Create subscription_history table
create table public.subscription_history (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  stripe_subscription_id text not null,
  action text not null check (action in ('created', 'updated', 'cancelled', 'reactivated')),
  tier text,
  status text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Create payment_methods table
create table public.payment_methods (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  stripe_payment_method_id text unique not null,
  type text not null,
  brand text,
  last4 text,
  exp_month integer,
  exp_year integer,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create activity_logs table
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  agency_id uuid references public.agencies(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Create oauth_providers table
create table public.oauth_providers (
  id text primary key,
  name text not null,
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create oauth_activities table
create table public.oauth_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text references public.oauth_providers(id) not null,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Create useful view for user and agency data
create or replace view public.user_agency_view as
select 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url,
  u.created_at,
  u.updated_at,
  au.agency_id,
  au.role as agency_role,
  a.name as agency_name
from auth.users u
left join public.agency_users au on u.id = au.user_id
left join public.agencies a on au.agency_id = a.id;

-- Enable Row Level Security (RLS)
alter table public.agencies enable row level security;
alter table public.agency_users enable row level security;
alter table public.admin_users enable row level security;
alter table public.properties enable row level security;
alter table public.floor_plans enable row level security;
alter table public.certificates enable row level security;
alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.agency_pricing enable row level security;
alter table public.orders enable row level security;
alter table public.agency_earnings enable row level security;
alter table public.credits_transactions enable row level security;
alter table public.subscription_history enable row level security;
alter table public.payment_methods enable row level security;
alter table public.activity_logs enable row level security;
alter table public.oauth_providers enable row level security;
alter table public.oauth_activities enable row level security;

-- RLS Policies for agencies
create policy "Agency members can view their agency"
  on public.agencies for select
  using (
    profile_id = auth.uid() or
    id in (
      select agency_id from public.agency_users 
      where user_id = auth.uid()
    )
  );

create policy "Users can create agencies"
  on public.agencies for insert
  with check (profile_id = auth.uid());

create policy "Agency owners can update their agencies"
  on public.agencies for update
  using (
    profile_id = auth.uid() or
    id in (
      select agency_id from public.agency_users 
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- RLS Policies for agency_users
create policy "Users can view agency associations"
  on public.agency_users for select
  using (user_id = auth.uid());

create policy "Users can create agency associations"
  on public.agency_users for insert
  with check (user_id = auth.uid());

create policy "Agency owners can update user roles"
  on public.agency_users for update
  using (
    exists (
      select 1 from public.agencies a
      where a.id = agency_users.agency_id
        and a.profile_id = auth.uid()
    )
  );

create policy "Agency owners can remove users"
  on public.agency_users for delete
  using (
    exists (
      select 1 from public.agencies a
      where a.id = agency_users.agency_id
        and a.profile_id = auth.uid()
    )
  );

-- RLS Policies for admin_users
create policy "Admins can view admin users"
  on public.admin_users for select
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

create policy "Admins can add admin users"
  on public.admin_users for insert
  with check (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

create policy "Admins can remove admin users"
  on public.admin_users for delete
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

-- RLS Policies for properties
create policy "Agency members can view their properties"
  on public.properties for select
  using (
    exists (
      select 1 from public.agency_users au
      where au.user_id = auth.uid() and au.agency_id = properties.agency_id
    )
  );

create policy "Agency members can create properties"
  on public.properties for insert
  with check (
    exists (
      select 1 from public.agency_users au
      where au.user_id = auth.uid() and au.agency_id = agency_id
    )
  );

-- Add similar policies for other tables...

-- Create indexes for performance
create index idx_agencies_profile_id on public.agencies(profile_id);
create index idx_agency_users_user_id on public.agency_users(user_id);
create index idx_agency_users_agency_id on public.agency_users(agency_id);
create index idx_admin_users_user_id on public.admin_users(user_id);
create index idx_properties_agency_id on public.properties(agency_id);
create index idx_properties_created_by on public.properties(created_by);
create index idx_floor_plans_property_id on public.floor_plans(property_id);
create index idx_certificates_property_id on public.certificates(property_id);
create index idx_orders_agency_id on public.orders(agency_id);
create index idx_orders_property_id on public.orders(property_id);
create index idx_activity_logs_user_id on public.activity_logs(user_id);
create index idx_activity_logs_agency_id on public.activity_logs(agency_id);

-- Grant permissions on the view
grant select on public.user_agency_view to authenticated;