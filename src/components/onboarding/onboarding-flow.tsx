'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateAgencyForm } from './create-agency-form';
import { JoinAgencyForm } from './join-agency-form';

type OnboardingStep = 'choose' | 'create-agency' | 'join-agency';

interface OnboardingFlowProps {
  userId: string;
  userEmail: string;
}

export function OnboardingFlow({ userId, userEmail }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('choose');
  const t = useTranslations('onboarding');

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">{t('welcome')}</h1>
        <p className="text-muted-foreground">
          {t('getStarted')}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
            step === 'choose' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            1
          </div>
          <div className="w-20 h-1 bg-muted" />
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
            step !== 'choose' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            2
          </div>
        </div>
      </div>

      {/* Content */}
      {step === 'choose' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center mb-8">
            {t('howToProceed')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create new agency option */}
            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setStep('create-agency')}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold">{t('createAgency')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('createAgencyDescription')}
                </p>
                <Button className="w-full">
                  {t('createAgency')}
                </Button>
              </div>
            </Card>

            {/* Join existing agency option */}
            <Card 
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setStep('join-agency')}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold">{t('joinAgency')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('joinAgencyDescription')}
                </p>
                <Button className="w-full" variant="outline">
                  {t('joinAgency')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {step === 'create-agency' && (
        <CreateAgencyForm 
          userId={userId}
          userEmail={userEmail}
          onBack={() => setStep('choose')}
        />
      )}

      {step === 'join-agency' && (
        <JoinAgencyForm 
          userId={userId}
          onBack={() => setStep('choose')}
        />
      )}
    </div>
  );
}