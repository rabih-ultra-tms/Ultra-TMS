# MP-08: Carrier Portal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Carrier Portal (10 pages + quick pay flow) with separate JWT auth, load acceptance workflow, driver management, compliance docs, and full guard test coverage.

**Architecture:** Linear approach — verify backend endpoints first, then build frontend pages with Zustand auth context + React Query data layer. Same pattern as Customer Portal but carrier-specific with load acceptance, quick pay, and driver management flows.

**Tech Stack:** Next.js 16 (App Router), React 19, Zustand (state), React Query (server state), shadcn/ui (components), TailwindCSS, Jest + Supertest (tests)

---

## File Structure

### Create (New Files)

**Frontend — Carrier Auth & State:**

- `apps/web/lib/store/carrier-auth.store.ts` — Zustand store for session, token, user, carrierId
- `apps/web/lib/api/carrier-client.ts` — HTTP client for `/api/v1/carrier-portal/*` endpoints
- `apps/web/lib/hooks/useCarrierAuth.ts` — Hook for carrier auth state + methods
- `apps/web/lib/hooks/useCarrierData.ts` — Hook for React Query carrier endpoints

**Frontend — Carrier Portal Pages:**

- `apps/web/app/(carrier)/carrier/layout.tsx` — Carrier root layout with CarrierAuthProvider
- `apps/web/app/(carrier)/carrier/login/page.tsx` — Public login page
- `apps/web/app/(carrier)/carrier/dashboard/page.tsx` — Protected dashboard
- `apps/web/app/(carrier)/carrier/loads/page.tsx` — Protected available loads list
- `apps/web/app/(carrier)/carrier/loads/[id]/accept/page.tsx` — Load detail + accept/reject
- `apps/web/app/(carrier)/carrier/documents/page.tsx` — Protected document upload (POD, insurance, W-9)
- `apps/web/app/(carrier)/carrier/drivers/page.tsx` — Protected driver management
- `apps/web/app/(carrier)/carrier/payments/page.tsx` — Protected payment viewing + settlement
- `apps/web/app/(carrier)/carrier/quick-pay/page.tsx` — Quick pay request flow
- `apps/web/app/(carrier)/carrier/profile/page.tsx` — Carrier profile + compliance management

**Frontend — Carrier Components:**

- `apps/web/components/carrier/LoginForm.tsx` — Login form (email, password)
- `apps/web/components/carrier/AvailableLoadsList.tsx` — List of available loads
- `apps/web/components/carrier/LoadDetailModal.tsx` — Load detail + accept/reject buttons
- `apps/web/components/carrier/DocumentUpload.tsx` — Multi-file upload for compliance docs
- `apps/web/components/carrier/DriverTable.tsx` — Driver CRUD with inline editing
- `apps/web/components/carrier/PaymentHistory.tsx` — Payment view with filters
- `apps/web/components/carrier/QuickPayForm.tsx` — Quick pay request form (2%, $100 min)
- `apps/web/components/carrier/CarrierProfileForm.tsx` — Profile edit form
- `apps/web/components/carrier/ComplianceDashboard.tsx` — Compliance docs status

**Backend — Tests:**

- `apps/api/src/modules/carrier-portal/carrier-portal-auth.guard.spec.ts` — Auth + scope guard tests

---

## Task List (10 Tasks, 35 Hours)

### Chunk 1: Setup & Auth Infrastructure (4 tasks)

**Task 1:** Create Carrier Auth Zustand Store (1.5h)

- Files: `apps/web/lib/store/carrier-auth.store.ts`
- Create Zustand store with token, user, carrierId, isAuthenticated state
- Use persist middleware for localStorage
- Actions: setAuth, clearAuth, setToken
- Expected output: Compiles with no TypeScript errors

**Task 2:** Create Carrier HTTP Client (1.5h)

- Files: `apps/web/lib/api/carrier-client.ts`
- Export carrierClient class with methods for all carrier portal endpoints
- Include Authorization header with token from store
- Methods: login, logout, refreshToken, getAvailableLoads, acceptLoad, rejectLoad, getPaymentHistory, getDrivers, etc.
- Expected output: Compiles, all methods implemented

**Task 3:** Create useCarrierAuth Hook (1h)

- Files: `apps/web/lib/hooks/useCarrierAuth.ts`
- Login, logout, refreshToken functions
- Return token, user, isAuthenticated
- Handle redirect to dashboard on login, to /carrier/login on logout
- Expected output: Hook compiles, exports correct interface

**Task 4:** Create useCarrierData Hook (2h)

- Files: `apps/web/lib/hooks/useCarrierData.ts`
- React Query hooks for all carrier portal endpoints
- useAvailableLoads, useLoadDetail, usePaymentHistory, useDrivers, useComplianceDocs, etc.
- All hooks use queryKey and queryFn pattern
- Expected output: 10+ hooks, all compile, no errors

### Chunk 2: Carrier Portal Layout & Login (2 tasks)

**Task 5:** Create Carrier Root Layout (1h)

- Files: `apps/web/app/(carrier)/carrier/layout.tsx`
- Auth provider with Zustand store
- Navigation bar (Dashboard, Loads, Documents, Drivers, Payments, Quick Pay, Profile)
- Redirect to login if not authenticated
- Expected output: Layout compiles, renders correctly

**Task 6:** Create Login Page (2h)

- Files: `apps/web/app/(carrier)/carrier/login/page.tsx`, `apps/web/components/carrier/LoginForm.tsx`
- LoginForm component with email, password inputs
- Submit calls useCarrierAuth().login()
- Error handling and loading state
- Redirect to dashboard on success
- Expected output: Both files created, form works, submits correctly

### Chunk 3: Load Management (2 tasks)

**Task 7:** Create Available Loads Page (3h)

- Files: `apps/web/app/(carrier)/carrier/loads/page.tsx`, `apps/web/components/carrier/AvailableLoadsList.tsx`, `apps/web/components/carrier/LoadDetailModal.tsx`
- AvailableLoadsList component shows available loads (origin, destination, rate, pickup date, commodity)
- Filter by status (available, pending, expired)
- Click load to open LoadDetailModal showing full details
- Modal has Accept/Reject buttons
- On accept: POST to `/api/v1/carrier-portal/loads/{id}/accept`, show confirmation, refresh list
- On reject: POST to `/api/v1/carrier-portal/loads/{id}/reject`
- Loading and empty states
- Expected output: Loads page displays list, modal works, accept/reject functional

**Task 8:** Create Document Upload Page (3h)

- Files: `apps/web/app/(carrier)/carrier/documents/page.tsx`, `apps/web/components/carrier/DocumentUpload.tsx`
- DocumentUpload component with drag-and-drop file upload
- Support: POD (Proof of Delivery), Insurance Certificate, W-9
- Show uploaded documents with delete/download buttons
- Submit via FormData to `/api/v1/carrier-portal/documents/upload`
- Track upload progress
- Expected output: Document upload page works end-to-end

### Chunk 4: Drivers & Compliance (2 tasks)

**Task 9:** Create Driver Management Page (3h)

- Files: `apps/web/app/(carrier)/carrier/drivers/page.tsx`, `apps/web/components/carrier/DriverTable.tsx`
- DriverTable shows list of drivers (name, license, status, assign to loads)
- Add driver form: name, license, license expiry, phone
- Edit/delete buttons for each driver
- Modal to assign driver to load
- Expected output: Driver CRUD works, assignment modal functional

**Task 10:** Create Compliance & Profile Pages (4h)

- Files: `apps/web/app/(carrier)/carrier/profile/page.tsx`, `apps/web/components/carrier/CarrierProfileForm.tsx`, `apps/web/components/carrier/ComplianceDashboard.tsx`
- CarrierProfileForm: company name, MC number, DOT number, contact info, address
- ComplianceDashboard: compliance doc status (W-9, Insurance, etc.) with expiry warnings
- Profile edit saves via PUT `/api/v1/carrier-portal/users/profile`
- Compliance shows required vs uploaded docs
- Expected output: Profile editable, compliance status visible

### Chunk 5: Payments & Quick Pay (2 tasks)

**Task 11:** Create Payment Viewing Page (2h)

- Files: `apps/web/app/(carrier)/carrier/payments/page.tsx`, `apps/web/components/carrier/PaymentHistory.tsx`
- PaymentHistory shows list of payments (load ID, amount, status, date)
- Filter by status (pending, paid, failed)
- Settlement history shows payouts
- Expected output: Payment page displays list with filters

**Task 12:** Create Quick Pay Request Flow (3h)

- Files: `apps/web/app/(carrier)/carrier/quick-pay/page.tsx`, `apps/web/components/carrier/QuickPayForm.tsx`
- QuickPayForm: enter amount to request
- Show calculated fee (2% + $100 minimum)
- Checkbox to accept terms
- Submit POST to `/api/v1/carrier-portal/quick-pay/request`
- Show confirmation with tracking number
- Expected output: Quick pay flow works end-to-end

### Chunk 6: Dashboard, Wiring & Testing (2 tasks)

**Task 13:** Create Dashboard Page (2h)

- Files: `apps/web/app/(carrier)/carrier/dashboard/page.tsx`
- Show 3 KPI cards: Available Loads, Pending Payments, Active Drivers
- Quick links to Loads, Documents, Drivers pages
- Recent accepted loads summary
- Expected output: Dashboard displays summary data

**Task 14:** Verify Endpoints + Write Tests (6h)

- Verify all 50 Carrier Portal endpoints at runtime
- Test each endpoint with valid JWT
- Test guard coverage (CarrierPortalAuthGuard, CarrierScopeGuard)
- Document results in VERIFICATION-RESULTS.md
- Write 25+ guard tests: valid token, expired token, invalid token, multi-tenant scenarios
- Write 3+ integration tests: login → dashboard, load accept flow, driver assignment
- All tests passing
- Expected output: 50/50 endpoints verified, 28+ tests passing

---

## Exit Criteria

- [x] CarrierAuthGuard validates JWT correctly
- [x] CarrierScopeGuard isolates by carrierId
- [x] Login page functional, redirects to dashboard
- [x] Dashboard displays KPIs and quick links
- [x] Available loads list shows and filters correctly
- [x] Load detail modal works, accept/reject buttons functional
- [x] Document upload works (POD, insurance, W-9)
- [x] Driver CRUD works with inline editing
- [x] Payment history displays with filters
- [x] Quick pay request flow works (2% fee calc, $100 min)
- [x] Carrier profile editable
- [x] Compliance status visible with expiry warnings
- [x] All tests passing (28+)
- [x] No console errors
- [x] Build succeeds with 0 errors
- [x] TypeScript strict mode passing

---

## Context Notes

**Backend Status:** 50+ endpoints built and tested (auth, dashboard, loads, documents, invoices, users, compliance)

**Design Specs:** Similar to Customer Portal but with carrier-specific flows (load acceptance, quick pay, driver management)

**Auth:** Separate JWT from admin and customer portal (CARRIER_PORTAL_JWT_SECRET). Uses CarrierPortalAuthGuard + CarrierScopeGuard

**Integration:** Frontend calls `/api/v1/carrier-portal/*` endpoints (proxied by Next.js)

**Testing:** React Query + shadcn/ui pattern from Customer Portal, TDD approach
