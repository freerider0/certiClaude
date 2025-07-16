'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, Home, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PropertySelectionStepProps {
  properties: Array<{
    id: string;
    address: string;
    city: string;
    postal_code: string;
    type: string;
    images?: string[];
  }>;
  selectedPropertyId: string;
  onSelect: (propertyId: string) => void;
  onNext: () => void;
}

export function PropertySelectionStep({
  properties,
  selectedPropertyId,
  onSelect,
  onNext
}: PropertySelectionStepProps) {
  const [search, setSearch] = useState('');

  const filteredProperties = properties.filter(property => {
    const searchLower = search.toLowerCase();
    return (
      property.address.toLowerCase().includes(searchLower) ||
      property.city.toLowerCase().includes(searchLower) ||
      property.postal_code.toLowerCase().includes(searchLower)
    );
  });

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Select Property</h2>
        <p className="text-muted-foreground">
          Choose the property that needs the service
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by address, city, or postal code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <RadioGroup value={selectedPropertyId} onValueChange={onSelect}>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No properties found</p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <Label
                  key={property.id}
                  htmlFor={property.id}
                  className="cursor-pointer"
                >
                  <Card
                    className={cn(
                      "transition-colors hover:bg-muted/50",
                      selectedPropertyId === property.id && "border-primary bg-primary/5"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={property.id} id={property.id} />
                        
                        {property.images && property.images.length > 0 ? (
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={property.images[0]}
                              alt={property.address}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Home className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{property.address}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>{property.city}, {property.postal_code}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Home className="h-3 w-3" />
                                <span>{formatPropertyType(property.type)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              ))
            )}
          </div>
        </ScrollArea>
      </RadioGroup>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!selectedPropertyId}
          className="cursor-pointer"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}