# Companies Detail

**Route:** `/companies/[id]`
**File:** `apps/web/app/(dashboard)/companies/[id]/page.tsx`
**LOC:** 57
**Status:** Complete

## Data Flow

- **Hooks:** `useCustomer(companyId)` (`lib/hooks/crm/use-customers`)
- **API calls:** `GET /api/v1/crm/customers/{id}`
- **Envelope:** `data?.data` -- correct double-unwrap

## UI Components

- **Pattern:** DetailPage (header + tabs + detail card)
- **Key components:** PageHeader, CustomerTabs (`components/crm/customers/customer-tabs`), CustomerDetailCard (`components/crm/customers/customer-detail-card`), LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Edit" button, "Back" button. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useCustomer(companyId)`

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:** None
- **Missing:** Loading state present. Error state present. Not-found state present. No delete action on this page.
