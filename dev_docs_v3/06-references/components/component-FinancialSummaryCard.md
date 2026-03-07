# FinancialSummaryCard

**File:** `apps/web/components/tms/shared/financial-summary-card.tsx`
**LOC:** 66

## Props Interface

```typescript
interface FinancialSummaryCardProps {
  revenue: number;
  cost: number;
  margin: number;
  currency?: string;    // Default: "USD"
}
```

## Behavior

Card displaying financial breakdown for loads/orders:

- **Revenue**: Formatted currency value
- **Cost**: Formatted currency value
- **Margin**: Calculated margin with percentage
  - Positive: green text + TrendingUp icon
  - Negative: red text + TrendingDown icon
  - Percentage: `(margin / revenue) * 100`, shown below margin amount

### Currency Formatting

```typescript
new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
```

## Used By

- Load detail pages (finance tab)
- Order detail pages (financial section)
- Dispatch detail drawer (finance tab)

## Dependencies

- `@/components/ui/` (Card, CardHeader, CardTitle, CardContent)
- Lucide icons (TrendingUp, TrendingDown)

## Known Issues

Uses hardcoded color classes (`text-green-600`, `text-red-600`) instead of design tokens (`text-success`, `text-danger`). Should be migrated to token-based colors for consistency.
