# Test Playbook

> Step-by-step guide for writing unit, integration, and E2E tests in Ultra TMS.

---

## Current Test Infrastructure

- **72 tests passing**, 13 suites, all green
- **Coverage:** 8.7% (target: 40% for Quality Sprint)
- **Frontend:** Jest 30 + Testing Library + MSW (Mock Service Worker)
- **Backend:** Jest 29 + Supertest
- SWC resolves `@/` aliases -- custom resolver in jest config

## Running Tests

```bash
# Frontend tests
pnpm --filter web test              # Run all
pnpm --filter web test:watch        # Watch mode
pnpm --filter web test:coverage     # Coverage report
pnpm --filter web test -- {pattern} # Single file

# Backend tests
pnpm --filter api test              # Run all
pnpm --filter api test:unit         # Unit tests
pnpm --filter api test:e2e          # E2E tests
```

## Writing Frontend Component Tests

### File Naming

```
apps/web/components/{domain}/{component-name}.test.tsx
apps/web/app/(dashboard)/{route}/page.test.tsx
```

### Test Structure

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComponentUnderTest } from './component-under-test';

// Create a fresh query client per test
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('ComponentUnderTest', () => {
  it('renders loading state', () => {
    render(<ComponentUnderTest />, { wrapper: createWrapper() });
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders data after loading', async () => {
    render(<ComponentUnderTest />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<ComponentUnderTest />, { wrapper: createWrapper() });
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

## Writing Frontend Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useItems } from './use-items';

describe('useItems', () => {
  it('fetches items', async () => {
    const { result } = renderHook(() => useItems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(10);
  });
});
```

## Mocking API Calls (MSW)

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/v1/carriers', () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'Test Carrier', status: 'ACTIVE' },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Writing Backend Unit Tests

```typescript
// apps/api/src/modules/{service}/{service}.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CarrierService } from './carrier.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CarrierService', () => {
  let service: CarrierService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarrierService,
        {
          provide: PrismaService,
          useValue: {
            carrier: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CarrierService>(CarrierService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should filter by tenantId', async () => {
    await service.findAll('tenant_1', {});
    expect(prisma.carrier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant_1', deletedAt: null }),
      }),
    );
  });
});
```

## What to Test (Priority Order)

### P0: Must Test

1. API envelope unwrapping (`response.data.data`)
2. Tenant isolation (every query filters by tenantId)
3. Status machine transitions (valid and invalid)
4. Auth guards (unauthorized access rejected)
5. Form validation (Zod schemas)

### P1: Should Test

1. Pagination behavior
2. Search/filter functionality
3. Loading/error/empty states
4. Soft delete behavior
5. CRUD operations

### P2: Nice to Test

1. Keyboard shortcuts
2. Responsive layout changes
3. Print/export formats
4. Accessibility (aria labels, focus management)

## Test Data Patterns

```typescript
// Use factory functions from seed data
import { createCarrier, createCustomer } from 'test/factories';

const testCarrier = createCarrier('tenant_test', {
  status: 'ACTIVE',
  insuranceExpiry: addMonths(new Date(), 6),
});
```

## Common Test Gotchas

1. **SWC alias resolution:** `@/` paths resolve via custom jest config -- don't change it
2. **React Query wrapper:** Always wrap components that use hooks in QueryClientProvider
3. **API envelope:** Mock responses must match `{ data: T }` or `{ data: T[], pagination: {...} }` format
4. **Async state:** Use `waitFor` for anything that depends on API calls
5. **Cleanup:** Each test gets a fresh QueryClient to avoid cached data leaks
