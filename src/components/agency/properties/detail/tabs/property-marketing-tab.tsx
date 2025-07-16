'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, FileText, Globe, Facebook, Instagram } from 'lucide-react';
import type { Property } from '@/app/[locale]/agency/properties/actions';

interface PropertyMarketingTabProps {
  property: Property;
}

export function PropertyMarketingTab({ property }: PropertyMarketingTabProps) {
  const publicUrl = `https://certifast.com/p/${property.id}`;

  return (
    <div className="space-y-6">
      {/* Public Property Page */}
      <Card>
        <CardHeader>
          <CardTitle>Public Property Page</CardTitle>
          <CardDescription>
            Share this beautiful landing page with potential buyers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <code className="flex-1 text-sm">{publicUrl}</code>
            <Button size="sm" variant="outline">Copy</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share Link
            </Button>
            <Button variant="outline">
              View Page
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Content */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Content</CardTitle>
          <CardDescription>
            Create professional descriptions and marketing copy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Generate Property Description
          </Button>
        </CardContent>
      </Card>

      {/* Platform Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Publish to Platforms</CardTitle>
          <CardDescription>
            Sync your property listing across multiple platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Globe className="mr-2 h-4 w-4" />
            Publish to Idealista
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Globe className="mr-2 h-4 w-4" />
            Publish to Fotocasa
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Facebook className="mr-2 h-4 w-4" />
            Share on Facebook
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Instagram className="mr-2 h-4 w-4" />
            Share on Instagram
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}