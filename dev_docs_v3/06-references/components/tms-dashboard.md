# TMS Dashboard Components

**Location:** `apps/web/components/tms/dashboard/`
**Component count:** 5

## Components

### OpsActivityFeed
- **File:** `ops-activity-feed.tsx`
- **Props:** Activities array, limit
- **Used by:** Operations dashboard
- **Description:** Real-time activity feed showing recent operational events (load created, status changed, carrier assigned, etc.). Scrollable list with timestamps and action links.

### OpsAlertsPanel
- **File:** `ops-alerts-panel.tsx`
- **Props:** Alerts array
- **Used by:** Operations dashboard
- **Description:** Alert panel showing items needing attention: overdue check calls, upcoming appointments, at-risk loads, missing documents. Each alert links to the relevant detail page.

### OpsCharts
- **File:** `ops-charts.tsx`
- **Props:** Chart data, date range
- **Used by:** Operations dashboard
- **Description:** Chart components for operations metrics visualization. Includes load volume over time, revenue trends, and status distribution charts.

### OpsKpiCards
- **File:** `ops-kpi-cards.tsx`
- **Props:** KPI data object
- **Used by:** Operations dashboard
- **Description:** Top-level KPI cards for the operations dashboard. Shows metrics like total loads, in-transit count, on-time delivery rate, and revenue.

### OpsNeedsAttention
- **File:** `ops-needs-attention.tsx`
- **Props:** Items needing attention
- **Used by:** Operations dashboard
- **Description:** Priority list of items requiring immediate dispatcher attention. Groups by urgency level with action buttons for each item.
