-- Fix the agency_users insert policy to allow users to create associations
-- when they are creating a new agency (as owner)

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can create agency associations" ON public.agency_users;

-- Create a new policy that allows users to create agency associations when:
-- 1. The user_id matches their authenticated user ID
-- 2. They are setting themselves as the owner
-- 3. The agency exists and they own it (for adding other users later)
CREATE POLICY "Users can create agency associations"
  ON public.agency_users FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    AND (
      -- Allow creating owner association when creating a new agency
      role = 'owner'
      OR
      -- Allow agency owners to add other users
      EXISTS (
        SELECT 1 FROM public.agencies a
        WHERE a.id = agency_id
          AND a.profile_id = auth.uid()
      )
    )
  );

-- Also ensure the agency insert policy allows the authenticated user to create agencies
DROP POLICY IF EXISTS "Users can create agencies" ON public.agencies;

CREATE POLICY "Users can create agencies"
  ON public.agencies FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    AND auth.uid() IS NOT NULL
  );