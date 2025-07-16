import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateAgencyFormServer } from './create-agency-form-server';
import { JoinAgencyForm } from './join-agency-form';
import { StepNavigation } from './step-navigation';

type OnboardingStep = 'choose' | 'create-agency' | 'join-agency';

interface OnboardingFlowProps {
  userId: string;
  userEmail: string;
  step: OnboardingStep;
}

export async function OnboardingFlow({ userId, userEmail, step }: OnboardingFlowProps) {
  const t = await getTranslations('onboarding');

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
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold">{t('createAgency')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('createAgencyDescription')}
                </p>
                <StepNavigation step="create-agency" label={t('createAgency')} variant="default" />
              </div>
            </Card>

            {/* Join existing agency option */}
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold">{t('joinAgency')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('joinAgencyDescription')}
                </p>
                <StepNavigation step="join-agency" label={t('joinAgency')} variant="outline" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {step === 'create-agency' && (
        <CreateAgencyFormServer 
          userId={userId}
          userEmail={userEmail}
        />
      )}

      {step === 'join-agency' && (
        <JoinAgencyForm 
          userId={userId}
        />
      )}
    </div>
  );
}