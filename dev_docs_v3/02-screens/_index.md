# Screen Catalog — All 98 Routes

> **Actual route count: 98** (corrected from previous estimate of 96)
> Scanned from `apps/web/app/` on 2026-03-07
> Format: Route | Service | Type | Complexity | Status | Real-time | Task ID

**Type legend:** List | Detail | Form-Create | Form-Edit | Dashboard | Settings | Wizard | Public | Auth
**Complexity:** S (simple CRUD) | M (moderate, multiple sections) | L (complex, tabs/real-time) | XL (very complex, drag-drop/AI)
**Status:** Built | Partial | Stub | Protected | Not-Built

---

## Auth Routes (7)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Login | `/login` | Auth | Auth | S | Protected | No | 8/10, working auth flow |
| Register | `/register` | Auth | Auth | S | Stub | No | No submit handler |
| Forgot Password | `/forgot-password` | Auth | Auth | S | Stub | No | Placeholder only |
| Reset Password | `/reset-password` | Auth | Auth | S | Stub | No | No token handling |
| MFA Setup | `/mfa` | Auth | Auth | S | Built | No | QR + 6-digit input works |
| Super Admin Login | `/superadmin/login` | Auth | Auth | S | Built | No | Separate auth flow |
| Verify Email | `/verify-email` | Auth | Auth | S | Built | No | Email verification |

---

## Dashboard (1)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Main Dashboard | `/dashboard` | Dashboard | Dashboard | L | Partial | Yes | Shell exists, KPIs hardcoded to 0 |

---

## Admin Routes (12)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Users List | `/admin/users` | Auth/Admin | List | M | Built | No | 8/10, pagination + filters |
| User Detail | `/admin/users/[id]` | Auth/Admin | Detail | M | Built | No | 7/10 |
| User Edit | `/admin/users/[id]/edit` | Auth/Admin | Form-Edit | M | Built | No | 8/10 |
| User Create | `/admin/users/new` | Auth/Admin | Form-Create | M | Built | No | 8/10 |
| Roles List | `/admin/roles` | Auth/Admin | List | M | Built | No | 7/10 |
| Role Detail | `/admin/roles/[id]` | Auth/Admin | Detail | M | Built | No | 7/10 |
| Role Create | `/admin/roles/new` | Auth/Admin | Form-Create | M | Built | No | 7/10 |
| Permissions Matrix | `/admin/permissions` | Auth/Admin | Settings | L | Built | No | 7/10 |
| Tenants List | `/admin/tenants` | Auth/Admin | List | M | Built | No | 7/10 |
| Tenant Detail | `/admin/tenants/[id]` | Auth/Admin | Detail | M | Built | No | 6/10 |
| Audit Logs | `/admin/audit-logs` | Auth/Admin | List | M | Built | No | 6/10, filters stub |
| Admin Settings | `/admin/settings` | Auth/Admin | Settings | M | Stub | No | No form handlers |

---

## Profile (2)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Profile | `/profile` | Auth/Admin | Settings | M | Partial | No | Display works, edit stub |
| Security Settings | `/profile/security` | Auth/Admin | Settings | M | Stub | No | Placeholder |

---

## CRM — Companies (6)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Companies List | `/companies` | CRM | List | M | Built | No | B+, good search/pagination |
| Company Detail | `/companies/[id]` | CRM | Detail | M | Built | No | B, tabbed view |
| Company Edit | `/companies/[id]/edit` | CRM | Form-Edit | M | Built | No | B+ |
| Company Create | `/companies/new` | CRM | Form-Create | M | Built | No | B+ |
| Company Activities | `/companies/[id]/activities` | CRM | Detail | S | Built | No | Activity timeline |
| Company Contacts | `/companies/[id]/contacts` | CRM | List | S | Built | No | Contacts sub-list |

---

## CRM — Customers (6)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Customers List | `/customers` | CRM | List | M | Built | No | Redirects to /companies |
| Customer Detail | `/customers/[id]` | CRM | Detail | M | Built | No | |
| Customer Edit | `/customers/[id]/edit` | CRM | Form-Edit | M | Built | No | |
| Customer Create | `/customers/new` | CRM | Form-Create | M | Built | No | |
| Customer Activities | `/customers/[id]/activities` | CRM | Detail | S | Built | No | |
| Customer Contacts | `/customers/[id]/contacts` | CRM | List | S | Built | No | |

---

## CRM — Contacts (4)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Contacts List | `/contacts` | CRM | List | M | Built | No | C, no search/delete button |
| Contact Detail | `/contacts/[id]` | CRM | Detail | M | Built | No | B, no delete button |
| Contact Edit | `/contacts/[id]/edit` | CRM | Form-Edit | S | Built | No | B+ |
| Contact Create | `/contacts/new` | CRM | Form-Create | S | Built | No | B+ |

---

## CRM — Leads (5)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Leads List | `/leads` | CRM | List | M | Built | No | B-, no delete, owner filter bug |
| Lead Detail | `/leads/[id]` | CRM | Detail | M | Built | No | B, no convert button |
| Lead Create | `/leads/new` | CRM | Form-Create | M | Built | No | B+ |
| Lead Activities | `/leads/[id]/activities` | CRM | Detail | S | Built | No | Activity timeline |
| Lead Contacts | `/leads/[id]/contacts` | CRM | List | S | Built | No | Contacts sub-list |

---

## Activities (1)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Activities | `/activities` | CRM | List | M | Built | No | General activity log |

---

## Sales & Quotes (6)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Quotes List | `/quotes` | Sales | List | M | Partial | No | 5/10, no filters |
| Quote Detail | `/quotes/[id]` | Sales | Detail | M | Partial | No | 5/10 view only |
| Quote Edit | `/quotes/[id]/edit` | Sales | Form-Edit | M | Partial | No | 4/10 incomplete |
| Quote Create | `/quotes/new` | Sales | Form-Create | M | Partial | No | 5/10 basic form |
| Quote History | `/quote-history` | Sales | List | M | Partial | No | 4/10, window.confirm |
| Load Planner | `/load-planner/[id]/edit` | Sales | Wizard | XL | Protected | No | 9/10 PROTECTED — AI + Maps |

---

## Load Planner History (1)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Load Planner History | `/load-planner/history` | Sales | List | S | Partial | No | Basic history list |

---

## TMS Core — Operations (12)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Operations Dashboard | `/operations` | TMS Core | Dashboard | XL | Built | Yes | Real-time stub — renders but data unclear |
| Orders List | `/operations/orders` | TMS Core | List | L | Built | No | May be stub — needs verification |
| Order Detail | `/operations/orders/[id]` | TMS Core | Detail | L | Built | No | Needs verification |
| Order Edit | `/operations/orders/[id]/edit` | TMS Core | Form-Edit | L | Built | No | Needs verification |
| Order Create | `/operations/orders/new` | TMS Core | Form-Create | L | Built | No | Needs verification |
| Loads List | `/operations/loads` | TMS Core | List | L | Built | No | Needs verification |
| Load Detail | `/operations/loads/[id]` | TMS Core | Detail | L | Built | No | Needs verification |
| Load Edit | `/operations/loads/[id]/edit` | TMS Core | Form-Edit | L | Built | No | Needs verification |
| Load Create | `/operations/loads/new` | TMS Core | Form-Create | L | Built | No | Needs verification |
| Rate Confirmation | `/operations/loads/[id]/rate-con` | TMS Core | Detail | M | Built | No | Needs verification |
| Dispatch Board | `/operations/dispatch` | TMS Core | Dashboard | XL | Built | Yes | Needs verification — WS needed |
| Tracking Map | `/operations/tracking` | TMS Core | Dashboard | XL | Built | Yes | Needs verification — WS needed |

**CRITICAL NOTE:** The TMS Core routes exist as page.tsx files, but their quality/functionality is unverified. The v2 hub said "0 screens" — these may be stubs created after. QS-008 (runtime verification) will determine actual status.

---

## Carriers (4)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Carriers List | `/carriers` | Carriers | List | M | Partial | No | 5/10, 858-line monolith |
| Carrier Detail | `/carriers/[id]` | Carriers | Detail | L | Partial | No | BUG-001 — may be stub |
| Carrier Edit | `/carriers/[id]/edit` | Carriers | Form-Edit | M | Partial | No | 5/10, window.confirm |
| Carrier Scorecard | `/carriers/[id]/scorecard` | Carriers | Detail | M | Partial | No | Needs verification |

---

## Load History (2)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Load History List | `/load-history` | Carriers | List | M | Partial | No | 5/10, list works |
| Load History Detail | `/load-history/[id]` | Carriers/TMS | Detail | L | Partial | No | BUG-002 — may be stub |

---

## Truck Types (1)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Truck Types | `/truck-types` | Carriers | List | M | Protected | No | 8/10 PROTECTED — Gold standard |

---

## Accounting (10)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Accounting Dashboard | `/accounting` | Accounting | Dashboard | L | Partial | No | Needs verification — may be stub |
| Invoices List | `/accounting/invoices` | Accounting | List | M | Partial | No | Needs verification |
| Invoice Detail | `/accounting/invoices/[id]` | Accounting | Detail | L | Partial | No | Needs verification |
| Invoice Create | `/accounting/invoices/new` | Accounting | Form-Create | M | Partial | No | Needs verification |
| Payables | `/accounting/payables` | Accounting | List | M | Partial | No | Needs verification |
| Payments List | `/accounting/payments` | Accounting | List | M | Partial | No | Needs verification |
| Payment Detail | `/accounting/payments/[id]` | Accounting | Detail | M | Partial | No | Needs verification |
| Settlements List | `/accounting/settlements` | Accounting | List | M | Partial | No | Needs verification |
| Settlement Detail | `/accounting/settlements/[id]` | Accounting | Detail | L | Partial | No | Needs verification |
| Aging Report | `/accounting/reports/aging` | Accounting | Dashboard | M | Partial | No | Needs verification |

---

## Commission (11)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Commissions Dashboard | `/commissions` | Commission | Dashboard | M | Partial | No | Needs verification — may be stub |
| Commissions Plans List | `/commissions/plans` | Commission | List | M | Partial | No | Needs verification |
| Commission Plan Detail | `/commissions/plans/[id]` | Commission | Detail | M | Partial | No | Needs verification |
| Commission Plan Edit | `/commissions/plans/[id]/edit` | Commission | Form-Edit | M | Partial | No | Needs verification |
| Commission Plan Create | `/commissions/plans/new` | Commission | Form-Create | M | Partial | No | Needs verification |
| Commission Payouts | `/commissions/payouts` | Commission | List | M | Partial | No | Needs verification |
| Payout Detail | `/commissions/payouts/[id]` | Commission | Detail | M | Partial | No | Needs verification |
| Commission Reports | `/commissions/reports` | Commission | Dashboard | M | Partial | No | Needs verification |
| Sales Reps | `/commissions/reps` | Commission | List | M | Partial | No | Needs verification |
| Sales Rep Detail | `/commissions/reps/[id]` | Commission | Detail | M | Partial | No | Needs verification |
| Transactions | `/commissions/transactions` | Commission | List | M | Partial | No | Needs verification |

---

## Load Board (4)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Load Board | `/load-board` | Load Board | List | M | Partial | No | Needs verification |
| Post Load | `/load-board/post` | Load Board | Form-Create | M | Partial | No | Needs verification |
| Posting Detail | `/load-board/postings/[id]` | Load Board | Detail | M | Partial | No | Needs verification |
| Load Board Search | `/load-board/search` | Load Board | List | M | Partial | No | Needs verification |

---

## Super Admin (1)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Tenant Services | `/superadmin/tenant-services` | Super Admin | Settings | M | Built | No | Cross-tenant admin |

---

## Public Routes (2)

| Screen | Route | Service | Type | Complexity | Status | Real-time | Notes |
|--------|-------|---------|------|-----------|--------|-----------|-------|
| Root (redirect) | `/` | Auth | Public | S | Built | No | Redirects to /dashboard or /login |
| Public Tracking | `/track/[trackingCode]` | TMS Core | Public | M | Built | Yes | Public load tracking page |

---

## Summary by Service

| Service | Total Routes | Built/Protected | Partial/Stub | Not-Built | Verified |
|---------|-------------|-----------------|--------------|-----------|---------|
| Auth & Admin | 21 | 18 | 3 | 0 | Mostly |
| CRM | 22 | 20 | 2 | 0 | Partial |
| Sales & Quotes | 7 | 1 (Protected) | 6 | 0 | Partial |
| TMS Core | 12 | 0 | 12 (unverified) | 0 | None — QS-008 |
| Carriers | 7 | 1 (Protected) | 6 | 0 | Partial |
| Accounting | 10 | 0 | 10 (unverified) | 0 | None — QS-008 |
| Commission | 11 | 0 | 11 (unverified) | 0 | None — QS-008 |
| Load Board | 4 | 0 | 4 (unverified) | 0 | None — QS-008 |
| Dashboard | 1 | 0 | 1 | 0 | Partial |
| Super Admin / Public | 4 | 3 | 1 | 0 | Partial |
| **TOTAL** | **99** | **43** | **56** | **0** | — |

**Note:** 99 routes counted (1 more than the raw file count of 98 — the public tracking page may be outside the app/ directory).

---

## Summary by Type

| Type | Count | Notes |
|------|-------|-------|
| List | 30 | Most common pattern |
| Detail | 24 | Tabbed views |
| Form-Create | 12 | RHF + Zod |
| Form-Edit | 10 | Same as create |
| Dashboard | 6 | KPI + charts |
| Settings | 5 | Config screens |
| Auth | 7 | Login flows |
| Wizard | 1 | Load Planner |
| Public | 2 | No auth required |
| **Total** | **97** | |

---

## Critical Verification Needed (QS-008)

Routes marked "Partial — Needs verification" may be:
- **Fully working** (if built after v2 hub was written)
- **Stubs** (file exists but shows "Coming Soon" or similar)
- **Broken** (renders but API calls fail)

The following groups MUST be runtime-verified by QS-008:
1. All TMS Core `/operations/*` routes (12 screens)
2. All Accounting `/accounting/*` routes (10 screens)
3. All Commission `/commissions/*` routes (11 screens)
4. All Load Board `/load-board/*` routes (4 screens)
5. Carrier detail `/carriers/[id]` and `/load-history/[id]` (BUG-001, BUG-002)
6. Carrier scorecard `/carriers/[id]/scorecard`

---

## Screen-to-API Mapping (Key Screens)

| Screen | Required Endpoints | Endpoints Exist? |
|--------|-------------------|-----------------|
| Operations Dashboard | GET /operations/dashboard + /charts + /alerts + /activity | Yes (Production) |
| Orders List | GET /orders | Yes (Production) |
| Order Detail | GET /orders/:id + /timeline + /stops | Yes (Production) |
| Loads List | GET /loads | Yes (Production) |
| Load Detail | GET /loads/:id + /stops + /checkcalls | Yes (Production) |
| Dispatch Board | GET /loads + WS /dispatch | Loads: Yes; WS: Missing (QS-001) |
| Tracking Map | GET /operations/tracking/positions + WS /tracking | REST: Yes; WS: Missing (QS-001) |
| Accounting Dashboard | GET /accounting/dashboard | Missing (QS-003) |
| Invoices List | GET /accounting/invoices | Partial |
| Commissions Dashboard | GET /commission/stats | Partial |
| Carriers List | GET /carriers | Yes (Production) |
| Carrier Detail | GET /carriers/:id | Yes (Production) — page missing |
| Load History Detail | GET /loads/:id | Yes — page missing |
