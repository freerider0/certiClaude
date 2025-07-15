'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/stripe/client';
import { getPlanDetails } from '@/lib/validations/billing';
import { Calendar, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CurrentPlanCardProps {
  subscription: {
    tier: 'basic' | 'pro' | 'enterprise';
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd?: boolean;
  };
  onChangePlan?: () => void;
  onCancel?: () => void;
  onReactivate?: () => void;
}

export function CurrentPlanCard({ 
  subscription, 
  onChangePlan, 
  onCancel,
  onReactivate 
}: CurrentPlanCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const planDetails = getPlanDetails(subscription.tier);

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      case 'trialing':
        return <Badge variant="outline">Trial</Badge>;
      default:
        return <Badge variant="secondary">{subscription.status}</Badge>;
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Current Subscription</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Manage your subscription and billing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Plan Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">{planDetails?.name} Plan</h4>
            <span className="text-2xl font-bold">
              {formatPrice(planDetails?.price || 0)}/month
            </span>
          </div>
          
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• {planDetails?.certificates} certificates included monthly</li>
            {planDetails?.features.map((feature, i) => (
              <li key={i}>• {feature}</li>
            ))}
          </ul>
        </div>

        {/* Billing Info */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Next billing date
            </span>
            <span className="font-medium">
              {format(subscription.currentPeriodEnd, 'PPP', { locale: es })}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Payment method
            </span>
            <Button variant="link" size="sm" className="h-auto p-0">
              Update
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              Auto-renewal
            </span>
            <span className="font-medium">
              {subscription.cancelAtPeriodEnd ? 'Disabled' : 'Enabled'}
            </span>
          </div>
        </div>

        {/* Cancellation Warning */}
        {subscription.cancelAtPeriodEnd && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">
                Subscription ending soon
              </p>
              <p className="text-yellow-700 mt-1">
                Your subscription will end on {format(subscription.currentPeriodEnd, 'PPP', { locale: es })}.
                You'll lose access to premium features after this date.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
          <>
            <Button onClick={onChangePlan} className="flex-1">
              Change Plan
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isCancelling}
            >
              Cancel Subscription
            </Button>
          </>
        )}
        
        {subscription.cancelAtPeriodEnd && onReactivate && (
          <Button onClick={onReactivate} className="w-full">
            Reactivate Subscription
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}