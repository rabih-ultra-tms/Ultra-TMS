# Sales Reports -- Win/Loss Analysis and Revenue Reports

> Service: Sales (03) | Wave: 1 | Priority: P2
> Route: /sales/reports | Status: Not Started
> Primary Personas: Sales Manager, Admin
> Roles with Access: super_admin, admin, sales_manager, sales_agent (limited -- own data only)

---

## 1. Purpose & Business Context

**What this screen does:**
The Sales Reports screen is the analytics command center for sales leadership. It provides five core report types -- Quote Conversion, Revenue by Rep, Revenue by Customer, Lane Profitability, and Pipeline Forecast -- with configurable date ranges, comparison periods, interactive charts (bar, line, pie, funnel), drill-down capability, and export to PDF and Excel. Reports can be scheduled for automated delivery via email on a recurring basis.

**Business problem it solves:**
Sales managers currently generate performance reports by exporting data to Excel, spending 1-2 hours manually creating pivot tables, charts, and summaries. This process happens weekly or monthly, meaning leadership operates on stale data for most of the reporting period. Critical trends -- a declining conversion rate, a top customer reducing volume, a new lane gaining traction -- go unnoticed until the manual report is produced. The Sales Reports screen provides instant, always-current analytics that surface trends, identify opportunities, and flag problems in real-time. Instead of 2 hours of spreadsheet work, managers get answers in 5 seconds.

**Key business rules:**
- Sales agents can only view reports scoped to their own data (their quotes, their revenue, their customers). The `team_view` permission unlocks team-wide reports.
- Revenue figures require the `finance_view` permission. Without it, reports show count-based metrics only.
- Comparison periods are calculated automatically: if the selected period is "This Month", the comparison period is "Last Month". If "This Quarter", comparison is "Last Quarter".
- Pipeline Forecast uses a weighted probability model: SENT = 30%, VIEWED = 50%, ACCEPTED = 90%.
- Report data is generated on-demand from the database. Reports with large date ranges (>6 months) may take 2-5 seconds to generate.
- Scheduled reports are delivered as PDF attachments via email. Users can configure daily, weekly, or monthly delivery schedules.
- All report data respects the user's tenant (multi-tenant isolation).
- Reports can be filtered by agent, customer, service type, equipment type, and date range. Filters apply across all charts and tables within a report.
- Drill-down: clicking a chart element (bar segment, pie slice, table row) navigates to the underlying data (e.g., clicking a customer's revenue bar opens their quotes filtered to that period).

**Success metric:**
Time from question ("What is our conversion rate this quarter?") to answer drops from 2 hours (manual report) to 5 seconds. Sales managers identify negative trends within 1 week instead of 1 month. Report scheduling eliminates 100% of manual recurring report generation.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Sales Reports" or "Reports" under Sales section | None |
| Sales Dashboard | Clicks "View Reports" link or chart drill-down | ?report=conversion&dateRange=this_month |
| Sales Dashboard | Clicks revenue metric for detailed breakdown | ?report=revenue_by_rep |
| Direct URL | Bookmark / shared link / scheduled report link | Report type, date range, filters in URL |
| Email | Clicks "View Full Report" link in scheduled report email | Report type, date range in URL |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Quotes List | Clicks drill-down on chart element (e.g., agent's conversion bar) | Pre-set filters matching the drill-down |
| Quote Detail | Clicks specific quote in a report table | quoteId |
| Customer Detail (CRM) | Clicks customer name in revenue report | customerId |
| Sales Dashboard | Clicks breadcrumb "Sales" | None |

**Primary trigger:**
The Sales Manager opens Sales Reports every Monday morning to review the previous week's performance. She selects the "Quote Conversion" report, sets the date range to "Last Week", and sees that the team conversion rate dropped from 38% to 31%. She drills into the agent breakdown and sees that one agent's rate dropped to 15%. She clicks on that agent's bar to see their quotes, identifies 5 quotes that were rejected, and notices they were all above-market rates. She then switches to "Revenue by Customer" to check if any top customers reduced activity. She schedules the "Weekly Performance Summary" to be emailed to the sales team every Monday at 7 AM.

**Success criteria (user completes the screen when):**
- User has reviewed the report data and understands current performance trends.
- User has identified any notable trends, problems, or opportunities.
- User has optionally drilled down into specific data points for deeper analysis.
- User has optionally exported the report or scheduled it for recurring delivery.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Top Bar: [Sales] > Reports                                             |
|                          [Date Range: This Month v] [Compare: Last Mo.] |
|                          [Export PDF] [Export Excel] [Schedule]          |
+------------------------------------------------------------------------+
|                                                                        |
|  REPORT TABS:                                                          |
|  [Quote Conversion] [Revenue by Rep] [Revenue by Customer]             |
|  [Lane Profitability] [Pipeline Forecast]                              |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | Filters: [Agent v] [Customer v] [Service Type v] [Equipment v]    |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  ============ QUOTE CONVERSION REPORT (active tab) =================   |
|                                                                        |
|  +----------+  +----------+  +-----------+  +----------+              |
|  | Total    |  | Converted|  | Conversion|  | Avg Days |              |
|  | Quotes   |  | Quotes   |  | Rate      |  | to Close |              |
|  |   186    |  |    65    |  |  34.9%    |  |   4.2    |              |
|  | +8% vs   |  | +12% vs  |  | -3.1%pt  |  | -0.8d vs |              |
|  | last mo  |  | last mo  |  | vs last mo|  | last mo  |              |
|  +----------+  +----------+  +-----------+  +----------+              |
|                                                                        |
|  +------------------------------+  +-------------------------------+   |
|  |  CONVERSION OVER TIME        |  |  CONVERSION BY STATUS         |   |
|  |  (Line chart)                |  |  (Funnel chart)               |   |
|  |                              |  |                               |   |
|  |  40% ─── · · ·              |  |  Draft:     186 [==========] |   |
|  |  35% ─────────── current    |  |  Sent:      142 [========]   |   |
|  |  30% ─ ─ ─ ─ ─  comparison |  |  Viewed:     98 [======]     |   |
|  |  25%                        |  |  Accepted:   65 [====]       |   |
|  |  ──────────────────────     |  |  Converted:  58 [===]        |   |
|  |  W1  W2  W3  W4  W5       |  |  Rejected:   44 [==]         |   |
|  +------------------------------+  |  Expired:    24 [=]          |   |
|                                     +-------------------------------+   |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  CONVERSION BY AGENT                                              |  |
|  |  (Horizontal bar chart)                                           |  |
|  |                                                                    |  |
|  |  James W.    ████████████████████ 42.5%  (28/66)                 |  |
|  |  Sarah M.    ██████████████████   38.2%  (21/55)                 |  |
|  |  Mike D.     ████████████████     35.0%  (14/40)                 |  |
|  |  Lisa T.     ████████           15.4%  (2/13) ⚠ Below target    |  |
|  |                                                                    |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  DETAILED BREAKDOWN TABLE                                         |  |
|  |                                                                    |  |
|  |  Agent    | Quotes | Sent | Viewed | Accepted | Rejected | Rate  |  |
|  |  ---------|--------|------|--------|----------|----------|-------|  |
|  |  James W. |   66   |  52  |   38   |    28    |    16    | 42.5% |  |
|  |  Sarah M. |   55   |  44  |   30   |    21    |    15    | 38.2% |  |
|  |  Mike D.  |   40   |  32  |   22   |    14    |    12    | 35.0% |  |
|  |  Lisa T.  |   13   |  10  |    6   |     2    |     5    | 15.4% |  |
|  |  ---------|--------|------|--------|----------|----------|-------|  |
|  |  TOTAL    |  186   | 142  |   98   |    65    |    44    | 34.9% |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Report tabs, date range, KPI summary cards (total, converted, rate, avg days) | Manager needs the headline metrics immediately |
| **Secondary** (visible in first scroll) | Primary charts (conversion over time line chart, conversion funnel) | Trend visualization that contextualizes the KPIs |
| **Tertiary** (available on scroll) | Agent breakdown bar chart, detailed breakdown table | Detailed analysis for identifying individual performance issues |
| **Hidden** (behind click/export) | Drill-down to individual quotes, exported PDF/Excel, scheduled report configuration | Deep reference and distribution tools |

---

## 4. Data Fields & Display

### Visible Fields

**Report Selector and Controls**

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Report Type | Tab selection | 5 tabs: Quote Conversion, Revenue by Rep, Revenue by Customer, Lane Profitability, Pipeline Forecast | Below header, tab bar |
| 2 | Date Range | User selection | Presets: This Week, This Month, This Quarter, This Year, Last Week, Last Month, Last Quarter, Last Year, Custom | Header, right side |
| 3 | Comparison Period | Auto-calculated or user selection | Prior equivalent period (e.g., "vs Last Month") | Header, next to date range |
| 4 | Agent Filter | User selection | All agents or specific agent (manager); own data only (agent) | Filter bar |
| 5 | Customer Filter | User selection | All customers or specific customer | Filter bar |
| 6 | Service Type Filter | User selection | FTL, LTL, Partial, Drayage, All | Filter bar |
| 7 | Equipment Filter | User selection | DRY_VAN, REEFER, FLATBED, etc., All | Filter bar |

**Quote Conversion Report KPIs**

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 8 | Total Quotes | Report.totalQuotes | Integer with comparison arrow | KPI card 1 |
| 9 | Converted Quotes | Report.convertedQuotes | Integer with comparison arrow | KPI card 2 |
| 10 | Conversion Rate | Report.conversionRate | "XX.X%" with comparison | KPI card 3 |
| 11 | Avg Days to Close | Report.avgDaysToClose | "X.X days" with comparison | KPI card 4 |

**Revenue by Rep Report KPIs**

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 12 | Total Revenue | Report.totalRevenue | "$XXX,XXX" with comparison | KPI card 1 |
| 13 | Top Rep Revenue | Report.topRepRevenue | "$XXX,XXX" with rep name | KPI card 2 |
| 14 | Avg Revenue/Rep | Report.avgRevenuePerRep | "$XX,XXX" with comparison | KPI card 3 |
| 15 | Avg Margin | Report.avgMargin | "XX.X%" with comparison | KPI card 4 |

**Revenue by Customer Report KPIs**

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 16 | Total Revenue | Report.totalRevenue | "$XXX,XXX" with comparison | KPI card 1 |
| 17 | Active Customers | Report.activeCustomers | Integer with comparison | KPI card 2 |
| 18 | Top Customer Revenue | Report.topCustomerRevenue | "$XXX,XXX" with name | KPI card 3 |
| 19 | New Customers | Report.newCustomers | Integer with comparison | KPI card 4 |

**Lane Profitability Report KPIs**

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 20 | Total Lanes | Report.totalLanes | Integer | KPI card 1 |
| 21 | Avg Margin/Lane | Report.avgMarginPerLane | "XX.X%" with comparison | KPI card 2 |
| 22 | Top Lane Revenue | Report.topLaneRevenue | "$XXX,XXX" with lane name | KPI card 3 |
| 23 | Unprofitable Lanes | Report.unprofitableLanes | Integer with red indicator | KPI card 4 |

**Pipeline Forecast Report KPIs**

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 24 | Pipeline Value | Report.pipelineValue | "$XXX,XXX" total | KPI card 1 |
| 25 | Weighted Forecast | Report.weightedForecast | "$XXX,XXX" probability-adjusted | KPI card 2 |
| 26 | Expected Conversions | Report.expectedConversions | Integer (predicted) | KPI card 3 |
| 27 | Avg Deal Size | Report.avgDealSize | "$X,XXX" with comparison | KPI card 4 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Conversion Rate | accepted / (accepted + rejected + expired) | Percentage |
| 2 | Comparison Change | ((currentPeriod - priorPeriod) / priorPeriod) * 100 | Percentage with +/- sign, color-coded |
| 3 | Weighted Pipeline | SUM(quoteValue * statusProbability) where SENT=0.3, VIEWED=0.5, ACCEPTED=0.9 | Currency |
| 4 | Avg Days to Close | AVG(acceptedDate - createdDate) for converted quotes | Decimal days |
| 5 | Win Rate by Lane | acceptedQuotes / totalQuotes per lane | Percentage |
| 6 | Revenue Growth | (currentRevenue - priorRevenue) / priorRevenue * 100 | Percentage |
| 7 | Agent Performance Index | Composite score: (conversionRate * 0.4) + (revenueRank * 0.3) + (marginAvg * 0.3) | Score 0-100 |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] 5 report tabs: Quote Conversion, Revenue by Rep, Revenue by Customer, Lane Profitability, Pipeline Forecast
- [ ] Date range selector with presets (This Week/Month/Quarter/Year, Last Week/Month/Quarter/Year, Custom)
- [ ] Automatic comparison period calculation (prior equivalent period)
- [ ] 4 KPI summary cards per report with comparison indicators
- [ ] Quote Conversion report: conversion rate over time (line chart), conversion funnel, agent breakdown (bar chart), detail table
- [ ] Revenue by Rep report: revenue by agent (bar chart), margin by agent, revenue over time (line chart), detail table
- [ ] Revenue by Customer report: revenue by customer (bar chart), top 10 customers (pie chart), customer detail table
- [ ] Lane Profitability report: profitable vs unprofitable lanes, margin by lane, top/bottom lanes table
- [ ] Pipeline Forecast report: pipeline by stage (stacked bar), weighted forecast over time, forecast detail table
- [ ] Filter by agent, customer, service type, equipment type
- [ ] Drill-down: click chart element to navigate to filtered quotes list
- [ ] Export to PDF (formatted report with charts and tables)
- [ ] Export to Excel (raw data with all columns)
- [ ] Report URL state sync (shareable report URLs with all parameters)
- [ ] Role-based data scoping (agent sees own data only)

### Advanced Features (Logistics Expert Recommendations)

- [ ] Scheduled reports: configure daily/weekly/monthly email delivery with recipient list
- [ ] Report bookmarks: save a specific report configuration (type + date range + filters) for quick access
- [ ] Custom date range comparison (e.g., compare Q1 2026 vs Q1 2025)
- [ ] Agent goal tracking: overlay target lines on charts (e.g., "Target: 40% conversion rate")
- [ ] Win/loss reason analysis: pie chart of rejection reasons from customer feedback
- [ ] Seasonal trend analysis: year-over-year comparison charts
- [ ] Report templates: save custom report configurations as reusable templates
- [ ] Interactive chart tooltips with detailed data on hover
- [ ] Report print view (optimized layout for printing)
- [ ] Data table sorting and column visibility in report tables
- [ ] Report sharing: generate a public link or embed code for stakeholders
- [ ] Dashboard widget generation: create dashboard widgets from report charts
- [ ] Cohort analysis: track customer groups over time (new vs returning customers)

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View reports | any authenticated | report_view | Screen not accessible |
| View all agents' data | sales_manager, admin | team_view | Reports scoped to own data only |
| View revenue/dollar data | sales_manager, admin | finance_view | Dollar columns replaced with "--"; revenue reports hidden |
| View margin data | sales_manager, admin | margin_view | Margin columns/charts hidden |
| Export reports | sales_agent, sales_manager, admin | export_data | Export buttons hidden |
| Schedule reports | sales_manager, admin | report_schedule | Schedule button hidden |
| View Pipeline Forecast | sales_manager, admin | forecast_view | Pipeline Forecast tab hidden |

---

## 6. Status & State Machine

### Report Generation States

Sales Reports do not have a traditional entity status machine. Instead, the report itself goes through generation states:

```
[IDLE] ---(User selects report/changes params)---> [LOADING]
                                                       |
                                                  (data ready)
                                                       |
                                                       v
                                                   [RENDERED]
                                                       |
                                               (user changes params)
                                                       |
                                                       v
                                                   [LOADING] (refresh)
```

### Report Tab Indicators

| Report Type | Indicator | Color | Purpose |
|---|---|---|---|
| Quote Conversion | Conversion rate trend arrow | Green (up) / Red (down) | Quick trend indicator on tab |
| Revenue by Rep | Revenue total badge | Blue | Show total revenue on tab |
| Revenue by Customer | Active customer count | Gray | Show customer count on tab |
| Lane Profitability | Unprofitable lane count | Red (if >0) | Alert for negative margins |
| Pipeline Forecast | Weighted forecast amount | Blue | Show forecast value on tab |

### Comparison Period Colors

| Change Direction | Text Color | Icon | Tailwind |
|---|---|---|---|
| Positive (good) | green-600 | ArrowUp | `text-green-600` |
| Negative (bad) | red-500 | ArrowDown | `text-red-500` |
| Neutral / No Change | gray-500 | Minus | `text-gray-500` |
| No Comparison Data | gray-400 | N/A | `text-gray-400 italic` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Export PDF | FileText | Secondary / Outline | Downloads current report as formatted PDF with charts | No |
| Export Excel | Sheet | Secondary / Outline | Downloads raw report data as Excel/CSV | No |
| Schedule | Clock | Secondary / Outline | Opens schedule configuration dialog | No |

### Secondary Actions (Per-Chart/Table)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Full Screen | Maximize | Expands chart to full-screen overlay | Any chart |
| Download Chart | Download | Downloads chart as PNG image | Any chart |
| View Data | Table | Toggles between chart view and data table view | Any chart |

### Chart Interactions

| Interaction | Target | Action |
|---|---|---|
| Click bar segment | Bar chart | Drills down to filtered data (e.g., clicks "James W." bar -> Quotes List filtered to James's quotes) |
| Click pie slice | Pie chart | Drills down to filtered data (e.g., clicks customer slice -> that customer's quotes) |
| Click funnel stage | Funnel chart | Drills down to quotes in that status |
| Hover data point | Line chart | Shows tooltip with exact value, date, and comparison value |
| Click table row | Detail table | Navigates to relevant detail (quote detail, customer detail) |
| Drag to select | Line chart | Zooms into selected date range |

### Schedule Dialog Actions

| Action Label | Action | Condition |
|---|---|---|
| Save Schedule | Creates or updates the scheduled report delivery | Valid email recipients and frequency selected |
| Delete Schedule | Removes the scheduled delivery | Existing schedule |
| Send Now | Immediately sends the report to selected recipients | Valid recipients |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + P | Export PDF |
| Ctrl/Cmd + E | Export Excel |
| 1-5 | Switch between report tabs |
| Ctrl/Cmd + K | Open global search |
| F | Toggle full-screen for focused chart |
| Escape | Exit full-screen |
| Left/Right arrows | Navigate between date range periods |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | N/A | No drag-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| N/A | N/A | Sales Reports is a static report screen. Reports are generated on-demand, not in real-time. |

### Live Update Behavior

- **Update frequency:** Reports are generated on-demand when the user loads the page, changes tabs, or modifies filters/date range. No auto-refresh.
- **Report generation time:** Target < 2 seconds for typical date ranges (1 month). Up to 5 seconds for large ranges (1 year) or complex reports.
- **Caching:** Report data is cached for 5 minutes. Changing filters/date range busts the cache and regenerates.
- **No real-time push:** Unlike the dashboard, reports are point-in-time snapshots. Users explicitly regenerate when needed.

### Polling Fallback

- **When:** N/A -- reports are on-demand, not subscription-based
- **Interval:** N/A
- **Endpoint:** N/A

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change date range | Show loading state in charts, keep KPI cards with previous data until new data arrives | Show error toast, restore previous data |
| Export PDF | Show "Generating PDF..." toast with progress | Show "PDF generation failed" error toast |
| Schedule report | Close dialog, show "Report scheduled" success toast | Reopen dialog with error message |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title: "Sales Reports", breadcrumbs, actions |
| StatsCard | src/components/ui/stats-card.tsx | value, label, trend, trendDirection |
| Button | src/components/ui/button.tsx | Export, schedule action buttons |
| Card | src/components/ui/card.tsx | Chart containers, table containers |
| Tabs | src/components/ui/tabs.tsx | Report type navigation |
| FilterBar | src/components/ui/filter-bar.tsx | Agent, customer, service type, equipment filters |
| StatusBadge | src/components/ui/status-badge.tsx | Quote status badges in detail tables |
| DataTable | src/components/ui/data-table.tsx | Report detail tables |
| Skeleton | src/components/ui/skeleton.tsx | Loading states for charts and tables |
| Dialog | src/components/ui/dialog.tsx | Schedule configuration dialog |
| Select | src/components/ui/select.tsx | Date range, comparison period |
| Calendar | src/components/ui/calendar.tsx + popover.tsx | Custom date range picker |
| Tooltip | src/components/ui/tooltip.tsx | Chart hover tooltips |
| SearchableSelect | src/components/ui/searchable-select.tsx | Agent and customer filter selects |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| StatsCard | Basic value + trend | Add comparison period value display ("vs XX last month"), percentage point change display |
| Tabs | Basic tab switching | Add report-specific indicator badges on tabs (e.g., revenue amount, alert count) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| ReportChart | Wrapper component for Recharts with standard styling, loading state, error state, full-screen toggle, and export | High |
| ConversionLineChart | Line chart with two lines (current period, comparison period), with configurable date granularity | Medium |
| ConversionFunnelChart | Horizontal or vertical funnel showing quote stages with counts and drop-off rates | Medium |
| AgentBarChart | Horizontal bar chart comparing metrics across agents, with target line overlay | Medium |
| RevenuePieChart | Pie/donut chart showing revenue distribution by customer, rep, or equipment | Medium |
| PipelineStackedBar | Stacked bar chart showing pipeline value grouped by status/stage | Medium |
| ForecastAreaChart | Area chart showing weighted pipeline forecast over time with confidence bands | High |
| ReportDetailTable | Data table within reports with sorting, clickable rows, and totals row | Medium |
| DateRangeSelector | Combined date range picker with presets and custom range, plus comparison period selector | High |
| ComparisonIndicator | Inline component showing change vs comparison period (percentage, direction arrow, color) | Small |
| ScheduleDialog | Dialog for configuring scheduled report delivery: frequency, recipients, format, time | Medium |
| ReportExportButton | Button group with PDF and Excel export options, showing progress during generation | Small |
| ChartActionBar | Small toolbar on each chart: full-screen, download PNG, toggle table view | Small |
| WinLossChart | Specialized chart showing win rate over time with drill-down capability | Medium |
| LaneProfitabilityMap | Optional heatmap showing lane profitability by region on a US map | High |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Report type navigation |
| Select | select | Date range, comparison period |
| Calendar | calendar + popover | Custom date range |
| Dialog | dialog | Schedule configuration |
| DropdownMenu | dropdown-menu | Chart action menus, export options |
| Tooltip | tooltip | Chart data point tooltips |
| Separator | separator | Section dividers between charts |
| ScrollArea | scroll-area | Report tables with horizontal scroll |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/sales/reports/conversion | Quote conversion report data | useConversionReport(dateRange, filters) |
| 2 | GET | /api/v1/sales/reports/revenue | Revenue reports data (by rep, by customer) | useRevenueReport(groupBy, dateRange, filters) |
| 3 | GET | /api/v1/sales/reports/lane-profitability | Lane profitability report data | useLaneProfitabilityReport(dateRange, filters) |
| 4 | GET | /api/v1/sales/reports/pipeline-forecast | Pipeline forecast data | usePipelineForecast(dateRange, filters) |
| 5 | GET | /api/v1/sales/reports/agent-performance | Agent performance comparison data | useAgentPerformance(dateRange, filters) |
| 6 | GET | /api/v1/sales/reports/win-loss | Win/loss analysis with rejection reasons | useWinLossReport(dateRange, filters) |
| 7 | POST | /api/v1/sales/reports/export/pdf | Generate and download PDF report | useExportReportPDF() |
| 8 | POST | /api/v1/sales/reports/export/excel | Generate and download Excel report | useExportReportExcel() |
| 9 | GET | /api/v1/sales/reports/schedules | List user's scheduled reports | useReportSchedules() |
| 10 | POST | /api/v1/sales/reports/schedules | Create a new scheduled report | useCreateReportSchedule() |
| 11 | PUT | /api/v1/sales/reports/schedules/:id | Update scheduled report | useUpdateReportSchedule() |
| 12 | DELETE | /api/v1/sales/reports/schedules/:id | Delete scheduled report | useDeleteReportSchedule() |
| 13 | GET | /api/v1/users?role=sales_agent | Agent list for filter | useSalesAgents() |
| 14 | GET | /api/v1/customers?search= | Customer search for filter | useCustomerSearch(query) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| N/A | N/A | No real-time subscriptions -- reports generated on-demand |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /reports/conversion | Show "Invalid date range" toast | Redirect to login | Show "Access Denied" page or scope to own data | N/A | Show "Report generation failed" with retry |
| POST /export/pdf | Show "Cannot generate PDF" toast | Redirect to login | Show "Permission Denied" toast | N/A | Show "PDF generation failed" toast |
| POST /schedules | Show validation errors in dialog | Redirect to login | Show "Permission Denied" toast | N/A | Show error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show tab bar immediately. Show 4 skeleton KPI cards. Show 2 skeleton chart areas (gray rectangles with shimmer). Show skeleton table below.
- **Progressive loading:** KPI cards can load before charts. Charts load independently. The fastest-loading elements appear first.
- **Duration threshold:** If report generation exceeds 5 seconds, show "Generating report for [date range]..." with progress indicator. For very large date ranges, show "Large date ranges may take up to 30 seconds."

### Empty States

**First-time empty (no quote data):**
- **Illustration:** Analytics/chart illustration
- **Headline:** "No data for reports yet"
- **Description:** "Sales reports are generated from quote activity. Create quotes to start building your sales analytics."
- **CTA Button:** "Create First Quote" -- primary blue button

**Filtered empty (data exists but filters exclude all):**
- **Headline:** "No data matches your report criteria"
- **Description:** "Try adjusting your date range, filters, or report type."
- **CTA Button:** "Reset Filters" -- secondary outline button

**Specific report empty (e.g., no rejected quotes for win/loss):**
- **Display:** Chart area shows "No data available for this view" with an empty chart placeholder. KPI cards show "0" with "N/A" for comparisons.

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to generate sales reports" + Retry button

**Per-report error (one tab fails):**
- **Display:** Tab shows error indicator. Content shows: "Could not generate [report name]. Please try again." with Retry button. Other tabs function normally.

**Export error:**
- **Display:** Toast: "Failed to generate [PDF/Excel] export. Please try again." Auto-dismiss after 8 seconds.

**Schedule error:**
- **Display:** Validation errors in schedule dialog (e.g., "At least one recipient email required").

### Permission Denied

- **Full page denied:** Show "You don't have permission to view sales reports" with link to Sales Dashboard
- **Partial denied (agent view):** Reports show personal data only. "Team" label hidden. Agent filter not shown. Pipeline Forecast tab hidden if user lacks forecast_view.
- **Revenue hidden:** Dollar columns show "--". Revenue reports show "Revenue data requires finance_view permission" placeholder.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Reports cannot be generated. Showing cached data from [timestamp] if available."
- **Degraded:** "Report generation may be slower than usual. Please wait." Show extra loading time allowance.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Date Range | Select with presets + custom | This Week, This Month, This Quarter, This Year, Last Week, Last Month, Last Quarter, Last Year, Custom | This Month | ?dateRange=this_month |
| 2 | Comparison Period | Auto/Manual | Auto (prior equivalent period), Custom | Auto | ?compare=auto |
| 3 | Agent | Searchable select (manager) | All agents or specific agent | All (manager) / Self (agent) | ?agentId= |
| 4 | Customer | Searchable select | All customers or specific customer | All | ?customerId= |
| 5 | Service Type | Multi-select | FTL, LTL, PARTIAL, DRAYAGE | All | ?serviceType= |
| 6 | Equipment Type | Multi-select | DRY_VAN, REEFER, FLATBED, STEP_DECK, POWER_ONLY | All | ?equipmentType= |

### Search Behavior

- **Search field:** Not applicable at the report level. Specific searches are done in detail tables and drill-down views.

### Sort Options

**Report detail tables:**
| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Agent Name | Ascending (A-Z) | Alphabetic |
| Customer Name | Ascending (A-Z) | Alphabetic |
| Revenue | Descending (highest first) | Numeric |
| Conversion Rate | Descending (highest first) | Numeric |
| Quote Count | Descending (highest first) | Numeric |
| Margin % | Descending (highest first) | Numeric |
| Lane | Ascending (A-Z by origin) | Alphabetic |

**Default sort:** Varies by report. Revenue reports sort by revenue descending. Conversion reports sort by conversion rate descending. Lane profitability sorts by margin descending.

### Saved Filters / Presets

- **System presets:** "This Month vs Last" (default), "Quarterly Review" (this_quarter, comparison=last_quarter), "Year to Date" (this_year)
- **User-created presets:** Users can save report configuration (report type + date range + filters) as a named preset.
- **URL sync:** All parameters reflected in URL for sharing specific reports.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Report tabs: Horizontal scroll if all 5 do not fit
- KPI cards: 2 per row (2 rows of 2)
- Charts: stack vertically (full-width each) instead of side-by-side
- Filters: Collapse to "Filters" button opening slide-over
- Detail tables: horizontal scroll for wide tables
- Export buttons: collapse into "Export" dropdown menu
- Sidebar collapses to icon-only mode

### Mobile (< 768px)

- Report tabs: Dropdown select instead of tab bar
- KPI cards: 2 per row, compact
- Charts: single column, swipe between charts (carousel)
- Filters: Full-screen filter modal
- Detail tables: card-based view (one card per row)
- Export: full-screen modal with format selection
- Schedule: full-screen modal
- Chart interactions: tap instead of hover for tooltips
- Pull-to-refresh to regenerate report

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout, side-by-side charts, tab bar, 4 KPI cards in row |
| Desktop | 1024px - 1439px | Same layout, slightly compressed |
| Tablet | 768px - 1023px | Stacked charts, 2-column KPIs, scrollable tabs |
| Mobile | < 768px | Dropdown report select, chart carousel, card-based tables |

---

## 14. Stitch Prompt

```
Design a sales reports page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." Show the Quote Conversion report.

Layout: Full-width page with dark slate-900 sidebar (240px). Content area with page header showing breadcrumb "Sales > Reports", title "Sales Reports" in semibold 24px. Right side: "This Month" date range dropdown with calendar icon, "vs Last Month" comparison badge in gray-100, "Export PDF" outline button with file icon, "Export Excel" outline button with sheet icon, and a "Schedule" outline button with clock icon.

Report Tabs: Below header, a tab bar with 5 tabs: "Quote Conversion" (active, blue-600 underline and text), "Revenue by Rep", "Revenue by Customer", "Lane Profitability", "Pipeline Forecast". Each inactive tab in gray-500.

Filters: Below tabs, a compact filter row: Agent dropdown "All Agents", Customer dropdown "All Customers", Service Type "All Types", Equipment "All Equipment". Below filters, a subtle gray-100 bar showing active filter summary: "Showing: All Data | Feb 01 - Feb 28, 2026 vs Jan 01 - Jan 31, 2026"

KPI Cards: 4 cards in horizontal row:
- Card 1: "Total Quotes" value "186" in bold text-2xl, "+8%" in green-600 with up arrow, "vs 172 last month" in gray-400 text-xs
- Card 2: "Converted" value "65" in bold, "+12%" in green-600, "vs 58 last month"
- Card 3: "Conversion Rate" value "34.9%" in bold, "-3.1 pts" in red-500 with down arrow, "vs 38.0% last month"
- Card 4: "Avg Days to Close" value "4.2" in bold, "-0.8d" in green-600 with down arrow (lower is better), "vs 5.0 last month"

Charts Row (50/50 split):
- Left: "Conversion Rate Over Time" line chart in white card. Two lines: solid blue-600 line for "This Month" and dashed gray-400 line for "Last Month". X-axis shows weeks (W1, W2, W3, W4). Y-axis shows percentage (25%-45%). Current line trends from 36% to 33% (declining). Comparison line relatively flat at 38%. Subtle grid lines. Legend below chart.
- Right: "Quote Funnel" horizontal funnel chart in white card. 7 stages decreasing left to right: Draft (186, gray-400), Sent (142, blue-500), Viewed (98, purple-500), Accepted (65, green-500), Converted (58, emerald-500), Rejected (44, red-400), Expired (24, amber-400). Drop-off percentages between stages shown as small text.

Agent Breakdown: Full-width white card titled "Conversion by Agent". Horizontal bar chart with 4 agents:
- James Wilson: long green-500 bar at 42.5%, label "28/66 quotes" right of bar
- Sarah Mitchell: slightly shorter blue-500 bar at 38.2%, "21/55"
- Mike Daniels: medium bar at 35.0%, "14/40"
- Lisa Torres: short red-400 bar at 15.4%, "2/13", with an amber warning icon and "Below target" label
A vertical dashed line at 30% marks the "Target" threshold.

Detail Table: Full-width white card titled "Detailed Breakdown". Table with columns:
- Agent | Total Quotes | Sent | Viewed | Accepted | Rejected | Expired | Conversion Rate
Show 4 data rows matching the bar chart plus a bold total row at bottom.
Each row is clickable (cursor-pointer, hover state).

Design Specifications:
- Font: Inter, 14px base, 13px chart labels, 24px title
- Sidebar: slate-900, "Reports" active with blue-600 indicator
- Content bg: slate-50, cards white with border-slate-200
- Primary: blue-600 for active tab, primary lines, links
- KPI values: text-2xl font-bold text-slate-900
- Comparison indicators: green-600 for positive (or positive direction), red-500 for negative
- Chart colors: blue-600 (primary line), gray-400 (comparison line), status-specific colors for funnel
- Bar chart: rounded-sm bar ends, labels in slate-600, target line in dashed red-300
- Table: white bg, slate-200 border-b, gray-50 hover, total row in gray-50 bg with font-bold
- Tab underline: 2px blue-600 with smooth transition
- Active filter summary bar: gray-100 bg, text-sm, rounded-md
- Export buttons: outline style with subtle hover:bg-gray-50
- Chart cards: include small action icons in top-right (full-screen, download)
- Modern SaaS aesthetic similar to Mixpanel, Amplitude, or HubSpot reporting
- Show realistic freight industry data throughout
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- Nothing -- screen is Not Started.

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] 5 report tabs with navigation
- [ ] Date range selector with presets and custom range
- [ ] Comparison period display
- [ ] KPI summary cards per report with comparison indicators
- [ ] Quote Conversion report: line chart, funnel chart, agent bar chart, detail table
- [ ] Revenue by Rep report: bar chart, revenue over time, detail table
- [ ] Revenue by Customer report: bar chart, pie chart, detail table
- [ ] Lane Profitability report: margin analysis chart, top/bottom lanes table
- [ ] Pipeline Forecast report: stacked bar, forecast line, detail table
- [ ] Filter bar (agent, customer, service type, equipment)
- [ ] Chart drill-down navigation to Quotes List
- [ ] Export to PDF and Excel
- [ ] Role-based data scoping
- [ ] URL state sync for all parameters

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Quote Conversion report (charts + table) | High | High | P0 |
| Date range selector with comparison | High | Medium | P0 |
| KPI summary cards with comparisons | High | Medium | P0 |
| Revenue by Rep report | High | High | P0 |
| Revenue by Customer report | High | High | P0 |
| Export to PDF/Excel | High | Medium | P0 |
| Filter bar | High | Medium | P0 |
| Lane Profitability report | Medium | High | P1 |
| Pipeline Forecast report | Medium | High | P1 |
| Chart drill-down navigation | Medium | Medium | P1 |
| Role-based data scoping | High | Medium | P1 |
| URL state sync | Medium | Low | P1 |
| Scheduled report delivery | Medium | High | P2 |
| Report bookmarks/presets | Low | Medium | P2 |
| Goal tracking overlay | Low | Medium | P2 |
| Win/loss reason analysis | Medium | Medium | P2 |
| Lane profitability heatmap | Low | High | P3 |
| Cohort analysis | Low | High | P3 |

### Future Wave Preview

- **Wave 2:** AI-powered insights ("Your conversion rate dropped 3.1 points this month, primarily driven by Lisa Torres's performance on reefer lanes. Recommendation: review reefer pricing for competitiveness."). Automated anomaly detection alerts. Predictive revenue forecasting with machine learning.
- **Wave 3:** Board-level executive dashboards with roll-up metrics across all brokerages. Customer-facing analytics portal (show customers their shipping spend trends). Integration with accounting data for true profitability analysis (including carrier costs, not just customer revenue).

---

<!--
DESIGN NOTES:
1. Sales Reports is the most chart-heavy screen in the Sales service. Choose a chart library (Recharts recommended) that supports all chart types: line, bar, horizontal bar, pie/donut, funnel, stacked bar, area.
2. Report generation can be slow for large date ranges. Progressive loading and caching are essential.
3. The comparison period feature is critical for business users. They always ask "how does this compare to last month/quarter?"
4. Drill-down from charts to the Quotes List is a key workflow. Every clickable chart element must navigate with appropriate filters pre-applied.
5. Export to PDF must include charts as rendered images. This requires server-side chart rendering or client-side canvas capture.
6. The Pipeline Forecast report uses weighted probabilities. The formula (SENT=30%, VIEWED=50%, ACCEPTED=90%) should be configurable in admin settings.
7. Agent performance comparison is politically sensitive. Consider allowing managers to view but not share agent-level reports unless the agent's consent is given (or company policy permits it).
-->
