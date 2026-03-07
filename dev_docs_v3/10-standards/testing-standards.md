# Testing Standards

> Source: `dev_docs/08-standards/72-testing-strategy.md`
> Stack: Jest 29 (API) / Jest 30 (Web), Testing Library, MSW, Supertest, Playwright

## Test Infrastructure

```bash
pnpm --filter web test            # Frontend: Jest 30 + Testing Library + MSW
pnpm --filter web test:coverage   # Frontend coverage report
pnpm --filter api test            # Backend: Jest 29 + Supertest
pnpm --filter api test:unit       # Backend unit tests only
pnpm --filter api test:e2e        # Backend E2E tests
```

## Current State

- **72 tests**, 13 suites, all green
- **8.7% frontend coverage** (target: 25%)
- **~15% backend coverage** (target: 40%)
- SWC resolves `@/` aliases in jest config

## Testing Pyramid

```
       /\
      /E2E\        ← 5 critical flows (Playwright)
     /------\
    /Integration\   ← API endpoint tests (Supertest)
   /------------\
  /  Unit Tests   \ ← Service methods, components, hooks
 /________________\
```

## What to Test

### Backend (Jest + Supertest)

| Priority | What | Why |
|----------|------|-----|
| P0 | Auth (login, register, token refresh) | Security-critical |
| P0 | Commission calculation | Financial accuracy |
| P0 | Invoice/Settlement creation | Financial accuracy |
| P1 | CRUD operations (create, update, delete) | Core functionality |
| P1 | Validation (DTOs reject bad input) | Data integrity |
| P2 | Authorization (role checks) | Security |
| P2 | Pagination, filtering, sorting | UX quality |

### Frontend (Testing Library + MSW)

| Priority | What | Why |
|----------|------|-----|
| P0 | Form submission (carrier, load, invoice) | Core user flow |
| P1 | Data table rendering | Most common component |
| P1 | Error/loading/empty states | UX quality |
| P2 | Custom hooks | Logic correctness |

### E2E (Playwright)

| # | Flow | Steps |
|---|------|-------|
| 1 | Login → Dashboard | Login, verify redirect, see dashboard |
| 2 | Create Order → Dispatch | Create order, assign carrier, create load |
| 3 | Invoice → Payment | Create invoice, record payment |
| 4 | Carrier Onboarding | Create carrier, add insurance, approve |
| 5 | Quote → Order | Create quote, accept, convert to order |

## Mocking Patterns

```typescript
// Backend: Mock PrismaService
const mockPrisma = {
  carrier: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: '1', legalName: 'Test' }),
  },
};

// Frontend: MSW handlers
rest.get('/api/v1/carriers', (req, res, ctx) => {
  return res(ctx.json({ data: mockCarriers, pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }));
});
```

## File Naming

- Unit tests: `*.spec.ts` (backend), `*.test.tsx` (frontend)
- E2E tests: `*.e2e-spec.ts`
- Test fixtures: `__fixtures__/`
- MSW handlers: `__mocks__/handlers.ts`
