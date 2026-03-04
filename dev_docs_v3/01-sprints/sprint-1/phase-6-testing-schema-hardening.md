# Sprint 1 — Phase 6: Testing & Schema Hardening (Weeks 11-12)
> 11 tasks | 45-60h estimated | Prereq: Phases 1-5 complete, all services at 8+/10

---

## TEST-001: Playwright E2E Setup [P0]
**Effort:** M (4-6h)

### Context
No E2E framework exists. Need Playwright for cross-browser automated testing of critical user journeys.

### Sub-tasks

#### TEST-001a: Install Playwright
```bash
cd apps/web && pnpm add -D @playwright/test && npx playwright install
```

#### TEST-001b: Create Playwright Config
**Create:** `apps/web/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

#### TEST-001c: Create E2E Test Structure
```
apps/web/e2e/
├── auth/
│   └── login.spec.ts
├── operations/
│   └── dispatch.spec.ts
├── accounting/
│   └── invoices.spec.ts
├── carriers/
│   └── carrier-crud.spec.ts
├── commissions/
│   └── payout.spec.ts
├── fixtures/
│   └── auth.fixture.ts      # Login helper
└── utils/
    └── seed.ts               # Test data seeder
```

#### TEST-001d: Create Auth Fixture
**Create:** `apps/web/e2e/fixtures/auth.fixture.ts`

```typescript
import { test as base, Page } from '@playwright/test';

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@ultra-tms.com');
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await use(page);
  },
});
```

#### TEST-001e: Add Scripts
**Update:** `apps/web/package.json`
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:report": "playwright show-report"
}
```

### Acceptance Criteria
- [ ] Playwright installed and configured
- [ ] Auth fixture logs in successfully
- [ ] `pnpm test:e2e` runs without errors
- [ ] CI pipeline includes Playwright (add to INFRA-001's ci.yml)

---

## TEST-002: Critical Path E2E Tests (5 Journeys) [P0]
**Effort:** L (8-12h)

### Journey 1: Login → Dashboard
**File:** `apps/web/e2e/auth/login.spec.ts`

```typescript
test('complete login flow', async ({ page }) => {
  // Navigate to login
  // Fill credentials
  // Submit
  // Verify redirected to dashboard
  // Verify dashboard shows data (not error)
  // Verify sidebar navigation visible
  // Logout and verify redirect to login
});

test('invalid credentials show error', async ({ page }) => { ... });
test('locked account shows lockout message', async ({ page }) => { ... });
```

### Journey 2: Create Order → Dispatch
**File:** `apps/web/e2e/operations/dispatch.spec.ts`

```typescript
test('create order and dispatch', async ({ authenticatedPage: page }) => {
  // Go to orders
  // Click "New Order"
  // Fill shipper info
  // Add pickup/delivery stops
  // Save order
  // Go to dispatch board
  // Find the order
  // Assign carrier
  // Verify status changes to "Dispatched"
});
```

### Journey 3: Create Invoice → Record Payment
**File:** `apps/web/e2e/accounting/invoices.spec.ts`

```typescript
test('invoice lifecycle', async ({ authenticatedPage: page }) => {
  // Go to invoices
  // Click "New Invoice"
  // Select customer
  // Add line items
  // Save → verify total calculated
  // Approve invoice
  // Record payment
  // Verify invoice status = "Paid"
});
```

### Journey 4: Carrier CRUD
**File:** `apps/web/e2e/carriers/carrier-crud.spec.ts`

```typescript
test('carrier lifecycle', async ({ authenticatedPage: page }) => {
  // Go to carriers
  // Click "Add Carrier"
  // Enter DOT number
  // (FMCSA lookup if available)
  // Fill carrier details
  // Save
  // Verify carrier in list
  // Click carrier → detail page
  // Edit carrier
  // Save changes
  // Verify changes persisted
});
```

### Journey 5: Commission → Payout
**File:** `apps/web/e2e/commissions/payout.spec.ts`

```typescript
test('commission payout flow', async ({ authenticatedPage: page }) => {
  // Go to commissions
  // View commission plan
  // Check transaction list
  // Generate payout
  // Verify payout amount
  // Approve payout
});
```

### Sub-tasks
1. Write Journey 1: Login (3 test cases)
2. Write Journey 2: Order → Dispatch (2 test cases)
3. Write Journey 3: Invoice → Payment (2 test cases)
4. Write Journey 4: Carrier CRUD (2 test cases)
5. Write Journey 5: Commission → Payout (2 test cases)
6. Run all 5 journeys locally — fix any flaky tests
7. Add to CI pipeline

### Acceptance Criteria
- [ ] 5 E2E journeys with 11+ test cases
- [ ] All pass locally
- [ ] All pass in CI
- [ ] Test runs in under 5 minutes

---

## TEST-003: Operations Module Unit Tests [P0]
**Effort:** L (8-12h) | 4,869 LOC with 0 tests → 60% coverage target

### Context
The Operations module (`apps/api/src/modules/operations/`) is the largest untested module. It handles carriers, equipment, truck types, load history, and load planner quotes.

### Sub-tasks

#### TEST-003a: Carrier Operations Tests (10+ tests)
**Create:** `apps/api/src/modules/operations/carriers/carriers.service.spec.ts`

```typescript
describe('OperationsCarriersService', () => {
  describe('findAll', () => {
    it('returns carriers for the given tenant');
    it('does not return carriers from other tenants');
    it('paginates results');
    it('filters by status');
    it('searches by name or MC number');
  });

  describe('create', () => {
    it('creates carrier with required fields');
    it('validates DOT number format');
    it('prevents duplicate DOT numbers within tenant');
  });

  describe('update', () => {
    it('updates carrier fields');
    it('prevents updating carrier from different tenant');
  });

  describe('drivers', () => {
    it('adds driver to carrier');
    it('lists drivers for carrier');
  });

  describe('trucks', () => {
    it('adds truck to carrier');
    it('lists trucks for carrier');
  });
});
```

#### TEST-003b: Equipment Tests (5+ tests)
**Create:** `apps/api/src/modules/operations/equipment/equipment.service.spec.ts`

#### TEST-003c: Truck Types Tests (5+ tests)
**Create:** `apps/api/src/modules/operations/truck-types/truck-types.service.spec.ts`

#### TEST-003d: Load History Tests (5+ tests)
**Create:** `apps/api/src/modules/operations/load-history/load-history.service.spec.ts`

#### TEST-003e: Load Planner Quotes Tests (5+ tests)
**Create:** `apps/api/src/modules/operations/load-planner-quotes/load-planner-quotes.service.spec.ts`

### Acceptance Criteria
- [ ] 30+ tests for operations module (up from 0)
- [ ] 60%+ code coverage on operations module
- [ ] Tenant isolation tested on every CRUD operation
- [ ] All tests pass in CI

---

## TEST-004: Frontend Test Coverage Push [P1]
**Effort:** M (6-8h) | 57 tests → target 45%+ coverage

### Current State
- 57 test files for 450+ components/pages
- Coverage threshold set to 70% in jest config but not enforced

### Sub-tasks

#### TEST-004a: Add Tests for Critical Components
Priority components (used most, most complex):

| Component | Test File | Tests |
|-----------|----------|-------|
| DataTable | `__tests__/components/data-table.test.tsx` | Render, sort, paginate, filter |
| Forms (hook-form) | `__tests__/components/forms.test.tsx` | Validation, submit, error states |
| Modal/Dialog | `__tests__/components/dialog.test.tsx` | Open, close, confirm |
| Toast notifications | `__tests__/components/toast.test.tsx` | Show, dismiss, types |
| Sidebar navigation | `__tests__/components/sidebar.test.tsx` | Routes, active state, collapse |

#### TEST-004b: Add Tests for Key Pages
| Page | Test File | Tests |
|------|----------|-------|
| Dashboard | `__tests__/pages/dashboard.test.tsx` | Renders KPIs, handles loading |
| Carrier List | `__tests__/pages/carriers.test.tsx` | Renders table, search, pagination |
| Invoice List | `__tests__/pages/invoices.test.tsx` | Renders table, status filters |

#### TEST-004c: Add Hook Tests
| Hook | Test File | Tests |
|------|----------|-------|
| useAuth | `__tests__/hooks/use-auth.test.ts` | Login, logout, refresh |
| useCarriers | `__tests__/hooks/use-carriers.test.ts` | Fetch, create, unwrap |
| useInvoices | `__tests__/hooks/use-invoices.test.ts` | CRUD, calculate |

### Acceptance Criteria
- [ ] 100+ frontend tests (up from 57)
- [ ] 45%+ coverage on lib/ and components/ directories
- [ ] Critical components tested (DataTable, forms, dialogs)
- [ ] Key hooks tested with mocked API responses

---

## DB-001: Audit Trail Fields [P1]
**Effort:** M (4-6h)

### Context
~170 models have `updatedById` but ~32 are missing it. Need consistency.

### File
`apps/api/prisma/schema.prisma`

### Sub-tasks
1. **DB-001a:** Identify all models missing `createdById` or `updatedById`:
   ```bash
   # Find models without updatedById
   grep -B 20 "@@index" apps/api/prisma/schema.prisma | grep -A 1 "model " | grep -v updatedById
   ```
2. **DB-001b:** Add missing audit fields to those models
3. **DB-001c:** Create migration
4. **DB-001d:** Update services to set `updatedById` on every update operation
5. **DB-001e:** Verify in AuditInterceptor that mutations log the user

### Acceptance Criteria
- [ ] All business models have createdById and updatedById
- [ ] Update operations set updatedById
- [ ] Migration runs clean

---

## DB-002: onDelete Specification [P1]
**Effort:** M (4-6h) | 60+ relationships missing onDelete

### Sub-tasks
1. **DB-002a:** List all relations without explicit onDelete:
   ```bash
   grep -n "@relation" apps/api/prisma/schema.prisma | grep -v "onDelete"
   ```
2. **DB-002b:** For each, determine correct strategy:
   - **Cascade:** parent deletion deletes children (e.g., tenant → users)
   - **SetNull:** parent deletion nullifies FK (e.g., user → optional creator)
   - **Restrict:** prevent parent deletion if children exist (e.g., customer → invoices)
3. **DB-002c:** Apply onDelete to all ~60 relationships
4. **DB-002d:** Create migration
5. **DB-002e:** Test cascade behavior doesn't unexpectedly delete data

### Acceptance Criteria
- [ ] All relationships have explicit onDelete
- [ ] Zero implicit cascades (Prisma default is Cascade — dangerous if unintended)
- [ ] Migration runs clean
- [ ] No data loss on delete operations

---

## DB-003: Soft Delete for Financial Models [P0]
**Effort:** S (2-3h)

### Context
Financial records (invoices, payments, settlements) must never be hard-deleted. Audit compliance requires preservation.

### Sub-tasks
1. **DB-003a:** Verify these models have `deletedAt`:
   - Invoice, InvoiceLineItem, Payment, PaymentAllocation
   - Payable, Settlement, SettlementItem
   - CommissionTransaction, CommissionPayout
   - CreditApplication, CreditLimit
2. **DB-003b:** Add `deletedAt` where missing
3. **DB-003c:** Verify service delete methods use soft delete:
   ```typescript
   // WRONG: await prisma.invoice.delete({ where: { id } });
   // RIGHT: await prisma.invoice.update({ where: { id }, data: { deletedAt: new Date() } });
   ```
4. **DB-003d:** Verify all queries filter out deleted records:
   ```typescript
   where: { tenantId, deletedAt: null }
   ```

### Acceptance Criteria
- [ ] All financial models have deletedAt field
- [ ] Delete operations use soft delete (update deletedAt)
- [ ] Queries exclude soft-deleted records
- [ ] No hard delete on financial data

---

## DB-004: Seed Data Enhancement [P1]
**Effort:** M (3-4h)

### File
`apps/api/prisma/seed.ts`

### Sub-tasks
1. **DB-004a:** Verify seed creates a valid tenant with all required relations
2. **DB-004b:** Add seed data for:
   - 2 users (admin, dispatcher) with proper roles
   - 3 customers with contacts
   - 5 carriers with trucks and drivers
   - 10 sample loads in various statuses
   - 5 invoices (paid, unpaid, overdue)
   - Commission plan with tiers
3. **DB-004c:** Add a second tenant with minimal data (for isolation testing)
4. **DB-004d:** Verify `pnpm prisma:seed` runs without errors

### Acceptance Criteria
- [ ] Seed creates realistic demo data
- [ ] Two tenants for isolation testing
- [ ] All service pages show data after seed
- [ ] Seed is idempotent (can run multiple times)

---

## QUAL-001: Per-Route Error States [P1]
**Effort:** M (4-6h)

### Context
101 pages, 0 error.tsx files. While INFRA-002 added group-level error boundaries, individual routes benefit from specific error handling.

### Sub-tasks
1. **QUAL-001a:** Create `error.tsx` for high-traffic route groups:
   - `app/(dashboard)/operations/error.tsx`
   - `app/(dashboard)/accounting/error.tsx`
   - `app/(dashboard)/commissions/error.tsx`
   - `app/(dashboard)/admin/error.tsx`
   - `app/(dashboard)/companies/error.tsx`
   - `app/(dashboard)/carriers/error.tsx`
2. **QUAL-001b:** Each error.tsx should:
   - Show the error message
   - Offer a "Try Again" button (calls `reset()`)
   - Offer a "Go to Dashboard" link
   - Report to Sentry
3. **QUAL-001c:** Test by intentionally breaking each route

### Acceptance Criteria
- [ ] 6+ route-group error.tsx files
- [ ] Each shows actionable error UI
- [ ] Sentry receives error reports
- [ ] No white screens on any page error

---

## QUAL-002: Empty State Audit [P1]
**Effort:** M (3-4h)

### Context
When a list page has no data, it should show a helpful empty state — not a blank table.

### Sub-tasks
1. **QUAL-002a:** Create reusable `EmptyState` component:
   ```typescript
   <EmptyState
     icon={Package}
     title="No loads yet"
     description="Create your first load to get started."
     action={{ label: "Create Load", href: "/operations/loads/new" }}
   />
   ```
2. **QUAL-002b:** Add empty states to key list pages:
   - Loads, Orders, Carriers, Customers, Invoices, Commissions, Quotes
3. **QUAL-002c:** Differentiate "no data" from "no search results"

### Acceptance Criteria
- [ ] All list pages show meaningful empty state
- [ ] Empty state includes action button to create new item
- [ ] Search with no results shows "No results for [query]"

---

## QUAL-003: Stub Handler Audit [P1]
**Effort:** M (3-4h)

### Context
Some pages have buttons that don't do anything (stubs). Need to find and either implement or properly disable them.

### Sub-tasks
1. **QUAL-003a:** Search for stub patterns:
   ```bash
   grep -rn "onClick={() => {}}" apps/web/
   grep -rn "// TODO" apps/web/ --include="*.tsx"
   grep -rn "alert(" apps/web/ --include="*.tsx"
   grep -rn "Not implemented" apps/web/
   ```
2. **QUAL-003b:** For each stub:
   - If backend endpoint exists → implement the action
   - If backend endpoint doesn't exist → disable button with tooltip "Coming soon"
3. **QUAL-003c:** Replace `alert()` in `ExtractedItemsList.tsx` with toast notification
4. **QUAL-003d:** Resolve TODO comments in:
   - `components/carriers/carrier-documents-section.tsx`
   - `app/(dashboard)/operations/orders/page.tsx`

### Acceptance Criteria
- [ ] Zero `alert()` calls in production code
- [ ] Zero stub onClick handlers (`() => {}`)
- [ ] All TODO comments resolved or converted to GitHub issues
- [ ] Unimplemented features show "Coming soon" with disabled state

---

## Phase 6 Summary

| Task | Priority | Effort | Scope |
|------|----------|--------|-------|
| TEST-001 | P0 | M (4-6h) | Playwright setup |
| TEST-002 | P0 | L (8-12h) | 5 E2E journeys |
| TEST-003 | P0 | L (8-12h) | Operations: 30+ tests |
| TEST-004 | P1 | M (6-8h) | Frontend: 100+ tests |
| DB-001 | P1 | M (4-6h) | Audit trail fields |
| DB-002 | P1 | M (4-6h) | onDelete for 60+ relations |
| DB-003 | P0 | S (2-3h) | Soft delete financial |
| DB-004 | P1 | M (3-4h) | Seed data enhancement |
| QUAL-001 | P1 | M (4-6h) | 6+ error.tsx files |
| QUAL-002 | P1 | M (3-4h) | Empty states |
| QUAL-003 | P1 | M (3-4h) | Stub cleanup |
| **TOTAL** | | **45-60h** | |

### Execution Order
1. TEST-001 (Playwright setup) — needed before TEST-002
2. DB-003 (soft delete) — quick, critical for data safety
3. TEST-003 (operations tests) — highest coverage gap
4. DB-001 + DB-002 (schema fixes) — can parallel with tests
5. TEST-002 (E2E journeys) — depends on TEST-001
6. TEST-004 (frontend coverage) — can parallel with E2E
7. DB-004 (seed data) — after schema changes
8. QUAL-001 + QUAL-002 + QUAL-003 (quality) — can parallel

---

# SPRINT 1 COMPLETE SUMMARY

## All 57 Tasks by Phase

| Phase | Weeks | Tasks | Hours | Focus |
|-------|-------|-------|-------|-------|
| 1 | 1-2 | 11 | 35-45h | Security + Infrastructure |
| 2 | 3-4 | 9 | 30-40h | Monitoring + Systemic Fixes |
| 3 | 5-6 | 8 | 30-40h | Auth/Admin + CRM Quality |
| 4 | 7-8 | 9 | 40-55h | Sales + TMS Core Quality |
| 5 | 9-10 | 9 | 35-45h | Carrier + Accounting + Commission |
| 6 | 11-12 | 11 | 45-60h | Testing + Schema Hardening |
| **Total** | **1-12** | **57** | **215-285h** | |

## Total Sub-tasks: ~200+

## Exit Criteria Checklist
- [ ] SEC: Tenant throws on missing, 18 models have tenantId, A+ headers, CORS from env
- [ ] INFRA: CI on every PR, error boundaries on all routes, health endpoint with Redis
- [ ] MON: Sentry capturing errors, Pino structured logging, uptime monitoring
- [ ] FIX: Socket stable 10+ min, all 47 hooks unwrap, nav links valid
- [ ] AUTH: 8+/10, all hooks work, 15+ tests, 4-state pages
- [ ] CRM: 8+/10, all hooks work, 15+ tests, pipeline works
- [ ] SALES: 8+/10, all hooks work, 15+ tests, quote lifecycle works
- [ ] TMS: 8+/10, dispatch board stable, tracking map works, 25+ tests
- [ ] CARRIER: 8+/10, FMCSA lookup works, 15+ tests
- [ ] ACCOUNTING: 8+/10, invoice lifecycle works, 15+ tests
- [ ] COMMISSION: 8+/10, payout flow works, 15+ tests
- [ ] TESTING: Playwright setup, 5 E2E pass, 45%+ frontend coverage
- [ ] SCHEMA: All onDelete explicit, audit trails, soft delete, 60+ relations fixed
- [ ] QUALITY: Zero alert(), zero stubs, zero console.log, empty states on all lists
