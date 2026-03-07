# Companies Activities

**Route:** `/companies/[id]/activities`
**File:** `apps/web/app/(dashboard)/companies/[id]/activities/page.tsx`
**LOC:** 53
**Status:** Complete

## Data Flow

- **Hooks:** `useCustomer(companyId)` (`lib/hooks/crm/use-customers`), `useActivities({ companyId })` (`lib/hooks/crm/use-activities`)
- **API calls:** `GET /api/v1/crm/customers/{id}`, `GET /api/v1/crm/activities?companyId&page=1&limit=50`
- **Envelope:** `data?.data` -- correct for both

## UI Components

- **Pattern:** ListPage (timeline view within company context)
- **Key components:** PageHeader, CustomerTabs, ActivityTimeline, LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Back" button. No create activity action.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useActivities({ companyId })`

## Quality Assessment

- **Score:** 6/10
- **Bugs:** None
- **Anti-patterns:** Hardcoded `limit: 50` with no pagination
- **Missing:** Loading state present. Error state present. Empty state present. No create activity form. No pagination.
