# Companies Contacts

**Route:** `/companies/[id]/contacts`
**File:** `apps/web/app/(dashboard)/companies/[id]/contacts/page.tsx`
**LOC:** 65
**Status:** Complete

## Data Flow

- **Hooks:** `useCustomer(companyId)` (`lib/hooks/crm/use-customers`), `useContacts({ companyId })` (`lib/hooks/crm/use-contacts`)
- **API calls:** `GET /api/v1/crm/customers/{id}` (company name), `GET /api/v1/crm/contacts?page&limit&companyId`
- **Envelope:** `data?.data` -- correct for both hooks

## UI Components

- **Pattern:** ListPage (sub-page within company context)
- **Key components:** PageHeader, CustomerTabs, ContactsTable, LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Add Contact" button (navigates to `/contacts/new?companyId={id}`), "Back" button, table row click, pagination. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useContacts({ companyId })` and `useCustomer(companyId)`

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:** None
- **Missing:** Loading state present. Error state present. Empty state present.
