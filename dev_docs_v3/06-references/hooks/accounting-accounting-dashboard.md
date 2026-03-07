# useAccountingDashboard (accounting)

**File:** `apps/web/lib/hooks/accounting/use-accounting-dashboard.ts`
**LOC:** 106

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useAccountingKPIs` | `(params?: DashboardParams) => UseQueryResult<AccountingKPIs>` |
| `useRecentInvoices` | `(params?: { limit?: number }) => UseQueryResult<Invoice[]>` |
| `useRevenueChart` | `(params?: ChartParams) => UseQueryResult<RevenueChartData>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useAccountingKPIs | GET | /accounting/dashboard/kpis | AccountingKPIs |
| useRecentInvoices | GET | /accounting/dashboard/recent-invoices | Invoice[] |
| useRevenueChart | GET | /accounting/dashboard/revenue-chart | RevenueChartData |

## Envelope Handling

Returns raw apiClient responses. No explicit envelope unwrap -- may receive `{ data: T }` envelope without extraction.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["accounting", "dashboard", "kpis", params]` | default | Always |
| `["accounting", "dashboard", "recent-invoices", params]` | default | Always |
| `["accounting", "dashboard", "revenue-chart", params]` | default | Always |

## Mutations

None -- read-only dashboard hooks.

## Quality Assessment

- **Score:** 6/10
- **Anti-patterns:**
  - Dashboard endpoint `/accounting/dashboard` may not exist yet (QS-003 task)
  - No `staleTime` for dashboard data that doesn't need real-time freshness
  - No error handling for missing endpoint -- will silently fail with default React Query error
- **Dependencies:** `apiClient`, types from accounting module
