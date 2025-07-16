'use client';

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Camera, Home, Ruler, Video, FileText, ShoppingCart, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { EditPropertyFormData } from '@/lib/validations/property';
import type { Property } from '@/app/[locale]/agency/properties/actions';

interface ServicesSectionProps {
  form: UseFormReturn<EditPropertyFormData>;
  property: Property;
}

interface ServiceItem {
  key: keyof Pick<EditPropertyFormData, 'has_photos' | 'has_cee' | 'has_floor_plan' | 'has_virtual_tour' | 'has_cedula'>;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  orderAction: string;
}

const services: ServiceItem[] = [
  {
    key: 'has_photos',
    label: 'Professional Photos',
    description: 'High-quality property photography',
    icon: Camera,
    orderAction: 'Order Photos'
  },
  {
    key: 'has_cee',
    label: 'Energy Certificate (CEE)',
    description: 'Energy efficiency certificate',
    icon: Home,
    orderAction: 'Order CEE'
  },
  {
    key: 'has_floor_plan',
    label: 'Floor Plan',
    description: 'Detailed floor plan drawing',
    icon: Ruler,
    orderAction: 'Order Floor Plan'
  },
  {
    key: 'has_virtual_tour',
    label: 'Virtual Tour',
    description: '360° virtual property tour',
    icon: Video,
    orderAction: 'Order Virtual Tour'
  },
  {
    key: 'has_cedula',
    label: 'Cedula (ID Document)',
    description: 'Property identification document',
    icon: FileText,
    orderAction: 'Order Cedula'
  }
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ServicesSection({ form, property }: ServicesSectionProps) {
  const getServiceStatus = (hasService: boolean) => {
    if (hasService) {
      return {
        icon: CheckCircle,
        label: 'Completed',
        color: 'bg-green-100 text-green-800',
        iconColor: 'text-green-600'
      };
    } else {
      return {
        icon: XCircle,
        label: 'Missing',
        color: 'bg-red-100 text-red-800',
        iconColor: 'text-red-600'
      };
    }
  };

  const handleOrderService = (service: ServiceItem) => {
    alert(`${service.orderAction} functionality will be implemented soon!`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Services</CardTitle>
          <CardDescription>
            Manage services and documents for this property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {services.map((service) => {
            const ServiceIcon = service.icon;
            const hasService = form.watch(service.key);
            const status = getServiceStatus(hasService);
            const StatusIcon = status.icon;

            return (
              <div key={service.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-muted p-2">
                    <ServiceIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{service.label}</h4>
                      <Badge className={status.color}>
                        <StatusIcon className={`mr-1 h-3 w-3 ${status.iconColor}`} />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name={service.key}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormLabel className="text-sm font-normal">
                          Mark as completed
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!hasService && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOrderService(service)}
                      className="cursor-pointer"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {service.orderAction}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Service History */}
      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
          <CardDescription>
            Track service orders and completion status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="rounded-full bg-green-100 p-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Professional Photos</p>
                <p className="text-xs text-muted-foreground">
                  Completed on March 15, 2024
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="rounded-full bg-green-100 p-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Energy Certificate</p>
                <p className="text-xs text-muted-foreground">
                  Completed on March 10, 2024
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="rounded-full bg-yellow-100 p-1">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Floor Plan</p>
                <p className="text-xs text-muted-foreground">
                  In progress - Expected completion: March 20, 2024
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}