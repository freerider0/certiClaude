import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.warn('Stripe publishable key not found');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey, {
      // Add loading options for better COEP compatibility
      stripeAccount: undefined,
    }).catch((error) => {
      console.error('Failed to load Stripe:', error);
      return null;
    });
  }
  return stripePromise;
};

// Stripe Elements styling to match our design
export const stripeElementsOptions = {
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    },
  ],
};

export const stripeElementStyle = {
  base: {
    fontSize: '16px',
    fontFamily: '"Inter", sans-serif',
    fontWeight: '400',
    color: '#09090b', // zinc-950
    '::placeholder': {
      color: '#a1a1aa', // zinc-400
    },
    ':focus': {
      color: '#09090b',
    },
  },
  invalid: {
    color: '#ef4444', // red-500
    iconColor: '#ef4444',
  },
  complete: {
    color: '#16a34a', // green-600
    iconColor: '#16a34a',
  },
};

// Format price for display
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Get Stripe price ID based on plan and interval
export function getStripePriceId(planId: string, interval: 'month' | 'year' = 'month'): string {
  // In production, these would be your actual Stripe Price IDs
  const priceIds = {
    basic: {
      month: 'price_basic_monthly',
      year: 'price_basic_yearly'
    },
    pro: {
      month: 'price_pro_monthly',
      year: 'price_pro_yearly'
    },
    enterprise: {
      month: 'price_enterprise_monthly',
      year: 'price_enterprise_yearly'
    }
  };

  return priceIds[planId as keyof typeof priceIds]?.[interval] || '';
}