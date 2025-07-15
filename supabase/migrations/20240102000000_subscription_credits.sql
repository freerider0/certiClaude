-- Add subscription and credit fields to agencies table
alter table public.agencies add column if not exists stripe_subscription_id text;
alter table public.agencies add column if not exists subscription_status text;
alter table public.agencies add column if not exists subscription_tier text check (subscription_tier in ('basic', 'pro', 'enterprise'));
alter table public.agencies add column if not exists credits_balance integer default 0 check (credits_balance >= 0);
alter table public.agencies add column if not exists credits_included integer default 0;
alter table public.agencies add column if not exists subscription_current_period_end timestamptz;
alter table public.agencies add column if not exists default_payment_method_id text;

-- Create credits_transactions table for tracking all credit movements
create table if not exists public.credits_transactions (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  type text not null check (type in ('subscription_grant', 'purchase', 'usage', 'refund', 'adjustment')),
  amount integer not null, -- positive for additions, negative for usage
  balance_after integer not null check (balance_after >= 0),
  description text,
  stripe_payment_intent_id text,
  certificate_id uuid references public.certificates(id),
  created_at timestamptz default now()
);

-- Create subscription_history table for tracking subscription changes
create table if not exists public.subscription_history (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  stripe_subscription_id text not null,
  action text not null check (action in ('created', 'updated', 'cancelled', 'reactivated')),
  tier text check (tier in ('basic', 'pro', 'enterprise')),
  previous_tier text check (previous_tier in ('basic', 'pro', 'enterprise')),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Create payment_methods table for saved cards
create table if not exists public.payment_methods (
  id uuid default uuid_generate_v4() primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  stripe_payment_method_id text unique not null,
  type text not null,
  last4 text not null,
  exp_month integer not null,
  exp_year integer not null,
  brand text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Add indexes for better performance
create index if not exists idx_credits_transactions_agency_id on public.credits_transactions(agency_id);
create index if not exists idx_credits_transactions_created_at on public.credits_transactions(created_at desc);
create index if not exists idx_subscription_history_agency_id on public.subscription_history(agency_id);
create index if not exists idx_payment_methods_agency_id on public.payment_methods(agency_id);

-- Enable RLS
alter table public.credits_transactions enable row level security;
alter table public.subscription_history enable row level security;
alter table public.payment_methods enable row level security;

-- RLS Policies for credits_transactions
create policy "Agencies can view their own credit transactions"
  on public.credits_transactions for select
  using (
    agency_id in (
      select agencies.id from public.agencies
      join public.profiles on profiles.agency_id = agencies.profile_id or profiles.id = agencies.profile_id
      where profiles.id = auth.uid()
    )
  );

-- RLS Policies for subscription_history
create policy "Agencies can view their own subscription history"
  on public.subscription_history for select
  using (
    agency_id in (
      select agencies.id from public.agencies
      join public.profiles on profiles.agency_id = agencies.profile_id or profiles.id = agencies.profile_id
      where profiles.id = auth.uid()
    )
  );

-- RLS Policies for payment_methods
create policy "Agencies can view their own payment methods"
  on public.payment_methods for select
  using (
    agency_id in (
      select agencies.id from public.agencies
      join public.profiles on profiles.agency_id = agencies.profile_id or profiles.id = agencies.profile_id
      where profiles.id = auth.uid()
    )
  );

create policy "Agencies can delete their own payment methods"
  on public.payment_methods for delete
  using (
    agency_id in (
      select agencies.id from public.agencies
      where agencies.profile_id = auth.uid()
    )
  );

-- Function to deduct credits with transaction logging
create or replace function public.deduct_credits(
  p_agency_id uuid,
  p_amount integer,
  p_description text,
  p_certificate_id uuid default null
)
returns boolean as $$
declare
  v_current_balance integer;
  v_new_balance integer;
begin
  -- Get current balance with lock
  select credits_balance into v_current_balance
  from public.agencies
  where id = p_agency_id
  for update;

  -- Check if sufficient credits
  if v_current_balance < p_amount then
    return false;
  end if;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update balance
  update public.agencies
  set credits_balance = v_new_balance
  where id = p_agency_id;

  -- Log transaction
  insert into public.credits_transactions (
    agency_id, type, amount, balance_after, description, certificate_id
  ) values (
    p_agency_id, 'usage', -p_amount, v_new_balance, p_description, p_certificate_id
  );

  return true;
end;
$$ language plpgsql security definer;

-- Function to add credits with transaction logging
create or replace function public.add_credits(
  p_agency_id uuid,
  p_amount integer,
  p_type text,
  p_description text,
  p_stripe_payment_intent_id text default null
)
returns integer as $$
declare
  v_current_balance integer;
  v_new_balance integer;
begin
  -- Get current balance with lock
  select credits_balance into v_current_balance
  from public.agencies
  where id = p_agency_id
  for update;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Update balance
  update public.agencies
  set credits_balance = v_new_balance
  where id = p_agency_id;

  -- Log transaction
  insert into public.credits_transactions (
    agency_id, type, amount, balance_after, description, stripe_payment_intent_id
  ) values (
    p_agency_id, p_type, p_amount, v_new_balance, p_description, p_stripe_payment_intent_id
  );

  return v_new_balance;
end;
$$ language plpgsql security definer;