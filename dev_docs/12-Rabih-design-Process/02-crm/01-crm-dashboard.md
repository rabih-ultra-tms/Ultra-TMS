# CRM Dashboard

> Service: CRM (Service 02) | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/crm | Status: Built
> Primary Personas: James Wilson (Sales Agent), Sarah Chen (Ops Manager)
> Roles with Access: Sales Agent, Sales Manager, Ops Manager, Admin (read-only for all users)

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a high-level overview of the entire CRM pipeline, including lead metrics, opportunity values, recent activities, and sales team performance. It serves as the daily starting point for sales agents and managers to prioritize their work and track progress toward goals.

**Business problem it solves:**
Without a centralized dashboard, sales agents would need to navigate between multiple screens to understand their pipeline health, upcoming tasks, and conversion metrics. This screen consolidates the most critical CRM data into a single view, enabling faster decision-making and reducing the time from login to first productive action.

**Key business rules:**
- Sales agents see only their own pipeline data and assigned leads/opportunities
- Sales managers see team-wide metrics with drill-down to individual reps
- Ops managers and admins see all-tenant data with no filtering restrictions
- Revenue and financial metrics (deal values, weighted pipeline) require `finance_view` permission
- Dashboard data refreshes automatically every 60 seconds via polling
- HubSpot sync status is surfaced when sync errors exist

**Success metric:**
Sales agents identify their top 3 priorities for the day within 30 seconds of landing on the dashboard. Pipeline accuracy (weighted forecast vs. actual closed) improves by 20%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Main sidebar navigation | Click "CRM" menu item | None |
| Login redirect | After successful authentication (if CRM is default module) | None |
| Notification bell | Click CRM-related notification | Optional context (lead/opp ID) |
| Global search | Select CRM entity from search results | Redirect to specific entity |
| Direct URL | Bookmark / shared link | None |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Leads List | Click "View All Leads" or leads KPI card | Optional status filter |
| Lead Detail | Click a lead in the recent leads widget | leadId |
| Companies List | Click "View All Companies" link | None |
| Opportunities List | Click pipeline funnel stage or "View Pipeline" | Optional stage filter |
| Opportunity Detail | Click an opportunity in the pipeline widget | opportunityId |
| Activities Calendar | Click "View Calendar" or activity item | Optional date filter |
| Contact Detail | Click a contact name in recent activities | contactId |

**Primary trigger:**
James Wilson (Sales Agent) opens Ultra TMS at the start of his workday and clicks "CRM" in the sidebar to review his pipeline, see new leads assigned to him, and identify which activities are due today.

**Success criteria (user completes the screen when):**
- User has reviewed pipeline health and identified priorities
- User has noted any overdue activities and planned their day
- User has seen new leads requiring immediate attention
- User has checked key metrics against targets

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Dashboard         [Date Range ▼] [Sync Status]|
|  Page Title: "CRM Dashboard"                                      |
+------------------------------------------------------------------+
|  KPI Cards Row (4 cards):                                         |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
|  | Total Leads | | Qualified   | | Pipeline    | | Closed Won  |  |
|  | 127         | | 34          | | $2.4M       | | $890K       |  |
|  | +12 this wk | | 27% rate    | | 18 deals    | | 6 this mo   |  |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
+------------------------------------------------------------------+
|  +-----------------------------+ +------------------------------+ |
|  | Pipeline Funnel             | | Revenue Trend (Line Chart)   | |
|  | Prospecting  ████████ 24   | |  $                           | |
|  | Qualification ██████ 18    | |  |    /\    /\               | |
|  | Proposal     ████ 12       | |  |   /  \  /  \   /          | |
|  | Negotiation  ██ 8          | |  |  /    \/    \ /           | |
|  | Won          █ 6           | |  | /            v            | |
|  | (click stage to drill)     | |  +---+---+---+---+---+---   | |
|  +-----------------------------+ |  Jul Aug Sep Oct Nov Dec     | |
|                                  +------------------------------+ |
+------------------------------------------------------------------+
|  +-----------------------------+ +------------------------------+ |
|  | Recent Leads (5 rows)      | | Upcoming Activities (5 rows) | |
|  | ● John Smith - Acme Corp   | | ☐ Call - Acme Corp   Today  | |
|  |   NEW | $15K est. | 2h ago | | ☐ Meeting - Beta LLC Tmrw   | |
|  | ● Lisa Park - Beta LLC     | | ☐ Task - Follow up  Wed     | |
|  |   CONTACTED | $8K | 5h ago | | ☐ Email - Gamma Inc Thu     | |
|  | ● ... (3 more)             | | ☐ Call - Delta Co   Fri     | |
|  | [View All Leads →]         | | [View Calendar →]           | |
|  +-----------------------------+ +------------------------------+ |
+------------------------------------------------------------------+
|  +-----------------------------+ +------------------------------+ |
|  | Top Opportunities (5 rows) | | Activity Feed (Recent 10)    | |
|  | Acme Logistics Deal $120K  | | James called Acme Corp 2h    | |
|  |   NEGOTIATION | 75% | Jan  | | Sarah emailed Beta LLC 3h    | |
|  | Beta Freight Contract $85K | | James created lead 5h        | |
|  |   PROPOSAL | 50% | Feb    | | Meeting w/ Gamma Inc yest.   | |
|  | ... (3 more)               | | Note added to Delta Co yest. | |
|  | [View Pipeline →]          | | [View All Activities →]      | |
|  +-----------------------------+ +------------------------------+ |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | KPI cards (total leads, qualified count, pipeline value, closed won), pipeline funnel | Sales agents need at-a-glance pipeline health to prioritize their day |
| **Secondary** (visible but requires scroll) | Recent leads, upcoming activities, top opportunities | Context for immediate actions -- what needs attention today |
| **Tertiary** (bottom of page) | Revenue trend chart, activity feed | Trend analysis and audit trail -- useful but not urgent |
| **Hidden** (behind click) | Individual record details, full activity history, team member breakdown | Deep detail accessed by clicking through to specific screens |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Total Leads | COUNT(Lead) WHERE status != CONVERTED | Integer with trend indicator (+/- vs. last period) | KPI Card 1 |
| 2 | Qualified Leads | COUNT(Lead) WHERE status = QUALIFIED | Integer + conversion rate percentage | KPI Card 2 |
| 3 | Pipeline Value | SUM(Opportunity.amount) WHERE stage NOT IN (CLOSED_WON, CLOSED_LOST) | Currency format $X.XM or $XXK | KPI Card 3 |
| 4 | Closed Won | SUM(Opportunity.amount) WHERE stage = CLOSED_WON AND period = current month | Currency format + deal count | KPI Card 4 |
| 5 | Lead Name | Lead.first_name + Lead.last_name | Full name, clickable link | Recent Leads widget |
| 6 | Lead Company | Lead.company_name | Company name, gray text | Recent Leads widget |
| 7 | Lead Status | Lead.status | Colored badge (NEW/CONTACTED/QUALIFIED) | Recent Leads widget |
| 8 | Lead Revenue | Lead.estimated_revenue | Currency $XX,XXX | Recent Leads widget |
| 9 | Activity Type | Activity.type | Icon + label (Call/Email/Meeting/Task/Note) | Upcoming Activities |
| 10 | Activity Subject | Activity.subject | Truncated text (max 40 chars) | Upcoming Activities |
| 11 | Activity Due Date | Activity.due_date | Relative time or day name | Upcoming Activities |
| 12 | Opportunity Name | Opportunity.name | Truncated text, clickable | Top Opportunities |
| 13 | Opportunity Amount | Opportunity.amount | Currency $XXX,XXX | Top Opportunities |
| 14 | Opportunity Stage | Opportunity.stage | Colored badge | Top Opportunities |
| 15 | Opportunity Probability | Opportunity.probability | Percentage XX% | Top Opportunities |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Conversion Rate | (QUALIFIED leads / total leads) * 100 | Percentage with 1 decimal, green if > 25%, yellow 15-25%, red < 15% |
| 2 | Weighted Pipeline | SUM(Opportunity.amount * Opportunity.probability / 100) | Currency, shown below pipeline value card |
| 3 | Avg Deal Size | SUM(amount) / COUNT(opportunities) for closed_won | Currency |
| 4 | Win Rate | CLOSED_WON / (CLOSED_WON + CLOSED_LOST) * 100 | Percentage with trend arrow |
| 5 | Activities Due Today | COUNT(Activity) WHERE due_date = today AND completed_at IS NULL | Integer with urgency color |
| 6 | Overdue Activities | COUNT(Activity) WHERE due_date < today AND completed_at IS NULL | Integer, red if > 0 |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Four KPI stat cards showing lead count, qualified count, pipeline value, closed won
- [x] Pipeline funnel visualization showing opportunity count per stage
- [x] Recent leads widget (last 5 leads) with status and estimated revenue
- [x] Upcoming activities widget (next 5 due) with type and due date
- [x] Click-through navigation to Leads List, Companies List
- [x] Date range selector for metric filtering (This Week, This Month, This Quarter)
- [x] Basic revenue trend line chart (monthly)

### Advanced Features (Wave 1 Enhancements)

- [ ] **Pipeline funnel with conversion rates** -- Show percentage conversion between each stage, not just counts
- [ ] **Weighted pipeline card** -- Add weighted pipeline value below total pipeline, accounting for probability
- [ ] **Top opportunities widget** -- Show top 5 opportunities by amount with stage and expected close date
- [ ] **Activity feed** -- Real-time feed of recent CRM actions (calls logged, emails sent, deals moved)
- [ ] **Trend indicators on KPI cards** -- Show +/- change vs. previous period with green/red arrow
- [ ] **HubSpot sync status widget** -- Small indicator showing sync health, last sync time, error count
- [ ] **Sales leaderboard** -- Mini widget showing top 3 reps by closed won this month (manager view)
- [ ] **Overdue alert banner** -- Red banner at top when user has overdue activities
- [ ] **Quick-add buttons** -- Floating action buttons for quick lead/activity/note creation
- [ ] **Personalized greeting** -- "Good morning, James. You have 3 activities due today."

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View revenue/financial KPIs | sales_agent, manager, admin | finance_view | Cards show "-- " instead of values |
| View team metrics | sales_manager, admin | team_view | Only personal metrics shown |
| Sales leaderboard | sales_manager, admin | team_view | Widget hidden entirely |
| Pipeline funnel (all data) | sales_manager, ops_manager, admin | crm_view_all | Funnel shows only own opportunities |
| HubSpot sync status | admin | integration_manage | Widget hidden |

---

## 6. Status & State Machine

### Dashboard Widget States

The dashboard itself does not have a status machine, but it reflects the statuses of underlying entities:

```
LEAD STATUSES displayed in Recent Leads:
[NEW] --> [CONTACTED] --> [QUALIFIED] --> [CONVERTED]
                |
                v
          [UNQUALIFIED]

OPPORTUNITY STAGES displayed in Pipeline Funnel:
[PROSPECTING] --> [QUALIFICATION] --> [PROPOSAL] --> [NEGOTIATION]
                                                          |
                                            +-------------+-------------+
                                            |                           |
                                     [CLOSED_WON]               [CLOSED_LOST]

ACTIVITY STATUSES displayed in Upcoming Activities:
[PENDING] --> [COMPLETED]
     |
     v
  [OVERDUE] (derived: due_date < now AND completed_at IS NULL)
```

### Actions Available Per Widget

| Widget | Available Actions | Restricted Actions |
|---|---|---|
| KPI Cards | Click to drill down to filtered list | None |
| Pipeline Funnel | Click stage to filter opportunities list | None |
| Recent Leads | Click lead name to open detail; click "View All" | None |
| Upcoming Activities | Click to mark complete; click to open detail | Cannot delete from dashboard |
| Top Opportunities | Click opportunity to open detail | Cannot change stage from dashboard |
| Activity Feed | Click entity links to navigate | None |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| NEW (lead) | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| CONTACTED | yellow-100 | yellow-800 | yellow-300 | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| QUALIFIED | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| UNQUALIFIED | gray-100 | gray-600 | gray-300 | `bg-gray-100 text-gray-600 border-gray-300` |
| CONVERTED | purple-100 | purple-800 | purple-300 | `bg-purple-100 text-purple-800 border-purple-300` |
| PROSPECTING | slate-100 | slate-800 | slate-300 | `bg-slate-100 text-slate-800 border-slate-300` |
| QUALIFICATION | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| PROPOSAL | indigo-100 | indigo-800 | indigo-300 | `bg-indigo-100 text-indigo-800 border-indigo-300` |
| NEGOTIATION | orange-100 | orange-800 | orange-300 | `bg-orange-100 text-orange-800 border-orange-300` |
| CLOSED_WON | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| CLOSED_LOST | red-100 | red-800 | red-300 | `bg-red-100 text-red-800 border-red-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Lead | Plus | Primary / Blue | Opens quick-create lead modal | No |
| Log Activity | Phone | Secondary / Outline | Opens quick-log activity modal | No |

### Widget Actions

| Widget | Action | Trigger | Result |
|---|---|---|---|
| KPI Card - Total Leads | Click card | Navigate to /crm/leads | Leads list (all statuses) |
| KPI Card - Qualified | Click card | Navigate to /crm/leads?status=QUALIFIED | Filtered leads list |
| KPI Card - Pipeline Value | Click card | Navigate to /crm/opportunities | Opportunities list |
| KPI Card - Closed Won | Click card | Navigate to /crm/opportunities?stage=CLOSED_WON | Filtered opportunities |
| Pipeline Funnel - Stage bar | Click bar | Navigate to /crm/opportunities?stage={stage} | Filtered by clicked stage |
| Recent Leads - Lead row | Click row | Navigate to /crm/leads/{id} | Lead detail page |
| Recent Leads - View All | Click link | Navigate to /crm/leads | Leads list page |
| Upcoming Activities - Checkbox | Click checkbox | Mark activity as completed (PATCH) | Strikethrough + toast |
| Upcoming Activities - Row | Click row | Open activity detail modal | Activity modal |
| Top Opportunities - Row | Click row | Navigate to /crm/opportunities/{id} | Opportunity detail |
| Activity Feed - Entity link | Click name | Navigate to entity detail | Entity detail page |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search |
| Ctrl/Cmd + L | Quick-create new lead |
| Ctrl/Cmd + A | Quick-log activity |
| R | Refresh dashboard data |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on dashboard |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| lead.created | { leadId, name, company, status, assignedTo } | Add to recent leads widget if assigned to current user; increment KPI counter |
| lead.status.changed | { leadId, oldStatus, newStatus } | Update KPI counts; update recent leads widget if lead is visible |
| opportunity.stage.changed | { oppId, oldStage, newStage, amount } | Update pipeline funnel counts; update KPI if won/lost |
| opportunity.created | { oppId, name, amount, stage } | Update pipeline funnel; increment pipeline value KPI |
| activity.completed | { activityId, completedBy } | Remove from upcoming activities; add to activity feed |
| activity.created | { activityId, type, subject, dueDate } | Add to upcoming activities if due soon; add to activity feed |
| hubspot.sync.completed | { syncedRecords, errors } | Update HubSpot sync status widget |
| hubspot.sync.error | { errorMessage, affectedRecords } | Show sync error indicator |

### Live Update Behavior

- **Update frequency:** WebSocket push for entity changes; KPI cards re-poll every 60 seconds for aggregation accuracy
- **Visual indicator:** KPI cards flash with subtle pulse animation when value changes; new items in widgets slide in from top
- **Conflict handling:** Dashboard is read-only, so no edit conflicts. Stale data auto-refreshes on next poll cycle.

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds
- **Endpoint:** GET /api/v1/crm/dashboard?since={lastPollTimestamp}
- **Visual indicator:** Show "Live updates paused -- reconnecting..." subtle banner below page header

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Mark activity complete | Immediately show strikethrough and move to completed | Revert checkbox and remove strikethrough, show error toast |
| Quick-create lead | Show temporary entry in recent leads with loading spinner | Remove entry, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| StatusBadge | src/components/ui/status-badge.tsx | status: string, size: 'sm' or 'md' |
| DataTable | src/components/ui/data-table.tsx | columns, data (for widget tables) |
| pipeline-chart | src/components/crm/pipeline-chart.tsx | stages: StageData[], onStageClick |
| activity-timeline | src/components/crm/activity-timeline.tsx | activities: Activity[], limit |
| hubspot-sync-badge | src/components/crm/hubspot-sync-badge.tsx | syncStatus, lastSyncAt |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| pipeline-chart | Static horizontal bar chart showing counts | Add conversion rate percentages between stages; add click handlers per stage; animate bars on data change |
| activity-timeline | Basic list of activities with timestamps | Add completion checkbox; add entity links; add type-specific icons; group by day |
| crm-dashboard | Single component with inline widgets | Refactor into composable widget components; add responsive grid layout |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| KPICard | Stat card with value, label, trend indicator, and click handler | Small -- number display, trend arrow, clickable wrapper |
| PipelineFunnel | Funnel visualization with stage bars, counts, and conversion rates | Medium -- SVG or CSS funnel bars with labels and click zones |
| RecentLeadsWidget | Compact list showing last 5 leads with status, company, revenue, time | Small -- list with avatar, badges, time formatting |
| UpcomingActivitiesWidget | Checklist-style list of next 5 activities with completion toggle | Small -- checkbox list with due date coloring |
| TopOpportunitiesWidget | Ranked list of top opportunities by amount with stage indicator | Small -- list with amount, stage badge, progress bar |
| ActivityFeedWidget | Real-time scrolling feed of CRM actions with entity links | Medium -- streaming list with type icons, relative timestamps |
| RevenueTrendChart | Line chart showing monthly revenue trend (last 6-12 months) | Medium -- recharts/chart.js line chart with tooltip |
| DashboardGreeting | Personalized greeting bar with user name and daily summary | Small -- text with dynamic content |
| OverdueAlertBanner | Red banner showing count of overdue activities with CTA | Small -- banner component with dismiss |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Card | card | KPI stat cards, widget containers |
| Badge | badge | Status badges throughout widgets |
| Checkbox | checkbox | Activity completion toggle |
| Tooltip | tooltip | KPI card trend details, truncated text |
| Select | select | Date range period selector |
| Dialog | dialog | Quick-create lead modal |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/dashboard/kpis | Fetch KPI card data (counts, values) | useCrmKPIs(dateRange) |
| 2 | GET | /api/v1/crm/dashboard/pipeline | Fetch pipeline funnel data by stage | usePipelineFunnel(dateRange) |
| 3 | GET | /api/v1/crm/dashboard/recent-leads | Fetch 5 most recent leads | useRecentLeads() |
| 4 | GET | /api/v1/crm/dashboard/upcoming-activities | Fetch next 5 due activities | useUpcomingActivities() |
| 5 | GET | /api/v1/crm/dashboard/top-opportunities | Fetch top 5 opportunities by amount | useTopOpportunities() |
| 6 | GET | /api/v1/crm/dashboard/activity-feed | Fetch recent 10 CRM activities | useActivityFeed() |
| 7 | GET | /api/v1/crm/dashboard/revenue-trend | Fetch monthly revenue data (6-12 months) | useRevenueTrend(dateRange) |
| 8 | PATCH | /api/v1/crm/activities/:id/complete | Mark an activity as completed | useCompleteActivity() |
| 9 | POST | /api/v1/crm/leads | Quick-create a new lead | useCreateLead() |
| 10 | GET | /api/v1/integrations/hubspot/status | Get HubSpot sync status | useHubSpotSyncStatus() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:{tenantId} | lead.created | useDashboardUpdates() -- invalidates recent-leads and KPIs |
| crm:{tenantId} | lead.status.changed | useDashboardUpdates() -- invalidates KPIs |
| crm:{tenantId} | opportunity.stage.changed | useDashboardUpdates() -- invalidates pipeline and KPIs |
| crm:{tenantId} | activity.completed | useDashboardUpdates() -- invalidates activities |
| crm:{tenantId} | activity.created | useDashboardUpdates() -- invalidates activities |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/crm/dashboard/kpis | Show filter error | Redirect to login | Show "Access Denied" page | N/A | Show error state with retry per widget |
| PATCH /api/v1/crm/activities/:id/complete | Show validation toast | Redirect to login | "Permission Denied" toast | "Activity not found" toast | Error toast with retry |
| POST /api/v1/crm/leads | Show validation errors in modal | Redirect to login | "Permission Denied" toast | N/A | Error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 4 skeleton KPI cards (gray animated bars for number and label). Show skeleton funnel chart (5 gray bars). Show skeleton rows for each widget (5 rows with avatar circles and text bars).
- **Progressive loading:** Page header renders immediately. KPI cards load first (fastest query). Widgets load independently -- each shows its own skeleton until data arrives.
- **Duration threshold:** If any widget exceeds 5s, show "Loading..." text in that widget area.

### Empty States

**First-time empty (no CRM data):**
- **Illustration:** Sales pipeline illustration
- **Headline:** "Welcome to your CRM Dashboard"
- **Description:** "Start by creating your first lead or importing existing customer data."
- **CTA Buttons:** "Create First Lead" (primary) | "Import Leads" (secondary)

**No activities due:**
- **Headline:** "All caught up!"
- **Description:** "No activities due. Great job staying on top of your tasks."
- **CTA:** "Log an Activity" link

**No opportunities in pipeline:**
- **Headline:** "Pipeline is empty"
- **Description:** "Convert qualified leads to start building your pipeline."
- **CTA:** "View Qualified Leads" link

### Error States

**Full page error (all API calls fail):**
- **Display:** Error icon + "Unable to load CRM Dashboard" + "Please try again or contact support." + Retry button

**Per-widget error (partial failure):**
- **Display:** Each widget handles its own error independently. Failed widget shows: "Could not load [widget name]" with Retry link. Other widgets continue functioning.

**Action error (activity completion or lead creation fails):**
- **Display:** Toast notification with error message. Auto-dismiss after 8 seconds.

### Permission Denied

- **Full page denied:** Show "You don't have permission to view the CRM Dashboard" with link to main dashboard
- **Partial denied:** Revenue-related KPI cards show "--" for values; team-level widgets hidden; personal widgets still visible

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached dashboard from [timestamp]."
- **Degraded (WebSocket down):** Show "Live updates paused" indicator. Dashboard still loads on manual refresh.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Date Range | Select dropdown | Today, This Week, This Month, This Quarter, This Year, Custom | This Month | ?period=this_month |
| 2 | Sales Rep | Select dropdown (manager view only) | All team members | Current user (for agents) / All (for managers) | ?repId= |

### Search Behavior

- **Search field:** No direct search on dashboard -- uses global search (Ctrl+K) to find specific entities
- **Searches across:** N/A
- **Behavior:** N/A
- **URL param:** N/A

### Sort Options

| Widget | Default Sort | Sort Type |
|---|---|---|
| Recent Leads | Created date descending (newest first) | Date |
| Upcoming Activities | Due date ascending (soonest first) | Date |
| Top Opportunities | Amount descending (highest first) | Numeric |
| Activity Feed | Timestamp descending (most recent first) | Date |

**Default sort:** Each widget has its own fixed sort order as described above. Users cannot change sort on dashboard widgets.

### Saved Filters / Presets

- **System presets:** "My Dashboard" (personal metrics), "Team Dashboard" (manager view), "All-Tenant View" (admin)
- **User-created presets:** Users can save date range preference. Stored in localStorage.
- **URL sync:** Date range and rep filter reflected in URL for shareable dashboard views.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- KPI cards: 2 per row (2x2 grid) instead of 4 in a row
- Pipeline funnel and revenue chart stack vertically (full width each)
- Widget pairs (recent leads + activities, opportunities + feed) stack vertically
- Date range selector moves to dropdown in page header

### Mobile (< 768px)

- KPI cards: horizontal scroll (swipeable) or stack 1 per row
- Pipeline funnel: simplified horizontal bar chart (no conversion rates)
- Widgets stack vertically in single column, full width
- Each widget is collapsible with header tap to expand/collapse
- "View All" links become more prominent buttons
- Sticky bottom nav with quick-action buttons (+ Lead, Log Activity)
- Pull-to-refresh for manual data reload

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full 2-column layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Same layout, slightly tighter spacing |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design a CRM Dashboard screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar (240px) on the left with the "CRM" section expanded and "Dashboard" highlighted with a blue-600 indicator. White/gray-50 content area on the right. Top of content area has a page header with breadcrumb "CRM > Dashboard", title "CRM Dashboard", a personalized greeting "Good morning, James. You have 3 activities due today.", and a date range dropdown ("This Month") on the right.

KPI Cards Row: Below the header, show 4 compact stat cards in a horizontal row. Card 1: "Total Leads" with value "127" and subtext "+12 this week" with a green up arrow. Card 2: "Qualified" with value "34" and subtext "27% conversion" in green. Card 3: "Pipeline Value" with value "$2.4M" and subtext "18 active deals". Card 4: "Closed Won" with value "$890K" and subtext "6 deals this month" with a green up arrow. Each card has a white background, rounded-lg border, subtle shadow-sm, and a small icon in the top-right corner colored blue-600.

Middle Row (2 columns): Left column shows a "Pipeline Overview" card with a horizontal funnel/bar chart. Bars: Prospecting (24 deals, longest bar, slate-400), Qualification (18, blue-500), Proposal (12, indigo-500), Negotiation (8, orange-500), Closed Won (6, green-500), Closed Lost (4, red-400). Show conversion rate percentages between stages (e.g., "75%" between Prospecting and Qualification). Right column shows a "Revenue Trend" card with a line chart showing monthly revenue from July through December, with a smooth blue-600 line and a lighter blue fill area below. Include dollar values on Y-axis and month labels on X-axis.

Bottom Left (2 widgets stacked or side by side): "Recent Leads" widget showing 5 lead entries. Each entry has: a colored dot (blue for NEW, yellow for CONTACTED, green for QUALIFIED), the person's name in semibold, company name in gray, a small status badge, estimated revenue ("$15K/mo"), and relative time ("2 hours ago"). Show a "View All Leads" link at the bottom. "Top Opportunities" widget showing 5 deals with name, amount ($120K), stage badge (colored), probability (75%), and expected close date.

Bottom Right (2 widgets): "Upcoming Activities" widget showing 5 items with checkbox, activity type icon (phone for call, envelope for email, users for meeting, check-square for task), subject text, related company name, and due date/time. Some items have "Today" in orange, "Tomorrow" in blue, others show day names. "Recent Activity" feed showing 10 entries like "James Wilson called Acme Corp - 2 hours ago" with small type icons and relative timestamps.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 for page, white for cards and widgets
- Primary color: blue-600 for buttons, links, and chart accents
- KPI cards: white background, rounded-lg, border-gray-200, subtle shadow-sm
- Charts: use blue-600 as primary color, gray-200 gridlines, rounded line caps
- Widget cards: white background, rounded-lg, 16px padding, "View All" links in blue-600
- Status badges: small rounded-full pills with colored backgrounds
- Activity checkboxes: rounded, gray border, blue-600 when checked
- Modern SaaS aesthetic similar to HubSpot dashboard or Salesforce Lightning
- Include subtle dividers between widget sections, consistent spacing (16px gaps between cards)
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Four KPI stat cards with lead count, qualified count, pipeline value, closed won
- [x] Basic pipeline bar chart showing opportunity counts per stage
- [x] Recent leads widget showing last 5 leads with status
- [x] Basic date range selector (This Month, This Quarter)
- [x] Click-through to Leads List and Companies List
- [x] Monthly revenue trend line chart

**What needs polish / bug fixes:**
- [ ] KPI cards do not show trend indicators (+/- vs. previous period)
- [ ] Pipeline chart is static and does not respond to date range changes
- [ ] Revenue chart does not show tooltip on hover
- [ ] Dashboard does not auto-refresh -- requires manual page reload
- [ ] Mobile layout breaks -- KPI cards overflow horizontally

**What to add this wave:**
- [ ] Conversion rate percentages between pipeline stages
- [ ] Weighted pipeline value alongside total pipeline value
- [ ] Top opportunities widget (top 5 by amount)
- [ ] Upcoming activities widget with completion toggle
- [ ] Activity feed with real-time streaming
- [ ] Personalized greeting with daily summary
- [ ] Overdue activity alert banner
- [ ] HubSpot sync status indicator
- [ ] Sales leaderboard (manager view)
- [ ] Quick-add floating action buttons

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Trend indicators on KPI cards | High | Low | P0 |
| Activity completion toggle | High | Low | P0 |
| Pipeline conversion rates | High | Medium | P0 |
| Top opportunities widget | High | Low | P0 |
| Upcoming activities widget | High | Low | P0 |
| Activity feed | Medium | Medium | P1 |
| Personalized greeting | Medium | Low | P1 |
| Overdue alert banner | Medium | Low | P1 |
| Weighted pipeline value | Medium | Low | P1 |
| HubSpot sync indicator | Low | Low | P2 |
| Sales leaderboard | Medium | Medium | P2 |
| Quick-add FAB buttons | Low | Low | P2 |

### Future Wave Preview

- **Wave 2:** Add goal tracking (quota vs. actual), team performance comparison, territory-level metrics, custom widget arrangement (drag-to-reorder)
- **Wave 3:** AI-powered next-best-action suggestions, predictive deal scoring, automated activity reminders, customer health score aggregation

---
