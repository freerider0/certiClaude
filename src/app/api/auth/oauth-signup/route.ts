import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { 
  mapGoogleProfile, 
  mapMicrosoftProfile, 
  mapLinkedInProfile,
  mapAppleProfile,
  mergeProfileData,
  type OAuthProfileData 
} from '@/lib/auth/oauth/profile-mapper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const oauthSignupSchema = z.object({
  userId: z.string().uuid(),
  provider: z.enum(['google', 'azure', 'linkedin_oidc', 'apple', 'facebook']),
  providerData: z.object({}).passthrough(), // Raw OAuth provider data
  additionalData: z.object({
    agencyName: z.string().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      province: z.string().optional(),
      country: z.string().default('España'),
    }).optional(),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Validate request body
    const body = await request.json();
    const validatedData = oauthSignupSchema.parse(body);

    const { userId, provider, providerData, additionalData } = validatedData;

    // Map OAuth provider data to our unified format
    let oauthProfile: OAuthProfileData;
    
    switch (provider) {
      case 'google':
        oauthProfile = await mapGoogleProfile(providerData);
        break;
      case 'azure':
        oauthProfile = await mapMicrosoftProfile(providerData);
        break;
      case 'linkedin_oidc':
        oauthProfile = await mapLinkedInProfile(providerData);
        break;
      case 'apple':
        oauthProfile = await mapAppleProfile(providerData);
        break;
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    // Check if user already has a profile (from trigger)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Create Stripe customer with enriched data
    const stripeCustomer = await stripe.customers.create({
      email: oauthProfile.email,
      name: oauthProfile.fullName,
      metadata: {
        user_id: userId,
        provider: provider,
        provider_id: oauthProfile.providerId,
        signup_method: 'oauth'
      },
      address: oauthProfile.location ? {
        line1: oauthProfile.location.street || '',
        city: oauthProfile.location.city || '',
        postal_code: oauthProfile.location.postalCode || '',
        state: oauthProfile.location.province || '',
        country: 'ES',
      } : undefined,
      phone: oauthProfile.phone,
    });

    // Determine agency name (prefer additional data, fallback to OAuth)
    const agencyName = additionalData?.agencyName || 
                      oauthProfile.company?.name || 
                      `${oauthProfile.fullName} Agency`;

    // Update or create the user's profile with OAuth data
    const profileUpdateData = {
      full_name: oauthProfile.fullName,
      role: 'agency' as const,
      oauth_providers: [provider],
      oauth_data: {
        [provider]: {
          ...oauthProfile,
          lastSync: new Date().toISOString()
        }
      },
      avatar_from_provider: oauthProfile.avatar,
      last_oauth_sync: new Date().toISOString(),
    };

    if (existingProfile) {
      await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId);
    } else {
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...profileUpdateData
        });
    }

    // Create agency with enhanced data
    const agencyData = {
      profile_id: userId,
      name: agencyName,
      contact_email: additionalData?.contactEmail || oauthProfile.email,
      contact_phone: additionalData?.contactPhone || oauthProfile.phone,
      address: additionalData?.address || oauthProfile.location || {},
      stripe_customer_id: stripeCustomer.id,
      subscription_status: 'inactive',
      credits_balance: 5, // Extra credit for OAuth signup
      credits_included: 0,
      logo_from_provider: oauthProfile.company?.logo,
      company_data: oauthProfile.company || {},
      social_profiles: {
        [provider]: {
          profile_url: getProviderProfileUrl(provider, oauthProfile.providerId),
          username: oauthProfile.providerData?.username || oauthProfile.email,
        }
      }
    };

    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .insert(agencyData)
      .select()
      .single();

    if (agencyError) {
      console.error('Agency creation error:', agencyError);
      // Clean up Stripe customer if agency creation fails
      await stripe.customers.del(stripeCustomer.id);
      throw new Error('Failed to create agency');
    }

    // Add initial trial credits with bonus for OAuth signup
    await supabase.from('credits_transactions').insert({
      agency_id: agency.id,
      type: 'subscription_grant',
      amount: 5,
      balance_after: 5,
      description: `Welcome credits for ${provider} signup`,
    });

    // Log OAuth signup activity
    await supabase.from('oauth_activities').insert({
      user_id: userId,
      provider: provider,
      action: 'signup',
      provider_user_id: oauthProfile.providerId,
      metadata: {
        email: oauthProfile.email,
        signup_method: 'oauth',
        agency_name: agencyName,
        stripe_customer_id: stripeCustomer.id,
        credits_granted: 5,
        provider_data: {
          verified: oauthProfile.verified,
          has_company_data: !!oauthProfile.company
        }
      },
    });

    // Log general activity
    await supabase.from('activity_logs').insert({
      user_id: userId,
      agency_id: agency.id,
      action: 'oauth_signup',
      entity_type: 'agency',
      entity_id: agency.id,
      metadata: {
        provider: provider,
        agency_name: agencyName,
        stripe_customer_id: stripeCustomer.id,
        oauth_profile_data: {
          has_avatar: !!oauthProfile.avatar,
          has_company: !!oauthProfile.company,
          has_location: !!oauthProfile.location,
          verified: oauthProfile.verified
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        agencyId: agency.id,
        stripeCustomerId: stripeCustomer.id,
        provider: provider,
        trialCredits: 5,
        profileData: {
          fullName: oauthProfile.fullName,
          email: oauthProfile.email,
          avatar: oauthProfile.avatar,
          hasCompanyData: !!oauthProfile.company,
          hasLocation: !!oauthProfile.location
        }
      },
    });

  } catch (error: any) {
    console.error('OAuth signup API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Handle Stripe errors
    if (error.type?.startsWith('Stripe')) {
      return NextResponse.json(
        { error: 'Payment system error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate profile URLs for different providers
function getProviderProfileUrl(provider: string, providerId: string): string {
  switch (provider) {
    case 'google':
      return `https://profiles.google.com/${providerId}`;
    case 'linkedin_oidc':
      return `https://linkedin.com/in/${providerId}`;
    case 'azure':
      return `https://profile.microsoft.com/${providerId}`;
    default:
      return '';
  }
}