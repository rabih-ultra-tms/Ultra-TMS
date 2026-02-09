# TMS-010: Check Call Log

> **Phase:** 4 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (5h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub (check call endpoints)
3. `dev_docs/12-Rabih-design-Process/04-tms-core/13-check-calls.md` — Design spec

## Objective

Build the Check Call Log as a tab within the Load Detail page, plus an overdue check calls view. Dispatchers add check calls to track driver progress. Timeline view shows chronological entries with type, location, notes.

**Business rules — check call intervals:**
- Pickup: within 1 hour of pickup time
- In-Transit: every 4 hours
- Pre-Delivery: within 1 hour of delivery window
- Post-Delivery: within 24 hours to confirm actual delivery
- Overdue: loads missing check calls >4 hours flagged

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/tms/checkcalls/check-call-timeline.tsx` | Timeline view of check calls |
| CREATE | `apps/web/components/tms/checkcalls/check-call-form.tsx` | Add new check call form (type, location, notes) |
| CREATE | `apps/web/components/tms/checkcalls/overdue-checkcalls.tsx` | Overdue check calls list (standalone view) |
| CREATE | `apps/web/lib/hooks/tms/use-checkcalls.ts` | React Query hooks: useCheckCalls(loadId), useCreateCheckCall(), useOverdueCheckCalls() |
| MODIFY | `apps/web/app/(dashboard)/operations/loads/[id]/page.tsx` | Add Check Calls tab content |

## Acceptance Criteria

- [ ] Check Calls tab on Load Detail shows timeline of entries
- [ ] Each entry: type badge (CHECK_CALL, ARRIVAL, DEPARTURE, DELAY, ISSUE), timestamp, location, notes, created by
- [ ] "Add Check Call" form: type selector, location text, notes textarea, submit button
- [ ] Submit → POST `/api/v1/checkcalls` → appends to timeline
- [ ] Overdue indicator when last check call >4 hours ago
- [ ] Loading state
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: TMS-004 (Load Detail page)
- Blocks: TMS-012 (Operations Dashboard shows overdue check calls)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Check Calls section
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/13-check-calls.md`
- Backend: checkcalls CRUD + `/overdue` + `/bulk` + `/stats`
