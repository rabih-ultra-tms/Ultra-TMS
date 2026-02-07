# Sales Dashboard

> Service: Sales (03) | Wave: 1 | Priority: P0
> Route: /sales | Status: In Progress
> Primary Personas: James Wilson (Sales Agent), Sales Manager
> Roles with Access: super_admin, admin, sales_manager, sales_agent (scoped to own data)

---

## 1. Purpose & Business Context

**What this screen does:**
The Sales Dashboard is the daily command center for the sales team. It aggregates quote metrics, pipeline value, conversion rates, expiring quotes, and recent activity into a single-glance overview. Sales agents see their personal performance; sales managers see team-wide metrics with the ability to drill down by agent.

**Business problem it solves:**
Without a centralized dashboard, sales agents start their day by opening spreadsheets, checking email for quote responses, and manually tracking their pipeline. This scattershot approach means expiring high-value quotes get missed, follow-up timing is poor, and managers have no visibility into team performance until end-of-month reports. The Sales Dashboard eliminates this by surfacing the most important information proactively -- what needs attention right now, what is trending, and where to focus effort for maximum revenue impact.

**Key business rules:**
- Sales agents see only their own quotes and metrics unless they have the `team_view` permission.
- Sales managers see team-wide metrics by default, with the ability to filter to individual agents.
- Pipeline value is calculated from quotes in SENT and VIEWED statuses (actively in play).
- Conversion rate is calculated as ACCEPTED / (ACCEPTED + REJECTED + EXPIRED) over the selected time period.
- "Expiring Soon" highlights quotes that expire within 48 hours.
- Revenue metrics are only visible to users with the `finance_view` permission; others see quote count and conversion metrics without dollar values.

**Success metric:**
Sales agents identify and act on expiring quotes within 1 hour of logging in. Daily quote volume increases by 20% due to reduced friction. Time from dashboard review to first quote action drops from 10 minutes to under 2 minutes.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Sales" or "Sales Dashboard" in sidebar | None (loads default view) |
| Login Page | After authentication, sales roles land here as home screen | None |
| Global Navigation | Clicks "Sales" in top nav breadcrumb | None |
| Direct URL | Bookmark / shared link | Route params (optional date range) |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Quotes List | Clicks any KPI card (e.g., "Open Quotes: 42") or "View All Quotes" link | Pre-set filter matching the KPI (e.g., status=SENT,VIEWED) |
| Quote Detail | Clicks a quote in the "Expiring Soon" or "Recent Activity" list | `quoteId` |
| Quote Builder | Clicks "+ New Quote" button in page header | None (blank form) |
| Sales Reports | Clicks "View Reports" link or chart drill-down | Report type, date range |
| CRM / Customer Detail | Clicks customer name in activity feed or pipeline | `customerId` |

**Primary trigger:**
James logs in at 7:00 AM. The Sales Dashboard is his home screen. He scans the KPIs to understand his day: how many quotes are open, which ones are expiring, and whether any were accepted or rejected overnight. He clicks on the highest-priority expiring quote to follow up. The Sales Manager opens the dashboard at 8:00 AM to review the team's pipeline and check for quotes requiring margin approval.

**Success criteria (user completes the screen when):**
- User has reviewed all KPI metrics and understands the current state of their pipeline.
- User has identified and prioritized quotes that need immediate follow-up (expiring, recently viewed).
- User has navigated to the highest-priority item for action (quote detail, new quote, or report).

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Top Bar: [Sales] > Dashboard          [Date Range: This Month v]      |
|                                         [+ New Quote] (primary btn)    |
+------------------------------------------------------------------------+
|                                                                        |
|  +-------+  +-------+  +-------+  +-------+  +-------+  +-------+    |
|  | KPI 1 |  | KPI 2 |  | KPI 3 |  | KPI 4 |  | KPI 5 |  | KPI 6 |  |
|  | Quotes|  |Convert|  |Pipelin|  |Revenue|  |Avg    |  |Margin |    |
|  | Sent  |  | Rate  |  | Value |  |  Won  |  | Quote |  | Avg   |    |
|  |  42   |  | 38.5% |  | $184K |  | $68K  |  |$2,450 |  |18.2%  |    |
|  | +12%  |  | +3.2% |  | -5%   |  | +22%  |  | +$120 |  | -0.8% |    |
|  +-------+  +-------+  +-------+  +-------+  +-------+  +-------+    |
|                                                                        |
|  +------------------------------+  +-------------------------------+   |
|  |  PIPELINE CHART              |  |  CONVERSION FUNNEL            |   |
|  |  (Stacked bar or area chart) |  |  (Horizontal funnel diagram)  |   |
|  |                              |  |                               |   |
|  |  Quotes Over Time            |  |  Draft(120) > Sent(89) >     |   |
|  |  Grouped by status           |  |  Viewed(62) > Accepted(34) > |   |
|  |  Last 30 days                |  |  Converted(28)               |   |
|  |  [Daily/Weekly/Monthly]      |  |                               |   |
|  +------------------------------+  +-------------------------------+   |
|                                                                        |
|  +------------------------------+  +-------------------------------+   |
|  |  EXPIRING SOON (next 48h)    |  |  RECENT ACTIVITY              |   |
|  |  +--------------------------+|  |  +---------------------------+ |   |
|  |  | QT-0042 | Acme Mfg     ||  |  | James sent QT-0045       | |   |
|  |  | CHI->DAL | $2,450       ||  |  | 10 min ago               | |   |
|  |  | Expires in 6h  [Follow] ||  |  |---------------------------| |   |
|  |  |--------------------------|  |  | QT-0039 viewed by        | |   |
|  |  | QT-0038 | Global Foods  ||  |  | Global Foods             | |   |
|  |  | LA->PHX | $1,875        ||  |  | 25 min ago               | |   |
|  |  | Expires in 22h [Follow] ||  |  |---------------------------| |   |
|  |  +--------------------------+|  |  | QT-0037 accepted by      | |   |
|  |  | View All Expiring (8)    ||  |  | Acme Manufacturing       | |   |
|  |  +------------------------------+  | 1 hour ago  [Convert]    | |   |
|  |                              |  |  +---------------------------+ |   |
|  +------------------------------+  +-------------------------------+   |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  QUOTE PIPELINE KANBAN (optional, collapsible)                   |  |
|  |  [DRAFT: 12] [SENT: 28] [VIEWED: 14] [ACCEPTED: 6]             |  |
|  |  | QT-0050 | | QT-0048 | | QT-0042 |  | QT-0037 |             |  |
|  |  | QT-0049 | | QT-0047 | | QT-0041 |  | QT-0035 |             |  |
|  |  | QT-0048 | | QT-0046 | | QT-0040 |  | QT-0034 |             |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | 6 KPI cards (quotes sent, conversion rate, pipeline value, revenue won, avg quote, avg margin), date range selector | Agents need performance snapshot at a glance to prioritize their day |
| **Secondary** (visible but less prominent) | Pipeline chart, conversion funnel, expiring quotes list | Trends and urgent items that guide daily actions |
| **Tertiary** (available on scroll) | Recent activity feed, pipeline kanban board | Historical context and visual pipeline management |
| **Hidden** (behind a click) | Detailed reports, agent-level drill-down (manager view), quote detail | Deep analysis accessed on demand |

---

## 4. Data Fields & Display

### Visible Fields

**KPI Cards Row**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Quotes Sent | dashboard.quotesSentCount | Integer with trend arrow and percentage change vs prior period | KPI card 1 |
| 2 | Conversion Rate | dashboard.conversionRate | Percentage (XX.X%) with trend arrow | KPI card 2 |
| 3 | Pipeline Value | dashboard.pipelineValue | Currency ($XXX,XXX) with trend arrow | KPI card 3 |
| 4 | Revenue Won | dashboard.revenueWon | Currency ($XXX,XXX) with trend arrow | KPI card 4 |
| 5 | Average Quote Value | dashboard.avgQuoteValue | Currency ($X,XXX) with trend arrow | KPI card 5 |
| 6 | Average Margin | dashboard.avgMarginPercent | Percentage (XX.X%) with trend arrow, color-coded | KPI card 6 |

**Expiring Quotes List**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 7 | Quote Number | Quote.quoteNumber | `QT-YYYYMMDD-XXXX`, monospace, clickable link | Expiring list, left |
| 8 | Customer Name | Company.name | Text, truncated at 20 chars with tooltip | Expiring list, center |
| 9 | Lane | Quote.origin + destination | "City, ST -> City, ST" format | Expiring list, below customer |
| 10 | Total Amount | Quote.totalAmount | Currency ($X,XXX.XX) | Expiring list, right |
| 11 | Expires In | Calculated from Quote.expiryDate | Relative time ("6h", "22h", "2d"), red if <12h, amber if <48h | Expiring list, right |
| 12 | Follow Up Action | N/A (UI button) | "Follow Up" ghost button | Expiring list, far right |

**Recent Activity Feed**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 13 | Activity Description | timeline.description | "[User] [action] [quote/customer]" natural language | Activity feed, main text |
| 14 | Timestamp | timeline.createdAt | Relative time ("10 min ago", "1 hour ago") | Activity feed, below description |
| 15 | Activity Icon | timeline.type | Icon based on type: sent (mail), viewed (eye), accepted (check), rejected (x) | Activity feed, left of text |
| 16 | Action Button | N/A (contextual) | "Convert", "Follow Up", "View" depending on activity type | Activity feed, right side |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Conversion Rate | ACCEPTED / (ACCEPTED + REJECTED + EXPIRED) for selected period | Percentage with 1 decimal (XX.X%) |
| 2 | Pipeline Value | SUM(totalAmount) where status IN ('SENT', 'VIEWED') | Currency ($XXX,XXX) |
| 3 | Revenue Won | SUM(totalAmount) where status = 'ACCEPTED' or 'CONVERTED' for selected period | Currency ($XXX,XXX) |
| 4 | Trend Percentage | ((currentPeriod - priorPeriod) / priorPeriod) * 100 | Percentage with sign (+/-), green for positive, red for negative |
| 5 | Expiry Countdown | Quote.expiryDate - now() | Relative time, color-coded by urgency |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] 6 KPI stat cards with trend indicators (quotes sent, conversion rate, pipeline value, revenue won, avg quote, avg margin)
- [ ] Date range selector (Today, This Week, This Month, This Quarter, Custom) affecting all KPIs and charts
- [ ] Pipeline chart showing quotes over time grouped by status (stacked bar or area chart)
- [ ] Conversion funnel visualization (Draft -> Sent -> Viewed -> Accepted -> Converted)
- [ ] Expiring quotes list (quotes expiring within 48 hours, sorted by urgency)
- [ ] Recent activity feed (last 20 activities: sent, viewed, accepted, rejected, converted)
- [ ] "+ New Quote" primary action button in page header
- [ ] Click-through from KPI cards to filtered Quotes List
- [ ] Click-through from expiring quotes to Quote Detail
- [ ] Role-aware data scoping (agent sees own data, manager sees team data)

### Advanced Features (Logistics Expert Recommendations)

- [ ] Quote pipeline Kanban board (drag-drop optional, visual pipeline view)
- [ ] Agent comparison chart (manager view) showing performance by team member
- [ ] Win rate by lane/equipment heatmap (which lanes are most competitive)
- [ ] Market rate trend overlay on pipeline chart (compare quote rates to market movement)
- [ ] Auto-refresh dashboard every 60 seconds with subtle update animation
- [ ] Configurable KPI cards (user can choose which 6 metrics to display)
- [ ] Quote-of-the-day highlight (highest value accepted quote)
- [ ] Weekly/monthly goal progress bar (agent-specific or team-specific targets)
- [ ] Email notification digest option ("Send me a daily summary at 7 AM")
- [ ] Saved dashboard layouts per user

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View revenue/dollar metrics | sales_agent, sales_manager, admin | finance_view | KPI cards show count-based metrics only; dollar values replaced with "--" |
| View team-wide metrics | sales_manager, admin | team_view | Dashboard shows only personal metrics; no agent filter dropdown |
| View margin data | sales_manager, admin | margin_view | Avg Margin KPI card hidden; margin column hidden in expiring quotes |
| Pipeline Kanban (drag-drop) | sales_manager, admin | quote_edit | Kanban view-only; no drag-drop status changes |
| Agent performance comparison | sales_manager, admin | team_view | Chart section hidden entirely |

---

## 6. Status & State Machine

### Status Transitions (Dashboard Context)

The dashboard displays quotes across all statuses but focuses on active pipeline statuses. The status machine itself is defined in the Quote Builder and Quote Detail screens. Here, the dashboard tracks these statuses for grouping and counting:

```
[DRAFT] ---> [SENT] ---> [VIEWED] ---> [ACCEPTED] ---> [CONVERTED]
                |              |              |
                └──> [EXPIRED] └──> [EXPIRED] └──> [REJECTED]
```

### Actions Available Per Status (Dashboard Level)

| Status | Available Actions (from Dashboard) | Restricted Actions |
|---|---|---|
| DRAFT | Click to open in Quote Builder (edit) | Send, Convert |
| SENT | Click to view detail, "Follow Up" (opens email/call action) | Edit rate, Convert |
| VIEWED | Click to view detail, "Follow Up" (high priority) | Edit rate, Convert |
| ACCEPTED | Click to view detail, "Convert to Order" button | Edit, Re-send |
| CONVERTED | Click to view detail (read-only), "View Order" link | All edit actions |
| REJECTED | Click to view detail, "Revise Quote" (creates new version) | Send, Convert |
| EXPIRED | Click to view detail, "Revise Quote" (creates new version) | Send, Convert |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| DRAFT | gray-100 | gray-700 | gray-300 | `bg-gray-100 text-gray-700 border-gray-300` |
| SENT | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| VIEWED | purple-100 | purple-800 | purple-300 | `bg-purple-100 text-purple-800 border-purple-300` |
| ACCEPTED | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| CONVERTED | emerald-100 | emerald-800 | emerald-300 | `bg-emerald-100 text-emerald-800 border-emerald-300` |
| REJECTED | red-100 | red-800 | red-300 | `bg-red-100 text-red-800 border-red-300` |
| EXPIRED | amber-100 | amber-800 | amber-300 | `bg-amber-100 text-amber-800 border-amber-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Quote | Plus | Primary / Blue | Navigates to Quote Builder (`/sales/quotes/new`) | No |
| Export | Download | Secondary / Outline | Downloads CSV of current dashboard data | No |

### Secondary Actions (Per-Item)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Follow Up | Phone | Opens quick-action modal: call/email customer about this quote | Quote is in SENT or VIEWED status |
| Convert to Order | ArrowRight | Navigates to conversion confirmation, then creates TMS Core order | Quote is in ACCEPTED status |
| View Quote | Eye | Navigates to Quote Detail page | Any status |
| Revise Quote | Edit | Creates new version of quote, opens in Quote Builder | Quote is in REJECTED or EXPIRED status |

### Bulk Actions

N/A -- dashboard does not support bulk selection. Bulk actions are available on the Quotes List screen.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + Q | Open Quick Quote (new quote shortcut) |
| Ctrl/Cmd + K | Open global search / command palette |
| R | Refresh dashboard data |
| 1-6 | Jump to corresponding KPI card's drill-down view |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Quote card (in Kanban section) | Status column | Changes quote status (e.g., drag from SENT to VIEWED). Only forward transitions allowed. Manager role required. |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| quote.created | { quoteId, agentId, customer, amount } | Increment "Quotes Sent" KPI, add to activity feed, flash update animation |
| quote.status.changed | { quoteId, oldStatus, newStatus, changedBy } | Update KPI counts, update pipeline chart, add to activity feed, flash changed KPI card |
| quote.viewed | { quoteId, viewedBy, viewedAt } | Update "VIEWED" count, add to activity feed with eye icon, show toast "QT-XXXX viewed by [customer]" |
| quote.accepted | { quoteId, customer, amount } | Increment conversion rate, add to revenue won, prominent toast notification, add to activity feed |
| quote.expired | { quoteId, customer, amount } | Move from pipeline to expired count, update pipeline value, add to activity feed |

### Live Update Behavior

- **Update frequency:** WebSocket push for all quote status changes. KPI recalculation on every event. Charts refresh every 60 seconds.
- **Visual indicator:** KPI cards flash with subtle blue highlight when their value changes. New activity feed items slide in from the top with fade animation.
- **Conflict handling:** N/A -- dashboard is read-only. Multiple users viewing simultaneously is not a conflict.

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** `GET /api/v1/sales/dashboard?updatedSince={lastPollTimestamp}`
- **Visual indicator:** Show "Live updates paused -- reconnecting..." banner at top of content area

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| N/A (dashboard is read-only) | N/A | N/A |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title: "Sales Dashboard", breadcrumbs, actions: [New Quote] |
| StatsCard | src/components/ui/stats-card.tsx | value, label, trend, trendDirection, onClick |
| StatusBadge | src/components/ui/status-badge.tsx | status, size: 'sm' |
| Card | src/components/ui/card.tsx | Container for chart sections, lists |
| Button | src/components/ui/button.tsx | Primary, secondary, ghost variants |
| Skeleton | src/components/ui/skeleton.tsx | Loading states for all cards and sections |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| StatsCard | Basic value + label | Add trend arrow with percentage, sparkline mini-chart, click-to-filter integration |
| StatusBadge | Generic badge | Add quote-specific color palette (7 statuses), pulse animation for recently-changed items |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| ConversionFunnel | Horizontal funnel visualization showing quote stages with counts and drop-off rates | Medium |
| QuotePipelineChart | Stacked bar or area chart showing quotes over time grouped by status | Medium |
| ExpiringQuoteCard | Compact card for expiring quotes with countdown timer, customer info, lane, amount, follow-up button | Small |
| ActivityFeedItem | Single activity item with icon, description, timestamp, and contextual action button | Small |
| ActivityFeed | Scrollable container for ActivityFeedItems with "Load More" pagination | Medium |
| QuotePipelineKanban | Kanban board with status columns showing quote mini-cards. Optional drag-drop. | High |
| AgentPerformanceChart | Bar chart comparing agent metrics (quotes, conversion, revenue). Manager view only. | Medium |
| DateRangeSelector | Dropdown with preset ranges (Today, This Week, This Month, etc.) and custom date picker | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Select | select | Date range selector, agent filter dropdown |
| Popover | popover | Date range custom picker |
| Calendar | calendar | Custom date range selection |
| Tooltip | tooltip | KPI card explanations, chart data point hover |
| Separator | separator | Visual dividers between dashboard sections |
| Skeleton | skeleton | Loading states |
| ScrollArea | scroll-area | Activity feed scrollable container |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/sales/dashboard | Fetch KPI data (role-aware) | useSalesDashboard(dateRange, agentId?) |
| 2 | GET | /api/v1/sales/dashboard/charts | Fetch chart data (pipeline, conversion funnel) | useSalesCharts(dateRange, agentId?) |
| 3 | GET | /api/v1/sales/dashboard/pipeline | Fetch pipeline data grouped by status | useSalesPipeline(dateRange, agentId?) |
| 4 | GET | /api/v1/sales/dashboard/activity | Fetch recent activity feed | useSalesActivity(limit, offset) |
| 5 | GET | /api/v1/sales/dashboard/expiring | Fetch quotes expiring within timeframe | useExpiringQuotes(hoursAhead) |
| 6 | GET | /api/v1/quotes/stats | Fetch quote statistics for KPI cards | useQuoteStats(dateRange) |
| 7 | POST | /api/v1/quotes/:id/convert | Convert accepted quote to order | useConvertQuote() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| sales:{tenantId} | quote.created | useSalesUpdates() -- invalidates dashboard queries |
| sales:{tenantId} | quote.status.changed | useSalesUpdates() -- invalidates dashboard and stats queries |
| sales:{tenantId} | quote.viewed | useSalesUpdates() -- updates activity feed |
| sales:{tenantId} | quote.accepted | useSalesUpdates() -- invalidates all dashboard queries, shows toast |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/sales/dashboard | Show date range error toast | Redirect to login | Show "Access Denied" page | N/A | Show error state with retry button per section |
| GET /api/v1/sales/dashboard/charts | Show chart error inline | Redirect to login | Hide chart section | N/A | Show "Could not load chart" with retry |
| POST /api/v1/quotes/:id/convert | Show validation toast | Redirect to login | Show "Permission Denied" toast | Show "Quote not found" toast | Show error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 6 skeleton KPI cards (gray animated rectangles). Show 2 skeleton chart areas below. Show skeleton list items for expiring quotes and activity feed.
- **Progressive loading:** Page header and KPI card shells render immediately. Data fills in progressively as API calls complete.
- **Duration threshold:** If loading exceeds 5 seconds, show "This is taking longer than usual..." message in the chart areas.

### Empty States

**First-time empty (no quotes ever created):**
- **Illustration:** Sales/handshake illustration
- **Headline:** "Welcome to your Sales Dashboard"
- **Description:** "Create your first quote to start building your sales pipeline. Your metrics, charts, and activity will appear here."
- **CTA Button:** "Create First Quote" -- primary blue button

**Filtered empty (data exists but date range has no activity):**
- **Headline:** "No sales activity in this period"
- **Description:** "Try selecting a different date range to see your pipeline data."
- **CTA Button:** "Reset to This Month" -- secondary outline button

**No expiring quotes:**
- **Display:** "No quotes expiring in the next 48 hours" with check icon (positive state)

### Error States

**Full page error (all API calls fail):**
- **Display:** Error icon + "Unable to load Sales Dashboard" + "Please try again or contact support." + Retry button

**Per-section error (partial failure):**
- **Display:** Successful sections render normally. Failed sections show inline: "Could not load [section name]" with Retry link. Other sections remain functional.

**Action error (convert quote fails):**
- **Display:** Toast notification: red background, error icon, message, dismiss button. Auto-dismiss after 8 seconds.

### Permission Denied

- **Full page denied:** Show "You don't have permission to view the Sales Dashboard" with link to main dashboard
- **Partial denied (financial data hidden):** Dollar-value KPIs show "--" instead of amounts; pipeline value card shows "Pipeline: 42 quotes" instead of dollar value

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached data from [timestamp]."
- **Degraded (WebSocket down):** Show subtle indicator: "Live updates paused" near the page header. Data refreshes on manual interaction.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Date Range | Select with presets | Today, This Week, This Month, This Quarter, This Year, Custom | This Month | ?dateRange=this_month |
| 2 | Agent (Manager view) | Searchable select | All agents in the team | All (team) | ?agentId= |
| 3 | Service Type | Multi-select | FTL, LTL, Partial, Drayage | All | ?serviceType= |
| 4 | Equipment Type | Multi-select | DRY_VAN, REEFER, FLATBED, etc. | All | ?equipmentType= |

### Search Behavior

- **Search field:** Not applicable at the dashboard level. Use global search (Ctrl+K) for quote lookup.

### Sort Options

**Expiring Quotes list:**
| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Expiry Date | Ascending (soonest first) | Date |
| Total Amount | Descending (highest first) | Numeric |

**Activity Feed:**
| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Timestamp | Descending (newest first) | Date |

**Default sort:** Expiring quotes by expiry date ascending (most urgent first). Activity feed by timestamp descending (newest first).

### Saved Filters / Presets

- **System presets:** "My Pipeline" (agent's own data), "Team Pipeline" (manager only), "High Value (>$5K)" (pipeline filtered to high-value quotes)
- **User-created presets:** Not applicable on dashboard; available on Quotes List.
- **URL sync:** Date range and agent filter reflected in URL for sharing.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- KPI cards: 3 per row (2 rows of 3) instead of 6 in a single row
- Charts: stack vertically (pipeline chart full-width, then funnel full-width)
- Expiring quotes and activity feed: stack vertically (full-width each)
- Kanban section: hide by default; show with toggle button
- Sidebar collapses to icon-only mode

### Mobile (< 768px)

- KPI cards: 2 per row (3 rows of 2), compact size
- Charts: single column, scrollable horizontally for wide charts
- Expiring quotes: card-based list, one card per row, swipe for actions
- Activity feed: compact list view, tap to expand
- Kanban: hidden entirely on mobile
- "+ New Quote" button: sticky bottom bar
- Pull-to-refresh for data reload
- Date range filter: full-screen modal on tap

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full 6-column KPI row, 2-column chart row, 2-column lists, optional Kanban |
| Desktop | 1024px - 1439px | Same layout, slightly compressed spacing |
| Tablet | 768px - 1023px | 3-column KPI grid, single-column charts and lists |
| Mobile | < 768px | 2-column KPI grid, single-column everything, sticky bottom action bar |

---

## 14. Stitch Prompt

```
Design a sales dashboard for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar on the left (240px wide, collapsed to icons). White content area on the right. Top of content area has a page header with breadcrumb "Sales > Dashboard", the page title "Sales Dashboard" in semibold 24px, and a blue-600 "+ New Quote" button on the far right. Next to the button, a date range dropdown showing "This Month" with a calendar icon.

KPI Row: Below the header, a row of 6 stat cards in a horizontal grid. Each card is a white rounded-lg container with subtle border. Each card shows:
- Card 1: "Quotes Sent" label in gray-500 text-sm, value "42" in text-2xl font-bold, trend "+12% vs last month" in green-600 with an up-arrow icon, small sparkline chart in blue-200
- Card 2: "Conversion Rate" with value "38.5%" in text-2xl, trend "+3.2%" in green-600
- Card 3: "Pipeline Value" with value "$184,200" in text-2xl, trend "-5%" in red-500 with down-arrow
- Card 4: "Revenue Won" with value "$68,450" in text-2xl, trend "+22%" in green-600
- Card 5: "Avg Quote Value" with value "$2,450" in text-2xl, trend "+$120" in green-600
- Card 6: "Avg Margin" with value "18.2%" in text-2xl, trend "-0.8%" in amber-500

Charts Row: Below KPIs, two charts side by side (50/50 split) in white cards with headers:
- Left: "Quote Pipeline" showing a stacked area chart with 4 colored layers (Draft in gray, Sent in blue, Viewed in purple, Accepted in green) over the last 30 days. X-axis shows dates, Y-axis shows count. Include a subtle grid.
- Right: "Conversion Funnel" showing a horizontal funnel with 5 stages decreasing left to right: Draft (120, gray) > Sent (89, blue) > Viewed (62, purple) > Accepted (34, green) > Converted (28, emerald). Show drop-off percentages between stages.

Lower Section: Two panels side by side (50/50 split):
- Left: "Expiring Soon" panel with a list of 4 quotes expiring within 48 hours. Each row shows: quote number in monospace blue link (QT-20260205-0042), customer name (Acme Manufacturing), lane (Chicago, IL -> Dallas, TX) with an arrow icon, total amount ($2,450.00), expiry countdown in red badge ("6h left"), and a ghost "Follow Up" button. Rows have subtle hover state.
- Right: "Recent Activity" feed with 5 items. Each item has a colored icon on the left (mail icon in blue for sent, eye icon in purple for viewed, check icon in green for accepted), description text ("James sent QT-0045 to Global Foods"), and relative timestamp ("10 min ago") in gray-400. The accepted activity has a small "Convert" button.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size, 24px page title
- Sidebar: slate-900 background, "Sales" nav item highlighted with blue-600 left border indicator and blue-50 background
- Content background: slate-50 (#F8FAFC) with white cards
- Primary color: blue-600 for buttons, links, active states
- Cards: white background, rounded-lg (8px), border border-slate-200, no shadow
- KPI values: text-2xl font-bold text-slate-900
- Trend indicators: green-600 for positive, red-500 for negative, amber-500 for neutral
- Chart colors: gray-300 (Draft), blue-500 (Sent), purple-500 (Viewed), green-500 (Accepted), emerald-500 (Converted)
- Activity icons: 32px circle with colored background matching status
- Expiry badges: red-100 background with red-700 text for <12h, amber-100 with amber-700 for <48h
- Modern SaaS aesthetic similar to Linear.app or HubSpot dashboard
- Show realistic freight industry data throughout
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Basic page layout with header and navigation
- [x] Placeholder KPI cards with static data
- [ ] Chart integrations (not started)
- [ ] Activity feed (not started)
- [ ] Expiring quotes list (not started)

**What needs polish / bug fixes:**
- [ ] KPI cards need real-time data binding instead of static placeholders
- [ ] Date range selector not yet functional
- [ ] Missing loading skeletons for all sections
- [ ] No responsive design implemented yet

**What to add this wave:**
- [ ] Connect KPI cards to real API data with trend calculation
- [ ] Implement pipeline chart with Recharts or similar
- [ ] Implement conversion funnel visualization
- [ ] Build expiring quotes list with countdown timers
- [ ] Build activity feed with real-time updates via WebSocket
- [ ] Add click-through from KPI cards to filtered Quotes List
- [ ] Add "+ New Quote" button integration
- [ ] Implement role-based data scoping (personal vs team)
- [ ] Add date range selector with presets and custom range

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| KPI cards with real data + trends | High | Medium | P0 |
| Expiring quotes list with countdown | High | Low | P0 |
| Activity feed with real-time updates | High | Medium | P0 |
| Pipeline chart | Medium | Medium | P1 |
| Conversion funnel | Medium | Medium | P1 |
| Date range selector | Medium | Low | P1 |
| Role-based scoping | High | Medium | P1 |
| Click-through to Quotes List | Medium | Low | P1 |
| Pipeline Kanban board | Low | High | P2 |
| Agent performance comparison | Low | Medium | P2 |
| Configurable KPI cards | Low | Medium | P3 |

### Future Wave Preview

- **Wave 2:** AI-powered quote recommendation engine ("Suggested rate for this lane based on last 30 days: $2,350"). Predictive conversion scoring on each quote. Automated follow-up reminders based on customer engagement patterns.
- **Wave 3:** Revenue forecasting dashboard with confidence intervals. Customer lifetime value integration. Competitive intelligence overlay (market share by lane).

---

<!--
DESIGN NOTES:
1. Dashboard is role-aware: sales_agent sees personal metrics, sales_manager sees team metrics.
2. Financial metrics (dollar values, margins) require finance_view permission.
3. The Kanban section is optional and can be toggled by the user. Default: collapsed.
4. Real-time updates via WebSocket are critical for quote.viewed events (time-sensitive follow-up).
5. Chart library recommendation: Recharts (React-native, composable, good shadcn integration).
-->
