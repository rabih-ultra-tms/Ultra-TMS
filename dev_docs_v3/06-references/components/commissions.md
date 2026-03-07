# Commissions Components

**Path:** `apps/web/components/commissions/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| CommissionDashboardStats | `commission-dashboard-stats.tsx` | 87 | Dashboard stat cards (total earned, pending, paid out, active plans) |
| CommissionPlanCard | `commission-plan-card.tsx` | 97 | Card displaying a commission plan with tier structure |
| CommissionPlanForm | `commission-plan-form.tsx` | 431 | Full commission plan create/edit form with tier editor |
| EarningsChart | `earnings-chart.tsx` | 229 | Chart visualization of earnings over time |
| PayoutDetailCard | `payout-detail-card.tsx` | 171 | Detailed payout view with breakdown by load |
| PayoutTable | `payout-table.tsx` | 104 | Data table listing payouts with status and amounts |
| RepCommissionsTable | `rep-commissions-table.tsx` | 90 | Per-rep commissions breakdown table |
| RepDetailCard | `rep-detail-card.tsx` | 182 | Sales rep detail card with earnings summary and active plan |
| TierEditor | `tier-editor.tsx` | 137 | Inline tier threshold editor for commission plans |
| TransactionsTable | `transactions-table.tsx` | 234 | Data table of commission transactions with filters |

**Total:** 10 files, ~1,762 LOC

## Usage Patterns

Used in `(dashboard)/commissions/` route group:
- `/commissions` - Dashboard with `CommissionDashboardStats` + `EarningsChart`
- `/commissions/plans` - `CommissionPlanCard` list
- `/commissions/plans/new` - `CommissionPlanForm` + `TierEditor`
- `/commissions/plans/[id]` - `CommissionPlanForm` (edit)
- `/commissions/payouts` - `PayoutTable`
- `/commissions/payouts/[id]` - `PayoutDetailCard`
- `/commissions/reps` - `RepCommissionsTable`
- `/commissions/reps/[id]` - `RepDetailCard`
- `/commissions/transactions` - `TransactionsTable`

## Dependencies

- `@/components/ui/` (shadcn: Card, Table, Chart, Badge, Button)
- `@/lib/hooks/commissions/` for data fetching
- `EarningsChart` likely uses Recharts or a similar charting library
- `CommissionPlanForm` uses React Hook Form + Zod
