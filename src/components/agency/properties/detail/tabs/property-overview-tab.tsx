'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Calendar, MapPin, Home, Bed, Bath, Square, Car } from 'lucide-react';
import type { Property } from '@/app/[locale]/agency/properties/actions';

interface PropertyOverviewTabProps {
  property: Property;
}

export function PropertyOverviewTab({ property }: PropertyOverviewTabProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Photo Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {property.main_image_url && (
                <div className="relative aspect-video overflow-hidden rounded-lg md:col-span-2">
                  <Image
                    src={property.main_image_url}
                    alt={property.address}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {/* Placeholder for more photos */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">More photos</p>
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">More photos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Beautiful {property.type} located in the heart of the city. This property features 
              {' '}{property.bedrooms} bedrooms and {property.bathrooms} bathrooms, with a total 
              living space of {property.size_m2} m². Perfect for families looking for a comfortable 
              and modern home.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Pet Friendly</Badge>
              <Badge variant="secondary">Furnished</Badge>
              <Badge variant="secondary">Air Conditioning</Badge>
              <Badge variant="secondary">Balcony</Badge>
              <Badge variant="secondary">Parking</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Home className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground capitalize">{property.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Bedrooms</p>
                <p className="text-sm text-muted-foreground">{property.bedrooms}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Bathrooms</p>
                <p className="text-sm text-muted-foreground">{property.bathrooms}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Square className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Living Space</p>
                <p className="text-sm text-muted-foreground">{property.size_m2} m²</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Parking</p>
                <p className="text-sm text-muted-foreground">1 space included</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Listed On</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(property.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{property.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Views Today</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Views</span>
                <span className="font-medium">{property.view_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inquiries</span>
                <span className="font-medium">{property.lead_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Favorites</span>
                <span className="font-medium">{property.favorite_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}