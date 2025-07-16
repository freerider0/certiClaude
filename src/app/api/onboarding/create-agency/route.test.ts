/**
 * @jest-environment node
 */

// Mock modules before imports with factory functions
jest.mock('stripe', () => {
  const mockStripeCustomer = {
    id: 'cus_test123',
    email: 'test@example.com',
    name: 'Test Agency',
    metadata: {
      agencyName: 'Test Agency',
    },
  };

  const mockStripeInstance = {
    customers: {
      create: jest.fn().mockResolvedValue(mockStripeCustomer),
      del: jest.fn().mockResolvedValue({ id: 'cus_test123', deleted: true }),
    },
  };

  return jest.fn().mockImplementation(() => mockStripeInstance);
});

jest.mock('@/lib/supabase/server');

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status || 200,
      headers: new Headers(init?.headers || {}),
      json: async () => data,
    }),
  },
}));

import { POST } from './route';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Get the mocked Stripe instance
const MockedStripe = Stripe as jest.MockedClass<typeof Stripe>;
const mockStripeInstance = new MockedStripe('test-key') as any;

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn((table: string) => {
    const mockQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };
    return mockQuery;
  }),
};

(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

// Test data
const mockUser = {
  id: 'test-user-123',
  email: 'user@example.com',
};

const mockAgencyData = {
  userId: 'test-user-123',
  agencyName: 'Test Agency',
  contactEmail: 'agency@example.com',
  contactPhone: '+34 123 456 789',
  address: '123 Test Street, Barcelona',
};

const mockAgency = {
  id: 'agency-123',
  profile_id: 'test-user-123',
  name: 'Test Agency',
  contact_email: 'agency@example.com',
  contact_phone: '+34 123 456 789',
  address: '123 Test Street, Barcelona',
  stripe_customer_id: 'cus_test123',
  subscription_status: 'inactive',
};

const mockAgencyUser = {
  id: 'agency-user-123',
  agency_id: 'agency-123',
  user_id: 'test-user-123',
  role: 'owner',
};

// Helper to create mock request
const createMockRequest = (body: any) => {
  return {
    json: async () => body,
  } as Request;
};

describe('POST /api/onboarding/create-agency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const request = createMockRequest(mockAgencyData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if userId does not match authenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: { ...mockUser, id: 'different-user-id' } },
        error: null,
      });

      const request = createMockRequest(mockAgencyData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('User ID mismatch');
    });
  });

  describe('Validation Tests', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteData = {
        userId: 'test-user-123',
        agencyName: 'Test Agency',
        // Missing contactEmail, contactPhone, address
      };

      const request = createMockRequest(incompleteData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });
  });

  describe('Success Cases', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('should successfully create an agency with Stripe customer', async () => {
      // Setup mocks for successful flow
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'agencies') {
          const query = {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValueOnce({
              data: mockAgency,
              error: null,
            }),
            eq: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
          };
          return query;
        } else if (table === 'agency_users') {
          const query = {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValueOnce({
              data: mockAgencyUser,
              error: null,
            }),
            eq: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
          };
          return query;
        }
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
        };
      });

      const request = createMockRequest(mockAgencyData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.agency).toEqual({
        id: mockAgency.id,
        name: mockAgency.name,
      });

      // Verify Stripe customer was created
      expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
        email: mockAgencyData.contactEmail,
        name: mockAgencyData.agencyName,
        metadata: {
          agencyName: mockAgencyData.agencyName,
        },
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('should cleanup Stripe customer if agency creation fails', async () => {
      // Mock agency creation failure
      mockSupabaseClient.from.mockImplementation((table: string) => {
        const query = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({
            data: null,
            error: new Error('Database error'),
          }),
          eq: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
        };
        return query;
      });

      const request = createMockRequest(mockAgencyData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create agency');

      // Verify Stripe customer was deleted
      expect(mockStripeInstance.customers.del).toHaveBeenCalledWith('cus_test123');
    });

    it('should handle Stripe errors gracefully', async () => {
      // Mock Stripe customer creation failure
      mockStripeInstance.customers.create.mockRejectedValueOnce(new Error('Stripe error'));

      const request = createMockRequest(mockAgencyData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create agency');
    });
  });
});