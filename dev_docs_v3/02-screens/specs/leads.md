# Leads (Deals) List

**Route:** `/leads`
**File:** `apps/web/app/(dashboard)/leads/page.tsx`
**LOC:** 175
**Status:** Complete

## Data Flow

- **Hooks:** `useLeads` + `useLeadsPipeline` + `useDeleteLead` (`lib/hooks/crm/use-leads`), `useUsers` (`lib/hooks/admin/use-users`), `useCRMStore` (`lib/stores/crm-store`), `useDebounce` (`lib/hooks`)
- **API calls:** `GET /api/v1/crm/leads?page&limit&search&stage&ownerId`, `GET /api/v1/crm/leads/pipeline`, `DELETE /api/v1/crm/leads/{id}`, `GET /api/v1/admin/users?limit=100`
- **Envelope:** `data?.data` -- correct for all hooks

## UI Components

- **Pattern:** ListPage (dual-view: table + pipeline Kanban)
- **Key components:** PageHeader, Input (search), Select (x2: stage + owner), LeadsTable, LeadsPipeline, LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Add Deal" button, "Refresh" button, search input, stage filter, owner filter, table/pipeline view toggle, table row click, delete per row, pagination. All wired.

## State Management

- **URL params:** None -- filters in Zustand `useCRMStore.leadFilters` (search, stage, ownerId). View mode in `leadsViewMode`.
- **React Query keys:** Via `useLeads` and `useLeadsPipeline`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** Fetches all users (`limit: 100`) for owner dropdown -- should use a dedicated endpoint or lazy-load
- **Missing:** Loading state present (both views). Error state present (both views). Empty state present (table view). Debounce on search (300ms). Pipeline view has its own loading/error handling.
