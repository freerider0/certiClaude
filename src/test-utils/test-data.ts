export const mockUser = {
  id: 'test-user-123',
  email: 'user@example.com',
};

export const mockAgencyData = {
  userId: 'test-user-123',
  agencyName: 'Test Agency',
  contactEmail: 'agency@example.com',
  contactPhone: '+34 123 456 789',
  address: '123 Test Street, Barcelona',
};

export const mockAgency = {
  id: 'agency-123',
  profile_id: 'test-user-123',
  name: 'Test Agency',
  contact_email: 'agency@example.com',
  contact_phone: '+34 123 456 789',
  address: '123 Test Street, Barcelona',
  stripe_customer_id: 'cus_test123',
  subscription_status: 'inactive',
};

export const mockAgencyUser = {
  id: 'agency-user-123',
  agency_id: 'agency-123',
  user_id: 'test-user-123',
  role: 'owner',
};