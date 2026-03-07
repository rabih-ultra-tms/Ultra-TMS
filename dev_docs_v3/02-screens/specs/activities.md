# Activities (Global)

**Route:** `/activities`
**File:** `apps/web/app/(dashboard)/activities/page.tsx`
**LOC:** 47
**Status:** Complete

## Data Flow

- **Hooks:** `useActivities` (`lib/hooks/crm/use-activities`)
- **API calls:** `GET /api/v1/crm/activities?page=1&limit=50`
- **Envelope:** `data?.data` -- correct

## UI Components

- **Pattern:** ListPage (timeline view)
- **Key components:** PageHeader, ActivityTimeline (`components/crm/activities/activity-timeline`), LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Refresh" button, "Log Activity" button (disabled -- not wired). All except create are wired.

## State Management

- **URL params:** None
- **React Query keys:** Via `useActivities({ page: 1, limit: 50 })`

## Quality Assessment

- **Score:** 5/10
- **Bugs:**
  - "Log Activity" button is `disabled` with no handler -- non-functional
- **Anti-patterns:** Hardcoded `limit: 50` with no pagination. No filters or search.
- **Missing:** Loading present. Error present. Empty present. Create action disabled/non-functional. No pagination. No date filter.
