'use client';

import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Download, 
  RefreshCw, 
  Settings,
  LayoutGrid,
  List,
  Map
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list' | 'map';

export function PropertiesHeader() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleAddProperty = () => {
    window.location.href = '/agency/properties/new';
  };

  const handleImport = () => {
    alert('Import functionality coming soon!');
  };

  const handleSync = () => {
    alert('Sync functionality coming soon!');
  };

  const handleSettings = () => {
    window.location.href = '/agency/settings';
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <p className="text-muted-foreground">
          Manage your property listings and services
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Add Property */}
        <Button className="cursor-pointer" onClick={handleAddProperty}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>

        {/* Import */}
        <Button variant="outline" className="cursor-pointer" onClick={handleImport}>
          <Download className="mr-2 h-4 w-4" />
          Import
        </Button>

        {/* Sync */}
        <Button variant="outline" className="cursor-pointer" onClick={handleSync}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync
        </Button>

        {/* View Mode Toggle */}
        <div className="flex rounded-md shadow-sm" role="group">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            className={cn(
              "rounded-r-none cursor-pointer",
              viewMode === 'grid' && "shadow-none"
            )}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            className={cn(
              "rounded-none border-l-0 cursor-pointer",
              viewMode === 'list' && "shadow-none"
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="icon"
            className={cn(
              "rounded-l-none border-l-0 cursor-pointer",
              viewMode === 'map' && "shadow-none"
            )}
            onClick={() => setViewMode('map')}
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings */}
        <Button variant="outline" size="icon" className="cursor-pointer" onClick={handleSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}