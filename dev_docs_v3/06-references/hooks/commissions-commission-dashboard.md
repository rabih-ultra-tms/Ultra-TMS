# useCommissionDashboard (commissions)

**File:** `apps/web/lib/hooks/commissions/use-commission-dashboard.ts`
**LOC:** 61

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useCommissionKPIs` | `() => UseQueryResult<CommissionKPIs>` |
| `useCommissionTrends` | `(params?: TrendParams) => UseQueryResult<CommissionTrend[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useCommissionKPIs | GET | /commissions/dashboard/kpis | CommissionKPIs |
| useCommissionTrends | GET | /commissions/dashboard/trends | CommissionTrend[] |

## Envelope Handling

Returns raw apiClient responses. No explicit envelope unwrap.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["commissions", "dashboard", "kpis"]` | default | Always |
| `["commissions", "dashboard", "trends", params]` | default | Always |

## Mutations

None -- read-only dashboard hooks.

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - No `staleTime` for dashboard KPIs that change infrequently
  - Small hook (61 LOC) -- could be merged into `use-plans.ts` or similar
- **Dependencies:** `apiClient`, types from commissions module
