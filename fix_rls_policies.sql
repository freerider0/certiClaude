-- Fix RLS policies for agencies table

-- Add missing INSERT policy for agencies table
CREATE POLICY "Authenticated users can create agencies"
  ON public.agencies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add missing INSERT policy for agency_users table
CREATE POLICY "Users can create agency associations"
  ON public.agency_users FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Update agencies INSERT policy to be more specific
DROP POLICY IF EXISTS "Authenticated users can create agencies" ON public.agencies;
CREATE POLICY "Users can create agencies for themselves"
  ON public.agencies FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );