# BLD-006: Loads List

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/loads`
**Page file:** `apps/web/app/(dashboard)/operations/loads/page.tsx`

## Current State
Fully built (147 LOC). Uses `useLoads` and `useLoadStats` hooks. Features KPI stat cards, filter bar, data table with row click (opens side drawer), edit and view-details actions. Column visibility settings via floating gear button. Pagination via `TablePagination`. URL-driven query params. Title says "Dispatch Board" (may be intentional or a naming issue vs the actual dispatch route).

## Requirements
- Verify `useLoads` and `useLoadStats` hooks connect to backend
- Column visibility state is local only -- consider persisting to localStorage or user preferences
- Page title "Dispatch Board" may conflict with actual `/operations/dispatch` route
- LoadDrawer for quick-view on row click

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Side drawer opens with load summary on row click
- [ ] Column settings persist across page navigation

## Dependencies
- Backend: `GET /loads`, `GET /loads/stats`
- Hook: `apps/web/lib/hooks/tms/use-loads.ts`
- Components: `LoadsDataTable`, `LoadsFilterBar`, `KPIStatCards`, `LoadDrawer`, `ColumnSettingsDrawer`, `TablePagination`

## Estimated Effort
M
