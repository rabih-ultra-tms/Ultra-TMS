# E2E Testing Coverage Report — 2026-03-06

## Infrastructure

| Item | Status |
|------|--------|
| Package | `apps/e2e/` added to monorepo |
| Framework | Playwright 1.58.2 |
| Browsers | Chromium (primary), Firefox, Mobile Safari (responsive) |
| Auth | Pre-authenticated session storage via fixtures |
| Page Objects | Base page with toast, table, modal helpers |
| CI Ready | webServer config for Next.js + NestJS auto-start |

## Test Suites

### Auth & Session (5 tests)
- `tests/auth/login.spec.ts`
  - Login page renders
  - Invalid credentials show error
  - Empty form shows validation
  - Unauthenticated redirect to login
  - Authenticated user sees dashboard

### Navigation (17 tests)
- `tests/navigation/sidebar.spec.ts`
  - Sidebar visible on dashboard
  - 15 sidebar links navigate without 404
  - Deep linking to dashboard
  - Deep linking to customers

### CRM (12 tests)
- `tests/crm/companies-crud.spec.ts` — List, create button, form opens, validation, detail navigation
- `tests/crm/customers-crud.spec.ts` — List, search, create button, form
- `tests/crm/contacts-crud.spec.ts` — List, create button, form

### Operations (10 tests)
- `tests/operations/orders-crud.spec.ts` — List, create button, multi-step form, table columns
- `tests/operations/loads-lifecycle.spec.ts` — List, create, status column, detail, dispatch board, filters

### Carriers (5 tests)
- `tests/carriers/carrier-management.spec.ts` — List, search, table, form, detail

### Accounting (4 tests)
- `tests/accounting/invoices.spec.ts` — Invoices page, table/empty, create button, settlements

### Admin (5 tests)
- `tests/admin/users-crud.spec.ts` — Users list, table, create button, form, roles page

## Not Yet Covered (Future Suites)

| Suite | Priority | Notes |
|-------|----------|-------|
| Sales quotes CRUD | P1 | Quote creation, PDF, rate calc |
| Quote-to-order conversion | P1 | Full workflow |
| Commission plans | P2 | Plan CRUD, payout processing |
| Load board postings | P2 | Post, bid, accept |
| Form validation suite | P2 | Cross-form validation checks |
| Modal interactions | P2 | Open, close, submit modals |
| Accessibility (axe-core) | P2 | WCAG AA audit |
| Visual regression | P3 | Screenshot baselines |
| Responsive design | P3 | Mobile sidebar, table scroll |

## Running Tests

```bash
# All tests
pnpm --filter e2e test

# Specific suite
pnpm --filter e2e test:auth
pnpm --filter e2e test:nav
pnpm --filter e2e test:crm
pnpm --filter e2e test:ops
pnpm --filter e2e test:carriers
pnpm --filter e2e test:accounting
pnpm --filter e2e test:admin

# Interactive UI mode
pnpm --filter e2e test:ui

# Debug mode
pnpm --filter e2e test:debug
```
