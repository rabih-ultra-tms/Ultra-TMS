# BLD-001: Operations Dashboard

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations`
**Page file:** `apps/web/app/(dashboard)/operations/page.tsx`

## Current State
Fully built (189 LOC). Uses `SocketProvider` with `/dispatch` namespace. Renders KPI cards (`OpsKPICards`), charts (`OpsCharts`), alerts panel, activity feed, and needs-attention section. Period toggle (today/thisWeek/thisMonth) with comparison selector. Quick action buttons for New Order, Dispatch Board, and Tracking Map. Role-based scope detection (team vs personal). Uses `useDashboardLiveUpdates` hook for real-time data.

## Requirements
- Verify all sub-components render real data from backend (not mocked)
- Ensure WebSocket namespace `/dispatch` is implemented server-side (depends on QS-001)
- KPI card click handlers navigate to filtered load/order lists
- Comparison period toggle drives delta calculations

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] WebSocket connection establishes and receives live updates
- [ ] KPI cards show accurate data matching backend calculations

## Dependencies
- Backend: `GET /accounting/dashboard` (QS-003), WebSocket `/dispatch` namespace (QS-001)
- Hook: `apps/web/lib/hooks/tms/use-ops-dashboard.ts`
- Components: `OpsKPICards`, `OpsCharts`, `OpsAlertsPanel`, `OpsActivityFeed`, `OpsNeedsAttention`

## Estimated Effort
M
