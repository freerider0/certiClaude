-- OAuth Integration Migration
-- Adds OAuth provider tracking and enhanced profile data

-- Add OAuth fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS oauth_providers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS oauth_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_from_provider TEXT,
ADD COLUMN IF NOT EXISTS last_oauth_sync TIMESTAMPTZ;

-- Add OAuth fields to agencies table
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS logo_from_provider TEXT,
ADD COLUMN IF NOT EXISTS company_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_profiles JSONB DEFAULT '{}';

-- Create OAuth activities table for audit logging
CREATE TABLE IF NOT EXISTS public.oauth_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('login', 'signup', 'link', 'unlink', 'sync')),
  provider_user_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_oauth_providers ON public.profiles USING GIN (oauth_providers);
CREATE INDEX IF NOT EXISTS idx_oauth_activities_user_id ON public.oauth_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_activities_provider ON public.oauth_activities(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_activities_action ON public.oauth_activities(action);
CREATE INDEX IF NOT EXISTS idx_oauth_activities_created_at ON public.oauth_activities(created_at);

-- Enable RLS for oauth_activities table
ALTER TABLE public.oauth_activities ENABLE ROW LEVEL SECURITY;

-- RLS policy for oauth_activities - users can only see their own activities
CREATE POLICY "Users can view their own OAuth activities"
  ON public.oauth_activities FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policy for oauth_activities - only the system can insert activities
CREATE POLICY "System can insert OAuth activities"
  ON public.oauth_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to clean old OAuth activities (keep last 1000 per user)
CREATE OR REPLACE FUNCTION public.cleanup_old_oauth_activities()
RETURNS void AS $$
BEGIN
  DELETE FROM public.oauth_activities
  WHERE id IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM public.oauth_activities
    ) ranked
    WHERE rn > 1000
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's OAuth providers
CREATE OR REPLACE FUNCTION public.get_user_oauth_providers(user_uuid UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN COALESCE(
    (SELECT oauth_providers FROM public.profiles WHERE id = user_uuid),
    '{}'::TEXT[]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add OAuth provider to user
CREATE OR REPLACE FUNCTION public.add_oauth_provider(
  user_uuid UUID,
  provider_name TEXT,
  provider_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_providers TEXT[];
  updated_providers TEXT[];
  current_data JSONB;
BEGIN
  -- Get current providers
  SELECT oauth_providers, oauth_data 
  INTO current_providers, current_data
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Check if provider already exists
  IF provider_name = ANY(current_providers) THEN
    RETURN FALSE;
  END IF;
  
  -- Add provider to array
  updated_providers := COALESCE(current_providers, '{}') || ARRAY[provider_name];
  
  -- Update OAuth data
  current_data := COALESCE(current_data, '{}');
  current_data := current_data || jsonb_build_object(provider_name, provider_data);
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    oauth_providers = updated_providers,
    oauth_data = current_data,
    last_oauth_sync = NOW(),
    updated_at = NOW()
  WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove OAuth provider from user
CREATE OR REPLACE FUNCTION public.remove_oauth_provider(
  user_uuid UUID,
  provider_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_providers TEXT[];
  updated_providers TEXT[];
  current_data JSONB;
BEGIN
  -- Get current providers
  SELECT oauth_providers, oauth_data 
  INTO current_providers, current_data
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Check if provider exists
  IF NOT (provider_name = ANY(current_providers)) THEN
    RETURN FALSE;
  END IF;
  
  -- Remove provider from array
  updated_providers := array_remove(current_providers, provider_name);
  
  -- Remove provider data
  current_data := current_data - provider_name;
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    oauth_providers = updated_providers,
    oauth_data = current_data,
    last_oauth_sync = NOW(),
    updated_at = NOW()
  WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update OAuth provider data
CREATE OR REPLACE FUNCTION public.update_oauth_provider_data(
  user_uuid UUID,
  provider_name TEXT,
  provider_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  current_providers TEXT[];
  current_data JSONB;
BEGIN
  -- Get current data
  SELECT oauth_providers, oauth_data 
  INTO current_providers, current_data
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Check if provider exists
  IF NOT (provider_name = ANY(current_providers)) THEN
    RETURN FALSE;
  END IF;
  
  -- Update provider data
  current_data := COALESCE(current_data, '{}');
  current_data := current_data || jsonb_build_object(
    provider_name, 
    COALESCE(current_data->provider_name, '{}') || provider_data
  );
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    oauth_data = current_data,
    last_oauth_sync = NOW(),
    updated_at = NOW()
  WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing user trigger to handle OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  provider_name TEXT;
BEGIN
  -- Insert basic profile
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'agent'
  );
  
  -- Check if this is an OAuth signup
  provider_name := new.raw_user_meta_data->>'provider';
  
  IF provider_name IS NOT NULL THEN
    -- Add OAuth provider to the new profile
    PERFORM public.add_oauth_provider(
      new.id,
      provider_name,
      new.raw_user_meta_data || jsonb_build_object(
        'email', new.email,
        'signup_timestamp', NOW()
      )
    );
    
    -- Log OAuth signup activity
    INSERT INTO public.oauth_activities (
      user_id,
      provider,
      action,
      provider_user_id,
      metadata
    ) VALUES (
      new.id,
      provider_name,
      'signup',
      new.raw_user_meta_data->>'sub',
      jsonb_build_object(
        'email', new.email,
        'signup_method', 'oauth'
      )
    );
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;