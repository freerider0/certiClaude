'use client';

import { useState } from 'react';
import { PropertyCardEnhanced } from './property-card-enhanced';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Property } from '@/app/[locale]/agency/properties/actions';
import { cn } from '@/lib/utils';
import { 
  Camera,
  Home,
  Upload,
  Trash2,
  Users,
  Tag
} from 'lucide-react';

interface PropertiesGridProps {
  properties: Property[];
}

export function PropertiesGrid({ properties }: PropertiesGridProps) {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  const toggleProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const selectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const handleAddProperty = () => {
    window.location.href = '/agency/properties/new';
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for properties:`, selectedProperties);
    
    switch (action) {
      case 'order-photos':
        alert(`Ordering photos for ${selectedProperties.length} properties. This feature is coming soon!`);
        break;
      case 'order-cee':
        alert(`Ordering CEE certificates for ${selectedProperties.length} properties. This feature is coming soon!`);
        break;
      case 'export':
        alert(`Exporting ${selectedProperties.length} properties. This feature is coming soon!`);
        break;
      case 'change-status':
        alert(`Changing status for ${selectedProperties.length} properties. This feature is coming soon!`);
        break;
      case 'assign-agent':
        alert(`Assigning agent to ${selectedProperties.length} properties. This feature is coming soon!`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedProperties.length} properties? This action cannot be undone.`)) {
          alert(`Deleting ${selectedProperties.length} properties. This feature is coming soon!`);
        }
        break;
      default:
        alert(`${action} functionality coming soon!`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedProperties.length > 0 && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedProperties.length === properties.length}
                onCheckedChange={selectAll}
                className="cursor-pointer"
              />
              <span className="text-sm font-medium">
                {selectedProperties.length} properties selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => handleBulkAction('order-photos')}
              >
                <Camera className="mr-2 h-4 w-4" />
                Order Photos
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => handleBulkAction('order-cee')}
              >
                <Home className="mr-2 h-4 w-4" />
                Order CEEs
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => handleBulkAction('export')}
              >
                <Upload className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => handleBulkAction('change-status')}
              >
                <Tag className="mr-2 h-4 w-4" />
                Change Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => handleBulkAction('assign-agent')}
              >
                <Users className="mr-2 h-4 w-4" />
                Assign Agent
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="cursor-pointer"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {properties.map((property) => (
          <div key={property.id} className="relative">
            {/* Selection Checkbox */}
            {(selectMode || selectedProperties.length > 0) && (
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedProperties.includes(property.id)}
                  onCheckedChange={() => toggleProperty(property.id)}
                  className="bg-white shadow-sm cursor-pointer"
                />
              </div>
            )}
            
            <div 
              className={cn(
                "transition-all",
                selectedProperties.includes(property.id) && "ring-2 ring-primary rounded-lg"
              )}
              onMouseEnter={() => !selectedProperties.length && setSelectMode(true)}
              onMouseLeave={() => !selectedProperties.length && setSelectMode(false)}
            >
              <PropertyCardEnhanced property={property} />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">No properties</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first property.
          </p>
          <div className="mt-6">
            <Button className="cursor-pointer" onClick={handleAddProperty}>
              <Camera className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}