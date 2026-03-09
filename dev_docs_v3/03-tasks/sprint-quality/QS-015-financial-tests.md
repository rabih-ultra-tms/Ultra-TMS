# QS-015: Financial Calculation Tests

**Priority:** P0
**Effort:** L (6-8 hours)
**Status:** DONE (2026-03-09)
**Assigned:** Claude Code
**Source:** Tribunal verdict TRIBUNAL-08

---

## Objective

Write 10 tests covering invoice totals, commission splits, settlement reconciliation, and decimal handling.

## Context

Financial calculations (invoicing, commission, settlement) are the highest-risk code in a TMS. A rounding error or miscalculation directly affects revenue. Current test coverage for these modules: 0%. Tribunal mandated 20% coverage for financial modules before production.

## Tests

1. Invoice total — line items sum correctly
2. Invoice with tax — applied after subtotal
3. Invoice with discount — applied correctly
4. Commission split — percentage-based (10% of $5000 margin = $500)
5. Commission split — flat-rate ($50 per load)
6. Commission split — tiered (8% up to $100K, 10% above)
7. Settlement amount — carrier pay matches load rate minus deductions
8. Settlement with quick-pay fee — percentage deducted correctly
9. Decimal precision — integer cents or Decimal, never floating point
10. Multi-line-item invoice — totals, taxes, discounts across items

## Files

- Create/Enhance: `apps/api/src/modules/accounting/services/invoices.service.spec.ts`
- Create/Enhance: `apps/api/src/modules/accounting/services/settlements.service.spec.ts`
- Create/Enhance: `apps/api/src/modules/commission/services/commission-entries.service.spec.ts`

## Acceptance Criteria

- [x] 10 tests written and passing
- [x] All tests use realistic TMS data
- [x] No floating-point arithmetic in tested code
