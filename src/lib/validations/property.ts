import { z } from "zod";

export const editPropertySchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  type: z.enum(["apartment", "house", "villa", "penthouse", "studio"], {
    required_error: "Property type is required",
  }),
  price: z.number().min(1000, "Price must be at least €1,000"),
  bedrooms: z.number().min(0).max(20, "Maximum 20 bedrooms"),
  bathrooms: z.number().min(0).max(20, "Maximum 20 bathrooms"),
  size_m2: z.number().min(10, "Size must be at least 10 m²"),
  status: z.enum(["active", "pending", "sold", "rented"], {
    required_error: "Status is required",
  }),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  // Service status fields
  has_photos: z.boolean(),
  has_cee: z.boolean(),
  has_floor_plan: z.boolean(),
  has_virtual_tour: z.boolean(),
  has_cedula: z.boolean(),
});

export type EditPropertyFormData = z.infer<typeof editPropertySchema>;

// Schema for creating new properties with OCR
export const createPropertySchema = z.object({
  // OCR extracted data
  registryNumber: z.string().optional(),
  cadastralReference: z.string().optional(),
  
  // Basic property info
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postalCode: z.string().regex(/^\d{5}$/, "Postal code must be 5 digits"),
  
  type: z.enum(["apartment", "house", "villa", "penthouse", "studio"], {
    required_error: "Property type is required",
  }),
  
  // Property details
  price: z.number().min(1000, "Price must be at least €1,000"),
  bedrooms: z.number().min(0).max(20, "Maximum 20 bedrooms"),
  bathrooms: z.number().min(0).max(20, "Maximum 20 bathrooms"),
  size_m2: z.number().min(10, "Size must be at least 10 m²"),
  landSize_m2: z.number().optional(),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
  
  // Additional info
  description: z.string().min(20, "Description must be at least 20 characters"),
  features: z.array(z.string()).optional(),
  condition: z.enum(["new", "good", "needs-renovation"]).optional(),
  energyRating: z.string().optional(),
  
  // Transaction type
  transactionType: z.enum(["sale", "rent"]),
  
  // Initial status
  status: z.enum(["draft", "pending", "active"]).default("pending"),
});

export type CreatePropertyFormData = z.infer<typeof createPropertySchema>;

// OCR extracted data interface
export interface OCRExtractedData {
  // From Property ID Document
  registryNumber?: string;
  propertyType?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  size_m2?: number;
  
  // From Cadastral Reference
  cadastralReference?: string;
  yearBuilt?: number;
  landSize_m2?: number;
  buildingSize_m2?: number;
  floors?: number;
  energyRating?: string;
  
  // Metadata
  confidence: {
    [key: string]: number; // 0-100 confidence score
  };
}

// Service types for property
export const propertyServices = [
  { 
    id: 'photos',
    name: 'Professional Photography',
    description: 'High-quality photos by professional photographers',
    price: 150,
    estimatedDays: 3,
    icon: 'Camera'
  },
  { 
    id: 'cee',
    name: 'Energy Certificate (CEE)',
    description: 'Official energy efficiency certificate',
    price: 120,
    estimatedDays: 5,
    icon: 'Home'
  },
  { 
    id: 'floor_plan',
    name: 'Floor Plans',
    description: '2D floor plan drawings',
    price: 80,
    estimatedDays: 2,
    icon: 'Ruler'
  },
  { 
    id: 'virtual_tour',
    name: 'Virtual Tour',
    description: '360° interactive virtual tour',
    price: 200,
    estimatedDays: 4,
    icon: 'Video'
  },
  { 
    id: 'staging',
    name: 'Home Staging Consultation',
    description: 'Professional staging advice',
    price: 100,
    estimatedDays: 1,
    icon: 'Palette'
  }
] as const;

export type ServiceType = typeof propertyServices[number]['id'];

export const propertyTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "penthouse", label: "Penthouse" },
  { value: "studio", label: "Studio" },
] as const;

export const propertyStatuses = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "sold", label: "Sold", color: "bg-gray-100 text-gray-800" },
  { value: "rented", label: "Rented", color: "bg-blue-100 text-blue-800" },
] as const;

export const commonFeatures = [
  "Parking",
  "Balcony",
  "Terrace",
  "Garden",
  "Pool",
  "Garage",
  "Storage",
  "Elevator",
  "Air Conditioning",
  "Heating",
  "Fireplace",
  "Furnished",
  "Pet Friendly",
  "Security System",
  "Gym",
  "Concierge",
] as const;