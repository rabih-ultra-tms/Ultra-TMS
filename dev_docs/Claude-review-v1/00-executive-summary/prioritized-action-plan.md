# Prioritized Action Plan - Ultra TMS

**Date:** 2026-02-07
**Scope:** Next 16 weeks of development, re-sequenced based on review findings
**Team:** 2 developers, 30 hrs/week each = 60 hrs/week

---

## Guiding Principles

1. **Fix before build** - Address critical bugs and design quality before adding new features
2. **Components before pages** - Build reusable components first, then compose pages
3. **P0 only for MVP** - Ship a broker-usable system with 8 services, not 38
4. **Design gates enforced** - Every UI merge must pass the quality gate checklist
5. **Test as you go** - 50% coverage target on all new frontend code

---

## Phase 0: Emergency Fixes (Week 1)

**Goal:** Make existing features actually work

| Task | Owner | Hours | Priority |
|------|-------|:-----:|:--------:|
| Fix carrier detail 404 - create `carriers/[id]/page.tsx` | Dev 1 | 8 | P0 |
| Fix load history detail 404 - create `load-history/[id]/page.tsx` | Dev 1 | 8 | P0 |
| Replace all `window.confirm()` with ConfirmDialog component | Dev 2 | 4 | P0 |
| Replace all bare "Loading..." text with proper Skeleton/LoadingState | Dev 2 | 4 | P0 |
| Create shared status color constants file (`lib/constants/status-colors.ts`) | Dev 2 | 4 | P0 |
| Replace hardcoded status colors in carriers page with shared constants | Dev 1 | 2 | P0 |
| Fix missing error boundaries in auth pages | Dev 2 | 4 | P0 |
| **Subtotal** | | **34 hrs** | |

**Deliverable:** All existing pages functional, no 404s, no browser confirm() dialogs.

---

## Phase 1: Design System Foundation (Week 2)

**Goal:** Establish the visual quality bar for all future development

| Task | Owner | Hours | Priority |
|------|-------|:-----:|:--------:|
| Create `lib/design-tokens.ts` - export colors, spacing, typography, border-radius as constants | Dev 1 | 6 | P0 |
| Create `StatusBadge` component using shared status colors | Dev 1 | 4 | P1 |
| Create `KPICard` component | Dev 1 | 6 | P1 |
| Create `FilterBar` component (search + status chips + more filters) | Dev 2 | 8 | P1 |
| Install missing shadcn components (radio-group, accordion, breadcrumb, chart, etc.) | Dev 2 | 2 | P1 |
| Create `DataGrid` component (table + sort + filter + pagination) | Dev 1 | 16 | P1 |
| Write design quality gate checklist (markdown) | Dev 2 | 3 | P0 |
| Set up ESLint rule to prevent arbitrary Tailwind values (`bg-[#xxx]`) | Dev 2 | 2 | P1 |
| **Subtotal** | | **47 hrs** | |

**Deliverable:** Design token system, 4 new foundation components, quality gate process.

---

## Phase 2: Pattern Library + Carrier Refactor (Weeks 3-4)

**Goal:** Establish page patterns and prove them by refactoring the carrier page

| Task | Owner | Hours | Priority |
|------|-------|:-----:|:--------:|
| Define List Page pattern template (header → stats → filters → table → pagination) | Dev 1 | 8 | P0 |
| Refactor carrier page: extract `CarrierTable`, `CarrierStats`, `CarrierFilters`, `CarrierActions` | Dev 1 | 16 | P1 |
| Add tests for extracted carrier components | Dev 1 | 8 | P1 |
| Define Detail Page pattern template (breadcrumb → header → tabs → sidebar) | Dev 2 | 8 | P0 |
| Build carrier detail page using Detail Page pattern | Dev 2 | 16 | P0 |
| Define Form Page pattern template (sections → sticky footer) | Dev 2 | 6 | P1 |
| Create `DateRangePicker` component | Dev 1 | 8 | P1 |
| Create `LoadStatusBadge` component | Dev 2 | 3 | P1 |
| Create `StopList` component | Dev 2 | 6 | P1 |
| Reprioritize roadmap: document P0 MVP scope (this becomes the new Phase A plan) | Both | 8 | P0 |
| **Subtotal** | | **87 hrs** | |

**Deliverable:** 3 page pattern templates, refactored carrier module as reference, P0 MVP scope defined.

---

## Phase 3: TMS Core - Orders (Weeks 5-7)

**Goal:** Build the Order module - the entry point to the TMS workflow

| Task | Owner | Hours | Priority |
|------|-------|:-----:|:--------:|
| **Backend:** Order service - CRUD, validation, status transitions | Dev 1 | 24 | P0 |
| **Backend:** Order controller + DTOs + tests | Dev 1 | 16 | P0 |
| **Frontend:** Order Entry form (multi-section, stops, cargo details) | Dev 2 | 24 | P0 |
| **Frontend:** Orders List page (using List Page pattern) | Dev 2 | 12 | P0 |
| **Frontend:** Order Detail page (using Detail Page pattern) | Dev 2 | 16 | P0 |
| **Backend:** Stop management service | Dev 1 | 12 | P0 |
| **Component:** `CustomerSelector` (searchable customer picker with preview) | Dev 2 | 8 | P1 |
| **Component:** `EquipmentSelector` | Dev 1 | 6 | P1 |
| **Tests:** Order module integration tests | Dev 1 | 8 | P1 |
| **Subtotal** | | **126 hrs** | |

**Deliverable:** Working order creation, listing, and detail views. Orders flow from customer request to actionable record.

---

## Phase 4: TMS Core - Loads & Dispatch (Weeks 8-10)

**Goal:** Build the Load module and Dispatch Board - the heart of the TMS

| Task | Owner | Hours | Priority |
|------|-------|:-----:|:--------:|
| **Backend:** Load service - create from order, status machine, carrier assignment | Dev 1 | 24 | P0 |
| **Backend:** Load controller + DTOs + tests | Dev 1 | 12 | P0 |
| **Component:** `LoadCard` (compact load summary for board and lists) | Dev 2 | 8 | P0 |
| **Component:** `LoadTimeline` (lifecycle event timeline) | Dev 2 | 8 | P0 |
| **Frontend:** Loads List page | Dev 2 | 12 | P0 |
| **Frontend:** Load Detail page (header + tabs: overview, stops, tracking, documents, financials) | Dev 2 | 20 | P0 |
| **Component:** `KanbanBoard` (draggable lanes for dispatch) | Dev 1 | 16 | P0 |
| **Frontend:** Dispatch Board page (the keystone screen) | Dev 1 | 24 | P0 |
| **Component:** `CarrierSelector` (search carriers by lane + equipment + rate history) | Dev 2 | 12 | P0 |
| **Backend:** Check call service | Dev 1 | 8 | P1 |
| **Frontend:** Check Call interface | Dev 2 | 8 | P1 |
| **Subtotal** | | **152 hrs** | |

**Deliverable:** Working load management, dispatch board with carrier assignment, check call logging. A broker can now book and track loads.

---

## Phase 5: Operations Essentials (Weeks 11-13)

**Goal:** Add the documents and tracking that make loads operational

| Task | Owner | Hours | Priority |
|------|-------|:-----:|:--------:|
| **Backend:** Rate confirmation template engine (PDF generation) | Dev 1 | 16 | P0 |
| **Frontend:** Rate con preview and send workflow | Dev 2 | 12 | P0 |
| **Backend:** FMCSA SAFER API integration | Dev 1 | 12 | P0 |
| **Frontend:** Carrier compliance status display | Dev 2 | 6 | P0 |
| **Backend:** BOL generation from order/load data | Dev 1 | 12 | P1 |
| **Frontend:** Tracking Map (basic - check call locations on map) | Dev 2 | 16 | P1 |
| **Frontend:** Operations Dashboard (KPIs, today's loads, exceptions) | Dev 2 | 16 | P1 |
| **Backend:** Notification service (email alerts for load status changes) | Dev 1 | 8 | P1 |
| **Subtotal** | | **98 hrs** | |

**Deliverable:** Rate confirmations auto-generated, FMCSA carrier verification, basic tracking, operations dashboard.

---

## Phase 6: Financial Core (Weeks 14-16)

**Goal:** Complete the revenue cycle - invoice and get paid

| Task | Owner | Hours | Priority |
|------|-------|:-----:|:--------:|
| **Backend:** Invoice service (auto-generate from delivered loads) | Dev 1 | 16 | P0 |
| **Frontend:** Invoice list + detail + PDF preview | Dev 2 | 16 | P0 |
| **Backend:** Carrier settlement service | Dev 1 | 12 | P0 |
| **Frontend:** Settlement list + detail | Dev 2 | 12 | P0 |
| **Backend:** AR aging report data | Dev 1 | 8 | P1 |
| **Frontend:** Basic accounting dashboard | Dev 2 | 12 | P1 |
| **Backend:** QuickBooks sync foundation | Dev 1 | 16 | P2 |
| **Subtotal** | | **92 hrs** | |

**Deliverable:** Customer invoicing, carrier payments, AR aging. A broker can now get paid.

---

## Summary

| Phase | Weeks | Hours | What You Get |
|-------|:-----:|:-----:|-------------|
| 0: Emergency Fixes | 1 | 34 | Existing features work |
| 1: Design Foundation | 2 | 47 | Visual quality bar established |
| 2: Patterns + Refactor | 3-4 | 87 | Page patterns proven, carrier module refactored |
| 3: Orders | 5-7 | 126 | Order creation and management |
| 4: Loads & Dispatch | 8-10 | 152 | Load management, dispatch board, check calls |
| 5: Operations | 11-13 | 98 | Rate cons, FMCSA, tracking, dashboard |
| 6: Financial | 14-16 | 92 | Invoicing, settlements, AR |
| **Total** | **16** | **636 hrs** | **A broker-usable 3PL TMS** |

At 60 hrs/week (2 devs × 30 hrs), 636 hours = ~10.6 weeks of work. The 16-week timeline includes buffer for bugs, design reviews, testing, and iteration.

---

## What This MVP Includes

After 16 weeks, a freight broker can:
- Log in with role-based access
- Manage customers, contacts, and leads (CRM)
- Create and manage carrier profiles
- Verify carrier authority via FMCSA
- Enter customer orders
- Create loads from orders
- Assign carriers to loads via dispatch board
- Send automated rate confirmations
- Log check calls and track load status
- View loads on a tracking map
- Generate customer invoices
- Process carrier settlements
- View AR aging and financial KPIs
- See an operations dashboard with real data

## What This MVP Does NOT Include (Deferred to Phase B)
- EDI integration
- Load board posting (DAT/Truckstop)
- GPS tracking integration
- Customer portal
- Carrier portal
- Advanced analytics
- Claims management
- Commission tracking
- Safety module
- Rate intelligence
- Document management (beyond rate cons and BOLs)
- Workflow automation
