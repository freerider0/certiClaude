'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Share2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import type { Property } from '@/app/[locale]/agency/properties/actions';
import { cn } from '@/lib/utils';

interface PropertyHeaderProps {
  property: Property;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: Property['status']) => {
    const variants = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      sold: { label: 'Sold', className: 'bg-gray-100 text-gray-800' },
      rented: { label: 'Rented', className: 'bg-blue-100 text-blue-800' }
    };
    return variants[status];
  };

  const handleShare = async (property: Property) => {
    const url = window.location.href;
    const shareData = {
      title: property.address,
      text: `Check out this property: ${property.address} - ${formatPrice(property.price)}`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleMoreActions = () => {
    // You can implement a dropdown menu here
    alert('More actions menu coming soon!');
  };

  const statusBadge = getStatusBadge(property.status);

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link href="/agency/properties">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
      </Link>

      {/* Property Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {property.address}
            </h1>
            <Badge className={cn(statusBadge.className)}>
              {statusBadge.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{property.type}</span>
            <span>•</span>
            <span>{property.bedrooms} bedrooms</span>
            <span>•</span>
            <span>{property.bathrooms} bathrooms</span>
            <span>•</span>
            <span>{property.size_m2} m²</span>
          </div>

          <p className="text-3xl font-bold text-primary">
            {formatPrice(property.price)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => window.location.href = `/agency/properties/${property.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Property
          </Button>
          <Button variant="outline" onClick={() => handleShare(property)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleMoreActions()}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}