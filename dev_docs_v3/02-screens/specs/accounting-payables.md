# Accounting Payables List

**Route:** `/accounting/payables`
**File:** `apps/web/app/(dashboard)/accounting/payables/page.tsx`
**LOC:** 70
**Status:** Complete

## Data Flow

- **Hooks:** `usePayables` (`lib/hooks/accounting/use-payables`)
- **API calls:** `GET /api/v1/accounting/payables?page&limit&search&status&fromDate&toDate`
- **Envelope:** `data?.data` and `data?.pagination` -- correct

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern component)
- **Key components:** ListPage (`components/patterns/list-page`), getPayableColumns (`components/accounting/payables-table`), PayableFilters (`components/accounting/payable-filters`)
- **Interactive elements:** Row click (navigates to `/accounting/payables/{id}`), view action in columns. No "New" button (payables are auto-generated from loads, not manually created -- correct design).

## State Management

- **URL params:** page, limit, search, status, fromDate, toDate from `useSearchParams`. Page changes update URL.
- **React Query keys:** Via `usePayables` with URL-derived params
- **Local state:** `rowSelection` (unused)

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:**
  - `useSearchParams` not in Suspense boundary
  - `rowSelection` state initialized but no bulk actions
- **Missing:** Loading/error/empty states via ListPage. Clean, concise list page. No carrier filter (payables are carrier-facing). No export option. Row click navigates to detail but no payable detail page found in routes.
