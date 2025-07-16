export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn((table: string) => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  })),
};

export const createMockSupabaseClient = () => {
  return jest.fn().mockResolvedValue(mockSupabaseClient);
};