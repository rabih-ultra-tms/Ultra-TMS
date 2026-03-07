# Service Hub: Customer Portal (13)

> **Priority:** P1 Post-MVP | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 7 controllers in customer-portal module |
| **Frontend** | Not Built — separate app or sub-route required |
| **Tests** | None |
| **Auth** | Separate JWT secret: `CUSTOMER_PORTAL_JWT_SECRET` |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Customer Portal definition in dev_docs |
| Backend Controller | Partial | 7 controllers in `apps/api/src/modules/customer-portal/` |
| Backend Service | Partial | Portal-specific data views |
| Prisma Models | Partial | Uses Customer + Order + Load + Invoice from main app |
| Frontend Pages | Not Built | Separate portal at `/portal/customer/` or subdomain |
| Hooks | Not Built | |
| Components | Not Built | |
| Tests | None | |
| Auth | Partial | Separate JWT secret configured in env |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Customer Portal Login | `/portal/customer/login` | Not Built | Separate auth, magic link |
| My Orders | `/portal/customer/orders` | Not Built | Customer sees only their orders |
| Order Detail | `/portal/customer/orders/[id]` | Not Built | Status, stops, documents |
| Track Shipment | `/portal/customer/track/[code]` | Not Built | Public tracking without login |
| My Invoices | `/portal/customer/invoices` | Not Built | Invoice list, PDF download |
| Invoice Detail | `/portal/customer/invoices/[id]` | Not Built | |
| Pay Invoice | `/portal/customer/invoices/[id]/pay` | Not Built | Payment integration |
| My Profile | `/portal/customer/profile` | Not Built | Contact info, preferences |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/portal/customer/auth/login` | Partial | Magic link or password login |
| GET | `/api/v1/portal/customer/orders` | Partial | My orders only |
| GET | `/api/v1/portal/customer/orders/:id` | Partial | Order detail + tracking |
| GET | `/api/v1/portal/customer/invoices` | Partial | My invoices |
| GET | `/api/v1/portal/customer/invoices/:id` | Partial | Invoice detail |
| GET | `/api/v1/portal/customer/track/:code` | Partial | Public tracking |
| GET | `/api/v1/portal/customer/profile` | Partial | Profile |
| PUT | `/api/v1/portal/customer/profile` | Partial | Update profile |

---

## 5. Business Rules

1. **Separate Auth:** Customer portal uses `CUSTOMER_PORTAL_JWT_SECRET` (different from main app). Customer logins are tracked separately from employee logins.
2. **Data Isolation:** Customer A can ONLY see Customer A's data. Backend filters all queries by `customerId` extracted from portal JWT — never trusts request body for customerId.
3. **Magic Link Login:** Default auth method for customers is magic link (email → one-click login). Password login is optional (configurable per tenant).
4. **Read-Only:** Customers can view orders, track shipments, download invoices, update their own profile. They CANNOT create orders, modify rates, or access other customers' data.
5. **Public Tracking:** `/portal/customer/track/[code]` is public (no auth required). The tracking code is a short hash of the load ID. Accessible via QR code on rate confirmation PDF.
6. **Invoice Payment:** If tenant configures a payment gateway (Stripe), customers can pay invoices directly. Payment is recorded as a Payment record in the main app.

---

## 6. Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| No frontend portal built | P0 | Deferred to P1 |
| Public tracking page not built | P1 | TMS-015 task |
| Payment gateway not integrated | P2 | Open |
| No tests | P0 | Open |

---

## 7. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| TMS-015 | Public Tracking Page (no auth) | L (8-12h) | P1 |
| CPORT-101 | Build Customer Portal shell + auth | L (8h) | P1 |
| CPORT-102 | Build My Orders + tracking views | L (8h) | P1 |
| CPORT-103 | Build My Invoices + payment | L (8h) | P2 |

---

## 8. Dependencies

**Depends on:** Auth (separate JWT), TMS Core (orders/loads), Accounting (invoices), Communication (magic link emails)
**Depended on by:** Customers (external users)
