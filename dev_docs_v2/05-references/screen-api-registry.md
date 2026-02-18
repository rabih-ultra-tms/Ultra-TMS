# Screen-to-API Contract Registry

> **Generated:** February 18, 2026
> **Source:** Validated against actual `apiClient.*()` calls in `apps/web/lib/hooks/`
> **Coverage:** 47 MVP routes, 50 hook files, ~200 API calls

---

## How to Read This Document

Each screen section shows:
- **Route** — the Next.js page URL
- **Hook File** — the React Query hook that makes the API call
- **Endpoints** — every HTTP call the screen makes, with method, path, params, and response shape

**Response envelope:** All endpoints return `{ data: T }` for single items or `{ data: T[], pagination: { page, limit, total, totalPages } }` for lists. Hooks call `unwrap()` to extract `.data` automatically.

**Base URL:** `apiClient` prepends `/api/v1` — so `/orders` becomes `GET /api/v1/orders`.

---

## Table of Contents

1. [Auth & Admin](#1-auth--admin)
2. [CRM / Customers](#2-crm--customers)
3. [Sales / Quotes](#3-sales--quotes)
4. [TMS Core — Orders](#4-tms-core--orders)
5. [TMS Core — Loads](#5-tms-core--loads)
6. [TMS Core — Stops](#6-tms-core--stops)
7. [TMS Core — Dispatch](#7-tms-core--dispatch)
8. [TMS Core — Tracking](#8-tms-core--tracking)
9. [Operations Dashboard](#9-operations-dashboard)
10. [Carriers](#10-carriers)
11. [Accounting](#11-accounting)
12. [Commissions](#12-commissions)
13. [Documents](#13-documents)
14. [Communication / Email](#14-communication--email)
15. [Load Board](#15-load-board)
16. [Load History](#16-load-history)
17. [Load Planner](#17-load-planner-protected)

---

## 1. Auth & Admin

### Login (`/login`)
**Hook:** `lib/hooks/use-auth.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Login | POST | `/auth/login` | `{ email, password, tenantId }` | `{ accessToken, refreshToken, expiresIn }` |
| MFA verify | POST | `/auth/mfa/verify` | `{ email, code, tenantId }` | `LoginResponse` |
| Register | POST | `/auth/register` | `RegisterRequest` | — |
| Logout | POST | `/auth/logout` | — | — |
| Forgot password | POST | `/auth/forgot-password` | `{ email }` | — |
| Reset password | POST | `/auth/reset-password` | `{ token, newPassword }` | — |
| Change password | POST | `/auth/change-password` | `{ oldPassword, newPassword }` | — |
| Enable MFA | POST | `/auth/mfa/enable` | `{ password }` | `{ secret, qrCode }` |
| Confirm MFA | POST | `/auth/mfa/confirm` | `{ code }` | — |
| Disable MFA | POST | `/auth/mfa/disable` | `{ password }` | — |
| Get current user | GET | `/auth/me` | — | `User` |
| List sessions | GET | `/auth/sessions` | — | `Session[]` |
| Delete session | DELETE | `/auth/sessions/:sessionId` | — | — |
| Delete all sessions | DELETE | `/auth/sessions` | — | — |
| Logout all | POST | `/auth/logout-all` | — | — |

### User Management (`/admin/users`)
**Hook:** `lib/hooks/admin/use-users.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List users | GET | `/users` | `?page, ?limit, ?search, ?status, ?roleId` | `PaginatedResponse<User>` |
| Get user | GET | `/users/:id` | — | `User` |
| Create user | POST | `/users` | `{ email, firstName, lastName, password, roleId, sendInvite }` | `User` |
| Update user | PUT | `/users/:id` | `UserUpdateData` | `User` |
| Toggle status | POST | `/users/:id/activate` or `/users/:id/deactivate` | — | — |
| Update roles | PATCH | `/users/:id/roles` | `{ roleIds }` | — |
| Reset password | POST | `/users/:id/reset-password` | — | — |

### Roles (`/admin/roles`)
**Hook:** `lib/hooks/admin/use-roles.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List roles | GET | `/roles` | — | `Role[]` |
| Get role | GET | `/roles/:id` | — | `Role` |
| List permissions | GET | `/roles/permissions` | — | `Permission[]` |
| Create role | POST | `/roles` | `{ name, description, permissions }` | `Role` |
| Update role | PUT | `/roles/:id` | `{ name, description, permissions }` | `Role` |
| Delete role | DELETE | `/roles/:id` | — | — |

### Tenant Settings (`/admin/settings`)
**Hook:** `lib/hooks/admin/use-tenant.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get tenant | GET | `/tenant` | — | `Tenant` |
| Get settings | GET | `/tenant/settings` | — | `TenantSettings` |
| Update tenant | PUT | `/tenant` | `TenantData` | — |
| Update settings | PUT | `/tenant/settings` | `SettingsData` | — |

### Security / Sessions (`/admin/audit-logs`)
**Hook:** `lib/hooks/admin/use-security-log.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List sessions | GET | `/sessions` | — | `SessionLog[]` |
| Delete session | DELETE | `/sessions/:sessionId` | — | — |
| Logout all | POST | `/auth/logout-all` | — | — |

---

## 2. CRM / Customers

### Companies List (`/companies`)
**Hook:** `lib/hooks/crm/use-customers.ts` + `lib/hooks/crm/use-companies.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List companies | GET | `/crm/companies` | `?page, ?limit, ?search, ?status, ?accountManagerId, ?companyType=CUSTOMER` | `PaginatedResponse<Customer>` |
| Get company | GET | `/crm/companies/:id` | — | `Customer` |
| Create company | POST | `/crm/companies` | `{ companyName, status, companyType: "CUSTOMER", ... }` | `Customer` |
| Update company | PATCH | `/crm/companies/:id` | `Partial<Customer>` | `Customer` |
| Delete company | DELETE | `/crm/companies/:id` | — | — |

### Contacts (`/contacts`)
**Hook:** `lib/hooks/crm/use-contacts.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List contacts | GET | `/crm/contacts` | `?page, ?limit, ?search, ?companyId` | `PaginatedResponse<Contact>` |
| Get contact | GET | `/crm/contacts/:id` | — | `Contact` |
| Create contact | POST | `/crm/contacts` | `Partial<Contact>` | `Contact` |
| Update contact | PATCH | `/crm/contacts/:id` | `Partial<Contact>` | `Contact` |
| Delete contact | DELETE | `/crm/contacts/:id` | — | — |

### Leads / Opportunities (`/leads`)
**Hook:** `lib/hooks/crm/use-leads.ts`

> **Note:** Frontend calls them "Leads" but the API uses `/crm/opportunities`.

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List leads | GET | `/crm/opportunities` | `?page, ?limit, ?search, ?status, ?stage` | `PaginatedResponse<Lead>` |
| Get pipeline | GET | `/crm/opportunities/pipeline` | — | `Record<string, Lead[]>` |
| Get lead | GET | `/crm/opportunities/:id` | — | `Lead` |
| Create lead | POST | `/crm/opportunities` | `Partial<Lead>` | `Lead` |
| Update stage | PATCH | `/crm/opportunities/:id/stage` | `{ stage }` | — |
| Delete lead | DELETE | `/crm/opportunities/:id` | — | — |
| Convert to customer | POST | `/crm/opportunities/:id/convert` | `ConvertData` | — |

### Activities (`/activities`)
**Hook:** `lib/hooks/crm/use-activities.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List activities | GET | `/crm/activities` | `?page, ?limit, ?type, ?entityType, ?entityId, ?companyId` | `PaginatedResponse<Activity>` |
| Get activity | GET | `/crm/activities/:id` | — | `Activity` |
| Create activity | POST | `/crm/activities` | `{ type, subject, notes, entityType, entityId, ... }` | `Activity` |
| Update activity | PATCH | `/crm/activities/:id` | `Partial<Activity>` | `Activity` |
| Delete activity | DELETE | `/crm/activities/:id` | — | — |

---

## 3. Sales / Quotes

### Quotes List (`/quotes`)
**Hook:** `lib/hooks/sales/use-quotes.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List quotes | GET | `/quotes` | `?page, ?limit, ?search, ?status, ?customerId, ?serviceType, ?fromDate, ?toDate, ?sortBy, ?sortOrder` | `QuoteListResponse` |
| Get stats | GET | `/quotes/stats` | — | `QuoteStats` |
| Delete quote | DELETE | `/quotes/:id` | — | — |
| Clone quote | POST | `/quotes/:id/clone` | — | `Quote` |
| Send quote | POST | `/quotes/:id/send` | — | `Quote` |
| Convert to order | POST | `/quotes/:id/convert` | — | `{ orderId, orderNumber }` |
| Accept quote | POST | `/quotes/:id/accept` | — | `Quote` |
| Reject quote | POST | `/quotes/:id/reject` | `{ reason }` | `Quote` |
| Create version | POST | `/quotes/:id/version` | — | `Quote` |
| Calculate rate | POST | `/quotes/calculate-rate` | `CalculateRateParams` | `CalculateRateResponse` |

### Quote Detail (`/quotes/:id`)
**Hook:** `lib/hooks/sales/use-quotes.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get quote | GET | `/quotes/:id` | — | `QuoteDetail` |
| Get versions | GET | `/quotes/:id/versions` | — | `QuoteVersion[]` |
| Get timeline | GET | `/quotes/:id/timeline` | — | `QuoteTimelineEvent[]` |
| Get notes | GET | `/quotes/:id/notes` | — | `QuoteNote[]` |
| Add note | POST | `/quotes/:id/notes` | `{ content }` | `QuoteNote` |

### Quote Create/Edit (`/quotes/new`, `/quotes/:id/edit`)
**Hook:** `lib/hooks/sales/use-quotes.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Create quote | POST | `/quotes` | `QuoteCreateData` | `Quote` |
| Update quote | PATCH | `/quotes/:id` | `QuoteUpdateData` | `Quote` |

---

## 4. TMS Core — Orders

### Orders List (`/operations/orders`)
**Hook:** `lib/hooks/tms/use-orders.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List orders | GET | `/orders` | `?page, ?limit, ?search, ?status, ?fromDate, ?toDate, ?customerId` | `PaginatedResponse<Order>` |
| Update order | PATCH | `/orders/:id` | `{ status?, ...fields }` | `Order` |

### Order Detail (`/operations/orders/:id`)
**Hook:** `lib/hooks/tms/use-orders.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get order | GET | `/orders/:id` | — | `OrderDetailResponse` |
| Get order loads | GET | `/orders/:id/loads` | — | `OrderLoad[]` |
| Get timeline | GET | `/orders/:id/timeline` | — | `TimelineEvent[]` |
| Get documents | GET | `/orders/:id/documents` | — | `OrderDocument[]` |
| Get linked quote | GET | `/quotes/:quoteId` | — | `QuoteDetail` |

### Create Order (`/operations/orders/new`)
**Hook:** `lib/hooks/tms/use-orders.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Create order | POST | `/orders` | `OrderCreatePayload` (includes stops, billing, accessorials) | `Order` |

### Edit Order (`/operations/orders/:id/edit`)
**Hook:** `lib/hooks/tms/use-orders.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get order | GET | `/orders/:id` | — | `OrderDetailResponse` |
| Update order | PATCH | `/orders/:id` | `OrderUpdatePayload` | `Order` |

---

## 5. TMS Core — Loads

### Loads List (`/operations/loads`)
**Hook:** `lib/hooks/tms/use-loads.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List loads | GET | `/loads` | `?page, ?limit, ?search, ?status, ?carrierId, ?equipmentType, ?fromDate, ?toDate` | `PaginatedResponse<Load>` |

### Load Detail (`/operations/loads/:id`)
**Hook:** `lib/hooks/tms/use-loads.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get load | GET | `/loads/:id` | — | `LoadDetailResponse` |
| Get check calls | GET | `/loads/:id/check-calls` | — | `CheckCall[]` |

> **Note:** `useLoadStats` and `useLoadTimeline` are disabled (`enabled: false`) — no backend endpoints exist for `/loads/stats` or `/loads/:id/timeline`.

### Create Load (`/operations/loads/new`)
**Hook:** `lib/hooks/tms/use-loads.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Create load | POST | `/loads` | `CreateLoadInput` (carrier, driver, equipment, stops) | `Load` |
| Get carriers | GET | `/operations/carriers` | `?search, ?equipmentType, ?page, ?limit` | `CarrierListResponse` |
| Get order (pre-fill) | GET | `/orders/:orderId` | — | `OrderDetailResponse` |

### Edit Load (`/operations/loads/:id/edit`)
**Hook:** `lib/hooks/tms/use-loads.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Update load | PUT | `/loads/:id` | `UpdateLoadInput` | `Load` |

### Rate Confirmation (`/operations/loads/:id/rate-con`)
**Hook:** `lib/hooks/tms/use-rate-confirmation.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get rate con PDF | GET | `/loads/:id/rate-confirmation` | — | `Blob` (PDF download via `getFullUrl`) |

---

## 6. TMS Core — Stops

**Hook:** `lib/hooks/tms/use-stops.ts`

Used on Order Detail and Load Detail pages for stop management.

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List stops | GET | `/orders/:orderId/stops` | — | `Stop[]` |
| Get stop | GET | `/orders/:orderId/stops/:stopId` | — | `Stop` |
| Create stop | POST | `/orders/:orderId/stops` | `StopCreateData` | `Stop` |
| Update stop | PUT | `/orders/:orderId/stops/:stopId` | `StopUpdateData` | `Stop` |
| Update stop status | PUT | `/orders/:orderId/stops/:stopId` | `{ status }` | `Stop` |
| Delete stop | DELETE | `/orders/:orderId/stops/:stopId` | — | — |
| Reorder stops | PUT | `/orders/:orderId/stops/reorder` | `{ stopIds }` | `Stop[]` |
| Mark arrived | POST | `/orders/:orderId/stops/:stopId/arrive` | `{ arrivedAt?, notes? }` | `Stop` |
| Mark departed | POST | `/orders/:orderId/stops/:stopId/depart` | `{ departedAt?, notes? }` | `Stop` |

### Check Calls
**Hook:** `lib/hooks/tms/use-checkcalls.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List check calls | GET | `/loads/:loadId/check-calls` | — | `CheckCall[]` |
| Create check call | POST | `/loads/:loadId/check-calls` | `{ location, notes, lat?, lng?, loadId }` | `CheckCall` |

---

## 7. TMS Core — Dispatch

### Dispatch Board (`/operations/dispatch`)
**Hook:** `lib/hooks/tms/use-dispatch.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get board (loads by status) | GET | `/loads` | `?status, ?carrierId, ?equipmentType, ?page, ?limit` | `PaginatedResponse<Load>` |
| Get board stats | GET | `/loads` | (fetches board data, computes stats client-side) | computed |
| Get load detail | GET | `/loads/:loadId` | — | `LoadDetailResponse` |
| Update load status | PATCH | `/loads/:loadId/status` | `{ status }` | `Load` |
| Assign carrier | PATCH | `/loads/:loadId/assign` | `{ carrierId, driverId?, truckId? }` | `Load` |
| Dispatch load | PATCH | `/loads/:loadId/dispatch` | `{}` | `Load` |
| Bulk update status | PATCH | `/loads/:id/status` | `{ status }` | (looped per load) |
| Bulk dispatch | PATCH | `/loads/:id/dispatch` | `{}` | (looped per load) |
| Update ETA | PUT | `/stops/:stopId` | `{ estimatedArrival }` | `Stop` |

> **Note:** No bulk endpoints exist — bulk operations loop over individual PATCH calls.
> `useUpdateLoadEta` disabled — no dedicated backend route for ETA updates.

---

## 8. TMS Core — Tracking

### Tracking Map (`/operations/tracking`)
**Hook:** `lib/hooks/tms/use-tracking.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get active loads | GET | `/loads` | `?status=IN_TRANSIT,DISPATCHED,AT_PICKUP,AT_DELIVERY` | `PaginatedResponse<Load>` |
| Get load detail | GET | `/loads/:loadId` | — | `LoadDetailResponse` |
| Update load status | PATCH | `/loads/:loadId/status` | `{ status }` | — |
| Log check call | POST | `/loads/:loadId/check-calls` | `{ location, notes, lat?, lng?, loadId }` | — |

**WebSocket (real-time):**
- **Event:** `LOAD_LOCATION_UPDATED` → `{ loadId, location: { lat, lng }, speed, eta, heading }`
- **Fallback:** 15s polling via `refetchInterval` when WS disconnected

### Public Tracking (`/track/:trackingCode`)
**Hook:** `lib/hooks/tms/use-tracking.ts` (public variant)

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get public load | GET | `/loads/:trackingCode/public` | — | Minimal load data (no carrier details) |

> This route is in the public paths list — no auth required.

---

## 9. Operations Dashboard

### Operations Hub (`/operations`)
**Hook:** `lib/hooks/tms/use-ops-dashboard.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get KPIs | GET | `/operations/dashboard` | `?period` | `DashboardKPIs` |
| Get charts | GET | `/operations/dashboard/charts` | `?period` | `ChartData` |
| Get alerts | GET | `/operations/dashboard/alerts` | — | `Alert[]` |
| Get activity feed | GET | `/operations/dashboard/activity` | `?period` | `ActivityItem[]` |
| Get needs attention | GET | `/operations/dashboard/needs-attention` | — | `AttentionItem[]` |

---

## 10. Carriers

### Carriers List (`/carriers`)
**Hook:** `lib/hooks/operations/use-carriers.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List carriers | GET | `/operations/carriers` | `?page, ?limit, ?search, ?status, ?carrierType, ?state, ?sortBy, ?sortOrder` | `{ data: Carrier[], total, page, limit, totalPages }` |
| Get stats | GET | `/operations/carriers/stats` | — | `{ total, byType, byStatus }` |
| Create carrier | POST | `/operations/carriers` | `{ carrierType, companyName }` | `Carrier` |
| Delete carrier | DELETE | `/operations/carriers/:id` | — | — |

### Carrier Detail (`/carriers/:id`)
**Hook:** `lib/hooks/operations/use-carriers.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get carrier | GET | `/operations/carriers/:id` | — | `OperationsCarrier` |
| Update carrier | PATCH | `/operations/carriers/:id` | `Partial<Carrier>` | `Carrier` |

### Carrier Drivers (sub-resource)
| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List drivers | GET | `/operations/carriers/:carrierId/drivers` | — | `OperationsCarrierDriver[]` |
| Get driver | GET | `/operations/carriers/:carrierId/drivers/:driverId` | — | `OperationsCarrierDriver` |
| Create driver | POST | `/operations/carriers/:carrierId/drivers` | `DriverCreateData` | `OperationsCarrierDriver` |
| Update driver | PATCH | `/operations/carriers/:carrierId/drivers/:driverId` | `DriverUpdateData` | `OperationsCarrierDriver` |
| Delete driver | DELETE | `/operations/carriers/:carrierId/drivers/:driverId` | — | — |

### Carrier Trucks (sub-resource)
| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List trucks | GET | `/operations/carriers/:carrierId/trucks` | — | `OperationsCarrierTruck[]` |
| Get truck | GET | `/operations/carriers/:carrierId/trucks/:truckId` | — | `OperationsCarrierTruck` |
| Create truck | POST | `/operations/carriers/:carrierId/trucks` | `TruckCreateData` | `OperationsCarrierTruck` |
| Update truck | PATCH | `/operations/carriers/:carrierId/trucks/:truckId` | `TruckUpdateData` | `OperationsCarrierTruck` |
| Assign driver | PATCH | `/operations/carriers/:carrierId/trucks/:truckId/assign-driver/:driverId` | — | `OperationsCarrierTruck` |
| Delete truck | DELETE | `/operations/carriers/:carrierId/trucks/:truckId` | — | — |

### FMCSA Verification
**Hook:** `lib/hooks/carriers/use-fmcsa.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Lookup carrier | GET | `/fmcsa/carriers/:dotNumber` | — | `FmcsaCarrierRecord` |
| Get CSA scores | GET | `/fmcsa/carriers/:dotNumber/csa` | — | `CsaScore[]` |

---

## 11. Accounting

### Accounting Dashboard (`/accounting`)
**Hook:** `lib/hooks/accounting/use-accounting-dashboard.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get dashboard | GET | `/accounting/dashboard` | — | `AccountingDashboardData` |
| Get recent invoices | GET | `/invoices` | `?limit=5, ?sortBy=createdAt, ?sortOrder=desc` | `PaginatedResponse<Invoice>` |

### Invoices (`/accounting/invoices`)
**Hook:** `lib/hooks/accounting/use-invoices.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List invoices | GET | `/invoices` | `?page, ?limit, ?search, ?status, ?customerId, ?fromDate, ?toDate, ?sortBy, ?sortOrder` | `PaginatedResponse<Invoice>` |
| Get invoice | GET | `/invoices/:id` | — | `Invoice` |
| Create invoice | POST | `/invoices` | `{ customerId, orderId?, loadId?, invoiceDate, paymentTerms, notes?, lineItems }` | `Invoice` |
| Update invoice | PUT | `/invoices/:id` | `InvoiceUpdateData` | `Invoice` |
| Delete invoice | DELETE | `/invoices/:id` | — | — |
| Send invoice | POST | `/invoices/:id/send` | — | `Invoice` |
| Void invoice | POST | `/invoices/:id/void` | `{ reason }` | `Invoice` |
| Update status | PATCH | `/invoices/:id/status` | `{ status }` | `Invoice` |
| Download PDF | GET | `/invoices/:id/pdf` | — | `Blob` |

### Payments Received (`/accounting/payments`)
**Hook:** `lib/hooks/accounting/use-payments.ts`

> **Note:** API uses `/payments-received`, not `/payments`.

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List payments | GET | `/payments-received` | `?page, ?limit, ?search, ?status, ?fromDate, ?toDate` | `PaginatedResponse<Payment>` |
| Get payment | GET | `/payments-received/:id` | — | `Payment` |
| Create payment | POST | `/payments-received` | `PaymentCreateData` | `Payment` |
| Update payment | PUT | `/payments-received/:id` | `PaymentUpdateData` | `Payment` |
| Delete payment | DELETE | `/payments-received/:id` | — | — |
| Apply to invoice | POST | `/payments-received/:id/apply` | `{ invoiceId, amount }` | — |

### Carrier Payables (`/accounting/payables`)
**Hook:** `lib/hooks/accounting/use-payables.ts`

> **Note:** API uses `/payments-made`, not `/accounting/payables`.

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List payables | GET | `/payments-made` | `?page, ?limit, ?search, ?status, ?carrierId` | `PaginatedResponse<Payable>` |
| Get payable | GET | `/payments-made/:id` | — | `Payable` |
| Process payable | POST | `/payments-made/:id/process` | — | `Payable` |

### Settlements (`/accounting/settlements`)
**Hook:** `lib/hooks/accounting/use-settlements.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List settlements | GET | `/settlements` | `?page, ?limit, ?search, ?status, ?carrierId, ?fromDate, ?toDate` | `PaginatedResponse<Settlement>` |
| Get settlement | GET | `/settlements/:id` | — | `Settlement` |
| Create settlement | POST | `/settlements` | `SettlementCreateData` | `Settlement` |
| Approve settlement | POST | `/settlements/:id/approve` | — | `Settlement` |
| Process settlement | POST | `/settlements/:id/process` | — | `Settlement` |
| Delete settlement | DELETE | `/settlements/:id` | — | — |

### Aging Reports (`/accounting/reports/aging`)
**Hook:** `lib/hooks/accounting/use-aging.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get aging report | GET | `/accounting/reports/aging` | `?type=receivable\|payable, ?asOfDate` | `AgingReport` |

---

## 12. Commissions

### Commission Dashboard (`/commissions`)
**Hook:** `lib/hooks/commissions/use-commission-dashboard.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get dashboard | GET | `/commissions/dashboard` | — | `CommissionDashboardData` |

### Commission Plans (`/commissions/plans`)
**Hook:** `lib/hooks/commissions/use-plans.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List plans | GET | `/commissions/plans` | `?page, ?limit, ?search, ?type, ?isActive, ?sortBy, ?sortOrder` | `PaginatedResponse<CommissionPlan>` |
| Get plan | GET | `/commissions/plans/:id` | — | `CommissionPlan` |
| Create plan | POST | `/commissions/plans` | `{ name, type, description?, rate?, flatAmount?, tiers?, isActive? }` | `CommissionPlan` |
| Update plan | PUT | `/commissions/plans/:id` | `PlanUpdateData` | `CommissionPlan` |
| Delete plan | DELETE | `/commissions/plans/:id` | — | — |
| Duplicate plan | POST | `/commissions/plans/:id/duplicate` | — | `CommissionPlan` |

### Sales Reps (`/commissions/reps`)
**Hook:** `lib/hooks/commissions/use-reps.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List reps | GET | `/commissions/reps` | `?page, ?limit, ?search, ?status, ?sortBy, ?sortOrder` | `PaginatedResponse<SalesRep>` |
| Get rep | GET | `/commissions/reps/:id` | — | `SalesRep` |
| Get rep transactions | GET | `/commissions/reps/:id/transactions` | `?page, ?limit` | `PaginatedResponse<Transaction>` |
| Assign plan | POST | `/commissions/reps/:repId/plan` | `{ planId }` | — |

### Commission Transactions (`/commissions/transactions`)
**Hook:** `lib/hooks/commissions/use-transactions.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List transactions | GET | `/commissions/transactions` | `?page, ?limit, ?repId, ?status, ?fromDate, ?toDate` | `PaginatedResponse<Transaction>` |
| Create transaction | POST | `/commissions/transactions` | `TransactionCreateData` | `Transaction` |
| Process batch | POST | `/commissions/transactions/process` | `{ fromDate, toDate }` | — |

### Commission Payouts (`/commissions/payouts`)
**Hook:** `lib/hooks/commissions/use-payouts.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List payouts | GET | `/commissions/payouts` | `?page, ?limit, ?status, ?repId, ?fromDate, ?toDate` | `PaginatedResponse<Payout>` |
| Get payout | GET | `/commissions/payouts/:id` | — | `Payout` |
| Create payout | POST | `/commissions/payouts` | `{ repId }` | `Payout` |
| Approve/process payout | POST | `/commissions/payouts/:id/approve` | — | `Payout` |

### Commission Reports (`/commissions/reports`)
**Page-level fetch in:** `app/(dashboard)/commissions/reports/page.tsx`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get plans (for report) | GET | `/commissions/plans` | — | `CommissionPlan[]` |

---

## 13. Documents

**Hook:** `lib/hooks/documents/use-documents.ts`

Used on Load Detail and Order Detail pages for file uploads/downloads.

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List documents | GET | `/documents` | `?entityType=LOAD\|ORDER, ?entityId` | `Document[]` |
| Upload document | POST | `/documents` | `FormData` (multipart) | `Document` |
| Delete document | DELETE | `/documents/:documentId` | — | — |
| Get download URL | GET | `/documents/:documentId/download` | — | `{ url }` |

---

## 14. Communication / Email

### Send Email
**Hook:** `lib/hooks/communication/use-send-email.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Send email | POST | `/communication/emails/send` | `{ to, subject, body, templateId?, loadId?, orderId? }` | — |

### Email Logs
**Hook:** `lib/hooks/communication/use-email-logs.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List email logs | GET | `/communication/emails` | `?entityType, ?entityId, ?page, ?limit` | `EmailLogsResponse` |

---

## 15. Load Board

**Hook:** `lib/hooks/tms/use-load-board.ts`

> Load Board is deferred to post-MVP but hooks exist for future use.

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List postings | GET | `/load-board/posts` | `?page, ?limit, ?search, ?status` | `PaginatedResponse<LoadPosting>` |
| Get posting | GET | `/load-board/posts/:id` | — | `LoadPosting` |
| Get stats | GET | `/load-board/stats` | — | `LoadBoardStats` |

---

## 16. Load History

### Load History (`/load-history`)
**Hook:** `lib/hooks/operations/use-load-history.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List history | GET | `/operations/load-history` | `?page, ?limit, ?search, ?carrierId, ?lane` | `PaginatedResponse<LoadHistory>` |
| Get history item | GET | `/operations/load-history/:id` | — | `LoadHistory` |
| Get by carrier | GET | `/operations/load-history/carrier/:carrierId` | — | `LoadHistory[]` |
| Get by lane | GET | `/operations/load-history/lane` | `?origin, ?destination` | `LoadHistory[]` |
| Get analytics | GET | `/operations/load-history/analytics` | `?period` | `HistoryAnalytics` |
| Get lane stats | GET | `/operations/load-history/lane-stats` | `?origin, ?destination` | `LaneStats` |
| Create entry | POST | `/operations/load-history` | `LoadHistoryCreateData` | `LoadHistory` |
| Update entry | PATCH | `/operations/load-history/:id` | `LoadHistoryUpdateData` | `LoadHistory` |
| Delete entry | DELETE | `/operations/load-history/:id` | — | — |

---

## 17. Load Planner (PROTECTED)

### Load Planner Quotes
**Hook:** `lib/hooks/operations/use-load-planner-quotes.ts`

> PROTECTED — do not modify the Load Planner page itself. These hooks power the data layer.

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List quotes | GET | `/operations/load-planner-quotes` | `?page, ?limit, ?search, ?status` | `PaginatedResponse<LoadPlannerQuote>` |
| Get quote | GET | `/operations/load-planner-quotes/:id` | — | `LoadPlannerQuote` |
| Get by reference | GET | `/operations/load-planner-quotes/ref/:ref` | — | `LoadPlannerQuote` |
| Get stats | GET | `/operations/load-planner-quotes/stats` | — | `LoadPlannerQuoteStats` |
| Create quote | POST | `/operations/load-planner-quotes` | `QuoteCreateData` | `LoadPlannerQuote` |
| Update quote | PATCH | `/operations/load-planner-quotes/:id` | `QuoteUpdateData` | `LoadPlannerQuote` |
| Update status | PATCH | `/operations/load-planner-quotes/:id/status` | `{ status }` | `LoadPlannerQuote` |
| Convert to order | POST | `/operations/load-planner-quotes/:id/convert` | — | `LoadPlannerQuote` |
| Delete quote | DELETE | `/operations/load-planner-quotes/:id` | — | — |

---

## Shared Utilities

### Equipment
**Hook:** `lib/hooks/operations/use-equipment.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get makes | GET | `/operations/equipment/makes` | — | `EquipmentMake[]` |
| Get models | GET | `/operations/equipment/models` | `?makeId` | `EquipmentModel[]` |
| Get dimensions | GET | `/operations/equipment/dimensions` | `?modelId` | `EquipmentDimensions` |

### Truck Types
**Hook:** `lib/hooks/operations/use-truck-types.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Delete truck type | DELETE | `/operations/truck-types/:id` | — | — |

### Inland Service Types
**Hook:** `lib/hooks/operations/use-inland-service-types.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List service types | GET | `/operations/inland-service-types` | — | `InlandServiceType[]` |

### Tenant Services
**Hook:** `lib/hooks/operations/use-tenant-services.ts`

| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List services | GET | `/operations/tenant-services` | `?tenantId, ?isActive` | `TenantService[]` |

---

## Endpoint Summary by Method

| Method | Count | Examples |
|--------|-------|---------|
| **GET** | ~80 | List, detail, stats, dashboard endpoints |
| **POST** | ~40 | Create, send, convert, process actions |
| **PATCH** | ~20 | Partial updates, status changes |
| **PUT** | ~15 | Full updates, reorder operations |
| **DELETE** | ~20 | Remove resources |
| **Total** | **~175** | Across 50 hook files |

---

## Known Stubs (No Backend Endpoint)

| Hook | Endpoint Expected | Status |
|------|-------------------|--------|
| `useLoadStats` | `GET /loads/stats` | Disabled (`enabled: false`) |
| `useLoadTimeline` | `GET /loads/:id/timeline` | Disabled (`enabled: false`) |
| `useUpdateLoadEta` | `PUT /stops/:id` ETA field | Disabled — backend route unclear |

---

## Query Parameter Conventions

All list endpoints accept these standard params:

```
?page=1         — Page number (default: 1)
&limit=20       — Items per page (default: 20, max: 100)
&search=text    — Free-text search
&status=ACTIVE  — Filter by status enum
&sortBy=name    — Sort field
&sortOrder=asc  — Sort direction (asc|desc)
&fromDate=ISO   — Start of date range
&toDate=ISO     — End of date range
```

## Response Envelope

**Single item:**
```json
{ "data": { "id": "...", ... } }
```

**Paginated list:**
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 487, "totalPages": 25 }
}
```

**Error:**
```json
{ "error": "Human-readable message", "code": "ERROR_CODE" }
```
