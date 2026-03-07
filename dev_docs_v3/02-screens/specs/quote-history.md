# Quote History

**Route:** `/quote-history`
**File:** `apps/web/app/(dashboard)/quote-history/page.tsx`
**LOC:** 755
**Status:** Complete

## Data Flow

- **Hooks:** `useQuotes` (`lib/hooks/sales/use-quotes`), `useDeleteQuote` (same file)
- **API calls:** `GET /api/v1/sales/quotes?page&limit&search&status`, `DELETE /api/v1/sales/quotes/{id}`, `PATCH /api/v1/sales/quotes/{id}/status` (direct apiClient call, not via hook)
- **Envelope:** `data?.data` for items, `data?.pagination` -- correct

## UI Components

- **Pattern:** Custom (header + stats + filters + responsive mobile cards / desktop table)
- **Key components:** Inline QuoteActionsMenu component, ConfirmDialog, Badge, Button, Input, Select, custom mobile card layout, custom desktop table
- **Interactive elements:** Search input (debounced 300ms -- good), status filter Select, per-row QuoteActionsMenu (view, edit, convert to load planner, change status, delete), batch select checkboxes, batch delete with ConfirmDialog, pagination controls. All wired.

## State Management

- **URL params:** None -- all filter/search/page state in local React state
- **React Query keys:** Via `useQuotes({ page, limit, search, status })`
- **Local state:** `search`, `debouncedSearch` (via useDebounce), `statusFilter`, `currentPage`, `selectedIds` (Set), `showDeleteDialog`, `deleteTargetId`, `showBatchDeleteDialog`

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - Status change uses direct `apiClient` import (dynamic) instead of mutation hook -- breaks React Query cache invalidation, must manually call `queryClient.invalidateQueries`
  - Status change options are conditionally filtered based on current status -- good logic but inline implementation
- **Anti-patterns:**
  - 755 LOC monolith -- stats, filters, mobile cards, desktop table, actions menu all in one file
  - Inline `QuoteActionsMenu` component defined inside page file
  - Inline STATUS_COLORS, STATUS_LABELS, formatCurrency, formatDate duplicated from load-history and load-planner-history
  - Status update via dynamic apiClient import instead of mutation hook
  - ~90% structural overlap with `load-planner/history/page.tsx` -- should share a generic history table
  - Filter state in local React state, not URL params
- **Missing:** Debounced search (good). Batch delete with ConfirmDialog (good). Pagination controls (good). Mobile-responsive cards (good intent). Conditional status transitions (good business logic). Convert-to-load-planner action (good feature). Should decompose into QuoteFilters, QuoteTable, QuoteMobileCard, QuoteActionsMenu.
