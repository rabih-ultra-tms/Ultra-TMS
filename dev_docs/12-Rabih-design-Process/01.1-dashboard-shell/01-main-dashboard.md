# Main Dashboard

> Service: Dashboard Shell (01.1) | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/dashboard | Status: **Built** | Type: Dashboard
> Primary Personas: Maria (Dispatcher), James (Sales), Sarah (Ops Manager), Emily (AR Specialist), Mike (Customer), Carlos (Driver)
> Roles with Access: admin, ops_manager, dispatcher, sales_agent, sales_manager, accounting_manager, accounting_clerk, carrier_manager, super_admin (customer and carrier roles use separate portal dashboards)

---

## 1. Purpose & Business Context

**What this screen does:**
The Main Dashboard is the landing page every internal user sees after login. It displays role-specific KPI cards, trend charts, activity feeds, and quick-action buttons tailored to each user's function. A dispatcher sees unassigned loads and at-risk deliveries; a sales agent sees pipeline value and quote conversion rates; an accounting clerk sees outstanding AR and overdue invoices. The dashboard serves as a "mission control" that answers the question: "What do I need to focus on right now?"

**Business problem it solves:**
Without a centralized dashboard, users waste 15-30 minutes each morning navigating between multiple screens to build a mental picture of their workday priorities. Dispatchers would check the loads list, then the tracking map, then the notifications, then the carrier list -- all before making a single decision. The dashboard consolidates the top 4-6 metrics each role needs into a single glanceable view, reducing morning orientation time from 30 minutes to under 2 minutes.

**Key business rules:**
- Dashboard content is 100% determined by the user's role -- no configuration needed by the user on first login
- KPI values refresh automatically every 60 seconds via polling (with WebSocket upgrade planned)
- Trend arrows compare current period to previous period (today vs. yesterday, this week vs. last week, this month vs. last month -- configurable)
- Clicking any KPI card navigates to the filtered list view for that metric (e.g., clicking "Unassigned Loads: 12" navigates to `/loads?status=unassigned`)
- Quick actions are role-gated: only actions the user has permission to perform are shown
- The dashboard must load and display skeleton content within 500ms, with real data populating within 2 seconds

**Success metric:**
Average time from login to first productive action drops from 8 minutes to under 90 seconds. Dashboard page load time (LCP) under 1.5 seconds. 80% of users access the dashboard as their first screen of the day.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Login / MFA | Successful authentication | JWT token, user role, tenant context |
| Any page (sidebar) | Click "Dashboard" in sidebar | None |
| Command Palette | Type "dashboard" or press G then D | None |
| Browser bookmark | Direct URL navigation | None |
| Session restore | Browser reopened with valid session | Cached JWT |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Loads List | Click "Unassigned Loads" KPI card | `?status=unassigned&assignedTo=me` |
| Loads List | Click "At Risk" KPI card | `?status=at_risk` |
| Loads List | Click "In Transit" KPI card | `?status=in_transit` |
| Quotes List | Click "Quotes Pending" KPI card | `?status=pending` |
| Invoices List | Click "Overdue Invoices" KPI card | `?status=overdue` |
| Any entity detail | Click activity feed item | Entity ID |
| Load Builder | Click "Create Load" quick action | None |
| Quote Builder | Click "Create Quote" quick action | None |
| Invoice Entry | Click "Create Invoice" quick action | None |
| Notification Center | Click notification toast | Notification context |

**Primary trigger:**
User logs in at the start of their workday and lands on the dashboard. Maria (Dispatcher) arrives at 6 AM, scans her 4 KPI cards in 10 seconds, and clicks into the "Unassigned Loads" card to begin carrier assignments. James (Sales) checks his pipeline value and pending quotes before making morning calls.

**Success criteria (user completes the screen when):**
- User has scanned KPI cards and identified their top priorities for the day
- User has clicked through to the relevant list or detail screen to begin work
- User has reviewed recent activity feed for overnight changes

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  HEADER BAR (64px)                                                |
|  [Hamburger] Ultra TMS  |  Dashboard  |  [Search] [Bell] [Avatar]|
+------------------------------------------------------------------+
|          |                                                        |
|  SIDEBAR |  PAGE HEADER                                           |
|  (240px) |  "Good morning, Maria"           [Date: Feb 6, 2026]  |
|          |  "Here's your operations overview"                     |
|          |                                                        |
|          |  KPI CARDS ROW (4 cards)                               |
|          |  +------------+ +------------+ +------------+ +------+ |
|          |  | Unassigned | | In Transit | | At Risk    | |Today | |
|          |  | Loads      | | Loads      | | Loads      | |Deliv.| |
|          |  |    12      | |    47      | |     3      | |  18  | |
|          |  | +8% ^      | | -2% v      | | +1 since AM| | 2 late|
|          |  +------------+ +------------+ +------------+ +------+ |
|          |                                                        |
|          |  CHARTS ROW (2 charts, 50/50 split)                    |
|          |  +-------------------------+ +------------------------+|
|          |  | Load Volume Trend       | | On-Time Delivery %     ||
|          |  | (Bar chart, 7 days)     | | (Line chart, 30 days)  ||
|          |  |                         | |                        ||
|          |  |  M  T  W  T  F  S  S   | |  92% current           ||
|          |  +-------------------------+ +------------------------+|
|          |                                                        |
|          |  BOTTOM ROW (Activity Feed 60% + Quick Actions 40%)    |
|          |  +---------------------------+ +---------------------+ |
|          |  | Recent Activity           | | Quick Actions       | |
|          |  | - Load L-4521 delivered    | | [+ Create Load]     | |
|          |  | - Carrier assigned to L-45 | | [+ Create Order]    | |
|          |  | - Quote Q-891 accepted     | | [View Dispatch Brd] | |
|          |  | - Payment received $4,200  | | [View Tracking Map] | |
|          |  | - 3 more...               | | [Run Daily Report]  | |
|          |  +---------------------------+ +---------------------+ |
|          |                                                        |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | KPI cards (4-6 per role), greeting with user name | Users scan KPIs within 5 seconds of landing; these drive immediate action |
| **Secondary** (visible, below KPIs) | Trend charts (load volume, on-time %, revenue trend) | Provides context for KPI numbers; answers "is this getting better or worse?" |
| **Tertiary** (below fold, scrollable) | Activity feed, quick actions panel | Review recent changes and launch common workflows |
| **Hidden** (behind click) | KPI card detail (clicking a card navigates to filtered list), chart drill-down | Deep data available on demand without cluttering the overview |

---

## 4. Data Fields & Display

### Visible Fields -- Dispatcher Role (Maria)

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Unassigned Loads | Load.count(status='ready', carrier=null) | Integer, large 32px font, clickable | KPI Card 1 |
| 2 | In Transit Loads | Load.count(status='in_transit') | Integer, large 32px font, clickable | KPI Card 2 |
| 3 | At Risk Loads | Load.count(risk_flag=true) | Integer, large 32px font, red text if > 0 | KPI Card 3 |
| 4 | Today's Deliveries | Load.count(delivery_date=today) | Integer + "X late" subtext in red | KPI Card 4 |
| 5 | Load Volume (7-day) | Load.count per day, last 7 days | Bar chart, blue-600 bars | Chart Row Left |
| 6 | On-Time % (30-day) | (on_time_deliveries / total_deliveries) * 100 | Line chart, percentage axis, green/red zones | Chart Row Right |
| 7 | Recent Activity | Activity.list(limit=10) | Timestamped list with icons and entity links | Bottom Left |

### Visible Fields -- Sales Role (James)

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Pipeline Value | Opportunity.sum(stage != 'closed', field='value') | Currency, $XXX,XXX format | KPI Card 1 |
| 2 | Quotes Pending | Quote.count(status='sent', assigned=currentUser) | Integer, clickable | KPI Card 2 |
| 3 | Conversion Rate | (quotes_won / quotes_sent) * 100, trailing 30 days | Percentage with trend arrow | KPI Card 3 |
| 4 | Monthly Revenue | Invoice.sum(month=current, customer IN user.accounts) | Currency, $XXX,XXX format | KPI Card 4 |

### Visible Fields -- Accounting Role (Emily)

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Outstanding AR | Invoice.sum(status IN ['sent','overdue']) | Currency, $XXX,XXX format | KPI Card 1 |
| 2 | Overdue Invoices | Invoice.count(status='overdue') | Integer, red if > 0, clickable | KPI Card 2 |
| 3 | Pending Payments | Payment.count(status='pending') | Integer, clickable | KPI Card 3 |
| 4 | DSO (Days Sales Outstanding) | Calculated from AR aging | Number with "days" suffix, trend arrow | KPI Card 4 |

### Visible Fields -- Ops Manager Role (Sarah)

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Active Loads | Load.count(status IN ['dispatched','in_transit','at_pickup','at_delivery']) | Integer, large font | KPI Card 1 |
| 2 | On-Time % | (on_time / total) * 100, trailing 7 days | Percentage, green > 95%, yellow 90-95%, red < 90% | KPI Card 2 |
| 3 | Avg Margin | (sum(customer_rate - carrier_rate) / sum(customer_rate)) * 100 | Percentage with dollar amount | KPI Card 3 |
| 4 | Team Utilization | (loads_assigned / dispatch_capacity) * 100 | Percentage, by dispatcher | KPI Card 4 |
| 5 | Unassigned Loads | Load.count(status='ready', carrier=null) | Integer, red badge if > 5 | KPI Card 5 |
| 6 | Exception Count | Load.count(has_exception=true) | Integer, red if > 0 | KPI Card 6 |

### Visible Fields -- Admin Role

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Active Users | User.count(status='active', last_login > 24h) | Integer with "of X total" subtext | KPI Card 1 |
| 2 | System Health | HealthCheck.status | Green dot + "All Systems Operational" or red + count of issues | KPI Card 2 |
| 3 | Storage Used | Tenant.storageUsed / Tenant.storageLimit | Progress bar, percentage, "X GB of Y GB" | KPI Card 3 |
| 4 | API Usage | ApiMetrics.count(period='today') | Number with "requests today" subtext, trend | KPI Card 4 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Trend Arrow | Compare current period value to previous period | Green up arrow if improved, red down arrow if worsened, gray dash if unchanged |
| 2 | Trend Percentage | ((current - previous) / previous) * 100 | "+X%" in green or "-X%" in red |
| 3 | Greeting Message | Time-based: "Good morning/afternoon/evening, {firstName}" | Text, 24px, gray-900 |
| 4 | Date Display | Current date | "Thursday, February 6, 2026" format |
| 5 | Late Delivery Count | Load.count(delivery_date=today, status != 'delivered', past_appointment=true) | "X late" in red subtext on Today's Deliveries card |

---

## 5. Features

### Core Features (Already Built)

- [x] Role detection from JWT claims to determine which dashboard variant to render
- [x] KPI card grid with label, value, and trend indicator
- [x] Basic activity feed showing recent system events
- [x] Page routing to `/(dashboard)/dashboard` as default landing page
- [x] Responsive grid layout using CSS Grid / Tailwind

### Enhancement Features (Wave 1 -- To Add)

- [ ] **KPI card click-through** -- Each card links to the filtered list view for its metric
- [ ] **Auto-refresh polling** -- KPI values refresh every 60 seconds without full page reload (React Query refetchInterval)
- [ ] **WebSocket live updates** -- Real-time badge count changes on KPI cards when loads change status
- [ ] **Personalized greeting** -- "Good morning, Maria" with time-aware greeting text
- [ ] **Date context** -- Current date display helps dispatchers orient to "today's" pickups/deliveries
- [ ] **Trend comparison period toggle** -- Switch between day-over-day, week-over-week, month-over-month
- [ ] **Chart interactivity** -- Hover on chart data points shows tooltip with exact values; click drills down
- [ ] **Activity feed with entity links** -- Each activity item links to the relevant entity detail page
- [ ] **Activity feed filtering** -- Filter by category (operations, sales, accounting, system)
- [ ] **Quick action buttons** -- Role-specific shortcut buttons for common actions (Create Load, Create Quote, etc.)
- [ ] **Skeleton loading** -- Show animated skeleton cards matching exact KPI card dimensions during data fetch
- [ ] **Error boundary per widget** -- If one KPI fails to load, others still render; failed widget shows "Retry" link
- [ ] **Empty state for new tenants** -- Onboarding-oriented dashboard with setup checklist instead of zero-value KPIs

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Revenue/margin KPI cards | ops_manager, admin, accounting_* | `finance_view` | Cards not rendered |
| Team performance widget | ops_manager, sales_manager, admin | `team_view` | Widget not rendered |
| System health card | admin, super_admin | `system_admin` | Card not rendered |
| Quick action: Create Load | dispatcher, ops_manager, admin | `load_create` | Button not shown |
| Quick action: Create Quote | sales_agent, sales_manager, admin | `quote_create` | Button not shown |
| Quick action: Create Invoice | accounting_clerk, accounting_manager, admin | `invoice_create` | Button not shown |

---

## 6. Status & State Machine

The dashboard itself does not have a status machine -- it is a read-only summary view. However, it displays statuses from multiple entities:

### Displayed Entity Statuses

```
LOADS on Dashboard:
  [Ready to Dispatch] --> shown in "Unassigned" KPI
  [Dispatched] ---------> shown in "In Transit" KPI
  [In Transit] ---------> shown in "In Transit" KPI
  [At Risk] ------------> shown in "At Risk" KPI (any load with exception flag)
  [Delivered] ----------> shown in "Today's Deliveries" KPI

QUOTES on Dashboard:
  [Draft] ------> not shown (only user's working drafts)
  [Sent] -------> shown in "Quotes Pending" KPI
  [Accepted] ---> triggers activity feed entry
  [Expired] ----> triggers activity feed entry

INVOICES on Dashboard:
  [Sent] -------> shown in "Outstanding AR" KPI
  [Overdue] ----> shown in "Overdue Invoices" KPI
  [Paid] -------> triggers activity feed entry
```

### Status Badge Colors (on KPI Cards)

| Metric State | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| Normal (within target) | green-50 | green-700 | green-200 | `bg-green-50 text-green-700 border-green-200` |
| Warning (approaching threshold) | yellow-50 | yellow-700 | yellow-200 | `bg-yellow-50 text-yellow-700 border-yellow-200` |
| Critical (exceeds threshold) | red-50 | red-700 | red-200 | `bg-red-50 text-red-700 border-red-200` |
| Neutral (informational) | gray-50 | gray-700 | gray-200 | `bg-gray-50 text-gray-700 border-gray-200` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Quick Actions Panel)

**Dispatcher Quick Actions:**
| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Create Load | Plus | Primary / Blue | Navigate to `/loads/new` | No |
| View Dispatch Board | LayoutGrid | Secondary / Outline | Navigate to `/dispatch` | No |
| View Tracking Map | Map | Secondary / Outline | Navigate to `/tracking` | No |
| Run Daily Report | FileText | Ghost | Generate and download ops report | No |

**Sales Quick Actions:**
| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Create Quote | Plus | Primary / Blue | Navigate to `/quotes/new` | No |
| View Pipeline | Kanban | Secondary / Outline | Navigate to `/opportunities` | No |
| Rate Lookup | DollarSign | Secondary / Outline | Navigate to `/rates/lookup` | No |

**Accounting Quick Actions:**
| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Create Invoice | Plus | Primary / Blue | Navigate to `/accounting/invoices/new` | No |
| View AR Aging | Clock | Secondary / Outline | Navigate to `/accounting/reports/ar-aging` | No |
| Record Payment | CreditCard | Secondary / Outline | Navigate to `/accounting/payments/new` | No |

### KPI Card Interactions

| Interaction | Behavior |
|---|---|
| Hover on KPI card | Subtle shadow elevation increase, cursor pointer |
| Click KPI card | Navigate to filtered list for that metric |
| Hover on trend arrow | Tooltip: "Compared to yesterday: was 10, now 12 (+20%)" |

### Activity Feed Interactions

| Interaction | Behavior |
|---|---|
| Click activity item | Navigate to entity detail page (load detail, quote detail, etc.) |
| Hover on activity item | Background highlight, show relative timestamp tooltip |
| Click "View All" | Navigate to full activity log |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `G` then `D` | Navigate to Dashboard (from any page) |
| `Ctrl/Cmd + K` | Open Command Palette |
| `R` | Refresh dashboard data |
| `1` - `4` | Focus/click KPI card 1-4 |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on dashboard (future: widget reordering) |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| `load.status.changed` | `{ loadId, oldStatus, newStatus, tenantId }` | Recalculate affected KPI card values, flash the changed card briefly |
| `load.exception.created` | `{ loadId, exceptionType, severity }` | Increment "At Risk" KPI, add entry to activity feed |
| `quote.status.changed` | `{ quoteId, newStatus }` | Update "Quotes Pending" count, add activity feed entry |
| `invoice.payment.received` | `{ invoiceId, amount }` | Update "Outstanding AR" value, add activity feed entry |
| `notification.new` | `{ notificationId, type, message }` | Increment bell badge count, show toast if configured |

### Live Update Behavior

- **Update frequency:** WebSocket push for critical events (load status, exceptions), polling every 60 seconds for aggregate KPIs
- **Visual indicator:** Changed KPI card flashes with a subtle blue-100 background for 2 seconds, then fades back to white
- **Conflict handling:** Dashboard is read-only; no conflict scenarios. New data always overwrites displayed values.

### Polling Fallback

- **When:** WebSocket connection drops or is unavailable
- **Interval:** Every 60 seconds for KPI data, every 30 seconds for activity feed
- **Endpoint:** `GET /api/dashboard/kpis`, `GET /api/dashboard/activity?since={timestamp}`
- **Visual indicator:** Subtle "Last updated: 2 min ago" text in the page header area when polling is active instead of WebSocket

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| N/A (dashboard is read-only) | -- | -- |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `KPICard` | `src/components/dashboard/kpi-card.tsx` | `title, value, trend, trendDirection, icon, onClick, loading` |
| `DashboardGrid` | `src/components/dashboard/dashboard-grid.tsx` | `columns, gap, children` |
| `PageHeader` | `src/components/layout/page-header.tsx` | `title, subtitle, actions` |
| `Skeleton` | `src/components/ui/skeleton.tsx` | shadcn skeleton for loading states |
| `Card` | `src/components/ui/card.tsx` | shadcn card wrapper |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `KPICard` | Static value display | Add click handler, trend tooltip, threshold-based color coding, loading skeleton |
| `DashboardGrid` | Fixed 4-column grid | Make responsive: 4 cols desktop, 2 cols tablet, 1 col mobile |
| `PageHeader` | Title + actions | Add greeting message, date display, period toggle |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `DashboardGreeting` | Time-aware greeting with user name and current date | Small |
| `TrendChart` | Recharts wrapper for bar and line charts with hover tooltips | Medium |
| `ActivityFeed` | Timestamped list of recent events with entity links and icons | Medium |
| `QuickActionsPanel` | Role-filtered grid of shortcut action buttons | Small |
| `KPICardSkeleton` | Animated skeleton matching exact KPI card layout | Small |
| `PeriodToggle` | Toggle between day/week/month comparison periods | Small |
| `DashboardEmptyState` | Onboarding checklist for new tenants with zero data | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Card | `card` | KPI card containers, chart containers, panels |
| Skeleton | `skeleton` | Loading states for all dashboard widgets |
| Tooltip | `tooltip` | Trend arrow explanations, chart data point details |
| Toggle Group | `toggle-group` | Period selector (Day / Week / Month) |
| Separator | `separator` | Visual divider between dashboard sections |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | `/api/dashboard/kpis` | Fetch role-specific KPI values with trends | `useDashboardKPIs(role, period)` |
| 2 | GET | `/api/dashboard/charts/load-volume` | Load volume by day for bar chart | `useLoadVolumeChart(days)` |
| 3 | GET | `/api/dashboard/charts/on-time` | On-time delivery percentage over time | `useOnTimeChart(days)` |
| 4 | GET | `/api/dashboard/charts/revenue` | Revenue trend for sales/accounting | `useRevenueChart(period)` |
| 5 | GET | `/api/dashboard/charts/pipeline` | Sales pipeline by stage for sales role | `usePipelineChart()` |
| 6 | GET | `/api/dashboard/activity` | Recent activity feed entries | `useActivityFeed(limit, offset)` |
| 7 | GET | `/api/dashboard/quick-actions` | Available quick actions for current role | `useQuickActions()` |

### Request/Response Examples

**GET /api/dashboard/kpis**
```json
// Request: GET /api/dashboard/kpis?role=dispatcher&period=day
// Response:
{
  "kpis": [
    {
      "id": "unassigned_loads",
      "label": "Unassigned Loads",
      "value": 12,
      "previousValue": 8,
      "trend": "up",
      "trendPercent": 50,
      "severity": "warning",
      "clickUrl": "/loads?status=unassigned"
    },
    {
      "id": "in_transit",
      "label": "In Transit",
      "value": 47,
      "previousValue": 49,
      "trend": "down",
      "trendPercent": -4.1,
      "severity": "normal",
      "clickUrl": "/loads?status=in_transit"
    }
  ],
  "period": "day",
  "asOf": "2026-02-06T14:30:00Z"
}
```

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `dashboard:{tenantId}` | `kpi.updated` | `useDashboardUpdates()` -- invalidates KPI query cache |
| `activity:{tenantId}` | `activity.new` | `useActivityStream()` -- prepends new items to feed |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/dashboard/kpis | Show default "0" values | Redirect to login | Show "Access Denied" | Show empty dashboard | Show per-card error with retry |
| GET /api/dashboard/activity | Ignore, show empty feed | Redirect to login | Hide activity section | Show empty feed | Show "Activity unavailable" with retry |
| GET /api/dashboard/charts/* | Show empty chart | Redirect to login | Hide chart | Show empty chart | Show "Chart unavailable" with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 4 skeleton KPI cards (gray animated rectangles matching card dimensions: 280px wide, 120px tall). Show 2 skeleton chart areas (50% width each, 240px tall). Show skeleton activity feed (6 skeleton lines with avatar circles).
- **Progressive loading:** Page header with greeting renders immediately (from cached user data). KPI cards load next (fastest API). Charts load in parallel. Activity feed loads last.
- **Duration threshold:** If loading exceeds 3 seconds, show subtle "Loading your dashboard..." text below the skeleton.

### Empty States

**First-time empty (new tenant, no data):**
- **Illustration:** Rocket ship or dashboard illustration
- **Headline:** "Welcome to Ultra TMS!"
- **Description:** "Your dashboard will show real-time metrics once you start moving freight. Let's get you set up."
- **CTA Buttons:** "Create Your First Load" (primary), "Import Carriers" (secondary), "Invite Team Members" (tertiary)
- **Checklist widget:** Setup progress -- Company Profile (done), Invite Users (pending), Add Carriers (pending), Create First Load (pending)

**Role with no applicable data (e.g., sales agent with zero quotes):**
- Show KPI cards with "0" values and neutral gray styling (no trend arrows)
- Show encouraging message: "No quotes yet this period. Create your first quote to start tracking your pipeline."
- Quick action "Create Quote" button is prominently displayed

### Error States

**Full page error (all APIs fail):**
- **Display:** Central error icon + "Unable to load your dashboard" + "Please check your connection and try again." + Retry button
- No sidebar/header errors (those are separate components)

**Per-widget error (one KPI fails, others succeed):**
- **Display:** Failed KPI card shows gray background with "Unable to load" text and a small "Retry" link. Other cards render normally.

**Action error (quick action navigation fails):**
- **Display:** Toast notification: "Unable to navigate to [destination]. Please try again."

### Permission Denied

- **Full page denied:** Not applicable -- all authenticated users have dashboard access
- **Partial denied:** Financial KPI cards are not rendered for roles without `finance_view` permission. The grid automatically adjusts to fill available space (3 cards instead of 4 stretch wider).

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached dashboard data from [timestamp]." KPI values show last cached values with "(cached)" label. Quick actions still navigate but may fail on destination page.
- **Degraded (WebSocket down):** Show subtle "Live updates paused" indicator near the date display. Polling fallback activates automatically.

---

## 12. Filters, Search & Sort

### Period Toggle (Primary "Filter" on Dashboard)

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Comparison Period | Toggle group | Today, This Week, This Month | Today | `?period=day` |

### Search Behavior

- No search field on the dashboard itself. Users use the Command Palette (Cmd+K) or the header search to find specific entities.

### Sort Options

- Activity feed is always sorted by timestamp descending (newest first). No user sort controls.
- KPI cards display in a fixed role-defined order. No reordering (future enhancement).

### Saved Filters / Presets

- Not applicable for the dashboard in Wave 1. Future enhancement: custom dashboard layouts with saved widget configurations.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to icon-only mode (64px wide)
- KPI cards: 2 per row instead of 4 (2x2 grid)
- Charts: stack vertically (100% width each) instead of side-by-side
- Activity feed and Quick Actions: stack vertically (100% width each)
- Greeting text reduces to "Good morning, Maria" without the subtitle
- Period toggle remains visible

### Mobile (< 768px)

- Sidebar hidden entirely (hamburger menu in header)
- KPI cards: 1 per row (full width), swipeable horizontal carousel as alternative
- Charts: 100% width, reduced height (180px instead of 240px)
- Activity feed: full width, limited to 5 items with "View All" link
- Quick Actions: horizontal scroll row of icon buttons with labels below
- Greeting text: "Hi Maria" (shortened)
- Pull-to-refresh triggers full dashboard data reload

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Same layout, slightly narrower cards |
| Tablet | 768px - 1023px | 2-column KPI grid, stacked charts |
| Mobile | < 768px | Single column, carousel KPIs, simplified |

---

## 14. Stitch Prompt

```
Design a role-specific dashboard home page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar on the left (240px wide) and a white content area on the right. The sidebar shows navigation items with icons: Dashboard (active, blue-600 highlight), Orders, Loads, Dispatch Board, Tracking Map, Carriers, Accounting, Reports, Settings. At the top of the sidebar is the "Ultra TMS" logo text in white. At the bottom is a small user avatar with "Maria Rodriguez" and "Dispatcher" role label.

Header bar: 64px tall, white background, subtle bottom border. Left side shows breadcrumb "Dashboard". Right side shows a search icon button, a bell icon with a red "3" badge, and a user avatar dropdown.

Content Area (Dispatcher variant):

Top section: A personalized greeting "Good morning, Maria" in 24px semibold gray-900 text, with "Thursday, February 6, 2026" in 14px gray-500 below it. To the far right, a toggle group with three options: "Day" (active), "Week", "Month".

Below the greeting, show a row of 4 KPI stat cards in a horizontal grid with equal widths:
1. "Unassigned Loads" - value "12" in 32px bold blue-600, with a red upward trend arrow and "+8% vs yesterday" in 12px red text. Small truck icon in top-right corner of card in gray-200.
2. "In Transit" - value "47" in 32px bold gray-900, green downward trend arrow and "-2%" in green text. Small map-pin icon.
3. "At Risk" - value "3" in 32px bold red-600, card has a subtle red-50 left border. Alert triangle icon. Subtext: "+1 since 8 AM" in red.
4. "Today's Deliveries" - value "18" in 32px bold gray-900. Subtext: "2 late" in red-600 text. Package icon.

Each card: white background, rounded-lg, border border-gray-200, shadow-sm, padding 20px, hover shadow-md transition.

Below the KPI cards, show two charts side by side (50%/50%):
- Left chart: "Load Volume" bar chart showing 7 days (Mon-Sun) with blue-600 bars of varying heights (35, 42, 38, 51, 47, 22, 15). Y-axis shows load count.
- Right chart: "On-Time Delivery %" line chart showing 30 days with a blue-600 line hovering around 92-96%. A dashed gray line at 95% marks the target. Current value "93.2%" shown in top-right of chart.

Below the charts, two panels side by side (60%/40%):
- Left panel: "Recent Activity" feed with 6 entries, each showing: a colored dot (green, blue, yellow), timestamp ("2 min ago", "15 min ago", etc.), and description ("Load L-2025-4521 delivered at Phoenix, AZ", "Carrier Swift Transport assigned to L-4522", "Quote Q-891 accepted by Acme Mfg"). Each entry has the entity name as a blue link.
- Right panel: "Quick Actions" with 4 buttons stacked vertically: "+ Create Load" (primary blue), "Dispatch Board" (outline), "Tracking Map" (outline), "Run Daily Report" (ghost/subtle).

Design Specifications:
- Font: Inter, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator bar on left
- Content background: white (#FFFFFF)
- Primary color: blue-600 (#2563EB) for active states, buttons, links
- KPI card borders: gray-200, hover elevation to shadow-md
- Charts: Recharts style with blue-600 primary color, gray-200 grid lines
- Activity feed: 14px text, gray-500 timestamps, blue-600 entity links
- Modern SaaS aesthetic matching Linear.app or Vercel dashboard
- Clean whitespace, 24px section gaps, 16px card gaps

Include: The greeting with date, period toggle, 4 KPI cards with trends, 2 charts, activity feed, and quick actions panel. Show realistic freight data.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Basic dashboard page rendering at `/(dashboard)/dashboard`
- [x] KPI card component with label and value display
- [x] CSS Grid layout for card arrangement
- [x] Role detection from user session to determine dashboard variant
- [x] Basic navigation to dashboard from sidebar

**What needs polish / bug fixes:**
- [ ] KPI cards show static values -- no auto-refresh or real-time updates
- [ ] No loading skeleton -- page shows blank content area during data fetch
- [ ] Trend arrows are hardcoded, not calculated from actual period comparison
- [ ] Activity feed is placeholder data, not connected to real activity events
- [ ] No click-through from KPI cards to filtered list views
- [ ] Charts are not implemented yet (placeholder empty areas)
- [ ] No greeting or date display
- [ ] Dashboard does not adapt widget count based on role permissions

**What to add this wave:**
- [ ] Implement all role-specific KPI card sets (dispatcher, sales, accounting, ops_manager, admin)
- [ ] Add click-through navigation from every KPI card to the appropriate filtered list
- [ ] Implement 60-second polling refresh for KPI data
- [ ] Build trend comparison logic (day-over-day, week-over-week, month-over-month)
- [ ] Add Recharts bar and line charts for load volume and on-time percentage
- [ ] Connect activity feed to real event data via `/api/dashboard/activity`
- [ ] Build role-filtered quick actions panel
- [ ] Add skeleton loading states for all widgets
- [ ] Add per-widget error boundaries with retry links
- [ ] Implement empty state for new tenants with setup checklist

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| KPI click-through to filtered lists | High | Low | P0 |
| Role-specific KPI card sets | High | Medium | P0 |
| Auto-refresh polling (60s) | High | Low | P0 |
| Skeleton loading states | Medium | Low | P0 |
| Trend comparison calculation | Medium | Medium | P1 |
| Recharts chart implementation | Medium | Medium | P1 |
| Activity feed with real data | Medium | Medium | P1 |
| Quick actions panel | Medium | Low | P1 |
| New tenant empty state | Low | Medium | P2 |
| WebSocket live KPI updates | Medium | High | P2 |
| Dashboard widget reordering | Low | High | P2 (future wave) |

### Future Wave Preview

- **Wave 2:** WebSocket live updates replacing polling, dashboard widget drag-and-drop reordering, custom widget creation
- **Wave 3:** Saved dashboard layouts, shared dashboard templates, scheduled dashboard email snapshots
- **Wave 4:** AI-powered insights widget ("3 loads at risk -- here's what to do"), predictive KPIs, anomaly detection alerts
- **Wave 5:** Embeddable dashboard widgets for customer/carrier portals, white-label dashboard builder

---

*This document was created as part of the Wave 1 Enhancement Focus design process for Ultra TMS Dashboard Shell service (01.1).*
