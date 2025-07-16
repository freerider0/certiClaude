'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditPropertyHeader } from './edit-property-header';
import { BasicInfoSection } from './sections/basic-info-section';
import { MediaSection } from './sections/media-section';
import { ServicesSection } from './sections/services-section';
import { AdvancedSection } from './sections/advanced-section';
import { editPropertySchema, type EditPropertyFormData } from '@/lib/validations/property';
import { updateProperty } from '@/app/[locale]/agency/properties/[id]/edit/actions';
import type { Property } from '@/app/[locale]/agency/properties/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface EditPropertyFormProps {
  property: Property;
}

export function EditPropertyForm({ property }: EditPropertyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<EditPropertyFormData>({
    resolver: zodResolver(editPropertySchema),
    defaultValues: {
      address: property.address,
      type: property.type as EditPropertyFormData['type'],
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      size_m2: property.size_m2,
      status: property.status,
      description: '',
      features: [],
      has_photos: property.has_photos,
      has_cee: property.has_cee,
      has_floor_plan: property.has_floor_plan,
      has_virtual_tour: property.has_virtual_tour,
      has_cedula: property.has_cedula,
    },
  });

  const { formState: { isDirty, isValid } } = form;

  const onSubmit = async (data: EditPropertyFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateProperty(property.id, data);
      
      if (result.success) {
        toast.success('Property updated successfully');
        router.push(`/agency/properties/${property.id}`);
      } else {
        toast.error(result.message || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    router.push(`/agency/properties/${property.id}`);
  };

  return (
    <div className="space-y-6">
      <EditPropertyHeader property={property} isDirty={isDirty} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="mt-6">
              <BasicInfoSection form={form} />
            </TabsContent>
            
            <TabsContent value="media" className="mt-6">
              <MediaSection form={form} property={property} />
            </TabsContent>
            
            <TabsContent value="services" className="mt-6">
              <ServicesSection form={form} property={property} />
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-6">
              <AdvancedSection form={form} />
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}