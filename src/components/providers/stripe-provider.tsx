'use client';

import { Elements } from '@stripe/react-stripe-js';
import { getStripe, stripeElementsOptions } from '@/lib/stripe/client';
import { useEffect, useState } from 'react';
import { Stripe } from '@stripe/stripe-js';

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    // Only load Stripe on the client side and when needed
    if (typeof window !== 'undefined') {
      setStripePromise(getStripe());
    }
  }, []);

  // Don't render Elements until we have the stripe promise
  if (!stripePromise) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={stripeElementsOptions}>
      {children}
    </Elements>
  );
}