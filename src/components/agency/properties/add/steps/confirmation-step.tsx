'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { propertyServices, type CreatePropertyFormData, type ServiceType, propertyTypes } from '@/lib/validations/property';
import { 
  MapPin, 
  Home, 
  CheckCircle2, 
  FileText,
  Package,
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationStepProps {
  propertyData: CreatePropertyFormData;
  selectedServices: ServiceType[];
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ConfirmationStep({ 
  propertyData, 
  selectedServices, 
  onSubmit,
  isSubmitting 
}: ConfirmationStepProps) {
  const calculateServicesTotal = () => {
    const total = selectedServices.reduce((sum, serviceId) => {
      const service = propertyServices.find(s => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
    
    // Apply discount if 3 or more services
    if (selectedServices.length >= 3) {
      return total * 0.9; // 10% discount
    }
    return total;
  };

  const getPropertyTypeLabel = () => {
    return propertyTypes.find(t => t.value === propertyData.type)?.label || propertyData.type;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Review and Confirm
          </CardTitle>
          <CardDescription>
            Please review all information before submitting
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Property Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Property Type</p>
              <p className="font-medium">{getPropertyTypeLabel()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaction Type</p>
              <p className="font-medium">
                {propertyData.transactionType === 'sale' ? 'For Sale' : 'For Rent'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-medium text-lg">{formatPrice(propertyData.price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Size</p>
              <p className="font-medium">{propertyData.size_m2} m²</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bedrooms</p>
              <p className="font-medium">{propertyData.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bathrooms</p>
              <p className="font-medium">{propertyData.bathrooms}</p>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Location</p>
            </div>
            <p>{propertyData.address}</p>
            <p className="text-sm text-muted-foreground">
              {propertyData.postalCode} {propertyData.city}, {propertyData.province}
            </p>
          </div>

          <Separator />

          {/* Document References */}
          <div className="grid gap-4 md:grid-cols-2">
            {propertyData.registryNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Registry Number</p>
                <p className="font-mono text-sm">{propertyData.registryNumber}</p>
              </div>
            )}
            {propertyData.cadastralReference && (
              <div>
                <p className="text-sm text-muted-foreground">Cadastral Reference</p>
                <p className="font-mono text-sm">{propertyData.cadastralReference}</p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {(propertyData.yearBuilt || propertyData.energyRating) && (
            <>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {propertyData.yearBuilt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-medium">{propertyData.yearBuilt}</p>
                  </div>
                )}
                {propertyData.energyRating && (
                  <div>
                    <p className="text-sm text-muted-foreground">Energy Rating</p>
                    <div className={cn(
                      "inline-block px-2 py-1 rounded text-sm font-bold text-white",
                      propertyData.energyRating === 'A' && "bg-green-600",
                      propertyData.energyRating === 'B' && "bg-green-500",
                      propertyData.energyRating === 'C' && "bg-yellow-500",
                      propertyData.energyRating === 'D' && "bg-orange-500",
                      propertyData.energyRating === 'E' && "bg-red-500",
                      propertyData.energyRating === 'F' && "bg-red-600",
                      propertyData.energyRating === 'G' && "bg-red-700"
                    )}>
                      {propertyData.energyRating}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Services Summary */}
      {selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Selected Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {selectedServices.map(serviceId => {
                const service = propertyServices.find(s => s.id === serviceId);
                if (!service) return null;
                
                return (
                  <div key={serviceId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{service.name}</span>
                    </div>
                    <span className="text-sm font-medium">€{service.price}</span>
                  </div>
                );
              })}
            </div>
            
            {selectedServices.length >= 3 && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Bundle Discount (10%)</span>
                <span>Applied ✓</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex items-center justify-between font-semibold">
              <span>Total Services Cost</span>
              <span>{formatPrice(calculateServicesTotal())}</span>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Services will be scheduled after property creation. You&apos;ll receive confirmation emails for each service.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                By submitting, you confirm that all information is accurate and you have the right to list this property.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                disabled={isSubmitting}
                className="flex-1 cursor-pointer"
              >
                Save as Draft
              </Button>
              <Button
                size="lg"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Property...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Create Property
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}