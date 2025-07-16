'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  MessageSquare, 
  Star,
  Camera,
  Home,
  Ruler,
  Video,
  MoreVertical,
  Share2,
  Edit
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/app/[locale]/agency/properties/actions';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCardEnhanced({ property }: PropertyCardProps) {
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

  const handleEdit = () => {
    window.location.href = `/agency/properties/${property.id}/edit`;
  };

  const handleViewDetails = () => {
    window.location.href = `/agency/properties/${property.id}`;
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/agency/properties/${property.id}`;
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
    alert('More actions menu coming soon!');
  };

  const statusBadge = getStatusBadge(property.status);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {property.main_image_url ? (
          <Image
            src={property.main_image_url}
            alt={property.address}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Home className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Status Badge */}
        <Badge 
          className={cn(
            "absolute top-2 left-2",
            statusBadge.className
          )}
        >
          {statusBadge.label}
        </Badge>

        {/* Quick Actions (visible on hover) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8 cursor-pointer" onClick={handleMoreActions}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Property Type Badge */}
        <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
          {property.type}
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* Property Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">
            <Link 
              href={`/agency/properties/${property.id}`}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              {property.address}
            </Link>
          </h3>
          
          <p className="text-2xl font-bold text-primary">
            {formatPrice(property.price)}
          </p>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{property.bedrooms} bed</span>
            <span>•</span>
            <span>{property.bathrooms} bath</span>
            <span>•</span>
            <span>{property.size_m2} m²</span>
          </div>
        </div>

        {/* Service Status */}
        <div className="mt-4 p-3 bg-muted/50 rounded-md space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Service Status</p>
          <div className="grid grid-cols-2 gap-2">
            <ServiceIndicator 
              icon={Camera} 
              label="Photos" 
              status={property.has_photos ? 'complete' : 'missing'} 
            />
            <ServiceIndicator 
              icon={Home} 
              label="CEE" 
              status={property.has_cee ? 'complete' : 'missing'} 
            />
            <ServiceIndicator 
              icon={Ruler} 
              label="Floor Plan" 
              status={property.has_floor_plan ? 'complete' : 'missing'} 
            />
            <ServiceIndicator 
              icon={Video} 
              label="Virtual Tour" 
              status={property.has_virtual_tour ? 'complete' : 'missing'} 
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {property.view_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {property.lead_count}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {property.favorite_count}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button variant="outline" size="sm" className="flex-1 cursor-pointer" onClick={handleEdit}>
          <Edit className="mr-2 h-3 w-3" />
          Edit
        </Button>
        <Button size="sm" className="flex-1 cursor-pointer" onClick={handleViewDetails}>
          View Details
        </Button>
        <Button variant="ghost" size="sm" className="cursor-pointer" onClick={handleShare}>
          <Share2 className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ServiceIndicatorProps {
  icon: React.ElementType;
  label: string;
  status: 'complete' | 'in-progress' | 'missing';
}

function ServiceIndicator({ icon: Icon, label, status }: ServiceIndicatorProps) {
  const statusStyles = {
    complete: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      symbol: '✓'
    },
    'in-progress': {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      symbol: '⚡'
    },
    missing: {
      container: 'bg-gray-50 border-gray-200',
      icon: 'text-gray-400',
      symbol: '✗'
    }
  };

  const style = statusStyles[status];

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 rounded border text-xs",
      style.container
    )}>
      <Icon className={cn("h-3 w-3", style.icon)} />
      <span className="flex-1 truncate">{label}</span>
      <span className={style.icon}>{style.symbol}</span>
    </div>
  );
}