'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Home,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Euro,
  FileText,
  Ruler,
  Camera,
  Video
} from 'lucide-react';
import { format } from 'date-fns';
import { type OrderWithDetails, type ServiceType } from '@/types/orders';
import Image from 'next/image';

interface OrderInfoProps {
  order: OrderWithDetails;
}

const serviceIcons: Record<ServiceType, any> = {
  photography: Camera,
  cee_certificate: FileText,
  floor_plan: Ruler,
  virtual_tour: Video,
  videography: Video,
};

export function OrderInfo({ order }: OrderInfoProps) {
  const ServiceIcon = serviceIcons[order.service_type as ServiceType] || FileText;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServiceIcon className="h-5 w-5" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Service Type</p>
            <p className="font-medium">
              {order.service?.name || order.service_type.split('_').map(w => 
                w.charAt(0).toUpperCase() + w.slice(1)
              ).join(' ')}
            </p>
          </div>
          {order.service?.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{order.service.description}</p>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-xl font-semibold">
                €{order.total_price?.toFixed(2) || '0.00'}
              </p>
            </div>
            {order.agency_commission && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Commission</p>
                <p className="text-sm font-medium">
                  €{order.agency_commission.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule & Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.scheduled_date ? (
            <div>
              <p className="text-sm text-muted-foreground">Scheduled Date</p>
              <p className="font-medium">
                {format(new Date(order.scheduled_date), 'EEEE, MMMM d, yyyy')}
              </p>
              {order.scheduled_time_slot && (
                <p className="text-sm text-muted-foreground">
                  Time: {order.scheduled_time_slot}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Schedule</p>
              <Badge variant="outline">Not scheduled</Badge>
            </div>
          )}

          <Separator />

          {order.provider ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Assigned To</p>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{order.provider.name}</p>
                  <p className="text-sm text-muted-foreground">{order.provider.email}</p>
                  {order.provider.phone && (
                    <p className="text-sm text-muted-foreground">{order.provider.phone}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <Badge variant="outline">Not assigned</Badge>
              <Button size="sm" className="mt-2 cursor-pointer">
                Assign Provider
              </Button>
            </div>
          )}

          {order.duration_minutes && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Estimated Duration
              </p>
              <p className="font-medium">{order.duration_minutes} minutes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Information */}
      {order.property && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.property.images && order.property.images.length > 0 && (
              <div className="relative h-32 rounded-lg overflow-hidden">
                <Image
                  src={order.property.images[0]}
                  alt={order.property.address}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{order.property.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.property.city}, {order.property.postal_code}
                  </p>
                  {order.property.province && (
                    <p className="text-sm text-muted-foreground">
                      {order.property.province}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{order.property.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium">{order.property.size_m2} m²</p>
              </div>
              {order.property.bedrooms !== undefined && (
                <div>
                  <p className="text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{order.property.bedrooms}</p>
                </div>
              )}
              {order.property.bathrooms !== undefined && (
                <div>
                  <p className="text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{order.property.bathrooms}</p>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full cursor-pointer"
              onClick={() => window.open(`/agency/properties/${order.property?.id}`, '_blank')}
            >
              View Property Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Customer Information */}
      {order.customer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">
                {order.customer.first_name} {order.customer.last_name}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${order.customer.email}`}
                  className="text-primary hover:underline"
                >
                  {order.customer.email}
                </a>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${order.customer.phone}`}
                    className="text-primary hover:underline"
                  >
                    {order.customer.phone}
                  </a>
                </div>
              )}
            </div>
            {order.customer.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="text-sm">
                  {order.customer.address}<br />
                  {order.customer.city}, {order.customer.postal_code}
                </p>
              </div>
            )}
            <Separator />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 cursor-pointer"
                onClick={() => window.location.href = `mailto:${order.customer?.email}`}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              {order.customer.phone && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 cursor-pointer"
                  onClick={() => window.location.href = `tel:${order.customer?.phone}`}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {(order.notes || order.internal_notes) && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Customer Notes</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
            {order.internal_notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Internal Notes</p>
                <p className="text-sm bg-muted p-3 rounded-md">{order.internal_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}