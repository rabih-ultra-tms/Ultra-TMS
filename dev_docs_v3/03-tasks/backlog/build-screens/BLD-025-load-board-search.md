# BLD-025: Load Board Search

**Priority:** P0
**Service:** Load Board
**Route:** `/load-board/search`
**Page file:** `apps/web/app/(dashboard)/load-board/search/page.tsx`

## Current State
Fully built (64 LOC). Uses `useSearchPostings` hook with `LoadPostingSearchFilters` state (typed from `@/types/load-board`). Renders `LoadSearchFilters` for origin/destination/equipment/date filtering and `LoadSearchResults` for results display. Clear filters resets to empty state (page 1, limit 25). Error state with retry via `refetch`.

## Requirements
- Verify `useSearchPostings` connects to backend search endpoint
- Verify filter fields match backend query parameters
- Results should show posting details with actionable buttons (Book, Bid, Contact)
- Pagination for large result sets (currently uses limit 25)

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Search filters produce correct results
- [ ] Clear filters resets all fields
- [ ] Results display actionable posting cards

## Dependencies
- Backend: `GET /load-board/postings/search` or similar endpoint
- Hook: `apps/web/lib/hooks/load-board/index.ts` (useSearchPostings)
- Components: `LoadSearchFilters`, `LoadSearchResults`

## Estimated Effort
M
