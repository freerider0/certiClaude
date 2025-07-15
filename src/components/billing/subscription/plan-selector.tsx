'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/validations/billing';
import { formatPrice } from '@/lib/stripe/client';
import { cn } from '@/lib/utils';

interface PlanSelectorProps {
  value: string;
  onChange: (value: string) => void;
  currentPlan?: string;
  disabled?: boolean;
}

export function PlanSelector({ value, onChange, currentPlan, disabled }: PlanSelectorProps) {
  return (
    <RadioGroup 
      value={value} 
      onValueChange={onChange}
      disabled={disabled}
      className="grid gap-4 md:grid-cols-3"
    >
      {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
        const isCurrentPlan = currentPlan === plan.id;
        const isSelected = value === plan.id;
        
        return (
          <label
            key={plan.id}
            htmlFor={plan.id}
            className={cn(
              "cursor-pointer transition-all",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <RadioGroupItem
              value={plan.id}
              id={plan.id}
              className="sr-only"
            />
            <Card 
              className={cn(
                "relative transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary shadow-md",
                isCurrentPlan && "border-primary"
              )}
            >
              {isCurrentPlan && (
                <Badge className="absolute -top-3 right-4" variant="default">
                  Current Plan
                </Badge>
              )}
              
              {plan.id === 'pro' && !isCurrentPlan && (
                <Badge className="absolute -top-3 right-4" variant="secondary">
                  Most Popular
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      <strong>{plan.certificates} certificates</strong> per month
                    </span>
                  </li>
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </label>
        );
      })}
    </RadioGroup>
  );
}