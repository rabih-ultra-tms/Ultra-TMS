# useOpsDashboard (TMS)

**File:** `apps/web/lib/hooks/tms/use-ops-dashboard.ts`
**LOC:** 276

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useOpsDashboardKPIs` | `(params?: DashboardParams) => UseQueryResult<DashboardKPIs>` |
| `useOpsDashboardLoads` | `(params?: DashboardParams) => UseQueryResult<DashboardLoad[]>` |
| `useOpsDashboardAlerts` | `() => UseQueryResult<DashboardAlert[]>` |
| `useOpsDashboardRevenue` | `(params?: RevenueParams) => UseQueryResult<RevenueData>` |
| `useOpsDashboardActivity` | `(params?: ActivityParams) => UseQueryResult<ActivityFeed[]>` |
| `useOpsDashboardLiveUpdates` | `() => void` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useOpsDashboardKPIs | GET | /dashboard/operations/kpis | DashboardKPIs |
| useOpsDashboardLoads | GET | /dashboard/operations/loads | DashboardLoad[] |
| useOpsDashboardAlerts | GET | /dashboard/operations/alerts | DashboardAlert[] |
| useOpsDashboardRevenue | GET | /dashboard/operations/revenue | RevenueData |
| useOpsDashboardActivity | GET | /dashboard/operations/activity | ActivityFeed[] |
| useOpsDashboardLiveUpdates | WS | /dispatch namespace | void (side effect) |

## Envelope Handling

Returns raw apiClient responses. No explicit envelope unwrap on any query.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["ops-dashboard", "kpis", params]` | default | Always |
| `["ops-dashboard", "loads", params]` | default | Always |
| `["ops-dashboard", "alerts"]` | default | Always |
| `["ops-dashboard", "revenue", params]` | default | Always |
| `["ops-dashboard", "activity", params]` | default | Always |

## Mutations

None -- read-only with WebSocket live updates.

## WebSocket Integration

`useOpsDashboardLiveUpdates` connects to the `/dispatch` WebSocket namespace via `useSocket` from `@/lib/socket/socket-provider`. Listens for events:
- `load:updated` -- invalidates loads + KPIs queries
- `load:created` -- invalidates loads + KPIs queries
- `alert:new` -- invalidates alerts query

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - 5 separate queries on mount with no staleTime -- hammers the API on every dashboard visit
  - WebSocket event handler invalidates queries but doesn't use `setQueryData` for instant updates
  - No error boundaries for individual dashboard widgets
  - Dashboard endpoints may not all exist yet (QS-003 task)
- **Dependencies:** `apiClient`, `useSocket` from `@/lib/socket/socket-provider`, `useQueryClient`
