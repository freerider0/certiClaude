// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Add custom matchers or global test setup here
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'

// Mock NextRequest and NextResponse for API route testing
global.Request = jest.fn().mockImplementation((url, init) => ({
  url,
  method: init?.method || 'GET',
  headers: new Headers(init?.headers || {}),
  json: jest.fn().mockResolvedValue(JSON.parse(init?.body || '{}')),
  text: jest.fn().mockResolvedValue(init?.body || ''),
}))

global.Response = jest.fn().mockImplementation((body, init) => ({
  status: init?.status || 200,
  headers: new Headers(init?.headers || {}),
  json: jest.fn().mockResolvedValue(typeof body === 'string' ? JSON.parse(body) : body),
  text: jest.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
}))

// Mock next/server NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      status: init?.status || 200,
      headers: new Headers(init?.headers || {}),
      json: async () => data,
    }),
  },
}))