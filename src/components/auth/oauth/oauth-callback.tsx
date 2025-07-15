'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@/i18n/navigation';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Mail,
  Building2,
  Users
} from 'lucide-react';
import { handleOAuthCallback, getOAuthErrorFromUrl, clearOAuthParams } from '@/lib/auth/supabase-oauth';
import { getProviderDisplay } from '@/lib/auth/oauth/providers';

interface CallbackState {
  status: 'loading' | 'success' | 'error' | 'needs_setup';
  message?: string;
  error?: string;
  user?: any;
  provider?: string;
  needsProfileMerge?: boolean;
}

const iconMap = {
  Mail: Mail,
  Building2: Building2,
  Users: Users,
};

export function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>({ status: 'loading' });

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for URL errors first
        const urlError = getOAuthErrorFromUrl();
        if (urlError) {
          setState({
            status: 'error',
            error: urlError,
            message: 'OAuth authentication was cancelled or failed'
          });
          clearOAuthParams();
          return;
        }

        // Handle OAuth callback
        const result = await handleOAuthCallback();
        
        if (!result.success) {
          setState({
            status: 'error',
            error: result.error,
            message: 'Failed to complete authentication'
          });
          return;
        }

        const mode = searchParams.get('mode') || 'login';
        const provider = result.oauthData?.provider;
        
        setState({
          status: result.needsProfileMerge ? 'needs_setup' : 'success',
          user: result.user,
          provider,
          needsProfileMerge: result.needsProfileMerge,
          message: result.needsProfileMerge 
            ? 'Please complete your agency setup'
            : 'Authentication successful'
        });

        // Clear OAuth params from URL
        clearOAuthParams();

        // Redirect after short delay if no setup needed
        if (!result.needsProfileMerge) {
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }

      } catch (error: any) {
        console.error('OAuth callback processing error:', error);
        setState({
          status: 'error',
          error: error.message,
          message: 'An unexpected error occurred during authentication'
        });
      }
    };

    processCallback();
  }, [router, searchParams]);

  const providerDisplay = state.provider ? getProviderDisplay(state.provider) : null;
  const ProviderIcon = providerDisplay?.icon && iconMap[providerDisplay.icon as keyof typeof iconMap];

  // Loading state
  if (state.status === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-center">Completing sign in...</CardTitle>
          <CardDescription className="text-center">
            Please wait while we process your authentication.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Error state
  if (state.status === 'error') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-center">Authentication Failed</CardTitle>
          <CardDescription className="text-center">
            {state.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state - needs setup
  if (state.status === 'needs_setup') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
            {ProviderIcon ? (
              <ProviderIcon 
                className="w-6 h-6" 
                style={{ color: providerDisplay?.color }}
              />
            ) : (
              <CheckCircle className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-center">
            Welcome to CertiFast!
          </CardTitle>
          <CardDescription className="text-center">
            Your {providerDisplay?.name || 'OAuth'} account has been connected successfully. 
            Let's complete your agency setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                We've pre-filled some information from your {providerDisplay?.name || 'OAuth'} profile. 
                You can review and complete the remaining details.
              </AlertDescription>
            </Alert>
            
            <Button asChild className="w-full">
              <Link href="/onboarding?oauth=true">
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            <div className="text-center">
              <Link 
                href="/auth/login" 
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Sign in with a different account
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state - complete
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle className="text-center">Welcome back!</CardTitle>
        <CardDescription className="text-center">
          You've been successfully signed in with {providerDisplay?.name || 'OAuth'}.
          Redirecting to your dashboard...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading your dashboard...</span>
          </div>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              Go to Dashboard Now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}