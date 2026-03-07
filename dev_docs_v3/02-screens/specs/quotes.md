# Quotes List

**Route:** `/quotes`
**File:** `apps/web/app/(dashboard)/quotes/page.tsx`
**LOC:** 262
**Status:** Complete

## Data Flow

- **Hooks:** `useQuotes` + `useQuoteStats` + `useDeleteQuote` + `useCloneQuote` + `useSendQuote` + `useConvertQuote` (`lib/hooks/sales/use-quotes`), `useDebounce` (`lib/hooks`)
- **API calls:** `GET /api/v1/sales/quotes?page&limit&search&status&serviceType`, `GET /api/v1/sales/quotes/stats`, `DELETE /api/v1/sales/quotes/{id}`, `POST /api/v1/sales/quotes/{id}/clone`, `POST /api/v1/sales/quotes/{id}/send`, `POST /api/v1/sales/quotes/{id}/convert`
- **Envelope:** `data?.data` -- correct. Total via `data?.pagination?.total ?? data?.total` with `as any` cast

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern with stats, filters, bulk actions, confirm dialog)
- **Key components:** ListPage (`components/patterns/list-page`), getColumns (co-located `./columns`), inline StatsCards, ConfirmDialog, Select, Input, Button
- **Interactive elements:** "New Quote" button, search input (debounced 300ms), status filter (active statuses default, 7 individual options), service type filter (FTL/LTL/Partial/Drayage), clear filters, row click (navigates to detail), per-row clone/send/delete/convert actions, row selection checkboxes, bulk actions bar (send selected, delete selected -- both disabled/not implemented). All wired except bulk actions.

## State Management

- **URL params:** None -- all filter state in local React state
- **React Query keys:** Via `useQuotes` with local state params
- **Local state:** `statusFilter` (defaults to `ACTIVE_STATUSES` comma-separated), `serviceTypeFilter`, `searchQuery`, `page`, `rowSelection`, `deleteTarget`

## Quality Assessment

- **Score:** 7/10
- **Bugs:**
  - Line 90: `(data as any)?.pagination?.total ?? (data as any)?.total` -- double `as any` cast to handle envelope inconsistency
  - Lines 102-103: `useMemo(() => getColumns(...), [])` with eslint-disable for exhaustive deps -- columns never update when mutation state changes
  - Bulk "Send Selected" and "Delete Selected" buttons are `disabled` with no handlers -- non-functional
- **Anti-patterns:**
  - `as any` casts for pagination total
  - Inline StatsCards component with hardcoded `text-blue-600`/`text-green-600` colors
  - Filters in local state, not URL params -- lost on navigation
  - `useMemo` with empty deps array and eslint-disable
- **Missing:** Loading/error/empty states via ListPage. Debounced search (good). ConfirmDialog for delete (good). Stats cards (good). Default to active statuses (good business logic). Bulk actions exist but are disabled stubs.
