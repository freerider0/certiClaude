'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Home, 
  User, 
  Calendar, 
  Clock,
  Euro,
  FileText,
  Camera,
  Ruler,
  Video,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type CreateOrderForm, type ServiceType, type Provider } from '@/types/orders';

interface ReviewStepProps {
  orderData: CreateOrderForm;
  property?: {
    id: string;
    address: string;
    city: string;
    postal_code: string;
    type: string;
    images?: string[];
  };
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  provider: Provider | null;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const serviceConfig: Record<ServiceType, { name: string; icon: any; price: number }> = {
  photography: { name: 'Professional Photography', icon: Camera, price: 150 },
  cee_certificate: { name: 'Energy Certificate (CEE)', icon: FileText, price: 120 },
  floor_plan: { name: 'Floor Plans', icon: Ruler, price: 80 },
  virtual_tour: { name: 'Virtual Tour', icon: Video, price: 200 },
  videography: { name: 'Property Video', icon: Video, price: 250 },
};

export function ReviewStep({
  orderData,
  property,
  customer,
  provider,
  onSubmit,
  onBack,
  isSubmitting
}: ReviewStepProps) {
  const service = serviceConfig[orderData.serviceType];
  const ServiceIcon = service.icon;
  
  const calculateTotalPrice = () => {
    let price = service.price;
    if (orderData.urgency === 'express') {
      price = price * 1.5; // 50% surcharge for express
    }
    return price;
  };

  const totalPrice = calculateTotalPrice();

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Review Order</h2>
        <p className="text-muted-foreground">
          Please review all details before submitting
        </p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Service</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <ServiceIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{service.name}</p>
                  {orderData.urgency === 'express' && (
                    <Badge variant="secondary" className="mt-1">
                      <Zap className="mr-1 h-3 w-3" />
                      Express Service
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold">€{totalPrice}</p>
                {orderData.urgency === 'express' && (
                  <p className="text-xs text-muted-foreground">
                    Includes express fee
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Schedule</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">
                {orderData.scheduledDate && format(orderData.scheduledDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            {orderData.scheduledTimeSlot && (
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{orderData.scheduledTimeSlot}</p>
              </div>
            )}
          </div>

          {orderData.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Special Instructions</p>
                <p className="text-sm bg-muted p-3 rounded-md">{orderData.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Property Details */}
      {property && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{property.address}</p>
                <p className="text-sm text-muted-foreground">
                  {property.city}, {property.postal_code}
                </p>
                <p className="text-sm text-muted-foreground">
                  Type: {formatPropertyType(property.type)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">
              {customer ? `${customer.first_name} ${customer.last_name}` : 
               `${orderData.customerFirstName} ${orderData.customerLastName}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {customer ? customer.email : orderData.customerEmail}
            </p>
            {(customer?.phone || orderData.customerPhone) && (
              <p className="text-sm text-muted-foreground">
                {customer?.phone || orderData.customerPhone}
              </p>
            )}
            {!customer && (
              <Badge variant="secondary" className="mt-2">
                New Customer
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Provider Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Service Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          {provider ? (
            <div className="space-y-2">
              <p className="font-medium">{provider.name}</p>
              <p className="text-sm text-muted-foreground">{provider.email}</p>
              {provider.is_owner && (
                <Badge variant="secondary">Agency Owner</Badge>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No provider assigned. You can assign one after creating the order.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Order...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Create Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
}