import { z } from 'zod';

// Base interfaces for OAuth profile data
export interface OAuthProfileData {
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  company?: CompanyData;
  location?: AddressData;
  phone?: string;
  verified: boolean;
  locale?: string;
  timezone?: string;
  provider: string;
  providerId: string;
  providerData: any; // Raw provider data
}

export interface CompanyData {
  name?: string;
  industry?: string;
  size?: string;
  website?: string;
  description?: string;
  logo?: string;
  location?: AddressData;
}

export interface AddressData {
  street?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  formatted?: string;
}

export interface MergedProfile {
  profile: Partial<ProfileData>;
  agency: Partial<AgencyData>;
  conflicts: Conflict[];
  autoResolved: string[];
}

export interface Conflict {
  field: string;
  existing: any;
  incoming: any;
  suggestion: 'keep_existing' | 'use_new' | 'merge' | 'manual';
  reason: string;
}

export interface ProfileData {
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string;
  agencyName?: string;
  address?: AddressData;
}

export interface AgencyData {
  name: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: AddressData;
  website?: string;
  description?: string;
}

// Google profile mapping
export async function mapGoogleProfile(googleUser: any): Promise<OAuthProfileData> {
  const profile: OAuthProfileData = {
    email: googleUser.email,
    fullName: googleUser.name,
    firstName: googleUser.given_name,
    lastName: googleUser.family_name,
    avatar: googleUser.picture,
    verified: googleUser.email_verified || false,
    locale: googleUser.locale,
    provider: 'google',
    providerId: googleUser.sub,
    providerData: googleUser
  };

  // Extract company info from Google Workspace if available
  if (googleUser.hd) { // Hosted domain (Google Workspace)
    profile.company = {
      name: googleUser.hd,
      website: `https://${googleUser.hd}`
    };
  }

  return profile;
}

// Microsoft profile mapping
export async function mapMicrosoftProfile(msUser: any): Promise<OAuthProfileData> {
  const profile: OAuthProfileData = {
    email: msUser.mail || msUser.userPrincipalName,
    fullName: msUser.displayName,
    firstName: msUser.givenName,
    lastName: msUser.surname,
    phone: msUser.mobilePhone || msUser.businessPhones?.[0],
    verified: true, // Microsoft accounts are pre-verified
    provider: 'microsoft',
    providerId: msUser.id,
    providerData: msUser
  };

  // Extract company info
  if (msUser.companyName || msUser.jobTitle) {
    profile.company = {
      name: msUser.companyName,
      description: msUser.jobTitle
    };
  }

  // Extract location info
  if (msUser.city || msUser.state || msUser.country) {
    profile.location = {
      city: msUser.city,
      province: msUser.state,
      country: msUser.country
    };
  }

  return profile;
}

// LinkedIn profile mapping
export async function mapLinkedInProfile(linkedinUser: any): Promise<OAuthProfileData> {
  const profile: OAuthProfileData = {
    email: linkedinUser.email,
    fullName: linkedinUser.name,
    firstName: linkedinUser.given_name,
    lastName: linkedinUser.family_name,
    avatar: linkedinUser.picture,
    verified: linkedinUser.email_verified || false,
    locale: linkedinUser.locale,
    provider: 'linkedin',
    providerId: linkedinUser.sub,
    providerData: linkedinUser
  };

  // LinkedIn provides rich professional data
  if (linkedinUser.company) {
    profile.company = {
      name: linkedinUser.company,
      industry: linkedinUser.industry,
      size: linkedinUser.company_size,
      website: linkedinUser.company_website,
      description: linkedinUser.headline,
      logo: linkedinUser.company_logo
    };
  }

  if (linkedinUser.location) {
    profile.location = {
      formatted: linkedinUser.location,
      city: linkedinUser.locality,
      province: linkedinUser.region,
      country: linkedinUser.country
    };
  }

  return profile;
}

// Apple profile mapping
export async function mapAppleProfile(appleUser: any): Promise<OAuthProfileData> {
  return {
    email: appleUser.email,
    fullName: appleUser.name ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim() : '',
    firstName: appleUser.name?.firstName,
    lastName: appleUser.name?.lastName,
    verified: appleUser.email_verified || false,
    provider: 'apple',
    providerId: appleUser.sub,
    providerData: appleUser
  };
}

// Profile data merging with conflict detection
export function mergeProfileData(existing: ProfileData, oauth: OAuthProfileData): MergedProfile {
  const conflicts: Conflict[] = [];
  const autoResolved: string[] = [];
  const mergedProfile: Partial<ProfileData> = { ...existing };
  const mergedAgency: Partial<AgencyData> = {};

  // Email conflict detection
  if (existing.email && existing.email !== oauth.email) {
    conflicts.push({
      field: 'email',
      existing: existing.email,
      incoming: oauth.email,
      suggestion: 'keep_existing',
      reason: 'Email addresses must match for account linking'
    });
  } else if (!existing.email) {
    mergedProfile.email = oauth.email;
    autoResolved.push('email');
  }

  // Full name conflict detection
  if (existing.fullName && existing.fullName !== oauth.fullName) {
    if (oauth.fullName && oauth.fullName.length > existing.fullName.length) {
      conflicts.push({
        field: 'fullName',
        existing: existing.fullName,
        incoming: oauth.fullName,
        suggestion: 'use_new',
        reason: 'OAuth provider has more complete name information'
      });
    } else {
      conflicts.push({
        field: 'fullName',
        existing: existing.fullName,
        incoming: oauth.fullName,
        suggestion: 'keep_existing',
        reason: 'Existing name appears more complete'
      });
    }
  } else if (!existing.fullName && oauth.fullName) {
    mergedProfile.fullName = oauth.fullName;
    autoResolved.push('fullName');
  }

  // Avatar handling
  if (!existing.avatar && oauth.avatar) {
    mergedProfile.avatar = oauth.avatar;
    autoResolved.push('avatar');
  } else if (existing.avatar && oauth.avatar && existing.avatar !== oauth.avatar) {
    conflicts.push({
      field: 'avatar',
      existing: existing.avatar,
      incoming: oauth.avatar,
      suggestion: 'use_new',
      reason: 'OAuth provider may have more recent profile photo'
    });
  }

  // Phone number handling
  if (!existing.phone && oauth.phone) {
    mergedProfile.phone = oauth.phone;
    autoResolved.push('phone');
  } else if (existing.phone && oauth.phone && existing.phone !== oauth.phone) {
    conflicts.push({
      field: 'phone',
      existing: existing.phone,
      incoming: oauth.phone,
      suggestion: 'manual',
      reason: 'Phone numbers differ - manual verification needed'
    });
  }

  // Agency data from OAuth company info
  if (oauth.company) {
    if (oauth.company.name && !existing.agencyName) {
      mergedAgency.name = oauth.company.name;
      autoResolved.push('agencyName');
    } else if (oauth.company.name && existing.agencyName && oauth.company.name !== existing.agencyName) {
      conflicts.push({
        field: 'agencyName',
        existing: existing.agencyName,
        incoming: oauth.company.name,
        suggestion: 'manual',
        reason: 'Company names differ - verify which is correct'
      });
    }

    // Auto-populate agency fields if empty
    if (oauth.company.website) {
      mergedAgency.website = oauth.company.website;
      autoResolved.push('agencyWebsite');
    }
    
    if (oauth.company.description) {
      mergedAgency.description = oauth.company.description;
      autoResolved.push('agencyDescription');
    }
    
    if (oauth.company.logo) {
      mergedAgency.logo = oauth.company.logo;
      autoResolved.push('agencyLogo');
    }
  }

  // Address merging
  if (oauth.location && !existing.address) {
    mergedProfile.address = oauth.location;
    mergedAgency.address = oauth.location;
    autoResolved.push('address');
  }

  return {
    profile: mergedProfile,
    agency: mergedAgency,
    conflicts,
    autoResolved
  };
}

// Detect conflicts between existing and OAuth data
export function detectConflicts(existing: ProfileData, oauth: OAuthProfileData): Conflict[] {
  const merged = mergeProfileData(existing, oauth);
  return merged.conflicts;
}

// Suggest resolution for conflicts
export function suggestResolution(conflict: Conflict): string {
  switch (conflict.suggestion) {
    case 'keep_existing':
      return `Keep current value: "${conflict.existing}"`;
    case 'use_new':
      return `Use OAuth value: "${conflict.incoming}"`;
    case 'merge':
      return `Combine both values`;
    case 'manual':
      return `Manual review required`;
    default:
      return 'No suggestion available';
  }
}

// Validate OAuth profile data
export const oauthProfileSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  provider: z.enum(['google', 'microsoft', 'linkedin', 'apple', 'facebook']),
  providerId: z.string().min(1),
  verified: z.boolean(),
});

export function validateOAuthProfile(data: any): OAuthProfileData {
  const validated = oauthProfileSchema.parse(data);
  return data as OAuthProfileData;
}