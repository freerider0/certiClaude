'use client';

import { Button } from '@/components/ui/button';
import { 
  Mail, 
  FileText, 
  RefreshCw, 
  BarChart,
  Calendar,
  Share2
} from 'lucide-react';
import type { Property } from '@/app/[locale]/agency/properties/actions';

interface PropertyQuickActionsProps {
  property: Property;
}

export function PropertyQuickActions({ property }: PropertyQuickActionsProps) {
  const handleSendToClient = () => {
    const subject = `Property: ${property.address}`;
    const body = `I'd like to share this property with you:\n\n${property.address}\nPrice: €${property.price.toLocaleString()}\nType: ${property.type}\nBedrooms: ${property.bedrooms}\nBathrooms: ${property.bathrooms}\nSize: ${property.size_m2} m²`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareLink = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.address,
          text: `Check out this property: ${property.address}`,
          url: url,
        });
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

  const handleExportPDF = () => {
    window.print();
  };

  const handleSyncToMLS = () => {
    alert('MLS sync functionality coming soon!');
  };

  const handleViewAnalytics = () => {
    const analyticsTab = document.querySelector('[data-tab="analytics"]') as HTMLElement;
    if (analyticsTab) {
      analyticsTab.click();
    }
  };

  const handleScheduleTour = () => {
    const phoneNumber = '+34600000000'; // Replace with actual contact number
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const message = `Hi, I'd like to schedule a tour for the property at ${property.address}`;
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleSendToClient}>
            <Mail className="mr-2 h-4 w-4" />
            Send to Client
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleSyncToMLS}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync to MLS
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewAnalytics}>
            <BarChart className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
          <Button variant="outline" size="sm" onClick={handleScheduleTour}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Tour
          </Button>
        </div>
      </div>
    </div>
  );
}