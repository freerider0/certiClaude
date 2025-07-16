export const mockStripeCustomer = {
  id: 'cus_test123',
  email: 'test@example.com',
  name: 'Test Agency',
  metadata: {
    agencyName: 'Test Agency',
  },
};

export const mockStripe = {
  customers: {
    create: jest.fn().mockResolvedValue(mockStripeCustomer),
    del: jest.fn().mockResolvedValue({ id: 'cus_test123', deleted: true }),
  },
};