# 72 - Screen-API Contract Registry (Part 2)

**Continuation of screen-to-API mapping for Operations, Platform, Extended, and Admin Services**

---

# OPERATIONS SERVICES (68 Screens)

---

## 08 - Credit Service (8 Screens)

### Database Tables Required

```prisma
- CreditApplication
- CreditLimit
- CreditHold
- CollectionActivity
```

---

### Screen 08.01: Credit Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/credit`  
**Access**: Accounting, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/credit/dashboard` | - | `{ data: { applications, limits, holds, collection } }` |

---

### Screen 08.02: Credit Applications

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/credit/applications`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/credit/applications` | `?page, limit, status` | `{ data: CreditApplication[], pagination }` |
| POST | `/api/v1/credit/applications` | CreateApplicationDto | `{ data: CreditApplication }` |

---

### Screen 08.03: Application Review

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/credit/applications/:id`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/credit/applications/:id` | - | `{ data: CreditApplicationWithDetails }` |
| POST | `/api/v1/credit/applications/:id/approve` | `{ limit, terms }` | `{ data: CreditApplication }` |
| POST | `/api/v1/credit/applications/:id/reject` | `{ reason }` | `{ data: CreditApplication }` |

---

### Screen 08.04-08.08: Credit Limits, Holds, Collections Queue, Collection Activity, Credit Reports

_(Similar pattern - GET lists, POST actions, detail views)_

---

## 09 - Claims Service (10 Screens)

### Database Tables Required

```prisma
- Claim
- ClaimDocument
- ClaimNote
- ClaimPayment
```

---

### Screen 09.01: Claims Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/operations/claims`  
**Access**: Operations, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/claims/dashboard` | - | `{ data: { open, pending, resolved, byType, total } }` |

---

### Screen 09.02: Claims List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/operations/claims/list`  
**Access**: Operations

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/claims` | `?page, limit, status, type, carrierId, loadId` | `{ data: Claim[], pagination }` |
| POST | `/api/v1/claims` | CreateClaimDto | `{ data: Claim }` |
| DELETE | `/api/v1/claims/:id` | - | `{ data: { deleted: true } }` |

---

### Screen 09.03: Claim Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/operations/claims/:id`  
**Access**: Operations

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/claims/:id` | - | `{ data: ClaimWithRelations }` |
| PUT | `/api/v1/claims/:id` | UpdateClaimDto | `{ data: Claim }` |
| POST | `/api/v1/claims/:id/notes` | `{ note }` | `{ data: ClaimNote }` |
| POST | `/api/v1/claims/:id/documents` | FormData | `{ data: ClaimDocument }` |

---

### Screen 09.04: New Claim

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/operations/claims/new`  
**Access**: Operations

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/claims` | CreateClaimDto | `{ data: Claim }` |
| GET | `/api/v1/loads` | `?search` | `{ data: Load[] }` |

---

### Screen 09.05-09.10: Investigation, Damage Photos, Settlement Calculator, Resolution, Reports, Carrier Claims History

_(Standard CRUD patterns)_

---

## 10 - Documents Service (8 Screens)

### Database Tables Required

```prisma
- Document
- DocumentTemplate
- DocumentVersion
- ESignature
```

---

### Screen 10.01: Document Library

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/documents`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/documents` | `?page, limit, search, type, entityType, entityId` | `{ data: Document[], pagination }` |
| POST | `/api/v1/documents` | FormData | `{ data: Document }` |
| DELETE | `/api/v1/documents/:id` | - | `{ data: { deleted: true } }` |
| GET | `/api/v1/documents/:id/download` | - | Blob |

---

### Screen 10.02-10.08: Viewer, Upload, Template Manager, Template Editor, E-Signature, Scanner, Reports

_(Document management patterns)_

---

## 11 - Communication Service (10 Screens)

### Database Tables Required

```prisma
- Message
- EmailTemplate
- SmsTemplate
- Notification
- AutoMessageRule
```

---

### Screen 11.01: Communication Hub

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/communications`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/communications/summary` | - | `{ data: { unread, recent, scheduled } }` |

---

### Screen 11.02-11.10: Inbox, Compose Email, SMS Compose, Email Templates, SMS Templates, Notification Center, Communication Log, Auto-Message Rules, Bulk Messaging

_(Messaging patterns)_

---

## 12 - Customer Portal (10 Screens)

### Screen 12.01: Portal Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/portal/customer/dashboard`  
**Access**: Customer

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/portal/customer/dashboard` | - | `{ data: { shipments, quotes, invoices, notifications } }` |

---

### Screen 12.02-12.10: My Shipments, Shipment Detail, Request Quote, My Quotes, My Invoices, Documents, Report Issue, My Profile, Track Shipment

_(Customer-scoped endpoints with ownership checks)_

---

## 13 - Carrier Portal (12 Screens)

### Screen 13.01: Portal Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/portal/carrier/dashboard`  
**Access**: Carrier

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/portal/carrier/dashboard` | - | `{ data: { loads, payments, documents, compliance } }` |

---

### Screen 13.02-13.12: Available Loads, My Loads, Load Detail, Accept Load, Update Status, Upload POD, My Payments, My Documents, Update Documents, My Profile, Request Quick Pay

_(Carrier-scoped endpoints)_

---

## 14 - Driver Portal / Mobile (10 Screens)

### Screen 14.01: Driver Home

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/driver` (mobile)  
**Access**: Driver

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/driver/home` | - | `{ data: { currentLoad, nextStop, messages, earnings } }` |

---

### Screen 14.02-14.10: My Loads, Load Detail, Navigation, Update Status, Capture POD, Messages, Document Scan, My Settlement, Settings

_(Mobile-optimized endpoints)_

---

# PLATFORM SERVICES (62 Screens)

---

## 15 - Analytics Service (10 Screens)

### Screen 15.01: Analytics Home

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/analytics`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/analytics/kpis` | `?dateRange` | `{ data: { kpis } }` |

---

### Screen 15.02-15.10: Operations Dashboard, Financial Dashboard, Sales Dashboard, Report Library, Report Viewer, Report Builder, Scheduled Reports, Dashboard Builder, Data Explorer

_(Analytics/reporting patterns)_

---

## 16 - Workflow Service (8 Screens)

### Screen 16.01: Automation Center

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/workflows`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/workflows` | - | `{ data: Workflow[] }` |
| POST | `/api/v1/workflows` | CreateWorkflowDto | `{ data: Workflow }` |
| PUT | `/api/v1/workflows/:id/toggle` | - | `{ data: Workflow }` |

---

### Screen 16.02-16.08: Workflow List, Workflow Designer, Trigger Configuration, Action Library, Workflow History, Error Queue, Workflow Templates

_(Automation patterns)_

---

## 17 - Integration Hub (10 Screens)

### Screen 17.01: Integration Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/integrations`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/integrations/status` | - | `{ data: { connected, errors, lastSync } }` |

---

### Screen 17.02-17.10: Connected Apps, App Marketplace, Connection Setup, Webhook Manager, API Keys, API Documentation, Sync Status, Integration Logs, Field Mapping

_(Integration management patterns)_

---

## 18 - Search Service (4 Screens)

### Screen 18.01: Global Search

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/search` (global component)  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/search` | `?q, types, limit` | `{ data: { results, facets } }` |

---

## 19 - Audit Service (6 Screens)

### Screen 19.01: Audit Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/audit`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/audit/summary` | `?dateRange` | `{ data: { byAction, byUser, byEntity } }` |

---

## 20 - Config Service (8 Screens)

### Screen 20.01: Settings Home

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/settings`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/config` | - | `{ data: ConfigCategories }` |

---

## 21 - Scheduler Service (6 Screens)

### Screen 21.01: Scheduler Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/scheduler`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/scheduler/jobs` | - | `{ data: ScheduledJob[] }` |

---

## 22 - Cache Service (4 Screens)

### Screen 22.01: Cache Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/super-admin/cache`  
**Access**: Super Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/cache/stats` | - | `{ data: { hitRate, memory, keys } }` |
| POST | `/api/v1/cache/flush` | `{ pattern? }` | `{ data: { flushed } }` |

---

## 23 - Help Desk Service (6 Screens)

### Screen 23.01: Support Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/support/dashboard`  
**Access**: Support

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/tickets/summary` | - | `{ data: { open, pending, resolved } }` |

---

## 24 - Feedback Service (6 Screens)

### Screen 24.01: Feedback Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/feedback`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/feedback/summary` | `?dateRange` | `{ data: { nps, trends, requests } }` |

---

# EXTENDED SERVICES (72 Screens)

---

## 25 - EDI Service (8 Screens)

### Screen 25.01: EDI Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/edi`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/edi/dashboard` | - | `{ data: { partners, queues, errors } }` |

---

## 26 - Rate Intelligence Service (6 Screens)

### Screen 26.01: Market Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/rates`  
**Access**: Sales, Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/rates/market` | `?origin, destination, equipment` | `{ data: { market, historical, forecast } }` |

---

## 27 - ELD Service (8 Screens)

### Screen 27.01: ELD Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/eld`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/eld/dashboard` | - | `{ data: { drivers, violations, hos } }` |

---

## 28 - Cross-Border Service (8 Screens)

### Screen 28.01: Cross-Border Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/operations/cross-border`  
**Access**: Operations

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/cross-border/dashboard` | - | `{ data: { permits, crossings, compliance } }` |

---

## 29 - Safety Service (10 Screens)

### Screen 29.01: Safety Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/safety`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/safety/dashboard` | - | `{ data: { scores, incidents, compliance } }` |

---

## 30 - Fuel Cards Service (8 Screens)

### Screen 30.01: Fuel Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/fuel`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/fuel/dashboard` | `?dateRange` | `{ data: { spend, transactions, advances } }` |

---

## 31 - Factoring Service (8 Screens)

### Screen 31.01: Factoring Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/factoring`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/factoring/dashboard` | - | `{ data: { requests, reserve, noa } }` |

---

## 32 - Load Board Service (8 Screens)

### Screen 32.01: Load Board Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/load-board`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/load-board/dashboard` | - | `{ data: { posted, bids, leads } }` |
| POST | `/api/v1/load-board/post` | PostLoadDto | `{ data: LoadPosting }` |

---

## 33 - Mobile App Service (8 Screens)

### Screen 33.01: Mobile Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/mobile`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/mobile/stats` | - | `{ data: { devices, activeUsers, usage } }` |

---

# ADMIN SERVICES (28 Screens)

---

## 34 - Super Admin Service (28 Screens)

### Screen 34.01: Platform Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/super-admin/dashboard`  
**Access**: Super Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/platform/dashboard` | - | `{ data: { tenants, health, metrics, revenue } }` |

---

### Screen 34.02: Tenant List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/super-admin/tenants`  
**Access**: Super Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/tenants` | `?page, limit, search, status, plan` | `{ data: Tenant[], pagination }` |
| POST | `/api/v1/tenants` | CreateTenantDto | `{ data: Tenant }` |
| DELETE | `/api/v1/tenants/:id` | - | `{ data: { deleted: true } }` |

---

### Screen 34.03: Tenant Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/super-admin/tenants/:id`  
**Access**: Super Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/tenants/:id` | - | `{ data: TenantWithDetails }` |
| PUT | `/api/v1/tenants/:id` | UpdateTenantDto | `{ data: Tenant }` |
| GET | `/api/v1/tenants/:id/usage` | - | `{ data: UsageMetrics }` |
| GET | `/api/v1/tenants/:id/invoices` | - | `{ data: PlatformInvoice[] }` |

---

### Screen 34.04: Create Tenant Wizard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/super-admin/tenants/new`  
**Access**: Super Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/tenants` | CreateTenantDto | `{ data: Tenant }` |
| POST | `/api/v1/tenants/:id/provision` | - | `{ data: { provisioned: true } }` |
| GET | `/api/v1/subscription-plans` | - | `{ data: Plan[] }` |

---

### Screen 34.05-34.12: Tenant Settings, Subscription Plans, Plan Editor, Tenant Subscriptions, Billing Dashboard, Invoices, Payments, Usage Metrics

_(Subscription/billing patterns)_

---

### Screen 34.13-34.16: Platform Users, Platform User Editor, Impersonation, Impersonation Log

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**API Endpoints for Impersonation**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/impersonate/:tenantId` | - | `{ data: { token, expiresAt } }` |
| POST | `/api/v1/impersonate/end` | - | `{ data: { success: true } }` |
| GET | `/api/v1/impersonate/log` | `?page, limit` | `{ data: ImpersonationLog[], pagination }` |

---

### Screen 34.17-34.18: Announcements, Announcement Editor

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/announcements` | - | `{ data: Announcement[] }` |
| POST | `/api/v1/announcements` | CreateAnnouncementDto | `{ data: Announcement }` |
| PUT | `/api/v1/announcements/:id` | UpdateAnnouncementDto | `{ data: Announcement }` |
| DELETE | `/api/v1/announcements/:id` | - | `{ data: { deleted: true } }` |

---

### Screen 34.19-34.22: System Health, API Metrics, Error Log, Platform Audit Log

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/platform/health` | - | `{ data: { services, database, cache, queue } }` |
| GET | `/api/v1/platform/metrics` | `?period` | `{ data: { requests, latency, errors } }` |
| GET | `/api/v1/platform/errors` | `?page, limit, severity` | `{ data: Error[], pagination }` |
| GET | `/api/v1/platform/audit` | `?page, limit, action` | `{ data: AuditLog[], pagination }` |

---

### Screen 34.23-34.28: Feature Flags, System Config, Data Export, Support Dashboard, Tenant Diagnostics, Database Admin

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/feature-flags` | - | `{ data: FeatureFlag[] }` |
| PUT | `/api/v1/feature-flags/:key` | `{ enabled, tenantIds? }` | `{ data: FeatureFlag }` |
| GET | `/api/v1/platform/config` | - | `{ data: SystemConfig }` |
| PUT | `/api/v1/platform/config` | UpdateConfigDto | `{ data: SystemConfig }` |
| POST | `/api/v1/tenants/:id/export` | `{ format }` | `{ data: { jobId } }` |
| GET | `/api/v1/tenants/:id/diagnostics` | - | `{ data: DiagnosticsReport }` |

---

# SUMMARY

## Total API Endpoints by Service Category

| Category   | Services | Screens | Est. Endpoints |
| ---------- | -------- | ------- | -------------- |
| Core       | 7        | 78      | ~156           |
| Operations | 7        | 68      | ~136           |
| Platform   | 8        | 62      | ~124           |
| Support    | 2        | 16      | ~32            |
| Extended   | 9        | 72      | ~144           |
| Admin      | 1        | 28      | ~56            |
| **TOTAL**  | **34**   | **324** | **~648**       |

---

## Using This Registry

### Before Building a Screen:

1. Find the screen in this document
2. Verify all required API endpoints exist
3. Verify database tables exist in Prisma
4. Check all required UI elements are documented

### After Building:

1. Update status checkboxes (DB, API, FE, INT, VER)
2. Add any additional endpoints discovered
3. Update UI elements if changed

### During Code Review:

1. Verify implementation matches contract
2. Check all UI elements have actions
3. Confirm response formats match

---

## Navigation

- **Previous:** [Screen-API Contract Registry Part 1](./72-screen-api-contract-registry.md)
- **Index:** [Documentation Home](./59-documentation-index.md)
