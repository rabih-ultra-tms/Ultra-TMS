# Screen Specs Index — All Design Specs

> Maps all design specs in `dev_docs/12-Rabih-design-Process/` to services and routes.
> Last updated: 2026-03-07

---

## Overview

| Metric | Count |
|--------|-------|
| Total spec files | ~381 across 42 folders |
| Services with specs | 42 |
| Screens with full 15-section specs | ~90+ |
| Routes with matching specs | ~65% |
| Routes without specs | ~35% (mostly sub-pages, admin detail pages) |

---

## Spec Folders by Service

### P0 MVP Services

| Service | Folder | Spec Files | Routes Covered |
|---------|--------|------------|----------------|
| Auth & Admin | `01-auth-admin/` | 13 files | login, register, forgot-pw, reset-pw, MFA, profile, user mgmt, roles, role editor, tenants, security log |
| CRM | `02-crm/` | 13 files | crm-dashboard, leads-list, lead-detail, companies-list, company-detail, contacts-list, contact-detail, opportunities, activities, territory, lead-import |
| Sales & Quotes | `03-sales/` | 13 files | quotes-dashboard, quotes-list, quote-detail, new-quote, load-planner, rate-tables, quote-history |
| TMS Core | `04-tms-core/` | 15 files | operations-dashboard, orders-list, order-detail, order-entry, loads-list, load-detail, load-builder, dispatch-board, stop-management, tracking-map, status-updates, load-timeline, check-calls, appointment-scheduler |
| Carrier Management | `05-carrier/` | 13 files | carrier-dashboard, carriers-list, carrier-detail, carrier-onboarding, compliance-center, insurance-tracking, equipment-list, carrier-scorecard, lane-preferences, carrier-contacts, fmcsa-lookup, preferred-carriers |
| Accounting | `06-accounting/` | 8+ files | invoices-list, invoice-detail, invoice-create, settlements-list, settlement-detail, accounting-dashboard, payments, reports |
| Commission | `07-commission/` | 4+ files | commission-dashboard, commission-plans, commission-reports, commission-payments |
| Load Board | `08-load-board/` | 3+ files | load-board, post-load, carrier-offers |

### P1+ Services (specs exist, lower priority)

| Service | Folder | Notes |
|---------|--------|-------|
| Claims | In dev_docs | Specs exist for claims management |
| Documents | In dev_docs | Document upload/viewer specs |
| Communication | In dev_docs | Email template, notification specs |
| Customer Portal | In dev_docs | Portal screens |
| Carrier Portal | In dev_docs | Mobile portal screens |
| Contracts | In dev_docs | Contract management screens |

---

## Gap Analysis

### Routes with specs (covered):
- All auth flows (login, register, forgot/reset password)
- All major CRM screens (companies, contacts, leads)
- All Sales screens including Load Planner
- All TMS Core operational screens (design only — frontend not built)
- All Carrier screens (design exists even for unbuilt screens)
- Core Accounting screens
- Core Commission screens

### Routes WITHOUT matching specs (gaps):
- `/activities` — no dedicated spec (uses activity components from CRM)
- `/profile/security` — may be in auth admin spec
- `/admin/settings` — covered in auth admin spec
- `/load-planner/history` — no spec found
- `/superadmin/tenant-services` — no spec found
- `/load-board/search` — no spec found (load board spec covers main view)
- Commission sub-pages (`/commissions/reps/`, `/commissions/transactions/`) — may be in commission spec

### Specs without matching routes (phantom specs):
- Many Phase 2+ specs in dev_docs (compliance center, carrier scorecard, etc.) — backend/frontend not built

---

## Spec Depth Assessment

| Service | Spec Quality | Completeness |
|---------|-------------|-------------|
| TMS Core | Excellent (15-section, 600-800 lines each) | 95% — all major screens covered |
| Carrier Management | Excellent | 90% |
| CRM | Excellent | 90% |
| Auth & Admin | Excellent | 85% |
| Sales & Quotes | Excellent | 85% |
| Accounting | Good | 75% |
| Commission | Good | 70% |
| Load Board | Good | 65% |

---

## How to Use Specs

When building a screen:
1. Navigate to `dev_docs/12-Rabih-design-Process/{service-folder}/{screen}.md`
2. The spec contains: Overview, User Personas, Screen States (loading/error/empty/populated), Interactions, Components, API calls, Edge cases, Accessibility, Responsive design, Error messages, Business rules, Success criteria, Implementation notes, Quality gates
3. Cross-reference with service hub (`dev_docs_v3/01-services/`) for actual API endpoint status
4. Verify endpoint exists before building frontend that calls it
