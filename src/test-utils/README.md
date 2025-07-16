# Testing Guide for Create-Agency Endpoint

## Overview
This directory contains testing utilities and mocks for testing the CertiFast application, with a focus on the create-agency endpoint.

## Test Structure
- `/src/test-utils/mocks/` - Mock implementations for external services (Supabase, Stripe)
- `/src/test-utils/test-data.ts` - Reusable test data
- `/src/app/api/onboarding/create-agency/__tests__/` - Tests for the create-agency endpoint

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- src/app/api/onboarding/create-agency/__tests__/route.test.ts
```

### Run tests in CI mode
```bash
npm run test:ci
```

## Test Coverage

The create-agency endpoint tests cover:
1. **Authentication Tests**
   - Unauthorized requests
   - User ID mismatch scenarios

2. **Validation Tests**
   - Missing required fields
   - Invalid field formats

3. **Success Cases**
   - Successful agency creation
   - Stripe customer creation
   - Agency-user relationship creation

4. **Error Handling**
   - Stripe API failures
   - Database transaction failures
   - Proper cleanup on failures

5. **Integration Tests**
   - Transaction rollback scenarios
   - Multi-service coordination

## Writing New Tests

### For API Routes
1. Create a `__tests__` directory next to your route file
2. Name your test file `route.test.ts`
3. Import necessary mocks and utilities
4. Structure your tests using describe/it blocks

### Example Test Structure
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '../route';

describe('POST /api/your-endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle success case', async () => {
    // Test implementation
  });
});
```

## Mocking External Services

### Supabase
Use the provided `mockSupabaseClient` from `/src/test-utils/mocks/supabase.ts`

### Stripe
Use the provided `mockStripe` from `/src/test-utils/mocks/stripe.ts`

## Best Practices
1. Always clear mocks between tests using `jest.clearAllMocks()`
2. Test both success and failure scenarios
3. Verify cleanup operations in error cases
4. Use descriptive test names
5. Group related tests using `describe` blocks
6. Keep test data in separate files for reusability