'use client';

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Form components are not used in this component but kept for future expansion
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import type { EditPropertyFormData } from '@/lib/validations/property';
import { commonFeatures } from '@/lib/validations/property';
import { useState } from 'react';

interface AdvancedSectionProps {
  form: UseFormReturn<EditPropertyFormData>;
}

export function AdvancedSection({ form }: AdvancedSectionProps) {
  const [customFeature, setCustomFeature] = useState('');
  const features = form.watch('features') || [];

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    const currentFeatures = form.getValues('features') || [];
    if (checked) {
      form.setValue('features', [...currentFeatures, feature]);
    } else {
      form.setValue('features', currentFeatures.filter(f => f !== feature));
    }
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !features.includes(customFeature.trim())) {
      form.setValue('features', [...features, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    form.setValue('features', features.filter(f => f !== featureToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomFeature();
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Features */}
      <Card>
        <CardHeader>
          <CardTitle>Property Features</CardTitle>
          <CardDescription>
            Select features and amenities available in this property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Features */}
          {features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Features</h4>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                    {feature}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent cursor-pointer"
                      onClick={() => removeFeature(feature)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Common Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Common Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {commonFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={features.includes(feature)}
                    onCheckedChange={(checked) => handleFeatureToggle(feature, checked as boolean)}
                    className="cursor-pointer"
                  />
                  <label 
                    htmlFor={feature} 
                    className="text-sm cursor-pointer select-none"
                  >
                    {feature}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Feature Input */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Add Custom Feature</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter custom feature..."
                className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomFeature}
                disabled={!customFeature.trim() || features.includes(customFeature.trim())}
                className="cursor-pointer"
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>
            Search engine optimization settings for this property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Meta Title</label>
            <input
              type="text"
              placeholder="SEO title for this property..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 50-60 characters
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Meta Description</label>
            <textarea
              placeholder="SEO description for this property..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 150-160 characters
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords</label>
            <input
              type="text"
              placeholder="apartment, barcelona, for sale..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Separate keywords with commas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Preferences</CardTitle>
          <CardDescription>
            How potential buyers can contact you about this property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="phone-contact" className="cursor-pointer" />
              <label htmlFor="phone-contact" className="text-sm cursor-pointer">
                Allow phone contact
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email-contact" className="cursor-pointer" />
              <label htmlFor="email-contact" className="text-sm cursor-pointer">
                Allow email contact
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="whatsapp-contact" className="cursor-pointer" />
              <label htmlFor="whatsapp-contact" className="text-sm cursor-pointer">
                Allow WhatsApp contact
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="viewing-requests" className="cursor-pointer" />
              <label htmlFor="viewing-requests" className="text-sm cursor-pointer">
                Allow viewing requests
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
          <CardDescription>
            Other property-specific settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="featured-property" className="cursor-pointer" />
              <label htmlFor="featured-property" className="text-sm cursor-pointer">
                Mark as featured property
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="urgent-sale" className="cursor-pointer" />
              <label htmlFor="urgent-sale" className="text-sm cursor-pointer">
                Mark as urgent sale
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="price-negotiable" className="cursor-pointer" />
              <label htmlFor="price-negotiable" className="text-sm cursor-pointer">
                Price is negotiable
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="exclusive-listing" className="cursor-pointer" />
              <label htmlFor="exclusive-listing" className="text-sm cursor-pointer">
                Exclusive listing
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}