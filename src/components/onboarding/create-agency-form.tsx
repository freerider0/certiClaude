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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateAgencyFormProps {
  userId: string;
  userEmail: string;
  onBack: () => void;
}

export function CreateAgencyForm({ userId, userEmail, onBack }: CreateAgencyFormProps) {
  const router = useRouter();
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    agencyName: '',
    contactPhone: '',
    street: '',
    city: '',
    postalCode: '',
    province: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/create-agency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          agencyName: formData.agencyName,
          contactEmail: userEmail,
          contactPhone: formData.contactPhone,
          address: {
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
            province: formData.province,
            country: 'España',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create agency');
      }

      toast.success(t('agencyCreated'), {
        description: t('redirectingToDashboard'),
      });

      // Redirect to agency dashboard
      setTimeout(() => {
        router.push('/agency/dashboard');
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create agency');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <CardTitle>{t('createAgency')}</CardTitle>
        </div>
        <CardDescription>
          {t('getStarted')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agency Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t('agencyInfo')}</h3>
            
            <div>
              <Label htmlFor="agencyName">{t('agencyName')}</Label>
              <Input
                id="agencyName"
                placeholder="Real Estate Pro"
                value={formData.agencyName}
                onChange={(e) => handleInputChange('agencyName', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">{t('contactPhone')}</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+34 600 000 000"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t('address')}</h3>
            
            <div>
              <Label htmlFor="street">{t('streetAddress')}</Label>
              <Input
                id="street"
                placeholder="Calle Gran Vía, 123"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">{t('city')}</Label>
                <Input
                  id="city"
                  placeholder="Madrid"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="postalCode">{t('postalCode')}</Label>
                <Input
                  id="postalCode"
                  placeholder="28001"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="province">{t('province')}</Label>
              <Select
                value={formData.province}
                onValueChange={(value) => handleInputChange('province', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Madrid">Madrid</SelectItem>
                  <SelectItem value="Barcelona">Barcelona</SelectItem>
                  <SelectItem value="Valencia">Valencia</SelectItem>
                  <SelectItem value="Sevilla">Sevilla</SelectItem>
                  <SelectItem value="Zaragoza">Zaragoza</SelectItem>
                  <SelectItem value="Málaga">Málaga</SelectItem>
                  <SelectItem value="Murcia">Murcia</SelectItem>
                  <SelectItem value="Palma">Palma</SelectItem>
                  <SelectItem value="Las Palmas">Las Palmas</SelectItem>
                  <SelectItem value="Bilbao">Bilbao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('creatingAgency')}
              </>
            ) : (
              t('createAgency')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}