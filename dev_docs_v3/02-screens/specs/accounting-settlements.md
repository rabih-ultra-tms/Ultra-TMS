# Accounting Settlements List

**Route:** `/accounting/settlements`
**File:** `apps/web/app/(dashboard)/accounting/settlements/page.tsx`
**LOC:** 71
**Status:** Complete

## Data Flow

- **Hooks:** `useSettlements` (`lib/hooks/accounting/use-settlements`)
- **API calls:** `GET /api/v1/accounting/settlements?page&limit&search&status&fromDate&toDate`
- **Envelope:** `data?.data` and `data?.pagination` -- correct

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern component)
- **Key components:** ListPage (`components/patterns/list-page`), getSettlementColumns (`components/accounting/settlement-table`), SettlementFilters (`components/accounting/settlement-filters`)
- **Interactive elements:** Row click (navigates to detail), view action in columns. No "New" button (settlements grouped from payables).

## State Management

- **URL params:** page, limit, search, status, fromDate, toDate from `useSearchParams`. Page changes update URL.
- **React Query keys:** Via `useSettlements` with URL-derived params
- **Local state:** `rowSelection` (unused)

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:**
  - `useSearchParams` not in Suspense boundary
  - `rowSelection` state initialized but no bulk actions
- **Missing:** Loading/error/empty states via ListPage. Clean, concise list page. No carrier filter. No "Create Settlement" action to batch payables into a settlement.
