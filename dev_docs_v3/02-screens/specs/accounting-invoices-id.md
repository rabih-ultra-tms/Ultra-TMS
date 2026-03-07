# Accounting Invoice Detail

**Route:** `/accounting/invoices/[id]`
**File:** `apps/web/app/(dashboard)/accounting/invoices/[id]/page.tsx`
**LOC:** 184
**Status:** Complete

## Data Flow

- **Hooks:** `useInvoice` + `useSendInvoice` + `useVoidInvoice` (`lib/hooks/accounting/use-invoices`)
- **API calls:** `GET /api/v1/accounting/invoices/{id}`, `POST /api/v1/accounting/invoices/{id}/send`, `PATCH /api/v1/accounting/invoices/{id}/void`, `GET /api/v1/invoices/{id}/pdf`
- **Envelope:** `data?.data` via hook -- correct

## UI Components

- **Pattern:** DetailPage (uses `DetailPage` pattern with tabs and header actions)
- **Key components:** DetailPage (`components/patterns/detail-page`), InvoiceOverviewTab + InvoiceLineItemsTab + InvoicePaymentsTab (`components/accounting/invoice-detail-card`), InvoiceStatusBadge, DropdownMenu, Button
- **Interactive elements:** "Send" button (conditional on DRAFT/PENDING status), "PDF" download button, dropdown menu with "Edit Invoice" (conditional) and "Void Invoice" (conditional, uses `window.prompt`). Tab switching (Overview, Line Items, Payments). All wired with proper status guards.

## State Management

- **URL params:** `id` from route params (`params.id` -- not using React 19 `use(params)`)
- **React Query keys:** Via `useInvoice(params.id)`

## Quality Assessment

- **Score:** 7/10
- **Bugs:**
  - Line 58: `window.prompt("Enter void reason:")` -- same anti-pattern as list page
  - Lines 72-73: Same `as unknown as Blob` cast for PDF download -- will likely fail
- **Anti-patterns:**
  - `window.prompt` for void reason
  - Double cast for PDF Blob
  - `params.id` accessed directly without `use(params)` -- works but may be deprecated in future Next.js
- **Missing:** Loading/error/not-found states via DetailPage pattern (good). Tab content properly extracted to external components (good). Edit link navigates to `/invoices/{id}/edit` but no edit page exists in routes.
