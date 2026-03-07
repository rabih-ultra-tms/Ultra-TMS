# Leads Activities

**Route:** `/leads/[id]/activities`
**File:** `apps/web/app/(dashboard)/leads/[id]/activities/page.tsx`
**LOC:** 68
**Status:** Complete

## Data Flow

- **Hooks:** `useLead(leadId)` (`lib/hooks/crm/use-leads`), `useActivities({ leadId })` + `useCreateActivity` (`lib/hooks/crm/use-activities`)
- **API calls:** `GET /api/v1/crm/leads/{id}`, `GET /api/v1/crm/activities?leadId&page=1&limit=50`, `POST /api/v1/crm/activities`
- **Envelope:** `data?.data` -- correct

## UI Components

- **Pattern:** ListPage with inline create form (ActivityForm + ActivityTimeline)
- **Key components:** PageHeader, ActivityForm (`components/crm/activities/activity-form`), ActivityTimeline (`components/crm/activities/activity-timeline`), LoadingState, ErrorState, EmptyState
- **Interactive elements:** ActivityForm with submit ("Log Activity"), "Back" button. Form auto-attaches `leadId` to created activity.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useActivities({ leadId })` and `useCreateActivity`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** Hardcoded `limit: 50` with no pagination
- **Missing:** Loading state present. Error state present. Empty state present. Inline create form present (unlike companies/activities which has none). No pagination beyond 50.
