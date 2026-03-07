# Operations Dashboard

**Route:** `/operations`
**File:** `apps/web/app/(dashboard)/operations/page.tsx`
**LOC:** 189
**Status:** Complete

## Data Flow

- **Hooks:** `useDashboardLiveUpdates(period, scope, comparison)` (`lib/hooks/tms/use-ops-dashboard`), `useCurrentUser` (`lib/hooks/use-auth`)
- **API calls:** Via `useDashboardLiveUpdates` -- subscribes to WebSocket `/dispatch` namespace for real-time updates
- **Envelope:** Stats data managed by hook internally

## UI Components

- **Pattern:** Custom (KPI dashboard with real-time updates)
- **Key components:** SocketProvider (`/dispatch`), OpsKPICards, OpsCharts, OpsAlertsPanel, OpsActivityFeed, OpsNeedsAttention
- **Interactive elements:** "New Order" button, "Dispatch Board" button, "Tracking Map" button (all raw `<button>` not shadcn Button), period toggle (today/thisWeek/thisMonth), comparison period select, KPI card click handlers (navigate to filtered loads). All wired.

## State Management

- **URL params:** None
- **React Query keys:** None directly -- managed by `useDashboardLiveUpdates` hook
- **Local state:** `period` (Period type), `comparison` (ComparisonPeriod type)
- **Scope:** Derived from user roles -- `team` for Admin/Ops Manager, `personal` for others

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None critical
- **Anti-patterns:**
  - Uses raw `<button>` with hardcoded `bg-blue-600` instead of shadcn Button component -- design system violation
  - Period toggle uses inline conditional classes instead of a proper toggle component
  - `hover:bg-gray-50` hardcoded -- won't work in dark mode
- **Missing:** Loading states handled per-component. WebSocket connection via SocketProvider. Error states handled per-component. No page-level error boundary.
