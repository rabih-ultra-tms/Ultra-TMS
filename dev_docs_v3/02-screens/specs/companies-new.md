# Companies New

**Route:** `/companies/new`
**File:** `apps/web/app/(dashboard)/companies/new/page.tsx`
**LOC:** 38
**Status:** Complete

## Data Flow

- **Hooks:** `useCreateCustomer` (`lib/hooks/crm/use-customers`)
- **API calls:** `POST /api/v1/crm/customers`
- **Envelope:** `response.data.id` -- correct double-unwrap to get created entity ID for redirect

## UI Components

- **Pattern:** FormPage (thin wrapper around CustomerForm)
- **Key components:** PageHeader, CustomerForm (`components/crm/customers/customer-form`), Button
- **Interactive elements:** Form fields inside CustomerForm, submit button, "Back" button. All wired.

## State Management

- **URL params:** None
- **React Query keys:** Via `useCreateCustomer` mutation

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:** None
- **Missing:** Loading/error states delegated to CustomerForm. Submit pending state shown ("Saving..."). Redirects to `/companies/{id}` after creation.
