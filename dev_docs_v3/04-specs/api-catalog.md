# API Catalog — Ultra TMS

> Format: API-CATALOG-GENERATOR
> Last updated: 2026-03-07
> Source: Scanned from `apps/api/src/modules/*/controllers/*.controller.ts`
> **Note:** Use `localhost:3001/api-docs` (Swagger) when API is running for full interactive catalog.

---

## Header

| Metric | Value |
|--------|-------|
| Total endpoints (estimated) | ~500+ across 35 modules |
| P0 Production endpoints | ~250 |
| Stub endpoints | ~100 |
| Not built (needed by frontend) | 8 (see Missing Endpoints) |
| Swagger coverage | ~80% (global controller comments, not per-endpoint) |
| Last verified | 2026-03-07 |

---

## Summary by Module

| Module | Total Routes | Production | Stub | Status | Notes |
|--------|-------------|-----------|------|--------|-------|
| `operations` | 62 | 55 | 7 | P0 — Good | Orders, Loads, Stops, Check Calls, Dashboard, Tracking |
| `tms` | 45 | 40 | 5 | P0 — Good | Dispatch, Rate Confirmation, Reports |
| `carrier` | 50 | 45 | 5 | P0 — Good | Carriers, TruckTypes, Performance, FMCSA |
| `crm` | 49 | 45 | 4 | P0 — Good | Companies, Contacts, Opportunities, Activities |
| `sales` | 47 | 42 | 5 | P0 — Good | Quotes, AI Extraction, Rate Tables |
| `auth` | 34 | 30 | 4 | P0 — Good | Auth, Users, Roles, Permissions, Tenants, Audit |
| `accounting` | 54 | 35 | 19 | P0 — Partial | Dashboard MISSING; others partial |
| `commission` | 28 | 15 | 13 | P0 — Partial | Stats, plans, payments partial |
| `load-board` | 62 | 0 | 62 | P0 — All Stub | External API integration not built |
| `claims` | ~35 | ~20 | ~15 | P1 — Partial | |
| `documents` | ~15 | ~10 | ~5 | P1 — Partial | |
| `communication` | ~25 | ~15 | ~10 | P1 — Partial | |
| `customer-portal` | ~35 | ~20 | ~15 | P1 — Partial | |
| `carrier-portal` | ~35 | ~20 | ~15 | P1 — Partial | |
| `contracts` | ~40 | ~25 | ~15 | P1 — Partial | |
| `credit` | ~25 | ~15 | ~10 | P2 — Partial | |
| `factoring` | ~25 | ~15 | ~10 | P2 — Partial | |
| `agents` | ~30 | ~20 | ~10 | P2 — Partial | |
| `analytics` | ~20 | ~10 | ~10 | P2 — Partial | |
| `workflow` | ~20 | ~10 | ~10 | P2 — Partial | |
| `search` | ~20 | ~10 | ~10 | P2 — Partial | |
| `health` | 1 | 1 | 0 | P3 — Production | Health check (now secured) |
| `email` | 0 | 0 | 0 | P3 — Service only | No controller |
| `redis` | 0 | 0 | 0 | P3 — Service only | No controller |
| `storage` | 0 | 0 | 0 | P3 — Service only | No controller |
| Other P3 modules | ~120 | ~60 | ~60 | P3 — Partial | hr, safety, edi, scheduler, config, audit, etc. |

---

## Summary by HTTP Method (P0 Modules)

| Method | Estimated Count | Common Use |
|--------|----------------|-----------|
| GET | ~180 | List + Detail + Dashboard endpoints |
| POST | ~80 | Create + Auth + Actions (assign, convert) |
| PATCH | ~70 | Update (partial) |
| PUT | ~20 | Replace (bulk operations, permissions matrix) |
| DELETE | ~30 | Soft delete + hard delete |
| **Total P0** | **~380** | |

---

## P0 Endpoints — Operations Module (62 routes)

Base path: `/api/v1/`

### Orders

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/orders` | Production | JWT | List with pagination, filters |
| GET | `/orders/:id` | Production | JWT | Order detail |
| POST | `/orders` | Production | JWT | Create order |
| PATCH | `/orders/:id` | Production | JWT | Update order |
| DELETE | `/orders/:id` | Production | JWT | Hard delete — QS-002 adds soft delete |
| GET | `/orders/:id/timeline` | Production | JWT | Status history |
| GET | `/orders/:id/notes` | Production | JWT | Order notes |
| POST | `/orders/:id/notes` | Production | JWT | Add note |
| POST | `/orders/bulk-status` | Production | JWT | Bulk status update — no FE yet |
| POST | `/orders/export` | Production | JWT | Export orders — no FE yet |

### Loads

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/loads` | Production | JWT | List with filters |
| GET | `/loads/:id` | Production | JWT | Load detail |
| POST | `/loads` | Production | JWT | Create load |
| PATCH | `/loads/:id` | Production | JWT | Update load |
| DELETE | `/loads/:id` | Production | JWT | Soft delete |
| GET | `/loads/:id/stops` | Production | JWT | Load stops |
| GET | `/loads/:id/checkcalls` | Production | JWT | Check call history |
| GET | `/loads/:id/rate-confirmation` | Production | JWT | PDF blob download |
| POST | `/loads/:id/assign-carrier` | Production | JWT | Assign carrier to load |
| POST | `/loads/:id/unassign-carrier` | Production | JWT | Unassign carrier |
| POST | `/loads/export` | Production | JWT | Export loads — no FE yet |

### Stops

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/stops` | Production | JWT | List stops (filtered by load) |
| GET | `/stops/:id` | Production | JWT | Stop detail |
| PATCH | `/stops/:id` | Production | JWT | Update stop |
| PATCH | `/stops/:id/arrive` | Production | JWT | Mark arrived |
| PATCH | `/stops/:id/depart` | Production | JWT | Mark departed |
| POST | `/stops/reorder` | Production | JWT | Reorder stops — no drag UI yet |

### Check Calls

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/checkcalls` | Production | JWT | List (filtered by loadId) |
| GET | `/checkcalls/:id` | Production | JWT | Check call detail |
| POST | `/checkcalls` | Production | JWT | Create check call |
| GET | `/checkcalls/overdue` | Production | JWT | Overdue calls — dashboard only |
| POST | `/checkcalls/bulk` | Production | JWT | Bulk create — no FE yet |

### Operations Dashboard

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/operations/dashboard` | Production | JWT | KPI metrics |
| GET | `/operations/charts` | Production | JWT | Chart data |
| GET | `/operations/alerts` | Production | JWT | Active alerts |
| GET | `/operations/activity` | Production | JWT | Activity feed |

### Tracking

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/tracking/positions` | Production | JWT | Current positions for loads |
| GET | `/tracking/public/:trackingNumber` | Production | Public | Customer tracking (no auth) |

---

## P0 Endpoints — Auth Module (34 routes)

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| POST | `/auth/login` | Production | Public | Returns JWT cookie |
| POST | `/auth/logout` | Production | JWT | Clears JWT cookie |
| POST | `/auth/register` | Production | Public | Creates new user (frontend stub) |
| GET | `/auth/me` | Production | JWT | Current user profile |
| PATCH | `/auth/me` | Production | JWT | Update profile |
| POST | `/auth/forgot-password` | Production | Public | Send reset email (frontend stub) |
| POST | `/auth/reset-password` | Production | Public | Reset with token (frontend stub) |
| POST | `/auth/mfa/enable` | Production | JWT | Returns QR code |
| POST | `/auth/mfa/verify` | Production | JWT | Verify TOTP code |
| DELETE | `/auth/mfa/disable` | Production | JWT | Disable MFA |
| GET | `/admin/users` | Production | JWT+Admin | User list |
| GET | `/admin/users/:id` | Production | JWT+Admin | User detail |
| POST | `/admin/users` | Production | JWT+Admin | Create user |
| PATCH | `/admin/users/:id` | Production | JWT+Admin | Update user |
| DELETE | `/admin/users/:id` | Production | JWT+Admin | Deactivate user |
| GET | `/admin/roles` | Production | JWT+Admin | Roles list |
| POST | `/admin/roles` | Production | JWT+Admin | Create role |
| PATCH | `/admin/roles/:id` | Production | JWT+Admin | Update role |
| GET | `/admin/permissions` | Production | JWT+Admin | Permissions matrix |
| PUT | `/admin/permissions` | Production | JWT+Admin | Update permissions |
| GET | `/admin/tenants` | Production | JWT+SuperAdmin | Tenants list |
| GET | `/admin/audit-logs` | Production | JWT+Admin | Audit log list |

---

## P0 Endpoints — CRM Module (49 routes)

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/crm/customers` | Production | JWT | Company list |
| GET | `/crm/customers/:id` | Production | JWT | Company detail |
| POST | `/crm/customers` | Production | JWT | Create company |
| PATCH | `/crm/customers/:id` | Production | JWT | Update company |
| DELETE | `/crm/customers/:id` | Production | JWT | Soft delete |
| GET | `/crm/contacts` | Production | JWT | Contacts list |
| GET | `/crm/contacts/:id` | Production | JWT | Contact detail |
| POST | `/crm/contacts` | Production | JWT | Create contact |
| PATCH | `/crm/contacts/:id` | Production | JWT | Update contact |
| DELETE | `/crm/contacts/:id` | Production | JWT | Soft delete — no FE delete button yet |
| GET | `/crm/opportunities` | Production | JWT | Leads list |
| GET | `/crm/opportunities/:id` | Production | JWT | Lead detail |
| POST | `/crm/opportunities` | Production | JWT | Create lead |
| PATCH | `/crm/opportunities/:id` | Production | JWT | Update lead / move stage |
| DELETE | `/crm/opportunities/:id` | Production | JWT | Soft delete — no FE delete button yet |
| GET | `/crm/opportunities/pipeline` | Production | JWT | Pipeline view data |
| POST | `/crm/opportunities/:id/convert` | Production | JWT | Convert lead to customer — no FE button |
| GET | `/crm/activities` | Production | JWT | Activities list |
| POST | `/crm/activities` | Production | JWT | Log activity |

---

## P0 Endpoints — Carriers Module (50 routes)

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/carriers` | Production | JWT | Carrier list |
| GET | `/carriers/:id` | Production | JWT | Carrier detail — page.tsx MISSING (P0-003) |
| POST | `/carriers` | Production | JWT | Create carrier |
| PATCH | `/carriers/:id` | Production | JWT | Update carrier |
| DELETE | `/carriers/:id` | Production | JWT | Soft delete |
| GET | `/carriers/:id/loads` | Production | JWT | Load history |
| GET | `/carriers/:id/performance` | Partial | JWT | CSA/performance — returns zeros (QS-004) |
| GET | `/carriers/fmcsa/:dot` | Production | JWT | FMCSA DOT lookup + cache |
| GET | `/truck-types` | Production | JWT | Truck types list — PROTECTED |
| POST | `/truck-types` | Production | JWT | Create truck type — PROTECTED |
| PATCH | `/truck-types/:id` | Production | JWT | Update truck type — PROTECTED |
| DELETE | `/truck-types/:id` | Production | JWT | Delete truck type — PROTECTED |

---

## P0 Endpoints — Accounting Module (54 routes)

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| **GET** | **`/accounting/dashboard`** | **MISSING** | JWT | **QS-003 — must build** |
| GET | `/accounting/invoices` | Partial | JWT | Invoice list |
| GET | `/accounting/invoices/:id` | Partial | JWT | Invoice detail |
| POST | `/accounting/invoices` | Partial | JWT | Create invoice |
| PATCH | `/accounting/invoices/:id` | Partial | JWT | Update invoice |
| GET | `/accounting/settlements` | Partial | JWT | Settlement list |
| GET | `/accounting/settlements/:id` | Partial | JWT | Settlement detail |
| PATCH | `/accounting/settlements/:id` | Partial | JWT | Approve/pay settlement |
| GET | `/accounting/payments` | Partial | JWT | Payment list |
| POST | `/accounting/payments` | Partial | JWT | Record payment |
| GET | `/accounting/reports/aging` | MISSING | JWT | Aging report — backlog |

---

## P0 Endpoints — Sales Module (47 routes)

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/sales/quotes` | Production | JWT | Quote list |
| GET | `/sales/quotes/:id` | Production | JWT | Quote detail |
| POST | `/sales/quotes` | Production | JWT | Create quote |
| PATCH | `/sales/quotes/:id` | Production | JWT | Update quote |
| DELETE | `/sales/quotes/:id` | Production | JWT | Soft delete |
| POST | `/sales/ai/extract-cargo` | Production | JWT | AI cargo extraction — PROTECTED |
| GET | `/maps` | Production | JWT | Google Maps integration — PROTECTED |
| GET | `/sales/rate-tables` | Production | JWT | Rate tables |
| POST | `/sales/quotes/:id/convert` | Production | JWT | Convert quote to order |

---

## Screen-to-Endpoint Mapping

Key screens and the endpoints they require — all must exist for screen to function:

| Screen | Route | Required Endpoints | All Exist? |
|--------|-------|-------------------|-----------|
| Dashboard | `/dashboard` | `GET /operations/dashboard`, `GET /checkcalls/overdue` | Partial (dashboard stub) |
| Carriers List | `/carriers` | `GET /carriers`, `DELETE /carriers/:id` | Yes |
| Carrier Detail | `/carriers/[id]` | `GET /carriers/:id`, `GET /carriers/:id/drivers`, `GET /carriers/:id/insurances` | Yes |
| Carrier Scorecard | `/carriers/[id]/scorecard` | `GET /carriers/:id/scorecard` | Yes (stub data) |
| Orders List | `/operations/orders` | `GET /orders` | Yes |
| Order Detail | `/operations/orders/[id]` | `GET /orders/:id`, `GET /orders/:id/loads` | Yes |
| Loads List | `/operations/loads` | `GET /loads` | Yes |
| Load Detail | `/operations/loads/[id]` | `GET /loads/:id`, `GET /loads/:id/stops`, `GET /loads/:id/rate-con` | Yes |
| Dispatch Board | `/operations/dispatch` | `GET /loads?status=active`, `WS /dispatch` | Partial (WS missing) |
| Tracking Map | `/operations/tracking` | `GET /loads?status=in-transit`, `WS /tracking` | Partial (WS missing) |
| Quotes List | `/quotes` | `GET /sales/quotes` | Yes |
| Quote Detail | `/quotes/[id]` | `GET /sales/quotes/:id` | Yes |
| CRM Customers | `/customers` | `GET /crm/customers` | Yes |
| CRM Customer Detail | `/customers/[id]` | `GET /crm/customers/:id`, `GET /crm/customers/:id/contacts` | Yes |
| CRM Leads | `/leads` | `GET /crm/opportunities` | Yes |
| CRM Contacts | `/contacts` | `GET /crm/contacts` | Yes |
| Accounting Dashboard | `/accounting` | `GET /accounting/dashboard` | **NO — QS-003** |
| Invoices List | `/accounting/invoices` | `GET /accounting/invoices` | Yes |
| Invoice Detail | `/accounting/invoices/[id]` | `GET /accounting/invoices/:id` | Yes |
| Settlements | `/accounting/settlements` | `GET /accounting/settlements` | Yes |
| Payments | `/accounting/payments` | `GET /accounting/payments` | Yes |
| Aging Report | `/accounting/reports/aging` | `GET /accounting/reports/aging` | **NO — Backlog** |
| Commission Dashboard | `/commissions` | `GET /commissions/dashboard` | Partial (stub) |
| Load Board | `/load-board` | `GET /load-board/search`, `POST /load-board/post` | Partial (stub endpoints) |
| Profile | `/profile` | `GET /auth/me`, `PATCH /auth/me` | Yes (page stub — QS-005) |
| Admin Users | `/admin/users` | `GET /admin/users`, `POST /admin/users`, `DELETE /admin/users/:id` | Yes |

---

## Missing Endpoints Summary

| Endpoint | Service | Priority | Task | Impact |
|----------|---------|----------|------|--------|
| `GET /accounting/dashboard` | Accounting | P0 | QS-003 | Blocks entire accounting dashboard screen |
| `GET /accounting/reports/aging` | Accounting | P1 | Backlog | Blocks aging report screen |
| `GET /carriers/csa/:carrierId` (real) | Carriers | P1 | QS-004 | Carrier scorecard shows zeros |
| `WS /dispatch` namespace | TMS Core | P0 | QS-001 | Dispatch Board has no real-time |
| `WS /tracking` namespace | TMS Core | P1 | QS-001 | Tracking Map has no real-time |
| `WS /notifications` namespace | All | P1 | QS-001 | Notification bell never updates |
| `WS /dashboard` namespace | Operations | P2 | QS-001 | Dashboard KPIs need real-time |
| `POST /load-board/post` (real) | Load Board | P1 | Backlog | All load-board endpoints are stubs |

---

## Unused Endpoints (No Frontend Consumer)

These endpoints exist in the backend but no screen uses them yet:

| Endpoint | Notes |
|----------|-------|
| `POST /orders/bulk-status` | No bulk action UI |
| `POST /orders/export` | No export button |
| `POST /loads/export` | No export button |
| `GET /checkcalls/overdue` | Used in dashboard only, not its own screen |
| `POST /checkcalls/bulk` | No bulk UI |
| `POST /stops/reorder` | No drag-to-reorder UI |
| `POST /crm/opportunities/:id/convert` | Convert button missing in FE (BUG-011) |
| `DELETE /crm/contacts/:id` | Delete button missing in FE (BUG-009) |
| `DELETE /crm/opportunities/:id` | Delete button missing in FE (BUG-010) |

---

## Response Envelope Pattern (MANDATORY)

All responses MUST follow this shape:

```typescript
// Single item
{ data: T, message?: string }

// List with pagination
{
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}

// Error
{ error: string, code: string, details?: object }
```

Frontend hooks MUST unwrap: `response.data.data` (not `response.data`)

---

## Authentication & Authorization

### JWT Flow

```
POST /auth/login → JWT set as HttpOnly cookie
→ All subsequent requests send cookie automatically
→ JwtAuthGuard validates globally (APP_GUARD)
→ @Public() bypasses for login/register/reset-pw
→ @Roles() restricts to specific roles
```

### Role Matrix (P0 Endpoints)

| Endpoint Pattern | Super Admin | Admin | Manager | Dispatcher | Sales | Accounting | Viewer |
|-----------------|:-----------:|:-----:|:-------:|:----------:|:-----:|:----------:|:------:|
| GET /admin/* | ✓ | ✓ | - | - | - | - | - |
| POST/PATCH /admin/users | ✓ | ✓ | - | - | - | - | - |
| GET /crm/* | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| POST/PATCH /crm/* | ✓ | ✓ | ✓ | - | ✓ | - | - |
| GET /orders, /loads | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| POST/PATCH /orders, /loads | ✓ | ✓ | ✓ | ✓ | - | - | - |
| GET /accounting/* | ✓ | ✓ | ✓ | - | - | ✓ | - |
| POST/PATCH /accounting/* | ✓ | ✓ | - | - | - | ✓ | - |
| GET /carriers | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| POST/PATCH /carriers | ✓ | ✓ | ✓ | - | - | - | - |
| GET /truck-types | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| POST/PATCH /truck-types | ✓ | ✓ | - | - | - | - | - |

---

## DTO Validation Coverage (P0 Modules)

| Module | Total DTOs | With Validation | Without | Coverage |
|--------|-----------|-----------------|---------|----------|
| auth | ~15 | ~13 | ~2 | ~87% |
| crm | ~20 | ~18 | ~2 | ~90% |
| sales | ~15 | ~14 | ~1 | ~93% |
| operations | ~25 | ~22 | ~3 | ~88% |
| carrier | ~18 | ~16 | ~2 | ~89% |
| accounting | ~20 | ~14 | ~6 | ~70% |
| commission | ~12 | ~8 | ~4 | ~67% |
| **P0 Overall** | **~125** | **~105** | **~20** | **~84%** |

Validation applied via `class-validator` decorators + global `ValidationPipe(whitelist: true, transform: true)`.

---

## API Endpoint Status Tracking

Columns: DB (database ready) | API (endpoint exists) | FE (frontend connected) | INT (integration tested) | VER (runtime verified)

| Endpoint | DB | API | FE | INT | VER |
|----------|----|----|----|----|-----|
| GET /auth/me | ✓ | ✓ | ✓ | ✓ | No |
| POST /auth/login | ✓ | ✓ | ✓ | ✓ | No |
| GET /crm/customers | ✓ | ✓ | ✓ | ✓ | No |
| GET /orders | ✓ | ✓ | ? | ✓ | No |
| GET /loads | ✓ | ✓ | ? | ✓ | No |
| GET /carriers | ✓ | ✓ | ✓ | ✓ | No |
| GET /accounting/dashboard | ✓ | ✗ | ✗ | ✗ | No |
| WS /dispatch | ✓ | ✗ | ✗ | ✗ | No |

**VER = No** for all endpoints: QS-008 will verify runtime state of all P0 endpoints.

---

## Swagger Access

When API is running: `http://localhost:3001/api-docs`

All controllers are decorated with `@ApiTags('{service}')`. Swagger auto-generates from NestJS decorators.

For detailed endpoint parameters, request/response shapes, and examples — use Swagger rather than this catalog (it reads from live code, not static docs).
