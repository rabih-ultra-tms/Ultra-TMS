# Service Hub: Customer Portal (13)

> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Customer Portal service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/12-customer-portal/` (10 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/13-customer-portal.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2.5/10) |
| **Confidence** | High -- re-audited 2026-03-07, controllers verified |
| **Last Verified** | 2026-03-07 |
| **Backend** | Substantial -- 40 endpoints across 7 controllers, 8 portal-specific Prisma models, 6 enums |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | None |
| **Auth** | Separate JWT secret: `CUSTOMER_PORTAL_JWT_SECRET` |
| **Active Blockers** | Entire frontend portal must be built from scratch |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Customer Portal definition in dev_docs |
| Design Specs | Done | 10 files in `dev_docs/12-Rabih-design-Process/12-customer-portal/` |
| Backend -- Auth | Built | `PortalAuthController` -- 8 endpoints (login, register, forgot/reset password, verify email, refresh, change-password, logout) |
| Backend -- Dashboard | Built | `PortalDashboardController` -- 4 endpoints (overview, active shipments, recent activity, alerts) |
| Backend -- Users | Built | `PortalUsersController` -- 6 endpoints (profile + user management) |
| Backend -- Quotes | Built | `PortalQuotesController` -- 8 endpoints (request, accept/decline, revision, estimate) |
| Backend -- Invoices | Built | `PortalInvoicesController` -- 5 endpoints (list, detail, PDF, aging, statements) |
| Backend -- Shipments | Built | `PortalShipmentsController` -- 6 endpoints (list, detail, tracking, events, documents, contact) |
| Backend -- Payments | Built | `PortalPaymentsController` -- 3 endpoints (make payment, history, detail) |
| Prisma Models | Built | 8 portal-specific: PortalUser, PortalSession, PortalPayment, PortalSavedPaymentMethod, PortalActivityLog, PortalNotification, PortalBranding, QuoteRequest + shared (Company, Load, Invoice, Quote) |
| Frontend Pages | Not Built | No portal routes exist anywhere in `apps/web/` |
| React Hooks | Not Built | No portal-specific hooks |
| Components | Not Built | No portal-specific components |
| Tests | None | 0 backend, 0 frontend |
| Security | Built | Separate JWT (`PORTAL_JWT_SECRET`), PortalAuthGuard + CompanyScopeGuard for data isolation via companyId |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Portal Login | `/portal/login` | Not Built | -- | Separate auth flow, magic link default |
| Portal Register | `/portal/register` | Not Built | -- | Customer self-registration |
| Portal Dashboard | `/portal/dashboard` | Not Built | -- | Design: `01-portal-dashboard.md` |
| My Shipments | `/portal/shipments` | Not Built | -- | Design: `02-my-shipments.md` |
| Shipment Detail | `/portal/shipments/[id]` | Not Built | -- | Design: `03-shipment-detail.md` |
| New Shipment Request | `/portal/shipments/new` | Not Built | -- | Design: `04-new-shipment-request.md` |
| My Quotes | `/portal/quotes` | Not Built | -- | Design: `05-my-quotes.md` |
| My Invoices | `/portal/invoices` | Not Built | -- | Design: `06-my-invoices.md` |
| My Documents | `/portal/documents` | Not Built | -- | Design: `07-my-documents.md` |
| Track Shipment | `/portal/track/[code]` | Not Built | -- | Design: `08-track-shipment.md` -- public, no auth |
| Portal Settings | `/portal/settings` | Not Built | -- | Design: `09-portal-settings.md` |
| Support Chat | `/portal/support` | Not Built | -- | Design: `10-support-chat.md` |

---

## 4. API Endpoints

### PortalAuthController -- `@Controller('portal/auth')` -- 8 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/portal/auth/login` | Partial | Magic link or password login |
| POST | `/api/v1/portal/auth/register` | Partial | Customer self-registration |
| POST | `/api/v1/portal/auth/forgot-password` | Partial | Send password reset email |
| POST | `/api/v1/portal/auth/reset-password` | Partial | Reset with token |
| POST | `/api/v1/portal/auth/verify-email` | Partial | Email verification flow |
| POST | `/api/v1/portal/auth/refresh` | Partial | Refresh JWT token |
| GET | `/api/v1/portal/auth/me` | Partial | Current user profile |
| POST | `/api/v1/portal/auth/logout` | Partial | Invalidate session |

### PortalDashboardController -- `@Controller('portal/dashboard')` -- 4 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/dashboard` | Partial | Dashboard summary (active shipments, pending invoices, recent activity) |
| GET | `/api/v1/portal/dashboard/stats` | Partial | Aggregate statistics |
| GET | `/api/v1/portal/dashboard/recent-activity` | Partial | Activity feed |
| GET | `/api/v1/portal/dashboard/notifications` | Partial | Portal notifications |

### PortalUsersController -- `@Controller('portal')` -- 6 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/users` | Partial | List users for this customer account |
| POST | `/api/v1/portal/users` | Partial | Invite a new portal user |
| GET | `/api/v1/portal/users/:id` | Partial | User detail |
| PUT | `/api/v1/portal/users/:id` | Partial | Update user |
| DELETE | `/api/v1/portal/users/:id` | Partial | Remove user |
| PUT | `/api/v1/portal/profile` | Partial | Update own profile |

### PortalQuotesController -- `@Controller('portal/quotes')` -- 8 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/quotes` | Partial | List customer's quotes |
| POST | `/api/v1/portal/quotes` | Partial | Request a new quote |
| GET | `/api/v1/portal/quotes/:id` | Partial | Quote detail |
| PUT | `/api/v1/portal/quotes/:id` | Partial | Update quote request (if still draft) |
| DELETE | `/api/v1/portal/quotes/:id` | Partial | Cancel quote request |
| POST | `/api/v1/portal/quotes/:id/accept` | Partial | Accept a quote |
| POST | `/api/v1/portal/quotes/:id/reject` | Partial | Reject a quote |
| GET | `/api/v1/portal/quotes/:id/documents` | Partial | Quote documents |

### PortalInvoicesController -- `@Controller('portal/invoices')` -- 5 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/invoices` | Partial | List customer's invoices |
| GET | `/api/v1/portal/invoices/:id` | Partial | Invoice detail |
| GET | `/api/v1/portal/invoices/:id/pdf` | Partial | Download invoice PDF |
| GET | `/api/v1/portal/invoices/summary` | Partial | Billing summary (outstanding, paid, overdue) |
| POST | `/api/v1/portal/invoices/:id/dispute` | Partial | Dispute an invoice |

### PortalShipmentsController -- `@Controller('portal/shipments')` -- 6 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/shipments` | Partial | List customer's shipments |
| GET | `/api/v1/portal/shipments/:id` | Partial | Shipment detail + tracking |
| GET | `/api/v1/portal/shipments/:id/tracking` | Partial | Real-time tracking data |
| GET | `/api/v1/portal/shipments/:id/documents` | Partial | Shipment documents (BOL, POD) |
| GET | `/api/v1/portal/shipments/:id/updates` | Partial | Status update history |
| GET | `/api/v1/portal/track/:code` | Partial | Public tracking (no auth required) |

### PortalPaymentsController -- `@Controller('portal/payments')` -- 3 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/portal/payments` | Partial | Initiate payment for invoice |
| GET | `/api/v1/portal/payments/:id` | Partial | Payment status/receipt |
| GET | `/api/v1/portal/payments/history` | Partial | Payment history |

**Total: 40 endpoints across 7 controllers**

---

## 5. Components

No portal-specific components exist.

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| PortalLayout | `components/portal/portal-layout.tsx` | Not Built | Shell with sidebar, customer branding |
| PortalLoginForm | `components/portal/portal-login-form.tsx` | Not Built | Magic link + password login |
| ShipmentCard | `components/portal/shipment-card.tsx` | Not Built | Shipment summary card |
| ShipmentTimeline | `components/portal/shipment-timeline.tsx` | Not Built | Status update timeline |
| TrackingMap | `components/portal/tracking-map.tsx` | Not Built | Google Maps tracking view |
| InvoiceTable | `components/portal/invoice-table.tsx` | Not Built | Invoice list with status badges |
| PaymentForm | `components/portal/payment-form.tsx` | Not Built | Stripe payment integration |
| QuoteRequestForm | `components/portal/quote-request-form.tsx` | Not Built | Multi-step quote request |
| PortalDashboardWidgets | `components/portal/dashboard-widgets.tsx` | Not Built | Summary cards, activity feed |
| DocumentViewer | `components/portal/document-viewer.tsx` | Not Built | BOL/POD viewer + download |

---

## 6. Hooks

No portal-specific hooks exist.

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `usePortalAuth` | `/portal/auth/*` | N/A | Not Built -- login, register, logout, refresh |
| `usePortalDashboard` | `/portal/dashboard` | N/A | Not Built |
| `usePortalShipments` | `/portal/shipments` | N/A | Not Built -- paginated list |
| `usePortalShipment` | `/portal/shipments/:id` | N/A | Not Built -- single detail |
| `usePortalQuotes` | `/portal/quotes` | N/A | Not Built |
| `usePortalInvoices` | `/portal/invoices` | N/A | Not Built |
| `usePortalPayments` | `/portal/payments` | N/A | Not Built |
| `usePublicTracking` | `/portal/track/:code` | N/A | Not Built -- no auth |

---

## 7. Business Rules

1. **Separate Auth:** Customer portal uses `CUSTOMER_PORTAL_JWT_SECRET` (different from main app). Customer logins are tracked separately from employee logins. The portal JWT contains `customerId` and `tenantId`.
2. **Data Isolation:** Customer A can ONLY see Customer A's data. Backend filters ALL queries by `customerId` extracted from the portal JWT -- never trusts request body for customerId. This is enforced at the service layer, not just the controller.
3. **Magic Link Login:** Default auth method for customers is magic link (email -> one-click login). Password login is optional (configurable per tenant). Registration requires email verification.
4. **Read-Only (Mostly):** Customers can view shipments, track loads, download invoices, and view documents. They CAN request quotes and update their own profile/settings. They CANNOT create orders directly, modify rates, or access other customers' data.
5. **Public Tracking:** `/portal/track/[code]` is public (no auth required). The tracking code is a short hash of the load ID. Accessible via QR code on rate confirmation PDF. Returns sanitized data (no financial info).
6. **Invoice Payment:** If tenant configures a payment gateway (Stripe), customers can pay invoices directly via `POST /portal/payments`. Payment is recorded as a Payment record in the main app and the invoice status updates automatically.
7. **Quote Request Flow:** Customers can request quotes via the portal. Quote lifecycle: DRAFT -> SUBMITTED -> QUOTED -> ACCEPTED/REJECTED/EXPIRED. Customers can accept or reject quotes. Accepted quotes auto-create orders in the main app.
8. **Multi-User Accounts:** A customer account can have multiple portal users (managed via PortalUsersController). Account admins can invite, update, and remove users.
9. **Session Management:** Portal sessions use separate refresh tokens. Logout invalidates the session. Tokens have shorter TTL than main app tokens for security.

---

## 8. Data Model

The customer portal shares models with the main app. No portal-specific Prisma models exist.

### Shared Models Used

```
Customer {
  id              String (UUID)
  name            String
  email           String
  phone           String?
  address         Json?
  status          CustomerStatus
  tenantId        String
  orders          Order[]
  invoices        Invoice[]
  quotes          Quote[]
  createdAt       DateTime
  updatedAt       DateTime
}
```

### Portal-Specific Data (Future)

```
PortalUser {
  -- Does not exist yet in Prisma schema
  -- Will need: id, customerId, email, passwordHash?, role (ADMIN/USER),
  -- lastLoginAt, magicLinkToken?, emailVerified
}

PortalSession {
  -- Does not exist yet
  -- Will need: id, portalUserId, refreshToken, expiresAt, ipAddress
}
```

**Note:** The backend controllers exist but may rely on the main `User` model or in-memory auth. A dedicated `PortalUser` model will likely be needed for production.

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `email` (login) | IsEmail, required | "Valid email is required" |
| `password` (if password login) | MinLength(8), has uppercase + number | "Password must be at least 8 characters with uppercase and number" |
| `trackingCode` (public) | IsString, length 8-12 | "Invalid tracking code" |
| Quote request `origin` | Required, valid address | "Origin address is required" |
| Quote request `destination` | Required, valid address | "Destination address is required" |
| Quote request `pickupDate` | IsFuture date | "Pickup date must be in the future" |
| Invoice dispute `reason` | Required, MinLength(10) | "Please provide a detailed reason for the dispute" |
| Payment `amount` | Must match invoice balance | "Payment amount must match outstanding balance" |
| Registration `email` | IsEmail, unique per tenant | "Email already registered" |

---

## 10. Status States

### Portal User Status
```
INVITED -> ACTIVE (email verified)
ACTIVE -> SUSPENDED (admin action)
SUSPENDED -> ACTIVE (admin reactivation)
ACTIVE -> DEACTIVATED (admin removes user)
```

### Quote Request Status (Portal View)
```
DRAFT -> SUBMITTED (customer submits request)
SUBMITTED -> QUOTED (TMS staff provides quote)
QUOTED -> ACCEPTED (customer accepts)
QUOTED -> REJECTED (customer rejects)
QUOTED -> EXPIRED (auto after 30 days)
ACCEPTED -> ORDER_CREATED (auto-creates order in main app)
```

### Invoice Status (Portal View -- Read Only)
```
PENDING -> SENT (visible to customer)
SENT -> PAID (after successful payment)
SENT -> OVERDUE (past due date)
SENT -> DISPUTED (customer opens dispute)
DISPUTED -> RESOLVED (staff resolves)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No frontend portal exists at all | P0 | -- | Deferred to P1 |
| No portal-specific Prisma models (PortalUser, PortalSession) | P0 | `schema.prisma` | Open |
| 40 backend endpoints untested | P0 | `apps/api/src/modules/customer-portal/` | Open |
| Public tracking page not built | P1 | -- | Open |
| Payment gateway (Stripe) not integrated | P2 | -- | Open |
| Magic link email sending not verified | P1 | -- | Needs verification |
| No rate limiting on portal auth endpoints | P1 | -- | Open |
| Portal JWT secret may not be set in all environments | P1 | `.env` | Needs verification |

---

## 12. Tasks

### P1 -- Portal Foundation
| Task ID | Title | Effort | Priority | Status |
|---------|-------|--------|----------|--------|
| CPORT-001 | Create PortalUser + PortalSession Prisma models + migration | M (4h) | P0 | Open |
| CPORT-002 | Build portal shell layout (sidebar, branding, auth wrapper) | M (4h) | P0 | Open |
| CPORT-003 | Build portal login/register pages (magic link + password) | M (5h) | P0 | Open |
| CPORT-004 | Build portal dashboard page | M (4h) | P1 | Open |
| CPORT-005 | Build My Shipments list + detail pages | L (8h) | P1 | Open |
| CPORT-006 | Build public tracking page (no auth) | M (5h) | P1 | Open |

### P1 -- Portal Features
| Task ID | Title | Effort | Priority | Status |
|---------|-------|--------|----------|--------|
| CPORT-007 | Build My Quotes page + quote request form | L (8h) | P1 | Open |
| CPORT-008 | Build My Invoices page + PDF download | M (5h) | P1 | Open |
| CPORT-009 | Build My Documents page | M (4h) | P2 | Open |
| CPORT-010 | Build portal settings page | S (3h) | P2 | Open |

### P2 -- Portal Advanced
| Task ID | Title | Effort | Priority | Status |
|---------|-------|--------|----------|--------|
| CPORT-011 | Stripe payment integration for invoices | L (8h) | P2 | Open |
| CPORT-012 | Build support chat page | L (8h) | P2 | Open |
| CPORT-013 | Add rate limiting to portal auth endpoints | S (2h) | P1 | Open |
| CPORT-014 | Write backend tests for all 7 portal controllers | L (10h) | P1 | Open |
| CPORT-015 | Write frontend tests for portal pages | L (8h) | P2 | Open |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Portal Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/01-portal-dashboard.md` |
| My Shipments | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/02-my-shipments.md` |
| Shipment Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/03-shipment-detail.md` |
| New Shipment Request | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/04-new-shipment-request.md` |
| My Quotes | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/05-my-quotes.md` |
| My Invoices | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/06-my-invoices.md` |
| My Documents | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/07-my-documents.md` |
| Track Shipment | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/08-track-shipment.md` |
| Portal Settings | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/09-portal-settings.md` |
| Support Chat | Full 15-section | `dev_docs/12-Rabih-design-Process/12-customer-portal/10-support-chat.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| 8 endpoints (basic CRUD + tracking) | 40 endpoints across 7 controllers | Backend far exceeds plan |
| Simple login only | Full auth flow: register, forgot-password, verify-email, refresh, logout | More complete than planned |
| No quote management | 8 quote endpoints (request, accept, reject) | Added feature |
| No payment processing | 3 payment endpoints | Added feature |
| No user management | 6 user management endpoints | Added feature |
| Portal frontend as P1 deliverable | 0 pages, 0 components, 0 hooks built | Frontend completely missing |
| Basic tracking page | Public tracking endpoint exists, no frontend | Backend only |
| 10 design specs created | All 10 specs exist | Design complete |

**Summary:** The backend is significantly more capable than originally planned (40 endpoints vs 8), but the frontend gap is total -- not a single portal page, component, or hook exists. The health score of D (2.5/10) reflects this: strong backend foundation with zero user-facing implementation.

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (separate JWT infrastructure via `CUSTOMER_PORTAL_JWT_SECRET`)
- TMS Core (orders, loads, shipments -- portal reads this data)
- Sales & Quotes (quote lifecycle -- portal can request and accept quotes)
- Accounting (invoices, payments -- portal displays and enables payment)
- Communication (magic link emails, notification emails, support chat)
- Storage (document uploads and downloads)
- Google Maps API (tracking map on shipment detail and public tracking)
- Stripe (payment gateway for invoice payment -- optional, tenant-configured)

**Depended on by:**
- Customers (external end-users -- the primary consumer of this portal)
- CRM (customer engagement data flows back to CRM)
- Sales & Quotes (quote requests originate from portal)
- Accounting (payments initiated from portal update invoice status)
