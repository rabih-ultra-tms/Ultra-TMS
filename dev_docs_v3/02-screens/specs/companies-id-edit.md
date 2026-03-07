# Companies Edit

**Route:** `/companies/[id]/edit`
**File:** `apps/web/app/(dashboard)/companies/[id]/edit/page.tsx`
**LOC:** 79
**Status:** Complete

## Data Flow

- **Hooks:** `useCustomer(companyId)` + `useUpdateCustomer` (`lib/hooks/crm/use-customers`)
- **API calls:** `GET /api/v1/crm/customers/{id}` (pre-populate), `PATCH /api/v1/crm/customers/{id}` (update)
- **Envelope:** `data?.data` -- correct double-unwrap

## UI Components

- **Pattern:** FormPage (loads existing data into CustomerForm)
- **Key components:** PageHeader, CustomerForm (`components/crm/customers/customer-form`), LoadingState, ErrorState
- **Interactive elements:** Pre-populated form fields, "Update Company" submit, "Back" button. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useCustomer` and `useUpdateCustomer`

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - `setTimeout(() => router.push(...), 500)` after update -- artificial delay to wait for React Query refetch. Should use `onSuccess` callback or `await queryClient.invalidateQueries` instead.
  - Not-found state returns `null` -- renders blank page
- **Anti-patterns:** `setTimeout` for navigation timing is fragile
- **Missing:** Loading state present. Error state present. Not-found renders null (bug). Address defaults to empty object if missing.
