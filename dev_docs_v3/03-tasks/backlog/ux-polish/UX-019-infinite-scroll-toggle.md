# UX-019: Infinite Scroll vs Pagination Toggle

**Priority:** P2
**Service:** Frontend UX
**Scope:** Allow users to choose between infinite scroll and traditional pagination

## Current State
All list pages use traditional pagination with Previous/Next buttons and page numbers. Some users may prefer infinite scroll for faster browsing.

## Requirements
- Add preference toggle (pagination vs infinite scroll)
- Implement infinite scroll using Intersection Observer
- Persist preference per user
- Ensure both modes work with current filter/sort state
- Show "Load more" button as fallback

## Acceptance Criteria
- [ ] Toggle between pagination and infinite scroll
- [ ] Infinite scroll loads next page on scroll
- [ ] Preference persisted
- [ ] Works with all filter/sort combinations
- [ ] Performance acceptable with 500+ items
- [ ] "Load more" button available as fallback

## Dependencies
- None

## Estimated Effort
M
