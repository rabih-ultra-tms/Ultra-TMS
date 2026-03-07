# Commission Plans List

**Route:** `/commissions/plans`
**File:** `apps/web/app/(dashboard)/commissions/plans/page.tsx`
**LOC:** 224
**Status:** Complete

## Data Flow

- **Hooks:** `usePlans` (`lib/hooks/commissions/use-plans`)
- **API calls:** `GET /api/v1/commissions/plans?page&limit&search&type`
- **Envelope:** `data?.data` and `data?.pagination` -- correct

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern with inline filters and column definitions)
- **Key components:** ListPage (`components/patterns/list-page`), inline `getPlanColumns` (column definitions), Input (search), Select (type filter), Button, Link, Badge
- **Interactive elements:** "New Plan" Link button, search input (Enter to submit), type filter dropdown, row click (navigates to detail). All wired.

## State Management

- **URL params:** page, limit, search, type from `useSearchParams`. Page changes update URL.
- **React Query keys:** Via `usePlans` with URL-derived params
- **Local state:** `searchInput` (local copy of search, submitted on Enter)

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:**
  - `useSearchParams` not in Suspense boundary
  - Column definitions (`getPlanColumns`) and `PLAN_TYPE_LABELS` defined inline in page file -- should be in `components/commissions/`
  - Search requires Enter key press -- no debounce, no search button
  - `PERCENT_REVENUE` missing from Select filter options but exists in PLAN_TYPE_LABELS
- **Missing:** Loading/error/empty states via ListPage. Has type filter (good). No status filter (ACTIVE/INACTIVE). Clean ListPage usage overall.
