'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyOverviewTab } from './tabs/property-overview-tab';
import { PropertyServicesTab } from './tabs/property-services-tab';
import { PropertyDocumentsTab } from './tabs/property-documents-tab';
import { PropertyMarketingTab } from './tabs/property-marketing-tab';
import { PropertyAnalyticsTab } from './tabs/property-analytics-tab';
import type { Property } from '@/app/[locale]/agency/properties/actions';

interface PropertyTabsProps {
  property: Property;
}

export function PropertyTabs({ property }: PropertyTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="marketing">Marketing</TabsTrigger>
        <TabsTrigger value="analytics" data-tab="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <PropertyOverviewTab property={property} />
      </TabsContent>
      
      <TabsContent value="services" className="mt-6">
        <PropertyServicesTab property={property} />
      </TabsContent>
      
      <TabsContent value="documents" className="mt-6">
        <PropertyDocumentsTab property={property} />
      </TabsContent>
      
      <TabsContent value="marketing" className="mt-6">
        <PropertyMarketingTab property={property} />
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        <PropertyAnalyticsTab property={property} />
      </TabsContent>
    </Tabs>
  );
}