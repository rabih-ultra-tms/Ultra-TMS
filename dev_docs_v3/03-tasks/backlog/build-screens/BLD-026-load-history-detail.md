# BLD-026: Load History Detail Page

**Priority:** P0
**Service:** TMS Core
**Route:** `/load-history/[id]`
**Page file:** `apps/web/app/(dashboard)/load-history/[id]/page.tsx`

## Current State

Page exists (confirmed in Round 2 audit). Runtime quality unverified (QS-008 task).

## Requirements

- Display full load history detail with timeline, stops, documents
- Show carrier info, rate confirmation, check call history
- Status badge with load lifecycle states
- Action buttons: re-dispatch, clone, generate invoice

## Acceptance Criteria

- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict — no `any` types

## Dependencies

- Backend: `GET /loads/:id`
- Hook: `lib/hooks/operations/use-load-history.ts`
- Components: LoadStatusBadge, Timeline, StopList

## Estimated Effort

M
