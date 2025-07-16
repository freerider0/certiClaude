'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createPropertySchema, type CreatePropertyFormData, type OCRExtractedData, propertyTypes } from '@/lib/validations/property';
import { AlertCircle, CheckCircle2, MapPin, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyDetailsStepProps {
  ocrData: OCRExtractedData;
  onNext: (data: CreatePropertyFormData) => void;
}

export function PropertyDetailsStep({ ocrData, onNext }: PropertyDetailsStepProps) {
  const form = useForm<CreatePropertyFormData>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      // Pre-fill with OCR data
      registryNumber: ocrData.registryNumber || '',
      cadastralReference: ocrData.cadastralReference || '',
      address: ocrData.address || '',
      city: ocrData.city || 'Barcelona',
      province: ocrData.province || 'Barcelona',
      postalCode: ocrData.postalCode || '',
      type: (ocrData.propertyType as CreatePropertyFormData['type']) || 'apartment',
      size_m2: ocrData.size_m2 || ocrData.buildingSize_m2 || 0,
      landSize_m2: ocrData.landSize_m2,
      yearBuilt: ocrData.yearBuilt,
      energyRating: ocrData.energyRating,
      
      // Fields to be filled by user
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      description: '',
      features: [],
      condition: 'good',
      transactionType: 'sale',
      status: 'pending'
    },
  });

  const onSubmit = (data: CreatePropertyFormData) => {
    onNext(data);
  };

  const getConfidenceBadge = (field: string) => {
    const confidence = ocrData.confidence?.[field];
    if (!confidence) return null;

    return (
      <Badge 
        variant={confidence >= 90 ? "default" : confidence >= 70 ? "secondary" : "outline"}
        className="ml-2"
      >
        {confidence >= 90 ? (
          <CheckCircle2 className="mr-1 h-3 w-3" />
        ) : (
          <AlertCircle className="mr-1 h-3 w-3" />
        )}
        {confidence}% confidence
      </Badge>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* OCR Extracted Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Document Information Extracted
            </CardTitle>
            <CardDescription>
              Review and confirm the information extracted from your documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="registryNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Registry Number
                      {getConfidenceBadge('registryNumber')}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cadastralReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cadastral Reference
                      {getConfidenceBadge('cadastralReference')}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Address
                    {getConfidenceBadge('address')}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Postal Code
                      {getConfidenceBadge('postalCode')}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Information
            </CardTitle>
            <CardDescription>
              Complete the property details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sale" id="sale" />
                          <label htmlFor="sale" className="cursor-pointer">For Sale</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rent" id="rent" />
                          <label htmlFor="rent" className="cursor-pointer">For Rent</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size_m2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Size (m²)
                      {getConfidenceBadge('size_m2')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="yearBuilt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Year Built
                      {getConfidenceBadge('yearBuilt')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New Construction</SelectItem>
                        <SelectItem value="good">Good Condition</SelectItem>
                        <SelectItem value="needs-renovation">Needs Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="energyRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Energy Rating
                      {getConfidenceBadge('energyRating')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((rating) => (
                          <SelectItem key={rating} value={rating}>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "px-2 py-1 rounded text-xs font-bold text-white",
                                rating === 'A' && "bg-green-600",
                                rating === 'B' && "bg-green-500",
                                rating === 'C' && "bg-yellow-500",
                                rating === 'D' && "bg-orange-500",
                                rating === 'E' && "bg-red-500",
                                rating === 'F' && "bg-red-600",
                                rating === 'G' && "bg-red-700"
                              )}>
                                {rating}
                              </div>
                              <span>Class {rating}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormDescription>
                    Provide a detailed description of the property (minimum 20 characters)
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the property features, location benefits, and unique selling points..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="cursor-pointer">
            Continue to Services
          </Button>
        </div>
      </form>
    </Form>
  );
}