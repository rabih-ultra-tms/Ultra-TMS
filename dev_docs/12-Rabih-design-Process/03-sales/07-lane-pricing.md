# Lane Pricing -- Lane-Specific Rates with Market Data

> Service: Sales (03) | Wave: 1 | Priority: P1
> Route: /sales/lane-pricing | Status: Not Started
> Primary Personas: James Wilson (Sales Agent), Sales Manager
> Roles with Access: super_admin, admin, sales_manager, sales_agent

---

## 1. Purpose & Business Context

**What this screen does:**
The Lane Pricing screen is the competitive intelligence hub for the sales team. It displays a comprehensive list of origin-destination lane pairs alongside current contract rates from rate tables, real-time market rates from DAT and Truckstop.com (low, average, high), historical rate trend sparklines, and shipment volume indicators. Sales agents use it to quickly check pricing competitiveness before quoting; sales managers use it to identify market shifts, under-priced lanes, and pricing opportunities.

**Business problem it solves:**
In freight brokerage, pricing varies dramatically by lane, season, equipment type, and market conditions. A rate that was competitive last month might be 15% above market today due to capacity shifts. Without centralized lane pricing intelligence, sales agents either (a) quote blind using stale spreadsheet rates and lose deals to competitors, or (b) spend 5-10 minutes per quote manually checking DAT and Truckstop for market rates. The Lane Pricing screen eliminates both problems by presenting a unified view of contract and market rates for every lane the brokerage services, updated in near-real-time.

**Key business rules:**
- Market rates are sourced from DAT RateView and Truckstop.com Rate Insight APIs. Data is cached for 1 hour per lane-equipment combination.
- Contract rates come from the active rate tables in the system. If multiple rate tables apply (customer-specific vs. global), the highest-priority rate is shown with a "Source" indicator.
- The "Volume" indicator shows how many loads were moved on this lane in the last 30/60/90 days (configurable), sourced from TMS Core order history.
- Rate trend sparklines show the market rate average for the last 90 days, plotted weekly.
- Lanes are derived from: (a) existing rate table entries, (b) lanes from historical quotes, and (c) lanes from completed orders. The system aggregates these into a deduplicated lane list.
- Sales agents see all lane pricing data. This is read-only -- no rate modification from this screen.
- Market rate data may be delayed or unavailable for low-volume or unusual lanes. The UI must gracefully handle missing data.
- Users can click any lane to view detailed pricing history, or click "Create Quote" to start a new quote pre-filled with the lane.

**Success metric:**
Time for a sales agent to verify pricing competitiveness for a lane drops from 5-10 minutes (manual DAT/Truckstop lookup) to under 5 seconds. Percentage of quotes within 10% of market average increases from 70% to 95%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Lane Pricing" under Sales section | None |
| Quote Builder | Clicks "View Lane Pricing" for competitive context | ?origin=Chicago,IL&destination=Dallas,TX&equipment=DRY_VAN |
| Quote Detail | Clicks lane pricing link in market rate section | ?origin=&destination=&equipment= |
| Rate Table Editor | Clicks "View Lane Pricing" on a specific lane entry | ?origin=&destination=&equipment= |
| Sales Dashboard | Clicks lane-related metric or market trend alert | None or lane filter params |
| Direct URL | Bookmark / shared link | Filter params in URL |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Quote Builder | Clicks "Create Quote" on a lane row | ?origin=&destination=&equipment= (pre-fills quote form) |
| Lane Pricing Detail (modal/drawer) | Clicks lane row for detailed history | origin, destination, equipment |
| Rate Table Editor | Clicks "View Rate Table" link on contract rate | rateTableId |
| Customer Detail (CRM) | Clicks customer name in customer-specific rate view | customerId |

**Primary trigger:**
James is about to call a customer to follow up on a quote for the Chicago-to-Dallas dry van lane. Before dialing, he opens Lane Pricing and filters to this lane. He sees that the current market average is $2,350 and his contract rate is $2,450 (+4.3% above market). The trend sparkline shows market rates have been rising for the last 3 weeks, confirming his rate is still competitive. He confidently makes the call knowing his pricing is strong. Alternatively, the Sales Manager reviews Lane Pricing weekly to spot lanes where contract rates have drifted more than 10% from market -- flagging them for rate table updates.

**Success criteria (user completes the screen when):**
- User has reviewed pricing data for the lane(s) they are interested in.
- User understands how contract rates compare to current market rates.
- User has identified pricing opportunities or risks that need action.
- User has optionally navigated to create a quote or update a rate table.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Top Bar: [Sales] > Lane Pricing                                        |
|                                    [Refresh Market Rates] [Create Quote]|
+------------------------------------------------------------------------+
|                                                                        |
|  +----------+  +----------+  +-----------+  +----------+              |
|  | Total    |  | Above    |  | At Market |  | Below    |              |
|  | Lanes    |  | Market   |  | (+/- 5%)  |  | Market   |              |
|  |   342    |  |   128    |  |    156    |  |    58    |              |
|  +----------+  +----------+  +-----------+  +----------+              |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | Filters: [Origin State v] [Dest State v] [Equipment v]            |  |
|  |          [Customer v] [Volume v] [Market Variance v]              |  |
|  |          [Search origin or destination................]            |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | Origin       | Dest         | Equip | Contract | Market Rates    |  |
|  |              |              |       | Rate     | Low | Avg | High|  |
|  |              |              |       |          |              Var |  |
|  |              |              |       |          | Trend | Vol     |  |
|  |--------------|--------------|-------|----------|-----------------|  |
|  | Chicago, IL  | Dallas, TX   | DV    | $2.48/mi | $2.10 $2.35 $2.80|
|  |              |              |       | Acme Tbl | +5.5% ^^^^^^^  |  |
|  |              |              |       |          | 90d trend | 42 |  |
|  |--------------|--------------|-------|----------|-----------------|  |
|  | Chicago, IL  | Atlanta, GA  | DV    | $2.22/mi | $2.05 $2.18 $2.55|
|  |              |              |       | Global   | +1.8% ^^^^^^^  |  |
|  |              |              |       |          | 90d trend | 28 |  |
|  |--------------|--------------|-------|----------|-----------------|  |
|  | LA, CA       | Phoenix, AZ  | RF    | $5.04/mi | $4.80 $5.16 $5.65|
|  |              |              |       | Beta Tbl | -2.3% vvvvvvv  |  |
|  |              |              |       |          | 90d trend | 15 |  |
|  |--------------|--------------|-------|----------|-----------------|  |
|  | Dallas, TX   | Memphis, TN  | DV    |   --     | $2.30 $2.50 $2.85|
|  |              |              |       | No rate  |  N/A  ^^^^^^^  |  |
|  |              |              |       |          | 90d trend |  8 |  |
|  +------------------------------------------------------------------+  |
|  |  Showing 1-25 of 342        [< Prev] [1][2]...[14] [Next >]      |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Lane (origin -> destination), equipment type, contract rate, market average | Agent needs at-a-glance competitive positioning for any lane |
| **Secondary** (visible but less prominent) | Market rate range (low/high), variance percentage, trend sparkline, volume indicator | Context that informs whether current pricing is trending well or needs adjustment |
| **Tertiary** (available on hover or expand) | Rate table source, customer-specific rate vs. global rate, last updated timestamp, full trend chart | Deeper detail for managers analyzing pricing strategy |
| **Hidden** (behind a click -- detail modal) | 90-day historical rate chart, quote history for this lane, rate table entry detail, customer list using this lane | Deep analysis accessed on demand |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Origin | LanePricing.originCity + originState | "City, ST" format, bold | Table column 1 |
| 2 | Destination | LanePricing.destCity + destState | "City, ST" format | Table column 2 |
| 3 | Equipment | LanePricing.equipmentType | Badge: DV, RF, FB, SD, PO | Table column 3 |
| 4 | Contract Rate | RateTableEntry.ratePerMile or flatRate | "$X.XX/mi" or "$X,XXX flat", font-mono | Table column 4 |
| 5 | Rate Table Source | RateTable.name | Small gray text below contract rate: "Acme Tbl" or "Global" | Below contract rate |
| 6 | Market Rate Low | External API (DAT/Truckstop) | "$X.XX" in gray-500 | Table column 5, left |
| 7 | Market Rate Avg | External API | "$X.XX" in font-medium | Table column 5, center |
| 8 | Market Rate High | External API | "$X.XX" in gray-500 | Table column 5, right |
| 9 | Market Variance | Calculated | "+X.X%" or "-X.X%" color-coded | Below market avg |
| 10 | Rate Trend | Historical market data | Sparkline chart (90-day, weekly data points) | Table column 6 |
| 11 | Volume | Order history | Integer count with "loads" label, 30-day window | Table column 7 |
| 12 | Last Updated | Market rate timestamp | "Xh ago" or "Xd ago" tooltip on hover | Not visible directly (tooltip on market data) |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Market Variance | (contractRate - marketRateAvg) / marketRateAvg * 100 | Percentage, green if +, red if -, gray if no contract rate |
| 2 | Trend Direction | Slope of last 4 weeks of market rate averages | Up arrow (green), down arrow (red), flat arrow (gray) |
| 3 | Volume Category | 30-day load count: High (>20), Medium (5-20), Low (<5) | Color indicator on volume badge |
| 4 | Pricing Risk | Contract rate >15% below market OR market trending up while contract is flat | "Risk" amber badge on affected lanes |
| 5 | Has Contract Rate | Boolean check if an active rate table covers this lane | "Yes" with source or "--" with "No rate" label |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Paginated data table with 25 rows per page (options: 10, 25, 50, 100)
- [ ] Column sorting on all sortable columns
- [ ] Origin state filter (multi-select from US states)
- [ ] Destination state filter (multi-select from US states)
- [ ] Equipment type filter (multi-select: DRY_VAN, REEFER, FLATBED, STEP_DECK, POWER_ONLY)
- [ ] Customer filter (show lanes with customer-specific contract rates)
- [ ] Text search across origin city/state, destination city/state
- [ ] Contract rate column showing rate from active rate table (or "--" if none)
- [ ] Market rate columns (low, avg, high) from DAT/Truckstop
- [ ] Market variance percentage (contract vs. market avg, color-coded)
- [ ] Rate trend sparklines (90-day weekly market averages)
- [ ] Volume indicator (30-day load count per lane)
- [ ] "Create Quote" row action to start a quote pre-filled with lane data
- [ ] "Refresh Market Rates" button to update cached market data
- [ ] 4 summary stat cards (total lanes, above market, at market, below market)
- [ ] Click-through to lane detail modal with full history
- [ ] URL state sync for all filters

### Advanced Features (Logistics Expert Recommendations)

- [ ] Market variance filter (show only lanes >10% above/below market)
- [ ] Volume filter (show only high-volume, medium, or low-volume lanes)
- [ ] Heatmap view: color-coded US map showing pricing density and market variance by region
- [ ] Rate alert setup: configure alerts when market rates shift >X% on specific lanes
- [ ] Lane comparison: select 2-3 lanes and view side-by-side pricing detail
- [ ] Historical chart drill-down: click sparkline to see full 90-day/180-day/1-year chart in modal
- [ ] Export to CSV/Excel with all visible data
- [ ] "Uncovered lanes" filter: show lanes with order history but no contract rate
- [ ] Rate table recommendations: "You have 12 high-volume lanes without contract rates"
- [ ] Customer overlay: toggle to show customer-specific rates alongside global rates
- [ ] Seasonal pattern detection in trend data

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View lane pricing | any authenticated | lane_pricing_view | Screen not accessible |
| View contract rates | sales_agent, sales_manager, admin | rate_table_view | Contract rate column shows "--" |
| View market rates | sales_agent, sales_manager, admin | market_rates_view | Market rate columns hidden |
| Create quote from lane | sales_agent, sales_manager | quote_create | "Create Quote" action hidden |
| View volume data | sales_agent, sales_manager, admin | order_view | Volume column shows "--" |
| Configure rate alerts | sales_manager, admin | rate_table_manage | Alert configuration hidden |

---

## 6. Status & State Machine

### Status Indicators (Per Lane Row)

Lane Pricing does not have a traditional status machine. Instead, each lane has derived indicators:

```
[HAS_CONTRACT] -- Lane has an active rate table entry
[NO_CONTRACT]  -- Lane exists in order/quote history but has no rate table entry
[ABOVE_MARKET] -- Contract rate is >5% above market average
[AT_MARKET]    -- Contract rate is within +/-5% of market average
[BELOW_MARKET] -- Contract rate is >5% below market average
[NO_MARKET]    -- Market rate data unavailable for this lane
[HIGH_VOLUME]  -- 20+ loads in last 30 days
[LOW_VOLUME]   -- <5 loads in last 30 days
[TRENDING_UP]  -- Market rates trending upward over last 4 weeks
[TRENDING_DOWN]-- Market rates trending downward over last 4 weeks
```

### Market Variance Indicator Colors

| Indicator | Background | Text | Tailwind Classes |
|---|---|---|---|
| Above Market (>+5%) | green-100 | green-800 | `bg-green-100 text-green-800` |
| At Market (+/-5%) | gray-100 | gray-700 | `bg-gray-100 text-gray-700` |
| Below Market (>-5%) | red-100 | red-800 | `bg-red-100 text-red-800` |
| No Contract Rate | gray-50 | gray-400 | `bg-gray-50 text-gray-400 italic` |
| No Market Data | gray-50 | gray-400 | `bg-gray-50 text-gray-400 italic` |

### Volume Indicator Colors

| Volume Level | Dot Color | Tailwind |
|---|---|---|
| High (>20 loads) | green-500 | `bg-green-500` |
| Medium (5-20 loads) | amber-500 | `bg-amber-500` |
| Low (<5 loads) | gray-300 | `bg-gray-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Refresh Market Rates | RefreshCw | Secondary / Outline | Fetches latest market rates for all visible lanes | No |
| Create Quote | Plus | Primary / Blue | Opens Quote Builder with no lane pre-filled (general creation) | No |

### Secondary Actions (Per-Row)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Create Quote | Plus | Opens Quote Builder pre-filled with origin, destination, equipment | Always |
| View Detail | ChevronRight | Opens lane detail modal/drawer with full pricing history | Always |
| View Rate Table | ExternalLink | Navigates to Rate Table Editor for the source rate table | Lane has contract rate |
| Set Alert | Bell | Opens alert configuration for this lane | User has rate_table_manage permission |

### Bulk Actions

N/A -- Lane Pricing is a read-only reference screen. No bulk modifications.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search |
| R | Refresh market rates |
| Arrow Up/Down | Navigate table rows |
| Enter | Open lane detail for selected row |
| Q | Create quote from selected lane |
| / | Focus search input |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | N/A | No drag-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| rate.market.updated | { lane, equipmentType, newRates } | Update market rate cells for matching lane, flash highlight |

### Live Update Behavior

- **Update frequency:** Market rates are cached for 1 hour. WebSocket pushes updates when the backend refreshes rates. Manual refresh available via button.
- **Visual indicator:** Updated lanes flash with subtle blue highlight. "Last updated" timestamp updates.
- **Rate trend:** Sparklines update on page load only (historical data does not change in real-time).

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds
- **Endpoint:** `GET /api/v1/lane-pricing?updatedSince={lastPollTimestamp}&{currentFilters}`
- **Visual indicator:** "Live updates paused -- reconnecting..." banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Refresh market rates | Show "Refreshing..." spinner on button and in market rate cells | Remove spinners, show error toast: "Could not refresh market rates" |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting |
| PageHeader | src/components/layout/page-header.tsx | title: "Lane Pricing", breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |
| StatsCard | src/components/ui/stats-card.tsx | value, label, trend |
| Badge | src/components/ui/badge.tsx | Equipment badges, variance badges |
| Button | src/components/ui/button.tsx | Action buttons |
| Tooltip | src/components/ui/tooltip.tsx | Market rate details, last updated |
| Skeleton | src/components/ui/skeleton.tsx | Loading states |
| Sheet | src/components/ui/sheet.tsx | Lane detail side panel |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic sort and pagination | Add sparkline column renderer, market rate range display, variance coloring |
| FilterBar | Basic filters | Add state-based origin/destination filters (US state multi-select) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| MarketRateRange | Display low/avg/high in a compact row with avg emphasized, and contract rate position marker | Medium |
| RateTrendSparkline | Tiny inline chart (60px wide) showing 90-day weekly market rate trend | Medium |
| VolumeIndicator | Dot indicator with count showing lane volume category (high/medium/low) | Small |
| MarketVarianceBadge | Percentage badge with color coding (green above, gray at, red below) | Small |
| LaneDetailDrawer | Side drawer showing full pricing history, chart, quote history, and rate table info for a lane | High |
| LanePricingChart | Full-size chart (in drawer) with market rate history, contract rate overlay, and volume bars | High |
| StateMultiSelect | US state multi-select dropdown with state grouping (regions) and search | Medium |
| RateAlertDialog | Dialog for configuring price alert thresholds and notification preferences per lane | Medium |
| LaneDisplay | "Origin -> Destination" compact display with arrow icon | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Sheet | sheet | Lane detail side panel |
| Popover | popover | Market rate detail hover |
| Tooltip | tooltip | Sparkline data points, volume detail |
| Badge | badge | Equipment, variance, volume badges |
| Select | select | State filters, equipment filter |
| ScrollArea | scroll-area | Lane detail drawer content |
| Separator | separator | Section dividers in detail drawer |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/lane-pricing | List lanes with contract and market rates, pagination, filters | useLanePricing(filters, pagination, sort) |
| 2 | GET | /api/v1/lane-pricing/:laneId | Get detailed pricing history for a specific lane | useLanePricingDetail(laneId) |
| 3 | GET | /api/v1/lane-pricing/:laneId/history | Get historical market rate data (90/180/365 days) | useLaneRateHistory(laneId, days) |
| 4 | GET | /api/v1/lane-pricing/:laneId/quotes | Get quote history for this lane | useLaneQuoteHistory(laneId) |
| 5 | POST | /api/v1/lane-pricing/refresh | Trigger market rate refresh for visible lanes | useRefreshMarketRates() |
| 6 | GET | /api/v1/quotes/market-rates?origin=&dest=&equipment= | Single lane market rate lookup | useMarketRates(origin, dest, equipment) |
| 7 | GET | /api/v1/rate-tables/match?origin=&dest=&equipment=&customerId= | Find matching rate table entry | useRateTableMatch(params) |
| 8 | GET | /api/v1/lane-pricing/stats | Get summary stats (total lanes, above/at/below market counts) | useLanePricingStats(filters) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| rates:{tenantId} | rate.market.updated | useLanePricingUpdates() -- updates market rate cells for matching lanes |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/lane-pricing | Show filter error toast | Redirect to login | Show "Access Denied" page | N/A | Show error state with retry |
| POST /refresh | N/A | Redirect to login | Show "Permission Denied" toast | N/A | Show "Market rate refresh failed" toast |
| GET /lane-pricing/:laneId | N/A | Redirect to login | Show "Access Denied" in drawer | Show "Lane not found" in drawer | Show error in drawer with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 4 skeleton stat cards, skeleton filter bar, and table with 8 skeleton rows. Sparkline placeholders as thin gray rectangles.
- **Progressive loading:** Table structure renders first with lane names (from cached data). Market rates fill in progressively as API responses arrive.
- **Market rate loading:** Shimmer animation in market rate cells while fetching. Sparklines show thin gray placeholder bars.
- **Duration threshold:** If loading exceeds 5 seconds, show "Loading market rates is taking longer than usual..." above the table.

### Empty States

**First-time empty (no lanes in system):**
- **Illustration:** Map/route illustration
- **Headline:** "No lane pricing data yet"
- **Description:** "Lane pricing data is populated from your rate tables, quotes, and completed orders. Create a rate table or quote to start building your lane pricing intelligence."
- **CTA Buttons:** "Create Rate Table" (primary), "Create Quote" (secondary outline)

**Filtered empty (data exists but filters exclude all):**
- **Headline:** "No lanes match your filters"
- **Description:** "Try adjusting your origin, destination, or equipment filters."
- **CTA Button:** "Clear All Filters" -- secondary outline button

**No market data for a lane:**
- **Display:** Market rate cells show "N/A" in gray-400 italic. Sparkline shows "No data" in small text. Variance shows "--".
- **Tooltip:** "Market rate data is not available for this lane. This may be a low-volume or specialized route."

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load lane pricing data" + Retry button

**Market rate refresh error:**
- **Display:** Toast: "Market rates could not be refreshed. Showing cached data from [time]." Table continues to show cached values.

**Partial data (some lanes missing market data):**
- **Display:** Lanes with data show normally. Lanes without market data show "N/A" in market columns. Count indicator: "Market data available for 280 of 342 lanes."

### Permission Denied

- **Full page denied:** Show "You don't have permission to view lane pricing" with link to Sales Dashboard
- **Partial denied:** Market rate columns hidden if user lacks market_rates_view. Contract rate column hidden if user lacks rate_table_view.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached data from [timestamp]. Market rates may be outdated."
- **Market rate API down:** Banner: "Market rate data is temporarily unavailable. Contract rates and historical data are still accessible."

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Origin State | Multi-select | All 50 US states + DC | All | ?originState=IL,TX,CA |
| 2 | Destination State | Multi-select | All 50 US states + DC | All | ?destState=TX,GA,AZ |
| 3 | Equipment Type | Multi-select | DRY_VAN, REEFER, FLATBED, STEP_DECK, POWER_ONLY | All | ?equipmentType= |
| 4 | Customer | Searchable select | From /api/v1/customers + "All (Global)" | All | ?customerId= |
| 5 | Market Variance | Range / select | Above Market (>+5%), At Market (+/-5%), Below Market (>-5%) | All | ?variance= |
| 6 | Volume | Select | High (>20), Medium (5-20), Low (<5), All | All | ?volume= |
| 7 | Has Contract Rate | Toggle | Yes / No / All | All | ?hasContractRate= |

### Search Behavior

- **Search field:** Single search input in the filter bar
- **Searches across:** Origin city, origin state, destination city, destination state
- **Behavior:** Debounced 300ms, minimum 2 characters, searches both origin and destination simultaneously
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Origin | Ascending (A-Z) | Alphabetic by state, then city |
| Destination | Ascending (A-Z) | Alphabetic by state, then city |
| Equipment | Ascending | Alphabetic |
| Contract Rate | Descending (highest first) | Numeric |
| Market Rate Avg | Descending (highest first) | Numeric |
| Market Variance | Ascending (most below market first, highlighting risk) | Numeric |
| Volume | Descending (highest first) | Numeric |

**Default sort:** Volume descending (highest-volume lanes first, showing the most important lanes at the top).

### Saved Filters / Presets

- **System presets:** "High Volume Lanes" (volume=High), "Below Market" (variance=Below Market), "Uncovered Lanes" (hasContractRate=No), "Reefer Lanes" (equipment=REEFER)
- **User-created presets:** Users can save current filter combination with a custom name.
- **URL sync:** All filter state reflected in URL query params for sharing.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stat cards: 2 per row (2 rows of 2)
- Table columns: Hide sparkline, volume; keep origin, destination, equipment, contract rate, market avg, variance
- Market rate range: show only avg (low/high on hover tooltip)
- Filter bar: Collapse to "Filters" button that opens slide-over
- Sidebar collapses to icon-only mode

### Mobile (< 768px)

- Stat cards: 2 per row, compact size
- Table switches to card-based list (one card per lane)
- Each card shows: Origin -> Destination with arrow, equipment badge, contract rate, market avg, variance badge
- Tap card to expand showing market range, sparkline, volume
- Filter: Full-screen filter modal
- "Create Quote" in sticky bottom bar
- Pull-to-refresh triggers market rate refresh
- Sparklines: visible in expanded card view only

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full table with all columns including sparkline and volume |
| Desktop | 1024px - 1439px | Same layout, sparkline may be narrower |
| Tablet | 768px - 1023px | Reduced columns, market range condensed |
| Mobile | < 768px | Card-based list, sparklines in expanded view only |

---

## 14. Stitch Prompt

```
Design a lane pricing intelligence page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar on the left (240px). White content area on the right. Page header with breadcrumb "Sales > Lane Pricing", title "Lane Pricing" in semibold 24px. Right side: "Refresh Market Rates" outline button with refresh icon and small "Updated 15m ago" text below it, and a blue-600 "Create Quote" primary button with plus icon.

Stats Row: Below header, 4 stat cards in a horizontal row:
- Card 1: "Total Lanes" value "342" with a route icon
- Card 2: "Above Market" value "128" with a green-500 up-arrow icon, green-50 card background
- Card 3: "At Market" value "156" with a gray-400 equal icon
- Card 4: "Below Market" value "58" with a red-500 down-arrow icon, subtle red-50 card background to highlight risk

Filter Bar: White card with filters:
- Origin State multi-select showing "All Origins"
- Destination State multi-select showing "All Destinations"
- Equipment Type dropdown showing "All Equipment"
- Customer dropdown showing "All Customers"
- Search input with placeholder "Search lanes..."
- Saved presets row: "High Volume" (blue-100), "Below Market" (red-100), "Uncovered" (amber-100)

Data Table: White card with columns:
- Origin: city, state in font-medium
- Destination: city, state
- Equipment: abbreviated badge (DV, RF, FB)
- Contract Rate: "$X.XX/mi" in font-mono, with small gray text below showing source table name
- Market Rates: Three sub-columns showing Low (gray-400), Avg (font-medium, darker), High (gray-400)
- Variance: percentage badge showing contract vs. market (+5.5% in green-100/green-800, -2.3% in red-100/red-800)
- Trend: tiny sparkline chart (60px wide, 20px tall) showing 90-day rate trend in blue-400 line
- Volume: number with colored dot (green for high, amber for medium, gray for low)

Show 6 rows:
Row 1: Chicago, IL | Dallas, TX | DV | $2.48/mi (Acme Tbl) | $2.10 $2.35 $2.80 | +5.5% (green) | sparkline-up | 42 (green dot)
Row 2: Chicago, IL | Atlanta, GA | DV | $2.22/mi (Global) | $2.05 $2.18 $2.55 | +1.8% (green) | sparkline-flat | 28 (green dot)
Row 3: Los Angeles, CA | Phoenix, AZ | RF | $5.04/mi (Beta Tbl) | $4.80 $5.16 $5.65 | -2.3% (red) | sparkline-down | 15 (amber dot)
Row 4: Dallas, TX | Memphis, TN | DV | -- (No rate) | $2.30 $2.50 $2.85 | N/A | sparkline-up | 8 (amber dot)
Row 5: Atlanta, GA | Miami, FL | DV | $2.85/mi (Global) | $2.60 $2.75 $3.10 | +3.6% (green) | sparkline-flat | 35 (green dot)
Row 6: Seattle, WA | Portland, OR | FB | $3.20/mi (National) | $3.40 $3.55 $3.80 | -9.9% (red) | sparkline-up | 3 (gray dot)

Row 6 should have a subtle red-50 background since it is significantly below market.

Each row has a right-chevron icon on hover indicating it can be clicked for detail.

Design Specifications:
- Font: Inter, 14px base, 13px table body, 24px title
- Sidebar: slate-900, "Lane Pricing" active with blue-600 indicator
- Content bg: slate-50, cards white with border-slate-200
- Primary: blue-600 for buttons, links
- Contract rate: font-mono, tabular-nums
- Market rates: font-mono, tabular-nums, avg in font-medium text-slate-900, low/high in text-slate-400
- Variance badges: green-100/green-800 for above market, red-100/red-800 for below, gray-100/gray-700 for at market
- Sparklines: 60px wide, 20px tall, blue-400 line, no axes, filled area in blue-100
- Volume dots: 8px circles, green-500/amber-500/gray-300
- Rows below market by >8%: subtle red-50 row background
- Hover state: gray-50 background, right-chevron icon appears
- Modern SaaS aesthetic similar to Linear.app or Datadog dashboard
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- Nothing -- screen is Not Started.

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Data table with lane pairs, contract rates, and pagination
- [ ] Market rate columns (low/avg/high) with DAT/Truckstop integration
- [ ] Market variance calculation and color-coded display
- [ ] Rate trend sparklines (90-day weekly data)
- [ ] Volume indicator from order history
- [ ] Origin/destination state filters
- [ ] Equipment type filter
- [ ] Search across origin and destination
- [ ] 4 summary stat cards with click-to-filter
- [ ] "Create Quote" row action with lane pre-fill
- [ ] "Refresh Market Rates" button
- [ ] Lane detail drawer with full history
- [ ] URL state sync for filters

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Lane list with contract rates | High | Medium | P0 |
| Market rate integration (DAT/Truckstop) | High | High | P0 |
| Market variance display | High | Low | P0 |
| Filter bar (origin, dest, equipment) | High | Medium | P0 |
| "Create Quote" from lane | High | Low | P0 |
| Rate trend sparklines | High | Medium | P1 |
| Volume indicators | Medium | Medium | P1 |
| Lane detail drawer | Medium | High | P1 |
| Stat cards with click-to-filter | Medium | Low | P1 |
| Search functionality | Medium | Low | P1 |
| Market variance filter | Medium | Low | P1 |
| Export to CSV | Low | Low | P2 |
| Heatmap view | Low | High | P2 |
| Rate alert configuration | Low | High | P2 |
| Seasonal pattern detection | Low | High | P3 |

### Future Wave Preview

- **Wave 2:** AI-powered lane pricing recommendations ("Optimal rate for this lane: $2.38/mi based on win rate and market position"). Automated under-priced lane alerts sent to sales managers. Dynamic rate table updates suggested from market trends.
- **Wave 3:** Predictive rate forecasting ("Market rates for CHI-DAL expected to increase 5-8% in the next 2 weeks due to produce season"). Integration with carrier capacity data for supply-demand visualization. Multi-modal rate comparison (truck vs. rail vs. intermodal).

---

<!--
DESIGN NOTES:
1. Lane Pricing is a read-only intelligence screen. No rate modifications happen here -- that is done in Rate Table Editor.
2. The sparkline is the most visually distinctive feature. It gives instant trend context without clicking into a detail view.
3. Market rate data availability varies by lane. The UI must gracefully handle N/A states for low-volume or unusual routes.
4. The "Below Market" stat card and red-highlighted rows are critical for sales manager workflow. They surface pricing risks that need immediate attention.
5. Performance consideration: market rate fetching for 200+ lanes can be slow. Use progressive loading and cache aggressively.
6. The "Create Quote" quick action from a lane row is a key efficiency feature -- it eliminates re-typing lane data.
-->
