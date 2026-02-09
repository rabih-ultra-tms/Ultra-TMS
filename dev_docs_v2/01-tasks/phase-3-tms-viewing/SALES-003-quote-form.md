# SALES-003: Quote Create/Edit Form Rebuild

> **Phase:** 3 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/03-sales.md` — Sales hub
3. `dev_docs/12-Rabih-design-Process/03-sales/04-quote-builder.md` — Design spec
4. `apps/web/components/patterns/form-page.tsx` — FormPage pattern (from PATT-003)

## Objective

Rebuild the Quote Create/Edit form from design spec. Multi-step form: Customer → Stops → Rate/Pricing → Review. Supports both create (`/quotes/new`) and edit (`/quotes/:id/edit`) modes. Uses FormPage pattern with Zod validation, dirty state tracking, and unsaved changes warning.

**Business rules:** Minimum margin 15% (warn if below), quote valid for 7 days by default, rate calculation via `POST /api/v1/quotes/calculate-rate`.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/quotes/new/page.tsx` | Quote create page |
| CREATE | `apps/web/app/(dashboard)/quotes/[id]/edit/page.tsx` | Quote edit page (loads existing data) |
| CREATE | `apps/web/components/sales/quotes/quote-form-v2.tsx` | Multi-step form: customer, stops, rate, review |
| CREATE | `apps/web/components/sales/quotes/quote-stops-builder.tsx` | Add/remove/reorder stops |
| CREATE | `apps/web/components/sales/quotes/quote-rate-section.tsx` | Rate entry + calculate button + margin display |
| MODIFY | `apps/web/lib/hooks/use-quotes.ts` | Add useCreateQuote(), useUpdateQuote(), useCalculateRate() |

## Acceptance Criteria

- [ ] `/quotes/new` renders create form
- [ ] `/quotes/:id/edit` renders edit form pre-filled with existing data
- [ ] Step 1 — Customer: searchable customer selector, contact info
- [ ] Step 2 — Stops: add pickup/delivery stops with address, dates, contact
- [ ] Step 3 — Rate: line haul, fuel surcharge, accessorials, total; "Calculate Rate" button calls API
- [ ] Step 4 — Review: summary of all fields before submit
- [ ] Margin % displayed prominently; warning if below 15%
- [ ] Zod validation on each step
- [ ] Unsaved changes warning (ConfirmDialog, not window.confirm)
- [ ] Submit creates/updates quote via API
- [ ] Redirect to quote detail on success
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-003 (FormPage pattern), SALES-001, SALES-002
- Blocks: TMS-005 (Order Form reuses quote conversion flow)

## Reference

- Hub: `dev_docs_v2/03-services/03-sales.md`
- Design spec: `dev_docs/12-Rabih-design-Process/03-sales/04-quote-builder.md`
- Backend: `POST /api/v1/quotes`, `PUT /api/v1/quotes/:id`, `POST /api/v1/quotes/calculate-rate`
- Business rules: min margin 15%, validity 7 days, rate calculation engine
