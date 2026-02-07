# Operations Dashboard

> Service: TMS Core | Wave: 2 | Priority: P0
> Route: `/operations` | Status: Not Started
> Primary Personas: Maria (Dispatcher), Sarah (Ops Manager)
> Roles with Access: Super Admin, Admin, Ops Manager, Dispatcher, Support, Read Only
> Screen Type: Dashboard

---

## 1. Purpose & Business Context

**What this screen does:**
The Operations Dashboard is the command center for freight operations. It provides an at-a-glance summary of all operational activity -- active loads, pending dispatches, deliveries, exceptions, revenue, and performance metrics. It is the first screen dispatchers and operations managers see when they open Ultra TMS each morning, and the screen they return to throughout the day to assess overall health.

**Business problem it solves:**
Without a centralized operations dashboard, dispatchers start their day by manually checking each load in a list, scrolling through dozens of entries to find what needs attention. Operations managers have no visibility into team performance without asking each dispatcher individually or running ad-hoc reports. This wastes 15-30 minutes at the start of every shift and means problems are discovered late -- often when a customer calls to complain. The dashboard eliminates this dead time by surfacing the most important metrics and exceptions in a single view, enabling dispatchers to prioritize instantly and ops managers to spot bottlenecks before they become customer-facing issues.

**Key business rules:**
- Dispatchers see personal metrics (their loads, their on-time %, their exceptions). Ops managers see team-wide metrics (all dispatchers, aggregate %).
- "Needs Attention" count includes: loads missing check calls for 4+ hours, loads with ETA past delivery appointment, loads with no carrier 24+ hours before pickup, detention exceeding free time, loads with active exceptions.
- Revenue and margin figures are hidden from Dispatcher and Support roles (visible to Ops Manager, Admin, Super Admin).
- KPI comparison periods default to "vs yesterday" but user can toggle to "vs last week" or "vs same day last month."
- Dashboard auto-refreshes every 2 minutes via WebSocket for critical metrics (load counts, exceptions). Chart data refreshes every 5 minutes.

**Success metric:**
Average time for a dispatcher to identify their first actionable task drops from 12 minutes (manual list scanning) to under 30 seconds (dashboard scan). Operations managers can detect and respond to exceptions within 5 minutes of occurrence instead of 30+ minutes.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Login | Successful authentication redirect | User role, tenant ID |
| Sidebar Navigation | Click "Operations" or "Dashboard" | None (loads fresh data) |
| Any screen (breadcrumb) | Click "Operations" in breadcrumb | None |
| Direct URL | Bookmark / shared link | Optional: `?period=today&view=personal` |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Dispatch Board | Click "Go to Dispatch Board" quick action or dispatch KPI card | Optional filters (e.g., `?status=unassigned`) |
| Orders List | Click "Active Orders" KPI card or order-related alert | `?status=BOOKED,DISPATCHED,IN_TRANSIT` |
| Loads List | Click "Active Loads" KPI card or load count | `?status=DISPATCHED,IN_TRANSIT` |
| Load Detail | Click a specific load in "Needs Attention" mini board or activity feed | `loadId` |
| Order Detail | Click a specific order in activity feed | `orderId` |
| Tracking Map | Click "View Map" quick action | None |

**Primary trigger:**
Dispatcher opens Ultra TMS at the start of their shift (Maria: 6:00 AM). This is the landing page for all operations roles. Also accessed when returning from detail screens to re-orient on overall status.

**Success criteria (user completes the screen when):**
- Dispatcher has scanned KPIs and identified highest-priority work items (loads needing attention, today's pickups/deliveries)
- Dispatcher navigates to Dispatch Board or Load Detail for first actionable task
- Ops Manager has reviewed team performance, acknowledged any critical alerts, and identified loads requiring escalation

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  PageHeader: "Operations Dashboard"                               |
|  Subtitle: "Real-time overview of your freight operations"        |
|  Right: [Date Picker] [Today | This Week | This Month]           |
+------------------------------------------------------------------+
|                                                                    |
|  +----------+ +----------+ +----------+ +----------+ +----------+ +----------+
|  | Active   | | Loads    | | Deliver- | | On-Time  | | Avg      | | Revenue  |
|  | Loads    | | Dispatch | | ies      | | %        | | Margin   | | MTD      |
|  | 247      | | Today    | | Today    | |          | |          | |          |
|  | +12 ▲    | | 34  ▲   | | 28  ▼   | | 94.2%  ▲ | | 18.3%  ▲ | | $1.2M  ▲ |
|  | ~~~~~~~~ | | ~~~~~~~~ | | ~~~~~~~~ | | ~~~~~~~~ | | ~~~~~~~~ | | ~~~~~~~~ |
|  +----------+ +----------+ +----------+ +----------+ +----------+ +----------+
|                                                                    |
|  +-------------------------------+  +-------------------------------+
|  |  Loads by Status              |  |  Alerts & Exceptions (7)      |
|  |  [===========] Planning: 12   |  |  ! Load LOAD-0847 - No check  |
|  |  [========] Pending: 8        |  |     call in 5h 23m            |
|  |  [=====] Tendered: 5         |  |  ! Load LOAD-0832 - ETA past  |
|  |  [============] Dispatched:15 |  |     delivery appointment      |
|  |  [===========================]|  |  ! Load LOAD-0819 - Detention |
|  |  In Transit: 45              |  |     at pickup (2h 15m)        |
|  |  [====] At Delivery: 4       |  |  ! Order ORD-0091 - No carrier|
|  |  [==================]         |  |     assigned (pickup tomorrow)|
|  |  Delivered: 28               |  |  >> View all 7 alerts         |
|  |                               |  +-------------------------------+
|  |                               |  |  Today's Activity             |
|  |  Revenue Trend (30 days)      |  |  9:42 AM - Maria dispatched   |
|  |                               |  |    LOAD-0856 to Swift Trans.  |
|  |  $50K ┤      ╭──╮            |  |  9:38 AM - GPS: LOAD-0847     |
|  |  $40K ┤   ╭──╯  ╰──╮        |  |    arrived at Chicago, IL     |
|  |  $30K ┤╭──╯        ╰──╮     |  |  9:35 AM - Check call logged  |
|  |  $20K ┤╯              ╰──   |  |    for LOAD-0832              |
|  |       └──────────────────    |  |  9:31 AM - Order ORD-0094     |
|  |       Jan 7     Jan 21       |  |    created by Sarah           |
|  +-------------------------------+  |  >> View full activity log    |
|                                      +-------------------------------+
|                                                                    |
|  +------------------------------------------------------------------+
|  |  Needs Attention (5 loads)                            [View All] |
|  |  +------------------+ +------------------+ +------------------+  |
|  |  | LOAD-0847        | | LOAD-0832        | | LOAD-0819        |  |
|  |  | Chi, IL > Dal,TX | | LA, CA > Phx, AZ | | ATL,GA > Mia,FL |  |
|  |  | No Check Call 5h | | ETA Past Due     | | Detention 2h15m  |  |
|  |  | [View] [Call]    | | [View] [Update]  | | [View] [Log]     |  |
|  |  +------------------+ +------------------+ +------------------+  |
|  +------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | 6 KPI cards (Active Loads, Dispatched Today, Deliveries Today, On-Time %, Avg Margin %, Revenue MTD) | These are the pulse of the operation -- a 3-second scan tells the user if things are normal or need attention |
| **Secondary** (visible but requires scanning) | Loads by Status chart, Alerts & Exceptions list, Today's Activity feed | Provides context to the KPIs -- why is on-time % down? What specific loads have issues? |
| **Tertiary** (below fold, requires scroll) | Needs Attention mini-board, Revenue Trend chart | Actionable detail for loads requiring immediate intervention; trend context for revenue |
| **Hidden** (behind click) | Full alert list, complete activity log, drill-down to individual load/order | Deep detail accessed by clicking "View All" links or individual items |

---

## 4. Data Fields & Display

### KPI Cards

| # | KPI Label | Source | Format / Display | Comparison |
|---|---|---|---|---|
| 1 | Active Loads | `GET /api/v1/loads/stats` -> `activeCount` | Integer, large font (32px). Icon: `Truck` (blue-600). | vs yesterday: "+12 ▲" (green if up is good) or "-5 ▼" (red if down is bad) |
| 2 | Loads Dispatched Today | `GET /api/v1/loads/stats` -> `dispatchedToday` | Integer, large font. Icon: `Send` (indigo-600). | vs yesterday: "34 vs 28 yesterday" |
| 3 | Deliveries Today | `GET /api/v1/loads/stats` -> `deliveredToday` | Integer, large font. Icon: `PackageCheck` (green-600). | vs yesterday |
| 4 | On-Time % | `GET /api/v1/operations/dashboard` -> `onTimePercentage` | Percentage with 1 decimal (94.2%). Icon: `Clock` (emerald-600 if >=95%, amber-500 if 85-95%, red-500 if <85%). | vs yesterday; color-coded trend arrow |
| 5 | Average Margin % | `GET /api/v1/operations/dashboard` -> `averageMargin` | Percentage with 1 decimal (18.3%). Icon: `TrendingUp` (green-600 if >=15%, amber-500 if 5-15%, red-500 if <5%). | vs yesterday. **Hidden from Dispatcher, Support roles.** |
| 6 | Revenue MTD | `GET /api/v1/operations/dashboard` -> `revenueMTD` | Currency, abbreviated ($1.2M, $456K). Icon: `DollarSign` (green-600). | vs last month same period. **Hidden from Dispatcher, Support roles.** |

Each KPI card also displays a **sparkline mini chart** (last 7 days trend) using a 60px-wide inline SVG line chart below the value.

### Charts

| # | Chart | Source | Format |
|---|---|---|---|
| 1 | Loads by Status | `GET /api/v1/loads/stats` -> `countsByStatus` | Horizontal bar chart. Each bar is colored per status color system. Bars are clickable (navigate to loads list filtered by that status). Labels show count. |
| 2 | Revenue Trend | `GET /api/v1/operations/dashboard/charts` -> `revenueTrend` | Line chart, 30-day period. X-axis: dates. Y-axis: daily revenue. Line is blue-600. Fill is blue-100 (area chart). Tooltip on hover shows date + exact revenue. **Hidden from Dispatcher, Support roles.** |

### Alerts & Exceptions List

| # | Field | Source | Format |
|---|---|---|---|
| 1 | Severity Icon | `alert.severity` | Red `AlertTriangle` for critical, Amber `AlertTriangle` for warning |
| 2 | Load/Order Number | `alert.entityNumber` | Monospace, clickable link (navigates to detail) |
| 3 | Alert Message | `alert.message` | Descriptive text: "No check call in 5h 23m", "ETA past delivery appointment by 2h" |
| 4 | Time Ago | `alert.createdAt` | Relative time: "23 min ago", "1h 45m ago" |
| 5 | Action Button | Contextual | "View", "Call Carrier", "Update ETA", "Log Check Call" depending on alert type |

### Activity Feed

| # | Field | Source | Format |
|---|---|---|---|
| 1 | Timestamp | `activity.createdAt` | 12-hour format: "9:42 AM" |
| 2 | User Name | `activity.userName` | First name only for brevity: "Maria" |
| 3 | Action Description | `activity.description` | "dispatched LOAD-0856 to Swift Transport", "created order ORD-0094" |
| 4 | Entity Link | `activity.entityId` | Entity number is clickable link to detail page |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | KPI Trend Arrow | `(todayValue - comparisonValue) / comparisonValue * 100` | Green up-arrow if positive (and positive is good for this metric), red down-arrow if negative. Percentage change shown. |
| 2 | Needs Attention Count | Count of loads matching: no check call >4h, ETA past appointment, detention >free time, no carrier <24h before pickup, active exceptions | Integer shown as red badge next to "Needs Attention" header |
| 3 | Time Since Last Check Call | `now() - lastCheckCallTimestamp` | "5h 23m" in red if >4h, amber if 3-4h, normal if <3h |
| 4 | Detention Duration | `now() - arrivalTimestamp - freeTimeMinutes` | "2h 15m" displayed only if positive (detention is occurring) |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] 6 KPI cards with current values and trend comparison
- [ ] Date range selector (Today / This Week / This Month) that filters all dashboard data
- [ ] Loads by Status horizontal bar chart with clickable bars
- [ ] Alerts & Exceptions list showing top 5 most critical issues with "View All" link
- [ ] Today's Activity feed showing last 10 events with "View All" link
- [ ] Needs Attention mini-board showing loads requiring immediate action (max 6 cards)
- [ ] Click any KPI card to navigate to filtered list view (e.g., click "Active Loads" -> Loads List filtered to active statuses)
- [ ] Role-based data visibility (hide margin/revenue from Dispatcher and Support)
- [ ] Loading skeleton that matches exact layout during initial data fetch
- [ ] Error state with retry button if dashboard API fails

### Advanced Features (Logistics Expert Recommendations)

- [ ] **Auto-refresh every 2 minutes** via WebSocket push for critical metrics (load counts, exception count); chart data refreshes every 5 minutes
- [ ] **"Needs Attention" red badge** in sidebar navigation item that shows count even when not on dashboard
- [ ] **One-click quick actions**: "Go to Dispatch Board", "Open Tracking Map", "Create New Order" buttons in page header area
- [ ] **Time comparison toggle**: Switch between "vs yesterday", "vs last week", "vs same day last month" for all KPI cards
- [ ] **Click any KPI to drill down** to the filtered list (Active Loads -> Loads List with active status filter applied)
- [ ] **Sparkline mini-charts** on each KPI card showing 7-day trend as a tiny inline line chart
- [ ] **Alert priority sorting**: Critical (red) alerts float to top; each alert has a contextual quick-action button (e.g., "Call Carrier" for missing check call alerts)
- [ ] **Activity feed grouping**: Group activities by load/order to reduce noise (e.g., "3 updates on LOAD-0847" expandable)
- [ ] **Customizable widget layout**: Ops Managers can drag-reorder dashboard widgets; layout persisted per user in localStorage
- [ ] **Fullscreen mode** for Needs Attention board (useful for wall-mounted dispatch monitors)
- [ ] **Sound alert** (optional, user preference) when a new critical exception appears
- [ ] **Morning briefing summary**: On first load of the day, show a brief overlay "Good morning Maria -- you have 52 active loads, 3 need attention, 8 pickups scheduled today"

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Revenue MTD KPI card | Ops Manager, Admin, Super Admin | `finance_view` | Card not rendered; other 5 cards expand to fill row |
| Average Margin % KPI card | Ops Manager, Admin, Super Admin | `finance_view` | Card not rendered; other 5 cards expand to fill row |
| Revenue Trend chart | Ops Manager, Admin, Super Admin | `finance_view` | Chart replaced with second operational chart (e.g., "Pickups vs Deliveries This Week") |
| Team-wide metrics | Ops Manager, Admin, Super Admin | `team_view` | Metrics scoped to personal (dispatcher sees only their loads) |
| Customizable widget layout | Ops Manager, Admin | `dashboard_customize` | Standard fixed layout |
| Export dashboard data | Ops Manager, Admin, Super Admin | `export_data` | Export button not shown |

---

## 6. Status & State Machine

The Operations Dashboard does not directly manage status transitions. It displays aggregate status data for both Orders and Loads. The status color system from `03-status-color-system.md` is used throughout.

### Status Display on Dashboard

**Loads by Status Chart** uses the full Load status palette:

| Status | Bar Color | Hex | Count Label |
|---|---|---|---|
| PLANNING | Slate | `#64748B` | Right-aligned count |
| PENDING | Gray | `#6B7280` | Right-aligned count |
| TENDERED | Purple | `#8B5CF6` | Right-aligned count |
| ACCEPTED | Blue | `#3B82F6` | Right-aligned count |
| DISPATCHED | Indigo | `#6366F1` | Right-aligned count |
| AT_PICKUP | Amber | `#F59E0B` | Right-aligned count |
| PICKED_UP | Cyan | `#06B6D4` | Right-aligned count |
| IN_TRANSIT | Sky | `#0EA5E9` | Right-aligned count |
| AT_DELIVERY | Teal | `#14B8A6` | Right-aligned count |
| DELIVERED | Lime | `#84CC16` | Right-aligned count |

Note: COMPLETED and CANCELLED are excluded from the chart by default (they are terminal states and would dwarf active counts). A toggle "Include completed" can show them.

### Alert Severity Colors

| Severity | Background | Border | Icon Color | Text Color |
|---|---|---|---|---|
| Critical | `red-50` | `red-200` | `red-600` | `red-900` |
| Warning | `amber-50` | `amber-200` | `amber-600` | `amber-900` |
| Info | `blue-50` | `blue-200` | `blue-600` | `blue-900` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Page Header Right)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| New Order | `Plus` | Primary / Blue | Navigate to `/operations/orders/new` | No |
| Dispatch Board | `LayoutDashboard` | Secondary / Outline | Navigate to `/operations/dispatch` | No |
| Tracking Map | `Map` | Secondary / Outline | Navigate to `/operations/tracking` | No |

### KPI Card Interactions

| KPI Card | Click Action | Data Passed |
|---|---|---|
| Active Loads | Navigate to `/operations/loads?status=PLANNING,PENDING,TENDERED,ACCEPTED,DISPATCHED,AT_PICKUP,PICKED_UP,IN_TRANSIT,AT_DELIVERY` | Status filter |
| Loads Dispatched Today | Navigate to `/operations/loads?status=DISPATCHED&dateFrom=today` | Status + date filter |
| Deliveries Today | Navigate to `/operations/loads?status=DELIVERED&dateFrom=today` | Status + date filter |
| On-Time % | Navigate to `/operations/loads?onTime=false&dateFrom=thisWeek` (shows late loads) | On-time filter |
| Average Margin % | Navigate to `/operations/loads?sort=margin&order=asc` (shows lowest margin first) | Sort by margin |
| Revenue MTD | Navigate to `/operations/orders?dateFrom=monthStart&dateTo=today` | Date range filter |

### Alert Item Actions

| Alert Type | Primary Action Button | Secondary Action |
|---|---|---|
| Missing Check Call | "Call Carrier" (opens phone dialer / carrier contact modal) | "View Load" (navigate to load detail) |
| ETA Past Due | "Update ETA" (opens ETA update modal) | "View Load" |
| Detention | "Log Detention" (opens detention entry form) | "View Load" |
| No Carrier Assigned | "Find Carrier" (opens carrier search modal) | "View Load" |
| Active Exception | "View Exception" (navigate to load detail exceptions tab) | "Acknowledge" |

### Activity Feed Actions

| Element | Click Action |
|---|---|
| Entity number (LOAD-XXXX, ORD-XXXX) | Navigate to entity detail page |
| User name | No action (display only) |
| "View full activity log" link | Navigate to activity log page (filtered to operations) |

### Quick Actions (Needs Attention Cards)

| Button | Action | Icon |
|---|---|---|
| View | Navigate to load detail | `Eye` |
| Call | Open carrier contact info (phone number, click-to-call) | `Phone` |
| Update | Open quick-update modal (status, ETA, notes) | `Edit` |
| Log | Open check call entry form in a side sheet | `FileText` |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + K` | Open global search / command palette |
| `Ctrl/Cmd + N` | Create new order |
| `D` | Navigate to Dispatch Board |
| `T` | Navigate to Tracking Map |
| `R` | Refresh dashboard data |
| `1-6` | Focus on KPI card 1-6 (then Enter to drill down) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | N/A | No drag-and-drop on the dashboard. Drag-drop is reserved for the Dispatch Board. |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Namespace | Payload | UI Update |
|---|---|---|---|
| `load:status:changed` | `/dispatch` | `{ loadId, previousStatus, newStatus, changedBy, timestamp }` | Update "Loads by Status" chart bar counts (decrement old status, increment new status). Update KPI cards if applicable (e.g., new delivery increments "Deliveries Today"). Flash-highlight the affected bar in the chart for 2 seconds. |
| `load:created` | `/dispatch` | `{ loadId, orderId, status }` | Increment "Active Loads" KPI. Add entry to Activity Feed. Increment relevant status bar in chart. |
| `order:created` | `/dispatch` | `{ orderId, customerId, customerName, status }` | Add entry to Activity Feed. |
| `order:status:changed` | `/dispatch` | `{ orderId, previousStatus, newStatus }` | Add entry to Activity Feed. |
| `checkcall:received` | `/tracking` | `{ loadId, checkCallId, type, timestamp }` | If this resolves a "missing check call" alert, remove it from Alerts list and decrement "Needs Attention" count. Add entry to Activity Feed. |
| `notification:new` | `/notifications` | `{ type, title, severity }` | If severity is "critical" or "warning" and type is operations-related, add to Alerts & Exceptions list. Show toast notification. |

### Live Update Behavior

- **Update frequency:** WebSocket push for KPI changes and alerts (real-time). Charts re-render at most once per 30 seconds (debounced) even if multiple events arrive. Activity feed appends immediately.
- **Visual indicator:** Changed KPI cards briefly pulse with a blue highlight (200ms fade-in, 1.5s hold, 500ms fade-out). New activity feed entries slide in from the top with a subtle animation. Changed chart bars flash with a brighter shade of their color for 2 seconds.
- **Conflict handling:** Dashboard is read-only; no editing conflicts possible. Data is always server-authoritative.
- **Connection status:** Small green dot labeled "Live" in the top-right area of the page header when WebSocket is connected. Changes to amber "Reconnecting..." or red "Updates delayed" when connection is lost.

### Polling Fallback

- **When:** WebSocket connection drops or is unavailable
- **Interval:** Every 30 seconds for KPIs and alerts; every 60 seconds for charts and activity feed
- **Endpoint:** `GET /api/v1/operations/dashboard?updatedSince={lastPollTimestamp}`
- **Visual indicator:** Replace green "Live" dot with amber dot and text "Updates every 30s" to inform user of degraded state

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| N/A | Dashboard is read-only. No user-initiated mutations occur on this screen. All updates are driven by events from other screens. | N/A |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `PageHeader` | `src/components/layout/page-header.tsx` | `title: "Operations Dashboard"`, `subtitle: "Real-time overview of your freight operations"`, `actions: [NewOrder, DispatchBoard, TrackingMap]` |
| `StatusBadge` | `src/components/ui/status-badge.tsx` | Used in Needs Attention cards and Activity Feed for entity status display |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Used for loading states of all dashboard sections |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `StatsCard` | Basic card with label and value | Add sparkline mini-chart (7-day trend), trend arrow with comparison text, click handler for drill-down navigation, color-coded threshold (green/amber/red based on value ranges) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `KPICard` | Dashboard stat card with: large value, label, Lucide icon, trend arrow (up/down with percentage), comparison text ("vs yesterday"), sparkline mini-chart (last 7 days), click-to-drill-down. Must support different value formats (integer, percentage, currency). | Medium |
| `KPICardRow` | Container for 6 KPI cards in a responsive row. 6 columns on desktop, 3x2 on tablet, 2x3 on mobile. Equal width cards with consistent spacing. | Small |
| `HorizontalBarChart` | Loads-by-status chart. Each bar is colored per status, shows count label, clickable to navigate to filtered list. Animated bar transitions when data updates. Built on Recharts or similar. | Medium |
| `RevenueTrendChart` | 30-day line/area chart. Blue line with light blue fill. Tooltip on hover with date + exact value. Responsive width. Built on Recharts. | Medium |
| `AlertsList` | Scrollable list of alert items. Each item: severity icon (colored), entity number (link), message, time-ago, action button. Max 5 visible, "View All" link at bottom. Supports real-time prepend (new alerts slide in at top). | Medium |
| `ActivityFeed` | Scrollable list of activity entries. Each entry: timestamp, user name, action description with entity links. Max 10 visible, "View All" link at bottom. New entries animate in at top. | Medium |
| `NeedsAttentionBoard` | Horizontal scrollable row of mini load cards. Each card: load number, route (origin > destination), issue description, 2 quick-action buttons. Red-tinted cards for critical, amber for warning. "View All" button navigates to loads list filtered for attention-needed. | High |
| `NeedsAttentionCard` | Individual card within the NeedsAttentionBoard. Compact layout: load number (monospace, bold), route display (City, ST > City, ST), issue tag (red/amber badge with description), two action buttons. | Small |
| `DatePeriodToggle` | Toggle group: "Today", "This Week", "This Month" with option for custom date range picker. Selected state is highlighted. Changes filter context for entire dashboard. Syncs to URL params. | Small |
| `SparklineChart` | Tiny inline SVG line chart (60px wide, 24px tall) showing 7 data points. No axes, no labels. Just the trend line. Used inside KPI cards. Color matches card theme. | Small |
| `ConnectionStatusIndicator` | Small dot + text showing WebSocket connection state: green "Live", amber "Reconnecting...", red "Offline". Placed in page header area. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Toggle Group | `toggle-group` | Date period selector (Today / This Week / This Month) |
| Card | `card` | KPI cards, alert items, needs-attention cards |
| Tooltip | `tooltip` | KPI comparison details on hover, alert action descriptions |
| Popover | `popover` | Custom date range picker dropdown |
| Scroll Area | `scroll-area` | Activity feed and alerts list scrollable containers |
| Separator | `separator` | Divider between dashboard sections |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook | Cache Time |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/operations/dashboard` | Fetch KPI data (role-aware: personal vs team) | `useDashboardKPIs(period, scope)` | 60s |
| 2 | GET | `/api/v1/operations/dashboard/charts` | Fetch chart data (loads by status counts, revenue trend) | `useDashboardCharts(period)` | 120s |
| 3 | GET | `/api/v1/operations/dashboard/alerts` | Fetch active alerts & exceptions (top 20) | `useDashboardAlerts()` | 30s |
| 4 | GET | `/api/v1/operations/dashboard/activity` | Fetch recent activity feed (last 20 events) | `useDashboardActivity(period)` | 30s |
| 5 | GET | `/api/v1/operations/dashboard/needs-attention` | Fetch loads needing immediate attention (max 10) | `useNeedsAttention()` | 30s |
| 6 | GET | `/api/v1/loads/stats` | Fetch load count statistics by status | `useLoadStats(period)` | 60s |

### Query Parameters

| Endpoint | Parameter | Type | Description |
|---|---|---|---|
| All dashboard endpoints | `period` | `today`, `thisWeek`, `thisMonth`, `custom` | Time period for data aggregation |
| All dashboard endpoints | `dateFrom` | ISO date string | Start date for custom period |
| All dashboard endpoints | `dateTo` | ISO date string | End date for custom period |
| Dashboard KPIs | `scope` | `personal`, `team` | Personal metrics (dispatcher) or team-wide (ops manager) |
| Dashboard KPIs | `comparisonPeriod` | `yesterday`, `lastWeek`, `lastMonth` | Period for trend comparison |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `tenant:{tenantId}` | `load:status:changed` | `useDashboardLiveUpdates()` -- invalidates KPI and chart queries, prepends to activity feed |
| `tenant:{tenantId}` | `load:created` | Same handler -- increments active load count |
| `tenant:{tenantId}` | `order:created` | Same handler -- prepends to activity feed |
| `tenant:{tenantId}` | `checkcall:received` | `useAlertLiveUpdates()` -- removes resolved alerts from list |
| `user:{userId}` | `notification:new` | Global handler -- adds to alerts if ops-related |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| Dashboard KPIs | Show default values (0) with error indicator | Redirect to login | Show "Access Denied" page | N/A | Show error state with retry for KPI section only; other sections load independently |
| Dashboard Charts | Show empty chart placeholder | Redirect to login | Hide chart section | N/A | Show "Chart unavailable" with retry link |
| Dashboard Alerts | Show "No alerts" (graceful) | Redirect to login | Hide alerts section | N/A | Show "Alerts unavailable" with retry |
| Dashboard Activity | Show "No recent activity" | Redirect to login | Hide activity section | N/A | Show "Activity unavailable" with retry |
| Needs Attention | Show "All loads on track" (graceful) | Redirect to login | Hide section | N/A | Show "Unable to load" with retry |

**Key principle:** Each dashboard section loads independently and fails independently. If charts fail, KPIs and alerts still display. The page never shows a full-page error unless the primary KPI endpoint fails.

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 6 skeleton cards in KPI row (gray animated rectangles matching card dimensions). Show 2 skeleton rectangles for chart areas (left and right columns). Show 3 skeleton list items for alerts. Show 3 skeleton list items for activity. Show 3 skeleton cards for needs-attention.
- **Progressive loading:** Page header renders immediately (static). KPI cards load first (fastest query). Charts and lists load in parallel but render as they arrive. This gives a progressive "filling in" effect.
- **Duration threshold:** If any section takes more than 5 seconds, show a subtle "Taking longer than expected..." text below the skeleton area with a "Retry" link.

### Empty States

**First-time empty (new tenant, no data):**
- KPI cards all show "0" with neutral gray styling (no trend arrows)
- Charts show empty state: "No load data yet" with a truck illustration
- Alerts show: "No active alerts -- you're all clear!"
- Activity feed shows: "No activity yet. Create your first order to get started."
- Needs Attention shows: "Nothing needs attention right now."
- CTA: "Create First Order" primary button in the center of the page

**Date-range empty (data exists but not in selected period):**
- KPI cards show "0" for the selected period with comparison to previous period
- Charts show empty bars / flat line
- Message: "No activity for [selected period]. Try expanding the date range."
- CTA: "View This Month" or "View All Time" button

### Error States

**Full page error (primary dashboard API fails):**
- Show error illustration + "Unable to load dashboard" + "There was a problem loading your operations data. Please try again." + large "Retry" button
- Below: "If the problem persists, contact support."

**Per-section error (partial failure):**
- Failed section shows: subtle red-tinted background + "Unable to load [section name]" + small "Retry" link
- Other sections render normally
- No toast notification for dashboard load errors (too noisy on page load)

**Action error:**
- Toast notification for failed drill-down navigation (rare) or failed export

### Permission Denied

- **Full page denied:** If user role has no access to operations dashboard, show "You don't have permission to view the Operations Dashboard" with link to their appropriate dashboard
- **Partial denied:** Revenue and margin KPIs hidden for Dispatcher/Support roles. The 4 remaining KPI cards stretch to fill the row (4 equal-width cards). Revenue Trend chart replaced with "Pickups vs Deliveries This Week" bar chart.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached data from [timestamp]. Dashboard will refresh when connection is restored."
- **WebSocket down, REST works:** Show amber "Live" indicator: "Updates may be delayed". Dashboard still refreshes via polling.
- **Data stale (>5 minutes since last refresh):** Show subtle text under page header: "Data as of 9:42 AM" with manual "Refresh" button

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Period | Toggle group | Today, This Week, This Month | Today | `?period=today` |
| 2 | Custom Date Range | Date range picker | Any date range | N/A (hidden until "Custom" selected) | `?dateFrom=&dateTo=` |
| 3 | Comparison Period | Dropdown (inside KPI cards on hover) | vs Yesterday, vs Last Week, vs Same Day Last Month | vs Yesterday | `?comparison=yesterday` |
| 4 | Scope | Automatic (role-based) | Personal (Dispatcher), Team (Ops Manager+) | Based on role | `?scope=personal` or `?scope=team` |

### Search Behavior

No global search on the dashboard itself. The global search (`Ctrl/Cmd + K`) is available via the command palette and searches across orders, loads, carriers, and customers.

### Sort Options

Activity feed is always sorted by timestamp descending (newest first). Alerts are sorted by severity (critical first, then warning, then info) and within severity by time (newest first). Needs Attention cards are sorted by urgency (most critical issue first).

### Saved Filters / Presets

- Dashboard filter state (period, comparison) is persisted in localStorage per user
- URL params reflect current state, so dashboard links can be shared with specific period selected
- No formal "saved views" on dashboard (unlike list screens)

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- KPI cards: 3 per row (2 rows of 3) instead of 6 in a single row
- Charts and Alerts/Activity: Stack vertically (full width) instead of 2-column layout. Order: Loads by Status chart, then Alerts, then Revenue Trend, then Activity Feed.
- Needs Attention: Horizontal scroll with 2 visible cards, swipe for more
- Page header: Date period toggle moves below title (stacks)
- Quick action buttons (New Order, Dispatch Board, Map): Collapse into a single "Actions" dropdown

### Mobile (< 768px)

- KPI cards: 2 per row (3 rows of 2). If only 4 visible (Dispatcher role), 2 rows of 2.
- All sections stack vertically, full width
- Charts: Simplified (smaller, touch-friendly tooltips)
- Alerts & Activity: Show top 3 each, "View All" button more prominent
- Needs Attention: Vertical card stack instead of horizontal scroll
- Date period toggle: Full-width segmented control
- Quick action buttons: Sticky bottom bar with 3 icon buttons (New Order, Dispatch, Map)
- Pull-to-refresh gesture reloads all dashboard data

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3. 6 KPI cards in single row. 2-column layout for charts and lists. |
| Desktop | 1024px - 1439px | Same layout, slightly narrower. KPI card sparklines may be hidden below 1200px. |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design an operations dashboard for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This is the command center that dispatchers and operations managers see first thing every morning.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px wide, collapsed). White content area on the right. Top of content area has a page header with title "Operations Dashboard" on the left and a date toggle group (Today | This Week | This Month) on the right, with "Today" selected and highlighted in blue-600.

KPI Row: Below the header, show 6 KPI stat cards in a single horizontal row with equal spacing. Each card is a white card with rounded-lg corners and subtle shadow-sm border. Cards contain:
1. "Active Loads" - Value: 247, blue Truck icon, trend: "+12 ▲" in green, tiny sparkline showing upward trend
2. "Dispatched Today" - Value: 34, indigo Send icon, trend: "+6 ▲" in green, sparkline
3. "Deliveries Today" - Value: 28, green PackageCheck icon, trend: "-3 ▼" in red, sparkline
4. "On-Time %" - Value: 94.2%, emerald Clock icon, trend: "+1.2% ▲" in green, sparkline
5. "Avg Margin" - Value: 18.3%, green TrendingUp icon, trend: "+0.5% ▲" in green, sparkline
6. "Revenue MTD" - Value: $1.24M, green DollarSign icon, trend: "+8% ▲" in green, sparkline

Main Content: Below KPIs, a 2-column layout (60/40 split).

Left Column:
- "Loads by Status" section header. Below it, a horizontal bar chart showing load counts by status. Each bar is a different color matching the status: Planning (slate), Pending (gray), Tendered (purple), Accepted (blue), Dispatched (indigo), At Pickup (amber), Picked Up (cyan), In Transit (sky-blue, longest bar showing 45), At Delivery (teal), Delivered (lime-green showing 28). Each bar has the count number to the right.
- Below the bar chart, "Revenue Trend" section header with a smooth line chart showing 30 days of revenue data, blue-600 line with light blue-100 fill underneath. Y-axis shows dollar amounts ($20K-$50K range), X-axis shows dates.

Right Column:
- "Alerts & Exceptions" with a red badge showing "(7)" next to the header. Below it, a list of 5 alert items, each with:
  - A red or amber warning triangle icon on the left
  - Entity number in monospace font (e.g., "LOAD-20260206-0847")
  - Description: "No check call in 5h 23m" or "ETA past delivery appointment by 2h"
  - Relative timestamp: "23 min ago"
  - Small action button on the right ("View" or "Call")
  - At bottom: "View all 7 alerts" link in blue
- Below alerts, "Today's Activity" section header. A feed of 5 activity items showing:
  - Timestamp (9:42 AM), dash, "Maria dispatched LOAD-0856 to Swift Transport"
  - Timestamp (9:38 AM), dash, "GPS update: LOAD-0847 arrived at Chicago, IL"
  - More similar entries with realistic freight data
  - At bottom: "View full activity log" link in blue

Bottom Section: Full-width "Needs Attention" section with a red badge showing "(5)" next to the header and a "View All" button on the right. Below, show 3 compact cards in a horizontal row:
- Card 1: "LOAD-20260206-0847" | "Chicago, IL → Dallas, TX" | Red badge "No Check Call 5h 23m" | Two small buttons: "View" and "Call"
- Card 2: "LOAD-20260206-0832" | "Los Angeles, CA → Phoenix, AZ" | Amber badge "ETA Past Due 2h" | Two small buttons: "View" and "Update"
- Card 3: "LOAD-20260206-0819" | "Atlanta, GA → Miami, FL" | Red badge "Detention 2h 15m" | Two small buttons: "View" and "Log"

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Content background: gray-50 (#F9FAFB) for the page, white (#FFFFFF) for cards
- Primary color: blue-600 for interactive elements
- KPI card values: 28px bold font. Labels: 12px medium gray-500. Trend arrows: 12px with green-600 for positive, red-600 for negative.
- Charts: Clean, minimal, no gridlines, subtle axis labels in gray-400
- Alert items: Subtle left border colored by severity (red-500 for critical, amber-500 for warning)
- Cards: white background, rounded-lg, border border-gray-200, subtle shadow-sm
- Small green dot with "Live" label in the top-right of the page header to indicate real-time connection
- Modern SaaS aesthetic similar to Linear.app or Vercel dashboard
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing yet -- screen is Not Started

**What needs to be built for MVP:**
- [ ] Page layout with header, KPI row, 2-column body, needs-attention section
- [ ] 6 KPI cards with values from dashboard API
- [ ] Date period toggle (Today / This Week / This Month) filtering all data
- [ ] Loads by Status horizontal bar chart
- [ ] Alerts & Exceptions list (top 5)
- [ ] Today's Activity feed (top 10)
- [ ] Needs Attention mini-board (top 6 loads)
- [ ] Role-based visibility (hide financial KPIs for non-financial roles)
- [ ] Click-through on KPI cards and chart bars to filtered list views
- [ ] WebSocket integration for real-time KPI and alert updates
- [ ] Loading skeletons for all sections
- [ ] Empty states for new tenants
- [ ] Error states with independent section retry

**What to add this wave (post-MVP polish):**
- [ ] Sparkline mini-charts on KPI cards
- [ ] KPI trend comparison toggle (vs yesterday / last week / last month)
- [ ] Sound alerts for critical exceptions (user preference setting)
- [ ] Morning briefing overlay on first daily load
- [ ] Activity feed grouping by entity
- [ ] Export dashboard data (PDF/CSV)

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| KPI cards with drill-down | High | Medium | P0 |
| Loads by Status chart (clickable) | High | Medium | P0 |
| Alerts & Exceptions with quick actions | High | Medium | P0 |
| Needs Attention board | High | High | P0 |
| WebSocket real-time updates | High | High | P0 |
| Activity feed | Medium | Low | P1 |
| Sparkline mini-charts | Medium | Medium | P1 |
| Period comparison toggle | Medium | Low | P1 |
| Morning briefing overlay | Low | Medium | P2 |
| Sound alerts | Low | Low | P2 |
| Customizable widget layout | Low | High | P2 |
| Dashboard export (PDF) | Low | Medium | P2 |

### Future Wave Preview

- **Wave 3:** Add AI-powered insights panel ("Your on-time % has dropped 3% this week due to carrier X consistently arriving late on Lane Y. Recommend replacing with carrier Z who has 98% on-time on this lane."). Add predictive load volume chart based on historical patterns. Add dispatcher workload balancing visualization.
- **Wave 4:** Add integrated dispatch-from-dashboard capability (quick dispatch modal without leaving dashboard). Add voice-activated commands ("Show me loads late today"). Add mobile push notifications linked to dashboard alerts.

---

*End of Operations Dashboard screen design. Reference `00-service-overview.md` for service-level context and `03-status-color-system.md` for all status color specifications.*
