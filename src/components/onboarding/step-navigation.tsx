'use client';

import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  step: string;
  label: string;
  variant?: 'default' | 'outline';
}

export function StepNavigation({ step, label, variant = 'default' }: StepNavigationProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/onboarding?step=${step}`);
  };

  return (
    <Button 
      className="w-full" 
      variant={variant}
      onClick={handleNavigate}
    >
      {label}
    </Button>
  );
}