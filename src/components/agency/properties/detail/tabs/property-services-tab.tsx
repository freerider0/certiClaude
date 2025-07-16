'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera,
  Home,
  Ruler,
  Video,
  FileText,
  Upload,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingCart,
  Sparkles
} from 'lucide-react';
import type { Property } from '@/app/[locale]/agency/properties/actions';
import { cn } from '@/lib/utils';

interface PropertyServicesTabProps {
  property: Property;
}

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  price: string;
  deliveryTime: string;
  included: string[];
  status: 'complete' | 'in-progress' | 'missing';
  hasExisting?: boolean;
  orderDate?: string;
  completionDate?: string;
  downloadUrl?: string;
}

export function PropertyServicesTab({ property }: PropertyServicesTabProps) {
  // Calculate completion percentage
  const services = [
    property.has_photos,
    property.has_cee,
    property.has_floor_plan,
    property.has_virtual_tour,
    property.has_cedula
  ];
  const completedCount = services.filter(Boolean).length;
  const completionPercentage = (completedCount / services.length) * 100;

  const servicesData: Service[] = [
    {
      id: 'photos',
      name: 'Professional Photography',
      description: 'High-quality photos that showcase your property',
      icon: Camera,
      price: '€30',
      deliveryTime: '48 hours',
      included: ['20-30 HD photos', 'Drone shots included', 'Virtual staging ready'],
      status: property.has_photos ? 'complete' : 'missing',
      hasExisting: property.has_photos,
      completionDate: property.has_photos ? '2024-01-15' : undefined,
      downloadUrl: property.has_photos ? '#' : undefined
    },
    {
      id: 'cee',
      name: 'Energy Certificate (CEE)',
      description: 'Required energy efficiency certificate',
      icon: Home,
      price: 'FREE',
      deliveryTime: '3-5 days',
      included: ['Official certificate', 'Energy rating', 'Improvement recommendations'],
      status: property.has_cee ? 'complete' : 'missing',
      hasExisting: property.has_cee,
      completionDate: property.has_cee ? '2024-01-10' : undefined,
      downloadUrl: property.has_cee ? '#' : undefined
    },
    {
      id: 'floor-plan',
      name: 'Professional Floor Plans',
      description: '2D & 3D floor plans with measurements',
      icon: Ruler,
      price: '€45',
      deliveryTime: '72 hours',
      included: ['2D floor plan', '3D visualization', 'Room measurements'],
      status: property.has_floor_plan ? 'complete' : 'missing',
      hasExisting: property.has_floor_plan,
      orderDate: property.has_floor_plan ? '2024-01-18' : undefined
    },
    {
      id: 'virtual-tour',
      name: 'Matterport Virtual Tour',
      description: 'Interactive 3D walkthrough of your property',
      icon: Video,
      price: '€39',
      deliveryTime: '48 hours',
      included: ['Full 3D tour', 'Dollhouse view', 'Floor plan view', 'VR compatible'],
      status: property.has_virtual_tour ? 'complete' : 'missing',
      hasExisting: property.has_virtual_tour
    },
    {
      id: 'cedula',
      name: 'Habitability Certificate (Cédula)',
      description: 'Official habitability certificate',
      icon: FileText,
      price: '€29',
      deliveryTime: '5-7 days',
      included: ['Official certificate', 'Technical inspection', 'Legal compliance'],
      status: property.has_cedula ? 'complete' : 'missing',
      hasExisting: property.has_cedula,
      completionDate: property.has_cedula ? '2024-01-12' : undefined,
      downloadUrl: property.has_cedula ? '#' : undefined
    }
  ];

  const missingServices = servicesData.filter(s => s.status === 'missing');
  const bundlePrice = missingServices.reduce((sum, s) => {
    const price = s.price === 'FREE' ? 0 : parseInt(s.price.replace('€', ''));
    return sum + price;
  }, 0);
  const bundleDiscount = Math.round(bundlePrice * 0.25);
  const bundleFinalPrice = bundlePrice - bundleDiscount;

  return (
    <div className="space-y-6">
      {/* Service Completion Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Service Completion Status</CardTitle>
          <CardDescription>
            Track all services needed for your property listing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Completion</span>
              <span className="font-medium">{completedCount} of {services.length} services</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {missingServices.length > 0 && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Complete all services and save!</p>
                  <p className="text-sm">
                    Order {missingServices.length} missing services for{' '}
                    <span className="line-through text-muted-foreground">€{bundlePrice}</span>{' '}
                    <span className="font-bold text-primary">€{bundleFinalPrice}</span>{' '}
                    <Badge variant="secondary" className="ml-1">Save €{bundleDiscount}</Badge>
                  </p>
                  <Button className="mt-2">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Order Bundle for €{bundleFinalPrice}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Individual Services */}
      <div className="grid gap-4">
        {servicesData.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
}

function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;
  
  const statusConfig = {
    complete: {
      badge: 'Complete',
      badgeClass: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      iconClass: 'text-green-600'
    },
    'in-progress': {
      badge: 'In Progress',
      badgeClass: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      iconClass: 'text-yellow-600'
    },
    missing: {
      badge: 'Not Ordered',
      badgeClass: 'bg-gray-100 text-gray-800',
      icon: AlertCircle,
      iconClass: 'text-gray-400'
    }
  };

  const config = statusConfig[service.status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Service Icon */}
          <div className={cn(
            "p-3 rounded-lg",
            service.status === 'complete' ? 'bg-green-50' : 
            service.status === 'in-progress' ? 'bg-yellow-50' : 'bg-gray-50'
          )}>
            <Icon className={cn(
              "h-6 w-6",
              service.status === 'complete' ? 'text-green-600' : 
              service.status === 'in-progress' ? 'text-yellow-600' : 'text-gray-400'
            )} />
          </div>

          {/* Service Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {service.name}
                  <Badge className={config.badgeClass}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {config.badge}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {service.description}
                </p>
              </div>
              
              {/* Price */}
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {service.price}
                </p>
                <p className="text-xs text-muted-foreground">
                  {service.deliveryTime}
                </p>
              </div>
            </div>

            {/* What's Included */}
            <div className="flex items-start gap-8">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">What&apos;s included:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {service.included.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Status Details */}
              {service.status !== 'missing' && (
                <div className="text-sm text-muted-foreground">
                  {service.orderDate && (
                    <p>Ordered: {service.orderDate}</p>
                  )}
                  {service.completionDate && (
                    <p>Completed: {service.completionDate}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              {service.status === 'complete' ? (
                <>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    Order Again
                  </Button>
                </>
              ) : service.status === 'in-progress' ? (
                <Button variant="outline" size="sm">
                  Track Order
                </Button>
              ) : (
                <>
                  <Button size="sm">
                    Order for {service.price}
                  </Button>
                  <span className="text-sm text-muted-foreground mx-2">or</span>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Existing
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}