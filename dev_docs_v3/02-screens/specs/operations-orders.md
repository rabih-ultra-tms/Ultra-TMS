# Operations Orders List

**Route:** `/operations/orders`
**File:** `apps/web/app/(dashboard)/operations/orders/page.tsx`
**LOC:** 165
**Status:** Complete

## Data Flow

- **Hooks:** `useOrders` + `useUpdateOrder` (`lib/hooks/tms/use-orders`)
- **API calls:** `GET /api/v1/tms/orders?page&limit&search&status&fromDate&toDate&customerId`, `PATCH /api/v1/tms/orders/{id}`
- **Envelope:** `data?.data` and `data?.pagination` -- correct

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern component with stats, filters, data table)
- **Key components:** ListPage (`components/patterns/list-page`), inline StatsCard, OrderFilters, getOrderColumns (column definitions), Button
- **Interactive elements:** "New Order" Link button, row click (navigates to detail), delete action (shows toast "not available yet"), status change dropdown. All wired except delete.

## State Management

- **URL params:** page, limit, search, status, fromDate, toDate, customerId all read from `useSearchParams`. Page changes update URL.
- **React Query keys:** Via `useOrders` with URL-derived params

## Quality Assessment

- **Score:** 7/10
- **Bugs:**
  - `handleDelete` shows `toast.info("Delete not available yet")` -- stub, not implemented
  - `handleStatusChange` casts `formData: {} as any` -- `any` type and empty object passed to update
  - Stats (pending, inTransit, delivered) calculated from current page only
- **Anti-patterns:**
  - `useSearchParams` not in Suspense boundary
  - `as any` cast in status change handler
  - Inline StatsCard component defined in page file
- **Missing:** Loading state via ListPage. Error state via ListPage. Empty state via ListPage. Row selection state exists but no bulk actions.
