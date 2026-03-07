# BLD-023: Load Board Dashboard

**Priority:** P0
**Service:** Load Board
**Route:** `/load-board`
**Page file:** `apps/web/app/(dashboard)/load-board/page.tsx`

## Current State
Fully built (97 LOC). Uses `useLoadBoardDashboardStats` and `useRecentPostings` hooks. Renders KPI stat cards (`LbDashboardStats`), quick links grid (Post Load, Search Available, My Postings), and recent postings table (`LbRecentPostings`). Header with "Search Available" and "Post Load" action buttons.

## Requirements
- Verify hooks connect to backend load-board module (extensive module with accounts, analytics, capacity, posting, rules, services subdirectories)
- KPI stats should show: active postings, total bids, accepted, expired
- Recent postings table with posting details and status
- "My Postings" link points back to self -- may need a filtered view

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Dashboard KPIs reflect real load board data
- [ ] Quick links navigate correctly

## Dependencies
- Backend: Load board dashboard stats endpoint, `GET /load-board/postings`
- Hook: `apps/web/lib/hooks/load-board/index.ts`
- Components: `LbDashboardStats`, `LbRecentPostings`

## Estimated Effort
S
