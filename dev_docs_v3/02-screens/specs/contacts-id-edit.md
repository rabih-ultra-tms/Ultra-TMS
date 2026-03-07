# Contacts Edit

**Route:** `/contacts/[id]/edit`
**File:** `apps/web/app/(dashboard)/contacts/[id]/edit/page.tsx`
**LOC:** 67
**Status:** Complete

## Data Flow

- **Hooks:** `useContact(contactId)` + `useUpdateContact` (`lib/hooks/crm/use-contacts`)
- **API calls:** `GET /api/v1/crm/contacts/{id}`, `PATCH /api/v1/crm/contacts/{id}`
- **Envelope:** `data?.data` -- correct

## UI Components

- **Pattern:** FormPage (loads existing contact into ContactForm)
- **Key components:** PageHeader, ContactForm, LoadingState, ErrorState
- **Interactive elements:** Pre-populated fields, submit button, "Back" button. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useContact` and `useUpdateContact`

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - Not-found returns `null` -- blank page
  - `companyId` not included in defaultValues -- may lose company association on edit
- **Anti-patterns:** None
- **Missing:** Loading present. Error present. Not-found renders null (bug).
