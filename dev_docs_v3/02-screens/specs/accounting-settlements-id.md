# Accounting Settlement Detail

**Route:** `/accounting/settlements/[id]`
**File:** `apps/web/app/(dashboard)/accounting/settlements/[id]/page.tsx`
**LOC:** 423
**Status:** Complete

## Data Flow

- **Hooks:** `useSettlement` + `useApproveSettlement` + `useProcessSettlement` + `useDeleteSettlement` (`lib/hooks/accounting/use-settlements`)
- **API calls:** `GET /api/v1/accounting/settlements/{id}`, `PATCH /api/v1/accounting/settlements/{id}/approve`, `PATCH /api/v1/accounting/settlements/{id}/process`, `DELETE /api/v1/accounting/settlements/{id}`
- **Envelope:** `data?.data` via hook -- correct

## UI Components

- **Pattern:** DetailPage (uses `DetailPage` pattern with 2 tabs, workflow actions)
- **Key components:** DetailPage (`components/patterns/detail-page`), SettlementStatusBadge, DropdownMenu, Button, Card, Table (inline), Separator
- **Interactive elements:** "Approve" button (visible when status=CREATED), "Process Payout" button (visible when status=APPROVED), dropdown with "Delete Settlement" (visible when status=CREATED), tab switching (Overview, Line Items). All wired with proper status-conditional rendering and loading states on buttons.

## State Management

- **URL params:** `id` from route params (`params.id`)
- **React Query keys:** Via `useSettlement(params.id)`

## Quality Assessment

- **Score:** 5/10
- **Bugs:**
  - Delete action has no confirmation dialog -- destructive action, navigates away after deletion
  - Dropdown starts with `DropdownMenuSeparator` when only delete item exists -- separator with nothing above it
- **Anti-patterns:**
  - 423 LOC -- significantly oversized page file
  - Inline `SettlementOverviewTab` (lines 202-308), `SettlementLineItemsTab` (lines 314-404), `InfoRow` (lines 410-422), `formatCurrency` (lines 33-39), `formatDate` (lines 41-47) all defined in page file
  - `formatCurrency` and `formatDate` duplicated identically in `accounting-payments-id` -- shared util needed
  - Should extract tab components to `components/accounting/settlement-detail/`
- **Missing:** Loading/error states via DetailPage (good). Workflow state machine (CREATED -> APPROVED -> PROCESSED) correctly implemented with conditional buttons. Timeline section shows approval/processing dates (good). Would benefit heavily from component extraction. No print/export option for settlements.
