'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Camera, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DocumentUploadStepProps {
  onNext: (propertyIdDoc: File, cadastralDoc: File) => void;
}

export function DocumentUploadStep({ onNext }: DocumentUploadStepProps) {
  const [propertyIdDoc, setPropertyIdDoc] = useState<File | null>(null);
  const [cadastralDoc, setCadastralDoc] = useState<File | null>(null);
  const [propertyIdPreview, setPropertyIdPreview] = useState<string | null>(null);
  const [cadastralPreview, setCadastralPreview] = useState<string | null>(null);

  const handleFileUpload = useCallback((file: File, type: 'property' | 'cadastral') => {
    // Validate file
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please upload an image (JPG, PNG) or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'property') {
        setPropertyIdDoc(file);
        setPropertyIdPreview(result);
      } else {
        setCadastralDoc(file);
        setCadastralPreview(result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'property' | 'cadastral') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file, type);
    }
  }, [handleFileUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (type: 'property' | 'cadastral') => {
    if (type === 'property') {
      setPropertyIdDoc(null);
      setPropertyIdPreview(null);
    } else {
      setCadastralDoc(null);
      setCadastralPreview(null);
    }
  };

  const canProceed = propertyIdDoc && cadastralDoc;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Quick Start with Document Scanning
          </CardTitle>
          <CardDescription>
            Upload photos of your property documents and we&apos;ll automatically extract the information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>📋 Property ID Document (Nota Simple): Contains ownership and registry information</p>
            <p>🏠 Cadastral Reference: Contains technical details and official property reference</p>
            <p>💡 Tip: Ensure documents are well-lit and text is clearly visible for best results</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Property ID Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Property ID Document</CardTitle>
            <CardDescription>
              Nota Simple or Property Registry Document
            </CardDescription>
          </CardHeader>
          <CardContent>
            {propertyIdPreview ? (
              <div className="relative">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border">
                  {propertyIdDoc?.type === 'application/pdf' ? (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                      <p className="mt-2 text-sm">{propertyIdDoc.name}</p>
                    </div>
                  ) : (
                    <Image
                      src={propertyIdPreview}
                      alt="Property ID Document"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 cursor-pointer"
                  onClick={() => removeFile('property')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onDrop={(e) => handleDrop(e, 'property')}
                onDragOver={handleDragOver}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">
                  Drop your document here or click to browse
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or PDF up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  id="property-doc"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'property');
                  }}
                />
                <div className="mt-4 flex gap-2 justify-center">
                  <label htmlFor="property-doc">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </span>
                    </Button>
                  </label>
                  <Button variant="outline" className="cursor-pointer">
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cadastral Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastral Reference Document</CardTitle>
            <CardDescription>
              Official cadastral reference with property details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cadastralPreview ? (
              <div className="relative">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border">
                  {cadastralDoc?.type === 'application/pdf' ? (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                      <p className="mt-2 text-sm">{cadastralDoc.name}</p>
                    </div>
                  ) : (
                    <Image
                      src={cadastralPreview}
                      alt="Cadastral Document"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 cursor-pointer"
                  onClick={() => removeFile('cadastral')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onDrop={(e) => handleDrop(e, 'cadastral')}
                onDragOver={handleDragOver}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">
                  Drop your document here or click to browse
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or PDF up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  id="cadastral-doc"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'cadastral');
                  }}
                />
                <div className="mt-4 flex gap-2 justify-center">
                  <label htmlFor="cadastral-doc">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </span>
                    </Button>
                  </label>
                  <Button variant="outline" className="cursor-pointer">
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!canProceed}
          onClick={() => onNext(propertyIdDoc!, cadastralDoc!)}
          className={cn("cursor-pointer", !canProceed && "cursor-not-allowed")}
        >
          Continue to Processing
        </Button>
      </div>
    </div>
  );
}