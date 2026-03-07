# TMS Stats Components

**Location:** `apps/web/components/tms/stats/`
**Component count:** 4 (3 components + 1 barrel)

## Components

### KpiCard
- **File:** `kpi-card.tsx`
- **Props:** Label, value, trend (up/down/neutral), trendValue, icon, color
- **Used by:** Dashboard KPI strips, dispatch stats
- **Description:** Individual KPI metric card with label, large value, trend indicator with percentage, and optional icon. Uses design token colors for trend visualization.

### StatItem
- **File:** `stat-item.tsx`
- **Props:** Label, value, color
- **Used by:** StatsBar
- **Description:** Compact inline stat display showing a label and value. Used as items within the horizontal StatsBar component.

### StatsBar
- **File:** `stats-bar.tsx`
- **Props:** Stats items array
- **Used by:** Dispatch board toolbar, operations pages
- **Description:** Horizontal bar of StatItem components showing quick-glance metrics. Typically appears below the toolbar in list/board views. Responsive -- wraps on smaller screens.

### index.ts
- **File:** `index.ts`
- **Description:** Barrel exports for KpiCard, StatItem, StatsBar
