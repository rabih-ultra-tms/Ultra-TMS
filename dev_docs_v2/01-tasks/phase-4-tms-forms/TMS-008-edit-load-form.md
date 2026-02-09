# TMS-008: Edit Load Form

> **Phase:** 4 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub
3. `apps/web/components/tms/loads/load-form.tsx` — Reuse from TMS-007

## Objective

Build the Edit Load Form at `/operations/loads/:id/edit`. Reuses LoadForm from TMS-007 in edit mode. Carrier field becomes read-only after PICKED_UP status (can't reassign mid-transit).

**Business rule:** Cancellation after dispatch + 2h incurs TONU fee (25% of carrier rate, max $500).

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/loads/[id]/edit/page.tsx` | Edit load page |
| MODIFY | `apps/web/components/tms/loads/load-form.tsx` | Add edit mode: initialData prop, disable carrier after PICKED_UP |
| MODIFY | `apps/web/lib/hooks/tms/use-loads.ts` | Add useUpdateLoad() mutation |

## Acceptance Criteria

- [ ] `/operations/loads/:id/edit` loads existing load and pre-fills form
- [ ] Carrier field read-only after PICKED_UP status
- [ ] All other fields editable
- [ ] Submit → PUT `/api/v1/loads/:id` → redirect to load detail
- [ ] Cancel button → back to load detail
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: TMS-007 (LoadForm component)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md`
- Backend: `GET /api/v1/loads/:id`, `PUT /api/v1/loads/:id`
