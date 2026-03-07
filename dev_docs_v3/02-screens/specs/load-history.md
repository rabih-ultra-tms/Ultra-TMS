# Load History

**Route:** `/load-history`
**File:** `apps/web/app/(dashboard)/load-history/page.tsx`
**LOC:** 1,043
**Status:** Complete

## Data Flow

- **Hooks:** `useLoads` (`lib/hooks/tms/use-loads`), `useDeleteLoad` (same file), `useCustomers` (`lib/hooks/crm/use-customers`)
- **API calls:** `GET /api/v1/tms/loads?page&limit&search&status&customerId`, `DELETE /api/v1/tms/loads/{id}`, `POST /api/v1/tms/loads` (inline new load creation), `GET /api/v1/crm/customers?limit=100` (for customer dropdown)
- **Envelope:** `loadsData?.data` for items, `loadsData?.pagination` -- correct

## UI Components

- **Pattern:** Custom (header + filters + responsive mobile cards / desktop table + new load dialog)
- **Key components:** Inline LoadActionsMenu component, Dialog (for new load), ConfirmDialog (for delete), Badge, Button, Input, Select, custom mobile card layout, custom desktop table
- **Interactive elements:** Search input (debounced 300ms -- good), status filter Select, customer filter Select, "New Load" button opens Dialog with form, per-row LoadActionsMenu (view, edit, delete), batch select checkboxes, batch delete with ConfirmDialog, pagination controls. All wired.

## State Management

- **URL params:** None -- all filter/search/page state in local React state
- **React Query keys:** Via `useLoads({ page, limit, search, status, customerId })`
- **Local state:** `search`, `debouncedSearch` (via useDebounce), `statusFilter`, `customerFilter`, `currentPage`, `selectedIds` (Set), `showDeleteDialog`, `deleteTargetId`, `showBatchDeleteDialog`, `showNewLoadDialog`, `newLoadForm` (object with customer, origin, destination, equipment, weight, rate fields), `newLoadErrors` (validation object)

## Quality Assessment

- **Score:** 5/10
- **Bugs:**
  - New load Dialog has manual field validation instead of React Hook Form + Zod -- inconsistent with rest of codebase
  - `useCustomers` called with `limit: 100` -- will silently truncate customer list for tenants with >100 customers
- **Anti-patterns:**
  - 1,043 LOC -- largest page file in the codebase, massive monolith
  - Inline `LoadActionsMenu` component defined inside page file (~80 LOC)
  - Inline new load creation Dialog with manual validation (~120 LOC) -- should be extracted to a LoadForm component
  - Responsive mobile card + desktop table dual rendering increases LOC substantially -- should extract to separate components
  - Inline STATUS_COLORS, STATUS_LABELS, formatCurrency, formatDate helpers duplicated from other pages
  - Filter state in local React state, not URL params
- **Missing:** Debounced search (good). Batch delete with ConfirmDialog (good, not `confirm()`). Pagination controls (good). Customer dropdown for filtering (good). Mobile-responsive layout (good intent, poor execution as inline code). Should be decomposed into at minimum: LoadFilters, LoadTable, LoadMobileCard, LoadActionsMenu, NewLoadDialog components.
