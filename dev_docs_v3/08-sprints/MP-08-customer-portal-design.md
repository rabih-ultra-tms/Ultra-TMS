# MP-08: Customer Portal Design Doc

> **Date:** 2026-03-14
> **Sprint:** MP-08 (Weeks 15-16)
> **Scope:** Customer Portal Full Build — 7 tasks, 4-page MVP
> **Approach:** Linear (Verify → Build → Test)
> **Status:** Design Approved, Ready for Implementation

---

## 1. Overview

MP-08 builds a complete, functional Customer Portal for 4-page MVP release:

- **Login page** (`/portal/login`) — Authentication entry point
- **Dashboard** (`/portal/dashboard`) — Summary of shipments, invoices, alerts
- **Documents** (`/portal/documents`) — Access BOL, POD, other shipment docs
- **Invoices** (`/portal/invoices`) — View invoices, payment status, aging reports
- **Public Tracking** (`/portal/track/[code]`) — Public shipment tracking (no auth)

**Backend readiness:** 54 endpoints across 7 controllers (Auth, Dashboard, Users, Quotes, Invoices, Shipments, Payments) — all built, 63 tests passing.

**Frontend readiness:** 0 pages built, 0 components, 0 hooks — complete greenfield.

---

## 2. Architecture

### 2.1 Portal Auth

**Separate JWT from Admin:**

- Admin uses: `JWT_SECRET` (admin JwtAuthGuard)
- Portal uses: `PORTAL_JWT_SECRET` (PortalAuthGuard)
- Guard verifies with: `CUSTOMER_PORTAL_JWT_SECRET` (per PST-13 inconsistency bug)
- **Fix required:** Standardize to single secret per tribunal finding

**Token Storage:**

- Short-term: localStorage (XSS risk acknowledged in MP-01)
- Long-term: HttpOnly cookies (MP-01-021 in security hardening)
- For now: Use localStorage, note for later migration

### 2.2 Data Isolation

**CompanyScopeGuard** ensures:

- User can only access their own `companyId` data
- Dashboard filters by `companyId`
- Invoices, documents, shipments scoped to company
- Cross-tenant access returns 403

### 2.3 Frontend Structure

```
apps/web/app/(portal)/
├── portal/
│   ├── layout.tsx                 — Portal wrapper, auth provider
│   ├── login/page.tsx             — Public, no auth
│   ├── dashboard/page.tsx         — Protected, CompanyScopeGuard
│   ├── documents/page.tsx         — Protected, CompanyScopeGuard
│   ├── invoices/page.tsx          — Protected, CompanyScopeGuard
│   └── track/[code]/page.tsx      — Public tracking, no auth
├── lib/
│   ├── api/portal-client.ts       — HTTP client for /api/v1/portal/*
│   ├── hooks/
│   │   ├── usePortalAuth.ts       — Zustand for session + token
│   │   └── usePortalData.ts       — React Query for endpoints
│   └── store/
│       └── portal-auth.store.ts   — Zustand: user, token, companyId
└── components/portal/
    ├── LoginForm.tsx              — Email + password form
    ├── DashboardCards.tsx         — KPI cards, activity feed
    ├── DocumentTable.tsx          — List documents with download
    └── InvoiceList.tsx            — Invoices with detail modal
```

### 2.4 Authentication Flow

```
1. User navigates to /portal/login
2. LoginForm → POST /api/v1/portal/auth/login
3. Response: { data: { token, user, companyId } }
4. Store token + user in Zustand
5. Save token to localStorage
6. Redirect to /portal/dashboard
7. PortalAuthGuard validates token on every request
8. CompanyScopeGuard filters data by companyId
9. On logout: Clear Zustand + localStorage, redirect to /portal/login
```

---

## 3. Tasks Breakdown

### Task MP-08-001: Verify Endpoints (2h)

**Goal:** Confirm all 54 Customer Portal endpoints are working.

**Endpoints (by controller):**

- **PortalAuthController** (8): login, register, forgot-password, reset-password, verify-email, refresh, change-password, logout
- **PortalDashboardController** (4): dashboard, active-shipments, recent-activity, alerts
- **PortalUsersController** (6): profile GET/PUT, users GET/POST/PUT/DELETE
- **PortalQuotesController** (8): list, request, detail, accept, decline, revision, estimate, PDF
- **PortalInvoicesController** (5): list, detail, PDF, aging, statements
- **PortalShipmentsController** (6): list, detail, tracking, events, documents, contact
- **PortalPaymentsController** (3): make payment, history, detail

**Verification Checklist:**

- [ ] Start dev server: `pnpm dev` + `docker-compose up -d`
- [ ] Open Swagger: `localhost:3001/api-docs`
- [ ] For each endpoint:
  - [ ] Hit endpoint with valid test JWT
  - [ ] Verify response status (200 or expected)
  - [ ] Verify response schema matches DTO
  - [ ] Check PortalAuthGuard blocks unauth requests
  - [ ] Check CompanyScopeGuard blocks cross-tenant access
- [ ] Document failures in `VERIFICATION-RESULTS.md`
- [ ] Escalate any 404s or broken endpoints to backend

**Success Criteria:**

- ✅ 54/54 endpoints respond with expected status
- ✅ Guards working (auth + scope isolation)
- ✅ No phantom endpoints (all exist)

---

### Tasks MP-08-002–005: Build Pages (13h)

#### MP-08-002: Login Page (3h) — `/portal/login`

**Route:** `apps/web/app/(portal)/portal/login/page.tsx`

**Features:**

- Email + password form (or magic link, per design spec)
- "Forgot Password" link
- "Register" link
- Error handling (invalid credentials, network errors)
- Loading state during submission
- Redirect to dashboard on success
- Redirect to dashboard if already authenticated

**API Calls:**

- `POST /api/v1/portal/auth/login` — submit credentials

**Components:**

- `LoginForm.tsx` — form with email, password, submit button
- Error toast on failure

**Design Spec:** `dev_docs/12-Rabih-design-Process/12-customer-portal/01-portal-login.md`

---

#### MP-08-003: Dashboard (4h) — `/portal/dashboard`

**Route:** `apps/web/app/(portal)/portal/dashboard/page.tsx`

**Features:**

- Summary cards: Active Shipments, Pending Invoices, Recent Alerts
- Activity feed (recent orders, shipment updates, invoice notifications)
- Quick actions: New Shipment Request, View Invoices, Upload Documents
- Loading states + empty states

**API Calls:**

- `GET /api/v1/portal/dashboard` — summary data
- `GET /api/v1/portal/dashboard/active-shipments` — list active loads
- `GET /api/v1/portal/dashboard/recent-activity` — activity feed
- `GET /api/v1/portal/dashboard/alerts` — pending alerts

**Components:**

- `DashboardCards.tsx` — KPI cards (shipments, invoices, alerts)
- `ActivityFeed.tsx` — list of recent events
- `QuickActions.tsx` — buttons for common tasks

**Design Spec:** `dev_docs/12-Rabih-design-Process/12-customer-portal/01-portal-dashboard.md`

---

#### MP-08-004: Documents (3h) — `/portal/documents`

**Route:** `apps/web/app/(portal)/portal/documents/page.tsx`

**Features:**

- Table of documents (name, type, date, actions)
- Filter by type (BOL, POD, Invoice, etc.)
- Download button for each document
- Empty state if no documents

**API Calls:**

- `GET /api/v1/portal/shipments/:id/documents` — fetch documents for shipment

**Components:**

- `DocumentTable.tsx` — table with download buttons
- Document type badge/icon

**Design Spec:** `dev_docs/12-Rabih-design-Process/12-customer-portal/07-my-documents.md`

---

#### MP-08-005: Invoices (3h) — `/portal/invoices`

**Route:** `apps/web/app/(portal)/portal/invoices/page.tsx`

**Features:**

- Table of invoices (number, date, amount, status, actions)
- Filter by status (paid, unpaid, overdue)
- Click to view detail (modal or page)
- Download PDF for each invoice
- Aging summary (outstanding, paid, overdue totals)
- Empty state if no invoices

**API Calls:**

- `GET /api/v1/portal/invoices` — list invoices
- `GET /api/v1/portal/invoices/:id` — invoice detail
- `GET /api/v1/portal/invoices/:id/pdf` — download PDF
- `GET /api/v1/portal/invoices/aging/summary` — aging totals

**Components:**

- `InvoiceList.tsx` — table with filters
- `InvoiceDetail.tsx` — modal showing detail + download button
- `AgingSummary.tsx` — summary cards (outstanding, paid, overdue)

**Design Spec:** `dev_docs/12-Rabih-design-Process/12-customer-portal/06-my-invoices.md`

---

### Task MP-08-006: Wire Public Tracking (2h) — `/portal/track/[code]`

**Route:** `apps/web/app/(portal)/portal/track/[code]/page.tsx`

**Features:**

- Public page (no auth required, no PortalAuthGuard)
- Accept tracking code as URL param
- Fetch shipment status, current location, ETA, delivery timeline
- Show status badge (in-transit, delivered, etc.)
- Show timeline of events (picked up, in transit, delivered)
- Error handling if shipment not found

**API Call:**

- `GET /api/v1/portal/shipments/{code}/tracking` or similar (may need backend creation per PST-13 CPORT-017)

**Components:**

- `TrackingDetail.tsx` — status, location, ETA, timeline

**Design Spec:** `dev_docs/12-Rabih-design-Process/12-customer-portal/08-track-shipment.md`

---

### Task MP-08-007: Auth + Guard Tests (3h)

**Test File:** `apps/api/src/modules/customer-portal/portal-auth.guard.spec.ts`

**Test Scenarios:**

1. **PortalAuthGuard Tests (4 tests, ~20 LOC each)**
   - ✅ Valid JWT token → allows request
   - ✅ Expired token → 401 Unauthorized
   - ✅ No token (missing header) → 401 Unauthorized
   - ✅ Malformed/invalid token → 401 Unauthorized

2. **CompanyScopeGuard Tests (3 tests, ~20 LOC each)**
   - ✅ User requests own company data → 200 OK
   - ✅ User requests other company data → 403 Forbidden
   - ✅ Guard correctly extracts `companyId` from token

3. **Integration Tests (2 tests, ~30 LOC each)**
   - ✅ Login → get token → dashboard access → 200
   - ✅ Token refresh → new token valid → 200
   - ✅ Cross-company access attempt → 403

**Tools:** Jest + Supertest (existing setup)

**Target:** 20% test coverage of portal auth flow

---

## 4. Data Flows

### 4.1 Login Flow

```
1. User @ /portal/login
2. Enter email + password
3. LoginForm.tsx → POST /api/v1/portal/auth/login
4. Backend: PortalAuthController validates credentials
5. Response: {
     data: {
       token: "eyJ...",
       user: { id, email, name, companyId },
       companyId: "uuid"
     }
   }
6. Frontend: usePortalAuth() stores in Zustand
7. localStorage.setItem('portalToken', token)
8. Redirect to /portal/dashboard
9. PortalAuthGuard validates on entry
```

### 4.2 Protected Page Flow

```
1. User @ /portal/dashboard
2. Page mounts, calls usePortalAuth() → gets token from Zustand
3. PortalAuthGuard middleware checks token in headers
4. If invalid → redirect to /portal/login
5. If valid → CompanyScopeGuard checks companyId
6. Page calls: GET /api/v1/portal/dashboard (with Authorization header)
7. Backend PortalDashboardController.dashboard() filtered by companyId
8. Response: { data: { activeShipments, pendingInvoices, alerts, recentActivity } }
9. usePortalData (React Query) caches response
10. Page renders data
```

### 4.3 Public Tracking Flow

```
1. User @ /portal/track/abc123 (no auth required)
2. Page extracts code from URL: [code] = "abc123"
3. Page calls: GET /api/v1/portal/shipments/abc123/tracking
4. Backend: PortalShipmentsController.tracking(code) finds shipment
5. No guard check (public endpoint)
6. Response: { data: { status, currentLocation, eta, events: [] } }
7. Page renders tracking timeline
8. User sees shipment progress without logging in
```

---

## 5. Exit Criteria

All items must be complete to ship:

- [ ] **MP-08-001:** All 54 endpoints verified + documented in VERIFICATION-RESULTS.md
- [ ] **MP-08-002:** Login page functional, redirects to dashboard on success
- [ ] **MP-08-003:** Dashboard page displays summary, active shipments, activity feed
- [ ] **MP-08-004:** Documents page shows list, filters, download works
- [ ] **MP-08-005:** Invoices page shows list, detail modal, PDF download, aging summary
- [ ] **MP-08-006:** Public tracking page works without auth
- [ ] **MP-08-007:** Auth + CompanyScopeGuard tests passing (9+ tests, 20% coverage)
- [ ] **Code Quality:** No console errors, all interactive elements work, TypeScript strict mode passing
- [ ] **Testing:** `pnpm test` passes, no failed tests
- [ ] **Build:** `pnpm build` succeeds with zero errors
- [ ] **Work Log:** Session documented in weekly report

---

## 6. Dependencies & Risks

### Dependencies

- Backend: All 54 endpoints must be verified working
- Design specs: Need to reference all 10 design files for UI details
- Auth: Zustand + React Query patterns must align with existing codebase

### Risks

- JWT secret inconsistency (PORTAL_JWT_SECRET vs CUSTOMER_PORTAL_JWT_SECRET) — may need band-aid fix for MP-08
- Public tracking endpoint may not exist (CPORT-017 phantom) — backend creation may be needed
- Design specs may conflict with actual API responses — verify during build

### Mitigations

- MP-08-001 (verification) catches these issues upfront
- Linear approach allows early course correction
- Backend already has 63 tests passing — high confidence

---

## 7. Success Metrics

| Metric                        | Target                                 | Pass/Fail |
| ----------------------------- | -------------------------------------- | --------- |
| All 54 endpoints verified     | 54/54                                  | ✅ Pass   |
| Pages built                   | 4/4 (login, dashboard, docs, invoices) | ✅ Pass   |
| Public tracking working       | ✅ works without auth                  | ✅ Pass   |
| Auth tests passing            | 9+ tests                               | ✅ Pass   |
| Zero console errors           | 0 errors                               | ✅ Pass   |
| All interactive elements work | 100% buttons, forms, links functional  | ✅ Pass   |
| Build succeeds                | `pnpm build` → 0 errors                | ✅ Pass   |
| Tests pass                    | `pnpm test` → all pass                 | ✅ Pass   |

---

## 8. Implementation Sequence

1. **Setup (1h):**
   - Create portal auth context + Zustand store
   - Create portal HTTP client (`portal-client.ts`)
   - Create `usePortalAuth` + `usePortalData` hooks
   - Create portal layout wrapper

2. **Verify (2h):** MP-08-001
   - Test all 54 endpoints
   - Document results

3. **Build (13h):** MP-08-002–005
   - Login page (3h)
   - Dashboard page (4h)
   - Documents page (3h)
   - Invoices page (3h)
   - Public tracking page (2h, overlapped)

4. **Test (3h):** MP-08-007
   - Write auth guard tests
   - Write integration tests

5. **Polish (2h):**
   - Fix any console errors
   - Verify all buttons/forms work
   - Test on mobile (responsive)

**Total: ~20 hours**

---

## Sign-Off

- **Design:** Approved 2026-03-14
- **Approach:** Linear (Verify → Build → Test)
- **Ready for:** Implementation Planning (writing-plans skill)
