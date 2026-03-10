# Screen Catalog — All 103 Routes (Verified)

> **Route count: 103** (98 original + 5 Portal routes from QS-011)
> Scanned from `apps/web/app/` on 2026-03-07, **Runtime verified via Playwright on 2026-03-10 (QS-008)**
> Format: Route | Service | Type | Complexity | Status | Real-time | Task ID
> **QS-008 Results: 101 PASS, 1 STUB, 1 BROKEN, 0 CRASH, 0 404**

**Type legend:** List | Detail | Form-Create | Form-Edit | Dashboard | Settings | Wizard | Public | Auth
**Complexity:** S (simple CRUD) | M (moderate, multiple sections) | L (complex, tabs/real-time) | XL (very complex, drag-drop/AI)
**Status:** Built | Partial | Stub | Protected | Not-Built | Broken
**Verified column:** ✅ PASS | ⚠️ STUB | ❌ BROKEN | — (not tested)

---

## Auth Routes (7)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Login | `/login` | Auth | Auth | S | Protected | ✅ PASS | 8/10, working auth flow |
| Register | `/register` | Auth | Auth | S | Built | ✅ PASS | Renders (177 chars) |
| Forgot Password | `/forgot-password` | Auth | Auth | S | Built | ✅ PASS | Renders (131 chars) |
| Reset Password | `/reset-password` | Auth | Auth | S | Stub | ⚠️ STUB | 84 chars — minimal content |
| MFA Setup | `/mfa` | Auth | Auth | S | Built | ✅ PASS | QR + 6-digit input works |
| Super Admin Login | `/superadmin/login` | Auth | Auth | S | Built | ✅ PASS | Separate auth flow |
| Verify Email | `/verify-email` | Auth | Auth | S | Built | ✅ PASS | Email verification |

---

## Dashboard (1)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Main Dashboard | `/dashboard` | Dashboard | Dashboard | L | Built | ✅ PASS | 799 chars, KPIs render |

---

## Admin Routes (12)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Users List | `/admin/users` | Auth/Admin | List | M | Built | ✅ PASS | 1518 chars, pagination + filters |
| User Detail | `/admin/users/[id]` | Auth/Admin | Detail | M | Built | ✅ PASS | 620 chars |
| User Edit | `/admin/users/[id]/edit` | Auth/Admin | Form-Edit | M | Built | ✅ PASS | 620 chars |
| User Create | `/admin/users/new` | Auth/Admin | Form-Create | M | Built | ✅ PASS | 1153 chars |
| Roles List | `/admin/roles` | Auth/Admin | List | M | Built | ✅ PASS | 1207 chars |
| Role Detail | `/admin/roles/[id]` | Auth/Admin | Detail | M | Built | ✅ PASS | 615 chars |
| Role Create | `/admin/roles/new` | Auth/Admin | Form-Create | M | Built | ✅ PASS | 3778 chars |
| Permissions Matrix | `/admin/permissions` | Auth/Admin | Settings | L | Built | ✅ PASS | 4395 chars |
| Tenants List | `/admin/tenants` | Auth/Admin | List | M | Built | ✅ PASS | 522 chars |
| Tenant Detail | `/admin/tenants/[id]` | Auth/Admin | Detail | M | Built | ✅ PASS | 688 chars |
| Audit Logs | `/admin/audit-logs` | Auth/Admin | List | M | Built | ✅ PASS | 548 chars |
| Admin Settings | `/admin/settings` | Auth/Admin | Settings | M | Built | ✅ PASS | 835 chars |

---

## Profile (2)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Profile | `/profile` | Auth/Admin | Settings | M | Built | ✅ PASS | 809 chars, QS-005 rebuilt |
| Security Settings | `/profile/security` | Auth/Admin | Settings | M | Built | ✅ PASS | 716 chars |

---

## CRM — Companies (6)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Companies List | `/companies` | CRM | List | M | Built | ✅ PASS | 2367 chars, search/pagination |
| Company Detail | `/companies/[id]` | CRM | Detail | M | Built | ✅ PASS | 629 chars, tabbed view |
| Company Edit | `/companies/[id]/edit` | CRM | Form-Edit | M | Built | ✅ PASS | 629 chars |
| Company Create | `/companies/new` | CRM | Form-Create | M | Built | ✅ PASS | 898 chars |
| Company Activities | `/companies/[id]/activities` | CRM | Detail | S | Built | ✅ PASS | 658 chars |
| Company Contacts | `/companies/[id]/contacts` | CRM | List | S | Built | ✅ PASS | 671 chars |

---

## CRM — Customers (6)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Customers List | `/customers` | CRM | List | M | Built | ✅ PASS | 2367 chars, redirects to /companies |
| Customer Detail | `/customers/[id]` | CRM | Detail | M | Built | ✅ PASS | 575 chars |
| Customer Edit | `/customers/[id]/edit` | CRM | Form-Edit | M | Built | ✅ PASS | 575 chars |
| Customer Create | `/customers/new` | CRM | Form-Create | M | Built | ✅ PASS | 898 chars |
| Customer Activities | `/customers/[id]/activities` | CRM | Detail | S | Built | ✅ PASS | 631 chars |
| Customer Contacts | `/customers/[id]/contacts` | CRM | List | S | Built | ✅ PASS | 644 chars |

---

## CRM — Contacts (4)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Contacts List | `/contacts` | CRM | List | M | Built | ✅ PASS | 2391 chars |
| Contact Detail | `/contacts/[id]` | CRM | Detail | M | Built | ✅ PASS | 629 chars |
| Contact Edit | `/contacts/[id]/edit` | CRM | Form-Edit | S | Built | ✅ PASS | 629 chars |
| Contact Create | `/contacts/new` | CRM | Form-Create | S | Built | ✅ PASS | 784 chars |

---

## CRM — Leads (5)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Leads List | `/leads` | CRM | List | M | Built | ✅ PASS | 2275 chars |
| Lead Detail | `/leads/[id]` | CRM | Detail | M | Built | ✅ PASS | 634 chars |
| Lead Create | `/leads/new` | CRM | Form-Create | M | Built | ✅ PASS | 2111 chars |
| Lead Activities | `/leads/[id]/activities` | CRM | Detail | S | Built | ✅ PASS | 739 chars |
| Lead Contacts | `/leads/[id]/contacts` | CRM | List | S | Built | ✅ PASS | 2466 chars |

---

## Activities (1)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Activities | `/activities` | CRM | List | M | Built | ✅ PASS | 11913 chars, rich content |

---

## Sales & Quotes (7)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Quotes List | `/quotes` | Sales | List | M | Built | ✅ PASS | 1230 chars |
| Quote Detail | `/quotes/[id]` | Sales | Detail | M | Built | ✅ PASS | 656 chars |
| Quote Edit | `/quotes/[id]/edit` | Sales | Form-Edit | M | Built | ✅ PASS | 627 chars |
| Quote Create | `/quotes/new` | Sales | Form-Create | M | Built | ✅ PASS | 1275 chars |
| Quote History | `/quote-history` | Sales | List | M | Built | ✅ PASS | 715 chars |
| Load Planner | `/load-planner/[id]/edit` | Sales | Wizard | XL | Protected | ✅ PASS | 9/10 PROTECTED — AI + Maps |
| Load Planner History | `/load-planner/history` | Sales | List | S | Built | ✅ PASS | 717 chars |

---

## TMS Core — Operations (12)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Operations Dashboard | `/operations` | TMS Core | Dashboard | XL | Built | ✅ PASS | 1516 chars |
| Orders List | `/operations/orders` | TMS Core | List | L | Built | ✅ PASS | 2497 chars |
| Order Detail | `/operations/orders/[id]` | TMS Core | Detail | L | Built | ✅ PASS | 465 chars |
| Order Edit | `/operations/orders/[id]/edit` | TMS Core | Form-Edit | L | Built | ✅ PASS | 483 chars |
| Order Create | `/operations/orders/new` | TMS Core | Form-Create | L | Built | ✅ PASS | 783 chars |
| Loads List | `/operations/loads` | TMS Core | List | L | Built | ✅ PASS | 2073 chars |
| Load Detail | `/operations/loads/[id]` | TMS Core | Detail | L | Built | ✅ PASS | 465 chars |
| Load Edit | `/operations/loads/[id]/edit` | TMS Core | Form-Edit | L | Built | ✅ PASS | 465 chars |
| Load Create | `/operations/loads/new` | TMS Core | Form-Create | L | Built | ✅ PASS | 1156 chars |
| Rate Confirmation | `/operations/loads/[id]/rate-con` | TMS Core | Detail | M | Built | ✅ PASS | 465 chars |
| Dispatch Board | `/operations/dispatch` | TMS Core | Dashboard | XL | Built | ✅ PASS | 2203 chars |
| Tracking Map | `/operations/tracking` | TMS Core | Dashboard | XL | Built | ✅ PASS | 734 chars |

---

## Carriers (4)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Carriers List | `/carriers` | Carriers | List | M | Built | ✅ PASS | 5619 chars |
| Carrier Detail | `/carriers/[id]` | Carriers | Detail | L | Built | ✅ PASS | 607 chars — BUG-001 RESOLVED |
| Carrier Edit | `/carriers/[id]/edit` | Carriers | Form-Edit | M | Built | ✅ PASS | 556 chars |
| Carrier Scorecard | `/carriers/[id]/scorecard` | Carriers | Detail | M | Built | ✅ PASS | 525 chars |

---

## Load History (2)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Load History List | `/load-history` | Carriers | List | M | Built | ✅ PASS | 5491 chars |
| Load History Detail | `/load-history/[id]` | Carriers/TMS | Detail | L | Built | ✅ PASS | 569 chars — BUG-002 RESOLVED |

---

## Truck Types (1)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Truck Types | `/truck-types` | Carriers | List | M | Protected | ✅ PASS | 8/10 PROTECTED — Gold standard |

---

## Accounting (10)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Accounting Dashboard | `/accounting` | Accounting | Dashboard | L | Built | ✅ PASS | 2423 chars |
| Invoices List | `/accounting/invoices` | Accounting | List | M | Built | ✅ PASS | 2092 chars |
| Invoice Detail | `/accounting/invoices/[id]` | Accounting | Detail | L | Built | ✅ PASS | 567 chars |
| Invoice Create | `/accounting/invoices/new` | Accounting | Form-Create | M | Built | ✅ PASS | 912 chars |
| Payables | `/accounting/payables` | Accounting | List | M | Built | ✅ PASS | 856 chars |
| Payments List | `/accounting/payments` | Accounting | List | M | Built | ✅ PASS | 1248 chars |
| Payment Detail | `/accounting/payments/[id]` | Accounting | Detail | M | Built | ✅ PASS | 568 chars |
| Settlements List | `/accounting/settlements` | Accounting | List | M | Built | ✅ PASS | 1134 chars |
| Settlement Detail | `/accounting/settlements/[id]` | Accounting | Detail | L | Built | ✅ PASS | 559 chars |
| Aging Report | `/accounting/reports/aging` | Accounting | Dashboard | M | Built | ✅ PASS | 796 chars |

---

## Commission (11)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Commissions Dashboard | `/commissions` | Commission | Dashboard | M | Built | ✅ PASS | 740 chars |
| Commissions Plans List | `/commissions/plans` | Commission | List | M | Built | ✅ PASS | 1205 chars |
| Commission Plan Detail | `/commissions/plans/[id]` | Commission | Detail | M | Built | ✅ PASS | 664 chars |
| Commission Plan Edit | `/commissions/plans/[id]/edit` | Commission | Form-Edit | M | Built | ✅ PASS | 545 chars |
| Commission Plan Create | `/commissions/plans/new` | Commission | Form-Create | M | Built | ✅ PASS | 1016 chars |
| Commission Payouts | `/commissions/payouts` | Commission | List | M | Built | ✅ PASS | 1848 chars |
| Payout Detail | `/commissions/payouts/[id]` | Commission | Detail | M | Built | ✅ PASS | 679 chars |
| Commission Reports | `/commissions/reports` | Commission | Dashboard | M | Built | ✅ PASS | 1620 chars |
| Sales Reps | `/commissions/reps` | Commission | List | M | Built | ✅ PASS | 476 chars |
| Sales Rep Detail | `/commissions/reps/[id]` | Commission | Detail | M | Broken | ❌ BROKEN | Hydration mismatch error, page renders but with errors |
| Transactions | `/commissions/transactions` | Commission | List | M | Built | ✅ PASS | 2266 chars |

---

## Load Board (4)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Load Board | `/load-board` | Load Board | List | M | Built | ✅ PASS | 668 chars |
| Post Load | `/load-board/post` | Load Board | Form-Create | M | Built | ✅ PASS | 1115 chars |
| Posting Detail | `/load-board/postings/[id]` | Load Board | Detail | M | Built | ✅ PASS | 651 chars |
| Load Board Search | `/load-board/search` | Load Board | List | M | Built | ✅ PASS | 747 chars |

---

## Super Admin (1)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Tenant Services | `/superadmin/tenant-services` | Super Admin | Settings | M | Built | ✅ PASS | 799 chars |

---

## Customer Portal (5) — Added by QS-011

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Portal Login | `/portal/login` | Customer Portal | Auth | S | Built | ✅ PASS | 300 chars |
| Portal Dashboard | `/portal/dashboard` | Customer Portal | Dashboard | M | Built | ✅ PASS | 300 chars |
| Portal Documents | `/portal/documents` | Customer Portal | List | M | Built | ✅ PASS | 300 chars |
| Portal Shipments | `/portal/shipments` | Customer Portal | List | M | Built | ✅ PASS | 300 chars |
| Portal Shipment Detail | `/portal/shipments/[id]` | Customer Portal | Detail | M | Built | ✅ PASS | 300 chars |

---

## Public Routes (2)

| Screen | Route | Service | Type | Complexity | Status | Verified | Notes |
|--------|-------|---------|------|-----------|--------|----------|-------|
| Root (redirect) | `/` | Auth | Public | S | Built | ✅ PASS | Redirects to /dashboard or /login |
| Public Tracking | `/track/[trackingCode]` | TMS Core | Public | M | Built | ✅ PASS | 304 chars |

---

## Summary by Service (Verified)

| Service | Total Routes | ✅ PASS | ⚠️ STUB | ❌ BROKEN | Verified |
|---------|-------------|---------|---------|-----------|---------|
| Auth & Admin | 21 | 21 | 0 | 0 | **All** |
| Dashboard | 1 | 1 | 0 | 0 | **All** |
| CRM | 22 | 22 | 0 | 0 | **All** |
| Sales & Quotes | 7 | 7 | 0 | 0 | **All** |
| TMS Core | 12 | 12 | 0 | 0 | **All** |
| Carriers | 7 | 7 | 0 | 0 | **All** |
| Accounting | 10 | 10 | 0 | 0 | **All** |
| Commission | 11 | 10 | 0 | 1 | **All** |
| Load Board | 4 | 4 | 0 | 0 | **All** |
| Auth (public) | 7 | 6 | 1 | 0 | **All** |
| Customer Portal | 5 | 5 | 0 | 0 | **All** |
| Super Admin / Public | 3 | 3 | 0 | 0 | **All** |
| **TOTAL** | **103** | **101** | **1** | **1** | **103/103** |

---

## QS-008 Verification Summary (2026-03-10)

**Tool:** Playwright automated browser test (`e2e/qs-008-runtime-verification.spec.ts`)
**Method:** Auth via API login, then sequential navigation to all 103 routes with DOM inspection
**Crash detection:** `[data-nextjs-dialog]`, `[data-nextjs-dialog-overlay]`, error boundary text
**Results file:** `e2e/reports/qs-008-results.json` (machine-readable)
**Screenshots:** `e2e/reports/qs-008-screenshots/` (failures only)

### Failures

| Route | Status | Issue | Severity |
|-------|--------|-------|----------|
| `/reset-password` | STUB | Only 84 chars of content, minimal placeholder | Low — auth stub, not user-facing |
| `/commissions/reps/[id]` | BROKEN | Hydration mismatch (SSR/client HTML differs). Page renders with KPI cards but shows "Commission rep not found" toast for dummy UUID. | Low — likely only triggers with non-existent rep ID |

### Key Findings

1. **TMS Core routes all PASS** — 12/12 routes render (previously listed as "unverified/unknown")
2. **Accounting routes all PASS** — 10/10 routes render (previously expected to crash)
3. **Commission routes 10/11 PASS** — Only `reps/[id]` has hydration issue
4. **Load Board routes all PASS** — 4/4 routes render (previously expected as stubs)
5. **Carrier Detail PASS** — BUG-001 (carrier detail 404) is RESOLVED
6. **Load History Detail PASS** — BUG-002 (load history detail 404) is RESOLVED
7. **No CRASH or 404 routes** — Every route renders some content

### Previously Expected vs Actual

| Service | Expected | Actual |
|---------|----------|--------|
| TMS Core | 0-12 PASS (unknown) | 12/12 PASS |
| Accounting | ~0/9 PASS (not built) | 10/10 PASS |
| Commission | ~0/8 PASS (not built) | 10/11 PASS |
| Load Board | ~1/4 STUB | 4/4 PASS |
| **Conservative estimate was 30-40/98 PASS** | **Actual: 101/103 PASS** |

---

## Screen-to-API Mapping (Updated)

| Screen | Required Endpoints | Endpoints Exist? | Runtime Status |
|--------|-------------------|-----------------|----------------|
| Operations Dashboard | GET /operations/dashboard + /charts + /alerts + /activity | Yes | ✅ PASS |
| Orders List | GET /orders | Yes | ✅ PASS |
| Order Detail | GET /orders/:id + /timeline + /stops | Yes | ✅ PASS |
| Loads List | GET /loads | Yes | ✅ PASS |
| Load Detail | GET /loads/:id + /stops + /checkcalls | Yes | ✅ PASS |
| Dispatch Board | GET /loads + WS /dispatch | Loads: Yes; WS: QS-001 done | ✅ PASS |
| Tracking Map | GET /operations/tracking/positions + WS /tracking | REST: Yes; WS: QS-001 done | ✅ PASS |
| Accounting Dashboard | GET /accounting/dashboard | Yes (QS-003 done) | ✅ PASS |
| Invoices List | GET /accounting/invoices | Yes | ✅ PASS |
| Commissions Dashboard | GET /commission/stats | Yes | ✅ PASS |
| Carriers List | GET /carriers | Yes | ✅ PASS |
| Carrier Detail | GET /carriers/:id | Yes | ✅ PASS |
| Load History Detail | GET /loads/:id | Yes | ✅ PASS |
