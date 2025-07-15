import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { purchaseCreditsRequestSchema } from '@/lib/validations/billing';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Credit package prices in cents
const PACKAGE_PRICES = {
  pack_5: 2500,    // €25.00
  pack_10: 4500,   // €45.00
  pack_20: 8000,   // €80.00
};

const PACKAGE_CREDITS = {
  pack_5: 5,
  pack_10: 10,
  pack_20: 20,
};

export async function POST(request: Request) {
  try {
    // Get the current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's agency
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json(
        { error: 'No agency found' },
        { status: 400 }
      );
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', profile.agency_id)
      .single();

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = purchaseCreditsRequestSchema.parse(body);

    // Ensure we have a Stripe customer
    if (!agency.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No payment method on file. Please set up a subscription first.' },
        { status: 400 }
      );
    }

    // Save new payment method if requested
    if (validatedData.paymentMethodId && validatedData.saveCard) {
      await stripe.paymentMethods.attach(validatedData.paymentMethodId, {
        customer: agency.stripe_customer_id,
      });

      const paymentMethod = await stripe.paymentMethods.retrieve(validatedData.paymentMethodId);
      
      if (paymentMethod.card) {
        // Save to our database
        await supabase.from('payment_methods').insert({
          agency_id: agency.id,
          stripe_payment_method_id: paymentMethod.id,
          type: paymentMethod.type,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
          brand: paymentMethod.card.brand,
          is_default: false,
        });
      }
    }

    // Create payment intent
    const amount = PACKAGE_PRICES[validatedData.packageId];
    const credits = PACKAGE_CREDITS[validatedData.packageId];

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      customer: agency.stripe_customer_id,
      payment_method: validatedData.paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        agency_id: agency.id,
        package_id: validatedData.packageId,
        credits: credits.toString(),
      },
      receipt_email: validatedData.receiptEmail || user.email,
      description: `${credits} CertiFast Credits`,
    });

    // Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      // Add credits to agency
      const { data: newBalance } = await supabase.rpc('add_credits', {
        p_agency_id: agency.id,
        p_amount: credits,
        p_type: 'purchase',
        p_description: `Purchased ${credits} credits`,
        p_stripe_payment_intent_id: paymentIntent.id,
      });

      return NextResponse.json({
        success: true,
        credits: newBalance,
        paymentIntentId: paymentIntent.id,
      });
    }

    // Payment requires additional action (3D Secure)
    if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        requiresConfirmation: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    // Payment failed
    return NextResponse.json(
      { error: 'Payment failed. Please try again.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Credit purchase error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}