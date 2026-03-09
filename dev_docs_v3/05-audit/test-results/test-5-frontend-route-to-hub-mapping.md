# Test 5: Frontend Route-to-Hub Mapping

> **Date:** 2026-03-09
> **Scope:** Map every frontend route to its owning hub file, find orphans in both directions
> **Sources:** `apps/web/app/` (98 page.tsx files) vs `dev_docs_v3/01-services/` (39 hub files)

---

## Summary

| Metric | Count |
|--------|-------|
| **Total frontend routes found** | **98** |
| Routes mapped to exactly 1 hub | **69** (70.4%) |
| Routes mapped to 2+ hubs (multi-claimed) | **20** (20.4%) |
| **Orphan routes (no hub claims them)** | **9** (9.2%) |
| **Phantom screens — P0 hubs (claimed, no route)** | **35** |
| **Phantom screens — P1/P2/P3 hubs (future scope)** | **~169** |
| **Total phantom screens** | **~204** |
| Multi-claimed routes | **20** |
| **Coverage: routes with at least 1 hub** | **89/98 = 90.8%** |

---

## Route-to-Hub Mapping

### Routes with Hub Ownership (89 routes mapped)

#### Auth Routes → 01-auth-admin
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/forgot-password` | 01-auth-admin | Forgot Password | Claimed |
| `/login` | 01-auth-admin | Login | Claimed |
| `/mfa` | 01-auth-admin | MFA Setup | Claimed |
| `/register` | 01-auth-admin | Register | Claimed |
| `/reset-password` | 01-auth-admin | Reset Password | Claimed |
| `/verify-email` | 01-auth-admin | Verify Email | Claimed |

#### Admin Routes → 01-auth-admin + 33-super-admin (MULTI-CLAIMED)
| Route | Hubs | Section 3 Entry | Status |
|-------|------|-----------------|--------|
| `/admin/audit-logs` | 01 + 33 | Audit Logs | Multi-claimed |
| `/admin/permissions` | 01 + 33 | Permissions Matrix | Multi-claimed |
| `/admin/roles` | 01 + 33 | Roles List | Multi-claimed |
| `/admin/roles/[id]` | 01 + 33 | Role Detail | Multi-claimed |
| `/admin/roles/new` | 01 + 33 | Role Create | Multi-claimed |
| `/admin/settings` | 01 + 33 | General Settings | Multi-claimed |
| `/admin/tenants` | 01 + 33 | Tenants List | Multi-claimed |
| `/admin/tenants/[id]` | 01 + 33 | Tenant Detail | Multi-claimed |
| `/admin/users` | 01 + 33 | Users List | Multi-claimed |
| `/admin/users/[id]` | 01 + 33 | User Detail | Multi-claimed |
| `/admin/users/[id]/edit` | 01 + 33 | User Edit | Multi-claimed |
| `/admin/users/new` | 01 + 33 | User Create | Multi-claimed |
| `/superadmin/login` | 01 + 33 | Super Admin Login | Multi-claimed |

#### Superadmin → 33-super-admin only
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/superadmin/tenant-services` | 33-super-admin | Tenant Services | Claimed |

#### Profile → 01-auth-admin
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/profile` | 01-auth-admin | Profile | Claimed |
| `/profile/security` | 01-auth-admin | Profile Security | Claimed |

#### Dashboard → 02-dashboard
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/dashboard` | 02-dashboard | Main Dashboard | Claimed |

#### CRM → 03-crm
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/companies` | 03-crm | Companies List | Claimed |
| `/companies/[id]` | 03-crm | Company Detail | Claimed |
| `/companies/[id]/activities` | 03-crm | Company Activities | Claimed |
| `/companies/[id]/contacts` | 03-crm | Company Contacts | Claimed |
| `/companies/[id]/edit` | 03-crm | Company Edit | Claimed |
| `/companies/new` | 03-crm | Company Create | Claimed |
| `/contacts` | 03-crm | Contacts List | Claimed |
| `/contacts/[id]` | 03-crm | Contact Detail | Claimed |
| `/contacts/[id]/edit` | 03-crm | Contact Edit | Claimed |
| `/contacts/new` | 03-crm | Contact Create | Claimed |
| `/customers` | 03-crm | Customers (redirects) | Claimed |
| `/leads` | 03-crm | Leads List | Claimed |
| `/leads/[id]` | 03-crm | Lead Detail | Claimed |
| `/leads/[id]/activities` | 03-crm | Lead Activities | Claimed |
| `/leads/[id]/contacts` | 03-crm | Lead Contacts | Claimed |
| `/leads/new` | 03-crm | Lead Create | Claimed |

#### Sales & Quotes → 04-sales-quotes
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/quotes` | 04-sales-quotes | Quote List | Claimed |
| `/quotes/[id]` | 04-sales-quotes | Quote Detail | Claimed |
| `/quotes/[id]/edit` | 04-sales-quotes | Quote Edit | Claimed |
| `/quotes/new` | 04-sales-quotes | Quote Create | Claimed |
| `/quote-history` | 04-sales-quotes | Quote History | Claimed |
| `/load-planner/[id]/edit` | 04-sales-quotes | Load Planner | Claimed (PROTECTED 9/10) |

#### TMS Core → 05-tms-core
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/operations/orders` | 05-tms-core | Orders List | Claimed |
| `/operations/orders/[id]` | 05-tms-core | Order Detail | Claimed |
| `/operations/orders/[id]/edit` | 05-tms-core | Edit Order Form | Claimed |
| `/operations/orders/new` | 05-tms-core | New Order Form | Claimed |
| `/operations/loads` | 05-tms-core | Loads List | Claimed |
| `/operations/loads/[id]` | 05-tms-core | Load Detail | Claimed |
| `/operations/loads/[id]/edit` | 05-tms-core | Edit Load Form | Claimed |
| `/operations/loads/[id]/rate-con` | 05-tms-core | Rate Confirmation | Claimed |
| `/operations/loads/new` | 05-tms-core | New Load Form | Claimed |
| `/operations/tracking` | 05-tms-core | Tracking Map | Claimed |

#### Carriers → 06-carriers
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/carriers` | 06-carriers | Carriers List | Claimed |
| `/carriers/[id]` | 06-carriers | Carrier Detail | Claimed |
| `/carriers/[id]/edit` | 06-carriers | Carrier Edit | Claimed |
| `/carriers/[id]/scorecard` | 06-carriers | Carrier Scorecard | Claimed |
| `/truck-types` | 06-carriers | Truck Types | Claimed (PROTECTED 8/10) |

#### Accounting → 07-accounting
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/accounting/invoices` | 07-accounting | Invoices List | Claimed |
| `/accounting/invoices/[id]` | 07-accounting | Invoice Detail | Claimed |
| `/accounting/invoices/new` | 07-accounting | Invoice Create | Claimed |
| `/accounting/payables` | 07-accounting | Payables List | Claimed |
| `/accounting/payments` | 07-accounting | Payments List | Claimed |
| `/accounting/payments/[id]` | 07-accounting | Payment Detail | Claimed |
| `/accounting/reports/aging` | 07-accounting | Aging Report | Claimed |
| `/accounting/settlements` | 07-accounting | Settlements List | Claimed |
| `/accounting/settlements/[id]` | 07-accounting | Settlement Detail | Claimed |

#### Commission → 08-commission
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/commissions/plans` | 08-commission | Commission Plans List | Claimed |
| `/commissions/plans/[id]` | 08-commission | Commission Plan Detail | Claimed |
| `/commissions/plans/[id]/edit` | 08-commission | Commission Plan Edit | Claimed |
| `/commissions/plans/new` | 08-commission | Commission Plan Create | Claimed |
| `/commissions/payouts` | 08-commission | Payouts List | Claimed |
| `/commissions/payouts/[id]` | 08-commission | Payout Detail | Claimed |
| `/commissions/reports` | 08-commission | Commission Reports | Claimed |
| `/commissions/reps` | 08-commission | Sales Reps List | Claimed |
| `/commissions/reps/[id]` | 08-commission | Sales Rep Detail | Claimed |
| `/commissions/transactions` | 08-commission | Transactions | Claimed |

#### Load Board → 09-load-board
| Route | Hub | Section 3 Entry | Status |
|-------|-----|-----------------|--------|
| `/load-board/post` | 09-load-board | Post Load | Claimed |
| `/load-board/postings/[id]` | 09-load-board | Posting Detail | Claimed |
| `/load-board/search` | 09-load-board | Load Search | Claimed |

#### Multi-Claimed Dashboard Landing Pages → 02-dashboard + domain hub
| Route | Hubs | Notes |
|-------|------|-------|
| `/operations` | 02-dashboard + 05-tms-core | Dashboard claims as "Operations Dashboard", TMS claims as landing |
| `/accounting` | 02-dashboard + 07-accounting | Dashboard claims as "Accounting Dashboard", Accounting claims as landing |
| `/commissions` | 02-dashboard + 08-commission | Dashboard claims as "Commission Dashboard", Commission claims as landing |
| `/load-board` | 02-dashboard + 09-load-board | Dashboard claims as "Load Board Dashboard", Load Board claims as landing |

#### Multi-Claimed Cross-Service Routes
| Route | Hubs | Notes |
|-------|------|-------|
| `/load-history` | 04-sales-quotes + 06-carriers | Both claim Load History — shared concept |
| `/load-history/[id]` | 04-sales-quotes + 06-carriers | Both claim Load History Detail |
| `/operations/dispatch` | 05-tms-core + 39-command-center | TMS owns it; CC references as foundation |

---

## Orphan Routes (9 routes — exist in code, no hub claims them)

| Route | Likely Service | Notes |
|-------|---------------|-------|
| `/` | N/A (root) | App root/landing page, redirects to `/dashboard`. Not a TMS screen. |
| `/activities` | 03-crm | Standalone activities page. CRM claims sub-routes (`/companies/[id]/activities`) but not this top-level page. |
| `/customers/[id]` | 03-crm | CRM hub only claims `/customers` as "redirects". 5 full customer CRUD pages exist but are not documented. |
| `/customers/[id]/activities` | 03-crm | Same — customer sub-route not claimed |
| `/customers/[id]/contacts` | 03-crm | Same — customer sub-route not claimed |
| `/customers/[id]/edit` | 03-crm | Same — customer sub-route not claimed |
| `/customers/new` | 03-crm | Same — customer sub-route not claimed |
| `/load-planner/history` | 04-sales-quotes | Sales hub claims `/load-planner/[id]/edit` but not the history page |
| `/track/[trackingCode]` | 13-customer-portal? | Public tracking page. Portal claims `/portal/track/[code]` (different route). Standalone public route outside (dashboard). |

---

## Phantom Screens — P0 Hubs (35 screens claimed, no route exists)

| Hub | Claimed Screen | Route | Notes |
|-----|---------------|-------|-------|
| 01-auth-admin | General Settings | `/admin/settings/general` | Only `/admin/settings` exists (likely tabs internally) |
| 01-auth-admin | Security Settings | `/admin/settings/security` | Same — tab, not route |
| 01-auth-admin | Notification Settings | `/admin/settings/notifications` | Same — tab, not route |
| 03-crm | Opportunities List | `/crm/opportunities` | Wave 2, not built |
| 03-crm | Activities Calendar | `/crm/activities` | Wave 2, not built |
| 03-crm | Territory Mgmt | `/crm/territories` | Wave 2, not built |
| 03-crm | Lead Import | `/crm/leads/import` | Wave 2, not built |
| 04-sales-quotes | Quotes Dashboard | `/quotes/dashboard` | Phase 2 |
| 04-sales-quotes | Rate Tables | `/sales/rate-tables` | Phase 2 |
| 04-sales-quotes | Sales Reports | `/sales/reports` | Phase 3 |
| 04-sales-quotes | Customer Rates | `/sales/customer-rates` | Phase 2 |
| 04-sales-quotes | Quote Templates | `/sales/templates` | Phase 3 |
| 06-carriers | Carrier Dashboard | `/carriers/dashboard` | Phase 2 |
| 06-carriers | Compliance Center | `/carriers/compliance` | Phase 2 |
| 06-carriers | Insurance Tracking | `/carriers/insurance` | Phase 2 |
| 06-carriers | Equipment List | `/carriers/[id]/equipment` | Phase 2 |
| 07-accounting | Invoice Edit | `/accounting/invoices/[id]/edit` | NOT BUILT — known gap |
| 07-accounting | Settlement Create | `/accounting/settlements/new` | NOT BUILT — known gap |
| 09-load-board | Carrier Offers | `/load-board/offers` | NOT BUILT |
| 09-load-board | Load Board Settings | `/load-board/settings` | NOT BUILT |
| 13-customer-portal | Portal Login | `/portal/login` | NOT BUILT (all 12 portal screens) |
| 13-customer-portal | Portal Register | `/portal/register` | NOT BUILT |
| 13-customer-portal | Portal Dashboard | `/portal/dashboard` | NOT BUILT |
| 13-customer-portal | My Shipments | `/portal/shipments` | NOT BUILT |
| 13-customer-portal | Shipment Detail | `/portal/shipments/[id]` | NOT BUILT |
| 13-customer-portal | New Shipment | `/portal/shipments/new` | NOT BUILT |
| 13-customer-portal | My Quotes | `/portal/quotes` | NOT BUILT |
| 13-customer-portal | My Invoices | `/portal/invoices` | NOT BUILT |
| 13-customer-portal | My Documents | `/portal/documents` | NOT BUILT |
| 13-customer-portal | Track Shipment | `/portal/track/[code]` | NOT BUILT |
| 13-customer-portal | Portal Settings | `/portal/settings` | NOT BUILT |
| 13-customer-portal | Support Chat | `/portal/support` | NOT BUILT |
| 33-super-admin | Super Admin Dashboard | `/superadmin/dashboard` | NOT BUILT |
| 33-super-admin | System Health | `/superadmin/system` | NOT BUILT |
| 39-command-center | Command Center | `/command-center` | NOT BUILT (+ 7 query-param variants) |

### Phantom Screens — Future Hubs (169 screens, all NOT BUILT)

| Tier | Hubs | Phantom Screen Count |
|------|------|---------------------|
| P1 Post-MVP | 11-documents, 12-communication, 14-carrier-portal | ~30 screens |
| P2 Extended | 10-claims, 15-contracts, 16-agents, 17-credit, 18-factoring, 19-analytics, 20-workflow, 21-integration-hub, 22-search | ~72 screens |
| P3 Future | 23-hr, 24-scheduler, 25-safety, 26-edi, 27-help-desk, 28-feedback, 29-rate-intelligence, 30-audit, 31-config, 32-cache | ~67 screens |

### Infra Hubs with No Screens (as expected)

| Hub | Status |
|-----|--------|
| 34-email | N/A — backend-only infrastructure |
| 35-storage | N/A — backend-only infrastructure |
| 36-redis | N/A — backend-only infrastructure |
| 37-health | N/A — backend-only infrastructure |
| 38-operations | N/A — backend-only infrastructure |

---

## Routes Claimed by Multiple Hubs (20 routes)

| Route | Hubs | Notes |
|-------|------|-------|
| `/admin/audit-logs` | 01-auth-admin, 33-super-admin | Expected — super-admin is role layer on auth |
| `/admin/permissions` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/roles` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/roles/[id]` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/roles/new` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/settings` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/tenants` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/tenants/[id]` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/users` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/users/[id]` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/users/[id]/edit` | 01-auth-admin, 33-super-admin | Expected |
| `/admin/users/new` | 01-auth-admin, 33-super-admin | Expected |
| `/superadmin/login` | 01-auth-admin, 33-super-admin | Expected |
| `/operations` | 02-dashboard, 05-tms-core | Dashboard landing vs. TMS domain root |
| `/accounting` | 02-dashboard, 07-accounting | Dashboard landing vs. Accounting domain root |
| `/commissions` | 02-dashboard, 08-commission | Dashboard landing vs. Commission domain root |
| `/load-board` | 02-dashboard, 09-load-board | Dashboard landing vs. Load Board domain root |
| `/load-history` | 04-sales-quotes, 06-carriers | Shared concept: sales sees quote-to-load history, carriers sees carrier load history |
| `/load-history/[id]` | 04-sales-quotes, 06-carriers | Same |
| `/operations/dispatch` | 05-tms-core, 39-command-center | TMS owns; Command Center references as foundation |

---

## Key Findings

### 1. Customer Pages Underdocumented (5 orphans)
The CRM hub (03-crm) only mentions `/customers` as "redirects" but 5 full CRUD pages exist in code: `/customers/[id]`, `/customers/[id]/edit`, `/customers/[id]/activities`, `/customers/[id]/contacts`, `/customers/new`. These follow the exact same pattern as Companies and Leads.

### 2. Settings Sub-Routes are Phantom (3 phantoms)
Hub 01-auth-admin claims `/admin/settings/general`, `/admin/settings/security`, `/admin/settings/notifications` as separate routes, but only `/admin/settings` exists as a single page (likely uses internal tabs).

### 3. All Multi-Claims are Intentional (20 routes)
- 13 admin routes: shared between 01-auth-admin and 33-super-admin (role layer design)
- 4 dashboard landings: shared between 02-dashboard and domain hubs
- 2 load-history routes: shared between 04-sales-quotes and 06-carriers
- 1 dispatch route: shared between 05-tms-core and 39-command-center

### 4. Customer Portal is Entirely Phantom (12 screens)
Hub 13-customer-portal claims 12 screens, none of which have routes built. This is the single largest source of P0 phantoms.

### 5. Known Missing Pages Confirmed
- `/accounting/invoices/[id]/edit` — hub claims it, no route exists (known gap)
- `/accounting/settlements/new` — hub claims it, no route exists (known gap)

---

## Recommendations

### Doc Fixes (hub updates needed)

1. **03-crm.md** — Add full Customer CRUD screens to Section 3: `/customers/[id]`, `/customers/[id]/edit`, `/customers/[id]/activities`, `/customers/[id]/contacts`, `/customers/new`
2. **03-crm.md** — Add `/activities` (standalone activities page) to Section 3
3. **04-sales-quotes.md** — Add `/load-planner/history` to Section 3
4. **01-auth-admin.md** — Fix settings routes: replace 3 sub-routes with single `/admin/settings` (note tabs internally)
5. **13-customer-portal.md or 05-tms-core.md** — Claim `/track/[trackingCode]` (public tracking page that exists outside dashboard)

### Phantom Screen Triage

| Priority | Action | Count |
|----------|--------|-------|
| **Fix now** | Update hub docs to mark unbuilt P0 screens clearly as "Planned" vs "Built" | 35 |
| **Known gaps** | Build `/accounting/invoices/[id]/edit` and `/accounting/settlements/new` | 2 |
| **Defer** | P1/P2/P3 phantoms are future scope — no action needed | 169 |

### Ownership Clarification

- **`/load-history`** — Designate a primary owner (likely 06-carriers) and mark the other hub (04-sales-quotes) as "references" rather than "owns"
- **Admin routes** — The 01/33 overlap is by design (super-admin is a role layer), but consider adding a note in 33-super-admin that 01-auth-admin is the primary owner
