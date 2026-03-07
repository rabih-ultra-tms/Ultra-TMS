# Leads Contacts

**Route:** `/leads/[id]/contacts`
**File:** `apps/web/app/(dashboard)/leads/[id]/contacts/page.tsx`
**LOC:** 60
**Status:** Complete

## Data Flow

- **Hooks:** `useLead(leadId)` (`lib/hooks/crm/use-leads`), `useContacts({ companyId })` (`lib/hooks/crm/use-contacts`)
- **API calls:** `GET /api/v1/crm/leads/{id}` (get companyId), `GET /api/v1/crm/contacts?page&limit&companyId`
- **Envelope:** `data?.data` -- correct. `leadData?.data?.companyId` to get company association.

## UI Components

- **Pattern:** ListPage (contacts table filtered by lead's company)
- **Key components:** PageHeader, ContactsTable, LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Back" button, table row click, pagination. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useLead` and `useContacts({ companyId })`

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:** Contacts are fetched by companyId (not leadId) -- if lead has no company, no contacts shown
- **Missing:** Loading state present. Error state present. Empty state present. No "add contact" button.
