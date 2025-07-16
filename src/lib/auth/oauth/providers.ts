export interface OAuthProvider {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string; // Custom icon component name or Lucide icon
  scopes: string[];
  businessFeatures: string[];
  isEnabled: boolean;
  requiresApproval: boolean;
  color: string;
  darkColor?: string;
}

export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  google: {
    id: 'google',
    name: 'google',
    displayName: 'Google',
    description: 'Access Gmail, Calendar, and Drive integration',
    icon: 'GoogleIcon',
    scopes: ['email', 'profile', 'openid'],
    businessFeatures: [
      'Gmail integration',
      'Google Calendar sync',
      'Google Drive documents',
      'Google My Business'
    ],
    isEnabled: true,
    requiresApproval: false,
    color: '#4285f4',
    darkColor: '#5a95f5'
  },
  
  microsoft: {
    id: 'azure',
    name: 'azure',
    displayName: 'Microsoft',
    description: 'Connect with Outlook, Teams, and Office 365',
    icon: 'MicrosoftIcon',
    scopes: ['email', 'profile', 'User.Read', 'Calendars.Read'],
    businessFeatures: [
      'Outlook email sync',
      'Microsoft Teams integration',
      'SharePoint documents',
      'Office 365 tools'
    ],
    isEnabled: true,
    requiresApproval: false,
    color: '#0078d4',
    darkColor: '#106ebe'
  },
  
  linkedin_oidc: {
    id: 'linkedin_oidc',
    name: 'linkedin_oidc',
    displayName: 'LinkedIn',
    description: 'Professional networking and lead generation',
    icon: 'LinkedInIcon',
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    businessFeatures: [
      'Professional network access',
      'Company page integration',
      'Lead generation forms',
      'Property marketing'
    ],
    isEnabled: true,
    requiresApproval: true,
    color: '#0a66c2',
    darkColor: '#378fe9'
  },
  
  apple: {
    id: 'apple',
    name: 'apple',
    displayName: 'Apple',
    description: 'Sign in with Apple ID for iOS integration',
    icon: 'AppleIcon',
    scopes: ['email', 'profile'],
    businessFeatures: [
      'iOS device integration',
      'Privacy-focused authentication',
      'Apple ecosystem access'
    ],
    isEnabled: true,
    requiresApproval: false,
    color: '#000000',
    darkColor: '#1d1d1f'
  },
  
  facebook: {
    id: 'facebook',
    name: 'facebook',
    displayName: 'Facebook',
    description: 'Social media marketing and audience reach',
    icon: 'Share2', // Lucide icon name
    scopes: ['email', 'public_profile'],
    businessFeatures: [
      'Social media marketing',
      'Facebook page management',
      'Property advertising',
      'Audience insights'
    ],
    isEnabled: false, // Enable later
    requiresApproval: true,
    color: '#1877f2',
    darkColor: '#42a5f5'
  }
};

// Get only enabled providers
export function getEnabledProviders(): OAuthProvider[] {
  return Object.values(OAUTH_PROVIDERS).filter(provider => provider.isEnabled);
}

// Get provider configuration by ID
export function getProviderConfig(providerId: string): OAuthProvider | null {
  return OAUTH_PROVIDERS[providerId] || null;
}

// Get business integrations for a provider
export function getBusinessIntegrations(providerId: string): string[] {
  const provider = getProviderConfig(providerId);
  return provider?.businessFeatures || [];
}

// Check if provider requires manual approval
export function requiresApproval(providerId: string): boolean {
  const provider = getProviderConfig(providerId);
  return provider?.requiresApproval || false;
}

// Get provider display information
export function getProviderDisplay(providerId: string) {
  const provider = getProviderConfig(providerId);
  if (!provider) return null;
  
  return {
    name: provider.displayName,
    description: provider.description,
    icon: provider.icon,
    color: provider.color,
    darkColor: provider.darkColor || provider.color
  };
}

// Provider priority for display order
export const PROVIDER_PRIORITY = ['google', 'microsoft', 'linkedin_oidc', 'apple', 'facebook'];

// Get providers sorted by priority
export function getProvidersSorted(): OAuthProvider[] {
  const enabled = getEnabledProviders();
  return enabled.sort((a, b) => {
    const aIndex = PROVIDER_PRIORITY.indexOf(a.id);
    const bIndex = PROVIDER_PRIORITY.indexOf(b.id);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}