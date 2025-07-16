'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  label: string;
}

interface AddPropertyHeaderProps {
  steps: Step[];
  currentStep: number;
  onBack?: () => void;
}

export function AddPropertyHeader({ steps, currentStep, onBack }: AddPropertyHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Link href="/agency/properties">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Properties
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold">Add New Property</h1>
            <p className="text-sm text-muted-foreground">
              Use document scanning for faster property creation
            </p>
          </div>
        </div>

        <Link href="/agency/properties">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <X className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="relative flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    index <= currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/25 bg-background text-muted-foreground"
                  )}
                >
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={cn(
                    "text-xs",
                    index <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 px-4">
                  <div className="h-0.5 bg-muted-foreground/25">
                    <div
                      className={cn(
                        "h-full bg-primary transition-all duration-300",
                        index < currentStep ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}