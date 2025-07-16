import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
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
        profile_id: userId, // This is required by the schema
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
    const { data: agencyUser, error: agencyUserError } = await supabase
      .from('agency_users')
      .insert({
        agency_id: agency.id,
        user_id: userId,
        role: 'owner',
      })
      .select()
      .single();

    if (agencyUserError) {
      console.error('Failed to create agency_users association:', agencyUserError);
      // Try to cleanup the created agency
      await supabase
        .from('agencies')
        .delete()
        .eq('id', agency.id);
      await stripe.customers.del(stripeCustomer.id);
      throw new Error('Failed to create agency association. Please try again.');
    }

    // No need to update profiles table as it no longer exists
    // Agency association is handled by agency_users table

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