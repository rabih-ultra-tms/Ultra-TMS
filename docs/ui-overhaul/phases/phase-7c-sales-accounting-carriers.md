# Phase 7C: Sales, Accounting, Carriers & Commissions Migration

**Priority:** MEDIUM — User-facing but lower traffic than TMS core.

---

## Sales / Quotes (32 patterns)

- [ ] `components/sales/quotes/quote-timeline-section.tsx` (9 colors)
- [ ] `components/sales/quotes/quote-detail-overview.tsx` (9 colors, 1 shadow)
- [ ] `components/sales/quotes/quote-stops-builder.tsx` (6 colors)
- [ ] `components/sales/quotes/quote-rate-section.tsx` (6 colors, 1 shadow)

## Accounting (22 patterns)

- [ ] `components/accounting/acc-recent-invoices.tsx` (9 colors)
- [ ] `components/accounting/aging-report.tsx` (6 colors)
- [ ] `components/accounting/invoice-detail-card.tsx` (2 colors, 2 HTML)

## Carriers (19 patterns)

- [ ] `components/carriers/carrier-drivers-section.tsx` (6 colors)
- [ ] `components/carriers/carrier-insurance-section.tsx` (6 colors)
- [ ] `components/carriers/csa-scores-display.tsx` (5 colors)
- [ ] `components/carriers/fmcsa-lookup.tsx` (3 colors, 2 HTML)

## Commissions (6 patterns)

- [ ] `components/commissions/earnings-chart.tsx` (6 colors)

---

## Pages (42 patterns)

- [ ] `app/(dashboard)/quote-history/page.tsx` (19 colors)
- [ ] `app/(dashboard)/load-planner/history/page.tsx` (12 colors)
- [ ] `app/(dashboard)/load-history/page.tsx` (10 colors)
- [ ] `app/(dashboard)/operations/page.tsx` (9 colors, 7 HTML)
- [ ] `app/(dashboard)/carriers/page.tsx` (5 colors)
- [ ] `app/(dashboard)/carriers/columns.tsx` (5 colors)
- [ ] `app/(dashboard)/carriers/carrier-actions-menu.tsx` (5 colors)

---

## Build Verify
```bash
cd apps/web && npx next build
```

## Commit
```
style: migrate sales, accounting, carrier components to semantic tokens
```
