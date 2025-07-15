'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditBalanceProps {
  balance: number;
  included: number;
  used: number;
  onTopUp?: () => void;
  className?: string;
}

export function CreditBalance({ 
  balance, 
  included, 
  used, 
  onTopUp,
  className 
}: CreditBalanceProps) {
  const extra = Math.max(0, balance - (included - used));
  const includedRemaining = Math.max(0, included - used);
  const percentageUsed = included > 0 ? (used / included) * 100 : 0;
  const isLowCredits = balance < 3;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {isLowCredits && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-500/10 border-b border-yellow-500/20 p-2">
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            <span>Low credits! Top up to continue creating certificates.</span>
          </div>
        </div>
      )}
      
      <CardHeader className={cn(isLowCredits && "pt-12")}>
        <div className="flex items-center justify-between">
          <CardTitle>Credit Balance</CardTitle>
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          Available credits for certificate generation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Total Balance */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold">{balance}</div>
          <p className="text-sm text-muted-foreground mt-1">Total Credits</p>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly included</span>
            <span className="font-medium">{includedRemaining} / {included}</span>
          </div>
          
          <Progress value={percentageUsed} className="h-2" />
          
          {extra > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Extra credits</span>
              <span className="font-medium text-green-600">+{extra}</span>
            </div>
          )}
        </div>

        {/* Usage Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Used this month</span>
            <span>{used} certificates</span>
          </div>
        </div>

        {/* Top Up Button */}
        {onTopUp && (
          <Button 
            onClick={onTopUp} 
            className="w-full"
            variant={isLowCredits ? "default" : "outline"}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Add More Credits
          </Button>
        )}
      </CardContent>
    </Card>
  );
}