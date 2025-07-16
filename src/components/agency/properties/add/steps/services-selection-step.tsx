'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { propertyServices, type ServiceType } from '@/lib/validations/property';
import { Camera, Home, Ruler, Video, Palette, Calendar, Euro, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServicesSelectionStepProps {
  onNext: (services: ServiceType[]) => void;
  selectedServices: ServiceType[];
}

const iconMap = {
  Camera,
  Home,
  Ruler,
  Video,
  Palette
};

export function ServicesSelectionStep({ onNext, selectedServices: initialServices }: ServicesSelectionStepProps) {
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>(initialServices);

  const toggleService = (serviceId: ServiceType) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const selectAllServices = () => {
    setSelectedServices(propertyServices.map(s => s.id));
  };

  const clearAllServices = () => {
    setSelectedServices([]);
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = propertyServices.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const calculateEstimatedDays = () => {
    const days = selectedServices.map(serviceId => {
      const service = propertyServices.find(s => s.id === serviceId);
      return service?.estimatedDays || 0;
    });
    return Math.max(...days, 0);
  };

  const hasDiscount = selectedServices.length >= 3;
  const discountAmount = hasDiscount ? calculateTotal() * 0.1 : 0;
  const finalTotal = calculateTotal() - discountAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Property Services</CardTitle>
          <CardDescription>
            Enhance your property listing with our professional services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Select the services you&apos;d like to order for this property
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllServices}
                className="cursor-pointer"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllServices}
                className="cursor-pointer"
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {propertyServices.map((service) => {
          const Icon = iconMap[service.icon as keyof typeof iconMap];
          const isSelected = selectedServices.includes(service.id);

          return (
            <Card
              key={service.id}
              className={cn(
                "relative transition-all cursor-pointer hover:shadow-md",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => toggleService(service.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-primary/10 p-3">
                      {Icon && <Icon className="h-6 w-6 text-primary" />}
                    </div>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleService(service.id)}
                      className="cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{service.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{service.estimatedDays} days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Package Deal Banner */}
      {selectedServices.length >= 2 && !hasDiscount && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Add one more service for a 10% discount!</p>
                <p className="text-sm text-muted-foreground">
                  Save on bundles of 3 or more services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No services selected
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {selectedServices.map(serviceId => {
                  const service = propertyServices.find(s => s.id === serviceId);
                  if (!service) return null;
                  
                  return (
                    <div key={serviceId} className="flex items-center justify-between text-sm">
                      <span>{service.name}</span>
                      <span>€{service.price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal</span>
                  <span>€{calculateTotal()}</span>
                </div>
                
                {hasDiscount && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      Bundle Discount (10%)
                      <Badge variant="secondary" className="text-xs">SAVE</Badge>
                    </span>
                    <span>-€{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>€{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {calculateEstimatedDays() > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Estimated completion: {calculateEstimatedDays()} business days
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => onNext([])}
          className="cursor-pointer"
        >
          Skip Services
        </Button>
        <Button
          size="lg"
          onClick={() => onNext(selectedServices)}
          className="cursor-pointer"
        >
          {selectedServices.length === 0 ? 'Continue' : `Order ${selectedServices.length} Service${selectedServices.length > 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}