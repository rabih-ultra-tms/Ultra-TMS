# Accounting Payments List

**Route:** `/accounting/payments`
**File:** `apps/web/app/(dashboard)/accounting/payments/page.tsx`
**LOC:** 120
**Status:** Complete

## Data Flow

- **Hooks:** `usePayments` + `useDeletePayment` (`lib/hooks/accounting/use-payments`)
- **API calls:** `GET /api/v1/accounting/payments?page&limit&search&status&method&fromDate&toDate`, `DELETE /api/v1/accounting/payments/{id}`
- **Envelope:** `data?.data` and `data?.pagination` -- correct

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern + Dialog for recording payments)
- **Key components:** ListPage (`components/patterns/list-page`), getPaymentColumns (`components/accounting/payments-table`), PaymentFilters (`components/accounting/payment-filters`), Dialog, RecordPaymentForm (co-located `./record-payment-form`), Button
- **Interactive elements:** "Record Payment" button (opens Dialog), row click (navigates to detail), view action, delete action (no confirmation dialog). All wired.

## State Management

- **URL params:** page, limit, search, status, method, fromDate, toDate from `useSearchParams`. Page changes update URL.
- **React Query keys:** Via `usePayments` with URL-derived params
- **Local state:** `showRecordForm` (Dialog open state), `rowSelection` (unused)

## Quality Assessment

- **Score:** 7/10
- **Bugs:**
  - Delete action has no confirmation dialog -- `deletePayment.mutateAsync(id)` called directly
- **Anti-patterns:**
  - `useSearchParams` not in Suspense boundary
  - `rowSelection` state initialized but no bulk actions
  - RecordPaymentForm imported from co-located file (`./record-payment-form`) -- acceptable but not in `components/`
- **Missing:** Loading/error/empty states via ListPage. Dialog-based create is a good pattern. Has method filter (good). Delete succeeds silently with no undo. `onSuccess` calls `refetch()` instead of relying on query invalidation.
