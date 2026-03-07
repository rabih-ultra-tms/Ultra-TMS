# Load Planner History

**Route:** `/load-planner/history`
**File:** `apps/web/app/(dashboard)/load-planner/history/page.tsx`
**LOC:** 584
**Status:** Complete

## Data Flow

- **Hooks:** `useLoadPlanners` (`lib/hooks/sales/use-load-planners`), `useDeleteLoadPlanner` (same file), `useDuplicateLoadPlanner` (same file), `useRecordAsLoad` (same file)
- **API calls:** `GET /api/v1/sales/load-planners?page&limit&search&status`, `DELETE /api/v1/sales/load-planners/{id}`, `POST /api/v1/sales/load-planners/{id}/duplicate`, `POST /api/v1/sales/load-planners/{id}/record-as-load`, `PATCH /api/v1/sales/load-planners/{id}/status` (direct apiClient call, not via hook)
- **Envelope:** `data?.data` for items, `data?.pagination` -- correct

## UI Components

- **Pattern:** Custom (header + stats + filters + table -- not ListPage pattern)
- **Key components:** Inline StatsCards, custom table, Badge, Button, ConfirmDialog, Select, Input
- **Interactive elements:** Search input (no debounce), status filter Select, per-row actions menu (edit, duplicate, record-as-load, delete), batch select checkboxes, batch delete button, status update via dynamic `apiClient` import. All wired.

## State Management

- **URL params:** None -- search/filter/page state in local React state only
- **React Query keys:** Via `useLoadPlanners({ page, limit, search, status })`
- **Local state:** `search`, `statusFilter`, `currentPage`, `selectedIds` (Set), `showDeleteDialog`, `deleteTargetId`, `showBatchDeleteDialog`

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - Status update uses `confirm()` (browser native) instead of ConfirmDialog -- inconsistent with batch delete which correctly uses ConfirmDialog
  - Status update dynamically imports `apiClient` (`const { apiClient } = await import(...)`) instead of using a mutation hook -- breaks React Query cache invalidation
  - Search input has no debounce -- fires API call on every keystroke
- **Anti-patterns:**
  - Inline StatsCards component defined inside page file
  - Inline column definitions and helper functions
  - 584 LOC monolith -- stats, filters, table, actions all in one file
  - Filter state in local React state, not URL params -- lost on navigation
  - `confirm()` for status change but ConfirmDialog for batch delete (inconsistent)
- **Missing:** No error state at page level. Loading state via skeleton rows (adequate). Batch delete uses ConfirmDialog (good). Duplicate and record-as-load actions with toast feedback (good). ~90% code overlap with `quote-history/page.tsx` -- should share a generic history table component.
