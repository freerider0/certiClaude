import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      userId,
      agencyName,
      contactEmail,
      contactPhone,
      address,
    } = body;

    // Validate required fields
    if (!userId || !agencyName || !contactEmail || !contactPhone || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start transaction
    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: contactEmail,
      name: agencyName,
      metadata: {
        agencyName,
      },
    });

    // Create agency
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        name: agencyName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address,
        stripe_customer_id: stripeCustomer.id,
        subscription_status: 'inactive',
      })
      .select()
      .single();

    if (agencyError) {
      // Cleanup Stripe customer if agency creation fails
      await stripe.customers.del(stripeCustomer.id);
      throw agencyError;
    }

    // Create agency_users relationship (owner role)
    const { error: agencyUserError } = await supabase
      .from('agency_users')
      .insert({
        agency_id: agency.id,
        user_id: userId,
        role: 'owner',
      });

    if (agencyUserError) {
      throw agencyUserError;
    }

    // Update user profile with agency_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        agency_id: agency.id,
        role: 'agency' 
      })
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    return NextResponse.json({
      success: true,
      agency: {
        id: agency.id,
        name: agency.name,
      },
    });

  } catch (error) {
    console.error('Error creating agency:', error);
    return NextResponse.json(
      { error: 'Failed to create agency' },
      { status: 500 }
    );
  }
}