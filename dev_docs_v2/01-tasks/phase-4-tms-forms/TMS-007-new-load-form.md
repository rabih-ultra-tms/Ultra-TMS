# TMS-007: New Load Form

> **Phase:** 4 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (7h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub (load endpoints, carrier assignment)
3. `dev_docs/12-Rabih-design-Process/04-tms-core/07-load-builder.md` — Design spec
4. `apps/web/components/patterns/form-page.tsx` — FormPage pattern

## Objective

Build the New Load Form at `/operations/loads/new`. A load is created from an order — stops are pre-filled from the parent order. Key addition: carrier assignment section with searchable carrier selector and rate negotiation. Backend validates carrier compliance before assignment.

**Key business rules:**
- Carrier must be ACTIVE + COMPLIANT + valid insurance beyond delivery date
- Carrier rate must be > 0
- Load number format: {PREFIX}-{YEAR}-{SEQUENCE}
- Delivery date ≥ pickup date

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/loads/new/page.tsx` | New load page |
| CREATE | `apps/web/components/tms/loads/load-form.tsx` | Load form with carrier assignment |
| CREATE | `apps/web/components/tms/loads/carrier-selector.tsx` | Searchable carrier picker with compliance status |
| MODIFY | `apps/web/lib/hooks/tms/use-loads.ts` | Add useCreateLoad(), useAssignCarrier() |

## Acceptance Criteria

- [ ] `/operations/loads/new` renders load form
- [ ] `/operations/loads/new?orderId=xxx` pre-fills stops from order
- [ ] Carrier selector: search by name/MC#, shows compliance status + insurance expiry
- [ ] Blocks non-compliant carriers with message
- [ ] Rate field with margin calculation (customer rate vs carrier rate)
- [ ] Equipment type, weight pre-filled from order
- [ ] Zod validation
- [ ] Submit → POST `/api/v1/loads` → redirect to load detail
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-003, TMS-003, TMS-004
- Blocks: TMS-008 (Edit Load reuses form)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md`
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/07-load-builder.md`
- Backend: `POST /api/v1/loads`, `POST /api/v1/loads/:id/assign`, `GET /api/v1/carriers/search`
- Business rules: carrier compliance, margin enforcement
