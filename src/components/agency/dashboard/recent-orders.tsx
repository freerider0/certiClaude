'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { es, ca, eu, gl } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, MapPin, User } from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  service_type: string;
  total_amount: number;
  property: {
    address: string;
    city: string;
  };
  customer: {
    name: string;
    email: string;
  };
}

interface RecentOrdersProps {
  orders: Order[];
}

const statusConfig = {
  pending: {
    label: 'pending',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
  },
  in_progress: {
    label: 'inProgress',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
  },
  completed: {
    label: 'completed',
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-100'
  },
  delivered: {
    label: 'delivered',
    variant: 'secondary' as const,
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100'
  }
};

const serviceTypeIcons: Record<string, string> = {
  cee_certificate: '📋',
  photography: '📷',
  videography: '🎥',
  virtual_tour: '🏠',
  floor_plan: '📐'
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  const t = useTranslations('agencyDashboard');
  const locale = useLocale();

  const getDateLocale = () => {
    const locales = { es, ca, eu, gl };
    return locales[locale as keyof typeof locales] || es;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', { locale: getDateLocale() });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (orders.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>{t('recentOrders.title')}</CardTitle>
          <CardDescription>{t('recentOrders.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('recentOrders.noOrders')}</p>
            <Button asChild>
              <Link href="/agency/orders/new">
                {t('recentOrders.createOrder')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('recentOrders.title')}</CardTitle>
            <CardDescription>{t('recentOrders.description')}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/agency/orders" className="flex items-center gap-1">
              {t('recentOrders.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {serviceTypeIcons[order.service_type] || '📄'}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium">
                      {t(`services.${order.service_type}`)}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.property.address}, {order.property.city}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{order.customer.name}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{order.customer.email}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-3 sm:mt-0">
                <Badge 
                  variant={statusConfig[order.status].variant}
                  className={statusConfig[order.status].className}
                >
                  {t(`orderStatus.${statusConfig[order.status].label}`)}
                </Badge>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('recentOrders.commission', { 
                      amount: formatCurrency(order.total_amount * 0.2) 
                    })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/agency/orders/${order.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}