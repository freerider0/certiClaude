'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface JoinAgencyFormProps {
  userId: string;
  onBack: () => void;
}

export function JoinAgencyForm({ userId, onBack }: JoinAgencyFormProps) {
  const router = useRouter();
  const t = useTranslations('onboarding');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/join-agency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          inviteCode: inviteCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join agency');
      }

      toast.success(t('joinedAgency'), {
        description: `${t('welcomeToAgency')} ${data.agencyName}`,
      });

      // Redirect to agency dashboard
      setTimeout(() => {
        router.push('/agency/dashboard');
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join agency');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{t('joinAgency')}</CardTitle>
        </div>
        <CardDescription>
          {t('joinAgencyDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertDescription>
              {t('askAdminForCode')}
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="inviteCode">{t('invitationCode')}</Label>
            <Input
              id="inviteCode"
              placeholder={t('enterInviteCode')}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              maxLength={6}
              required
              disabled={isLoading}
              className="text-center text-2xl font-mono tracking-widest"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {t('enterInviteCode')}
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || inviteCode.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('joiningAgency')}
              </>
            ) : (
              t('joinAgency')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}