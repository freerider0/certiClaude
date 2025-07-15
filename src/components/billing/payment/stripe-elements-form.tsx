'use client';

import { 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement,
  useStripe,
  useElements 
} from '@stripe/react-stripe-js';
import { stripeElementStyle } from '@/lib/stripe/client';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface StripeElementsFormProps {
  className?: string;
  disabled?: boolean;
}

export function StripeElementsForm({ className, disabled }: StripeElementsFormProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label htmlFor="card-number">Card Number</Label>
        <div className="mt-1.5 p-3 border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
          <CardNumberElement 
            id="card-number"
            options={{ 
              style: stripeElementStyle,
              disabled,
              showIcon: true,
            }}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="card-expiry">Expiry Date</Label>
          <div className="mt-1.5 p-3 border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
            <CardExpiryElement 
              id="card-expiry"
              options={{ 
                style: stripeElementStyle,
                disabled
              }}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="card-cvc">CVC</Label>
          <div className="mt-1.5 p-3 border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
            <CardCvcElement 
              id="card-cvc"
              options={{ 
                style: stripeElementStyle,
                disabled
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to handle Stripe Elements payment
export function useStripePayment() {
  const stripe = useStripe();
  const elements = useElements();

  const createPaymentMethod = async (billingDetails?: any) => {
    if (!stripe || !elements) {
      return { error: { message: 'Stripe not loaded' } };
    }

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      return { error: { message: 'Card element not found' } };
    }

    return await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: billingDetails,
    });
  };

  const confirmPayment = async (clientSecret: string) => {
    if (!stripe || !elements) {
      return { error: { message: 'Stripe not loaded' } };
    }

    return await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement)!,
      }
    });
  };

  return {
    stripe,
    elements,
    createPaymentMethod,
    confirmPayment,
    isLoading: !stripe || !elements,
  };
}