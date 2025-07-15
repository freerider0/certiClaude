-- Seed data for local development
-- Run the agency dashboard migration first: supabase migration up

-- Create test users
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@certifast.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}'),
  ('22222222-2222-2222-2222-222222222222', 'agency@certifast.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Agency Owner"}'),
  ('33333333-3333-3333-3333-333333333333', 'agent@certifast.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Real Estate Agent"}')
on conflict do nothing;

-- Update profiles with roles
update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set role = 'agency', agency_id = '22222222-2222-2222-2222-222222222222' where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set role = 'agent', agency_id = '22222222-2222-2222-2222-222222222222' where id = '33333333-3333-3333-3333-333333333333';

-- Create test agency
insert into public.agencies (id, profile_id, name, contact_email, contact_phone, address, subscription_tier, credits_balance)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Demo Real Estate Agency', 'contact@demorealestate.com', '+34 123 456 789', 
   '{"street": "Calle Mayor 123", "city": "Madrid", "postal_code": "28001", "country": "Spain"}', 'pro', 50)
on conflict do nothing;

-- Link users to agency (required for dashboard access)
insert into public.agency_users (user_id, agency_id, role)
values
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'staff')
on conflict do nothing;

-- Create test customers
insert into public.customers (id, agency_id, name, email, phone)
values
  ('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'María García', 'maria@example.com', '+34 600 123 456'),
  ('c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Juan López', 'juan@example.com', '+34 600 234 567'),
  ('c3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ana Martín', 'ana@example.com', '+34 600 345 678')
on conflict do nothing;

-- Create test properties with status
insert into public.properties (id, agency_id, created_by, reference_code, address, property_type, area_m2, floors, year_built, status)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'PROP-001', 
   '{"street": "Calle Example 45", "city": "Barcelona", "postal_code": "08001", "country": "Spain"}', 'apartment', 85.5, 1, 2010, 'active'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'PROP-002', 
   '{"street": "Avenida Test 123", "city": "Valencia", "postal_code": "46001", "country": "Spain"}', 'house', 150, 2, 2005, 'active'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'PROP-003', 
   '{"street": "Plaza Nueva 10", "city": "Sevilla", "postal_code": "41001", "country": "Spain"}', 'apartment', 95, 1, 2015, 'active')
on conflict do nothing;

-- Create test certificates
insert into public.certificates (property_id, certificate_number, status, energy_rating, co2_rating, energy_consumption, co2_emissions, valid_until)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CERT-2024-001', 'issued', 'C', 'D', 120.5, 25.3, '2034-01-01'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'CERT-2024-002', 'draft', null, null, null, null, null)
on conflict do nothing;

-- Create test orders with enhanced fields
insert into public.orders (id, agency_id, property_id, customer_id, certificate_id, created_by, status, amount, service_type, total_amount, commission_amount, created_at)
values
  ('o1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c1111111-1111-1111-1111-111111111111', null, '22222222-2222-2222-2222-222222222222', 'completed', 150.00, 'cee_certificate', 150, 30, now() - interval '5 days'),
  ('o2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c2222222-2222-2222-2222-222222222222', null, '33333333-3333-3333-3333-333333333333', 'pending', 100.00, 'photography', 100, 20, now() - interval '2 days'),
  ('o3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'c3333333-3333-3333-3333-333333333333', null, '22222222-2222-2222-2222-222222222222', 'pending', 250.00, 'virtual_tour', 250, 50, now() - interval '1 day'),
  ('o4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c1111111-1111-1111-1111-111111111111', null, '22222222-2222-2222-2222-222222222222', 'processing', 75.00, 'floor_plan', 75, 15, now() - interval '3 hours'),
  ('o5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'c2222222-2222-2222-2222-222222222222', null, '33333333-3333-3333-3333-333333333333', 'completed', 180.00, 'videography', 180, 36, now() - interval '10 days')
on conflict do nothing;

-- Create agency earnings records
insert into public.agency_earnings (agency_id, order_id, amount, commission_rate, status, created_at)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'o1111111-1111-1111-1111-111111111111', 30, 20, 'paid', now() - interval '5 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'o2222222-2222-2222-2222-222222222222', 20, 20, 'pending', now() - interval '2 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'o3333333-3333-3333-3333-333333333333', 50, 20, 'pending', now() - interval '1 day'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'o4444444-4444-4444-4444-444444444444', 15, 20, 'processing', now() - interval '3 hours'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'o5555555-5555-5555-5555-555555555555', 36, 20, 'paid', now() - interval '10 days')
on conflict do nothing;

-- Add historical earnings for the last 6 months (for the chart)
insert into public.agency_earnings (agency_id, order_id, amount, commission_rate, status, created_at)
values
  -- January
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 120, 20, 'paid', '2024-01-15'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 80, 20, 'paid', '2024-01-20'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 60, 20, 'pending', '2024-01-25'),
  -- February
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 150, 20, 'paid', '2024-02-05'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 100, 20, 'paid', '2024-02-12'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 90, 20, 'pending', '2024-02-28'),
  -- March
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 200, 20, 'paid', '2024-03-10'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 160, 20, 'paid', '2024-03-18'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 70, 20, 'pending', '2024-03-25'),
  -- April
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 180, 20, 'paid', '2024-04-08'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 140, 20, 'paid', '2024-04-15'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 110, 20, 'pending', '2024-04-22'),
  -- May
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 220, 20, 'paid', '2024-05-05'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 130, 20, 'paid', '2024-05-15'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 80, 20, 'pending', '2024-05-28'),
  -- June (current month)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 250, 20, 'paid', '2024-06-02'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 190, 20, 'paid', '2024-06-10'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', gen_random_uuid(), 120, 20, 'pending', '2024-06-15')
on conflict do nothing;

-- Set custom agency pricing (markup percentages)
insert into public.agency_pricing (agency_id, service_type, markup_percentage)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cee_certificate', 20),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'photography', 20),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'videography', 20),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'virtual_tour', 20),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'floor_plan', 20)
on conflict do nothing;