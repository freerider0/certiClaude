'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { OAuthButton } from './oauth-button';
import { getProvidersSorted } from '@/lib/auth/oauth/providers';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Shield, Zap } from 'lucide-react';

interface OAuthProvidersProps {
  mode: 'login' | 'signup';
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
  showBusinessFeatures?: boolean;
  title?: string;
  description?: string;
  showTermsNotice?: boolean;
}

export function OAuthProviders({
  mode,
  onSuccess,
  onError,
  className = '',
  showBusinessFeatures = false,
  title,
  description,
  showTermsNotice = true
}: OAuthProvidersProps) {
  const [error, setError] = useState<string | null>(null);
  const tOAuth = useTranslations('oauth');
  const tLegal = useTranslations('legal');
  const providers = getProvidersSorted();

  const handleProviderSuccess = () => {
    setError(null);
    onSuccess?.({ provider: 'oauth', mode });
  };

  const handleProviderError = (errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  };

  if (providers.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          OAuth providers are currently unavailable. Please use email registration.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="text-center space-y-2">
          {title && (
            <h3 className="text-lg font-semibold">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* OAuth Providers */}
      <div className="space-y-3">
        {providers.map((provider, index) => (
          <OAuthButton
            key={provider.id}
            provider={provider}
            mode={mode}
            variant="outline"
            showFeatures={showBusinessFeatures}
            onSuccess={handleProviderSuccess}
            onError={handleProviderError}
          />
        ))}
      </div>

      {/* Separator */}
      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            {tOAuth('orContinueWithEmail')}
          </span>
        </div>
      </div>

      {/* Business Benefits */}
      {showBusinessFeatures && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Quick Setup</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-populate your agency information from your professional profiles
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Secure & Trusted</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Industry-standard OAuth security with enterprise-grade protection
            </p>
          </div>
        </div>
      )}

      {/* Terms Notice */}
      {showTermsNotice && (
        <div className="text-xs text-center text-muted-foreground">
          {mode === 'signup' ? tLegal('byCreatingAccount') : tLegal('bySigningIn')}{' '}
          <a href="/legal/terms" className="text-primary hover:underline">
            {tLegal('termsOfService')}
          </a>{' '}
          {tLegal('and')}{' '}
          <a href="/legal/privacy" className="text-primary hover:underline">
            {tLegal('privacyPolicy')}
          </a>
        </div>
      )}
    </div>
  );
}