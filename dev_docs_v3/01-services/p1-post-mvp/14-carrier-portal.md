# Service Hub: Carrier Portal (14)

> **Priority:** P1 Post-MVP | **Status:** Backend Rich (54 endpoints), Frontend Not Built
> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-09 (PST-14 tribunal)
> **Original definition:** `dev_docs/02-services/` (Carrier Portal service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/13-carrier-portal/` (12 files)
> **Backend module:** `apps/api/src/modules/carrier-portal/` (7 controllers)
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-14-carrier-portal.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.5/10) -- well-architected backend (dual guard, 12 DTOs, quick pay), zero frontend |
| **Confidence** | High -- code-verified via PST-14 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Substantial -- 54 endpoints across 7 controllers, 8 portal models (6 specific + 2 linked), 6 enums, 12 DTOs |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | 69 tests / 10 spec files / 911 LOC -- all real (9 unit + 1 e2e, 0 stubs) |
| **Auth** | Separate JWT secret: `CARRIER_PORTAL_JWT_SECRET`, dual guard (CarrierPortalAuthGuard + CarrierScopeGuard) |
| **Revenue Impact** | HIGH -- carrier self-service reduces dispatcher workload by ~40% |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Carrier Portal definition in dev_docs |
| Design Specs | Done | 12 files in `dev_docs/12-Rabih-design-Process/13-carrier-portal/` |
| Backend -- Auth | Built | `CarrierPortalAuthController` -- 7 endpoints (login, register, forgot/reset password, verify-email, refresh, logout) |
| Backend -- Dashboard | Built | `CarrierPortalDashboardController` -- 5 endpoints (overview, active-loads, payment-summary, compliance, alerts) |
| Backend -- Users | Built | `CarrierPortalUsersController` -- 8 endpoints (user/profile management) |
| Backend -- Loads | Built | `CarrierPortalLoadsController` -- 17 endpoints (loads, available, save/unsave, bid, matching, status, location, eta, message) |
| Backend -- Documents | Built | `CarrierPortalDocumentsController` -- 6 endpoints (BOL/POD upload) |
| Backend -- Invoices | Built | `CarrierPortalInvoicesController` -- 8 endpoints (submit, settlements, quick pay, payment history) |
| Backend -- Compliance | Built | `CarrierPortalComplianceController` -- 5 endpoints (documents, expiring) |
| Prisma Models | Built | 8 models: 6 portal-specific (CarrierPortalUser, CarrierPortalSession, CarrierPortalDocument, CarrierPortalNotification, CarrierPortalActivityLog, CarrierSavedLoad) + 2 portal-linked (CarrierInvoiceSubmission, CarrierQuickPayRequest) + shared models (Carrier, Load, Settlement) |
| Frontend Pages | Not Built | 0 pages -- entire portal UI needs to be created |
| React Hooks | Not Built | 0 hooks |
| Components | Not Built | 0 components |
| Tests | 69 real tests | 10 spec files (9 unit + 1 e2e), 911 LOC total. E2e covers auth + profile + users + loads (179 LOC). Guard tests: CarrierPortalAuthGuard (4 tests, 57 LOC) + CarrierScopeGuard (2 tests, 26 LOC). |

---

## 3. Screens

All screens are planned (from design specs) but not yet built.

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Portal Login | `/portal/carrier/login` | Not Built | Carrier-specific auth, register, forgot password |
| Portal Dashboard | `/portal/carrier` | Not Built | KPIs, active loads summary, alerts, upcoming pickups |
| Available Loads | `/portal/carrier/loads/available` | Not Built | Browse loads available for bidding/acceptance |
| My Loads | `/portal/carrier/loads` | Not Built | Loads assigned to this carrier, status filters |
| Load Offer Detail | `/portal/carrier/loads/[id]` | Not Built | Full load detail, accept/decline, bid, status updates |
| Saved Loads | `/portal/carrier/loads/saved` | Not Built | Loads saved for later review |
| Document Upload | `/portal/carrier/documents` | Not Built | BOL/POD upload, camera capture for mobile |
| Payment History | `/portal/carrier/payments` | Not Built | Settlements, invoices, quick pay, payment status |
| My Profile | `/portal/carrier/profile` | Not Built | Carrier info, contacts, company details |
| Insurance Upload | `/portal/carrier/compliance/insurance` | Not Built | Upload/renew compliance documents, expiry alerts |
| Equipment Manager | `/portal/carrier/equipment` | Not Built | Manage trucks, trailers, equipment types |
| Support Chat | `/portal/carrier/support` | Not Built | In-portal support messaging |

---

## 4. API Endpoints

### Auth (7 endpoints -- `@Controller('carrier-portal/auth')`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| POST | `/api/v1/carrier-portal/auth/login` | CarrierPortalAuthController | Built | @Throttle(5, 60) rate-limited |
| POST | `/api/v1/carrier-portal/auth/register` | CarrierPortalAuthController | Built | Tenant fallback to 'default-tenant' |
| POST | `/api/v1/carrier-portal/auth/forgot-password` | CarrierPortalAuthController | Built | |
| POST | `/api/v1/carrier-portal/auth/reset-password` | CarrierPortalAuthController | Built | |
| GET | `/api/v1/carrier-portal/auth/verify-email/:token` | CarrierPortalAuthController | Built | GET (not POST), path includes :token |
| POST | `/api/v1/carrier-portal/auth/refresh` | CarrierPortalAuthController | Built | |
| POST | `/api/v1/carrier-portal/auth/logout` | CarrierPortalAuthController | Built | Unguarded (all auth endpoints unguarded by design) |

### Dashboard (5 endpoints -- `@Controller('carrier-portal/dashboard')`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/carrier-portal/dashboard` | CarrierPortalDashboardController | Built | Overview: active loads, invoices, settlements, notifications |
| GET | `/api/v1/carrier-portal/dashboard/active-loads` | CarrierPortalDashboardController | Built | Top 10 non-terminal loads |
| GET | `/api/v1/carrier-portal/dashboard/payment-summary` | CarrierPortalDashboardController | Built | Total paid, balance, settlements |
| GET | `/api/v1/carrier-portal/dashboard/compliance` | CarrierPortalDashboardController | Built | Document status counts |
| GET | `/api/v1/carrier-portal/dashboard/alerts` | CarrierPortalDashboardController | Built | Expiring docs, unpaid settlements |

### Users / Profile (8 endpoints -- `@Controller('carrier-portal')`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/carrier-portal/users` | CarrierPortalUsersController | Built | |
| GET | `/api/v1/carrier-portal/users/:id` | CarrierPortalUsersController | Built | |
| POST | `/api/v1/carrier-portal/users` | CarrierPortalUsersController | Built | |
| PUT | `/api/v1/carrier-portal/users/:id` | CarrierPortalUsersController | Built | |
| DELETE | `/api/v1/carrier-portal/users/:id` | CarrierPortalUsersController | Built | |
| GET | `/api/v1/carrier-portal/profile` | CarrierPortalUsersController | Built | |
| PUT | `/api/v1/carrier-portal/profile` | CarrierPortalUsersController | Built | |
| PUT | `/api/v1/carrier-portal/profile/password` | CarrierPortalUsersController | Built | |

### Loads (17 endpoints -- `@Controller('carrier-portal')`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/carrier-portal/loads` | CarrierPortalLoadsController | Built | My loads (assigned) |
| GET | `/api/v1/carrier-portal/loads/available` | CarrierPortalLoadsController | Built | Browse available loads |
| GET | `/api/v1/carrier-portal/loads/available/:id` | CarrierPortalLoadsController | Built | Available load detail |
| GET | `/api/v1/carrier-portal/loads/saved` | CarrierPortalLoadsController | Built | Saved loads list |
| GET | `/api/v1/carrier-portal/loads/matching` | CarrierPortalLoadsController | Built | AI/criteria-matched loads |
| GET | `/api/v1/carrier-portal/loads/:id` | CarrierPortalLoadsController | Built | Load detail |
| POST | `/api/v1/carrier-portal/loads/:id/accept` | CarrierPortalLoadsController | Built | Accept load offer |
| POST | `/api/v1/carrier-portal/loads/:id/decline` | CarrierPortalLoadsController | Built | Decline load offer (not "reject") |
| POST | `/api/v1/carrier-portal/loads/available/:id/save` | CarrierPortalLoadsController | Built | Save load for later |
| DELETE | `/api/v1/carrier-portal/loads/saved/:id` | CarrierPortalLoadsController | Built | Unsave a load |
| POST | `/api/v1/carrier-portal/loads/:id/bid` | CarrierPortalLoadsController | Built | Submit bid on load |
| POST | `/api/v1/carrier-portal/loads/:id/status` | CarrierPortalLoadsController | Built | Update load status |
| POST | `/api/v1/carrier-portal/loads/:id/location` | CarrierPortalLoadsController | Built | Report current location |
| POST | `/api/v1/carrier-portal/loads/:id/eta` | CarrierPortalLoadsController | Built | Update ETA |
| POST | `/api/v1/carrier-portal/loads/:id/message` | CarrierPortalLoadsController | Built | Send message to dispatcher |
| POST | `/api/v1/carrier-portal/loads/:id/pod` | CarrierPortalLoadsController | Built | Upload POD for load |
| POST | `/api/v1/carrier-portal/loads/:id/documents` | CarrierPortalLoadsController | Built | Upload load documents |

### Documents (6 endpoints -- `@Controller('carrier-portal')`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/carrier-portal/documents` | CarrierPortalDocumentsController | Built | |
| GET | `/api/v1/carrier-portal/documents/:id` | CarrierPortalDocumentsController | Built | |
| POST | `/api/v1/carrier-portal/documents` | CarrierPortalDocumentsController | Built | |
| DELETE | `/api/v1/carrier-portal/documents/:id` | CarrierPortalDocumentsController | Built | |
| POST | `/api/v1/carrier-portal/loads/:id/pod` | CarrierPortalDocumentsController | Built | POD upload (not GET download) |
| POST | `/api/v1/carrier-portal/loads/:id/documents` | CarrierPortalDocumentsController | Built | Load document upload (not POST /documents/upload) |

### Invoices / Settlements (8 endpoints -- `@Controller('carrier-portal')`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/carrier-portal/invoices` | CarrierPortalInvoicesController | Built | List invoices |
| GET | `/api/v1/carrier-portal/invoices/:id` | CarrierPortalInvoicesController | Built | Invoice detail |
| POST | `/api/v1/carrier-portal/invoices` | CarrierPortalInvoicesController | Built | Submit invoice |
| GET | `/api/v1/carrier-portal/settlements` | CarrierPortalInvoicesController | Built | List settlements |
| GET | `/api/v1/carrier-portal/settlements/:id` | CarrierPortalInvoicesController | Built | Settlement detail |
| GET | `/api/v1/carrier-portal/settlements/:id/pdf` | CarrierPortalInvoicesController | Built | Download settlement PDF |
| GET | `/api/v1/carrier-portal/payment-history` | CarrierPortalInvoicesController | Built | Payment history (not /payments) |
| POST | `/api/v1/carrier-portal/quick-pay/:settlementId` | CarrierPortalInvoicesController | Built | Request quick pay (2% fee, $100 min) |

### Compliance (5 endpoints -- `@Controller('carrier-portal/compliance')`)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/carrier-portal/compliance` | CarrierPortalComplianceController | Built | Compliance overview |
| GET | `/api/v1/carrier-portal/compliance/documents` | CarrierPortalComplianceController | Built | List compliance docs (not /insurance) |
| POST | `/api/v1/carrier-portal/compliance/documents` | CarrierPortalComplianceController | Built | Upload compliance doc (not POST /insurance) |
| GET | `/api/v1/carrier-portal/compliance/documents/:id` | CarrierPortalComplianceController | Built | Compliance doc detail (not /authority) |
| GET | `/api/v1/carrier-portal/compliance/expiring` | CarrierPortalComplianceController | Built | Expiring items |

**Total: 54 endpoints across 7 controllers. 47/54 auth-guarded (CarrierPortalAuthGuard + CarrierScopeGuard). 7 auth endpoints unguarded by design.**

---

## 5. Components

No components exist. All must be built for the portal frontend.

**Planned component domains (from design specs):**

- **Auth:** login form, register form, forgot password form, reset password form
- **Dashboard:** KPI cards, active loads widget, payment summary, compliance status, alerts panel
- **Loads:** available loads table/cards, my loads table, load detail view, accept/decline actions, bid form, saved loads
- **Status Updates:** location reporting, ETA updates, status transitions, message composer
- **Documents:** document list, upload zone with camera capture, BOL/POD viewers
- **Payments:** invoice list, settlement detail, quick pay request, payment history
- **Profile:** carrier profile form, contact management, password change
- **Compliance:** compliance document upload, expiring items alerts
- **Equipment:** truck/trailer list, equipment form
- **Layout:** portal shell, mobile-first navigation, portal header, portal sidebar

---

## 6. Hooks

No hooks exist. All must be built for the portal frontend.

**Planned hooks (one per controller domain):**

| Hook (Planned) | Endpoints | Notes |
|-----------------|-----------|-------|
| `useCarrierPortalAuth` | 7 auth endpoints | Login, register, password reset, token refresh |
| `useCarrierPortalDashboard` | 5 dashboard endpoints | Active loads, payment summary, compliance, alerts |
| `useCarrierPortalUsers` | 8 user/profile endpoints | Profile CRUD, password change |
| `useCarrierPortalLoads` | 17 loads endpoints | Available loads, saved loads, bid, matching, status, location, eta, message |
| `useCarrierPortalDocuments` | 6 document endpoints | Upload, list, delete, load-specific uploads |
| `useCarrierPortalInvoices` | 8 invoice/settlement/payment endpoints | Submit invoices, settlements, quick pay, payment history |
| `useCarrierPortalCompliance` | 5 compliance endpoints | Compliance documents, expiring items |

**Critical implementation notes:**
- All hooks must use separate API client with `CARRIER_PORTAL_JWT_SECRET` auth
- All hooks must use `unwrap()` helper for `{ data: T }` envelope (see `dev_docs_v3/05-audit/recurring-patterns.md`)
- Portal auth tokens must NOT be stored in localStorage (same XSS risk as P0-001)

---

## 7. Business Rules

1. **Separate Auth:** Carrier portal uses its own `CARRIER_PORTAL_JWT_SECRET`, completely separate from the main TMS JWT. Carrier contacts log in with email + password. Registration requires approval. Magic link login is planned for drivers.
2. **Dual Guard Architecture:** All protected endpoints (47/54) use CarrierPortalAuthGuard + CarrierScopeGuard -- same pattern as Customer Portal's PortalAuthGuard + CompanyScopeGuard. Every query filters by `tenantId` + `carrierId` from JWT.
3. **Quick Pay Workflow:** Carriers can request early payment on settlements via `POST /quick-pay/:settlementId`. Fee: 2% of settlement amount. Minimum settlement: $100. Carrier must accept terms (`acceptTerms: true` in DTO). Flow: request -> fee calculation -> net amount -> QuickPayStatus tracking (PENDING -> APPROVED/REJECTED -> PAID).
4. **Load Bidding & Matching:** Carriers can bid on available loads (`POST /loads/:id/bid`) and view AI/criteria-matched loads (`GET /loads/matching`). Carriers can save loads for later review (`POST /loads/available/:id/save`).
5. **Real-Time Status Updates:** Carriers report location (`POST /loads/:id/location`), update ETA (`POST /loads/:id/eta`), change load status (`POST /loads/:id/status`), and message dispatchers (`POST /loads/:id/message`) -- all from the portal.
6. **POD Upload Triggers Invoice Workflow:** When a carrier uploads Proof of Delivery, it triggers the same invoice/settlement workflow as an internal POD upload. This is the primary mechanism for carriers to initiate payment. Mobile camera upload is required for drivers in the field.
7. **Mobile-First Design:** The carrier portal is designed primarily for drivers on mobile devices. All forms must be touch-friendly with large tap targets. POD upload uses device camera. Minimum touch target: 44x44px.
8. **Available Loads Browsing:** Carriers can browse loads that have been posted as available. Accept/decline actions are available on load offers. Accepted loads move to "My Loads" and trigger dispatcher notification.
9. **Compliance Self-Service:** Carriers can view their compliance status, upload compliance documents, and see items nearing expiration. Expired insurance blocks load acceptance.
10. **Invoice/Settlement Visibility + Submission:** Carriers can view invoices, settlements, and payment history. Carriers CAN submit invoices (`POST /invoices`) and request quick pay. Settlement PDFs are downloadable.
11. **Multi-User per Carrier:** A carrier company can have multiple portal users (dispatchers, drivers, admin). User management is available to carrier admin users. Each user has role-based access within the carrier's scope. Roles: OWNER, ADMIN, DISPATCHER, DRIVER (+ VIEW_ONLY via PortalUserRole enum).

---

## 8. Data Model

The Carrier Portal has 8 models: 6 portal-specific + 2 portal-linked, plus shared TMS models.

### Portal-Specific Models (6 dedicated)
```
CarrierPortalUser {
  id, tenantId, carrierId, email, password (bcrypt), firstName, lastName,
  phone?, role (CarrierPortalUserRole, default DISPATCHER), status (PortalUserStatus),
  emailVerified, emailVerifiedAt?, verificationToken? (unique),
  lastLoginAt?, language (@default "en"), customFields (Json),
  externalId?, sourceSystem?, createdById?, updatedById?,
  createdAt, updatedAt, deletedAt?
  -- Relations: sessions[], documents[], notifications[], activityLog[],
     invoices[], savedLoads[], quickPayRequests[]
  -- Unique: [tenantId, email]
}

CarrierPortalSession {
  id, tenantId, userId (FK -> CarrierPortalUser), refreshTokenHash (SHA256),
  userAgent?, ipAddress? (VarChar 45), expiresAt, revokedAt?,
  carrierId? (optional), externalId?, sourceSystem?, createdById?, updatedById?,
  createdAt, updatedAt, deletedAt?
}

CarrierPortalDocument {
  id, tenantId, carrierId, userId (FK -> CarrierPortalUser), loadId?,
  documentType (CarrierDocumentType), fileName, filePath, fileSize, mimeType,
  status (CarrierDocumentStatus), reviewedBy?, reviewedAt?, reviewNotes?, rejectionNotes?,
  externalId?, sourceSystem?, createdById?, updatedById?,
  createdAt, updatedAt, deletedAt?
}

CarrierPortalNotification {
  id, tenantId, carrierPortalUserId, notificationType (CarrierPortalNotificationType),
  title, message, isRead (@default false), readAt?, actionUrl?,
  relatedEntityType?, relatedEntityId?,
  externalId?, sourceSystem?, createdById?, updatedById?,
  createdAt, updatedAt, deletedAt?
}

CarrierPortalActivityLog {
  id, tenantId, userId, carrierId? (optional), action (e.g. BID/UPLOAD/LOGIN),
  entityType?, entityId?, description?, ipAddress?, userAgent?,
  customFields (Json), externalId?, sourceSystem?, createdById?, updatedById?,
  createdAt, updatedAt, deletedAt?
}

CarrierSavedLoad {
  id, tenantId, carrierId, carrierPortalUserId (FK -> CarrierPortalUser),
  postingId, notes?, reminderDate?, savedFrom?,
  externalId?, sourceSystem?, customFields (Json), createdById?, updatedById?,
  createdAt, updatedAt, deletedAt?
  -- Note: Portal-specific model (FK to CarrierPortalUser, not Carrier)
}
```

### Portal-Linked Models (2)
```
CarrierInvoiceSubmission {
  id, tenantId, carrierId, carrierPortalUserId (FK -> CarrierPortalUser),
  invoiceNumber, amount, invoiceDate, status, reviewedBy?, reviewedAt?,
  externalId?, sourceSystem?, createdById?, updatedById?,
  createdAt, updatedAt, deletedAt?
  -- Note: Portal-linked model with FK to CarrierPortalUser
}

CarrierQuickPayRequest {
  id, tenantId, carrierId, carrierPortalUserId (FK -> CarrierPortalUser),
  settlementId, requestedAmount, feePercent (@default 2.0), feeAmount, netAmount,
  status (QuickPayStatus: PENDING, APPROVED, REJECTED, PAID),
  acceptTerms, processedBy?, processedAt?, notes?,
  externalId?, sourceSystem?, customFields (Json), createdById?, updatedById?,
  createdAt, updatedAt, deletedAt?
  -- Business rule: 2% fee, $100 minimum settlement
}
```

### Enums (6)
```
CarrierPortalUserRole: OWNER, ADMIN, DISPATCHER, DRIVER
PortalUserRole: ADMIN, USER, VIEW_ONLY
PortalUserStatus: PENDING, ACTIVE, SUSPENDED, DEACTIVATED
CarrierDocumentType: POD, LUMPER_RECEIPT, SCALE_TICKET, BOL_SIGNED, WEIGHT_TICKET, OTHER
CarrierDocumentStatus: UPLOADED, REVIEWING, APPROVED, REJECTED
CarrierPortalNotificationType: LOAD_ASSIGNED, LOAD_CANCELLED, DOCUMENT_REQUEST,
  PAYMENT_PROCESSED, INVOICE_APPROVED, INVOICE_REJECTED, QUICK_PAY_APPROVED,
  QUICK_PAY_REJECTED, GENERAL
QuickPayStatus: PENDING, APPROVED, REJECTED, PAID
```

### Shared TMS Models Used
```
Carrier, Load, Settlement, Payment, Document
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `email` (login) | IsEmail, required | "Valid email is required" |
| `password` (login) | MinLength(8), required | "Password must be at least 8 characters" |
| `password` (register) | MinLength(8), 1 uppercase, 1 number, 1 special | "Password does not meet complexity requirements" |
| Document upload | MaxSize(10MB), allowed types: PDF, JPG, PNG | "File exceeds 10MB limit" or "Unsupported file type" |
| Insurance upload | Expiry date must be in the future | "Insurance expiry date must be in the future" |
| Profile update | Email unique within carrier | "Email already in use" |
| Quick pay request | `acceptTerms` must be true, settlement >= $100 | "Must accept terms" / "Settlement below minimum" |
| Bid amount | IsNumber, positive | "Invalid bid amount" |

---

## 10. Status States

### Load Status (Carrier Portal View)
```
AVAILABLE    -- Load posted for carrier acceptance (available loads browser)
TENDERED     -- Load offered to this specific carrier (pending accept/decline)
ACCEPTED     -- Carrier accepted the load offer
DISPATCHED   -- Load dispatched, pending pickup
AT_PICKUP    -- Driver arrived at pickup (carrier marks via portal)
PICKED_UP    -- Cargo loaded, in transit
IN_TRANSIT   -- En route to delivery
AT_DELIVERY  -- Driver arrived at delivery (carrier marks via portal)
DELIVERED    -- Cargo delivered, POD pending
COMPLETED    -- POD uploaded, settlement initiated
```

### Quick Pay Status
```
PENDING      -- Quick pay requested, awaiting review
APPROVED     -- Approved for early payment
REJECTED     -- Request denied (reason in notes)
PAID         -- Payment issued to carrier
```

### Compliance Status
```
COMPLIANT       -- All insurance current, authority active
EXPIRING_SOON   -- Insurance expires within 30 days
NON_COMPLIANT   -- Insurance expired or authority suspended
```

### Invoice/Settlement Status (read-only for carrier, except submit)
```
PENDING     -- Invoice created/submitted, not yet approved
APPROVED    -- Invoice approved for payment
PAID        -- Payment issued
OVERDUE     -- Payment past due date
```

---

## 11. Known Issues

| # | Issue | Severity | File/Area | Status |
|---|-------|----------|-----------|--------|
| 1 | No frontend portal built at all | P0 | `apps/web/` | Deferred to P1 phase |
| 2 | **Soft-delete gap: 5/7 services missing `deletedAt: null` filter** | P0 BUG | Dashboard, compliance, documents, invoices, loads services | **Open -- CRITICAL** |
| 3 | **Login queries by email only -- no tenantId filter (cross-tenant auth bypass)** | P0 BUG | `carrier-portal-auth.service.ts` login() | **Open -- CRITICAL** |
| 4 | Register tenant resolution fragile -- falls back to 'default-tenant' | P1 | `carrier-portal-auth.service.ts` | Open |
| 5 | Rate limiting incomplete -- only login has @Throttle, register/forgot/reset unprotected | P1 | Auth controller | Open |
| 6 | Document storage paths hardcoded | P2 | Documents/compliance services | `/uploads/`, `/compliance/` -- no S3 integration |
| 7 | Mobile-optimized design not started | P1 | Design exists, implementation pending | Open |
| 8 | ~~Separate JWT auth flow not tested end-to-end~~ | ~~P1~~ | ~~`CARRIER_PORTAL_JWT_SECRET`~~ | **Closed -- e2e test covers full auth flow (179 LOC: login->refresh->forgot->reset->relogin->logout)** |
| 9 | Token storage strategy undefined for portal | P1 | Must avoid localStorage (XSS risk per P0-001) | Open |
| 10 | No WebSocket integration for real-time load updates | P2 | Portal loads page needs live status | Open |
| 11 | Support chat not designed beyond placeholder spec | P3 | `13-carrier-portal/12-support-chat.md` | Open |
| 12 | ~~No API rate limiting on portal auth endpoints~~ | ~~P1~~ | ~~Brute-force risk on login/register~~ | **Partially closed -- login HAS @Throttle(5, 60). Reclassified as #5 above (incomplete coverage).** |
| 13 | ~~Backend endpoint paths need verification against actual decorators~~ | ~~P2~~ | ~~Exact paths may differ~~ | **Closed -- PST-14 tribunal verified all paths. Hub Section 4 corrected (52% were wrong).** |
| 14 | No decorator-level @Roles() guard on admin actions | P2 | inviteUser, updateUser, deactivateUser | Open -- service-level role checks exist but no @Roles() |

---

## 12. Tasks

### Portal Build (P1 -- Post-MVP)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| CPRT-101 | Set up portal app shell + routing + layout (mobile-first) | L (8h) | P1 | Portal shell, nav, responsive layout |
| CPRT-102 | Build portal auth flow (login, register, forgot/reset password) | L (8h) | P1 | Separate JWT, httpOnly cookies |
| CPRT-103 | Build portal dashboard | M (5h) | P1 | KPI cards, active loads, payment summary, compliance, alerts |
| CPRT-104 | Build Available Loads browser + saved loads | M (5h) | P1 | Search, filter, save, bid, matching |
| CPRT-105 | Build My Loads list + load detail | L (8h) | P1 | Status updates, location reporting, ETA, messaging |
| CPRT-106 | Build POD/BOL upload (camera support) | M (4h) | P1 | Camera capture, drag-drop, progress |
| CPRT-107 | Build Payment History + Quick Pay | M (5h) | P2 | Invoice submit, settlements, quick pay request, PDF download |
| CPRT-108 | Build My Profile + user management | M (4h) | P2 | Profile edit, password change, multi-user |
| CPRT-109 | Build Compliance management | M (4h) | P2 | Upload compliance docs, view expiry, alerts |
| CPRT-110 | Build Equipment Manager | S (3h) | P2 | Truck/trailer CRUD |
| CPRT-111 | Build Support Chat | L (8h) | P3 | Real-time messaging with dispatcher |
| CPRT-112 | Write hooks for all 7 controller domains | L (8h) | P1 | 7 hooks covering 54 endpoints |

### Critical Backend Fixes (before portal frontend launch)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| CPRT-120 | Fix soft-delete filtering in 5 services | M (3h) | P0 | Add `deletedAt: null` to dashboard, compliance, documents, invoices, loads |
| CPRT-121 | Fix login tenant isolation | S (1h) | P0 | Add tenantId to login query (require tenant header or subdomain) |
| CPRT-122 | Add rate limiting to register, forgotPassword, resetPassword | S (1h) | P1 | Add @Throttle decorators |
| CPRT-123 | Add @Roles() decorator-level guards for admin actions | S (2h) | P2 | inviteUser, updateUser, deactivateUser |

### Previously Listed Tasks (from v1 hub -- superseded)

| Old Task ID | Title | Status |
|-------------|-------|--------|
| CPRT-201 | Build Carrier Portal shell + auth | Superseded by CPRT-101 + CPRT-102 |
| CPRT-202 | Build My Loads + stop management | Superseded by CPRT-105 |
| CPRT-203 | Build Check Call submission (mobile) | Removed -- no check call endpoints in portal (phantom) |
| CPRT-204 | Build POD upload (camera) | Superseded by CPRT-106 |
| CPRT-205 | Build Rate Confirmation view + e-signature | Removed -- no rate-con endpoints in portal (phantom) |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Portal Dashboard | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/01-portal-dashboard.md` |
| Available Loads | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/02-available-loads.md` |
| My Loads | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/03-my-loads.md` |
| Load Offer Detail | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/04-load-offer-detail.md` |
| Document Upload | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/05-document-upload.md` |
| Payment History | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/06-payment-history.md` |
| My Profile | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/07-my-profile.md` |
| Insurance Upload | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/08-insurance-upload.md` |
| Equipment Manager | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/09-equipment-manager.md` |
| Rate Confirmation | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/10-rate-confirmation.md` |
| Check Call Entry | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/11-check-call-entry.md` |
| Support Chat | Full spec | `dev_docs/12-Rabih-design-Process/13-carrier-portal/12-support-chat.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| ~8 endpoints assumed | 54 endpoints across 7 controllers | Backend is ~7x richer than originally documented |
| Auth = simple login | Full auth flow: register, verify-email, forgot/reset password, refresh, logout (7 endpoints) + dual guard | Exceeds plan |
| No compliance management | 5 compliance endpoints (documents, expiring) | New capability |
| No invoice/payment visibility | 8 invoice/settlement/payment endpoints + quick pay | New capability |
| No user management | 8 user/profile endpoints (multi-user per carrier) | New capability |
| No dashboard | 5 dashboard endpoints (active-loads, payment-summary, compliance, alerts) | New capability |
| No load bidding/saving | Save, bid, matching endpoints (3 new) | New capability |
| No real-time updates | Status, location, ETA, message endpoints (4 new) | New capability |
| "7 stubs + 1 e2e 80 LOC" | 69 real tests, 10 files, 911 LOC (0 stubs) | Tests 8.6x more than documented |
| 13 screens planned | 12 screens identified (check call + rate-con removed -- no backend endpoints) | Scope refined |
| Frontend "Phase 2" | Frontend still not started | Zero progress on UI |
| Mobile-first design | 12 design spec files exist | Specs ready, no implementation |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (main TMS JWT infrastructure, separate secret for portal) -- P0
- TMS Core -- Loads (carrier portal reads/writes scoped load data) -- P0
- Carrier Management (carrier records, contacts, insurance, authority) -- P0
- Documents (file upload infrastructure, BOL/POD storage) -- P0
- Accounting (invoice, settlement, payment records for carrier view + quick pay) -- P0
- Communication (notifications to dispatcher, email triggers) -- P1

**Depended on by:**
- External Carriers (primary users -- dispatchers and drivers accessing portal)
- Dispatch (real-time status/location/ETA updates from carriers feed into dispatch board)
- Accounting (POD upload triggers invoice workflow, quick pay requests, settlement initiation)
- Compliance (carrier self-service document uploads reduce admin workload)

**Infrastructure prerequisites:**
- `CARRIER_PORTAL_JWT_SECRET` must be set in environment
- File upload service must support camera capture (mobile)
- httpOnly cookie strategy for portal tokens (avoid localStorage per P0-001)
- Tenant resolution mechanism for login (header or subdomain-based -- currently missing)
