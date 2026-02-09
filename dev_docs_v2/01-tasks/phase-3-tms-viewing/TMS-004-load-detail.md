# TMS-004: Load Detail Page

> **Phase:** 3 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub
3. `dev_docs/12-Rabih-design-Process/04-tms-core/06-load-detail.md` — Design spec
4. `apps/web/components/patterns/detail-page.tsx` — DetailPage pattern (from PATT-002)

## Objective

Build the Load Detail page at `/operations/loads/:id`. This is the most information-dense page in TMS Core — shows load overview, stops with status, carrier info, tracking data, documents, and timeline. Sidebar displays carrier details, rate/margin. Tabs for each section.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/loads/[id]/page.tsx` | Load detail page with tabs |
| CREATE | `apps/web/components/tms/loads/load-detail-card.tsx` | Overview tab: load summary, status, dates, charges |
| CREATE | `apps/web/components/tms/loads/load-stops-list.tsx` | Stops tab: ordered stops with status, times, addresses |
| CREATE | `apps/web/components/tms/loads/load-carrier-section.tsx` | Carrier info sidebar: name, MC#, contact, rate |
| CREATE | `apps/web/components/tms/loads/load-documents-section.tsx` | Documents tab: BOL, POD, rate con |
| MODIFY | `apps/web/lib/hooks/tms/use-loads.ts` | Add useLoad(id), useLoadStops(id), useLoadDocuments(id), useLoadTimeline(id) |

## Acceptance Criteria

- [ ] `/operations/loads/:id` renders load detail (no 404)
- [ ] Overview tab: load #, order #, status badge, pickup/delivery dates, origin/destination, equipment, weight, rate, margin
- [ ] Stops tab: ordered stop list with type, address, scheduled/actual times, status badges
- [ ] Documents tab: list of attached documents (BOL, POD, rate confirmation)
- [ ] Timeline tab: activity feed (status changes, check calls, notes)
- [ ] Carrier sidebar: carrier name, MC#, DOT#, primary contact, carrier rate
- [ ] Edit button → `/operations/loads/:id/edit`
- [ ] Back button → `/operations/loads`
- [ ] Status change dropdown (valid transitions per state machine)
- [ ] Loading, error, empty states for each tab
- [ ] Active tab persisted in URL hash
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-002 (DetailPage pattern), TMS-003 (loads list for navigation)
- Blocks: TMS-007 (New Load Form), TMS-009 (Stop Management), TMS-010 (Check Call Log)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Loads section
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/06-load-detail.md`
- Backend: `GET /api/v1/loads/:id`, `/stops`, `/checkcalls`, `/documents`, `/timeline`
