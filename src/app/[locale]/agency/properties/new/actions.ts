'use server';

import { createClient } from '@/lib/supabase/server';
import { createPropertySchema, type CreatePropertyFormData, type OCRExtractedData, type ServiceType } from '@/lib/validations/property';

// Mock OCR processing - In production, this would call Google Cloud Vision API
export async function processPropertyDocuments(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  propertyIdDoc: FormData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cadastralDoc: FormData
): Promise<OCRExtractedData> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock extracted data - In production, this would be real OCR results
  return {
    // From Property ID Document
    registryNumber: "REG-2024-12345",
    propertyType: "apartment",
    address: "Calle Mayor 123, 4º 2ª",
    city: "Barcelona",
    province: "Barcelona",
    postalCode: "08001",
    size_m2: 85,
    
    // From Cadastral Reference
    cadastralReference: "1234567 VD8901 S 0001 WX",
    yearBuilt: 1975,
    landSize_m2: 0,
    buildingSize_m2: 85,
    floors: 4,
    energyRating: "E",
    
    // Confidence scores
    confidence: {
      registryNumber: 95,
      propertyType: 88,
      address: 92,
      city: 98,
      province: 98,
      postalCode: 100,
      size_m2: 90,
      cadastralReference: 97,
      yearBuilt: 85,
      energyRating: 80
    }
  };
}

export async function createProperty(
  propertyData: CreatePropertyFormData,
  selectedServices: ServiceType[]
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get user's agency
    const { data: agencyUser } = await supabase
      .from('agency_users')
      .select('agency_id')
      .eq('user_id', user.id)
      .single();

    if (!agencyUser) {
      throw new Error('No agency found');
    }

    // Validate property data
    const validatedData = createPropertySchema.parse(propertyData);

    // TODO: Actually create the property in the database
    // For now, we'll simulate the creation
    console.log('Creating property:', validatedData);
    console.log('Selected services:', selectedServices);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock property ID
    const newPropertyId = Math.random().toString(36).substring(7);
    
    // TODO: Create service requests for selected services
    if (selectedServices.length > 0) {
      console.log('Creating service requests for:', selectedServices);
    }
    
    return { 
      success: true, 
      propertyId: newPropertyId,
      message: 'Property created successfully' 
    };
  } catch (error) {
    console.error('Error creating property:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to create property' 
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function uploadPropertyImages(files: FormData): Promise<string[]> {
  // TODO: Implement actual image upload to Supabase Storage
  // For now, return mock URLs
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
  ];
}

export async function saveDraft(propertyData: Partial<CreatePropertyFormData>) {
  // TODO: Implement draft saving functionality
  console.log('Saving draft:', propertyData);
  return { success: true, draftId: Math.random().toString(36).substring(7) };
}