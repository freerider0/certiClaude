'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { CreditPackages } from './credit-packages';
import { StripeElementsForm, useStripePayment } from '../payment/stripe-elements-form';
import { 
  creditPurchaseSchema, 
  type CreditPurchaseData,
  getPackageDetails 
} from '@/lib/validations/billing';
import { formatPrice } from '@/lib/stripe/client';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
}

interface PurchaseCreditsFormProps {
  paymentMethods?: PaymentMethod[];
  onSuccess?: () => void;
}

export function PurchaseCreditsForm({ paymentMethods = [], onSuccess }: PurchaseCreditsFormProps) {
  const { createPaymentMethod, confirmPayment, isLoading: stripeLoading } = useStripePayment();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreditPurchaseData>({
    resolver: zodResolver(creditPurchaseSchema),
    defaultValues: {
      packageId: 'pack_10',
      saveNewCard: false,
      paymentMethodId: paymentMethods[0]?.id,
    }
  });

  const selectedPackage = getPackageDetails(form.watch('packageId'));
  const useNewCard = !form.watch('paymentMethodId') || form.watch('paymentMethodId') === 'new';

  const onSubmit = async (data: CreditPurchaseData) => {
    try {
      setServerError(null);

      let paymentMethodId = data.paymentMethodId;

      // If using a new card, create payment method first
      if (useNewCard) {
        const { error, paymentMethod } = await createPaymentMethod();

        if (error || !paymentMethod) {
          throw new Error(error?.message || 'Failed to create payment method');
        }

        paymentMethodId = paymentMethod.id;
      }

      // Create payment intent on our backend
      const response = await fetch('/api/stripe/purchase-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: data.packageId,
          paymentMethodId,
          saveCard: useNewCard && data.saveNewCard,
          receiptEmail: data.receiptEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process payment');
      }

      // If payment requires confirmation (3D Secure)
      if (result.requiresConfirmation && result.clientSecret) {
        const { error: confirmError } = await confirmPayment(result.clientSecret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      // Success!
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setServerError(error.message);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Credit Package Selection */}
        <FormField
          control={form.control}
          name="packageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Credit Package</FormLabel>
              <FormControl>
                <CreditPackages
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Method Selection */}
        {paymentMethods.length > 0 && (
          <FormField
            control={form.control}
            name="paymentMethodId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value || 'new'}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-3 py-2">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label 
                          htmlFor={method.id} 
                          className="flex items-center space-x-3 cursor-pointer flex-1"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span className="font-normal">
                            •••• {method.last4}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Expires {method.expMonth}/{method.expYear}
                          </span>
                          <span className="text-sm text-muted-foreground capitalize">
                            {method.brand}
                          </span>
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-3 py-2">
                      <RadioGroupItem value="new" id="new-card" />
                      <Label htmlFor="new-card" className="cursor-pointer">
                        Use a new payment method
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* New Card Details */}
        {useNewCard && (
          <div className="space-y-4">
            <StripeElementsForm disabled={isSubmitting} />
            
            <FormField
              control={form.control}
              name="saveNewCard"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Save this card for future purchases
                    </FormLabel>
                    <FormDescription>
                      Quick and secure payments next time
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Receipt Email */}
        <FormField
          control={form.control}
          name="receiptEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt Email (optional)</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="receipt@example.com" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                We'll send the receipt to this email address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Error Display */}
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          size="lg"
          disabled={isSubmitting || stripeLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing payment...
            </>
          ) : (
            <>
              Purchase {selectedPackage?.credits} Credits - {formatPrice(selectedPackage?.price || 0)}
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Credits never expire and can be used for any certificate
        </p>
      </form>
    </Form>
  );
}