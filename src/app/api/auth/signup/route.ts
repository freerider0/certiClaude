import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const signupSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().min(2),
  email: z.string().email(),
  agencyName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    postalCode: z.string().min(5),
    province: z.string().min(2),
    country: z.string().default('España'),
  }),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Validate request body
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const {
      userId,
      fullName,
      email,
      agencyName,
      contactEmail,
      contactPhone,
      address,
    } = validatedData;

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: email,
      name: fullName,
      metadata: {
        user_id: userId,
        agency_name: agencyName,
      },
      address: {
        line1: address.street,
        city: address.city,
        postal_code: address.postalCode,
        state: address.province,
        country: 'ES', // Spain
      },
      phone: contactPhone,
    });

    // Update the user's profile with full information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        role: 'agency', // This user will be the agency owner
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw new Error('Failed to update profile');
    }

    // Create the agency record
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        profile_id: userId,
        name: agencyName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address: address,
        stripe_customer_id: stripeCustomer.id,
        subscription_status: 'inactive',
        // Start with trial credits
        credits_balance: 3,
        credits_included: 0,
      })
      .select()
      .single();

    if (agencyError) {
      console.error('Agency creation error:', agencyError);
      // If agency creation fails, we should delete the Stripe customer
      await stripe.customers.del(stripeCustomer.id);
      throw new Error('Failed to create agency');
    }

    // Add initial trial credits transaction
    await supabase.from('credits_transactions').insert({
      agency_id: agency.id,
      type: 'subscription_grant',
      amount: 3,
      balance_after: 3,
      description: 'Welcome trial credits',
    });

    // Log the signup activity
    await supabase.from('activity_logs').insert({
      user_id: userId,
      agency_id: agency.id,
      action: 'user_signup',
      entity_type: 'agency',
      entity_id: agency.id,
      metadata: {
        agency_name: agencyName,
        stripe_customer_id: stripeCustomer.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        agencyId: agency.id,
        stripeCustomerId: stripeCustomer.id,
        trialCredits: 3,
      },
    });

  } catch (error: any) {
    console.error('Signup API error:', error);

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