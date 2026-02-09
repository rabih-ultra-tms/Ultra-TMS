# TMS-006: Edit Order Form

> **Phase:** 4 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub
3. `apps/web/components/tms/orders/order-form.tsx` — Reuse from TMS-005

## Objective

Build the Edit Order Form at `/operations/orders/:id/edit`. Reuses the OrderForm component from TMS-005 in edit mode. Loads existing order data and pre-fills all fields. Customer field is read-only after BOOKED status.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/orders/[id]/edit/page.tsx` | Edit order page |
| MODIFY | `apps/web/components/tms/orders/order-form.tsx` | Add edit mode: accept initialData prop, disable customer after BOOKED |
| MODIFY | `apps/web/lib/hooks/tms/use-orders.ts` | Add useUpdateOrder() mutation |

## Acceptance Criteria

- [ ] `/operations/orders/:id/edit` loads existing order and pre-fills form
- [ ] Customer field read-only after BOOKED status
- [ ] All other fields editable
- [ ] Zod validation same as create
- [ ] Submit → PUT `/api/v1/orders/:id` → redirect to order detail
- [ ] Unsaved changes warning
- [ ] Cancel button → back to order detail
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: TMS-005 (OrderForm component)
- Blocks: None directly

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md`
- Backend: `GET /api/v1/orders/:id`, `PUT /api/v1/orders/:id`
