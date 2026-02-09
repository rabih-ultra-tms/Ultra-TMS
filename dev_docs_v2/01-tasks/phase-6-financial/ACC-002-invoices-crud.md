# ACC-002: Invoices (List, Detail, Create)

> **Phase:** 6 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/06-accounting.md` — Accounting hub (invoice endpoints, state machine)
3. `dev_docs/12-Rabih-design-Process/06-accounting/02-invoices-list.md` — List design spec
4. `dev_docs/12-Rabih-design-Process/06-accounting/03-invoice-detail.md` — Detail design spec

## Objective

Build Invoices list, detail, and create screens. Most critical accounting feature — every delivered load generates an invoice. Covers the full invoice lifecycle: DRAFT → PENDING → SENT → VIEWED → PARTIAL/PAID/OVERDUE/VOID.

**Business rules:**
- Auto-generate invoice on POD confirmation (if tenant setting enabled)
- Due date = invoice date + customer.paymentTerms (default NET30)
- Payment terms: NET15 (15d), NET21 (21d), NET30 (30d), NET45 (45d), COD (0d)
- PDF generation via backend

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/accounting/invoices/page.tsx` | Invoices list |
| CREATE | `apps/web/app/(dashboard)/accounting/invoices/[id]/page.tsx` | Invoice detail |
| CREATE | `apps/web/app/(dashboard)/accounting/invoices/new/page.tsx` | Invoice create |
| CREATE | `apps/web/components/accounting/invoices-table.tsx` | Invoice list columns |
| CREATE | `apps/web/components/accounting/invoice-detail-card.tsx` | Invoice detail with line items |
| CREATE | `apps/web/components/accounting/invoice-form.tsx` | Invoice create form |
| CREATE | `apps/web/components/accounting/invoice-status-badge.tsx` | Status badge for invoices |
| CREATE | `apps/web/lib/hooks/accounting/use-invoices.ts` | All invoice hooks |

## Acceptance Criteria

- [ ] `/accounting/invoices` renders invoice list with filters (status, customer, date range)
- [ ] `/accounting/invoices/:id` renders invoice detail with line items, payments, timeline
- [ ] `/accounting/invoices/new` renders create form with customer, load selection, line items
- [ ] Status badges use design tokens
- [ ] Actions: Send (POST `/send`), Void (POST `/void`), Download PDF (GET `/pdf`)
- [ ] Loading, empty, error states
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-001, PATT-002, PATT-003
- Blocks: ACC-003 (Payments reference invoices)

## Reference

- Hub: `dev_docs_v2/03-services/06-accounting.md`
- Backend: 12 invoice endpoints
- State machine: DRAFT → PENDING → SENT → VIEWED → PARTIAL/PAID/OVERDUE/VOID
