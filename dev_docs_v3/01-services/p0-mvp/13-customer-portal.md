# Service Hub: Customer Portal (13)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-13 tribunal)
> **Original definition:** `dev_docs/02-services/` (Customer Portal service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/12-customer-portal/` (10 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/13-customer-portal.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-13-customer-portal.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | C (5.5/10) |
| **Confidence** | High — code-verified via PST-13 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Substantial — 40 endpoints across 7 controllers, 8 portal-specific Prisma models, 5 enums |
| **Frontend** | Not Built — no pages, no components, no hooks |
| **Tests** | 63 tests across 9 spec files (all passing) |
| **Auth** | Separate JWT: module signs with `PORTAL_JWT_SECRET` (fallback `JWT_SECRET`), guard verifies with `CUSTOMER_PORTAL_JWT_SECRET` — **inconsistency bug, see Known Issues** |
| **Active Blockers** | Entire frontend portal must be built from scratch; JWT secret inconsistency must be resolved |

### P0-Basic Scope (Tribunal Verdict)

> Per TRIBUNAL-02 verdict (2026-03-07): Customer Portal promoted to P0 as a table-stakes feature.
> MVP scope is limited to 4 pages using existing 40 backend endpoints.

| Screen | Route | Priority | Status |
|--------|-------|----------|--------|
| Customer Login | `/portal/login` | P0 | Not Built |
| Customer Dashboard | `/portal/dashboard` | P0 | Not Built |
| Shipment Tracking | `/portal/tracking` | P0 | Not Built — backend endpoint also missing (phantom) |
| Document Access | `/portal/documents` | P0 | Not Built |

All other Customer Portal screens (communication, invoices, claims) remain P1 scope.

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Customer Portal definition in dev_docs |
| Design Specs | Done | 10 files in `dev_docs/12-Rabih-design-Process/12-customer-portal/` |
| Backend — Auth | Built | `PortalAuthController` — 8 endpoints (login, register, forgot/reset password, verify-email, refresh, change-password, logout) |
| Backend — Dashboard | Built | `PortalDashboardController` — 4 endpoints (overview, active-shipments, recent-activity, alerts) |
| Backend — Users | Built | `PortalUsersController` — 6 endpoints (profile GET/PUT + user CRUD) |
| Backend — Quotes | Built | `PortalQuotesController` — 8 endpoints (request, accept/decline, revision, estimate, pdf) |
| Backend — Invoices | Built | `PortalInvoicesController` — 5 endpoints (list, detail, PDF, aging/summary, statements) |
| Backend — Shipments | Built | `PortalShipmentsController` — 6 endpoints (list, detail, tracking, events, documents, contact) |
| Backend — Payments | Built | `PortalPaymentsController` — 3 endpoints (make payment, history, detail) |
| Prisma Models | Built | 8 portal-specific: PortalUser (23 fields), PortalSession (12), PortalPayment (17), PortalSavedPaymentMethod (17), PortalActivityLog (13), PortalNotification (14), PortalBranding (15), QuoteRequest (27) + shared (Company, Load, Invoice, Quote) |
| Frontend Pages | Not Built | No portal routes exist anywhere in `apps/web/` |
| React Hooks | Not Built | No portal-specific hooks |
| Components | Not Built | No portal-specific components |
| Tests | 63 tests / 9 spec files | Covers all 7 services + 2 guards — 3rd highest test count of any P0 service |
| Security | Built | PortalAuthGuard + CompanyScopeGuard for data isolation via companyId; @Throttle on login (5 req / 60s) |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Portal Login | `/portal/login` | Not Built | — | Separate auth flow, magic link default |
| Portal Register | `/portal/register` | Not Built | — | Customer self-registration |
| Portal Dashboard | `/portal/dashboard` | Not Built | — | Design: `01-portal-dashboard.md` |
| My Shipments | `/portal/shipments` | Not Built | — | Design: `02-my-shipments.md` |
| Shipment Detail | `/portal/shipments/[id]` | Not Built | — | Design: `03-shipment-detail.md` |
| New Shipment Request | `/portal/shipments/new` | Not Built | — | Design: `04-new-shipment-request.md` |
| My Quotes | `/portal/quotes` | Not Built | — | Design: `05-my-quotes.md` |
| My Invoices | `/portal/invoices` | Not Built | — | Design: `06-my-invoices.md` |
| My Documents | `/portal/documents` | Not Built | — | Design: `07-my-documents.md` |
| Track Shipment | `/portal/track/[code]` | Not Built | — | Design: `08-track-shipment.md` — public, no auth. **Backend endpoint also missing (CPORT-017)** |
| Portal Settings | `/portal/settings` | Not Built | — | Design: `09-portal-settings.md` |
| Support Chat | `/portal/support` | Not Built | — | Design: `10-support-chat.md` |

---

## 4. API Endpoints

### PortalAuthController — `@Controller('portal/auth')` — 8 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/portal/auth/login` | Built | Magic link or password login. @Throttle (5 req / 60s) |
| POST | `/api/v1/portal/auth/register` | Built | Customer self-registration. Public. |
| POST | `/api/v1/portal/auth/forgot-password` | Built | Send password reset email. Public. |
| POST | `/api/v1/portal/auth/reset-password` | Built | Reset with token. Public. |
| GET | `/api/v1/portal/auth/verify-email/:token` | Built | Email verification — **GET not POST** |
| POST | `/api/v1/portal/auth/refresh` | Built | Refresh JWT token (validates internally) |
| POST | `/api/v1/portal/auth/change-password` | Built | Change password. PortalAuthGuard. |
| POST | `/api/v1/portal/auth/logout` | Built | Invalidate session. PortalAuthGuard. |

### PortalDashboardController — `@Controller('portal/dashboard')` — 4 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/dashboard` | Built | Dashboard summary (active shipments, pending invoices, recent activity). PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/dashboard/active-shipments` | Built | Active shipments list. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/dashboard/recent-activity` | Built | Activity feed. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/dashboard/alerts` | Built | Portal alerts (overdue invoices, delayed shipments). PortalAuthGuard + CompanyScopeGuard. |

### PortalUsersController — `@Controller('portal')` — 6 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/profile` | Built | Get own profile. PortalAuthGuard + CompanyScopeGuard. |
| PUT | `/api/v1/portal/profile` | Built | Update own profile. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/users` | Built | List users for this customer account. PortalAuthGuard + CompanyScopeGuard. |
| POST | `/api/v1/portal/users` | Built | Invite a new portal user. PortalAuthGuard + CompanyScopeGuard. |
| PUT | `/api/v1/portal/users/:id` | Built | Update user. PortalAuthGuard + CompanyScopeGuard. |
| DELETE | `/api/v1/portal/users/:id` | Built | Remove user. PortalAuthGuard + CompanyScopeGuard. |

### PortalQuotesController — `@Controller('portal/quotes')` — 8 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/quotes` | Built | List customer's quotes. PortalAuthGuard + CompanyScopeGuard. |
| POST | `/api/v1/portal/quotes/request` | Built | Request a new quote. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/quotes/:id` | Built | Quote detail. PortalAuthGuard + CompanyScopeGuard. |
| POST | `/api/v1/portal/quotes/:id/accept` | Built | Accept a quote. PortalAuthGuard + CompanyScopeGuard. |
| POST | `/api/v1/portal/quotes/:id/decline` | Built | Decline a quote (**not** `/reject`). PortalAuthGuard + CompanyScopeGuard. |
| POST | `/api/v1/portal/quotes/:id/revision` | Built | Request quote revision. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/quotes/:id/pdf` | Built | Download quote PDF. PortalAuthGuard + CompanyScopeGuard. |
| POST | `/api/v1/portal/quotes/estimate` | Built | Get quick estimate. PortalAuthGuard + CompanyScopeGuard. |

### PortalInvoicesController — `@Controller('portal/invoices')` — 5 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/invoices` | Built | List customer's invoices. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/invoices/:id` | Built | Invoice detail. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/invoices/:id/pdf` | Built | Download invoice PDF. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/invoices/aging/summary` | Built | Billing summary — aging report (outstanding, paid, overdue). PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/invoices/statements/:month` | Built | Monthly statement. PortalAuthGuard + CompanyScopeGuard. |

### PortalShipmentsController — `@Controller('portal/shipments')` — 6 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/portal/shipments` | Built | List customer's shipments. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/shipments/:id` | Built | Shipment detail. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/shipments/:id/tracking` | Built | Real-time tracking data. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/shipments/:id/events` | Built | Status event history (**not** `/updates`). PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/shipments/:id/documents` | Built | Shipment documents (BOL, POD). PortalAuthGuard + CompanyScopeGuard. |
| POST | `/api/v1/portal/shipments/:id/contact` | Built | Contact about shipment. PortalAuthGuard + CompanyScopeGuard. |

### PortalPaymentsController — `@Controller('portal/payments')` — 3 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/portal/payments` | Built | Initiate payment for invoice. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/payments` | Built | Payment history. PortalAuthGuard + CompanyScopeGuard. |
| GET | `/api/v1/portal/payments/:id` | Built | Payment status/receipt. PortalAuthGuard + CompanyScopeGuard. |

**Total: 40 endpoints across 7 controllers. Guard coverage: 100% (5 public auth endpoints correctly unguarded, 35 endpoints with PortalAuthGuard + CompanyScopeGuard).**

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
| `usePortalAuth` | `/portal/auth/*` | N/A | Not Built — login, register, logout, refresh |
| `usePortalDashboard` | `/portal/dashboard` | N/A | Not Built |
| `usePortalShipments` | `/portal/shipments` | N/A | Not Built — paginated list |
| `usePortalShipment` | `/portal/shipments/:id` | N/A | Not Built — single detail |
| `usePortalQuotes` | `/portal/quotes` | N/A | Not Built |
| `usePortalInvoices` | `/portal/invoices` | N/A | Not Built |
| `usePortalPayments` | `/portal/payments` | N/A | Not Built |
| `usePublicTracking` | `/portal/track/:code` | N/A | Not Built — no auth. **Backend endpoint also doesn't exist yet (CPORT-017)** |

---

## 7. Business Rules

1. **Separate Auth:** Customer portal module registers JWT with `PORTAL_JWT_SECRET || JWT_SECRET`. Guard verifies with `CUSTOMER_PORTAL_JWT_SECRET`. **These must be aligned — see CPORT-016.** Customer logins are tracked separately from employee logins. The portal JWT contains `customerId` and `tenantId`.
2. **Data Isolation:** Customer A can ONLY see Customer A's data. Backend filters ALL queries by `companyId` extracted from the portal JWT via CompanyScopeGuard — never trusts request body for companyId. This is enforced at the guard level on all non-auth endpoints.
3. **Magic Link Login:** Default auth method for customers is magic link (email -> one-click login). Password login is optional (configurable per tenant). Registration requires email verification.
4. **Read-Only (Mostly):** Customers can view shipments, track loads, download invoices, and view documents. They CAN request quotes, request revisions, get estimates, and update their own profile/settings. They CANNOT create orders directly, modify rates, or access other customers' data.
5. **Public Tracking:** `/portal/track/[code]` is designed as public (no auth required). **Backend endpoint does not exist yet — documented as phantom (CPORT-017).** The tracking code is a short hash of the load ID. Accessible via QR code on rate confirmation PDF. Returns sanitized data (no financial info).
6. **Invoice Payment:** If tenant configures a payment gateway (Stripe), customers can pay invoices directly via `POST /portal/payments`. Payment is recorded as a PortalPayment record. Stripe integration is simulated (not live).
7. **Quote Request Flow:** Customers request quotes via `POST /portal/quotes/request`. Quote lifecycle: SUBMITTED -> REVIEWING -> QUOTED -> ACCEPTED/DECLINED/EXPIRED. Customers can accept or decline quotes, and request revisions. No DRAFT state exists — requests start at SUBMITTED.
8. **Multi-User Accounts:** A customer account can have multiple portal users (managed via PortalUsersController). Roles: ADMIN, USER, VIEW_ONLY. Account admins can invite, update, and remove users.
9. **Session Management:** Portal sessions use separate refresh tokens stored as hashes (PortalSession model). Logout invalidates the session. Sessions track userAgent and ipAddress. Tokens have shorter TTL than main app tokens for security.
10. **Rate Limiting:** Login endpoint has `@Throttle({ long: { limit: 5, ttl: 60000 } })` — 5 attempts per 60 seconds. Other public auth endpoints (register, forgot-password, reset-password) lack rate limiting (CPORT-018).

---

## 8. Data Model

The customer portal has **8 portal-specific Prisma models**, all fully built with migration-first fields (externalId, sourceSystem, customFields, tenantId, deletedAt).

### Portal-Specific Models

```
PortalUser {
  id                  String    @id @default(uuid())
  tenantId            String
  companyId           String
  email               String
  passwordHash        String?
  firstName           String
  lastName            String
  role                PortalUserRole     (ADMIN / USER / VIEW_ONLY)
  status              PortalUserStatus   (PENDING / ACTIVE / SUSPENDED / DEACTIVATED)
  emailVerified       Boolean   @default(false)
  verificationToken   String?
  resetPasswordToken  String?
  resetPasswordExpires DateTime?
  lastLoginAt         DateTime?
  language            String?   @default("en")
  permissions         Json?
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  deletedAt           DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  -- 23 fields total
}

PortalSession {
  id                  String    @id @default(uuid())
  portalUserId        String
  refreshTokenHash    String
  tokenType           String
  userAgent           String?
  ipAddress           String?
  expiresAt           DateTime
  revokedAt           DateTime?
  externalId          String?
  customFields        Json?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  -- 12 fields total
}

PortalPayment {
  id                      String    @id @default(uuid())
  tenantId                String
  companyId               String
  paymentNumber           String    @unique
  amount                  Decimal
  currency                String    @default("USD")
  status                  PortalPaymentStatus (PENDING / PROCESSING / COMPLETED / FAILED / REFUNDED)
  paymentMethod           String?
  processorTransactionId  String?
  processorResponse       Json?
  invoiceIds              String[]
  externalId              String?
  sourceSystem            String?
  customFields            Json?
  deletedAt               DateTime?
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
  -- 17 fields total
}

PortalSavedPaymentMethod {
  id                  String    @id @default(uuid())
  tenantId            String
  companyId           String
  portalUserId        String
  paymentMethodType   String
  cardBrand           String?
  lastFourDigits      String?
  expirationMonth     Int?
  expirationYear      Int?
  billingAddress      Json?
  isDefault           Boolean   @default(false)
  externalToken       String?
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  deletedAt           DateTime?
  createdAt           DateTime  @default(now())
  -- 17 fields total
}

PortalActivityLog {
  id                  String    @id @default(uuid())
  tenantId            String
  companyId           String
  portalUserId        String
  action              String
  entityType          String?
  entityId            String?
  description         String?
  ipAddress           String?
  userAgent           String?
  metadata            Json?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  -- 13 fields total
}

PortalNotification {
  id                  String    @id @default(uuid())
  tenantId            String
  companyId           String
  portalUserId        String
  notificationType    PortalNotificationType
  title               String
  message             String
  isRead              Boolean   @default(false)
  readAt              DateTime?
  actionUrl           String?
  relatedEntityType   String?
  relatedEntityId     String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  -- 14 fields total
}

PortalBranding {
  id                  String    @id @default(uuid())
  tenantId            String
  companyId           String
  logoUrl             String?
  faviconUrl          String?
  primaryColor        String?
  secondaryColor      String?
  accentColor         String?
  customCss           String?
  customJs            String?
  customDomain        String?
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  createdAt           DateTime  @default(now())
  -- 15 fields total
}

QuoteRequest {
  id                      String    @id @default(uuid())
  tenantId                String
  companyId               String
  portalUserId            String
  requestNumber           String    @unique
  originAddress           String
  originCity              String
  originState             String
  originZip               String
  destinationAddress      String
  destinationCity         String
  destinationState        String
  destinationZip          String
  pickupDate              DateTime
  equipmentType           String
  commodity               String?
  weightLbs               Decimal?
  palletCount             Int?
  isHazmat                Boolean   @default(false)
  isTemperatureControlled Boolean   @default(false)
  specialInstructions     String?
  status                  QuoteRequestStatus (SUBMITTED / REVIEWING / QUOTED / ACCEPTED / DECLINED / EXPIRED)
  quotedAmount            Decimal?
  quoteExpiresAt          DateTime?
  externalId              String?
  customFields            Json?
  createdAt               DateTime  @default(now())
  -- 27 fields total
}
```

### Enums (5)

| Enum | Values |
|------|--------|
| PortalNotificationType | QUOTE_READY, LOAD_UPDATE, INVOICE_AVAILABLE, PAYMENT_RECEIVED, DOCUMENT_UPLOADED, MESSAGE_RECEIVED, SHIPMENT_DELAYED, DELIVERY_CONFIRMED |
| PortalPaymentStatus | PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED |
| PortalUserRole | ADMIN, USER, VIEW_ONLY |
| PortalUserStatus | PENDING, ACTIVE, SUSPENDED, DEACTIVATED |
| QuoteRequestStatus | SUBMITTED, REVIEWING, QUOTED, ACCEPTED, DECLINED, EXPIRED |

### Shared Models Used

Portal also reads from: Company, Load, Invoice, Quote (main TMS models, read-only access via CompanyScopeGuard).

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `email` (login) | IsEmail, required | "Valid email is required" |
| `password` (if password login) | MinLength(8), has uppercase + number | "Password must be at least 8 characters with uppercase and number" |
| Quote request `originAddress` | Required, valid address | "Origin address is required" |
| Quote request `destinationAddress` | Required, valid address | "Destination address is required" |
| Quote request `pickupDate` | IsFuture date | "Pickup date must be in the future" |
| Quote request `equipmentType` | Required, IsString | "Equipment type is required" |
| Payment `amount` | Must match invoice balance | "Payment amount must match outstanding balance" |
| Registration `email` | IsEmail, unique per tenant | "Email already registered" |

---

## 10. Status States

### Portal User Status (PortalUserStatus enum)

```
PENDING -> ACTIVE (email verified)
ACTIVE -> SUSPENDED (admin action)
SUSPENDED -> ACTIVE (admin reactivation)
ACTIVE -> DEACTIVATED (admin removes user)
```

### Quote Request Status (QuoteRequestStatus enum)

```
SUBMITTED -> REVIEWING (TMS staff begins review)
REVIEWING -> QUOTED (TMS staff provides quote)
QUOTED -> ACCEPTED (customer accepts)
QUOTED -> DECLINED (customer declines)
QUOTED -> EXPIRED (auto after expiry date)
```

### Portal Payment Status (PortalPaymentStatus enum)

```
PENDING -> PROCESSING (payment submitted to processor)
PROCESSING -> COMPLETED (payment successful)
PROCESSING -> FAILED (payment failed)
COMPLETED -> REFUNDED (refund issued)
```

### Invoice Status (Portal View — Read Only)

```
PENDING -> SENT (visible to customer)
SENT -> PAID (after successful payment)
SENT -> OVERDUE (past due date)
```

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| No frontend portal exists at all | P0 | **Open** | 0 pages, 0 components, 0 hooks — confirmed by PST-13 |
| ~~No portal-specific Prisma models (PortalUser, PortalSession)~~ | ~~P0~~ | **FALSE** | ~~All 8 models fully built with comprehensive fields~~ |
| ~~40 backend endpoints untested~~ | ~~P0~~ | **FALSE** | ~~63 tests across 9 spec files — 3rd highest of any P0 service~~ |
| Public tracking page not built — backend endpoint ALSO missing | P0 | **Open** | `GET /portal/track/:code` is phantom — does not exist on any controller (CPORT-017) |
| **JWT secret inconsistency between module and guard** | **P0 BUG** | **Open** | Module signs with `PORTAL_JWT_SECRET \|\| JWT_SECRET`, guard verifies with `CUSTOMER_PORTAL_JWT_SECRET` — if env vars differ, auth fails silently (CPORT-016) |
| Payment gateway (Stripe) not integrated | P2 | Open | Payments are simulated, no real processor |
| Magic link email sending not verified | P1 | Needs verification | No email integration visible in codebase |
| Rate limiting partial — login only | P1 | **Partially resolved** | Login has @Throttle (5/60s). Register, forgot-password, reset-password lack rate limiting (CPORT-018) |
| Portal JWT secret may not be set in all environments | P1 | Needs verification | Subsumed by JWT inconsistency bug above |

**Resolved Issues (closed during PST-13 tribunal):**

- ~~No portal-specific Prisma models~~ — FALSE: All 8 models exist with 23-27 fields each
- ~~40 backend endpoints untested~~ — FALSE: 63 tests across 9 spec files
- ~~No rate limiting on portal auth~~ — PARTIALLY FALSE: Login has @Throttle

---

## 12. Tasks

### Completed (verified by PST-13 tribunal)

| Task ID | Title | Status |
|---------|-------|--------|
| CPORT-001 | ~~Create PortalUser + PortalSession Prisma models + migration~~ | **Done** — all 8 models exist |
| CPORT-014 | ~~Write backend tests for all 7 portal controllers~~ | **Done** — 63 tests / 9 spec files |

### Open — New from Tribunal

| Task ID | Title | Effort | Priority | Status |
|---------|-------|--------|----------|--------|
| CPORT-016 | Fix JWT secret inconsistency between module and guard | S (30min) | P0 | Open |
| CPORT-017 | Build public tracking endpoint `GET /portal/track/:code` | M (4h) | P0 | Open |
| CPORT-018 | Add rate limiting to all public auth endpoints (register, forgot, reset) | S (1h) | P1 | Open |

### Open — Portal Foundation

| Task ID | Title | Effort | Priority | Status |
|---------|-------|--------|----------|--------|
| CPORT-002 | Build portal shell layout (sidebar, branding, auth wrapper) | M (4h) | P0 | Open |
| CPORT-003 | Build portal login/register pages (magic link + password) | M (5h) | P0 | Open |
| CPORT-004 | Build portal dashboard page | M (4h) | P0 | Open |
| CPORT-005 | Build My Shipments list + detail pages | L (8h) | P0 | Open |
| CPORT-006 | Build public tracking page (no auth) | M (5h) | P0 | Open — blocked by CPORT-017 |

### Open — Portal Features

| Task ID | Title | Effort | Priority | Status |
|---------|-------|--------|----------|--------|
| CPORT-007 | Build My Quotes page + quote request form | L (8h) | P1 | Open |
| CPORT-008 | Build My Invoices page + PDF download | M (5h) | P1 | Open |
| CPORT-009 | Build My Documents page | M (4h) | P2 | Open |
| CPORT-010 | Build portal settings page | S (3h) | P2 | Open |

### Open — Portal Advanced

| Task ID | Title | Effort | Priority | Status |
|---------|-------|--------|----------|--------|
| CPORT-011 | Stripe payment integration for invoices | L (8h) | P2 | Open |
| CPORT-012 | Build support chat page | L (8h) | P2 | Open |
| CPORT-013 | Add integration tests (controller-level with real HTTP) | L (8h) | P1 | Open |
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
| Simple login only | Full auth flow: register, forgot-password, verify-email, refresh, change-password, logout | More complete than planned |
| No quote management | 8 quote endpoints (request, accept, decline, revision, estimate, pdf) | Added feature |
| No payment processing | 3 payment endpoints + PortalPayment + PortalSavedPaymentMethod models | Added feature |
| No user management | 6 user management endpoints + 3-role system (ADMIN/USER/VIEW_ONLY) | Added feature |
| Portal frontend as P1 deliverable | 0 pages, 0 components, 0 hooks built | Frontend completely missing |
| Basic tracking page | Public tracking endpoint is phantom — not built on backend either | Backend gap |
| 10 design specs created | All 10 specs exist | Design complete |
| No tests expected | 63 tests across 9 spec files | Exceeds expectations |

**Summary:** The backend is significantly more capable than originally planned (40 endpoints vs 8) with excellent security architecture (100% guard coverage, company scope isolation, rate limiting on login). However, the frontend gap is total — not a single portal page, component, or hook exists. The health score of C (5.5/10) reflects this: strong backend foundation (8.5/10) with zero user-facing implementation (0/10). The JWT secret inconsistency (CPORT-016) must be resolved before frontend build-out begins.

---

## 15. Dependencies

**Depends on:**

- Auth & Admin (separate JWT infrastructure — **must align env var names first, CPORT-016**)
- TMS Core (orders, loads, shipments — portal reads this data)
- Sales & Quotes (quote lifecycle — portal can request and accept quotes)
- Accounting (invoices, payments — portal displays and enables payment)
- Communication (magic link emails, notification emails, support chat)
- Storage (document uploads and downloads)
- Google Maps API (tracking map on shipment detail and public tracking)
- Stripe (payment gateway for invoice payment — optional, tenant-configured, currently simulated)

**Depended on by:**

- Customers (external end-users — the primary consumer of this portal)
- CRM (customer engagement data flows back to CRM)
- Sales & Quotes (quote requests originate from portal)
- Accounting (payments initiated from portal update invoice status)
