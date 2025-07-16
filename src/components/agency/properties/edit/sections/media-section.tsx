'use client';

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, Video, FileText, X } from 'lucide-react';
import type { EditPropertyFormData } from '@/lib/validations/property';
import type { Property } from '@/app/[locale]/agency/properties/actions';
import Image from 'next/image';
import { useState } from 'react';

interface MediaSectionProps {
  form: UseFormReturn<EditPropertyFormData>;
  property: Property;
}

export function MediaSection({ form, property }: MediaSectionProps) {
  const [mainImage, setMainImage] = useState<string | null>(property.main_image_url || null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUploading, setIsUploading] = useState(false);

  const handleMainImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMainImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAdditionalImages(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    setMainImage(null);
  };

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <Card>
        <CardHeader>
          <CardTitle>Main Image</CardTitle>
          <CardDescription>
            Upload a main image for the property listing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mainImage ? (
            <div className="relative">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={mainImage}
                  alt="Main property image"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 cursor-pointer"
                onClick={removeMainImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Upload main image</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                <Label htmlFor="main-image" className="cursor-pointer">
                  <Button type="button" variant="outline" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  <Input
                    id="main-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMainImageUpload}
                  />
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Images */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Images</CardTitle>
          <CardDescription>
            Upload additional images to showcase the property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {additionalImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {additionalImages.map((image, index) => (
                <div key={index} className="relative">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`Additional image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 cursor-pointer"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Add more images</p>
                <p className="text-xs text-muted-foreground">
                  Select multiple files
                </p>
              </div>
              <Label htmlFor="additional-images" className="cursor-pointer">
                <Button type="button" variant="outline" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
                <Input
                  id="additional-images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAdditionalImagesUpload}
                />
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Virtual Tour */}
      <Card>
        <CardHeader>
          <CardTitle>Virtual Tour</CardTitle>
          <CardDescription>
            Add a virtual tour or video walkthrough
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <Video className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Virtual Tour</p>
                <p className="text-xs text-muted-foreground">
                  Upload video or embed link
                </p>
              </div>
              <Button type="button" variant="outline" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Add Virtual Tour
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floor Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Floor Plan</CardTitle>
          <CardDescription>
            Upload floor plan documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Floor Plan</p>
                <p className="text-xs text-muted-foreground">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
              <Button type="button" variant="outline" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload Floor Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}