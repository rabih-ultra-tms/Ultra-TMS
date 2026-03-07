# Carrier Detail

**Route:** `/carriers/[id]`
**File:** `apps/web/app/(dashboard)/carriers/[id]/page.tsx`
**LOC:** 198
**Status:** Complete

## Data Flow

- **Hooks:** `useCarrier` + `useCarrierDrivers` + `useDeleteCarrier` (`lib/hooks/operations`)
- **API calls:** `GET /api/v1/operations/carriers/{id}`, `GET /api/v1/operations/carriers/{id}/drivers`, `DELETE /api/v1/operations/carriers/{id}`
- **Envelope:** `data?.data` via hooks -- correct

## UI Components

- **Pattern:** DetailPage (uses `DetailPage` pattern with 7-8 tabs, header actions)
- **Key components:** DetailPage (`components/patterns/detail-page`), CarrierOverviewCard, CarrierContactsTab, CarrierInsuranceSection, CarrierDocumentsManager, CarrierTrucksManager, CarrierDriversSection, CarrierLoadsTab, CsaScoresDisplay (all from `components/carriers/`), StatusBadge (`components/tms/primitives/status-badge`), TierBadge, ConfirmDialog
- **Interactive elements:** "View Scorecard" Link button, "Edit" button, "Delete" button (opens ConfirmDialog), tab switching (Overview, Contacts, Insurance, Documents, Drivers [COMPANY only], Trucks, Loads, Compliance). All wired.

## State Management

- **URL params:** `id` from route params (React 19 `use(params)` with `Promise<{ id: string }>`)
- **React Query keys:** Via `useCarrier(id)`, `useCarrierDrivers(id)`
- **Local state:** `showDeleteDialog` (boolean)

## Quality Assessment

- **Score:** 9/10
- **Bugs:** None
- **Anti-patterns:**
  - `STATUS_CONFIG` and `TYPE_LABELS` defined in page file -- could be shared constants
- **Missing:** Loading/error states via DetailPage (good). Proper React 19 `use(params)` pattern (good). Conditional Drivers tab for COMPANY carriers only (good business logic). ConfirmDialog for delete with loading state (good). Well-extracted tab components (good). Breadcrumb with link back to carriers (good). One of the strongest detail pages in the codebase.
