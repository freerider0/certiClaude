'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  FileText, 
  Ruler, 
  Video, 
  Home,
  Clock,
  Euro,
  ArrowLeft,
  ArrowRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ServiceType, type CreateOrderForm } from '@/types/orders';

interface ServiceConfigurationStepProps {
  selectedService: ServiceType;
  urgency?: 'standard' | 'express';
  notes?: string;
  onUpdate: (data: Partial<CreateOrderForm>) => void;
  onNext: () => void;
  onBack: () => void;
}

const services = [
  {
    id: 'photography' as ServiceType,
    name: 'Professional Photography',
    description: 'High-quality photos for property listings',
    price: 150,
    duration: '2-3 hours',
    deliveryTime: '48 hours',
    icon: Camera,
    includes: [
      '25-35 edited photos',
      'Exterior and interior shots',
      'HDR processing',
      'Sky replacement if needed'
    ]
  },
  {
    id: 'cee_certificate' as ServiceType,
    name: 'Energy Certificate (CEE)',
    description: 'Official energy efficiency certification',
    price: 120,
    duration: '1-2 hours',
    deliveryTime: '5 days',
    icon: FileText,
    includes: [
      'On-site inspection',
      'Energy consumption analysis',
      'Official CEE certificate',
      'Improvement recommendations'
    ]
  },
  {
    id: 'floor_plan' as ServiceType,
    name: 'Floor Plans',
    description: '2D floor plans with measurements',
    price: 80,
    duration: '1-2 hours',
    deliveryTime: '3 days',
    icon: Ruler,
    includes: [
      'Professional measurements',
      '2D floor plan',
      'Room labels and dimensions',
      'Total area calculation'
    ]
  },
  {
    id: 'virtual_tour' as ServiceType,
    name: 'Virtual Tour',
    description: '360° interactive property tour',
    price: 200,
    duration: '3-4 hours',
    deliveryTime: '5 days',
    icon: Video,
    includes: [
      '360° photography',
      'Interactive hotspots',
      'Mobile compatible',
      'Branded tour interface'
    ]
  },
  {
    id: 'videography' as ServiceType,
    name: 'Property Video',
    description: 'Professional property video tour',
    price: 250,
    duration: '3-4 hours',
    deliveryTime: '7 days',
    icon: Video,
    includes: [
      '2-3 minute video',
      'Drone footage (if permitted)',
      'Professional editing',
      'Background music'
    ]
  }
];

export function ServiceConfigurationStep({
  selectedService,
  urgency = 'standard',
  notes = '',
  onUpdate,
  onNext,
  onBack
}: ServiceConfigurationStepProps) {
  const handleServiceChange = (serviceId: string) => {
    onUpdate({ serviceType: serviceId as ServiceType });
  };

  const handleUrgencyChange = (value: string) => {
    onUpdate({ urgency: value as 'standard' | 'express' });
  };

  const handleNotesChange = (value: string) => {
    onUpdate({ notes: value });
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Select Service</h2>
        <p className="text-muted-foreground">
          Choose the service you need for this property
        </p>
      </div>

      <RadioGroup value={selectedService} onValueChange={handleServiceChange}>
        <div className="grid gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            const isSelected = selectedService === service.id;

            return (
              <Label
                key={service.id}
                htmlFor={service.id}
                className="cursor-pointer"
              >
                <Card
                  className={cn(
                    "transition-colors hover:bg-muted/50",
                    isSelected && "border-primary bg-primary/5"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <RadioGroupItem value={service.id} id={service.id} />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {service.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">€{service.price}</p>
                            <p className="text-xs text-muted-foreground">Standard price</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Duration: {service.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Delivery: {service.deliveryTime}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Includes:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {service.includes.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            );
          })}
        </div>
      </RadioGroup>

      {/* Urgency Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Urgency</CardTitle>
          <CardDescription>
            Express service available for faster delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={urgency} onValueChange={handleUrgencyChange}>
            <div className="grid grid-cols-2 gap-4">
              <Label htmlFor="standard" className="cursor-pointer">
                <div className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border",
                  urgency === 'standard' && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="standard" id="standard" />
                  <div className="flex-1">
                    <p className="font-medium">Standard</p>
                    <p className="text-sm text-muted-foreground">
                      Regular delivery time
                    </p>
                  </div>
                </div>
              </Label>
              
              <Label htmlFor="express" className="cursor-pointer">
                <div className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border",
                  urgency === 'express' && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="express" id="express" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Express</p>
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="mr-1 h-3 w-3" />
                        +50%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Priority service
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Special Instructions (Optional)</CardTitle>
          <CardDescription>
            Any specific requirements or notes for the service provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Please focus on the garden area, Access code is 1234..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedService}
          className="cursor-pointer"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}