# Carriers List

**Route:** `/carriers`
**File:** `apps/web/app/(dashboard)/carriers/page.tsx`
**LOC:** 594
**Status:** Complete

## Data Flow

- **Hooks:** `useCarriers` + `useCreateCarrier` + `useDeleteCarrier` + `useCarrierStats` + `useUpdateCarrier` (`lib/hooks/operations`), `useDebounce` (`lib/hooks`)
- **API calls:** `GET /api/v1/operations/carriers?page&limit&search&status&carrierType&state&tier&equipmentTypes&compliance&minScore&sortBy&sortOrder`, `POST /api/v1/operations/carriers`, `DELETE /api/v1/operations/carriers/{id}`, `PATCH /api/v1/operations/carriers/{id}`, `GET /api/v1/carriers/stats`, `GET /api/v1/operations/carriers/export`
- **Envelope:** `data?.data` and `data?.total` -- note: uses `data?.total` not `data?.pagination?.total`

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern with stats, 8 filters, bulk actions, dialogs)
- **Key components:** ListPage (`components/patterns/list-page`), columns + isInsuranceExpired/isInsuranceExpiring (co-located `./columns`), ConfirmDialog, Dialog (new carrier + bulk status), inline StatsCards component, Select, Input, Button
- **Interactive elements:** "Add Carrier" button (opens Dialog), "Export" button (CSV download), search input (debounced 300ms), 7 filter dropdowns (type, status, state, tier, equipment, compliance, min score), clear filters button, row click (navigates to detail), row selection checkboxes, bulk actions (delete selected, update status, export selected), row background color based on insurance status. All wired.

## State Management

- **URL params:** None -- all filter state in local React state (not URL-persisted)
- **React Query keys:** Via `useCarriers` with local state params
- **Local state:** `typeFilter`, `statusFilter`, `stateFilter`, `tierFilter`, `equipmentFilter`, `complianceFilter`, `minScore`, `searchQuery`, `page`, `showNewCarrierDialog`, `newCarrierType`, `newCarrierName`, `rowSelection`, `showBatchDeleteDialog`, `showBulkStatusDialog`, `bulkStatus`, `sorting` -- 17 state variables

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None critical
- **Anti-patterns:**
  - 594 LOC -- very large page file
  - 17 local state variables -- complex state management, could benefit from useReducer or Zustand
  - Inline `StatsCards` component defined in page file
  - `US_STATES` array hardcoded in page file -- should be shared constant
  - All filter state in local React state, not URL params -- filters lost on navigation/refresh
  - Batch delete uses `Promise.all` (all-or-nothing) -- one failure cancels all
- **Missing:** Loading/error/empty states via ListPage. Debounced search (300ms, good). Server-side sorting (good). Bulk actions with selection (good). Export feature (good). Insurance status row highlighting (good). ConfirmDialog for delete (good). Feature-rich, well-implemented list page despite large file size.
