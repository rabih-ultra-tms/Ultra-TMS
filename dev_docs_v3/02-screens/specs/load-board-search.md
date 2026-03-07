# Load Board Search

**Route:** `/load-board/search`
**File:** `apps/web/app/(dashboard)/load-board/search/page.tsx`
**LOC:** 64
**Status:** Complete

## Data Flow

- **Hooks:** `useSearchPostings` (`lib/hooks/load-board`)
- **API calls:** `GET /api/v1/load-board/search?page&limit&originCity&originState&destinationCity&destinationState&equipmentType&maxWeight&pickupDateFrom&pickupDateTo`
- **Envelope:** `data?.data` via hook -- correct

## UI Components

- **Pattern:** Custom (header + filter panel + results grid)
- **Key components:** LoadSearchFilters (`components/load-board/load-search-filters`), LoadSearchResults (`components/load-board/load-search-results`), Button, Link
- **Interactive elements:** Back link to `/load-board`, filter inputs (via LoadSearchFilters), clear filters button, result cards (via LoadSearchResults), retry on error. All wired.

## State Management

- **URL params:** None -- filter state in local React state only
- **React Query keys:** Via `useSearchPostings(filters)`
- **Local state:** `filters` (LoadPostingSearchFilters object with page, limit, and optional filter fields)

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:**
  - Filter state in local React state, not URL params -- search state lost on navigation/refresh
  - `void refetch()` cast to satisfy event handler -- minor
- **Missing:** Loading/error states delegated to LoadSearchResults component. Clear filters resets to `EMPTY_FILTERS` (good). Typed filter interface (good). No pagination controls visible in page (may be in LoadSearchResults). Filter state should be in URL for shareability.
