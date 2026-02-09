# SALES-002: Quote Detail Rebuild

> **Phase:** 3 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/03-sales.md` — Sales hub
3. `dev_docs/12-Rabih-design-Process/03-sales/03-quote-detail.md` — Design spec
4. `apps/web/components/patterns/detail-page.tsx` — DetailPage pattern (from PATT-002)

## Objective

Rebuild the Quote Detail page from design spec at `/quotes/:id`. Shows full quote data with tabs for Overview (pricing, stops, customer), Versions (revision history), and Timeline (activity). Includes action buttons: Edit, Clone, Send, Accept/Reject, Convert to Order.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/quotes/[id]/page.tsx` | Quote detail page with tabs |
| CREATE | `apps/web/components/sales/quotes/quote-detail-overview.tsx` | Overview: pricing breakdown, stops, customer info |
| CREATE | `apps/web/components/sales/quotes/quote-versions-section.tsx` | Version history list |
| CREATE | `apps/web/components/sales/quotes/quote-timeline-section.tsx` | Activity timeline |
| CREATE | `apps/web/components/sales/quotes/quote-actions-bar.tsx` | Action buttons: Edit, Clone, Send, Convert |
| MODIFY | `apps/web/lib/hooks/use-quotes.ts` | Add useQuote(id), useQuoteVersions(id), useQuoteTimeline(id), quote mutations |

## Acceptance Criteria

- [ ] `/quotes/:id` renders quote detail
- [ ] Overview: quote #, customer, status badge, pickup/delivery dates, stops list, pricing breakdown (line haul, fuel, accessorials, total), margin %
- [ ] Versions tab: list of revisions with date, changes, who made them
- [ ] Timeline tab: chronological activity feed
- [ ] Action buttons work: Edit → `/quotes/:id/edit`, Clone (POST `/clone`), Send (POST `/send`)
- [ ] "Convert to Order" button → POST `/api/v1/quotes/:id/convert` → redirect to new order
- [ ] Back button → `/quotes`
- [ ] Loading, error states
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-002, SALES-001 (quotes list)
- Blocks: SALES-003 (Quote Form — edit mode loads detail)

## Reference

- Hub: `dev_docs_v2/03-services/03-sales.md`
- Design spec: `dev_docs/12-Rabih-design-Process/03-sales/03-quote-detail.md`
- Backend: `GET /api/v1/quotes/:id`, `/versions`, `/timeline`, POST `/clone`, `/send`, `/convert`
