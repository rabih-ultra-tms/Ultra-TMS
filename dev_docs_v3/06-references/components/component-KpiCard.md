# KpiCard (StatCard)

**File:** `apps/web/components/tms/stats/kpi-card.tsx`
**LOC:** 109

## Props Interface

```typescript
interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon element (renders in header) */
  icon?: React.ReactNode;
  /** Metric label (uppercase, small text) */
  label: string;
  /** Metric value (large, bold) */
  value: string | number;
  /** Trend direction */
  trend?: "up" | "down" | "neutral";
  /** Trend label text (e.g. "+12%", "-5%") */
  trendLabel?: string;
  /** Subtext below value */
  subtext?: string;
  /** Show skeleton loading state */
  loading?: boolean;
}
```

## Behavior

Dashboard metric card with three sections:
1. **Header**: icon (16px muted) + label (11px uppercase, tracking-wider, muted)
2. **Value + Trend**: value (24px bold) + trend indicator (icon + colored label)
3. **Subtext**: optional 11px muted text

### Trend Colors

- `up` -- `text-success` + TrendingUp icon
- `down` -- `text-danger` + TrendingDown icon
- `neutral` -- `text-text-muted` + Minus icon

### Loading State

When `loading=true`, renders `Skeleton` components matching the layout:
- Icon skeleton (4x4 rounded)
- Label skeleton (16px wide)
- Value skeleton (20px wide)
- Trend skeleton (12px wide)
- Subtext skeleton (24px wide)

## Used By

- Operations dashboard (`ops-kpi-cards.tsx`)
- Accounting dashboard (`acc-dashboard-stats.tsx`)
- Commission dashboard (`commission-dashboard-stats.tsx`)
- Load board dashboard (`lb-dashboard-stats.tsx`)

## Design Tokens

- Container: `p-4 rounded-lg border border-border bg-surface`
- Transitions: `transition-colors duration-200`
- Inherits HTML div attributes for custom styling

## Known Issues

None. Clean, well-documented component.
