'use server';

import { createClient } from '@/lib/supabase/server';

export interface Property {
  id: string;
  address: string;
  type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  size_m2: number;
  status: 'active' | 'pending' | 'sold' | 'rented';
  created_at: string;
  updated_at: string;
  main_image_url?: string;
  
  // Service status
  has_photos: boolean;
  has_cee: boolean;
  has_floor_plan: boolean;
  has_virtual_tour: boolean;
  has_cedula: boolean;
  
  // Metrics
  view_count: number;
  lead_count: number;
  favorite_count: number;
}

export async function getProperties(): Promise<Property[]> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user's agency
  const { data: agencyUser } = await supabase
    .from('agency_users')
    .select('agency_id')
    .eq('user_id', user.id)
    .single();

  if (!agencyUser) throw new Error('No agency found');

  // Get properties - for now returning mock data
  // TODO: Implement actual database query
  const mockProperties: Property[] = [
    {
      id: '1',
      address: 'Villa Marina, Barcelona',
      type: 'villa',
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      size_m2: 120,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      main_image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      has_photos: true,
      has_cee: true,
      has_floor_plan: false,
      has_virtual_tour: false,
      has_cedula: true,
      view_count: 1234,
      lead_count: 12,
      favorite_count: 8
    },
    {
      id: '2',
      address: 'Apartment Center, Madrid',
      type: 'apartment',
      price: 280000,
      bedrooms: 2,
      bathrooms: 1,
      size_m2: 85,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      main_image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      has_photos: true,
      has_cee: false,
      has_floor_plan: false,
      has_virtual_tour: false,
      has_cedula: false,
      view_count: 856,
      lead_count: 8,
      favorite_count: 5
    },
    {
      id: '3',
      address: 'Casa Beach, Valencia',
      type: 'house',
      price: 380000,
      bedrooms: 4,
      bathrooms: 3,
      size_m2: 150,
      status: 'sold',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      main_image_url: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800',
      has_photos: true,
      has_cee: true,
      has_floor_plan: true,
      has_virtual_tour: true,
      has_cedula: true,
      view_count: 445,
      lead_count: 0,
      favorite_count: 3
    }
  ];

  return mockProperties;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const properties = await getProperties();
  return properties.find(p => p.id === id) || null;
}