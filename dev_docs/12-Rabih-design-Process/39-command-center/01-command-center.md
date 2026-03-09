# Command Center

> Service: Command Center (Service 39) | Wave: 3 | Priority: P0
> Route: /(dashboard)/command-center | Status: Not Started
> Primary Personas: Maria Rodriguez (Dispatcher, 50+ loads/day), Sarah Chen (Operations Manager)
> Roles with Access: dispatcher, ops_manager, admin, finance_view

---

## 1. Purpose & Business Context

**What this screen does:**
The Command Center is the evolution of the Dispatch Board into a unified operational hub. It provides a single screen where dispatchers and operations managers can see, control, and act on everything across all TMS domains — loads, quotes, carriers, tracking, and alerts — without navigating away. Maria spends 80% of her shift here. Sarah uses it for morning huddles and exception monitoring.

**Business problem it solves:**
Even with a good dispatch board, dispatchers still context-switch between quotes, carrier lookup, tracking, and accounting screens. The Command Center eliminates this by surfacing all relevant domains as tabs within a single workspace, with a polymorphic drawer pattern that allows acting on any entity in-place. This reduces context-switching overhead by 60-70% and raises dispatcher throughput from 50-60 loads/day to 70-80+.

**Key business rules:**
- Inherits all Dispatch Board business rules (status transitions, tender windows, at-risk flagging).
- Domain tabs maintain independent scroll/filter state — switching tabs doesn't reset another tab's view.
- The universal drawer can show load, quote, carrier, order, or alert details. Only one drawer open at a time.
- Alert priorities: at-risk loads > stale check calls > expired insurance > expiring docs > unassigned loads.
- KPI strip shows multi-domain metrics: loads today, quotes pending, carriers available, revenue today, on-time %.
- Bulk dispatch: max 10 loads per batch, all must be PENDING/UNASSIGNED, carrier must be ACTIVE.
- AI carrier match suggests based on: lane history (40%), rate (25%), performance (20%), availability (15%).

**Success metric:**
Dispatcher throughput increases from 55 loads/day (with Dispatch Board) to 75+ loads/day (with Command Center). Average carrier assignment time drops from 3 minutes to under 90 seconds. Zero navigations away from Command Center needed for routine operations.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Command Center" in top-level nav | None (loads default view) |
| Operations Dashboard | Clicks any KPI card | `?tab=loads&status=PENDING` or relevant filter |
| Notification Center | Clicks any notification | `?tab=loads&highlight=loadId` or `?tab=alerts` |
| Direct URL | Bookmark / shared link | Route params, query filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail (full page) | Double-click load card or "Open Full Page" in drawer | `loadId` |
| Load Planner | "Create Quote" from Quick Create | None (new form) |
| Carrier Detail (full page) | "Open Full Page" in carrier drawer | `carrierId` |
| Settings | Click gear icon in toolbar | None |

**Primary trigger:**
Maria opens Command Center at shift start and keeps it open all day. It's her entire workspace. Sarah opens it for the morning huddle (Dashboard layout) and switches to Board layout when handling exceptions.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+) — Board View (Default)

```
+-----------------------------------------------------------------------------------+
|  [Sidebar 240px]  |  COMMAND CENTER CONTENT AREA                                  |
|                   +---------------------------------------------------------------+
|  ★ Command Center |  Domain Tabs                                                  |
|    Operations     |  [Loads*] [Quotes] [Carriers] [Tracking] [Alerts(3)]          |
|    - Dispatch     +---------------------------------------------------------------+
|    - Tracking     |  Toolbar Row                                                  |
|    - Check Calls  |  [Board|Split|Dashboard|Focus]  [Search___________]  [+ New v]|
|                   |  [Date: Today v] [Status v] [Equipment v] [Saved Filters v]   |
|                   +---------------------------------------------------------------+
|                   |  KPI Strip (collapsible)                                       |
|                   |  [Today:45] [Pending:12] [In Transit:23] [Revenue:$47.2K]     |
|                   |  [On-Time:94%] [Carriers:8 avail] [Alerts:3]                  |
|                   +---------------------------------------------------------------+
|                   |  Main Content (varies by tab + layout)                         |
|                   |                                                               |
|                   |  LOADS TAB — Board Layout:                                    |
|                   |  ┌─────────┬──────────┬───────────┬──────────┬──────────┐     |
|                   |  │PENDING  │TENDERED  │DISPATCHED │IN TRANSIT│DELIVERED │     |
|                   |  │ [card]  │ [card]   │ [card]    │ [card]   │ [card]   │     |
|                   |  │ [card]  │ [card]   │ [card]    │ [card]   │          │     |
|                   |  │ [card]  │          │ [card]    │ [card]   │          │     |
|                   |  │         │          │           │          │          │     |
|                   |  └─────────┴──────────┴───────────┴──────────┴──────────┘     |
|                   +---------------------------------------------------------------+
|                   |  [Bulk Toolbar: 0 selected | Select All | Assign | Status]    |
+-----------------------------------------------------------------------------------+
```

### Desktop Layout — Split View

```
+-----------------------------------------------------------------------------------+
|  [Sidebar]  |  [Domain Tabs + Toolbar]                                            |
|             +----------------------------------------+----------------------------+
|             |  Board Content (60%)                    |  Side Panel (40%)          |
|             |                                        |                            |
|             |  ┌────────┬─────────┬──────────┐       |  ┌────────────────────┐    |
|             |  │PENDING │TENDERED │DISPATCHED│       |  │ TRACKING MAP       │    |
|             |  │ [card] │ [card]  │ [card]   │       |  │ [Google Maps]      │    |
|             |  │ [card] │ [card]  │ [card]   │       |  │ 🚚 ← truck icons  │    |
|             |  │ [card] │        │ [card]   │       |  │                    │    |
|             |  └────────┴─────────┴──────────┘       |  │ or: ALERTS PANEL   │    |
|             |                                        |  │ or: QUOTES PANEL   │    |
|             +----------------------------------------+----------------------------+
```

### Desktop Layout — Dashboard View

```
+-----------------------------------------------------------------------------------+
|  [Sidebar]  |  [Domain Tabs + Toolbar]                                            |
|             +---------------------------------------------------------------+     |
|             |  Widget Grid (responsive)                                     |     |
|             |  ┌──────────────┬──────────────┬──────────────┐               |     |
|             |  │ Loads Today  │ Revenue      │ On-Time %    │               |     |
|             |  │     45       │   $47.2K     │    94%       │               |     |
|             |  ├──────────────┼──────────────┤──────────────┤               |     |
|             |  │ Load Status  │ Alerts (3)   │ Carrier      │               |     |
|             |  │ [pie chart]  │ [alert list] │ Availability │               |     |
|             |  │              │              │ [bar chart]  │               |     |
|             |  ├──────────────┴──────────────┼──────────────┤               |     |
|             |  │ Activity Feed               │ Quote        │               |     |
|             |  │ [recent actions list]        │ Pipeline     │               |     |
|             |  │                              │ [funnel]     │               |     |
|             |  └─────────────────────────────┴──────────────┘               |     |
+-----------------------------------------------------------------------------------+
```

### Drawer Overlay (40-45% viewport width, slides from right)

```
+-----------------------------------------------------------------------------------+
|  [Board Content]               |  ┌─── UNIVERSAL DRAWER ────────────────────┐    |
|                                |  │ [X Close]  Load #1234       [Edit] [⋮]  │    |
|   (dimmed/interactive behind)  |  │                                          │    |
|                                |  │ [Overview|Stops|Carrier|Timeline|Docs]   │    |
|                                |  │                                          │    |
|                                |  │ Status: IN TRANSIT                       │    |
|                                |  │ Carrier: ABC Trucking                    │    |
|                                |  │ Driver: John Smith                       │    |
|                                |  │ ETA: Mar 8, 2:30 PM                     │    |
|                                |  │                                          │    |
|                                |  │ ─── Stops ───                            │    |
|                                |  │ 1. Pickup: Dallas, TX ✓                  │    |
|                                |  │ 2. Delivery: Houston, TX (en route)      │    |
|                                |  │                                          │    |
|                                |  │ [Add Check Call] [Send Rate Con]         │    |
|                                |  └──────────────────────────────────────────┘    |
+-----------------------------------------------------------------------------------+
```

---

## 4. Component Hierarchy

```
CommandCenterPage
├── CommandCenter (main container)
│   ├── CommandCenterToolbar
│   │   ├── DomainTabBar (Loads | Quotes | Carriers | Tracking | Alerts)
│   │   ├── LayoutModeToggle (Board | Split | Dashboard | Focus)
│   │   ├── UniversalSearch
│   │   ├── FilterBar (context-sensitive per tab)
│   │   └── QuickCreateDropdown (+ New Load | + New Quote)
│   ├── CommandCenterKPIStrip
│   │   └── KPICard × 7 (loads, pending, transit, revenue, on-time, carriers, alerts)
│   ├── [Layout Mode: Board]
│   │   ├── DispatchBoard (existing — imported)
│   │   │   ├── KanbanBoard / DispatchDataTable (toggle)
│   │   │   ├── LoadCard × N
│   │   │   └── DispatchBulkToolbar
│   │   ├── QuotesPanel (when tab = quotes)
│   │   ├── CarriersPanel (when tab = carriers)
│   │   ├── TrackingPanel (when tab = tracking)
│   │   └── AlertsPanel (when tab = alerts)
│   ├── [Layout Mode: Split]
│   │   └── SplitLayout
│   │       ├── left: Board content (60%)
│   │       └── right: TrackingPanel or AlertsPanel (40%)
│   ├── [Layout Mode: Dashboard]
│   │   └── DashboardLayout
│   │       ├── KPI widgets (large)
│   │       ├── AlertsPanel (compact)
│   │       ├── ActivityFeed
│   │       ├── LoadStatusChart
│   │       └── QuotePipeline (compact)
│   ├── [Layout Mode: Focus]
│   │   └── Full-width entity detail (load/quote/carrier)
│   └── UniversalDetailDrawer (overlay, polymorphic)
│       ├── [type: load] → Load tabs (Overview, Stops, Carrier, Timeline, Docs, Check Calls)
│       ├── [type: quote] → QuoteDetailOverview + QuoteActionsBar + QuoteTimeline
│       ├── [type: carrier] → CarrierOverviewCard + Insurance + Docs + Drivers + Scorecard
│       ├── [type: order] → Order detail tabs
│       └── [type: alert] → Alert-specific action form
```

---

## 5. Data Requirements

**On page load (initial):**
| Data | Source | Hook | Cache Strategy |
|------|--------|------|---------------|
| Active loads (paginated) | `GET /loads?status=PENDING,TENDERED,DISPATCHED,IN_TRANSIT` | `useDispatch` | React Query, 30s stale |
| KPI aggregation | `GET /command-center/kpis` | `useCommandCenterKPIs` | React Query, 15s stale |
| Active alerts | `GET /command-center/alerts` | `useCommandCenterAlerts` | React Query, 15s stale |
| User preferences | `GET /command-center/preferences` or localStorage | `useCommandCenter` | localStorage |

**On tab switch:**
| Tab | Data | Hook |
|-----|------|------|
| Quotes | Active quotes | `useQuotes` (existing) |
| Carriers | Available carriers | `useCarriers` (existing) |
| Tracking | Truck positions | `useTrackingWs` (new, WebSocket) |
| Alerts | Aggregated alerts | `useCommandCenterAlerts` (already loaded) |

**Real-time (WebSocket):**
| Channel | Event | Action |
|---------|-------|--------|
| `/dispatch` | `load.status.changed` | Update load card in kanban/table |
| `/dispatch` | `load.assigned` | Move card to new lane, update KPIs |
| `/tracking` | `truck.position.updated` | Update marker on map |
| `/notifications` | `alert.new` | Increment alert badge, add to panel |

---

## 6. Interactions & Behaviors

### Domain Tab Switching
- Click tab → content area switches to that domain's panel
- Active tab highlighted with primary color underline
- Alert tab shows badge count of unread alerts
- Tab state persists in URL: `?tab=loads` (default), `?tab=quotes`, etc.
- Keyboard: Ctrl+1 through Ctrl+5 for quick tab switching

### Layout Mode Toggle
- 4 modes: Board (default), Split, Dashboard, Focus
- Board: Full-width kanban or table
- Split: Board (60%) + side panel (40%) — side panel shows tracking map, alerts, or quotes
- Dashboard: Widget grid with KPI cards, charts, activity feed
- Focus: Single entity detail, full-width, maximum information density
- Layout state persists in URL: `?layout=board`

### Universal Drawer
- Opens on single-click of any entity (load card, quote row, carrier name, alert item)
- Slides in from right, 40-45% viewport width
- Dimmed backdrop (click to close, or click another entity to swap)
- Drawer type determined by source: load click → load drawer, quote click → quote drawer, etc.
- Edit mode: click "Edit" button in drawer header → form fields become editable
- Unsaved changes: attempting to close dirty drawer shows confirmation dialog
- Keyboard: Escape to close, Tab to navigate fields

### Bulk Operations
- Checkbox on each load card/row for multi-select
- Bulk toolbar appears when ≥1 item selected: "X selected | Assign Carrier | Change Status | Print Rate Con"
- Bulk dispatch: select loads → click "Assign Carrier" → carrier search modal → confirm → all loads dispatched
- Max 10 loads per bulk action

### Quick Create
- "+ New" dropdown in toolbar: "New Load" or "New Quote"
- Opens inline dialog (existing NewLoadDialog / NewQuoteDialog components)
- After creation, new entity appears in the appropriate panel

### AI Carrier Match
- Button on unassigned load drawer: "Find Best Carrier"
- Calls `POST /command-center/auto-match` with load details
- Returns ranked list of 3-5 carriers with match scores
- Click carrier → auto-fills assignment, one more click to confirm

---

## 7. States

### Loading State
- Skeleton loader (DispatchBoardSkeleton) on initial load
- Individual panel skeletons for tab switches
- KPI strip shows shimmer placeholders

### Empty State
- Per tab: "No {domain} items match your filters" with clear filters button
- Quotes tab empty: "No active quotes. Create one?" with CTA
- Alerts tab empty: "All clear! No active alerts." with green checkmark

### Error State
- API failure: Toast notification + retry button in content area
- WebSocket disconnect: Yellow banner "Real-time updates paused. Reconnecting..." with manual reconnect button
- Individual panel errors don't crash the whole Command Center

### Partial Data State
- If one domain API fails (e.g., quotes), the tab shows error but other tabs work normally
- KPI strip shows "—" for failed metrics, not $0

---

## 8. Responsive Behavior

| Breakpoint | Layout Changes |
|------------|---------------|
| 1440px+ | Full layout as designed. Sidebar 240px, content fills remainder. |
| 1280-1439px | KPI strip collapses to 4 items (most important). Drawer width 45%. |
| 1024-1279px | Sidebar collapses to icon-only (64px). Split view disabled. Drawer width 50%. |
| 768-1023px | Tab icons only (no text). Dashboard layout 2-column. Drawer full-width overlay. |
| <768px | Single tab visible with horizontal scroll. Kanban single-lane. Drawer full-screen. |

---

## 9. Accessibility

- All interactive elements have ARIA labels
- Domain tabs use `role="tablist"`, `role="tab"`, `aria-selected`
- Drawer uses `role="dialog"`, `aria-modal="true"`, focus trap
- Kanban lanes use `role="list"`, load cards use `role="listitem"`
- Keyboard navigation: Tab through cards, Enter to open drawer, Escape to close
- Screen reader announces: tab switches, drawer open/close, new alerts, status changes
- Color is never the only indicator — always paired with icon or text label

---

## 10. Visual Design Tokens

```css
/* Command Center specific tokens */
--cc-tab-active: var(--primary-600);           /* Blue-600 for active tab underline */
--cc-tab-inactive: var(--gray-500);            /* Gray-500 for inactive tabs */
--cc-kpi-bg: var(--white);                     /* White background for KPI cards */
--cc-kpi-accent: var(--primary-100);           /* Light blue for KPI card hover */
--cc-drawer-bg: var(--white);                  /* White drawer background */
--cc-drawer-overlay: rgba(0, 0, 0, 0.3);      /* Drawer backdrop dim */
--cc-drawer-width: 42%;                        /* Default drawer width */
--cc-alert-badge: var(--red-500);              /* Red badge for alert count */
--cc-split-divider: var(--gray-200);           /* Divider between split panels */
--cc-tracking-dot: var(--green-500);           /* Active truck marker */
--cc-tracking-stale: var(--orange-500);        /* Stale position marker */
```

**Typography:**
- Domain tab labels: `text-sm font-medium`
- KPI values: `text-2xl font-bold`
- KPI labels: `text-xs text-muted-foreground`
- Drawer title: `text-lg font-semibold`
- Load card title: `text-sm font-medium`

---

## 11. Technical Notes

- **Framework:** Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui
- **State Management:** React Query (server state) + Zustand (layout/tab/drawer state via `useCommandCenter`)
- **URL State:** `?tab=loads&layout=board` persisted via `useSearchParams`
- **WebSocket:** Socket.io client via `useDispatchWs` (existing) + `useTrackingWs` (new)
- **Maps:** Google Maps JavaScript API via `@react-google-maps/api`
- **Drag & Drop:** Existing kanban DnD preserved (react-beautiful-dnd or similar)
- **Performance:** Virtualized lists for 100+ load cards. Memoized KPI calculations. Lazy-loaded panels (React.lazy for non-active tabs).
- **Bundle:** Code-split per panel. TrackingPanel (largest, includes Google Maps) only loaded when tab active.

---

## 12. API Contracts

### GET /api/v1/command-center/kpis
```json
{
  "data": {
    "loads": { "today": 45, "pending": 12, "inTransit": 23, "delivered": 15, "atRisk": 3 },
    "quotes": { "active": 8, "pendingApproval": 3, "expiringToday": 1 },
    "carriers": { "available": 18, "onLoad": 32, "suspended": 2 },
    "revenue": { "today": 47200, "mtd": 892000, "margin": 18.5 },
    "performance": { "onTimePercent": 94, "avgTransitDays": 2.3 }
  }
}
```

### GET /api/v1/command-center/alerts
```json
{
  "data": [
    {
      "id": "alert-uuid",
      "type": "AT_RISK_LOAD",
      "severity": "critical",
      "title": "Load #1234 unassigned for 6 hours",
      "entityType": "load",
      "entityId": "load-uuid",
      "createdAt": "2026-03-08T10:00:00Z",
      "acknowledged": false
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 3, "totalPages": 1 }
}
```

### POST /api/v1/command-center/auto-match
```json
// Request
{ "loadId": "load-uuid" }

// Response
{
  "data": [
    {
      "carrierId": "carrier-uuid",
      "carrierName": "ABC Trucking",
      "matchScore": 92,
      "factors": {
        "laneHistory": { "score": 95, "weight": 40, "trips": 12 },
        "rate": { "score": 88, "weight": 25, "avgRate": 2150 },
        "performance": { "score": 91, "weight": 20, "onTime": 96 },
        "availability": { "score": 100, "weight": 15, "trucksAvailable": 3 }
      }
    }
  ]
}
```

---

## 13. Error Handling

| Error | Handling |
|-------|----------|
| KPI endpoint fails | Show "—" for failed metrics, toast error, auto-retry 30s |
| Alerts endpoint fails | Show "Unable to load alerts" in panel, other tabs unaffected |
| WebSocket disconnect | Yellow banner with reconnect button, fall back to polling |
| Drawer save fails | Keep drawer open, show inline error, preserve form data |
| Bulk dispatch partial failure | Show results: "8/10 loads dispatched. 2 failed: [reasons]" |
| Auto-match no results | "No matching carriers found. Try broadening search criteria." |
| Tab data fails | Show error state in tab panel, other tabs work normally |

---

## 14. Future Enhancements

- **Phase 2:** Accounting panel (unbilled loads, pending settlements, revenue charts)
- **Phase 2:** Custom KPI widget configuration (drag-drop widget grid)
- **Phase 2:** Saved views with shareable URLs
- **Phase 3:** Voice commands ("assign load 1234 to ABC Trucking")
- **Phase 3:** Mobile-responsive Command Center
- **Phase 3:** Multi-monitor support (detach panels to separate windows)
- **Phase 3:** AI dispatch suggestions ("you have 5 unassigned loads in the Dallas lane — ABC Trucking has 3 trucks available there")

---

## 15. Dependencies & Integration

**Services consumed:**
- TMS Core (loads, orders, stops, check calls, dispatch)
- Sales & Quotes (quotes, rate contracts)
- Carrier Management (carriers, insurance, drivers, performance)
- Accounting (invoices, settlements — Phase 2)
- Auth & Admin (JWT, roles, permissions, tenantId)

**Infrastructure dependencies:**
- QS-001: WebSocket gateway (blocks tracking panel)
- QS-014: Prisma Client Extension (blocks secure queries)
- Google Maps API key (blocks tracking panel map)

**Reused components:**
- All 13 dispatch board components (4,095 LOC)
- Quote detail/action/status components from Sales
- Carrier overview/insurance/scorecard components from Carriers
- shadcn/ui primitives (Sheet for drawer, Tabs for domain tabs, Command for search)
