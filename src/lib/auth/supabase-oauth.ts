import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Provider } from '@supabase/supabase-js';
import { getProviderConfig } from './oauth/providers';

export interface AuthResult {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
  needsProfileMerge?: boolean;
  oauthData?: any;
}

export interface OAuthOptions {
  redirectTo?: string;
  scopes?: string;
  queryParams?: Record<string, string>;
}

// Initiate OAuth flow with a provider
export async function initiateOAuthFlow(
  provider: string, 
  options: OAuthOptions = {}
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createBrowserClient();
    const providerConfig = getProviderConfig(provider);
    
    if (!providerConfig) {
      return { error: `Unknown OAuth provider: ${provider}` };
    }

    const redirectTo = options.redirectTo || `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo,
        scopes: options.scopes || providerConfig.scopes.join(' '),
        queryParams: options.queryParams || {},
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.url) {
      // Store provider info for callback handling
      localStorage.setItem('oauth_provider', provider);
      localStorage.setItem('oauth_timestamp', Date.now().toString());
      
      // Redirect to provider
      window.location.href = data.url;
    }

    return { url: data.url };
  } catch (error: any) {
    console.error('OAuth initiation error:', error);
    return { error: error.message || 'Failed to initiate OAuth flow' };
  }
}

// Handle OAuth callback
export async function handleOAuthCallback(): Promise<AuthResult> {
  try {
    const supabase = createBrowserClient();
    const provider = localStorage.getItem('oauth_provider');
    const timestamp = localStorage.getItem('oauth_timestamp');
    
    // Clean up stored OAuth data
    localStorage.removeItem('oauth_provider');
    localStorage.removeItem('oauth_timestamp');
    
    // Check if callback is recent (within 10 minutes)
    if (timestamp && Date.now() - parseInt(timestamp) > 600000) {
      return {
        success: false,
        error: 'OAuth callback expired. Please try again.'
      };
    }

    // Get session from URL fragments or search params
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.session) {
      return {
        success: false,
        error: 'No active session found'
      };
    }

    // Get user profile data
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: userError?.message || 'Failed to get user information'
      };
    }

    // Check if user needs to complete profile setup
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, agency_id, oauth_providers')
      .eq('id', user.id)
      .single();

    // Determine if this is a new OAuth connection
    const isNewOAuthUser = !profile || !profile.agency_id;
    const providerData = user.user_metadata || {};

    return {
      success: true,
      user,
      session: data.session,
      needsProfileMerge: isNewOAuthUser,
      oauthData: {
        provider,
        providerData,
        isNewUser: isNewOAuthUser
      }
    };
    
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return {
      success: false,
      error: error.message || 'OAuth callback failed'
    };
  }
}

// Link OAuth account to existing user
export async function linkOAuthAccount(
  userId: string, 
  provider: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();
    
    // Get current user's OAuth providers
    const { data: profile } = await supabase
      .from('profiles')
      .select('oauth_providers')
      .eq('id', userId)
      .single();

    const currentProviders = profile?.oauth_providers || [];
    
    // Check if provider is already linked
    if (currentProviders.includes(provider)) {
      return {
        success: false,
        error: 'This account is already linked'
      };
    }

    // Update user's OAuth providers list
    const updatedProviders = [...currentProviders, provider];
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        oauth_providers: updatedProviders,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Log OAuth activity
    await logOAuthActivity(userId, provider, 'link');

    return { success: true };
    
  } catch (error: any) {
    console.error('Account linking error:', error);
    return {
      success: false,
      error: error.message || 'Failed to link account'
    };
  }
}

// Unlink OAuth account
export async function unlinkOAuthAccount(
  userId: string, 
  provider: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();
    
    // Get current user's OAuth providers
    const { data: profile } = await supabase
      .from('profiles')
      .select('oauth_providers')
      .eq('id', userId)
      .single();

    const currentProviders = profile?.oauth_providers || [];
    
    // Remove provider from list
    const updatedProviders = currentProviders.filter((p: string) => p !== provider);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        oauth_providers: updatedProviders,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Log OAuth activity
    await logOAuthActivity(userId, provider, 'unlink');

    return { success: true };
    
  } catch (error: any) {
    console.error('Account unlinking error:', error);
    return {
      success: false,
      error: error.message || 'Failed to unlink account'
    };
  }
}

// Get linked providers for a user
export async function getLinkedProviders(userId: string): Promise<string[]> {
  try {
    const supabase = createBrowserClient();
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('oauth_providers')
      .eq('id', userId)
      .single();

    return profile?.oauth_providers || [];
    
  } catch (error) {
    console.error('Error getting linked providers:', error);
    return [];
  }
}

// Get user's OAuth data
export async function getUserOAuthData(userId: string): Promise<Record<string, any>> {
  try {
    const supabase = createBrowserClient();
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('oauth_data')
      .eq('id', userId)
      .single();

    return profile?.oauth_data || {};
    
  } catch (error) {
    console.error('Error getting OAuth data:', error);
    return {};
  }
}

// Update user's OAuth data
export async function updateUserOAuthData(
  userId: string, 
  provider: string, 
  data: any
): Promise<void> {
  try {
    const supabase = createBrowserClient();
    
    // Get current OAuth data
    const currentData = await getUserOAuthData(userId);
    
    // Update with new provider data
    const updatedData = {
      ...currentData,
      [provider]: {
        ...currentData[provider],
        ...data,
        lastSync: new Date().toISOString()
      }
    };

    await supabase
      .from('profiles')
      .update({ 
        oauth_data: updatedData,
        last_oauth_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
  } catch (error) {
    console.error('Error updating OAuth data:', error);
  }
}

// Log OAuth activity
export async function logOAuthActivity(
  userId: string,
  provider: string,
  action: 'login' | 'signup' | 'link' | 'unlink' | 'sync',
  metadata?: any
): Promise<void> {
  try {
    const supabase = createBrowserClient();
    
    await supabase.from('oauth_activities').insert({
      user_id: userId,
      provider,
      action,
      metadata: metadata || {},
      ip_address: null, // Could be added if needed
      user_agent: navigator.userAgent
    });
    
  } catch (error) {
    console.error('Error logging OAuth activity:', error);
    // Don't throw error for logging failures
  }
}

// Check if OAuth provider is available
export function isOAuthAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.location;
}

// Get OAuth error from URL params
export function getOAuthErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get('error_description') || params.get('error') || null;
}

// Clear OAuth-related URL parameters
export function clearOAuthParams(): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  const paramsToRemove = ['code', 'state', 'error', 'error_description'];
  
  paramsToRemove.forEach(param => url.searchParams.delete(param));
  
  window.history.replaceState({}, document.title, url.toString());
}