# BLD-011: Dispatch Board

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/dispatch`
**Page file:** `apps/web/app/(dashboard)/operations/dispatch/page.tsx`

## Current State
Server component (29 LOC) with Next.js metadata. Renders `DispatchBoard` component inside `Suspense` with `DispatchBoardSkeleton` fallback. All operational logic lives in the `DispatchBoard` component.

## Requirements
- Verify `DispatchBoard` component implements drag-drop status management
- Real-time updates via WebSocket `/dispatch` namespace (QS-001)
- Multi-view workspace (list, board, timeline views)
- Carrier assignment workflow
- Load status transitions via drag-drop
- Performance for 50+ loads/day workload

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Drag-drop status changes persist to backend
- [ ] Real-time updates reflect across all connected clients
- [ ] Carrier assignment modal works end-to-end

## Dependencies
- Backend: `GET /loads`, `PATCH /loads/:id/status`, `POST /loads/:id/assign`, WebSocket `/dispatch` namespace
- Hook: Various load and dispatch hooks
- Components: `DispatchBoard`, `DispatchBoardSkeleton`

## Estimated Effort
XL
