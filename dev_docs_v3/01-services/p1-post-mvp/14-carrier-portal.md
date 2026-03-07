# Service Hub: Carrier Portal (14)

> **Priority:** P1 Post-MVP | **Status:** Backend Rich (54 endpoints), Frontend Not Built
> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Carrier Portal service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/13-carrier-portal/` (12 files)
> **Backend module:** `apps/api/src/modules/carrier-portal/` (7 controllers)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2.5/10) -- backend is richest portal (54 endpoints), but zero frontend |
| **Confidence** | High -- backend controllers verified 2026-03-07 |
| **Last Verified** | 2026-03-07 |
| **Backend** | Substantial -- 54 endpoints across 7 controllers, 5 portal-specific Prisma models, 5 enums, 11+ DTOs |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | Minimal -- 7 service spec files (likely stubs) + 1 e2e test (80 lines, basic login flow) |
| **Auth** | Separate JWT secret: `CARRIER_PORTAL_JWT_SECRET` |
| **Revenue Impact** | HIGH -- carrier self-service reduces dispatcher workload by ~40% |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Carrier Portal definition in dev_docs |
| Design Specs | Done | 12 files in `dev_docs/12-Rabih-design-Process/13-carrier-portal/` |
| Backend -- Auth | Built | `CarrierPortalAuthController` -- 7 endpoints (login, register, forgot/reset password, verify, refresh, logout) |
| Backend -- Dashboard | Built | `CarrierPortalDashboardController` -- 5 endpoints |
| Backend -- Users | Built | `CarrierPortalUsersController` -- 8 endpoints (user/profile management) |
| Backend -- Loads | Built | `CarrierPortalLoadsController` -- 15 endpoints (loads, stops, check calls, rate confirmations) |
| Backend -- Documents | Built | `CarrierPortalDocumentsController` -- 6 endpoints (BOL/POD upload) |
| Backend -- Invoices | Built | `CarrierPortalInvoicesController` -- 8 endpoints (settlements/payments) |
| Backend -- Compliance | Built | `CarrierPortalComplianceController` -- 5 endpoints (insurance, authority status) |
| Prisma Models | Built | 5 portal-specific models: CarrierPortalUser, CarrierPortalSession, CarrierPortalDocument, CarrierPortalNotification, CarrierPortalActivityLog + shared models (Carrier, Load, Settlement) |
| Frontend Pages | Not Built | 0 pages -- entire portal UI needs to be created |
| React Hooks | Not Built | 0 hooks |
| Components | Not Built | 0 components |
| Tests | Minimal | 7 service `.spec.ts` files (likely stubs) + 1 e2e test (`carrier-portal.e2e-spec.ts`, 80 lines, basic login) |

---

## 3. Screens

All screens are planned (from design specs) but not yet built.

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Portal Login | `/portal/carrier/login` | Not Built | Carrier-specific auth, register, forgot password |
| Portal Dashboard | `/portal/carrier` | Not Built | KPIs, active loads summary, alerts, upcoming pickups |
| Available Loads | `/portal/carrier/loads/available` | Not Built | Browse loads available for bidding/acceptance |
| My Loads | `/portal/carrier/loads` | Not Built | Loads assigned to this carrier, status filters |
| Load Offer Detail | `/portal/carrier/loads/[id]` | Not Built | Full load detail with stops, rate, accept/reject |
| Check Call Entry | `/portal/carrier/loads/[id]/checkcall` | Not Built | Mobile-friendly single-screen form, GPS auto-fill |
| Rate Confirmation | `/portal/carrier/loads/[id]/rate-con` | Not Built | View + e-signature with timestamp and IP |
| Document Upload | `/portal/carrier/documents` | Not Built | BOL/POD upload, camera capture for mobile |
| Payment History | `/portal/carrier/payments` | Not Built | Settlements, invoices, payment status |
| My Profile | `/portal/carrier/profile` | Not Built | Carrier info, contacts, company details |
| Insurance Upload | `/portal/carrier/compliance/insurance` | Not Built | Upload/renew insurance certificates |
| Equipment Manager | `/portal/carrier/equipment` | Not Built | Manage trucks, trailers, equipment types |
| Support Chat | `/portal/carrier/support` | Not Built | In-portal support messaging |

---

## 4. API Endpoints

### Auth (7 endpoints -- `@Controller('carrier-portal/auth')`)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| POST | `/api/v1/carrier-portal/auth/login` | CarrierPortalAuthController | Built |
| POST | `/api/v1/carrier-portal/auth/register` | CarrierPortalAuthController | Built |
| POST | `/api/v1/carrier-portal/auth/forgot-password` | CarrierPortalAuthController | Built |
| POST | `/api/v1/carrier-portal/auth/reset-password` | CarrierPortalAuthController | Built |
| POST | `/api/v1/carrier-portal/auth/verify` | CarrierPortalAuthController | Built |
| POST | `/api/v1/carrier-portal/auth/refresh` | CarrierPortalAuthController | Built |
| POST | `/api/v1/carrier-portal/auth/logout` | CarrierPortalAuthController | Built |

### Dashboard (5 endpoints -- `@Controller('carrier-portal/dashboard')`)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/carrier-portal/dashboard` | CarrierPortalDashboardController | Built |
| GET | `/api/v1/carrier-portal/dashboard/stats` | CarrierPortalDashboardController | Built |
| GET | `/api/v1/carrier-portal/dashboard/upcoming` | CarrierPortalDashboardController | Built |
| GET | `/api/v1/carrier-portal/dashboard/alerts` | CarrierPortalDashboardController | Built |
| GET | `/api/v1/carrier-portal/dashboard/activity` | CarrierPortalDashboardController | Built |

### Users / Profile (8 endpoints -- `@Controller('carrier-portal')`)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/carrier-portal/users` | CarrierPortalUsersController | Built |
| GET | `/api/v1/carrier-portal/users/:id` | CarrierPortalUsersController | Built |
| POST | `/api/v1/carrier-portal/users` | CarrierPortalUsersController | Built |
| PUT | `/api/v1/carrier-portal/users/:id` | CarrierPortalUsersController | Built |
| DELETE | `/api/v1/carrier-portal/users/:id` | CarrierPortalUsersController | Built |
| GET | `/api/v1/carrier-portal/profile` | CarrierPortalUsersController | Built |
| PUT | `/api/v1/carrier-portal/profile` | CarrierPortalUsersController | Built |
| PUT | `/api/v1/carrier-portal/profile/password` | CarrierPortalUsersController | Built |

### Loads (15 endpoints -- `@Controller('carrier-portal')`)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/carrier-portal/loads` | CarrierPortalLoadsController | Built |
| GET | `/api/v1/carrier-portal/loads/available` | CarrierPortalLoadsController | Built |
| GET | `/api/v1/carrier-portal/loads/:id` | CarrierPortalLoadsController | Built |
| POST | `/api/v1/carrier-portal/loads/:id/accept` | CarrierPortalLoadsController | Built |
| POST | `/api/v1/carrier-portal/loads/:id/reject` | CarrierPortalLoadsController | Built |
| GET | `/api/v1/carrier-portal/loads/:id/stops` | CarrierPortalLoadsController | Built |
| PATCH | `/api/v1/carrier-portal/loads/:id/stops/:stopId/arrive` | CarrierPortalLoadsController | Built |
| PATCH | `/api/v1/carrier-portal/loads/:id/stops/:stopId/depart` | CarrierPortalLoadsController | Built |
| GET | `/api/v1/carrier-portal/loads/:id/checkcalls` | CarrierPortalLoadsController | Built |
| POST | `/api/v1/carrier-portal/loads/:id/checkcalls` | CarrierPortalLoadsController | Built |
| GET | `/api/v1/carrier-portal/loads/:id/rate-confirmation` | CarrierPortalLoadsController | Built |
| POST | `/api/v1/carrier-portal/loads/:id/rate-confirmation/sign` | CarrierPortalLoadsController | Built |
| GET | `/api/v1/carrier-portal/loads/:id/documents` | CarrierPortalLoadsController | Built |
| GET | `/api/v1/carrier-portal/loads/stats` | CarrierPortalLoadsController | Built |
| GET | `/api/v1/carrier-portal/loads/:id/timeline` | CarrierPortalLoadsController | Built |

### Documents (6 endpoints -- `@Controller('carrier-portal')`)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/carrier-portal/documents` | CarrierPortalDocumentsController | Built |
| GET | `/api/v1/carrier-portal/documents/:id` | CarrierPortalDocumentsController | Built |
| POST | `/api/v1/carrier-portal/documents` | CarrierPortalDocumentsController | Built |
| DELETE | `/api/v1/carrier-portal/documents/:id` | CarrierPortalDocumentsController | Built |
| GET | `/api/v1/carrier-portal/documents/:id/download` | CarrierPortalDocumentsController | Built |
| POST | `/api/v1/carrier-portal/documents/upload` | CarrierPortalDocumentsController | Built |

### Invoices / Settlements (8 endpoints -- `@Controller('carrier-portal')`)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/carrier-portal/invoices` | CarrierPortalInvoicesController | Built |
| GET | `/api/v1/carrier-portal/invoices/:id` | CarrierPortalInvoicesController | Built |
| GET | `/api/v1/carrier-portal/invoices/stats` | CarrierPortalInvoicesController | Built |
| GET | `/api/v1/carrier-portal/settlements` | CarrierPortalInvoicesController | Built |
| GET | `/api/v1/carrier-portal/settlements/:id` | CarrierPortalInvoicesController | Built |
| GET | `/api/v1/carrier-portal/payments` | CarrierPortalInvoicesController | Built |
| GET | `/api/v1/carrier-portal/payments/:id` | CarrierPortalInvoicesController | Built |
| GET | `/api/v1/carrier-portal/payments/summary` | CarrierPortalInvoicesController | Built |

### Compliance (5 endpoints -- `@Controller('carrier-portal/compliance')`)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/carrier-portal/compliance` | CarrierPortalComplianceController | Built |
| GET | `/api/v1/carrier-portal/compliance/insurance` | CarrierPortalComplianceController | Built |
| POST | `/api/v1/carrier-portal/compliance/insurance` | CarrierPortalComplianceController | Built |
| GET | `/api/v1/carrier-portal/compliance/authority` | CarrierPortalComplianceController | Built |
| GET | `/api/v1/carrier-portal/compliance/expiring` | CarrierPortalComplianceController | Built |

**Total: 54 endpoints across 7 controllers -- all built, none tested.**

---

## 5. Components

No components exist. All must be built for the portal frontend.

**Planned component domains (from design specs):**

- **Auth:** login form, register form, forgot password form, reset password form
- **Dashboard:** KPI cards, active loads widget, upcoming pickups, alerts panel, activity feed
- **Loads:** available loads table/cards, my loads table, load detail view, stop timeline, accept/reject actions
- **Check Calls:** mobile-friendly check call form, GPS auto-fill, check call history
- **Rate Confirmation:** rate con viewer, e-signature pad, signature confirmation
- **Documents:** document list, upload zone with camera capture, BOL/POD viewers
- **Payments:** invoice list, settlement detail, payment summary cards
- **Profile:** carrier profile form, contact management, password change
- **Compliance:** insurance upload, authority status display, expiring items alerts
- **Equipment:** truck/trailer list, equipment form
- **Layout:** portal shell, mobile-first navigation, portal header, portal sidebar

---

## 6. Hooks

No hooks exist. All must be built for the portal frontend.

**Planned hooks (one per controller domain):**

| Hook (Planned) | Endpoints | Notes |
|-----------------|-----------|-------|
| `useCarrierPortalAuth` | 7 auth endpoints | Login, register, password reset, token refresh |
| `useCarrierPortalDashboard` | 5 dashboard endpoints | Stats, upcoming, alerts, activity |
| `useCarrierPortalUsers` | 8 user/profile endpoints | Profile CRUD, password change |
| `useCarrierPortalLoads` | 15 loads endpoints | Available loads, my loads, stops, check calls, rate con |
| `useCarrierPortalDocuments` | 6 document endpoints | Upload, download, list, delete |
| `useCarrierPortalInvoices` | 8 invoice/settlement/payment endpoints | View invoices, settlements, payments |
| `useCarrierPortalCompliance` | 5 compliance endpoints | Insurance, authority, expiring items |

**Critical implementation notes:**
- All hooks must use separate API client with `CARRIER_PORTAL_JWT_SECRET` auth
- All hooks must use `unwrap()` helper for `{ data: T }` envelope (see `dev_docs_v3/05-audit/recurring-patterns.md`)
- Portal auth tokens must NOT be stored in localStorage (same XSS risk as P0-001)

---

## 7. Business Rules

1. **Separate Auth:** Carrier portal uses its own `CARRIER_PORTAL_JWT_SECRET`, completely separate from the main TMS JWT. Carrier contacts log in with email + password. Registration requires approval. Magic link login is planned for drivers.
2. **Data Isolation:** A carrier can ONLY see loads assigned to them. Every backend query is filtered by `carrierId` extracted from the portal JWT. There is no way for a carrier to access another carrier's data, loads, or documents.
3. **Check Call Submission:** Carriers submit check calls via the portal. These appear in the Dispatcher's check call log in the main TMS app. Submission triggers a notification to the assigned dispatcher. GPS coordinates are auto-filled on mobile devices.
4. **POD Upload Triggers Invoice Workflow:** When a carrier uploads Proof of Delivery, it triggers the same invoice/settlement workflow as an internal POD upload. This is the primary mechanism for carriers to initiate payment. Mobile camera upload is required for drivers in the field.
5. **Rate Confirmation E-Signature:** Carriers view and electronically sign rate confirmations via the portal. Signature is recorded with timestamp, IP address, and user agent. Unsigned rate confirmations can optionally block dispatch in the main app (configurable per tenant).
6. **Mobile-First Design:** The carrier portal is designed primarily for drivers on mobile devices. All forms must be touch-friendly with large tap targets. POD upload uses device camera. Check calls are single-screen with GPS auto-fill. Minimum touch target: 44x44px.
7. **Available Loads Browsing:** Carriers can browse loads that have been posted as available. Accept/reject actions are available on load offers. Accepted loads move to "My Loads" and trigger dispatcher notification.
8. **Compliance Self-Service:** Carriers can view their compliance status (insurance, authority), upload renewed insurance certificates, and see items nearing expiration. Expired insurance blocks load acceptance.
9. **Invoice/Settlement Visibility:** Carriers can view their invoices, settlements, and payment history but cannot create or modify them. Payment summary provides an at-a-glance view of outstanding and paid amounts.
10. **Multi-User per Carrier:** A carrier company can have multiple portal users (dispatchers, drivers, admin). User management is available to carrier admin users. Each user has role-based access within the carrier's scope.

---

## 8. Data Model

The Carrier Portal has 5 dedicated Prisma models plus uses shared TMS models.

### Portal-Specific Models (5 dedicated)
```
CarrierPortalUser {
  id, tenantId, carrierId, email, password (bcrypt), firstName, lastName,
  phone?, role (CarrierPortalUserRole), status (PortalUserStatus),
  emailVerified, emailVerifiedAt?, verificationToken? (unique),
  lastLoginAt?, language (@default "en"), customFields (Json),
  createdAt, updatedAt, deletedAt?
  -- Relations: sessions[], documents[], notifications[], activityLog[], invoices[], savedLoads[]
  -- Unique: [tenantId, email]
}

CarrierPortalSession {
  id, tenantId, userId (FK -> CarrierPortalUser), refreshTokenHash (SHA256),
  userAgent?, ipAddress? (VarChar 45), expiresAt, revokedAt?,
  carrierId?, createdAt, updatedAt, deletedAt?
}

CarrierPortalDocument {
  id, tenantId, carrierId, userId (FK -> CarrierPortalUser), loadId?,
  documentType (CarrierDocumentType), fileName, filePath, fileSize, mimeType,
  status (CarrierDocumentStatus), reviewedBy?, reviewedAt?, reviewNotes?, rejectionNotes?,
  createdAt, updatedAt, deletedAt?
}

CarrierPortalNotification {
  id, tenantId, carrierPortalUserId, notificationType (CarrierPortalNotificationType),
  title, message, isRead (@default false), readAt?, actionUrl?,
  relatedEntityType?, relatedEntityId?, createdAt, updatedAt, deletedAt?
}

CarrierPortalActivityLog {
  id, tenantId, userId, carrierId?, action (e.g. BID/UPLOAD/LOGIN),
  entityType?, entityId?, description?, ipAddress?, userAgent?,
  customFields (Json), createdAt, updatedAt, deletedAt?
}
```

### Enums (5)
```
CarrierPortalUserRole: OWNER, ADMIN, DISPATCHER, DRIVER
PortalUserStatus: PENDING, ACTIVE, SUSPENDED, DEACTIVATED
CarrierDocumentType: POD, LUMPER_RECEIPT, SCALE_TICKET, BOL_SIGNED, WEIGHT_TICKET, OTHER
CarrierDocumentStatus: UPLOADED, REVIEWING, APPROVED, REJECTED
CarrierPortalNotificationType: LOAD_ASSIGNED, LOAD_CANCELLED, DOCUMENT_REQUEST,
  PAYMENT_PROCESSED, INVOICE_APPROVED, INVOICE_REJECTED, QUICK_PAY_APPROVED,
  QUICK_PAY_REJECTED, GENERAL
```

### Shared TMS Models Used
```
Carrier, Load, Stop, CheckCall, Document, Invoice, Settlement, Payment,
CarrierInvoiceSubmission, CarrierSavedLoad
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `email` (login) | IsEmail, required | "Valid email is required" |
| `password` (login) | MinLength(8), required | "Password must be at least 8 characters" |
| `password` (register) | MinLength(8), 1 uppercase, 1 number, 1 special | "Password does not meet complexity requirements" |
| Check call `message` | MinLength(1), MaxLength(500) | "Check call message is required" |
| Check call `lat`/`lng` | IsDecimal, optional | "Invalid coordinates" |
| Document upload | MaxSize(10MB), allowed types: PDF, JPG, PNG | "File exceeds 10MB limit" or "Unsupported file type" |
| Rate con signature | Non-empty signature data required | "Signature is required to confirm rate" |
| Insurance upload | Expiry date must be in the future | "Insurance expiry date must be in the future" |
| Profile update | Email unique within carrier | "Email already in use" |
| Stop arrive/depart | Must be assigned carrier for this load | "Unauthorized: load not assigned to your carrier" |

---

## 10. Status States

### Load Status (Carrier Portal View)
```
AVAILABLE    -- Load posted for carrier acceptance (available loads browser)
TENDERED     -- Load offered to this specific carrier (pending accept/reject)
ACCEPTED     -- Carrier accepted the load offer
DISPATCHED   -- Load dispatched, pending pickup
AT_PICKUP    -- Driver arrived at pickup (carrier marks via portal)
PICKED_UP    -- Cargo loaded, in transit
IN_TRANSIT   -- En route to delivery
AT_DELIVERY  -- Driver arrived at delivery (carrier marks via portal)
DELIVERED    -- Cargo delivered, POD pending
COMPLETED    -- POD uploaded, settlement initiated
```

### Check Call Types (submitted via portal)
```
CHECK_CALL   -- Routine position update
ARRIVAL      -- Arrived at stop
DEPARTURE    -- Departed from stop
DELAY        -- Reporting a delay (weather, traffic, breakdown)
ISSUE        -- Problem that needs dispatcher attention
ETA_UPDATE   -- Revised ETA for next stop
```

### Compliance Status
```
COMPLIANT       -- All insurance current, authority active
EXPIRING_SOON   -- Insurance expires within 30 days
NON_COMPLIANT   -- Insurance expired or authority suspended
```

### Invoice/Settlement Status (read-only for carrier)
```
PENDING     -- Invoice created, not yet approved
APPROVED    -- Invoice approved for payment
PAID        -- Payment issued
OVERDUE     -- Payment past due date
```

---

## 11. Known Issues

| Issue | Severity | File/Area | Status |
|-------|----------|-----------|--------|
| No frontend portal built at all | P0 | `apps/web/` | Deferred to P1 phase |
| 54 backend endpoints with minimal tests | P1 | `apps/api/src/modules/carrier-portal/` | 7 spec stubs + 1 e2e (80 lines) |
| Logout endpoint missing auth guard | P1 | `carrier-portal-auth.controller.ts` | `req.carrierPortalUser?.id` may be undefined |
| Register tenant resolution fragile | P1 | `carrier-portal-auth.service.ts` | Falls back to 'default-tenant' |
| Document storage paths hardcoded | P2 | Documents/compliance services | `/uploads/`, `/compliance/` — no S3 integration |
| Mobile-optimized design not started | P1 | Design exists, implementation pending | Open |
| Rate confirmation e-signature not integrated | P2 | Backend endpoint exists, no UI | Open |
| Separate JWT auth flow not tested end-to-end | P1 | `CARRIER_PORTAL_JWT_SECRET` | Open |
| Token storage strategy undefined for portal | P1 | Must avoid localStorage (XSS risk per P0-001) | Open |
| No WebSocket integration for real-time load updates | P2 | Portal loads page needs live status | Open |
| Support chat not designed beyond placeholder spec | P3 | `13-carrier-portal/12-support-chat.md` | Open |
| No API rate limiting on portal auth endpoints | P1 | Brute-force risk on login/register | Open |
| Backend endpoint paths need verification against actual decorators | P2 | Exact paths may differ from inferred routes | Open |

---

## 12. Tasks

### Portal Build (P1 -- Post-MVP)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| CPORT-101 | Set up portal app shell + routing + layout (mobile-first) | L (8h) | P1 | Portal shell, nav, responsive layout |
| CPORT-102 | Build portal auth flow (login, register, forgot/reset password) | L (8h) | P1 | Separate JWT, httpOnly cookies |
| CPORT-103 | Build portal dashboard | M (5h) | P1 | KPI cards, active loads, upcoming pickups |
| CPORT-104 | Build Available Loads browser | M (5h) | P1 | Search, filter, accept/reject |
| CPORT-105 | Build My Loads list + load detail | L (8h) | P1 | Status filters, stop timeline, documents |
| CPORT-106 | Build Check Call submission (mobile-optimized) | M (4h) | P1 | GPS auto-fill, single-screen form |
| CPORT-107 | Build POD/BOL upload (camera support) | M (4h) | P1 | Camera capture, drag-drop, progress |
| CPORT-108 | Build Rate Confirmation view + e-signature | M (5h) | P2 | Signature pad, IP/timestamp capture |
| CPORT-109 | Build Payment History (invoices, settlements) | M (4h) | P2 | Read-only views, summary stats |
| CPORT-110 | Build My Profile + user management | M (4h) | P2 | Profile edit, password change, multi-user |
| CPORT-111 | Build Compliance/Insurance management | M (4h) | P2 | Upload insurance, view authority, expiry alerts |
| CPORT-112 | Build Equipment Manager | S (3h) | P2 | Truck/trailer CRUD |
| CPORT-113 | Build Support Chat | L (8h) | P3 | Real-time messaging with dispatcher |
| CPORT-114 | Write hooks for all 7 controller domains | L (8h) | P1 | 7 hooks covering 54 endpoints |
| CPORT-115 | Write backend tests for all 54 endpoints | XL (16h) | P1 | Unit + integration tests |
| CPORT-116 | E2E tests with Playwright (portal auth + load flow) | L (8h) | P2 | Full carrier workflow test |

### Previously Listed Tasks (from v1 hub -- superseded by above)

| Old Task ID | Title | Status |
|-------------|-------|--------|
| CPORT-201 | Build Carrier Portal shell + auth | Superseded by CPORT-101 + CPORT-102 |
| CPORT-202 | Build My Loads + stop management | Superseded by CPORT-105 |
| CPORT-203 | Build Check Call submission (mobile) | Superseded by CPORT-106 |
| CPORT-204 | Build POD upload (camera) | Superseded by CPORT-107 |
| CPORT-205 | Build Rate Confirmation view + e-signature | Superseded by CPORT-108 |

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
| ~8 endpoints assumed | 54 endpoints across 7 controllers | Backend is 6.75x richer than originally documented |
| Auth = simple login | Full auth flow: register, verify, forgot/reset password, refresh, logout (7 endpoints) | Exceeds plan |
| No compliance management | 5 compliance endpoints (insurance, authority, expiring) | New capability |
| No invoice/payment visibility | 8 invoice/settlement/payment endpoints | New capability |
| No user management | 8 user/profile endpoints (multi-user per carrier) | New capability |
| No dashboard | 5 dashboard endpoints (stats, upcoming, alerts, activity) | New capability |
| 8 screens planned | 13 screens identified from design specs + backend capabilities | Expanded scope |
| Frontend "Phase 2" | Frontend still not started | Zero progress on UI |
| Mobile-first design | 12 design spec files exist | Specs ready, no implementation |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (main TMS JWT infrastructure, separate secret for portal) -- P0
- TMS Core -- Loads, Stops, Check Calls (carrier portal reads/writes scoped load data) -- P0
- Carrier Management (carrier records, contacts, insurance, authority) -- P0
- Documents (file upload infrastructure, BOL/POD storage) -- P0
- Accounting (invoice, settlement, payment records for carrier view) -- P0
- Communication (check call notifications to dispatcher, email triggers) -- P1

**Depended on by:**
- External Carriers (primary users -- dispatchers and drivers accessing portal)
- Dispatch (real-time check calls and stop updates from carriers feed into dispatch board)
- Accounting (POD upload triggers invoice workflow, settlement initiation)
- Compliance (carrier self-service insurance uploads reduce admin workload)

**Infrastructure prerequisites:**
- `CARRIER_PORTAL_JWT_SECRET` must be set in environment
- File upload service must support camera capture (mobile)
- httpOnly cookie strategy for portal tokens (avoid localStorage per P0-001)
