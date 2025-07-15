import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Handler for payment intent succeeded (credit purchases)
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  if (!paymentIntent.metadata?.agency_id || !paymentIntent.metadata?.credits) {
    return;
  }

  const supabase = createClient();
  const agencyId = paymentIntent.metadata.agency_id;
  const credits = parseInt(paymentIntent.metadata.credits);

  try {
    // Add credits to agency
    await supabase.rpc('add_credits', {
      p_agency_id: agencyId,
      p_amount: credits,
      p_type: 'purchase',
      p_description: `Purchased ${credits} credits`,
      p_stripe_payment_intent_id: paymentIntent.id,
    });

    console.log(`Added ${credits} credits to agency ${agencyId}`);
  } catch (error) {
    console.error('Error adding credits:', error);
  }
}

// Handler for invoice payment succeeded (subscription renewals)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    return;
  }

  const supabase = createClient();

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    
    if (!subscription.metadata?.agency_id) {
      return;
    }

    const agencyId = subscription.metadata.agency_id;

    // Reset monthly credits based on plan
    const planCredits = {
      basic: 10,
      pro: 30,
      enterprise: 100,
    };

    const tier = subscription.metadata.plan_id as keyof typeof planCredits;
    const monthlyCredits = planCredits[tier] || 10;

    // Update agency with new period and reset credits
    await supabase
      .from('agencies')
      .update({
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        credits_included: monthlyCredits,
      })
      .eq('id', agencyId);

    // Add monthly credits
    await supabase.rpc('add_credits', {
      p_agency_id: agencyId,
      p_amount: monthlyCredits,
      p_type: 'subscription_grant',
      p_description: `Monthly credits for ${tier} plan`,
    });

    console.log(`Renewed subscription for agency ${agencyId} with ${monthlyCredits} credits`);
  } catch (error) {
    console.error('Error handling invoice payment:', error);
  }
}

// Handler for subscription created/updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!subscription.metadata?.agency_id) {
    return;
  }

  const supabase = createClient();
  const agencyId = subscription.metadata.agency_id;

  try {
    // Update agency subscription info
    await supabase
      .from('agencies')
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_tier: subscription.metadata.plan_id,
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', agencyId);

    // Log subscription change
    await supabase.from('subscription_history').insert({
      agency_id: agencyId,
      stripe_subscription_id: subscription.id,
      action: 'updated',
      tier: subscription.metadata.plan_id,
      metadata: { status: subscription.status },
    });

    console.log(`Updated subscription for agency ${agencyId}: ${subscription.status}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

// Handler for subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!subscription.metadata?.agency_id) {
    return;
  }

  const supabase = createClient();
  const agencyId = subscription.metadata.agency_id;

  try {
    // Update agency subscription status
    await supabase
      .from('agencies')
      .update({
        subscription_status: 'canceled',
        credits_included: 0, // No more monthly credits
      })
      .eq('id', agencyId);

    // Log subscription cancellation
    await supabase.from('subscription_history').insert({
      agency_id: agencyId,
      stripe_subscription_id: subscription.id,
      action: 'cancelled',
      tier: subscription.metadata.plan_id,
      metadata: { canceled_at: new Date().toISOString() },
    });

    console.log(`Cancelled subscription for agency ${agencyId}`);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
  }
}