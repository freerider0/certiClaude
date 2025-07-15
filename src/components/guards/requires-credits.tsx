'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CreditCard } from 'lucide-react';
import { useSupabase } from '@/components/providers/supabase-provider';

interface RequiresCreditsProps {
  children: React.ReactNode;
  requiredCredits?: number;
  onInsufficientCredits?: () => void;
}

export function RequiresCredits({ 
  children, 
  requiredCredits = 1,
  onInsufficientCredits 
}: RequiresCreditsProps) {
  const router = useRouter();
  const supabase = useSupabase();
  const [hasCredits, setHasCredits] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    checkCredits();
  }, []);

  const checkCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Get user's agency
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      router.push('/onboarding');
      return;
    }

    // Check credit balance
    const { data: agency } = await supabase
      .from('agencies')
      .select('credits_balance, subscription_status')
      .eq('id', profile.agency_id)
      .single();

    if (!agency) {
      setHasCredits(false);
      return;
    }

    setCreditBalance(agency.credits_balance || 0);
    const sufficient = (agency.credits_balance || 0) >= requiredCredits;
    
    setHasCredits(sufficient);
    if (!sufficient) {
      setShowModal(true);
      if (onInsufficientCredits) {
        onInsufficientCredits();
      }
    }
  };

  const handleTopUp = () => {
    router.push('/dashboard/billing');
  };

  const handleUpgrade = () => {
    router.push('/dashboard/billing/upgrade');
  };

  // Still checking
  if (hasCredits === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Checking credits...</p>
        </div>
      </div>
    );
  }

  // Has sufficient credits
  if (hasCredits) {
    return <>{children}</>;
  }

  // Insufficient credits - show modal
  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <DialogTitle>Insufficient Credits</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              You need {requiredCredits} credit{requiredCredits > 1 ? 's' : ''} to create a certificate, 
              but you only have {creditBalance} credit{creditBalance !== 1 ? 's' : ''} remaining.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Quick Options:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Buy 5 credits for €25
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Upgrade your plan for more monthly credits
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={handleTopUp}>
              Buy More Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fallback content */}
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Insufficient Credits</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don't have enough credits to continue. Purchase more credits or upgrade your plan.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={handleTopUp}>
            Manage Credits
          </Button>
        </div>
      </div>
    </>
  );
}