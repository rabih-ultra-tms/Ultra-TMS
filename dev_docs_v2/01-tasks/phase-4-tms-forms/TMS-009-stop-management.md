# TMS-009: Stop Management

> **Phase:** 4 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (5h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub (stops endpoints)
3. `dev_docs/12-Rabih-design-Process/04-tms-core/09-stop-management.md` — Design spec

## Objective

Build the Stop Management view as a tab within the Load Detail page. Displays ordered list of stops with inline status updates. Dispatchers use "Mark Arrived" and "Mark Departed" buttons to track progress in real-time.

**Business rules:**
- Detention: free time 2 hours, rate $75/hour after, cap at 8 hours
- `billableHours = Math.max(0, totalHours - 2); cappedHours = Math.min(billableHours, 8)`
- Stop status: PENDING → ARRIVED → DEPARTED → COMPLETED

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/tms/stops/stops-table.tsx` | Stops list with inline actions |
| CREATE | `apps/web/components/tms/stops/stop-card.tsx` | Individual stop card with address, times, status |
| CREATE | `apps/web/components/tms/stops/stop-actions.tsx` | Arrive/Depart buttons with timestamp capture |
| CREATE | `apps/web/lib/hooks/tms/use-stops.ts` | React Query hooks: useStops(loadId), useArriveStop(), useDepartStop() |
| MODIFY | `apps/web/app/(dashboard)/operations/loads/[id]/page.tsx` | Add Stops tab content |

## Acceptance Criteria

- [ ] Stops tab on Load Detail shows ordered list of stops
- [ ] Each stop shows: type (PICKUP/DELIVERY), address, contact, scheduled time, actual time, status badge
- [ ] "Mark Arrived" button → PATCH `/api/v1/stops/:id/arrive` (captures timestamp)
- [ ] "Mark Departed" button → PATCH `/api/v1/stops/:id/depart` (captures timestamp)
- [ ] Detention time calculated and displayed when applicable
- [ ] Stop status badges update in real-time after action
- [ ] Reorder stops via drag-drop (POST `/api/v1/stops/reorder`)
- [ ] Loading state
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: TMS-004 (Load Detail page), COMP-010 (StopList component)
- Blocks: TMS-010 (Check Call Log shares load detail tabs)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Stops section
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/09-stop-management.md`
- Backend: stops CRUD + `/arrive`, `/depart`, `/reorder`, `/detention`
