# Companies List

**Route:** `/companies`
**File:** `apps/web/app/(dashboard)/companies/page.tsx`
**LOC:** 117
**Status:** Complete

## Data Flow

- **Hooks:** `useCustomers` (`lib/hooks/crm/use-customers`), `useDebounce` (`lib/hooks`), `useCRMStore` (`lib/stores/crm-store`)
- **API calls:** `GET /api/v1/crm/customers?page&limit&search&status&accountManagerId`
- **Envelope:** `data?.data` -- correct. `data?.pagination?.total` for stats.

## UI Components

- **Pattern:** ListPage (3 stats cards + filters + data table)
- **Key components:** PageHeader, Card (x3), CustomerFilters, CustomerTable, LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Add Company" button, "Refresh" button, filter controls (in CustomerFilters), table row click, "View contacts" action per row, pagination. All wired.

## State Management

- **URL params:** None -- filters in Zustand `useCRMStore.customerFilters`
- **React Query keys:** Via `useCustomers` with page/limit/search/status/accountManagerId

## Quality Assessment

- **Score:** 7/10
- **Bugs:**
  - "This Month" stat card shows hardcoded `+5` -- not from API data
  - activeCount calculated from current page only (max 20), not total
- **Anti-patterns:** None -- uses debounce (300ms), correct envelope unwrapping
- **Missing:** Loading state present. Error state present. Empty state present. Hardcoded stats card is misleading.
