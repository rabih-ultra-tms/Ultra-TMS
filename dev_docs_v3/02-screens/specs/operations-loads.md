# Operations Loads List

**Route:** `/operations/loads`
**File:** `apps/web/app/(dashboard)/operations/loads/page.tsx`
**LOC:** 147
**Status:** Complete

## Data Flow

- **Hooks:** `useLoads` + `useLoadStats` (`lib/hooks/tms/use-loads`)
- **API calls:** `GET /api/v1/tms/loads?page&limit&status&carrierId&search`, `GET /api/v1/tms/loads/stats`
- **Envelope:** `data?.data` for loads list, `data.total` for pagination (note: uses `data.total` not `data.pagination.total` -- verify hook format)

## UI Components

- **Pattern:** ListPage (header + filter bar + KPI stats + data table + drawers)
- **Key components:** LoadsFilterBar, KPIStatCards, LoadsDataTable, LoadDrawer (slide-out detail), ColumnSettingsDrawer (column visibility), TablePagination
- **Interactive elements:** "New Load" Link button, row click (opens LoadDrawer), edit action, view details, floating settings button (column visibility), pagination. All wired.

## State Management

- **URL params:** page, limit, status, carrierId, search read from `useSearchParams`. Page changes update URL via `router.replace`.
- **React Query keys:** Via `useLoads(query)` and `useLoadStats()`
- **Local state:** `selectedLoad`, `isDrawerOpen`, `isSettingsOpen`, `columnVisibility`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:**
  - `useSearchParams` not in Suspense boundary
  - Title says "Dispatch Board" but route is `/operations/loads` -- confusing naming
- **Missing:** Loading state via LoadsDataTable. KPI stats with separate loading. Load preview drawer. Column settings drawer. No error state visible at page level (delegated to components).
