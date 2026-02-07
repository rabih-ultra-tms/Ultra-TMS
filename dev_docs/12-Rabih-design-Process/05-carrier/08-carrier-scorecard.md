# Carrier Scorecard

> Service: Carrier Management | Wave: 3 | Priority: P0
> Route: /(dashboard)/carriers/[id]/scorecard | Status: Not Started
> Primary Personas: Sarah (Ops Manager), Omar (Dispatcher/Operations), Admin
> Roles with Access: dispatcher, operations_manager, admin, finance

---

## 1. Purpose & Business Context

**What this screen does:**
Displays a comprehensive performance dashboard for a single carrier, aggregating all key performance indicators (KPIs), trend data, load history, and tier progression into a single, data-rich view. This is the most analytically dense screen in the entire Carrier Management module -- the definitive answer to "How is this carrier performing?"

**Business problem it solves:**
In freight brokerage, carrier selection directly impacts service quality, customer retention, and profitability. Without a scorecard, Sarah the Ops Manager has to mentally piece together a carrier's reliability from scattered data: check-call logs, delivery confirmations, customer complaints, claims records, and gut feel from dispatchers. This leads to continued use of underperforming carriers (because nobody has the full picture) and underutilization of top performers (because their excellence is invisible). A carrier with 85% on-time delivery but a 4% claims rate is a liability -- but without the scorecard, the claims rate is buried in a different screen. The scorecard surfaces all dimensions of performance in one place, enabling data-driven carrier selection, tier management, and rate negotiation. Brokerages that use carrier scorecards report 15-20% improvement in on-time delivery and 30% reduction in claims because they stop giving loads to underperformers.

**Key business rules:**
- Scorecard data aggregates from loads completed in the selected date range (default: last 6 months).
- Tier calculation runs nightly based on the scoring formula: (On-Time Pickup Weight: 25%) + (On-Time Delivery Weight: 25%) + (Claims Rate Inverse: 20%) + (Acceptance Rate: 15%) + (Average Rating: 15%).
- A carrier must have at least 10 completed loads to generate a meaningful score; otherwise, show "Insufficient Data" state.
- Score ranges: PLATINUM (90-100), GOLD (75-89), SILVER (60-74), BRONZE (40-59), UNQUALIFIED (0-39).
- Performance alerts trigger when: on-time rate drops below 85%, claims rate exceeds 3%, or rating drops below 3.5/5.0.
- Tier changes (upgrades/downgrades) require manager approval and generate an audit log entry.
- Rate per mile data is only visible to users with finance_view permission.

**Success metric:**
Carrier tier assignments are 95% automated based on scorecard data. Time spent evaluating a carrier for load assignment drops from 8 minutes to 30 seconds. Claims rate across the carrier network drops 25% within 6 months of scorecard adoption.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Click "Scorecard" tab or "View Performance" button | carrierId, carrier name, current tier |
| Carriers List | Click score/rating column value | carrierId |
| Preferred Carriers | Click carrier card "View Scorecard" action | carrierId |
| Carrier Dashboard | Click "Performance Alerts" notification for a specific carrier | carrierId, alert context |
| Dispatch Board | Click carrier name tooltip "View Scorecard" link | carrierId |
| Load Detail | Click assigned carrier's performance score link | carrierId |
| Direct URL | Bookmark / shared link | Route params, optional date range |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Click "View Full Profile" or breadcrumb | carrierId |
| Load Detail | Click any load number in load history table | loadId |
| Lane Preferences | Click a lane in "Most Frequent Lanes" section | carrierId, origin, destination |
| Claims List (filtered) | Click claims rate metric to see associated claims | carrierId, dateRange |
| Carrier Contacts | Click "Send Scorecard" to select contact email | carrierId |
| Compare View | Click "Compare to Fleet" or "Compare Carriers" | carrierId, comparisonCarrierIds |

**Primary trigger:**
Sarah the Ops Manager is reviewing carrier performance before the quarterly business review. She opens the scorecard for TransWest Logistics to decide whether to upgrade them from Silver to Gold tier and negotiate better rates. She needs to see on-time trends, claims history, and how they compare to the fleet average.

**Success criteria (user completes the screen when):**
- User has reviewed all performance dimensions and understands the carrier's strengths and weaknesses.
- User has made a tier adjustment decision (or confirmed current tier is appropriate).
- User has identified specific lanes where the carrier excels or underperforms.
- User has exported or emailed the scorecard for record-keeping or carrier communication.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Carriers > TransWest Logistics > Scorecard           |
+------------------------------------------------------------------+
|  Header Section                                                    |
|  +--------------------------------------------------------------+|
|  | [Carrier Logo/Avatar]                                         ||
|  | TransWest Logistics          [GOLD tier badge, large]         ||
|  | MC# 789456 | DOT# 2345678  [Date Range: Last 6 Months v]    ||
|  |                                                               ||
|  | Overall Score Gauge: [=====72/100=====]                       ||
|  | (Semi-circular gauge, gold-colored, "72" in center)           ||
|  |                              [Download PDF] [Email Scorecard] ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
|  Two-Column Layout Below Header                                    |
|  +---------------------------+  +--------------------------------+|
|  | LEFT: Performance Cards   |  | RIGHT: Trend Charts            ||
|  |                           |  |                                ||
|  | +----------+ +----------+ |  | Performance Trend (6-month)    ||
|  | |On-Time PU| |On-Time DL| |  | [Line chart: on-time % over   ||
|  | |  92.3%   | |  89.7%   | |  |  time, target line at 95%]    ||
|  | |Target 95%| |Target 95%| |  |                                ||
|  | +----------+ +----------+ |  +--------------------------------+|
|  |                           |  |                                ||
|  | +----------+ +----------+ |  | Load Volume (monthly bars)     ||
|  | |Claims Rt | |Accept Rt | |  | [Bar chart: loads per month]  ||
|  | |  1.8%    | |  78.5%   | |  |                                ||
|  | |Target <2%| |          | |  +--------------------------------+|
|  | +----------+ +----------+ |  |                                ||
|  |                           |  | Revenue to Carrier (monthly)   ||
|  | +----------+ +----------+ |  | [Line chart: $ paid per month] ||
|  | |Disp Rate | |Cust Rate | |  |                                ||
|  | | 4.2/5.0  | | 4.0/5.0  | |  +--------------------------------+|
|  | +----------+ +----------+ |  |                                ||
|  |                           |  | Rating Trend (6-month avg)     ||
|  | +----------+ +----------+ |  | [Line chart: avg rating/month] ||
|  | |Damage Rt | |Comm Score| |  |                                ||
|  | |  0.5%    | | 3.8/5.0  | |  +--------------------------------+|
|  | +----------+ +----------+ |  |                                ||
|  +---------------------------+  +--------------------------------+|
+------------------------------------------------------------------+
|  Comparison Section (collapsible)                                  |
|  [Toggle: Compare to Fleet Average]                                |
|  +--------------------------------------------------------------+|
|  | Metric         | This Carrier | Fleet Avg | Delta  | Status  ||
|  | On-Time PU     | 92.3%        | 88.1%     | +4.2%  | Above   ||
|  | On-Time DL     | 89.7%        | 86.5%     | +3.2%  | Above   ||
|  | Claims Rate    | 1.8%         | 2.4%      | -0.6%  | Better  ||
|  | Acceptance     | 78.5%        | 72.0%     | +6.5%  | Above   ||
|  | Avg Rating     | 4.2          | 3.8       | +0.4   | Above   ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
|  Tier Progression Section                                          |
|  +--------------------------------------------------------------+|
|  | Current Tier: GOLD (72 pts)     Next Tier: PLATINUM (90 pts) ||
|  | [=========72%==========================>----90%------]         ||
|  |                                                               ||
|  | Requirements for PLATINUM:                                    ||
|  | [x] 50+ completed loads (have: 67)                           ||
|  | [ ] On-Time Delivery >= 95% (current: 89.7%)                 ||
|  | [x] Claims Rate < 1% (current: 1.8%) -- NOT MET             ||
|  | [x] Avg Rating >= 4.5 (current: 4.2) -- NOT MET             ||
|  |                                                               ||
|  | Tier History: Gold since 09/2025 | Silver: 03/2025-09/2025   ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
|  Load History Section                                              |
|  +--------------------------------------------------------------+|
|  | Recent Loads (last 20)                                        ||
|  | Load #     | Route              | Dates     | Status | Rating||
|  | FM-2026-084| Chicago > Dallas   | 01/10-01/12| Comp  | 4.5  ||
|  | FM-2026-079| Atlanta > Memphis  | 01/05-01/07| Comp  | 4.0  ||
|  | FM-2026-071| LA > Phoenix       | 12/28-12/29| Comp  | 5.0  ||
|  | (more rows...)                                                ||
|  +--------------------------------------------------------------+|
|  |                                                               ||
|  | Most Frequent Lanes (unique O>D pairs)                        ||
|  | Chicago, IL > Dallas, TX          | 12 loads | 94% OT | $2.15||
|  | Atlanta, GA > Memphis, TN         | 8 loads  | 88% OT | $1.98||
|  | Los Angeles, CA > Phoenix, AZ     | 6 loads  | 100% OT| $2.45||
|  | (more lanes...)                                               ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above fold) | Carrier name, tier badge (large colored), overall score gauge (0-100), on-time pickup %, on-time delivery %, claims rate | These are the three make-or-break metrics that determine if a carrier gets a load |
| **Secondary** (visible but less prominent) | Acceptance rate, dispatcher rating, customer rating, damage rate, communication score, trend charts | Important for complete picture but not the first thing checked during load assignment |
| **Tertiary** (available on scroll) | Fleet comparison table, tier progression, load history table, frequent lanes | Needed for tier reviews and quarterly business discussions |
| **Hidden** (behind click -- modal/drawer/detail) | Individual load details, per-load ratings, claims documentation, historical tier change log, rate negotiation data | Deep-dive data for investigation and negotiation |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Carrier Name | Carrier.companyName | Large text (text-2xl font-semibold), non-clickable on this page | Header |
| 2 | Tier Badge | Carrier.tier | Large colored badge with icon (Crown/Award/Medal/Shield/CircleOff), per status-color-system.md Section 8 | Header, right-aligned |
| 3 | MC Number | Carrier.mcNumber | "MC# XXXXXX" format, monospace | Header subtitle |
| 4 | DOT Number | Carrier.dotNumber | "DOT# XXXXXXX" format, monospace | Header subtitle |
| 5 | Overall Score | Calculated | Large number in center of semi-circular gauge (0-100), color matches tier | Header gauge |
| 6 | On-Time Pickup Rate | CarrierMetrics.onTimePickupRate | "XX.X%" with colored indicator (green >=95%, amber 85-94%, red <85%) | Performance card |
| 7 | On-Time Delivery Rate | CarrierMetrics.onTimeDeliveryRate | "XX.X%" with colored indicator (green >=95%, amber 85-94%, red <85%) | Performance card |
| 8 | Claims Rate | CarrierMetrics.claimsRate | "X.X%" with colored indicator (green <2%, amber 2-3%, red >3%) | Performance card |
| 9 | Acceptance Rate | CarrierMetrics.acceptanceRate | "XX.X%" | Performance card |
| 10 | Dispatcher Rating | CarrierMetrics.avgDispatcherRating | "X.X/5.0" with star icons (filled/empty) | Performance card |
| 11 | Customer Rating | CarrierMetrics.avgCustomerRating | "X.X/5.0" with star icons | Performance card |
| 12 | Damage Rate | CarrierMetrics.damageRate | "X.X%" with colored indicator (green <1%, amber 1-2%, red >2%) | Performance card |
| 13 | Communication Score | CarrierMetrics.communicationScore | "X.X/5.0" with progress bar | Performance card |
| 14 | Total Loads (period) | Calculated | Integer count | Stats context in header or charts |
| 15 | Total Revenue Paid | Calculated | "$X,XXX,XXX" format | Charts section (finance_view only) |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Overall Score | Weighted formula: (onTimePickup * 0.25) + (onTimeDelivery * 0.25) + ((100 - claimsRate*10) * 0.20) + (acceptanceRate * 0.15) + (avgRating/5*100 * 0.15) | Integer 0-100, displayed in gauge |
| 2 | Fleet Average Delta | thisCarrier.metric - fleetAverage.metric for each KPI | +/- percentage or decimal, green if favorable, red if unfavorable |
| 3 | Tier Progress | (currentScore - currentTierMin) / (nextTierMin - currentTierMin) * 100 | Progress bar percentage |
| 4 | Requirements Met | Boolean check per tier requirement (loads count, on-time threshold, claims threshold, rating threshold) | Checkmark or X icon per requirement |
| 5 | Avg Rate Per Mile | SUM(carrierRate) / SUM(loadMiles) for loads in period | "$X.XX/mi" format, finance_view only |
| 6 | Load Trend | Percent change in load count vs previous period | "+X%" or "-X%" with trend arrow |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Display 8 performance metric cards with color-coded thresholds (on-time PU, on-time DL, claims rate, acceptance rate, dispatcher rating, customer rating, damage rate, communication score)
- [ ] Semi-circular gauge showing overall score (0-100) with tier-colored fill
- [ ] Performance trend line chart: 6-month on-time delivery % with 95% target line
- [ ] Load volume bar chart: monthly loads completed
- [ ] Revenue to carrier line chart: monthly payments (finance_view permission)
- [ ] Rating trend line chart: 6-month average rating progression
- [ ] Tier progression section showing current tier, next tier requirements, and progress bar
- [ ] Load history table: last 20 loads with load#, route, dates, status, rating
- [ ] Most frequent lanes section showing unique O-D pairs with load count, on-time %, and rate
- [ ] Date range selector to adjust the analysis window (last 30 days, 90 days, 6 months, 1 year, custom)
- [ ] Download scorecard as PDF button
- [ ] Send scorecard via email button

### Advanced Features (Logistics Expert Recommendations)

- [ ] "Compare to Fleet Average" toggle: overlay fleet average values on all metrics as a comparison baseline, highlighting where the carrier is above or below
- [ ] Peer comparison: compare this carrier against other carriers of the same tier (e.g., "vs other Gold carriers")
- [ ] Select 2-3 specific carriers for side-by-side comparison (opens comparison modal/view)
- [ ] Set performance alerts: configure thresholds that trigger notifications (e.g., "Notify me if on-time drops below 85%")
- [ ] Historical tier changes timeline: visual log showing every tier change with date, old tier, new tier, and reason
- [ ] Rate negotiation data panel: show average rate per mile by lane with trend, market rate comparison, and suggested rate adjustments (finance_view only)
- [ ] Custom date range for all metrics with comparison to previous equivalent period
- [ ] Auto-generated performance summary: AI-written paragraph summarizing the carrier's strengths, weaknesses, and recommended actions
- [ ] Carrier's insurance and compliance status quick-view strip (not the full compliance screen, just status badges)
- [ ] "What-if" tier calculator: adjust metric values to see projected tier impact before the next nightly calculation

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View revenue charts | admin, finance | finance_view | Revenue chart hidden, "Avg Rate/Mile" column hidden in lanes table |
| Download PDF | any authenticated | export_data | Button disabled with tooltip |
| Email scorecard | operations_manager, admin | carrier_communicate | Button hidden |
| Set performance alerts | operations_manager, admin | carrier_manage | Alert config section hidden |
| Modify tier | admin | carrier_tier_manage | Tier progression shows "Contact admin to request tier change" |
| View rate negotiation data | admin, finance | finance_view + carrier_manage | Section hidden entirely |

---

## 6. Status & State Machine

### Status Transitions (Tier)

```
[UNQUALIFIED] ---(Score reaches 40+, 10+ loads)---> [BRONZE]
                                                        |
                                        (Score reaches 60+)
                                                        |
                                                        v
[BRONZE] <---(Score drops below 60)--- [SILVER] ---(Score reaches 75+)---> [GOLD]
                                                                              |
                                                              (Score reaches 90+)
                                                                              |
                                                                              v
[SILVER] <---(Score drops below 75)--- [GOLD] <---(Score drops below 90)--- [PLATINUM]
```

Note: Tier downgrades require a grace period of 2 consecutive calculation cycles below threshold before triggering. Tier upgrades take effect on next nightly calculation. All tier changes are logged.

### Actions Available Per Tier Section

| State | Available Actions | Restricted Actions |
|---|---|---|
| Viewing scorecard (any tier) | Download PDF, Email, Set Alerts, Compare to Fleet, Adjust Date Range | N/A |
| Tier meets upgrade criteria | "Recommend Upgrade" button (sends to admin approval queue) | Auto-upgrade without approval |
| Tier meets downgrade criteria | "Override: Maintain Tier" button (admin only, with reason) | Downgrade without notification to carrier |
| Insufficient data (<10 loads) | View partial data with "Insufficient Data" banner, encourage load assignment | Tier calculation, comparison, PDF export |

### Status Badge Colors

Tier colors follow the global status-color-system.md Section 8 (Carrier Tier):

| Tier | Background | Text | Icon | Tailwind |
|---|---|---|---|---|
| PLATINUM | indigo-100 (#E0E7FF) | indigo-800 (#3730A3) | Crown | `bg-indigo-100 text-indigo-800` |
| GOLD | amber-100 (#FEF3C7) | amber-800 (#92400E) | Award | `bg-amber-100 text-amber-800` |
| SILVER | slate-100 (#F1F5F9) | slate-700 (#334155) | Medal | `bg-slate-100 text-slate-700` |
| BRONZE | orange-100 (#FFF7ED) | orange-800 (#9A3412) | Shield | `bg-orange-100 text-orange-800` |
| UNQUALIFIED | gray-100 (#F3F4F6) | gray-700 (#374151) | CircleOff | `bg-gray-100 text-gray-700` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Header)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Download PDF | Download | Secondary / Outline | Generates and downloads a formatted PDF scorecard report | No |
| Email Scorecard | Mail | Secondary / Outline | Opens modal to select carrier contact, add message, and send scorecard as PDF attachment | No (but shows preview before send) |
| Date Range | Calendar | Ghost / Dropdown | Opens dropdown: Last 30 Days, Last 90 Days, Last 6 Months, Last Year, Custom Range | No |

### Secondary Actions (Header Overflow Menu "...")

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Compare to Fleet Average | BarChart | Toggles fleet comparison overlay on all metrics | Always available |
| Compare with Another Carrier | Users | Opens carrier selector modal for side-by-side comparison | Always available |
| Set Performance Alerts | Bell | Opens alert configuration modal | User has carrier_manage permission |
| View Tier History | History | Opens drawer with timeline of all tier changes | Always available |
| Recommend Tier Change | ArrowUpDown | Opens tier change recommendation form (reason, proposed tier) | User has carrier_tier_manage permission |
| Print Scorecard | Printer | Opens browser print dialog with print-optimized view | Always available |

### Metric Card Interactions

| Interaction | Target | Action |
|---|---|---|
| Click metric card | Any performance card | Expands to show detailed breakdown (e.g., clicking "On-Time PU: 92.3%" shows per-month breakdown and individual late pickups) |
| Hover metric card | Any performance card | Shows tooltip with: target value, trend vs last period, and count of loads used in calculation |
| Click rating stars | Dispatcher or Customer Rating | Opens modal showing all individual ratings with comments |

### Chart Interactions

| Interaction | Target | Action |
|---|---|---|
| Hover chart data point | Any chart | Shows tooltip: exact value, date, and comparison to target/average |
| Click chart data point | Load volume bar | Filters load history table to that month |
| Toggle fleet average | Comparison toggle | Adds/removes fleet average line on trend charts |
| Zoom/pan | All charts | Scroll to zoom time axis, drag to pan |

### Load History Table Actions

| Action | Target | Behavior |
|---|---|---|
| Click load number | Load # column | Navigate to Load Detail page |
| Click lane link | Most Frequent Lanes | Navigate to Lane Preferences filtered to that lane |
| Sort columns | Any column header | Sort load history table |
| "View All Loads" link | Bottom of table | Navigate to Loads List filtered to this carrier |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + P | Download PDF / Print |
| Ctrl/Cmd + E | Email scorecard |
| Ctrl/Cmd + D | Toggle date range selector |
| Escape | Close any open modal/drawer |
| Tab | Navigate between metric cards |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| carrier.score.updated | { carrierId, newScore, oldScore, metrics } | Update gauge animation from old to new score, flash changed metric cards |
| carrier.tier.changed | { carrierId, oldTier, newTier, changedBy, reason } | Update tier badge with animation, show toast "Tier changed to [newTier]", update tier progression section |
| load.completed | { loadId, carrierId, rating } | Increment load count, recalculate visible metrics, add row to load history table |
| carrier.alert.triggered | { carrierId, alertType, metric, threshold, currentValue } | Show prominent alert banner at top of scorecard: "[Metric] has dropped below your threshold" |

### Live Update Behavior

- **Update frequency:** Scorecard data recalculates nightly. WebSocket push only for real-time events (new load completion, tier change, alert trigger). No continuous polling -- this is a report view.
- **Visual indicator:** When a metric changes, the card briefly pulses and the old/new values animate (count-up effect, 500ms).
- **Conflict handling:** Not applicable -- scorecard is read-only for most users. Tier changes by admin show confirmation before applying.

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** No polling for scorecard (data is relatively static, recalculated nightly)
- **Visual indicator:** If a real-time event was missed, data refreshes on next page visit

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Set performance alert | Immediately show alert as configured | Remove alert, show error toast |
| Recommend tier change | Show "Recommendation submitted" toast | Show error toast with retry |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| TierBadge | src/components/carrier/tier-badge.tsx | tier, size: 'sm' / 'md' / 'lg' |
| StatusBadge | src/components/ui/status-badge.tsx | For load statuses in history table |
| DataTable | src/components/ui/data-table.tsx | For load history and lanes tables |
| StatsCard | src/components/ui/stats-card.tsx | For performance metric cards |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| StatsCard | Shows value and label | Add threshold color-coding (green/amber/red based on target), trend indicator (up/down arrow + percentage), target value display, and click-to-expand behavior |
| TierBadge | Small inline badge | Need a "large" variant (48px+ height) for the scorecard header with icon, label, and colored background |
| DataTable | Basic sort and pagination | Add inline star rating display, route formatting (origin > destination with arrow), and compact row variant |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| ScoreGauge | Semi-circular gauge component (0-100) with animated fill, tier-colored arc, and large center number. Props: score, tier, animated. Based on SVG path drawing. | Medium |
| PerformanceMetricCard | Enhanced card showing: metric label, large value, target comparison, trend arrow, threshold coloring, and expandable detail on click. 2-column grid of 8 cards. | Medium |
| ComparisonTable | Side-by-side comparison table for "this carrier vs fleet average" with delta column and above/below indicators. Supports toggling on/off. | Medium |
| TierProgressionBar | Horizontal progress bar showing current score position between current tier minimum and next tier minimum. Tier zones color-coded. Requirements checklist below. | Medium |
| PerformanceTrendChart | Recharts line chart with: primary metric line, target threshold dashed line, optional fleet average overlay line. Responsive, supports date range zoom. | Medium |
| LoadVolumeChart | Recharts bar chart showing monthly load counts. Clickable bars that filter the load history table. Responsive. | Small |
| RevenueChart | Recharts line chart showing monthly carrier payments. Only rendered for finance_view users. | Small |
| RatingTrendChart | Recharts line chart showing monthly average rating (1-5 scale). Star icon data points. | Small |
| TierHistoryTimeline | Vertical timeline component showing tier changes with date, old tier badge, new tier badge, reason, and changed-by user. | Medium |
| FrequentLanesTable | Compact table showing unique origin-destination pairs with load count, on-time %, and average rate per mile. Clickable lanes. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | If scorecard sections are tabbed on mobile |
| Collapsible | collapsible | Comparison section expand/collapse |
| Dialog | dialog | Carrier comparison modal, email scorecard modal, alert config modal |
| Select | select | Date range selector |
| Separator | separator | Between scorecard sections |
| Toggle | toggle | "Compare to Fleet Average" toggle |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/carriers/:id/scorecard | Fetch complete scorecard data for a carrier (metrics, score, tier, comparisons) | useCarrierScorecard(carrierId, dateRange) |
| 2 | GET | /api/carriers/:id/scorecard/trends | Fetch trend data for charts (monthly breakdowns of all metrics) | useCarrierTrends(carrierId, dateRange) |
| 3 | GET | /api/carriers/:id/scorecard/loads | Fetch recent loads for history table (paginated) | useCarrierLoadHistory(carrierId, dateRange, page) |
| 4 | GET | /api/carriers/:id/scorecard/lanes | Fetch frequent lanes with aggregated metrics | useCarrierLanes(carrierId, dateRange) |
| 5 | GET | /api/carriers/fleet-average | Fetch fleet-wide average metrics for comparison | useFleetAverage(dateRange) |
| 6 | GET | /api/carriers/:id/tier-history | Fetch historical tier changes log | useCarrierTierHistory(carrierId) |
| 7 | POST | /api/carriers/:id/tier-recommendation | Submit tier change recommendation | useRecommendTierChange() |
| 8 | POST | /api/carriers/:id/scorecard/email | Send scorecard PDF to specified email | useSendScorecard() |
| 9 | GET | /api/carriers/:id/scorecard/pdf | Generate and download scorecard PDF | useDownloadScorecard() |
| 10 | POST | /api/carriers/:id/alerts | Create performance alert rule | useCreateCarrierAlert() |
| 11 | GET | /api/carriers/:id/alerts | Fetch existing alert rules | useCarrierAlerts(carrierId) |
| 12 | GET | /api/carriers/:id/scorecard/compare/:compareId | Compare two carriers side by side | useCarrierComparison(carrierId, compareId) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| carrier:{carrierId} | carrier.score.updated | useCarrierScoreUpdates(carrierId) -- invalidates scorecard query |
| carrier:{carrierId} | carrier.tier.changed | useCarrierTierStream(carrierId) -- updates tier badge + toast |
| loads:{tenantId} | load.completed (filter by carrierId) | useCarrierLoadStream(carrierId) -- invalidates load history |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/carriers/:id/scorecard | Show "Invalid date range" toast | Redirect to login | Show "Access Denied" page | Show "Carrier not found" with back link | Show error state with retry button |
| POST /api/carriers/:id/scorecard/email | Show validation errors (invalid email) | Redirect to login | Show "Permission Denied" toast | Show "Carrier not found" | Show error toast with retry |
| GET /api/carriers/:id/scorecard/pdf | Show "Unable to generate PDF" toast | Redirect to login | Show "Permission Denied" toast | Show "Carrier not found" | Show error toast "PDF generation failed, try again" |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show header with carrier name placeholder (wide gray bar) and tier badge skeleton (rounded rectangle). Score gauge area shows circular skeleton. Performance cards show 8 skeleton cards in 2x4 grid (each with label bar and value bar). Chart areas show 4 rectangular skeleton blocks. Load history shows 5 skeleton table rows.
- **Progressive loading:** Header renders with carrier name first (from cache/route state). Metrics cards load next. Charts load asynchronously (may appear after cards). Load history table loads last.
- **Duration threshold:** If any section exceeds 5s, show "Calculating performance data..." message in that section.

### Empty States

**Insufficient data (fewer than 10 completed loads):**
- **Display:** Show carrier name and tier badge normally. Score gauge shows "N/A" in center with grayed-out arc. Performance cards show "--" for all values.
- **Banner:** Amber info banner: "This carrier has completed [X] loads in the selected period. At least 10 loads are required for a reliable scorecard. [Expand date range] or [Assign more loads to this carrier]."

**No loads in selected date range:**
- **Headline:** "No load data for the selected period"
- **Description:** "Adjust the date range to see performance data."
- **CTA Button:** "View Last 12 Months" -- resets date range

**New carrier (never had loads):**
- **Headline:** "No performance history yet"
- **Description:** "[Carrier Name] hasn't completed any loads yet. Assign their first load to start building a scorecard."
- **CTA Button:** "Go to Dispatch Board" -- navigates to dispatch

### Error States

**Full page error (scorecard API fails):**
- **Display:** Error icon + "Unable to load scorecard for [Carrier Name]" + "Performance data may be temporarily unavailable. Please try again." + Retry button

**Partial error (metrics load, charts fail):**
- **Display:** Show metric cards with data. Chart areas show: "Could not load chart data" with individual Retry links. Load history area handles its own error state independently.

**PDF generation error:**
- **Display:** Toast: "Unable to generate PDF. Please try again in a few minutes." Red background, auto-dismiss 8s.

### Permission Denied

- **Full page denied:** Show "You don't have permission to view carrier scorecards" with link back to Carriers list.
- **Partial denied:** Revenue chart and rate data hidden for non-finance users. Tier management actions hidden for non-admins. All metric cards visible to any authenticated user with carrier access.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Scorecard data shown is from [timestamp]. Metrics may not reflect recent loads."
- **Degraded:** Scorecard is a read-heavy view; most data is cacheable. Show stale indicator if data is >24h old: "Last updated: [timestamp]."

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Date Range | Select dropdown + custom range picker | Last 30 Days, Last 90 Days, Last 6 Months, Last Year, Custom | Last 6 Months | ?dateFrom=&dateTo= |
| 2 | Compare Mode | Toggle | Off, Fleet Average, Specific Carrier | Off | ?compare=fleet or ?compare=carrierId |

### Search Behavior

- **No search field on this screen.** It is a single-carrier detail view. The load history table supports column-based filtering (search by load number within the table).

### Sort Options (Load History Table)

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Load Number | Descending (newest first) | Alphanumeric |
| Route | N/A (not sortable) | -- |
| Pickup Date | Descending | Date |
| Delivery Date | Descending | Date |
| Status | Custom (Completed first) | Custom enum |
| Rating | Descending (highest first) | Numeric |

### Sort Options (Frequent Lanes Table)

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Load Count | Descending (most loads first) | Numeric |
| On-Time % | Descending (best first) | Numeric |
| Avg Rate/Mile | Ascending (lowest first) | Numeric (finance_view only) |

**Default sort:** Frequent lanes by load count descending; Load history by pickup date descending

### Saved Filters / Presets

- **No saved filters.** Date range selection persists in URL params and localStorage for this carrier. Comparison mode persists in URL params.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to icon-only mode
- Header section: carrier name and tier badge stack vertically, score gauge shrinks to 150px diameter
- Two-column layout (metrics + charts) collapses to single column: metric cards (2x4 grid) above, charts below
- Comparison table: horizontal scroll if needed
- Tier progression: full width, requirements list wraps
- Load history table: hide Rating column, show on row expand
- Charts: full width, stacked vertically

### Mobile (< 768px)

- Sidebar hidden -- hamburger menu
- Header: carrier name (text-xl), smaller tier badge, gauge shrinks to 120px
- Performance metric cards: 2x4 grid becomes 2x2 per row (4 rows of 2 cards), compact format
- Charts: single column, each chart full width, swipe between charts (carousel) or vertical scroll
- Comparison section: collapses to accordion -- tap to expand each metric comparison
- Tier progression: simplified view -- just current tier, score, and "X of Y requirements met"
- Load history: card-based view (one card per load) instead of table
- Frequent lanes: card-based view with origin > destination as header
- Action buttons (PDF, Email): moved to sticky bottom action bar
- Pull-to-refresh to reload scorecard data

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full 2-column layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Same layout, slightly narrower metric cards |
| Tablet | 768px - 1023px | Single column, stacked sections |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design a carrier performance scorecard page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This is the most data-rich screen in the carrier module -- a comprehensive performance dashboard for a single carrier.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px), white content area on the right. Top of content area has a breadcrumb "Carriers > TransWest Logistics > Scorecard".

Header Section: Below the breadcrumb, a prominent header card with white background and subtle border. Left side shows the carrier name "TransWest Logistics" in large semibold text (24px), with "MC# 789456 | DOT# 2345678" in smaller gray text below. Right side of header shows a large GOLD tier badge (amber background, dark amber text, Award icon, "GOLD" label) at about 40px height. Center of header features a semi-circular gauge showing the overall score of 72 out of 100. The gauge arc is colored in amber/gold (matching the tier), with "72" displayed large and bold in the center. Below the gauge: "Overall Performance Score". Top-right corner of header has three buttons: a ghost "Calendar" icon dropdown showing "Last 6 Months", a secondary outlined "Download PDF" button with download icon, and a secondary outlined "Email Scorecard" button with mail icon.

Two-Column Layout Below Header:

LEFT COLUMN (40% width) - Performance Metric Cards: Show 8 cards in a 2x4 grid (2 columns, 4 rows). Each card has a white background, rounded-lg border, and 16px padding. Card content: metric label in small gray text at top, large value in the center (e.g., "92.3%"), target or benchmark below in smaller text (e.g., "Target: 95%"), and a small colored indicator dot (green if meeting target, amber if close, red if below). Cards:
1. On-Time Pickup: 92.3% (target 95%, amber dot)
2. On-Time Delivery: 89.7% (target 95%, amber dot)
3. Claims Rate: 1.8% (target <2%, green dot)
4. Acceptance Rate: 78.5% (no specific target, neutral)
5. Dispatcher Rating: 4.2/5.0 (show 4 filled stars + 1 partial, blue)
6. Customer Rating: 4.0/5.0 (show 4 filled stars, blue)
7. Damage Rate: 0.5% (target <1%, green dot)
8. Communication Score: 3.8/5.0 (show progress bar, amber)

RIGHT COLUMN (60% width) - Trend Charts: Stack 4 charts vertically, each in a white card with rounded-lg border.

Chart 1 - "Performance Trend" (tallest, ~200px): Line chart showing 6 months of on-time delivery percentage. X-axis: Aug, Sep, Oct, Nov, Dec, Jan. Y-axis: 80-100%. Blue line trending from ~86% to ~90%. Dashed red horizontal line at 95% labeled "Target." The line should show realistic fluctuation (86, 88, 87, 91, 89, 90).

Chart 2 - "Load Volume": Bar chart showing monthly completed loads. Blue bars. Values: Aug: 8, Sep: 12, Oct: 10, Nov: 14, Dec: 11, Jan: 12. Y-axis: 0-15.

Chart 3 - "Revenue Paid to Carrier": Line chart showing monthly payments. Green line. Values: Aug: $18K, Sep: $27K, Oct: $23K, Nov: $32K, Dec: $25K, Jan: $28K.

Chart 4 - "Rating Trend": Line chart showing monthly average rating. Amber line. Values: Aug: 3.8, Sep: 4.0, Oct: 3.9, Nov: 4.2, Dec: 4.1, Jan: 4.2. Y-axis: 1-5 scale.

Comparison Section (Full width below the two columns): White card with a toggle switch in the header: "Compare to Fleet Average." When toggled on (show it on), display a comparison table with columns: Metric, This Carrier, Fleet Average, Delta, Status. Show 5 rows:
- On-Time Pickup: 92.3% vs 88.1%, +4.2%, green "Above" badge
- On-Time Delivery: 89.7% vs 86.5%, +3.2%, green "Above" badge
- Claims Rate: 1.8% vs 2.4%, -0.6%, green "Better" badge
- Acceptance Rate: 78.5% vs 72.0%, +6.5%, green "Above" badge
- Avg Rating: 4.2 vs 3.8, +0.4, green "Above" badge

Tier Progression Section (Full width): White card showing: "Current Tier: GOLD (72 pts)" on left with gold badge, "Next Tier: PLATINUM (90 pts)" on right with indigo badge. Between them, a horizontal progress bar filled to 72% with gold color, the remaining portion showing the 90-point threshold marker. Below the bar, a requirements checklist:
- Checkmark (green): "50+ completed loads (have: 67)"
- X mark (red): "On-Time Delivery >= 95% (current: 89.7%)"
- X mark (red): "Claims Rate < 1% (current: 1.8%)"
- X mark (red): "Avg Rating >= 4.5 (current: 4.2)"
Below the checklist: "Tier History: Gold since Sep 2025 | Silver: Mar 2025 - Sep 2025 | Bronze: Oct 2024 - Mar 2025"

Load History Section (Full width): White card with title "Recent Loads" and a "View All" link. Data table with columns: Load # (monospace, blue link), Route (e.g., "Chicago, IL > Dallas, TX" with arrow icon), Pickup Date, Delivery Date, Status (green "Completed" badge), Rating (star display). Show 5 rows of realistic data.

Below the load table, a "Most Frequent Lanes" section showing a compact table: Lane (origin > destination), Loads, On-Time %, Avg Rate/Mi. Show 4 rows:
- Chicago, IL > Dallas, TX: 12 loads, 94%, $2.15/mi
- Atlanta, GA > Memphis, TN: 8 loads, 88%, $1.98/mi
- Los Angeles, CA > Phoenix, AZ: 6 loads, 100%, $2.45/mi
- Houston, TX > Jacksonville, FL: 5 loads, 80%, $1.87/mi

Design Specifications:
- Font: Inter, 14px base, 24px page title
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 (#F9FAFB) to give cards contrast
- Primary color: blue-600 for links and interactive elements
- Cards: white background, rounded-lg, subtle border slate-200, no shadow
- Gauge: SVG semi-circle, colored by tier (amber for Gold)
- Charts: clean and minimal, use Recharts-style line and bar charts with subtle grid
- Performance cards: compact 2-column grid, clear visual hierarchy
- Tier badges: large and prominent in header, smaller inline elsewhere
- Status indicators: colored dots (green/amber/red) for metric thresholds
- Comparison table: alternating row backgrounds, delta column with green/red text
- Modern SaaS aesthetic similar to Linear.app or Stripe dashboard
- Total page should feel like a comprehensive but scannable performance report
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing built yet -- screen is in design phase

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Performance metric cards (8 KPIs) with threshold color-coding
- [ ] Overall score gauge with tier coloring
- [ ] Performance trend chart (on-time delivery 6-month line)
- [ ] Load volume bar chart
- [ ] Rating trend line chart
- [ ] Tier progression bar with requirements checklist
- [ ] Recent load history table
- [ ] Frequent lanes table
- [ ] Date range selector
- [ ] Download PDF action
- [ ] Compare to Fleet Average toggle

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| 8 KPI metric cards with threshold colors | High | Medium | P0 |
| Overall score gauge | High | Medium | P0 |
| Performance trend chart (on-time line) | High | Medium | P0 |
| Tier progression with requirements | High | Medium | P0 |
| Load history table | Medium | Low | P0 |
| Frequent lanes table | Medium | Low | P0 |
| Download PDF export | Medium | Medium | P1 |
| Compare to Fleet Average toggle | High | Medium | P1 |
| Email scorecard to carrier | Medium | Medium | P1 |
| Revenue chart (finance-gated) | Medium | Low | P1 |
| Side-by-side carrier comparison | Medium | High | P1 |
| Performance alert configuration | Medium | High | P2 |
| Rate negotiation data panel | Medium | High | P2 |
| AI-generated performance summary | Low | High | P2 |
| "What-if" tier calculator | Low | High | P2 |

### Future Wave Preview

- **Wave 4:** Add side-by-side carrier comparison tool (select 2-3 carriers, overlay metrics), rate negotiation data panel for finance users, and automated performance alert system (email/SMS when thresholds are breached).
- **Wave 5:** AI-powered performance prediction ("based on trends, this carrier is likely to reach Platinum tier in 3 months"), automated tier management with configurable approval workflows, and integration with external carrier rating services (Carrier411, RMIS) to cross-reference internal vs external scores.

---
