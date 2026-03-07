# Contacts Detail

**Route:** `/contacts/[id]`
**File:** `apps/web/app/(dashboard)/contacts/[id]/page.tsx`
**LOC:** 85
**Status:** Complete

## Data Flow

- **Hooks:** `useContact(contactId)` + `useDeleteContact` (`lib/hooks/crm/use-contacts`)
- **API calls:** `GET /api/v1/crm/contacts/{id}`, `DELETE /api/v1/crm/contacts/{id}`
- **Envelope:** `data?.data` -- correct

## UI Components

- **Pattern:** DetailPage (header + contact card + delete dialog)
- **Key components:** PageHeader, ContactCard, ConfirmDialog, LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Edit" button, "Delete" button (opens ConfirmDialog), "Back" button. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useContact(contactId)`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** None -- uses proper ConfirmDialog for delete
- **Missing:** Loading present. Error present. Not-found present. Delete confirmation present.
