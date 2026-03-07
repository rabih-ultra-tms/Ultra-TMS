# Commission Sales Reps List

**Route:** `/commissions/reps`
**File:** `apps/web/app/(dashboard)/commissions/reps/page.tsx`
**LOC:** 83
**Status:** Complete

## Data Flow

- **Hooks:** `useReps` (`lib/hooks/commissions/use-reps`)
- **API calls:** `GET /api/v1/commissions/reps?page&limit&search`
- **Envelope:** `data?.data` and `data?.pagination` -- correct

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern with search filter)
- **Key components:** ListPage (`components/patterns/list-page`), getRepColumns (`components/commissions/rep-commissions-table`), Input (search)
- **Interactive elements:** Search input (Enter to submit), row click (navigates to rep detail). All wired. No "Add Rep" button (reps come from user system).

## State Management

- **URL params:** page, limit, search from `useSearchParams`. Page changes update URL.
- **React Query keys:** Via `useReps` with URL-derived params
- **Local state:** `searchInput` (local copy, submitted on Enter)

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:**
  - `useSearchParams` not in Suspense boundary
  - Search requires Enter key -- no debounce, no search button
- **Missing:** Loading/error/empty states via ListPage. No status filter (ACTIVE/INACTIVE). No plan filter. Clean and concise list page.
