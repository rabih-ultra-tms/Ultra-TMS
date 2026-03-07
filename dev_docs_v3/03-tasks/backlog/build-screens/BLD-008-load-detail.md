# BLD-008: Load Detail

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/loads/[id]`
**Page file:** `apps/web/app/(dashboard)/operations/loads/[id]/page.tsx`

## Current State
Server component wrapper (6 LOC) that delegates to `LoadDetailClient` (`client-page.tsx`). The client component renders: header with load info (`LoadDetailHeader`), summary card, tracking card, and tabbed content (Route, Carrier, Documents, Timeline, Check Calls). Tab state persisted in URL hash. Full loading/error/not-found states handled.

## Requirements
- Verify all tab components render real data from backend
- Check Calls tab needs backend CRUD (BACK-006)
- Documents tab needs upload/storage backend (BACK-014)
- Tracking card needs real GPS data via WebSocket

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] All tabs render with real load data
- [ ] Tab persistence via URL hash works

## Dependencies
- Backend: `GET /loads/:id`, check calls CRUD, document storage
- Hook: `apps/web/lib/hooks/tms/use-loads.ts` (useLoad)
- Components: `LoadDetailHeader`, `LoadSummaryCard`, `LoadTrackingCard`, `LoadRouteTab`, `LoadCarrierTab`, `LoadDocumentsTab`, `LoadTimelineTab`, `LoadCheckCallsTab`

## Estimated Effort
L
