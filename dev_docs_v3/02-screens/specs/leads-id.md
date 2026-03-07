# Leads Detail

**Route:** `/leads/[id]`
**File:** `apps/web/app/(dashboard)/leads/[id]/page.tsx`
**LOC:** 224
**Status:** Complete

## Data Flow

- **Hooks:** `useLead(leadId)` + `useDeleteLead` + `useConvertLead` (`lib/hooks/crm/use-leads`), `useContacts({ companyId, limit: 3 })` (`lib/hooks/crm/use-contacts`), `useActivities({ leadId, limit: 3 })` (`lib/hooks/crm/use-activities`), `useCustomers({ limit: 100 })` (`lib/hooks/crm/use-customers`)
- **API calls:** `GET /api/v1/crm/leads/{id}`, `DELETE /api/v1/crm/leads/{id}`, `POST /api/v1/crm/leads/{id}/convert`, `GET /api/v1/crm/contacts?companyId&limit=3`, `GET /api/v1/crm/activities?leadId&limit=3`, `GET /api/v1/crm/customers?limit=100`
- **Envelope:** `data?.data` -- correct throughout

## UI Components

- **Pattern:** DetailPage (overview card + 2-column grid with contacts/activities preview cards)
- **Key components:** PageHeader, Card (overview), LeadStageBadge, ConfirmDialog (delete), LeadConvertDialog, LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Convert to Customer" button (disabled unless stage=WON), "Delete" button (opens ConfirmDialog), "Back" button, "View all" links for contacts/activities. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useLead`, `useContacts`, `useActivities`, `useCustomers`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** Fetches all customers (`limit: 100`) for convert dialog dropdown -- should use search/autocomplete
- **Missing:** Loading state present. Error state present. Not-found state present. Delete confirmation via ConfirmDialog. Convert dialog with customer selection. Top-3 contacts/activities preview with "View all" links.
