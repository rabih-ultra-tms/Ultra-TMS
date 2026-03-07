# Accounting Invoices List

**Route:** `/accounting/invoices`
**File:** `apps/web/app/(dashboard)/accounting/invoices/page.tsx`
**LOC:** 128
**Status:** Complete

## Data Flow

- **Hooks:** `useInvoices` + `useSendInvoice` + `useVoidInvoice` (`lib/hooks/accounting/use-invoices`)
- **API calls:** `GET /api/v1/accounting/invoices?page&limit&search&status&fromDate&toDate`, `POST /api/v1/accounting/invoices/{id}/send`, `PATCH /api/v1/accounting/invoices/{id}/void`, `GET /api/v1/invoices/{id}/pdf`
- **Envelope:** `data?.data` and `data?.pagination` -- correct

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern component with filters, data table, pagination)
- **Key components:** ListPage (`components/patterns/list-page`), getInvoiceColumns (`components/accounting/invoices-table`), InvoiceFilters (`components/accounting/invoice-filters`), Button, Link
- **Interactive elements:** "New Invoice" Link button, row click (navigates to detail), send action, void action (uses `window.prompt`), download PDF action. All wired.

## State Management

- **URL params:** page, limit, search, status, fromDate, toDate all read from `useSearchParams`. Page changes update URL.
- **React Query keys:** Via `useInvoices` with URL-derived params
- **Local state:** `rowSelection` (unused -- no bulk actions)

## Quality Assessment

- **Score:** 5/10
- **Bugs:**
  - Line 66: `window.prompt("Enter void reason:")` -- blocks UI thread, not accessible, no validation, bypassable with Cancel (returns null, correctly handled)
  - Line 80-81: `apiClient.get()` cast `response as unknown as Blob` -- fragile, apiClient likely returns JSON not Blob, PDF download will fail
- **Anti-patterns:**
  - `window.prompt` instead of a Dialog/Modal with form validation for void reason
  - Double cast `as unknown as Blob` is a code smell indicating apiClient doesn't support binary responses
  - `useSearchParams` not in Suspense boundary
  - `rowSelection` state initialized but no bulk actions wired
- **Missing:** Loading/error/empty states via ListPage. Has date range filters (good). Has send/void/PDF per-row actions (good).
