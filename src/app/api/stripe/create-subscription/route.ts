import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createSubscriptionRequestSchema } from '@/lib/validations/billing';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Stripe price IDs (you need to create these in your Stripe dashboard)
const PRICE_IDS = {
  basic: process.env.STRIPE_PRICE_BASIC || 'price_basic_test',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_test',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_test',
};

// Credits included per plan
const PLAN_CREDITS = {
  basic: 10,
  pro: 30,
  enterprise: 100,
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
    const validatedData = createSubscriptionRequestSchema.parse(body);

    // Create or get Stripe customer
    let customerId = agency.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: agency.name,
        metadata: {
          agency_id: agency.id,
          user_id: user.id,
        },
        address: validatedData.billingAddress,
        ...(validatedData.vatNumber && { tax_id_data: [{ type: 'eu_vat', value: validatedData.vatNumber }] }),
      });
      customerId = customer.id;

      // Update agency with Stripe customer ID
      await supabase
        .from('agencies')
        .update({ stripe_customer_id: customerId })
        .eq('id', agency.id);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(validatedData.paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method if requested
    if (validatedData.saveCard) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: validatedData.paymentMethodId,
        },
      });

      // Save payment method details in our database
      const paymentMethod = await stripe.paymentMethods.retrieve(validatedData.paymentMethodId);
      
      if (paymentMethod.card) {
        await supabase.from('payment_methods').insert({
          agency_id: agency.id,
          stripe_payment_method_id: paymentMethod.id,
          type: paymentMethod.type,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
          brand: paymentMethod.card.brand,
          is_default: true,
        });
      }
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: PRICE_IDS[validatedData.planId] }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        agency_id: agency.id,
        plan_id: validatedData.planId,
      },
    });

    // Update agency with subscription info
    const credits = PLAN_CREDITS[validatedData.planId];
    
    await supabase
      .from('agencies')
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_tier: validatedData.planId,
        credits_balance: credits,
        credits_included: credits,
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', agency.id);

    // Log subscription creation
    await supabase.from('subscription_history').insert({
      agency_id: agency.id,
      stripe_subscription_id: subscription.id,
      action: 'created',
      tier: validatedData.planId,
      metadata: { price_id: PRICE_IDS[validatedData.planId] },
    });

    // Add initial credits
    await supabase.rpc('add_credits', {
      p_agency_id: agency.id,
      p_amount: credits,
      p_type: 'subscription_grant',
      p_description: `Initial credits for ${validatedData.planId} plan`,
    });

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      requiresAction: paymentIntent.status === 'requires_action',
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    
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
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}