# TMS-005: New Order Form (Multi-Step)

> **Phase:** 4 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** XL (10h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub (order endpoints, status machine)
3. `dev_docs/12-Rabih-design-Process/04-tms-core/04-order-entry.md` — Design spec
4. `apps/web/components/patterns/form-page.tsx` — FormPage pattern (from PATT-003)

## Objective

Build the New Order Form at `/operations/orders/new`. This is the most complex form in the MVP — multi-step wizard: Customer → Commodity/Equipment → Stops → Rate Entry → Review. Supports pre-fill from quote via `POST /api/v1/orders/from-quote/:quoteId` (linked from quote detail "Convert to Order" button).

**Key business rules:**
- Customer credit check: APPROVED customers must have available credit (rate ≤ creditLimit - currentBalance)
- COD/PREPAID customers: always allowed
- PENDING/HOLD/DENIED customers: blocked from ordering
- Minimum margin enforcement: warn if below 15%
- Pickup date cannot be in the past or >90 days future

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/orders/new/page.tsx` | New order page |
| CREATE | `apps/web/components/tms/orders/order-form.tsx` | Multi-step form container |
| CREATE | `apps/web/components/tms/orders/order-customer-step.tsx` | Step 1: customer selector + credit check display |
| CREATE | `apps/web/components/tms/orders/order-cargo-step.tsx` | Step 2: commodity, weight, equipment type, special instructions |
| CREATE | `apps/web/components/tms/orders/order-stops-builder.tsx` | Step 3: add/remove/reorder stops with addresses + dates |
| CREATE | `apps/web/components/tms/orders/order-rate-step.tsx` | Step 4: customer rate, fuel surcharge, accessorials, margin |
| CREATE | `apps/web/components/tms/orders/order-review-step.tsx` | Step 5: summary before submit |
| MODIFY | `apps/web/lib/hooks/tms/use-orders.ts` | Add useCreateOrder(), useOrderFromQuote(quoteId) |

## Acceptance Criteria

- [ ] `/operations/orders/new` renders multi-step form
- [ ] `/operations/orders/new?quoteId=xxx` pre-fills from quote data
- [ ] Step 1: searchable customer selector, shows credit status/limit
- [ ] Step 1: blocks PENDING/HOLD/DENIED customers with message
- [ ] Step 2: commodity type, weight (1-80,000 lbs), equipment type, temperature range, special instructions
- [ ] Step 3: add pickup + delivery stops with address, contact, appointment dates
- [ ] Step 3: delivery date ≥ pickup date validation
- [ ] Step 4: rate entry with margin calculation displayed
- [ ] Step 4: warning if margin below 15%
- [ ] Step 5: full review summary, confirm button
- [ ] Zod validation per step
- [ ] Unsaved changes warning (ConfirmDialog)
- [ ] Submit → POST `/api/v1/orders` → redirect to order detail
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-003, TMS-001, TMS-002
- Blocks: TMS-006 (Edit Order reuses form)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md`
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/04-order-entry.md`
- Backend: `POST /api/v1/orders`, `POST /api/v1/orders/from-quote/:quoteId`
- Business rules: `dev_docs/11-ai-dev/92-business-rules-reference.md` → Customer Rules, Load Rules
