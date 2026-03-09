# Service Hub: Command Center (39)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-08
> **Original definition:** New service — extends existing Dispatch Board into unified operational hub
> **Design specs:** `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md` (785 lines, Rabih V1)
> **v2 hub (historical):** N/A — new service, not in v2

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B+ (7.5/10) |
| **Confidence** | High — dispatch board codebase verified 2026-03-08 (5,801 LOC total) |
| **Last Verified** | 2026-03-08 |
| **Backend** | Partial — TMS Core provides 51 endpoints for loads/orders/dispatch. Quotes (47), Carriers (40), Accounting (30+) backends exist. No unified Command Center controller yet. |
| **Frontend** | Foundation Built — 13 dispatch components (4,095 LOC), 2 hooks (1,136 LOC), 3 test files (570 LOC). Needs enhancement into multi-domain Command Center. |
| **Tests** | Partial — 3 frontend test files (dispatch-board, drag-drop, realtime), 0 integration tests |
| **PROTECTED FILE** | `apps/web/components/tms/dispatch/dispatch-detail-drawer.tsx` — 1,535 LOC, production drawer (enhance, don't rebuild) |
| **Active Blockers** | QS-001 (WebSocket gateway for real-time tracking), QS-014 (Prisma tenant isolation extension) |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | This hub file + master plan in `plans/silly-moseying-fiddle.md` |
| Design Specs | Done | Rabih V1 dispatch board spec (785 lines) + Command Center vision in master plan |
| Backend — Loads/Dispatch | Production | TMS Core: 51 endpoints in `apps/api/src/modules/tms/` |
| Backend — Quotes | Production | Sales: 47 endpoints in `apps/api/src/modules/sales/` |
| Backend — Carriers | Production | Carriers: 40 endpoints in `apps/api/src/modules/carrier/` |
| Backend — Accounting | Production | Accounting: 30+ endpoints in `apps/api/src/modules/accounting/` |
| Backend — WebSocket | Not Built | QS-001: `/dispatch`, `/tracking`, `/notifications` namespaces needed |
| Backend — Command Center Controller | Not Built | Aggregation endpoint for multi-domain KPIs + alerts |
| Frontend — Dispatch Board | Built (4,095 LOC) | 13 components in `components/tms/dispatch/` — foundation for Command Center |
| Frontend — Command Center Shell | Not Built | New route `/command-center`, domain tabs, layout modes |
| Frontend — Polymorphic Drawer | Not Built | Extends dispatch-detail-drawer to support quote/carrier/order/alert types |
| Frontend — Quotes Panel | Not Built | Reuses existing quote components + `useQuotes` hook |
| Frontend — Carriers Panel | Not Built | Reuses existing carrier components + `useCarriers` hook |
| Frontend — Tracking Panel | Not Built | Google Maps + truck positions, depends on WebSocket (QS-001) |
| Frontend — Alerts Panel | Not Built | Aggregates stale check calls, expired docs, at-risk loads |
| React Hooks | Built (1,136 LOC) | `use-dispatch.ts` (611 LOC), `use-dispatch-ws.ts` (525 LOC) |
| Tests | Partial (570 LOC) | 3 test files: board, drag-drop, realtime |
| Security | Inherits | All domain endpoints already have JwtAuthGuard + tenantId |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| **Dispatch Board** | `/operations/dispatch` | **Built** | **7/10** | Existing — stays unchanged. 4,095 LOC, kanban + table + drawer. |
| Command Center — Board View | `/command-center` | Not Built | — | Default landing. Loads kanban/table with domain tabs above. |
| Command Center — Split View | `/command-center?layout=split` | Not Built | — | Board (60%) + map/panel (40%) side-by-side. |
| Command Center — Dashboard View | `/command-center?layout=dashboard` | Not Built | — | Widget grid: KPIs, charts, alerts, activity feed. For ops managers. |
| Command Center — Focus View | `/command-center?layout=focus` | Not Built | — | Single entity full-width detail. Deep-dive mode. |
| Command Center — Quotes Tab | `/command-center?tab=quotes` | Not Built | — | Active quotes pipeline, pending approvals, click → quote drawer. |
| Command Center — Carriers Tab | `/command-center?tab=carriers` | Not Built | — | Available carriers, capacity, insurance status, click → carrier drawer. |
| Command Center — Tracking Tab | `/command-center?tab=tracking` | Not Built | — | Live map overlay, truck positions, ETAs. Depends on QS-001. |
| Command Center — Alerts Tab | `/command-center?tab=alerts` | Not Built | — | Stale check calls, expired docs, at-risk loads. Click → relevant drawer. |

---

## 4. API Endpoints

### Existing Endpoints (Consumed by Command Center)

The Command Center consumes endpoints from multiple services — it does NOT duplicate them:

| Domain | Controller | Endpoint Count | Key Endpoints |
|--------|-----------|----------------|---------------|
| Loads/Dispatch | TmsController | 51 | `GET /loads`, `PATCH /loads/:id/status`, `GET /loads/:id/stops`, `GET /loads/:id/check-calls` |
| Quotes | SalesController | 47 | `GET /quotes`, `POST /quotes`, `PATCH /quotes/:id/status`, `GET /rate-contracts` |
| Carriers | CarrierController | 40 | `GET /carriers`, `GET /carriers/:id`, `GET /carriers/insurance/expiring`, `GET /carriers/:id/performance` |
| Accounting | AccountingController | 30+ | `GET /invoices`, `GET /settlements`, dashboard endpoint (QS-003) |
| Check Calls | CheckCallController | ~8 | `GET /loads/:id/check-calls`, `POST /loads/:id/check-calls` |

### New Endpoints (Command Center-Specific)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/command-center/kpis` | CommandCenterController | Not Built | Multi-domain KPI aggregation (loads today, quotes pending, carriers available, revenue) |
| GET | `/api/v1/command-center/alerts` | CommandCenterController | Not Built | Aggregated alerts: stale check calls, expired docs, unassigned loads, at-risk deliveries |
| GET | `/api/v1/command-center/activity` | CommandCenterController | Not Built | Recent activity feed across all domains |
| GET | `/api/v1/command-center/carrier-availability` | CommandCenterController | Not Built | Available carriers with capacity for load matching |
| POST | `/api/v1/command-center/auto-match` | CommandCenterController | Not Built | AI carrier matching: lane history, rate, availability, scorecard |
| POST | `/api/v1/command-center/bulk-dispatch` | CommandCenterController | Not Built | Assign multiple loads to same carrier + send rate cons |
| WS | `/dispatch` | DispatchGateway | Not Built | Real-time load status updates (QS-001) |
| WS | `/tracking` | TrackingGateway | Not Built | Live truck position updates (QS-001) |
| WS | `/notifications` | NotificationGateway | Not Built | System alerts and notifications (QS-001) |

**Total: ~180 consumed + 9 new = ~189 endpoints accessible from Command Center**

---

## 5. Components

### Existing — Dispatch Board (13 components, 4,095 LOC — PRESERVE)

| Component | Path | LOC | Status | Role in Command Center |
|-----------|------|-----|--------|----------------------|
| DispatchBoard | `components/tms/dispatch/dispatch-board.tsx` | 240 | Built | Imported as Loads view container |
| DispatchToolbar | `components/tms/dispatch/dispatch-toolbar.tsx` | 332 | Built | Extended → CommandCenterToolbar (add domain tabs) |
| DispatchDataTable | `components/tms/dispatch/dispatch-data-table.tsx` | 489 | Built | Used as-is for Loads table view |
| DispatchDetailDrawer | `components/tms/dispatch/dispatch-detail-drawer.tsx` | 1,535 | Built | Extended → UniversalDetailDrawer (polymorphic) |
| KanbanBoard | `components/tms/dispatch/kanban-board.tsx` | 364 | Built | Used as-is for Loads kanban view |
| KanbanLane | `components/tms/dispatch/kanban-lane.tsx` | 106 | Built | Used as-is within KanbanBoard |
| LoadCard | `components/tms/dispatch/load-card.tsx` | 407 | Built | Used as-is in kanban + table views |
| DispatchStatsBar | `components/tms/dispatch/dispatch-stats-bar.tsx` | 65 | Built | Replaced by CommandCenterKPIStrip (multi-domain) |
| DispatchBulkToolbar | `components/tms/dispatch/dispatch-bulk-toolbar.tsx` | 138 | Built | Enhanced with cross-domain bulk actions |
| NewLoadDialog | `components/tms/dispatch/new-load-dialog.tsx` | 185 | Built | Used as-is for quick load creation |
| NewQuoteDialog | `components/tms/dispatch/new-quote-dialog.tsx` | 59 | Built | Used as-is for quick quote creation |
| DispatchBoardSkeleton | `components/tms/dispatch/dispatch-board-skeleton.tsx` | 111 | Built | Used as-is for suspense fallback |
| DispatchKPIStrip | `components/tms/dispatch/dispatch-kpi-strip.tsx` | 64 | Built | Alternate KPI layout — reused in dashboard view |

### New — Command Center (planned)

| Component | Path | Est. LOC | Status | Notes |
|-----------|------|----------|--------|-------|
| CommandCenter | `components/tms/command-center/command-center.tsx` | ~300 | Not Built | Main container: state, layout mode, active tab, drawer management |
| CommandCenterToolbar | `components/tms/command-center/command-center-toolbar.tsx` | ~250 | Not Built | Domain tabs (Loads/Quotes/Carriers/Tracking/Alerts) + universal search + layout toggle |
| CommandCenterKPIStrip | `components/tms/command-center/command-center-kpi-strip.tsx` | ~200 | Not Built | Multi-domain KPIs: loads today, quotes pending, carriers available, revenue |
| UniversalDetailDrawer | `components/tms/command-center/universal-detail-drawer.tsx` | ~400 | Not Built | Polymorphic drawer: load/quote/carrier/order/alert types, renders appropriate content |
| QuotesPanel | `components/tms/command-center/panels/quotes-panel.tsx` | ~300 | Not Built | Active quotes pipeline, pending approvals, status kanban |
| CarriersPanel | `components/tms/command-center/panels/carriers-panel.tsx` | ~300 | Not Built | Available carriers, capacity indicators, insurance status, scorecard badges |
| TrackingPanel | `components/tms/command-center/panels/tracking-panel.tsx` | ~400 | Not Built | Google Maps with truck markers, ETAs, geofence alerts |
| AlertsPanel | `components/tms/command-center/panels/alerts-panel.tsx` | ~250 | Not Built | Aggregated alerts: stale loads, expired docs, at-risk deliveries |
| SplitLayout | `components/tms/command-center/layouts/split-layout.tsx` | ~150 | Not Built | Board (60%) + panel (40%) side-by-side |
| DashboardLayout | `components/tms/command-center/layouts/dashboard-layout.tsx` | ~300 | Not Built | Widget grid for ops managers |
| ActivityFeed | `components/tms/command-center/widgets/activity-feed.tsx` | ~200 | Not Built | Recent actions across all domains |
| CarrierMatchCard | `components/tms/command-center/widgets/carrier-match-card.tsx` | ~150 | Not Built | AI carrier suggestion result card |

### Reused from Other Services (imported, not copied)

| Component | Source Service | Used In |
|-----------|---------------|---------|
| QuoteDetailOverview | Sales (`components/sales/quotes/quote-detail-overview.tsx`) | Quote drawer content |
| QuoteActionsBar | Sales (`components/sales/quotes/quote-actions-bar.tsx`) | Quote drawer actions |
| QuoteStatusBadge | Sales (`components/sales/quotes/quote-status-badge.tsx`) | Quotes panel cards |
| CarrierOverviewCard | Carriers (`components/carriers/carrier-overview-card.tsx`) | Carrier drawer content |
| CarrierInsuranceSection | Carriers (`components/carriers/carrier-insurance-section.tsx`) | Carrier drawer tab |
| ScoreGauge | Carriers (`components/carriers/scorecard/score-gauge.tsx`) | Carrier panel badges |
| TierBadge | Carriers (`components/carriers/tier-badge.tsx`) | Carrier panel cards |

---

## 6. Hooks

### Existing Hooks (1,136 LOC — PRESERVE)

| Hook | Path | LOC | Endpoints Used | Notes |
|------|------|-----|---------------|-------|
| `useDispatch` | `lib/hooks/tms/use-dispatch.ts` | 611 | Multiple load/dispatch endpoints | Board data, filters, mutations, status updates |
| `useDispatchWs` | `lib/hooks/tms/use-dispatch-ws.ts` | 525 | WebSocket `/dispatch` | Real-time load updates, connection management |

### Hooks from Other Services (consumed by Command Center)

| Hook | Source | Used For |
|------|--------|----------|
| `useQuotes` | `lib/hooks/sales/use-quotes.ts` | Quotes panel data |
| `useCarriers` | `lib/hooks/carriers/use-carriers.ts` | Carriers panel data |
| `useCheckCalls` | `lib/hooks/tms/use-checkcalls.ts` | Alert generation (stale check calls) |
| `useInvoices` | `lib/hooks/accounting/use-invoices.ts` | Accounting widget data |

### New Hooks (planned)

| Hook | Path | Status | Notes |
|------|------|--------|-------|
| `useCommandCenter` | `lib/hooks/tms/use-command-center.ts` | Not Built | Multi-domain state: active tab, layout mode, drawer state, selected entity |
| `useCommandCenterKPIs` | `lib/hooks/tms/use-command-center-kpis.ts` | Not Built | `GET /command-center/kpis` — multi-domain aggregation |
| `useCommandCenterAlerts` | `lib/hooks/tms/use-command-center-alerts.ts` | Not Built | `GET /command-center/alerts` — aggregated alerts |
| `useActivityFeed` | `lib/hooks/tms/use-activity-feed.ts` | Not Built | `GET /command-center/activity` — recent activity |
| `useCarrierMatch` | `lib/hooks/tms/use-carrier-match.ts` | Not Built | `POST /command-center/auto-match` — AI matching |
| `useTrackingWs` | `lib/hooks/tms/use-tracking-ws.ts` | Not Built | WebSocket `/tracking` — live truck positions |

---

## 7. Business Rules

1. **Single-Screen Operations:** A dispatcher MUST be able to perform all common operations (assign carrier, update status, add check call, create quote, send rate con) without navigating away from the Command Center. The universal drawer is the action surface.

2. **Drawer Priority:** Only one drawer can be open at a time. Opening a new entity closes the current drawer. Unsaved changes trigger a confirmation dialog before closing.

3. **Domain Tab Persistence:** The active domain tab persists via URL query param (`?tab=loads`). Refreshing the page returns to the same tab. Default is `loads`.

4. **Layout Mode Persistence:** The selected layout mode persists via URL query param (`?layout=board`). Options: `board` (default), `split`, `dashboard`, `focus`.

5. **Real-Time Updates:** All domain panels auto-refresh via WebSocket when available (loads, tracking). Panels without WebSocket use React Query polling (30s for quotes, 60s for carriers, 15s for alerts).

6. **Alert Priority Ranking:** Alerts are ranked by severity: (1) At-risk loads (delivery window <2 hours, no carrier), (2) Stale check calls (>4 hours since last), (3) Expired insurance (carrier on active loads), (4) Expiring documents (30-day window), (5) Unassigned loads (>1 hour old).

7. **Carrier Auto-Match Algorithm:** Suggests carriers based on: lane history (40%), rate competitiveness (25%), performance score (20%), availability (15%). Only ACTIVE carriers with valid insurance are eligible. Results sorted by composite score descending.

8. **Bulk Dispatch Rules:** Maximum 10 loads per bulk dispatch. All loads must be in PENDING or UNASSIGNED status. Selected carrier must be ACTIVE with valid insurance. Rate confirmation is auto-generated for each load in the batch.

9. **KPI Calculation:** All KPIs are tenant-scoped and real-time. Loads Today = loads with pickup date = today. Revenue Today = sum of customer rates on loads delivered today. On-Time % = (delivered within window / total delivered) × 100 for trailing 30 days.

10. **Soft Delete Compliance:** All Command Center queries MUST include `deletedAt: null` filter. This is enforced via Prisma Client Extension (QS-014) once implemented.

---

## 8. Data Model

The Command Center does NOT own any Prisma models — it consumes models from other services:

### Primary Models (from TMS Core)
```
Load {
  id              String (UUID)
  loadNumber      String (unique per tenant)
  status          LoadStatus (PENDING, DISPATCHED, IN_TRANSIT, AT_PICKUP, AT_DELIVERY, DELIVERED, CANCELLED, ON_HOLD)
  customerId      String (FK → Customer)
  carrierId       String? (FK → Carrier)
  driverId        String? (FK → CarrierDriver)
  customerRate    Decimal
  carrierRate     Decimal?
  margin          Decimal?
  pickupDate      DateTime
  deliveryDate    DateTime
  stops           Stop[]
  checkCalls      CheckCall[]
  documents       LoadDocument[]
  tenantId        String
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}

Stop {
  id              String (UUID)
  loadId          String (FK → Load)
  type            StopType (PICKUP, DELIVERY, STOP)
  sequence        Int
  facilityName    String
  address         String
  city            String
  state           String
  zip             String
  appointmentDate DateTime?
  arrivedAt       DateTime?
  departedAt      DateTime?
  tenantId        String
}

CheckCall {
  id              String (UUID)
  loadId          String (FK → Load)
  status          CheckCallStatus
  location        String?
  latitude        Decimal?
  longitude       Decimal?
  notes           String?
  calledAt        DateTime
  nextCallDue     DateTime?
  tenantId        String
}
```

### Secondary Models (from other services)
```
Quote         — from Sales (status, customerRate, validUntil, items)
Carrier       — from Carriers (status, mcNumber, dotNumber, isPreferred, performanceScore)
CarrierInsurance — from Carriers (type, expiresAt, coverageAmount, status)
Invoice       — from Accounting (status, amount, dueDate)
Settlement    — from Accounting (status, amount, carrier)
Order         — from TMS Core (status, customer, origin, destination)
```

### Command Center-Specific (new table — optional)

```
CommandCenterPreference {
  id              String (UUID)
  userId          String (FK → User)
  defaultTab      String (default: 'loads')
  defaultLayout   String (default: 'board')
  pinnedAlerts    String[] (alert type IDs)
  kpiWidgets      Json (widget configuration)
  tenantId        String
  createdAt       DateTime
  updatedAt       DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `layout` query param | Must be one of: `board`, `split`, `dashboard`, `focus` | Defaults to `board` (no error, graceful fallback) |
| `tab` query param | Must be one of: `loads`, `quotes`, `carriers`, `tracking`, `alerts` | Defaults to `loads` |
| Bulk dispatch — load count | Max 10 loads per batch | "Maximum 10 loads per bulk dispatch" |
| Bulk dispatch — load status | All loads must be PENDING or UNASSIGNED | "Load {loadNumber} is not eligible for dispatch (status: {status})" |
| Bulk dispatch — carrier | Must be ACTIVE with valid insurance | "Carrier is not eligible for load assignment" |
| Auto-match — load | Must have origin, destination, and pickup date | "Load must have origin, destination, and pickup date for carrier matching" |
| Drawer unsaved changes | Prompt before close if form is dirty | "You have unsaved changes. Discard?" |

---

## 10. Status States

### Command Center Layout Modes
```
BOARD (default) → SPLIT (toggle split view)
BOARD → DASHBOARD (toggle dashboard)
BOARD → FOCUS (click entity → full-width detail)
SPLIT → BOARD (toggle off split)
DASHBOARD → BOARD (toggle off dashboard)
FOCUS → BOARD (close focus / press Escape)
```

### Drawer States
```
CLOSED → OPEN (click entity card/row)
OPEN → EDITING (click Edit in drawer)
EDITING → OPEN (Save or Cancel)
OPEN → CLOSED (click X, press Escape, or click outside)
EDITING → CONFIRM_CLOSE (attempt close with unsaved changes)
CONFIRM_CLOSE → CLOSED (user confirms discard)
CONFIRM_CLOSE → EDITING (user cancels discard)
```

### Alert States
```
NEW → ACKNOWLEDGED (user clicks alert)
ACKNOWLEDGED → RESOLVED (user takes action — e.g., adds check call, assigns carrier)
RESOLVED → ARCHIVED (auto, after 24 hours)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| WebSocket gateway not implemented (QS-001) | P0 Blocker | `apps/api/src/` | Open — blocks Tracking panel |
| Prisma tenant isolation extension not implemented (QS-014) | P0 Security | `apps/api/prisma/` | Open — blocks secure multi-domain queries |
| Dispatch drawer is 1,535 LOC monolith | P1 Maintainability | `dispatch-detail-drawer.tsx` | Open — needs decomposition for polymorphic drawer |
| No unified KPI aggregation endpoint | P1 Feature | Backend | Open — needed for multi-domain KPI strip |
| Google Maps API key not configured for tracking | P1 Config | `.env` | Open — needed for Tracking panel |
| `use-dispatch-ws.ts` may not reconnect gracefully | P2 Reliability | `lib/hooks/tms/use-dispatch-ws.ts` | Needs verification |
| 3 different envelope unwrapping patterns in hooks | P2 Consistency | Multiple hook files | Open — cross-cutting (see addendum finding #8) |

---

## 12. Tasks

### Prerequisites (Must Complete First)
| Task ID | Title | Effort | Status | Dependency |
|---------|-------|--------|--------|------------|
| QS-001 | WebSocket gateway (`/notifications` namespace minimum) | M (4-6h) | Open | Blocks Tracking panel |
| QS-014 | Prisma Client Extension (tenant isolation) | M (4-8h) | Open | Blocks secure queries |
| QS-003 | Accounting dashboard endpoint | S (2-4h) | Open | Blocks accounting widget |

### Build Sequence (Command Center)
| Task ID | Title | Effort | Status | Dependencies |
|---------|-------|--------|--------|-------------|
| CC-001 | Create `/command-center` route + CommandCenter container | S (4h) | Not Started | None |
| CC-002 | Build CommandCenterToolbar with domain tabs | S (3h) | Not Started | CC-001 |
| CC-003 | Build CommandCenterKPIStrip (multi-domain) | S (3h) | Not Started | CC-001, backend KPI endpoint |
| CC-004 | Build UniversalDetailDrawer (polymorphic) | M (6h) | Not Started | CC-001 |
| CC-005 | Build QuotesPanel | S (4h) | Not Started | CC-004 |
| CC-006 | Build CarriersPanel | S (4h) | Not Started | CC-004 |
| CC-007 | Build TrackingPanel (Google Maps + WebSocket) | M (8h) | Not Started | CC-004, QS-001 |
| CC-008 | Build AlertsPanel | S (4h) | Not Started | CC-004 |
| CC-009 | Build SplitLayout mode | S (4h) | Not Started | CC-005, CC-006, CC-007 |
| CC-010 | Build DashboardLayout mode (widget grid) | M (6h) | Not Started | CC-003, CC-008 |
| CC-011 | Build ActivityFeed widget | S (3h) | Not Started | CC-010 |
| CC-012 | Build CarrierAutoMatch (AI matching) | M (5h) | Not Started | CC-006 |
| CC-013 | Build BulkDispatch enhancement | S (3h) | Not Started | CC-004 |
| CC-014 | Backend: CommandCenterController (KPIs, alerts, activity, match) | M (6h) | Not Started | QS-014 |
| CC-015 | Integration tests + E2E (Playwright) | M (8h) | Not Started | All CC-* tasks |

### Backlog (Post-MVP Enhancements)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CC-020 | Keyboard shortcuts (Vim-style navigation) | S (3h) | P2 |
| CC-021 | Saved views / custom filters | M (6h) | P2 |
| CC-022 | Accounting panel (unbilled loads, pending settlements) | M (5h) | P2 |
| CC-023 | Custom KPI widget configuration (drag-drop) | L (8h) | P3 |
| CC-024 | Voice commands integration | L (12h) | P3 |
| CC-025 | Mobile-responsive Command Center | L (10h) | P3 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Dispatch Board (base design) | Full 15-section Rabih V1 | `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md` |
| Command Center Vision | Master Plan Phase 4 | `plans/silly-moseying-fiddle.md` (Phase 4 section) |
| Load Detail (drawer reference) | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/06-load-detail.md` |
| Quote Detail (drawer reference) | Full 15-section | `dev_docs/12-Rabih-design-Process/03-sales/03-quote-detail.md` |
| Carrier Detail (drawer reference) | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/03-carrier-detail.md` |

**Design Principle:** The Command Center extends Rabih V1's dispatch board design with the drawer pattern as the universal interaction model. Every entity is viewable and editable from a slide-over drawer — the user never navigates away.

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Dispatch Board only (loads) | Command Center (loads + quotes + carriers + tracking + alerts) | Major scope expansion |
| Single view mode (kanban/table) | 4 layout modes (board, split, dashboard, focus) | Enhanced |
| Load-only drawer | Polymorphic drawer (load, quote, carrier, order, alert) | Enhanced |
| Manual carrier assignment | AI auto-match + bulk dispatch | New capability |
| No real-time tracking | Live map with truck positions via WebSocket | New capability |
| 13 components (4,095 LOC) | ~25 components (~7,000+ LOC estimated) | ~12 new components |
| 2 hooks (1,136 LOC) | ~8 hooks (~2,500+ LOC estimated) | ~6 new hooks |
| 3 test files (570 LOC) | Target: 10+ test files + Playwright E2E | Significant testing needed |
| Not a named service | Service #39 in dev_docs_v3 | Formalized |

---

## 15. Dependencies

**Depends on:**
- **Auth & Admin** (JWT, roles, tenantId — all requests are tenant-scoped)
- **TMS Core** (Load, Order, Stop, CheckCall data + 51 endpoints)
- **Sales & Quotes** (Quote data + 47 endpoints)
- **Carrier Management** (Carrier, Insurance, Driver data + 40 endpoints)
- **Accounting** (Invoice, Settlement data + 30+ endpoints)
- **QS-001: WebSocket Gateway** (real-time for Tracking panel + load status updates)
- **QS-014: Prisma Client Extension** (secure multi-tenant queries across all domains)
- **Google Maps API** (Tracking panel map rendering)

**Depended on by:**
- No other service depends on Command Center — it is the consumer, not the provider
- User workflows depend on it as the primary operational interface

**PROTECT LIST:**
- `apps/web/components/tms/dispatch/` — All 13 files (4,095 LOC). Enhance via composition, never rewrite.
- `apps/web/lib/hooks/tms/use-dispatch.ts` — 611 LOC. Shared with Command Center.
- `apps/web/lib/hooks/tms/use-dispatch-ws.ts` — 525 LOC. Shared with Command Center.

---

## File Structure

### New Files to Create
```
apps/web/
├── app/(dashboard)/command-center/
│   └── page.tsx                                          # Route entry point
├── components/tms/command-center/
│   ├── command-center.tsx                                # Main container (state, tabs, layout)
│   ├── command-center-toolbar.tsx                        # Domain tabs + universal search + layout toggle
│   ├── command-center-kpi-strip.tsx                      # Multi-domain KPI strip
│   ├── universal-detail-drawer.tsx                       # Polymorphic drawer (load/quote/carrier/order/alert)
│   ├── panels/
│   │   ├── quotes-panel.tsx                              # Quotes pipeline view
│   │   ├── carriers-panel.tsx                            # Carrier capacity view
│   │   ├── tracking-panel.tsx                            # Live map + truck positions
│   │   └── alerts-panel.tsx                              # Aggregated alerts
│   ├── layouts/
│   │   ├── split-layout.tsx                              # Board + panel side-by-side
│   │   └── dashboard-layout.tsx                          # Widget grid for managers
│   └── widgets/
│       ├── activity-feed.tsx                             # Recent actions feed
│       └── carrier-match-card.tsx                        # AI carrier match result
├── lib/hooks/tms/
│   ├── use-command-center.ts                             # Multi-domain state management
│   ├── use-command-center-kpis.ts                        # KPI aggregation hook
│   ├── use-command-center-alerts.ts                      # Alerts aggregation hook
│   ├── use-activity-feed.ts                              # Activity feed hook
│   ├── use-carrier-match.ts                              # AI carrier matching hook
│   └── use-tracking-ws.ts                                # Tracking WebSocket hook

apps/api/src/modules/
├── command-center/
│   ├── command-center.module.ts                          # NestJS module
│   ├── command-center.controller.ts                      # REST endpoints
│   ├── command-center.service.ts                         # Aggregation logic
│   └── dto/
│       ├── kpis.dto.ts                                   # KPI response shape
│       ├── alerts.dto.ts                                 # Alert response shape
│       ├── activity.dto.ts                               # Activity feed response
│       ├── auto-match.dto.ts                             # Carrier match request/response
│       └── bulk-dispatch.dto.ts                          # Bulk dispatch request/response
```

### Existing Files to Enhance (not rewrite)
```
apps/web/components/tms/dispatch/dispatch-detail-drawer.tsx   # Extract reusable drawer shell
apps/web/components/tms/dispatch/dispatch-toolbar.tsx          # Extend with domain tab awareness
apps/web/components/tms/dispatch/dispatch-bulk-toolbar.tsx     # Add cross-domain capabilities
```

### Sidebar Navigation Update
```
apps/web/components/layout/sidebar.tsx                         # Add Command Center nav item (top of Operations section)
```
