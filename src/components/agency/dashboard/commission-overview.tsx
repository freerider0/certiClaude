'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CommissionOverviewProps {
  agencyId: string;
}

export function CommissionOverview({ agencyId }: CommissionOverviewProps) {
  const t = useTranslations('agencyDashboard');

  // Mock data - in production this would come from the API
  const commissionData = {
    currentMonth: {
      total: 4560,
      paid: 2340,
      pending: 1420,
      processing: 800
    },
    averageCommissionRate: 20,
    topServices: [
      { service: 'cee_certificate', revenue: 1850, count: 12 },
      { service: 'photography', revenue: 1200, count: 8 },
      { service: 'virtual_tour', revenue: 980, count: 5 },
      { service: 'floor_plan', revenue: 530, count: 4 }
    ],
    nextPayout: {
      date: '2024-02-01',
      amount: 1420
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getServiceIcon = (service: string) => {
    const icons: Record<string, string> = {
      cee_certificate: '📋',
      photography: '📷',
      videography: '🎥',
      virtual_tour: '🏠',
      floor_plan: '📐'
    };
    return icons[service] || '📄';
  };

  const totalRevenue = commissionData.topServices.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('commission.title')}</CardTitle>
            <CardDescription>{t('commission.description')}</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {commissionData.averageCommissionRate}% {t('commission.rate')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Commission Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('commission.monthlyProgress')}</span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(commissionData.currentMonth.paid)} / {formatCurrency(commissionData.currentMonth.total)}
            </span>
          </div>
          <Progress 
            value={(commissionData.currentMonth.paid / commissionData.currentMonth.total) * 100} 
            className="h-2"
          />
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-muted-foreground">{t('commission.paid')}</span>
              </div>
              <p className="text-sm font-medium">{formatCurrency(commissionData.currentMonth.paid)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="text-xs text-muted-foreground">{t('commission.pending')}</span>
              </div>
              <p className="text-sm font-medium">{formatCurrency(commissionData.currentMonth.pending)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-xs text-muted-foreground">{t('commission.processing')}</span>
              </div>
              <p className="text-sm font-medium">{formatCurrency(commissionData.currentMonth.processing)}</p>
            </div>
          </div>
        </div>

        {/* Next Payout */}
        <div className="rounded-lg bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t('commission.nextPayout')}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(commissionData.nextPayout.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {formatCurrency(commissionData.nextPayout.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div>
          <h4 className="text-sm font-medium mb-3">{t('commission.topServices')}</h4>
          <div className="space-y-2">
            {commissionData.topServices.map((service) => (
              <div key={service.service} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getServiceIcon(service.service)}</span>
                  <div>
                    <p className="text-sm font-medium">
                      {t(`services.${service.service}`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.count} {t('commission.orders')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(service.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((service.revenue / totalRevenue) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href="/agency/earnings">
              <DollarSign className="h-4 w-4 mr-1" />
              {t('commission.viewDetails')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href="/agency/pricing">
              {t('commission.managePricing')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}