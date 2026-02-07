# 09 - Data Visualization Strategy

> Comprehensive guide for all data visualizations, KPI calculations, chart types, map integrations, and dashboard layouts used across Ultra TMS.

---

## KPI Card Definitions

KPI cards are the primary at-a-glance metrics displayed at the top of dashboards and module screens. Each card shows a single metric with optional comparison to previous period.

### Card Layout Standard
- **Size:** Fixed height (120px), flexible width (min 200px)
- **Content:** Label, primary value, trend indicator (up/down arrow), comparison text (e.g., "+12% vs last month")
- **Interaction:** Click to drill down into the underlying data
- **Loading State:** Skeleton placeholder while data loads
- **Error State:** "Unable to load" with retry link

### KPI Definitions & Formulas

#### 1. Active Loads
```
COUNT(loads WHERE status IN ('DISPATCHED', 'IN_TRANSIT', 'AT_PICKUP', 'AT_DELIVERY', 'PICKED_UP'))
```
- **Display Format:** Whole number (e.g., "142")
- **Trend:** Compare to same count 24 hours ago
- **Drill Down:** Opens Loads list filtered to active statuses
- **Refresh:** Real-time (WebSocket updates)

#### 2. On-Time Delivery %
```
(COUNT(loads WHERE delivered_at <= scheduled_delivery_date AND status = 'DELIVERED')
 / COUNT(loads WHERE status = 'DELIVERED')) * 100
```
- **Display Format:** Percentage with 1 decimal (e.g., "94.2%")
- **Period:** Rolling 30 days (configurable)
- **Trend:** Compare to previous 30-day period
- **Drill Down:** Opens Loads list showing delivered loads with on-time/late indicators
- **Color Coding:** Green >= 95%, Yellow 90-94%, Red < 90%

#### 3. Average Margin %
```
AVG((customer_rate - carrier_rate) / customer_rate * 100)
-- For delivered loads in the selected period
```
- **Display Format:** Percentage with 1 decimal (e.g., "18.5%")
- **Period:** Current month
- **Trend:** Compare to previous month
- **Drill Down:** Opens financial summary by load
- **Color Coding:** Green >= 15%, Yellow 10-14%, Red < 10%

#### 4. Revenue MTD (Month-To-Date)
```
SUM(customer_rate) WHERE status = 'DELIVERED'
  AND delivered_at >= first_day_of_current_month
  AND delivered_at <= now()
```
- **Display Format:** Currency (e.g., "$1,234,567")
- **Trend:** Compare to same period last month (e.g., "first 15 days of last month")
- **Drill Down:** Opens revenue breakdown report
- **Additional:** Show daily run rate (Revenue MTD / days elapsed) and projected month-end

#### 5. Loads Today
```
COUNT(loads WHERE DATE(dispatched_at) = CURRENT_DATE)
```
- **Display Format:** Whole number (e.g., "23")
- **Trend:** Compare to same day last week
- **Drill Down:** Opens today's dispatch report
- **Refresh:** Real-time

#### 6. Open Orders
```
COUNT(orders WHERE status IN ('PENDING', 'CONFIRMED'))
```
- **Display Format:** Whole number (e.g., "37")
- **Trend:** Compare to 24 hours ago
- **Drill Down:** Opens Orders list filtered to open statuses
- **Alert:** Red badge if count exceeds threshold (configurable, default: 50)

#### 7. Carrier Compliance %
```
(COUNT(carriers WHERE insurance_valid = true
  AND authority_status = 'ACTIVE'
  AND safety_rating IN ('SATISFACTORY', 'NONE'))
 / COUNT(carriers WHERE status = 'ACTIVE')) * 100
```
- **Display Format:** Percentage with 1 decimal (e.g., "97.3%")
- **Trend:** Compare to previous month
- **Drill Down:** Opens carrier compliance dashboard
- **Color Coding:** Green >= 95%, Yellow 90-94%, Red < 90%

#### 8. DSO (Days Sales Outstanding)
```
(accounts_receivable_balance / total_credit_sales_in_period) * number_of_days_in_period
-- Typically calculated for trailing 90-day period
```
- **Display Format:** Whole number with "days" label (e.g., "34 days")
- **Trend:** Compare to previous quarter
- **Drill Down:** Opens AR aging report
- **Color Coding:** Green <= 30, Yellow 31-45, Red > 45

#### 9. Quote Win Rate
```
(COUNT(quotes WHERE status = 'ACCEPTED')
 / COUNT(quotes WHERE status IN ('ACCEPTED', 'REJECTED', 'EXPIRED'))) * 100
-- Excludes quotes still pending
```
- **Display Format:** Percentage with 1 decimal (e.g., "42.1%")
- **Period:** Rolling 30 days
- **Trend:** Compare to previous 30-day period
- **Drill Down:** Opens quotes list with outcome breakdown
- **Color Coding:** Green >= 40%, Yellow 25-39%, Red < 25%

#### 10. Average Load Value
```
AVG(customer_rate) WHERE status = 'DELIVERED'
  AND delivered_at >= first_day_of_current_month
```
- **Display Format:** Currency (e.g., "$2,450")
- **Trend:** Compare to previous month average
- **Drill Down:** Opens load value distribution chart
- **Additional Context:** Show min/max alongside average

---

## Chart Types & Usage Guidelines

### When to Use Each Chart Type

#### Line Chart
- **Purpose:** Show trends and changes over time
- **Best For:** Revenue trends, load volume over time, on-time percentage over months, margin trends
- **Data Requirements:** Time-series data with at least 5 data points
- **Avoid When:** Fewer than 3 data points or non-sequential data
- **Variants:** Single line, multi-line (comparison), line with area fill

```
Use Cases:
- Monthly revenue trend (12 months)
- Weekly load volume (52 weeks)
- Daily on-time delivery % (30 days)
- Margin % trend over quarters
```

#### Bar Chart
- **Purpose:** Compare discrete categories
- **Best For:** Revenue by sales rep, loads by carrier, volume by lane, performance by dispatcher
- **Data Requirements:** Categorical data, ideally 3-15 categories
- **Avoid When:** More than 20 categories (use table instead)
- **Variants:** Vertical bar, horizontal bar (for long labels)

```
Use Cases:
- Top 10 customers by revenue
- Loads by equipment type
- Revenue by sales rep
- Loads per day of week
```

#### Pie / Donut Chart
- **Purpose:** Show composition/proportion of a whole
- **Best For:** Loads by status, revenue by service type, loads by equipment type
- **Data Requirements:** 2-7 categories that sum to a meaningful total
- **Avoid When:** More than 7 categories, when exact comparison matters more than proportion
- **Preference:** Donut over pie (cleaner, center can show total)

```
Use Cases:
- Load status distribution
- Revenue by equipment type
- Loads by customer (top 5 + "Other")
- Payment method distribution
```

#### Stacked Bar Chart
- **Purpose:** Show multi-category breakdown with totals
- **Best For:** Revenue vs cost by month, loads by status over time
- **Data Requirements:** Time series with 2-5 sub-categories
- **Avoid When:** More than 5 sub-categories (becomes unreadable)

```
Use Cases:
- Monthly revenue vs carrier cost (stacked or grouped)
- Loads by status by week
- Revenue by service type by quarter
```

#### Area Chart
- **Purpose:** Show volume trends with visual emphasis on magnitude
- **Best For:** Cumulative load volume, revenue accumulation, capacity trends
- **Data Requirements:** Time-series data where area/volume matters
- **Avoid When:** Multiple overlapping series (use line chart instead)

```
Use Cases:
- Cumulative revenue (month-to-date)
- Load volume trend with fill
- Capacity utilization over time
```

#### Heatmap
- **Purpose:** Show intensity/density across two dimensions
- **Best For:** Geographic load density, lane volume, hourly activity patterns
- **Data Requirements:** Matrix data or geographic coordinates
- **Avoid When:** Fewer than 10 data points

```
Use Cases:
- Load volume by origin state x destination state
- Dispatch activity by hour x day of week
- Lane volume heatmap on map
```

#### Gauge Chart
- **Purpose:** Show single metric progress toward a target
- **Best For:** On-time %, sales quota progress, compliance percentage
- **Data Requirements:** Single value with known min/max/target
- **Avoid When:** No meaningful target exists

```
Use Cases:
- On-time delivery % vs 95% target
- Monthly revenue vs quota
- Carrier compliance vs 100%
- Quote win rate vs target
```

---

## Map Visualizations

### Map Technology
- **Provider:** Google Maps API or Mapbox GL JS (Mapbox recommended for custom styling)
- **Integration:** React wrapper component (`react-map-gl` for Mapbox or `@react-google-maps/api`)
- **Default View:** Continental US centered (lat: 39.8283, lng: -98.5795, zoom: 4)

### Map Layer Types

#### Pin Markers (Load/Truck Locations)
```
Purpose: Show current position of loads and trucks
Color Coding by Status:
  - Blue: DISPATCHED (awaiting pickup)
  - Orange: AT_PICKUP (at origin facility)
  - Green: IN_TRANSIT (moving)
  - Purple: AT_DELIVERY (at destination)
  - Red: EXCEPTION (issue reported)
  - Gray: DELIVERED (completed)

Marker Content (on hover/click):
  - Load number
  - Status
  - Origin → Destination
  - Carrier name
  - ETA
  - Last update timestamp
```

#### Route Lines (Active Load Routes)
```
Purpose: Show planned and actual routes for loads
Implementation: Polylines from origin to destination

Visual Encoding:
  - Solid line: Planned route
  - Dashed line: Actual route (from tracking data)
  - Line color: Matches status color
  - Line weight: 3px standard, 5px when selected/hovered

Multi-stop Routes:
  - Waypoints shown as smaller markers
  - Route segments connect each stop sequentially
```

#### Cluster Markers
```
Purpose: Aggregate overlapping markers at low zoom levels
Implementation: Marker clustering library (Supercluster)

Behavior:
  - Shows count inside cluster circle
  - Circle size proportional to count
  - Click to zoom into cluster
  - At close zoom, clusters break into individual markers

Color: Use gradient (green for few, yellow for moderate, red for many)
```

#### Geofence Circles
```
Purpose: Show facility boundaries for automatic check-in/check-out
Implementation: Circle overlay on map

Visual:
  - Semi-transparent fill (10% opacity)
  - Colored border (2px)
  - Radius configurable per facility (default: 0.5 mile)
  - Color: Blue for pickup locations, green for delivery locations
```

#### Heatmap Overlay
```
Purpose: Show lane density and hot spots
Implementation: Heatmap layer using load origin/destination data

Visual:
  - Gradient: Blue (low) → Green → Yellow → Red (high)
  - Intensity based on load count
  - Adjustable radius and intensity
  - Toggle on/off via map controls
```

#### ETA Lines (Projected Routes)
```
Purpose: Show projected remaining route to destination
Implementation: Dashed polyline from current position to destination

Visual:
  - Dashed line (8px dash, 4px gap)
  - Color: Green if on schedule, yellow if tight, red if late
  - Tooltip on line: Estimated arrival time, remaining miles, remaining hours
```

### Map Controls & Interactions
- **Zoom:** Mouse wheel, pinch, +/- buttons
- **Pan:** Click and drag
- **Search:** Location search bar (geocoding)
- **Layers Toggle:** Sidebar checkboxes to show/hide each layer type
- **Filter:** Filter visible markers by status, carrier, customer, equipment type
- **Full Screen:** Toggle full-screen map mode
- **Refresh:** Manual refresh button + auto-refresh interval (configurable, default: 60s)

---

## Dashboard Layouts by Role

### Operations Dashboard

```
Layout: 3-column grid with map emphasis

Row 1 (KPI Cards - 5 across):
  [Active Loads] [In Transit] [At Pickup] [Exceptions] [On-Time %]

Row 2 (2/3 + 1/3 split):
  [Live Map Widget - 2/3 width]  [Loads by Status - Donut chart - 1/3 width]

Row 3 (1/2 + 1/2 split):
  [Today's Dispatch Table]  [Exceptions/Alerts List]

Row 4 (Full width):
  [Revenue Trend - Line Chart - Last 30 days]
```

**Key Interactions:**
- Click map marker to open load details drawer
- Click KPI card to drill into filtered list
- Click exception to open resolution workflow
- Auto-refresh every 60 seconds

### Sales Dashboard

```
Layout: Metric-heavy top, charts middle, tables bottom

Row 1 (KPI Cards - 5 across):
  [Revenue MTD] [Quotes Sent] [Win Rate] [New Customers] [Pipeline Value]

Row 2 (1/2 + 1/2 split):
  [Revenue by Rep - Bar Chart]  [Conversion Funnel - Funnel Chart]

Row 3 (1/2 + 1/2 split):
  [Revenue Trend - Line Chart]  [Top Customers - Horizontal Bar]

Row 4 (Full width):
  [Recent Quotes Table - Last 20 quotes with status]
```

**Key Interactions:**
- Filter all widgets by sales rep
- Click customer name to open customer detail
- Click quote to open quote detail
- Date range selector for all charts

### Accounting Dashboard

```
Layout: Financial metrics focus

Row 1 (KPI Cards - 5 across):
  [Revenue MTD] [AR Outstanding] [DSO] [Open Invoices] [Payments Received MTD]

Row 2 (Full width):
  [AR Aging Summary - Stacked Bar by customer, top 10]

Row 3 (1/2 + 1/2 split):
  [Revenue vs Cost Trend - Dual Line Chart]  [Payment Trend - Bar Chart - Last 6 months]

Row 4 (1/2 + 1/2 split):
  [Top Customers by Outstanding Balance - Table]  [Carrier Payables Summary - Table]
```

**Key Interactions:**
- Click aging bucket to see invoices in that range
- Click customer to open customer accounting view
- Export any chart/table to CSV or PDF
- Date range and customer filters

### Carrier Dashboard

```
Layout: Compliance-focused with performance metrics

Row 1 (KPI Cards - 5 across):
  [Active Carriers] [Compliance %] [Expiring Insurance] [Avg Carrier Score] [Loads This Month]

Row 2 (1/2 + 1/2 split):
  [Carrier Tier Distribution - Donut Chart]  [Expiring Documents Timeline - Gantt/Timeline]

Row 3 (1/2 + 1/2 split):
  [Top Carriers by Load Volume - Bar Chart]  [On-Time by Carrier - Bar Chart (top 10)]

Row 4 (Full width):
  [Carrier Compliance Table - carriers with issues highlighted red]
```

**Key Interactions:**
- Click carrier name to open carrier detail
- Click expiring insurance to open compliance alert
- Filter by tier, equipment type, or region
- Bulk actions on non-compliant carriers

### Executive Dashboard

```
Layout: High-level strategic overview

Row 1 (KPI Cards - 6 across):
  [Revenue MTD] [Margin %] [Load Volume] [On-Time %] [DSO] [Active Customers]

Row 2 (2/3 + 1/3 split):
  [Revenue & Margin Trend - Dual Axis Line Chart - 12 months]  [Revenue by Service Type - Donut]

Row 3 (1/2 + 1/2 split):
  [Load Volume Trend - Area Chart - 12 months]  [Customer Growth - Line Chart]

Row 4 (1/2 + 1/2 split):
  [Top 10 Lanes by Revenue - Table]  [Top 10 Customers by Revenue - Horizontal Bar]

Row 5 (Full width):
  [Geographic Revenue Heatmap - US Map]
```

**Key Interactions:**
- All charts support date range comparison (this year vs last year)
- Click any metric to drill down into detail report
- Export entire dashboard as PDF
- Schedule dashboard email delivery (daily/weekly/monthly)

---

## Chart Library & Implementation

### Recommended Library: Recharts

```bash
npm install recharts
```

**Why Recharts:**
- Built specifically for React (composable components)
- Excellent Next.js compatibility
- Declarative API matches React patterns
- Built-in responsive container
- Good TypeScript support
- Active maintenance and community
- Lightweight compared to alternatives

**Alternative (if more customization needed):**
```bash
npm install chart.js react-chartjs-2
```

### Map Library

```bash
npm install react-map-gl mapbox-gl
# or
npm install @react-google-maps/api
```

### Wrapper Component Pattern

All charts should be wrapped in a standard component that provides:
- Loading skeleton state
- Error boundary with retry
- Empty state ("No data available")
- Responsive container
- Consistent padding and margins
- Title and subtitle
- Download/export button
- Full-screen toggle

```tsx
// Conceptual structure for chart wrapper
<ChartCard
  title="Revenue Trend"
  subtitle="Last 12 months"
  loading={isLoading}
  error={error}
  onRetry={refetch}
  exportable
  fullScreenable
>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      {/* Chart configuration */}
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

---

## Color Palette for Charts

### Primary Data Series
Use these colors in order for multi-series charts:

| Order | Color | Tailwind Class | Hex | Usage |
|-------|-------|----------------|-----|-------|
| 1st | Blue | blue-500 | #3B82F6 | Primary series |
| 2nd | Indigo | indigo-500 | #6366F1 | Secondary series |
| 3rd | Violet | violet-500 | #8B5CF6 | Tertiary series |
| 4th | Cyan | cyan-500 | #06B6D4 | Fourth series |
| 5th | Teal | teal-500 | #14B8A6 | Fifth series |
| 6th | Sky | sky-500 | #0EA5E9 | Sixth series |

### Semantic Colors
| Purpose | Color | Tailwind Class | Hex |
|---------|-------|----------------|-----|
| Success / Growth / Positive | Green | green-500 | #22C55E |
| Warning / Caution / Declining | Amber | amber-500 | #F59E0B |
| Danger / Error / Critical | Red | red-500 | #EF4444 |
| Neutral / Inactive | Gray | gray-400 | #9CA3AF |

### Chart-Specific Color Rules

#### Status Colors in Charts
Must match the global status color system (see `03-status-color-system.md`):
- Pending: Gray
- Dispatched: Blue
- In Transit: Green
- Delivered: Emerald
- Cancelled: Red
- Exception: Amber

#### Financial Charts
- Revenue: Blue-500
- Cost: Red-400
- Margin/Profit: Green-500
- Target Line: Gray dashed

#### Comparison Charts (This Period vs Last Period)
- Current period: Blue-500 (solid)
- Previous period: Blue-300 (dashed or lighter)

### Accessibility Requirements
- All color distinctions must also use shape/pattern differences for colorblind users
- Minimum contrast ratio of 3:1 between adjacent chart segments
- Tooltips must be keyboard accessible
- Screen reader labels on all chart elements
- Provide data table alternative for every chart (toggle view)

---

## Data Refresh Strategy

| Dashboard | Default Refresh | Method |
|-----------|-----------------|--------|
| Operations | 60 seconds | WebSocket for real-time updates, polling for aggregations |
| Sales | 5 minutes | Polling |
| Accounting | 15 minutes | Polling |
| Carrier | 5 minutes | Polling |
| Executive | 15 minutes | Polling |

### Manual Refresh
- Global refresh button in dashboard header
- Individual chart refresh via chart card menu
- Pull-to-refresh on mobile (if applicable)

### Caching
- KPI calculations cached server-side (Redis) with TTL matching refresh interval
- Chart data responses cached with appropriate headers
- Stale-while-revalidate pattern for smooth UX during refreshes

---

## Responsive Behavior

### Desktop (>= 1280px)
- Full multi-column grid layout as defined above
- All charts at full size
- Map widget at large size

### Tablet (768px - 1279px)
- KPI cards wrap to 3 per row (then 2 per row below 900px)
- Charts stack to single column
- Map widget full width
- Tables scroll horizontally

### Mobile (< 768px)
- KPI cards stack to 2 per row (swipeable carousel option)
- All charts full width, stacked vertically
- Map widget full width with collapsed controls
- Simplified chart versions (fewer data points, larger touch targets)
- Tables show condensed view with expandable rows

---

## Performance Guidelines

- **Lazy load charts:** Only render charts when they scroll into viewport (Intersection Observer)
- **Limit data points:** Charts should display max 100 data points; aggregate beyond that
- **Server-side aggregation:** Never send raw data to the client for aggregation; compute summaries server-side
- **Skeleton loading:** Show chart skeleton during data fetch (not blank space)
- **Error boundaries:** Each chart wrapped in error boundary to prevent cascade failures
- **Memoization:** Memoize chart data transformations to avoid re-renders
- **Virtual scrolling:** For tables within dashboards exceeding 50 rows
