'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import type { Property } from '@/app/[locale]/agency/properties/actions';

interface PropertyDocumentsTabProps {
  property: Property;
}

export function PropertyDocumentsTab({}: PropertyDocumentsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Documents</CardTitle>
          <CardDescription>
            Manage all certificates, legal documents, and reports for this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No documents uploaded</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload documents or order certificates to get started
            </p>
            <div className="mt-6">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}