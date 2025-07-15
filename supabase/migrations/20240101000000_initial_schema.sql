-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('admin', 'agency', 'agent');
create type order_status as enum ('pending', 'processing', 'completed', 'cancelled');
create type property_type as enum ('apartment', 'house', 'office', 'commercial', 'industrial', 'other');
create type certificate_status as enum ('draft', 'pending_review', 'approved', 'issued');

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null default 'agent',
  full_name text,
  agency_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create agencies table
create table public.agencies (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  logo_url text,
  contact_email text,
  contact_phone text,
  address jsonb,
  settings jsonb default '{}',
  stripe_customer_id text,
  subscription_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create properties table
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  created_by uuid references public.profiles(id) not null,
  reference_code text unique,
  address jsonb not null,
  property_type property_type not null,
  area_m2 numeric not null check (area_m2 > 0),
  floors integer,
  year_built integer,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create floor_plans table
create table public.floor_plans (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null,
  floor_number integer default 0,
  plan_data jsonb not null, -- Stores the drawing data
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
  data jsonb not null default '{}', -- Stores all certificate data
  pdf_url text,
  xml_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  issued_at timestamptz
);

-- Create orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  certificate_id uuid references public.certificates(id),
  created_by uuid references public.profiles(id) not null,
  status order_status default 'pending',
  amount numeric not null check (amount >= 0),
  stripe_payment_intent_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Create activity_logs table
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  agency_id uuid references public.agencies(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Create Row Level Security (RLS) policies
alter table public.profiles enable row level security;
alter table public.agencies enable row level security;
alter table public.properties enable row level security;
alter table public.floor_plans enable row level security;
alter table public.certificates enable row level security;
alter table public.orders enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Agencies policies
create policy "Agency members can view their agency"
  on public.agencies for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (profiles.agency_id = agencies.profile_id or profiles.id = agencies.profile_id)
    )
  );

create policy "Agency owners can update their agency"
  on public.agencies for update
  using (profile_id = auth.uid());

-- Properties policies
create policy "Agency members can view their properties"
  on public.properties for select
  using (
    exists (
      select 1 from public.profiles
      join public.agencies on profiles.agency_id = agencies.profile_id or profiles.id = agencies.profile_id
      where profiles.id = auth.uid() and agencies.id = properties.agency_id
    )
  );

create policy "Agency members can create properties"
  on public.properties for insert
  with check (
    exists (
      select 1 from public.profiles
      join public.agencies on profiles.agency_id = agencies.profile_id or profiles.id = agencies.profile_id
      where profiles.id = auth.uid() and agencies.id = agency_id
    )
  );

-- Similar policies for other tables...

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'agent'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes for better performance
create index idx_properties_agency_id on public.properties(agency_id);
create index idx_properties_created_by on public.properties(created_by);
create index idx_floor_plans_property_id on public.floor_plans(property_id);
create index idx_certificates_property_id on public.certificates(property_id);
create index idx_orders_agency_id on public.orders(agency_id);
create index idx_orders_property_id on public.orders(property_id);
create index idx_activity_logs_user_id on public.activity_logs(user_id);
create index idx_activity_logs_agency_id on public.activity_logs(agency_id);