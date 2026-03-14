# MP-08: Customer Portal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete 4-page Customer Portal (login, dashboard, documents, invoices) with public tracking, verified against 54 backend endpoints, with full auth + guard test coverage.

**Architecture:** Linear approach — verify endpoints first, then build frontend pages with Zustand auth context + React Query data layer, then test auth guards. Clean separation between auth (Zustand), data (React Query), and UI (shadcn/ui components).

**Tech Stack:** Next.js 16 (App Router), React 19, Zustand (state), React Query (server state), shadcn/ui (components), TailwindCSS, Jest + Supertest (tests)

---

## File Structure

### Create (New Files)

**Frontend — Portal Auth & State:**

- `apps/web/lib/store/portal-auth.store.ts` — Zustand store for session, token, user, companyId
- `apps/web/lib/api/portal-client.ts` — HTTP client for `/api/v1/portal/*` endpoints
- `apps/web/lib/hooks/usePortalAuth.ts` — Hook for portal auth state + methods
- `apps/web/lib/hooks/usePortalData.ts` — Hook for React Query portal endpoints

**Frontend — Portal Pages:**

- `apps/web/app/(portal)/portal/layout.tsx` — Portal root layout with PortalAuthProvider
- `apps/web/app/(portal)/portal/login/page.tsx` — Public login page
- `apps/web/app/(portal)/portal/dashboard/page.tsx` — Protected dashboard
- `apps/web/app/(portal)/portal/documents/page.tsx` — Protected documents list
- `apps/web/app/(portal)/portal/invoices/page.tsx` — Protected invoices list
- `apps/web/app/(portal)/portal/track/[code]/page.tsx` — Public tracking page

**Frontend — Portal Components:**

- `apps/web/components/portal/LoginForm.tsx` — Login form (email, password)
- `apps/web/components/portal/DashboardCards.tsx` — KPI cards component
- `apps/web/components/portal/ActivityFeed.tsx` — Activity feed component
- `apps/web/components/portal/DocumentTable.tsx` — Documents table
- `apps/web/components/portal/InvoiceList.tsx` — Invoices list with filters
- `apps/web/components/portal/InvoiceDetail.tsx` — Invoice detail modal

**Backend — Tests:**

- `apps/api/src/modules/customer-portal/portal-auth.guard.spec.ts` — Auth + scope guard tests

---

## Task List (15 Tasks, 20 Hours)

### Chunk 1: Setup & Auth Infrastructure (4 tasks)

**Task 1:** Create Portal Auth Zustand Store (1h)

- Files: `apps/web/lib/store/portal-auth.store.ts`
- Create Zustand store with token, user, companyId, isAuthenticated state
- Use persist middleware for localStorage
- Actions: setAuth, clearAuth, setToken
- Expected output: Compiles with no TypeScript errors

**Task 2:** Create Portal HTTP Client (1h)

- Files: `apps/web/lib/api/portal-client.ts`
- Export portalClient class with methods for all portal endpoints
- Include Authorization header with token from store
- Methods: login, logout, refreshToken, getDashboard, getInvoices, getShipmentTracking, etc.
- Expected output: Compiles, all methods implemented

**Task 3:** Create usePortalAuth Hook (1h)

- Files: `apps/web/lib/hooks/usePortalAuth.ts`
- Login, logout, refreshToken functions
- Return token, user, isAuthenticated
- Handle redirect to dashboard on login, to /portal/login on logout
- Expected output: Hook compiles, exports correct interface

**Task 4:** Create usePortalData Hook (1h)

- Files: `apps/web/lib/hooks/usePortalData.ts`
- React Query hooks for all portal endpoints
- useDashboard, useInvoices, useShipments, useShipmentTracking, etc.
- All hooks use queryKey and queryFn pattern
- Expected output: 10+ hooks, all compile, no errors

### Chunk 2: Portal Layout & Pages (3 tasks)

**Task 5:** Create Portal Root Layout (1h)

- Files: `apps/web/app/(portal)/portal/layout.tsx`
- Auth provider with Zustand store
- Navigation bar
- Redirect to login if not authenticated
- Expected output: Layout compiles, renders correctly

**Task 6:** Create Login Page (2h)

- Files: `apps/web/app/(portal)/portal/login/page.tsx`, `apps/web/components/portal/LoginForm.tsx`
- LoginForm component with email, password inputs
- Submit calls usePortalAuth().login()
- Error handling and loading state
- Redirect to dashboard on success
- Expected output: Both files created, form works, submits correctly

**Task 7:** Create Dashboard Page (3h)

- Files: `apps/web/app/(portal)/portal/dashboard/page.tsx`, `apps/web/components/portal/DashboardCards.tsx`, `apps/web/components/portal/ActivityFeed.tsx`
- DashboardCards component shows active shipments, pending invoices, alerts
- ActivityFeed component shows recent activity
- Dashboard page calls useDashboard, useActiveShipments, useRecentActivity, useAlerts
- Loading and empty states
- Expected output: Dashboard displays summary data, activity feed, quick action links

### Chunk 3: Documents & Invoices (2 tasks)

**Task 8:** Create Documents Page (2h)

- Files: `apps/web/app/(portal)/portal/documents/page.tsx`, `apps/web/components/portal/DocumentTable.tsx`
- DocumentTable shows list of documents
- Filter by document type
- Download button for each document
- Empty state if no documents
- Expected output: Documents page displays table with filters

**Task 9:** Create Invoices Page (2h)

- Files: `apps/web/app/(portal)/portal/invoices/page.tsx`, `apps/web/components/portal/InvoiceList.tsx`, `apps/web/components/portal/InvoiceDetail.tsx`
- InvoiceList shows invoices with status filter
- InvoiceDetail modal shows invoice details + PDF download
- AgingSummary cards (outstanding, paid, overdue)
- Expected output: Invoices page displays table, detail modal works, PDF download URL correct

### Chunk 4: Public Tracking & Verification (2 tasks)

**Task 10:** Create Public Tracking Page (1h)

- Files: `apps/web/app/(portal)/portal/track/[code]/page.tsx`
- No auth required
- Accept tracking code from URL param [code]
- Display shipment status, location, ETA, timeline of events
- Error handling if shipment not found
- Expected output: Tracking page renders, shows shipment data

**Task 11:** MP-08-001 Verification (2h)

- Verify all 54 Customer Portal endpoints
- Test each endpoint with valid JWT
- Test guard coverage (PortalAuthGuard, CompanyScopeGuard)
- Document results in VERIFICATION-RESULTS.md
- Expected output: All 54/54 endpoints verified, VERIFICATION-RESULTS.md created and committed

### Chunk 5: Auth Tests & Final Build (4 tasks)

**Task 12:** Write PortalAuthGuard Tests (2h)

- Files: `apps/api/src/modules/customer-portal/portal-auth.guard.spec.ts`, `apps/api/src/modules/customer-portal/company-scope.guard.spec.ts`
- PortalAuthGuard: 4 tests (valid token, no token, invalid token, expired token)
- CompanyScopeGuard: 3 tests (same company, different company, extract companyId)
- Integration tests: 2 tests (login → dashboard, token refresh)
- All tests passing
- Expected output: 9+ tests, all passing, 20%+ coverage

**Task 13:** Build & Test Frontend Portal (2h)

- Run `pnpm build` → 0 errors
- Run `pnpm check-types` → 0 errors
- Run `pnpm test` (web) → all pass
- Run `pnpm test` (api) → all pass
- Manual browser testing: login → dashboard → documents → invoices → tracking
- Expected output: All quality gates pass, pages render correctly

**Task 14:** Final Verification & Documentation (1h)

- Run full quality gate: lint + type-check + test + build
- Create MP-08-COMPLETION-REPORT.md
- Verify all exit criteria met
- Expected output: All checks pass, completion report generated

**Task 15:** Final Commit & Cleanup (0.5h)

- Verify all work committed
- View git log for MP-08 commits
- Final `pnpm build && pnpm test`
- Expected output: Working tree clean, all tests passing

---

## Exit Criteria

- [x] All 54 endpoints verified
- [x] Login page functional
- [x] Dashboard displays summary
- [x] Documents page lists documents
- [x] Invoices page shows list + detail
- [x] Public tracking works
- [x] Auth tests passing (9+)
- [x] No console errors
- [x] TypeScript strict mode passing
- [x] Build succeeds with 0 errors

---

## Context Notes

**Backend Status:** 54 endpoints across 7 controllers already built and tested (63 tests passing)

**Design Specs:** Available at `dev_docs/12-Rabih-design-Process/12-customer-portal/` (10 files)

**Auth:** Separate JWT from admin auth (PORTAL_JWT_SECRET). Uses PortalAuthGuard + CompanyScopeGuard

**Integration:** Frontend calls `/api/v1/portal/*` endpoints (proxied by Next.js)

**Testing:** React Query + shadcn/ui pattern from Load Planner page, TDD approach
