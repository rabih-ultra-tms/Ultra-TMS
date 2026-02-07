# Carrier Dashboard

> Service: 05 - Carrier Management | Wave: 3 | Priority: P1
> Route: /(dashboard)/carriers/dashboard | Status: Not Started
> Primary Personas: Sarah (Ops Manager), Admin
> Roles with Access: dispatcher, ops_manager, carrier_admin, admin

---

## 1. Purpose & Business Context

**What this screen does:**
The Carrier Dashboard is the command center for the carrier relations team, providing a real-time overview of the entire carrier portfolio's health, compliance status, onboarding pipeline, and performance metrics. It gives Sarah (Ops Manager) and her team a single view to understand which carriers need immediate attention, where compliance risks exist, and how the carrier fleet is performing overall.

**Business problem it solves:**
Without a centralized dashboard, the carrier relations team would need to manually check individual carrier records, cross-reference spreadsheets for insurance expirations, and log into the FMCSA website to verify authority status. This fragmented process means compliance issues go undetected, insurance lapses create liability exposure, and high-performing carriers are not properly recognized or prioritized. The dashboard reduces the daily carrier management review from 2+ hours to under 15 minutes by surfacing all critical information proactively.

**Key business rules:**
- Only carriers in ACTIVE status count toward the "Total Active Carriers" KPI.
- "Compliance Issues" KPI counts carriers with any compliance status other than COMPLIANT.
- "Expiring Insurance" KPI counts distinct carriers with at least one insurance certificate expiring within 30 days.
- Carrier tier distribution is calculated from all ACTIVE carriers only (PENDING, INACTIVE, SUSPENDED, BLACKLISTED are excluded).
- The compliance health indicator shows (number of COMPLIANT carriers / total ACTIVE carriers) * 100.
- Action items are sorted by urgency: expired items first, then expiring within 7 days, then 14 days, then 30 days.

**Success metric:**
Average time for ops manager to identify and act on carrier compliance issues drops from 2 hours daily to under 15 minutes. Insurance lapse rate drops below 2% of active carriers.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Carriers" > "Dashboard" in sidebar | None |
| Main Dashboard | Clicks "Carrier Health" widget or carrier KPI card | None |
| Notification Center | Clicks compliance alert notification | `?filter=compliance` |
| Direct URL | Bookmark / shared link | Route params |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carriers List | Clicks any KPI card to drill down | `?status=active`, `?compliance=issues`, `?insurance=expiring` |
| Carrier Detail | Clicks carrier name in action items or top carriers chart | `carrierId` |
| Carrier Onboarding | Clicks "Onboard New Carrier" button | None |
| Compliance Center | Clicks "View All Compliance Issues" link | None |
| Insurance Tracking | Clicks "View All Expiring Insurance" link | `?status=expiring` |

**Primary trigger:**
Sarah opens the Carrier Dashboard at the start of each business day as part of her morning review routine to check overnight compliance changes, new onboarding applications, and carriers needing attention.

**Success criteria (user completes the screen when):**
- User has reviewed all KPI cards and understands the current state of the carrier fleet.
- User has checked the action items section and addressed or delegated any urgent compliance issues.
- User has verified no critical insurance expirations or FMCSA alerts are unresolved.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Carriers > Dashboard     [+ Onboard New Carrier]    |
+------------------------------------------------------------------+
|  KPI Cards Row (6 cards, equal width)                            |
|  [Active    ] [Pending   ] [Compliance] [Expiring  ] [Avg Score ] [Loads     ]|
|  [Carriers  ] [Onboarding] [Issues    ] [Insurance ] [           ] [This Month]|
+------------------------------------------------------------------+
|  Charts Section (2 columns)                                       |
|  +-----------------------------+ +-----------------------------+  |
|  | Carrier Tier Distribution   | | Insurance Expirations       |  |
|  | (Donut Chart)               | | Timeline (Next 90 Days)     |  |
|  |                             | |                             |  |
|  +-----------------------------+ +-----------------------------+  |
|  +-----------------------------+ +-----------------------------+  |
|  | Top 10 Carriers by Volume   | | On-Time Delivery Trend      |  |
|  | (Horizontal Bar Chart)      | | by Tier (Line Chart)        |  |
|  |                             | |                             |  |
|  +-----------------------------+ +-----------------------------+  |
+------------------------------------------------------------------+
|  Bottom Section (2 columns)                                       |
|  +-----------------------------+ +-----------------------------+  |
|  | Action Items                 | | Recent Carrier Activity     |  |
|  | - Compliance review needed  | | - New carrier onboarded     |  |
|  | - Insurance expiring soon   | | - Status changed            |  |
|  | - Pending onboarding        | | - Document uploaded         |  |
|  | - Declining scores          | | - Insurance renewed         |  |
|  +-----------------------------+ +-----------------------------+  |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | 6 KPI cards: Active Carriers, Pending Onboarding, Compliance Issues, Expiring Insurance, Avg Score, Monthly Loads | Sarah needs these at a glance to assess fleet health instantly |
| **Secondary** (visible but less prominent) | Charts: tier distribution, insurance timeline, top carriers, on-time trends | Contextual data for deeper analysis and trend identification |
| **Tertiary** (available on scroll) | Action items list, recent activity feed | Actionable items Sarah needs to review and delegate |
| **Hidden** (behind a click) | Individual carrier details via drill-down from any clickable element | Deep detail only needed when investigating a specific carrier |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Total Active Carriers | COUNT(Carrier WHERE status='ACTIVE') | Integer, large font (e.g., "342") | KPI Card 1 |
| 2 | Pending Onboarding | COUNT(Carrier WHERE status='PENDING') | Integer with trend arrow vs. last week | KPI Card 2 |
| 3 | Compliance Issues | COUNT(Carrier WHERE complianceStatus NOT IN ('COMPLIANT','PENDING')) | Integer, red highlight if > 0 | KPI Card 3 |
| 4 | Expiring Insurance (30 days) | COUNT(DISTINCT carrierId FROM InsuranceCertificates WHERE expiryDate BETWEEN now AND now+30d) | Integer, amber highlight if > 5 | KPI Card 4 |
| 5 | Avg Carrier Score | AVG(Carrier.complianceScore WHERE status='ACTIVE') | Score out of 100, one decimal (e.g., "87.3") | KPI Card 5 |
| 6 | Loads This Month | COUNT(Load WHERE carrierId IS NOT NULL AND createdAt >= firstOfMonth) | Integer with % change vs. last month | KPI Card 6 |
| 7 | Tier Distribution | GROUP BY Carrier.tier WHERE status='ACTIVE' | Donut chart: PLATINUM (indigo), GOLD (amber), SILVER (slate), BRONZE (orange), UNQUALIFIED (gray) | Chart 1 |
| 8 | Insurance Expirations | InsuranceCertificates WHERE expiryDate BETWEEN now AND now+90d | Timeline dots color-coded by urgency | Chart 2 |
| 9 | Top 10 Carriers | TOP 10 Carrier ORDER BY totalLoads DESC WHERE status='ACTIVE' | Horizontal bar chart with carrier name + load count | Chart 3 |
| 10 | On-Time Delivery Trend | PerformanceHistory grouped by tier, last 6 months | Line chart with one line per tier | Chart 4 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Compliance Health % | (COUNT COMPLIANT carriers / COUNT ACTIVE carriers) * 100 | Percentage with circular indicator: green >= 95%, yellow 85-94%, red < 85% |
| 2 | Week-over-Week Change | (this week count - last week count) / last week count * 100 | +/- percentage with green/red arrow |
| 3 | Urgency Score (Action Items) | Days until expiry: negative = expired (highest urgency), 0-7 = critical, 8-14 = warning, 15-30 = notice | Sorted by urgency, color-coded rows |
| 4 | Monthly Load Trend | (this month loads / last month loads - 1) * 100 | +/- percentage with trend arrow |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] 6 KPI cards showing real-time carrier fleet metrics
- [ ] Carrier tier distribution donut chart
- [ ] Insurance expirations timeline (next 90 days)
- [ ] Top 10 carriers by load volume bar chart
- [ ] On-time delivery trend by tier line chart
- [ ] Action items section with compliance review, expiring insurance, pending onboarding, declining scores
- [ ] Click any KPI card to drill down to filtered carrier list
- [ ] "Onboard New Carrier" primary action button in page header
- [ ] Compliance health indicator (overall fleet compliance percentage)

### Advanced Features (Logistics Expert Recommendations)

- [ ] Recent carrier activity feed showing last 20 events (new carriers, status changes, document uploads, insurance renewals)
- [ ] Auto-refresh dashboard data every 60 seconds with visual indicator
- [ ] KPI card sparklines showing 7-day trend mini-charts
- [ ] Action items count badge in sidebar navigation when items need attention
- [ ] Export dashboard as PDF report for management review
- [ ] Customizable date range for charts (7d, 30d, 90d, YTD)
- [ ] Click donut chart segment to filter carriers list by that tier
- [ ] Hover on insurance timeline dot to see carrier name and certificate details
- [ ] "Quick Actions" dropdown: Run FMCSA Check, Send Bulk Reminders, Export Carrier List
- [ ] Comparison toggle to overlay previous period on charts

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View all KPI cards | dispatcher, ops_manager, admin | carrier_view | Full page access denied |
| "Onboard New Carrier" button | ops_manager, carrier_admin, admin | carrier_create | Button hidden |
| "Run FMCSA Check" quick action | carrier_admin, admin | compliance_manage | Action hidden from menu |
| Export dashboard PDF | ops_manager, admin | export_data | Button hidden |
| View financial metrics (load revenue) | admin, finance | finance_view | Load count shown, revenue hidden |

---

## 6. Status & State Machine

### Status Overview (Dashboard Context)

The dashboard does not manage status transitions directly but **displays** the aggregate state of all carriers. The primary status system displayed:

```
Carrier Status Distribution:
[PENDING] -----> [ACTIVE] -----> [INACTIVE]
                    |
                    +-----------> [SUSPENDED] (auto: expired insurance / OOS FMCSA)
                    |
                    +-----------> [BLACKLISTED] (manual: requires reason)
```

### Compliance Status Distribution (shown in Compliance Issues KPI):

```
[PENDING] -----> [COMPLIANT] -----> [WARNING] -----> [EXPIRING_SOON] -----> [EXPIRED]
                      |                                                        |
                      +<---------- (Insurance renewed / FMCSA cleared) <------+
                                                                               |
                                                                        [SUSPENDED]
```

### Actions Available from Dashboard

| Element | Available Actions | Destination |
|---|---|---|
| KPI Card: Active Carriers | Click to view filtered carrier list | Carriers List `?status=ACTIVE` |
| KPI Card: Pending Onboarding | Click to view pending carriers | Carriers List `?status=PENDING` |
| KPI Card: Compliance Issues | Click to view non-compliant carriers | Carriers List `?compliance=issues` |
| KPI Card: Expiring Insurance | Click to view insurance tracking | Insurance Tracking `?status=expiring` |
| Action Item Row | Click to view carrier detail | Carrier Detail `/:carrierId` |
| Top 10 Bar | Click bar to view carrier detail | Carrier Detail `/:carrierId` |
| Donut Segment | Click to filter by tier | Carriers List `?tier=GOLD` |

### Status Badge Colors (as displayed on dashboard)

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| ACTIVE | emerald-100 | emerald-800 | emerald-300 | `bg-emerald-100 text-emerald-800` |
| PENDING | gray-100 | gray-700 | gray-300 | `bg-gray-100 text-gray-700` |
| SUSPENDED | amber-100 | amber-800 | amber-300 | `bg-amber-100 text-amber-800` |
| BLACKLISTED | red-100 | red-800 | red-300 | `bg-red-100 text-red-800` |
| COMPLIANT | emerald-100 | emerald-800 | emerald-300 | `bg-emerald-100 text-emerald-800` |
| WARNING | amber-100 | amber-800 | amber-300 | `bg-amber-100 text-amber-800` |
| EXPIRED | red-100 | red-800 | red-300 | `bg-red-100 text-red-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Onboard New Carrier | Plus | Primary / Blue | Navigates to `/carriers/onboard` | No |
| Quick Actions | ChevronDown | Secondary / Outline | Opens dropdown menu | No |

### Secondary Actions (Quick Actions Dropdown)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Run FMCSA Check | ShieldCheck | Triggers batch FMCSA check for all active carriers | Admin role required |
| Send Bulk Reminders | Mail | Opens bulk notification modal for expiring insurance carriers | Admin role required |
| Export Carrier Report | Download | Downloads CSV of all carriers with current status | Any authorized user |
| Export Dashboard PDF | FileText | Generates PDF snapshot of current dashboard state | ops_manager or admin |

### Bulk Actions

N/A -- Dashboard is a read-only overview screen. Bulk actions are available on the Carriers List screen.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search / command palette |
| R | Refresh dashboard data |
| N | Navigate to Onboard New Carrier |
| C | Navigate to Compliance Center |

### Drag & Drop

N/A -- No drag-and-drop functionality on the dashboard.

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| carrier.statusChanged | { carrierId, oldStatus, newStatus, updatedBy } | Update relevant KPI card counts, flash changed card |
| carrier.complianceChanged | { carrierId, oldCompliance, newCompliance } | Update Compliance Issues KPI, add to action items if issue |
| insurance.expiring | { carrierId, carrierName, insuranceType, expiryDate, daysRemaining } | Update Expiring Insurance KPI, add dot to timeline |
| insurance.expired | { carrierId, carrierName, insuranceType } | Update KPI cards, add to action items, show toast alert |
| carrier.created | { carrierId, carrierName, status } | Update Pending Onboarding KPI if status=PENDING, add to activity feed |
| carrier.tierChanged | { carrierId, oldTier, newTier } | Update donut chart animation |
| compliance.batchCheckComplete | { timestamp, totalChecked, issuesFound, autoSuspended } | Update all compliance-related KPIs, show toast summary |
| load.completed | { loadId, carrierId } | Update Loads This Month KPI, refresh Top 10 chart if affected |

### Live Update Behavior

- **Update frequency:** WebSocket push for all carrier-related changes. Polling fallback every 60 seconds.
- **Visual indicator:** KPI cards that change flash with a subtle blue highlight for 2 seconds. Charts animate transitions smoothly. New action items slide in from the top of the list.
- **Conflict handling:** N/A -- Dashboard is read-only. All data is server-authoritative.

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds
- **Endpoint:** `GET /api/carriers/dashboard/stats?updatedSince={lastPollTimestamp}`
- **Visual indicator:** Show "Live updates paused -- reconnecting..." subtle banner below page header

### Optimistic Updates

N/A -- Dashboard is read-only. No user-initiated mutations on this screen.

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | `src/components/layout/page-header.tsx` | title: "Carrier Dashboard", breadcrumbs, actions: [Onboard button] |
| StatusBadge | `src/components/ui/status-badge.tsx` | status: string, entity: CARRIER_STATUS or CARRIER_COMPLIANCE |
| Card | `src/components/ui/card.tsx` | For KPI cards and chart containers |
| Button | `src/components/ui/button.tsx` | For primary and secondary action buttons |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | For Quick Actions menu |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| Card | Basic card with title/content | Add sparkline support, click handler for drill-down, subtle hover animation |
| StatusBadge | Supports status text and color | Add count variant (badge with number for KPI displays) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| KPICard | Stat card with icon, label, value, trend indicator, sparkline, and click handler for drill-down | Medium |
| TierDonutChart | Donut chart showing carrier tier distribution with clickable segments. Colors: PLATINUM=indigo, GOLD=amber, SILVER=slate, BRONZE=orange, UNQUALIFIED=gray | Medium |
| ExpirationTimeline | Horizontal timeline showing next 90 days of insurance expirations as color-coded dots. Red=expired, orange=7d, yellow=14d, blue=30d. Hover for details. | High |
| TopCarriersBarChart | Horizontal bar chart showing top 10 carriers by load volume with carrier name and count | Medium |
| OnTimeTrendChart | Multi-line chart showing on-time delivery % by tier over 6 months | Medium |
| ActionItemsList | Sortable list of carrier action items with urgency color-coding, carrier name link, issue description, and quick-action buttons | Medium |
| ActivityFeed | Chronological feed of recent carrier events (status changes, uploads, onboarding) with timestamps and icons | Small |
| ComplianceHealthGauge | Circular progress indicator showing fleet compliance % with color gradient | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Card | card | KPI cards and chart containers |
| DropdownMenu | dropdown-menu | Quick Actions menu |
| Tooltip | tooltip | Hover details on charts and KPI explanations |
| Badge | badge | Count badges on KPI cards |
| ScrollArea | scroll-area | Action items and activity feed scrollable areas |
| Separator | separator | Section dividers |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/carriers/dashboard/stats | Fetch all KPI card values | useCarrierDashboardStats() |
| 2 | GET | /api/carriers/dashboard/tier-distribution | Fetch tier distribution for donut chart | useCarrierTierDistribution() |
| 3 | GET | /api/carriers/insurance/expiring?days=90 | Fetch insurance expirations for timeline | useExpiringInsurance(90) |
| 4 | GET | /api/carriers/dashboard/top-carriers?limit=10 | Fetch top 10 carriers by load volume | useTopCarriers(10) |
| 5 | GET | /api/carriers/dashboard/ontime-trend?months=6 | Fetch on-time delivery trend by tier | useOnTimeTrend(6) |
| 6 | GET | /api/carriers/compliance/action-items | Fetch prioritized action items | useComplianceActionItems() |
| 7 | GET | /api/carriers/dashboard/activity-feed?limit=20 | Fetch recent carrier activity events | useCarrierActivityFeed(20) |
| 8 | POST | /api/carriers/fmcsa/batch-check | Trigger batch FMCSA compliance check | useTriggerFmcsaBatchCheck() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| carriers:{tenantId} | carrier.statusChanged | useCarrierDashboardUpdates() -- invalidates stats query |
| carriers:{tenantId} | carrier.created | useCarrierDashboardUpdates() -- invalidates stats + activity feed |
| compliance:{tenantId} | compliance.issueDetected | useComplianceUpdates() -- invalidates action items + stats |
| compliance:{tenantId} | compliance.batchCheckComplete | useComplianceUpdates() -- invalidates all compliance data |
| insurance:{tenantId} | insurance.expiring | useInsuranceUpdates() -- invalidates expiring insurance + stats |
| insurance:{tenantId} | insurance.expired | useInsuranceUpdates() -- invalidates all insurance + stats |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/carriers/dashboard/stats | N/A | Redirect to login | Show "Access Denied" page | N/A | Show error state with retry for stats section |
| GET /api/carriers/insurance/expiring | Show filter error toast | Redirect to login | Show "Access Denied" page | N/A | Show error state with retry for timeline section |
| POST /api/carriers/fmcsa/batch-check | Show validation error toast | Redirect to login | Show "Permission Denied" toast | N/A | Show error toast "FMCSA check failed. Try again later." |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 6 skeleton KPI cards (gray animated bars), 4 skeleton chart placeholders (gray rectangles with pulse animation), skeleton action items list (5 rows of gray bars).
- **Progressive loading:** Show page header immediately. KPI cards load first (fastest query), then charts load independently, then action items and activity feed.
- **Duration threshold:** If any section loading exceeds 5s, show "Taking longer than usual..." message in that section.

### Empty States

**First-time empty (no carriers in system):**
- **Illustration:** Truck fleet illustration
- **Headline:** "No carriers yet"
- **Description:** "Start building your carrier network by onboarding your first carrier."
- **CTA Button:** "Onboard First Carrier" -- primary blue button, navigates to onboarding wizard

**Partial empty (carriers exist but no data for specific chart):**
- **Charts:** Show chart container with centered text: "Not enough data to display. Carrier performance data will appear after carriers complete loads."
- **Action Items:** Show "No action items -- all carriers are compliant!" with green checkmark icon

### Error States

**Full page error (all APIs fail):**
- **Display:** Error icon + "Unable to load carrier dashboard" + "Please try again or contact support." + Retry button

**Per-section error (partial failure):**
- **Display:** Show successful sections normally. Failed section shows inline error: "Could not load [section name]" with Retry link. Example: KPI cards load but charts fail -- show KPI cards with chart area showing retry state.

**FMCSA batch check error:**
- **Display:** Toast notification: "FMCSA check could not be completed. Some carrier records may not be up to date." with retry option.

### Permission Denied

- **Full page denied:** Show "You don't have permission to view the Carrier Dashboard" with link back to main dashboard
- **Partial denied:** Financial metrics hidden for non-finance roles. "Onboard New Carrier" button hidden for users without carrier_create permission.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached dashboard data from [timestamp]."
- **Degraded (WebSocket down):** Show subtle indicator: "Live updates paused" in page header. Data still loads on manual refresh.

---

## 12. Filters, Search & Sort

### Filters

The dashboard itself has minimal filtering. Primary filtering is time-range based:

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Time Range | Segmented control | 7d, 30d, 90d, YTD, Custom | 30d | `?range=30d` |
| 2 | Date Range (Custom) | Date range picker | Any start/end date | N/A | `?dateFrom=&dateTo=` |

### Search Behavior

N/A -- Dashboard is an overview screen. Search is available via the global command palette (Ctrl+K).

### Sort Options

Action items are sorted by urgency (highest urgency first). Activity feed is sorted by timestamp (newest first). These sorts are fixed and not user-configurable.

| Section | Default Sort | Sort Type |
|---|---|---|
| Action Items | Urgency score (expired first, then by days until expiry ascending) | Custom urgency |
| Activity Feed | Timestamp descending (newest first) | Date |
| Top 10 Carriers | Load count descending (most loads first) | Numeric |

### Saved Filters / Presets

N/A -- Dashboard does not support saved filter presets. Time range selection is persisted in URL and localStorage.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- KPI cards: 3 per row (2 rows of 3) instead of 6 in a row
- Charts: Stack to single column (full width per chart)
- Action items and activity feed: Stack to single column
- "Onboard New Carrier" button remains visible in header
- Quick Actions dropdown accessible via icon button

### Mobile (< 768px)

- KPI cards: 2 per row (3 rows of 2), scrollable horizontally if needed
- Charts: Full width, stacked vertically, each in collapsible accordion sections
- Action items: Card-based list, swipe for quick actions
- Activity feed: Compact timeline view
- "Onboard New Carrier" in sticky bottom action bar
- Pull-to-refresh for data reload

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full 6-column KPI row, 2-column charts grid |
| Desktop | 1024px - 1439px | 6-column KPI row (tighter), 2-column charts grid |
| Tablet | 768px - 1023px | 3-column KPI grid, 1-column charts |
| Mobile | < 768px | 2-column KPI grid, 1-column stacked everything |

---

## 14. Stitch Prompt

```
Design a carrier management dashboard for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar on the left (240px wide, collapsed to icons), white content area on the right. Top of content area has a page header with breadcrumb "Carriers > Dashboard" on the left and a blue primary button "+ Onboard New Carrier" on the right.

KPI Section: Below the header, show a row of 6 KPI stat cards with equal width. Each card has a subtle shadow, rounded corners, a colored icon on the left, the metric label in gray-500 text, the value in large bold text, and a small trend indicator (green up arrow or red down arrow with percentage). The cards are:
1. "Active Carriers" - green truck icon - value "342" - trend "+3.2% vs last month"
2. "Pending Onboarding" - gray clock icon - value "8" - trend "+2 this week"
3. "Compliance Issues" - red/amber alert triangle icon - value "12" with red highlight - trend "3 new this week"
4. "Expiring Insurance" - amber calendar-clock icon - value "17" - subtitle "within 30 days"
5. "Avg Carrier Score" - blue gauge icon - value "87.3" with a small circular progress ring - subtitle "out of 100"
6. "Loads This Month" - indigo truck icon - value "1,247" - trend "+8.5% vs last month"

Charts Section: Below KPIs, a 2x2 grid of chart cards with white backgrounds, rounded-lg borders, and subtle shadows:
- Top-left: "Carrier Tier Distribution" - donut chart with 5 segments: Platinum (indigo, 45 carriers), Gold (amber, 112 carriers), Silver (gray, 98 carriers), Bronze (orange, 67 carriers), Unqualified (light gray, 20 carriers). Legend below chart.
- Top-right: "Insurance Expirations (Next 90 Days)" - horizontal timeline with colored dots: 3 red dots (expired), 5 orange dots (7 days), 8 yellow dots (14 days), 12 blue dots (30+ days). X-axis shows dates.
- Bottom-left: "Top 10 Carriers by Load Volume" - horizontal bar chart with carrier names on Y-axis and load count on X-axis. Top carrier "Swift Logistics" with 87 loads, bars in blue-500 with carrier name labels.
- Bottom-right: "On-Time Delivery Trend by Tier" - line chart with 5 lines (one per tier, same colors as donut), X-axis shows last 6 months, Y-axis shows percentage 80-100%.

Bottom Section: Two cards side by side:
- Left: "Action Items" card with a list of 6 items, each with an urgency indicator (red/amber/yellow dot), carrier name as a blue link, issue description ("Auto Liability expires in 3 days"), and a small action button ("Notify" or "Review"). Show "View All" link at bottom.
- Right: "Recent Activity" card with a timeline feed showing: "Carrier ABC Trucking onboarded" (2h ago), "J&M Transport insurance renewed" (4h ago), "FastFreight Inc status changed to Suspended" (6h ago), "Weekly FMCSA check completed: 2 issues found" (yesterday). Each entry has an icon and relative timestamp.

At the top-right of the charts section, include a small compliance health indicator: a circular badge showing "96% Fleet Compliance" in green.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 (#F9FAFB) for the page, white for cards
- Primary color: blue-600 for buttons and links
- KPI cards: white background, rounded-xl, shadow-sm, subtle left border accent matching the icon color
- Charts: use Recharts-style clean visualizations with rounded corners on bars and smooth lines
- Status badges: follow the Ultra TMS color system (green=active, amber=warning, red=danger, gray=pending)
- Modern SaaS aesthetic similar to Linear.app or Vercel dashboard
- Include hover states on all KPI cards (slight lift/shadow increase to indicate clickability)

Include: pagination is not needed (dashboard is single page), ensure the "Onboard New Carrier" button is prominent, show a "Quick Actions" secondary button with chevron-down icon next to the primary button.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing -- dashboard screen is not started

**What needs polish / bug fixes:**
- N/A (not built yet)

**What to add this wave:**
- [ ] 6 KPI cards with real-time data and click-to-drill-down
- [ ] Carrier tier distribution donut chart
- [ ] Insurance expirations timeline
- [ ] Top 10 carriers bar chart
- [ ] On-time delivery trend line chart
- [ ] Action items section with urgency sorting
- [ ] Recent activity feed
- [ ] Compliance health indicator
- [ ] "Onboard New Carrier" action button
- [ ] WebSocket integration for real-time KPI updates

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| KPI cards with drill-down | High | Medium | P0 |
| Compliance action items | High | Medium | P0 |
| Insurance expirations timeline | High | High | P0 |
| Tier distribution chart | Medium | Low | P1 |
| Top 10 carriers chart | Medium | Low | P1 |
| On-time trend chart | Medium | Medium | P1 |
| Real-time WebSocket updates | High | Medium | P1 |
| Activity feed | Medium | Low | P2 |
| Dashboard PDF export | Low | Medium | P2 |
| Customizable date ranges | Low | Low | P2 |
| KPI sparkline trends | Low | Medium | P2 |

### Future Wave Preview

- **Wave 4:** Add predictive analytics (carriers likely to lapse on insurance), AI-powered carrier recommendations for load matching, integration with external load boards for carrier capacity visibility.
- **Wave 5:** Add carrier sentiment analysis from communication logs, automated tier re-evaluation suggestions, competitive rate benchmarking per carrier.

---

_Last Updated: 2026-02-06_
