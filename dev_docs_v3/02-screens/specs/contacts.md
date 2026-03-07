# Contacts List

**Route:** `/contacts`
**File:** `apps/web/app/(dashboard)/contacts/page.tsx`
**LOC:** 55
**Status:** Complete

## Data Flow

- **Hooks:** `useContacts` + `useDeleteContact` (`lib/hooks/crm/use-contacts`)
- **API calls:** `GET /api/v1/crm/contacts?page&limit`, `DELETE /api/v1/crm/contacts/{id}`
- **Envelope:** `data?.data` -- correct

## UI Components

- **Pattern:** ListPage (header + table with inline delete)
- **Key components:** PageHeader, ContactsTable, LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Add Contact" button, "Refresh" button, table row click, delete per row, pagination. All wired.

## State Management

- **URL params:** None
- **React Query keys:** Via `useContacts({ page, limit: 20 })`

## Quality Assessment

- **Score:** 6/10
- **Bugs:** None
- **Anti-patterns:** No search or filters -- unlike companies/leads pages. Delete action may lack confirmation (depends on ContactsTable internals).
- **Missing:** Loading state present. Error state present. Empty state present. No search. No filters.
