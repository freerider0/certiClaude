'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatPrice } from '@/lib/stripe/client';
import { CREDIT_PACKAGES } from '@/lib/validations/billing';
import { cn } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

interface CreditPackagesProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CreditPackages({ value, onChange, disabled }: CreditPackagesProps) {
  return (
    <RadioGroup 
      value={value} 
      onValueChange={onChange}
      disabled={disabled}
      className="grid gap-4 md:grid-cols-3"
    >
      {CREDIT_PACKAGES.map((pkg) => (
        <label
          key={pkg.id}
          htmlFor={pkg.id}
          className={cn(
            "cursor-pointer transition-all",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <RadioGroupItem
            value={pkg.id}
            id={pkg.id}
            className="sr-only"
          />
          <Card 
            className={cn(
              "relative transition-all hover:shadow-md",
              value === pkg.id && "ring-2 ring-primary shadow-md"
            )}
          >
            {pkg.badge && (
              <Badge 
                className="absolute -top-3 right-4" 
                variant={pkg.badge === 'Best Value' ? 'default' : 'secondary'}
              >
                {pkg.badge}
              </Badge>
            )}

            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {pkg.credits} Credits
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(pkg.price)}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  {formatPrice(pkg.perCredit)} per certificate
                </p>
                {pkg.savings && (
                  <p className="text-green-600 font-medium">
                    Save {pkg.savings} compared to basic
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </label>
      ))}
    </RadioGroup>
  );
}