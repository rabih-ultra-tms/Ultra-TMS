# UX-011: Table Column Sorting Persistence

**Priority:** P2
**Service:** Frontend UX
**Scope:** Persist table sort state across page navigation

## Current State
Sorting state is held in React component state (`useState<SortingState>`) and resets when navigating away and back. The carriers page supports server-side sorting via `sortBy`/`sortOrder` params.

## Requirements
- Persist sorting state in URL search params
- Restore sort state when navigating back to a list page
- Support multi-column sorting if needed
- Sync URL params with table sort state

## Acceptance Criteria
- [ ] Sort state stored in URL params (e.g., ?sortBy=name&sortOrder=asc)
- [ ] Sort state restored from URL on page load
- [ ] Sort state survives page navigation (back button)
- [ ] Applied to all list pages with sortable columns

## Dependencies
- UX-012 (filter persistence) should be done together for consistency

## Estimated Effort
M
