# BUG-002: Load History Detail Page 404

> **Phase:** 0 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** M (3-4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/sales-carrier.md` — SC-002 details
3. `dev_docs/11-ai-dev/web-dev-prompts/04-tms-core-ui.md` — TMS Core UI spec

## Objective

Build the missing `/load-history/[id]/page.tsx` detail page. Clicking a load in the load history list results in a 404. The backend `GET /api/v1/loads/:id` returns full data including stops, check calls, and tracking info.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/load-history/[id]/page.tsx` | Load detail page with tabs |
| CREATE | `apps/web/components/loads/load-detail-header.tsx` | Load summary (status, carrier, dates, rate) |
| CREATE | `apps/web/components/loads/load-stops-section.tsx` | Pickup/delivery stop list with addresses and times |
| CREATE | `apps/web/components/loads/load-tracking-section.tsx` | Check calls timeline with locations |
| MODIFY | `apps/web/lib/hooks/use-loads.ts` | Add `useLoad(id)` hook if not exists |

## Acceptance Criteria

- [ ] `/load-history/[id]` renders load detail (no more 404)
- [ ] Header shows: load number, status badge, carrier name, pickup/delivery dates, rate
- [ ] Stops tab shows ordered list of stops with addresses, dates, and status
- [ ] Tracking tab shows check call timeline with locations and timestamps
- [ ] Back button navigates to `/load-history`
- [ ] Loading, error, and empty states
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: None
- Blocks: None

## Reference

- Audit: `dev_docs_v2/04-audit/sales-carrier.md` → SC-002
- Backend endpoint: `GET /api/v1/loads/:id` (returns load + stops + check calls + tracking)
