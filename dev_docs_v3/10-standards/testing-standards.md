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

---

### Coverage Targets by Service

| Service | Current Tests | Current Coverage | Sprint-End Target | v1.0 Target | Priority |
|---------|--------------|-----------------|-------------------|-------------|----------|
| Auth & Admin | ~5 | ~5% | 15% | 40% | P0 (security-critical) |
| Dashboard | 0 | 0% | 10% | 20% | P2 (UI-only) |
| CRM / Customers | ~5 | ~5% | 15% | 30% | P1 |
| Sales / Quotes | 0 | 0% | 10% | 30% | P1 |
| TMS Core | 0 FE | ~5% | 15% | 40% | P0 (revenue-critical) |
| Carrier Management | 45 | ~30% | 35% | 50% | P0 (most-tested) |
| Accounting | ~5 | ~5% | 20% | 50% | P0 (FINANCIAL - mandatory) |
| Commission | 14 FE | ~20% | 30% | 50% | P0 (FINANCIAL - mandatory) |
| Load Board | 13 suites | ~15% | 20% | 30% | P1 |

### Coverage Milestones

| Milestone | Target Date | Overall Target | Key Metric |
|-----------|------------|---------------|------------|
| Current baseline | 2026-03-07 | 8.7% FE, ~15% BE (estimated) | 72 tests, 13 suites |
| Quality Sprint end (S4) | Sprint S4 end (~3-4 weeks) | 15% FE, 25% BE | 120+ tests passing |
| Pre-Production gate (S6) | Sprint S6 end (~8-10 weeks) | 25% FE, 40% BE | All P0 services >= 20% |
| v1.0 launch (S8) | v1.0 launch (Sprint S8, ~14-16 weeks) | 40% FE, 50% BE | All P0 services >= 40% |

> **Coverage metric:** "20% coverage" = **statement coverage** as reported by Istanbul/c8 (the Jest default). This is the coarsest but most commonly reported metric. Branch coverage and function coverage are tracked but not used as gate thresholds.

> **Backend coverage unknown:** Backend coverage percentage (~15%) is an ESTIMATE based on test file count vs module count. Run `pnpm --filter api test:coverage` to establish an actual baseline. This has never been run on the project. Until it is run, backend coverage claims in hub files should be treated as estimates.

### Financial Module Testing Mandate

**RULE:** Accounting, Commission, and Settlement modules MUST reach 20% test coverage before ANY production deployment. These modules handle real money (invoice calculations, commission splits, settlement amounts). A single calculation bug could cost a client thousands.

Priority test cases for financial modules:
1. Invoice total calculation (line items, taxes, discounts)
2. Commission split calculation (percentage-based, flat-rate, tiered)
3. Settlement amount reconciliation (carrier pay vs billed amount)
4. Currency/decimal handling (always integer cents, never floating point)
5. Multi-tenant isolation (Tenant A's invoices never leak to Tenant B)

### What NOT to Test

Do not waste effort testing:
- **shadcn/ui primitives** — tested upstream by Radix UI
- **Pure layout components** with no logic (wrappers, spacers)
- **Prisma-generated client methods** — test your service layer, not the ORM
- **Static configuration files** (constants, enum mappings)
- **Third-party library internals** (React Query, Zustand)
- **CSS/Tailwind classes** — use visual testing (Playwright) instead

### Test Layer Coverage Model

Every feature should have tests in at least 6 of these 8 layers:

| Layer | Example | Required? |
|-------|---------|-----------|
| 1. DTO Validation | Zod schema + class-validator tests | Yes |
| 2. Unit Tests | Business logic in service methods | Yes |
| 3. DB Operations | Prisma queries in integration tests | Yes |
| 4. Integration Tests | Controller + service + DB together | Yes |
| 5. Component Tests | React component with mocked hooks | Yes |
| 6. Page Tests | Full page render with data | Yes |
| 7. E2E Tests | Playwright full-flow tests | Recommended |
| 8. Documentation | API docs match implementation | Optional |

---

### Test Quality Tiers

Not all test files are equal. When auditing test coverage (e.g., during per-service tribunals), classify each spec file into one of these tiers:

| Tier | Definition | Example | Counts as Coverage? |
|------|-----------|---------|-------------------|
| **Tier 1: Empty Shell** | `describe()` block with no `it()` blocks, or all `it()` blocks are `it.todo()` or `it.skip()`. File exists but has zero assertions. | `describe('CarrierService', () => { /* empty */ })` | NO — counts as a spec file but contributes 0% to coverage. 7 of the Carrier Portal's spec files are Tier 1 stubs (PST-14). |
| **Tier 2: Basic Assertions** | `it()` blocks exist with basic assertions: `expect(result).toBeDefined()`, `expect(result).toBeTruthy()`, `expect(service).toBeInstanceOf()`. Tests verify existence, not correctness. | `it('should create', () => { expect(service.create(dto)).toBeDefined(); })` | PARTIAL — contributes to statement coverage but does not verify business logic. Many auto-generated NestJS test files are Tier 2. |
| **Tier 3: Comprehensive** | Tests cover edge cases, error paths, boundary values, and use meaningful assertions. Mocking is intentional. Tests would catch a regression if business logic changed. | `it('should reject invoice with zero total', () => { await expect(service.create({ total: 0 })).rejects.toThrow('Invoice total must be positive'); })` | YES — this is real coverage. Financial module tests (QS-015) must be Tier 3. |

**Rule:** When a hub file says "X tests exist," also note the tier. "45 tests (Tier 3)" is very different from "45 tests (Tier 2)." The carrier module's 45 tests are Tier 3 (real business logic assertions). Many other modules have Tier 1-2 stubs.

**Goal:** All P0 financial tests (QS-015) must be Tier 3. All P0 service tests should be at least Tier 2 by Sprint S6 end. Tier 1 stubs should be upgraded or deleted (they give false confidence).
