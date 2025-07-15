'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { OAuthProvider } from '@/lib/auth/oauth/providers';
import { initiateOAuthFlow } from '@/lib/auth/supabase-oauth';
import { 
  GoogleIcon, 
  LinkedInIcon, 
  MicrosoftIcon, 
  AppleIcon 
} from '@/components/icons';
import { 
  Mail, 
  Building2, 
  Users, 
  Smartphone, 
  Share2,
  Loader2,
  ArrowRight 
} from 'lucide-react';

interface OAuthButtonProps {
  provider: OAuthProvider;
  mode: 'login' | 'signup';
  variant?: 'default' | 'outline';
  showFeatures?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

const iconMap = {
  GoogleIcon: GoogleIcon,
  LinkedInIcon: LinkedInIcon,
  MicrosoftIcon: MicrosoftIcon,
  AppleIcon: AppleIcon,
  Mail: Mail,
  Building2: Building2,
  Users: Users,
  Smartphone: Smartphone,
  Share2: Share2,
};

export function OAuthButton({
  provider,
  mode,
  variant = 'outline',
  showFeatures = false,
  onSuccess,
  onError,
  className = ''
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const tOAuth = useTranslations('oauth');
  
  const IconComponent = iconMap[provider.icon as keyof typeof iconMap] || Mail;

  const handleClick = async () => {
    setIsLoading(true);
    
    try {
      const result = await initiateOAuthFlow(provider.id, {
        redirectTo: `${window.location.origin}/auth/callback?mode=${mode}`,
        queryParams: {
          mode,
          provider: provider.id
        }
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // OAuth flow initiated successfully
      // User will be redirected to provider
      onSuccess?.();
      
    } catch (error: any) {
      console.error(`${provider.displayName} OAuth error:`, error);
      onError?.(error.message || `Failed to sign in with ${provider.displayName}`);
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        variant={variant}
        className={`
          w-full relative h-12 font-medium transition-all duration-200
          ${variant === 'outline' 
            ? 'border-2 hover:bg-muted/50' 
            : 'text-white'
          }
        `}
        style={{
          borderColor: variant === 'outline' ? provider.color : undefined,
          backgroundColor: variant === 'default' ? provider.color : undefined,
          color: variant === 'outline' ? provider.color : undefined
        }}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <IconComponent className="w-5 h-5 mr-3" />
        )}
        
        <span className="flex-1 text-left">
          {tOAuth('continueWith')} {provider.displayName}
        </span>
        
        {!isLoading && (
          <ArrowRight className="w-4 h-4 opacity-60" />
        )}
      </Button>

      {showFeatures && provider.businessFeatures.length > 0 && (
        <div className="text-xs text-muted-foreground pl-3">
          <p className="font-medium mb-1">Business features:</p>
          <ul className="space-y-0.5">
            {provider.businessFeatures.slice(0, 2).map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1 h-1 bg-current rounded-full mr-2" />
                {feature}
              </li>
            ))}
            {provider.businessFeatures.length > 2 && (
              <li className="text-muted-foreground/70">
                +{provider.businessFeatures.length - 2} more
              </li>
            )}
          </ul>
        </div>
      )}

      {provider.requiresApproval && (
        <div className="text-xs text-amber-600 dark:text-amber-400 pl-3 flex items-center">
          <span className="w-1 h-1 bg-current rounded-full mr-2" />
          {tOAuth('requiresBusinessVerification')}
        </div>
      )}
    </div>
  );
}