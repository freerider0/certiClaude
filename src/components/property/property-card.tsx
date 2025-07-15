import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface PropertyCardProps {
  property: {
    id: string;
    address: string;
    type: string;
    area: number;
    status: 'pending' | 'in_progress' | 'completed';
    imageUrl?: string;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const t = useTranslations('common');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted relative">
        {property.imageUrl ? (
          <Image
            src={property.imageUrl}
            alt={property.address}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{property.address}</CardTitle>
          <Badge className={statusColors[property.status]}>
            {property.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{property.type}</p>
          <p>{property.area} m²</p>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">
          {t('edit')}
        </Button>
        <Button size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
}