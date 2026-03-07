# Accounting Payment Detail

**Route:** `/accounting/payments/[id]`
**File:** `apps/web/app/(dashboard)/accounting/payments/[id]/page.tsx`
**LOC:** 452
**Status:** Complete

## Data Flow

- **Hooks:** `usePayment` + `useAllocatePayment` + `useDeletePayment` (`lib/hooks/accounting/use-payments`), `useInvoices` (`lib/hooks/accounting/use-invoices`)
- **API calls:** `GET /api/v1/accounting/payments/{id}`, `POST /api/v1/accounting/payments/{id}/allocations`, `DELETE /api/v1/accounting/payments/{id}`, `GET /api/v1/accounting/invoices?customerId&limit=100`
- **Envelope:** `data?.data` via hooks -- correct

## UI Components

- **Pattern:** DetailPage (uses `DetailPage` pattern with 3 tabs and header actions)
- **Key components:** DetailPage (`components/patterns/detail-page`), PaymentStatusBadge, PaymentAllocation (`components/accounting/payment-allocation`), DropdownMenu, Button, Card, Table (inline), Separator
- **Interactive elements:** "Save Allocation" button (conditional on changes + non-voided), dropdown with "Delete Payment" (conditional on status), tab switching (Overview, Allocations read-only, Allocate Payment interactive). All wired with proper status guards.

## State Management

- **URL params:** `id` from route params (`params.id`)
- **React Query keys:** Via `usePayment(params.id)`, `useInvoices({ customerId, limit: 100 })`
- **Local state:** `allocations` (AllocationEntry[]), `hasChanges` (boolean)

## Quality Assessment

- **Score:** 5/10
- **Bugs:**
  - Delete action has no confirmation dialog -- destructive action with no undo
  - `useInvoices({ limit: 100 })` -- hardcoded limit, customers with 100+ invoices will have missing options
  - Dropdown starts with `DropdownMenuSeparator` when only delete exists -- separator with nothing above it
- **Anti-patterns:**
  - 452 LOC -- significantly oversized page file
  - Inline `PaymentOverviewTab` (lines 232-336), `PaymentAllocationsTab` (lines 343-432), `InfoRow` (lines 439-452), `formatCurrency` (lines 37-43), `formatDate` (lines 45-51), `METHOD_LABELS` (lines 53-58) all defined in page file
  - Should extract overview/allocations tabs to `components/accounting/payment-detail/`
  - `formatCurrency` and `formatDate` duplicated across accounting pages -- should be shared utils
  - `React.useEffect` syncing allocations could cause stale state if payment updates while user is editing
- **Missing:** Loading/error states via DetailPage (good). Three-tab layout with interactive allocation is well-designed. Would benefit heavily from component extraction.
