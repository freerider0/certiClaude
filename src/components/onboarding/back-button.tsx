'use client';

import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  disabled?: boolean;
}

export function BackButton({ disabled }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/onboarding');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      disabled={disabled}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
}