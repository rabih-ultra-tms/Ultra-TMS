# Stat Card Components

There are multiple stat/KPI card components across the codebase.

---

## 1. KPIStatCards (Loads)

**File:** `apps/web/components/tms/loads/kpi-stat-cards.tsx`
**Lines:** 84
**Exports:** `KPIStatCards`

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| stats | `LoadStats` | No | - | Load statistics object with total, byStatus, totalRevenueCents |
| isLoading | `boolean` | No | - | Shows "..." instead of values when loading |

### Cards Rendered

| Card | Value Source | Trend | Color |
|------|-------------|-------|-------|
| Total Loads | `stats.total` (fallback: 847) | Up | Default foreground |
| Unassigned | `stats.byStatus.PENDING` (fallback: 23) | Down | Red-600 |
| In Transit | `stats.byStatus.IN_TRANSIT` (fallback: 234) | Up | Blue-600 |
| Delivered Today | `stats.byStatus.DELIVERED` (fallback: 56) | Up | Green-600 |
| Total Revenue | `stats.totalRevenueCents / 100` formatted | Up | Default foreground |

### Layout

5-column grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`

### Used By

- `app/(dashboard)/operations/loads/page.tsx`

---

## 2. KpiCard (TMS Stats)

**File:** `apps/web/components/tms/stats/kpi-card.tsx`
**Location:** `apps/web/components/tms/stats/`

Generic KPI card component in the TMS design system stats package.

---

## 3. StatItem (TMS Stats)

**File:** `apps/web/components/tms/stats/stat-item.tsx`
**Location:** `apps/web/components/tms/stats/`

Individual stat display item used in stats bars.

---

## 4. StatsBar (TMS Stats)

**File:** `apps/web/components/tms/stats/stats-bar.tsx`
**Location:** `apps/web/components/tms/stats/`

Horizontal bar of stat items, used in dispatch and operations dashboards.

---

## 5. PerformanceMetricCard (Carriers)

**File:** `apps/web/components/carriers/scorecard/performance-metric-card.tsx`

Carrier-specific performance metric display card used in carrier scorecards.

---

## Implementation Notes

- KPIStatCards uses hardcoded fallback values (847, 234, etc.) which is a code smell -- should show empty/zero state instead
- Trend indicators use ArrowUp/ArrowDown from Lucide but are currently static (not calculated from actual trend data)
- Revenue display converts from cents to dollars with locale formatting
- All cards use shadcn/ui Card + CardContent primitives

## Quality Assessment

**KPIStatCards Rating: 5/10**
- TypeScript: Proper interface but relies on `LoadStats` type
- Hardcoded fallbacks mask missing data -- should show 0 or skeleton instead
- Trend arrows are decorative (hardcoded), not data-driven
- No error handling or empty state
- Uses string interpolation for className instead of `cn()` utility
