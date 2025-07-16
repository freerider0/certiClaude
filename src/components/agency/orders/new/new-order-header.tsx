'use client';

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NewOrderHeaderProps {
  currentStep: string;
  steps: string[];
  onStepClick: (step: string) => void;
}

const stepLabels: Record<string, string> = {
  property: 'Property',
  service: 'Service',
  schedule: 'Schedule',
  customer: 'Customer',
  review: 'Review'
};

export function NewOrderHeader({ currentStep, steps, onStepClick }: NewOrderHeaderProps) {
  const router = useRouter();
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/agency/orders')}
          className="cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Order</h1>
          <p className="text-muted-foreground">
            Book a service for one of your properties
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isPast = index < currentStepIndex;
          const isClickable = index < currentStepIndex;

          return (
            <div key={step} className="flex-1">
              <button
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={cn(
                  "w-full text-left",
                  isClickable && "cursor-pointer"
                )}
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isPast && "border-primary bg-primary text-primary-foreground",
                      !isActive && !isPast && "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isPast ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "ml-4 h-0.5 flex-1 transition-colors",
                        isPast ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2 text-sm font-medium transition-colors",
                    isActive && "text-primary",
                    isPast && "text-primary",
                    !isActive && !isPast && "text-muted-foreground"
                  )}
                >
                  {stepLabels[step]}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}