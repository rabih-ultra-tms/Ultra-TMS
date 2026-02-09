# DOC-002: Business Rules Reference Doc

> **Phase:** 5 | **Priority:** P2 | **Status:** NOT STARTED
> **Effort:** M (4-6h)
> **Assigned:** Unassigned
> **Added:** v2 — Logistics expert review ("Developers building frontend won't know the business rules")

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs/11-ai-dev/92-business-rules-reference.md` — Original business rules (source)
3. `dev_docs_v2/05-references/doc-map.md` — Where things live

## Objective

Create a quick-reference business rules document at `dev_docs_v2/05-references/business-rules-quick-ref.md`. This consolidates critical business logic that frontend developers MUST know when building TMS screens — margin thresholds, credit hold triggers, detention calculations, status transition rules, etc.

**Source:** Extract and consolidate from `dev_docs/11-ai-dev/92-business-rules-reference.md` (which was cut from dev_docs_v2 but shouldn't have been).

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `dev_docs_v2/05-references/business-rules-quick-ref.md` | Business rules quick reference |

## Content Outline

The document should cover:

1. **Margin Rules** — Hard floor (cannot book below X%), warning threshold (15%), target display by lane
2. **Credit Management** — Credit hold triggers, COD thresholds, credit limit enforcement, credit check on order creation
3. **Detention Calculations** — Free time defaults (2h pickup, 2h delivery), hourly rate ($75/hr), max charge caps
4. **TONU (Truck Ordered Not Used)** — When it applies, flat fee, carrier notification rules
5. **Check Call Intervals** — Default 4h, overdue threshold, alert escalation
6. **Load Status Transitions** — Valid transitions (PLANNING→PENDING→TENDERED→ACCEPTED→DISPATCHED→AT_PICKUP→PICKED_UP→IN_TRANSIT→AT_DELIVERY→DELIVERED→COMPLETED), invalid transition blocks
7. **Accessorial Codes** — Standard codes with default rates (detention, lumper, liftgate, etc.)
8. **Weight/Dimension Limits** — Standard truck capacities, overweight thresholds
9. **Insurance Minimums** — Required coverage amounts for carrier approval ($1M auto, $100K cargo)
10. **Invoice Rules** — Can't invoice without POD, payment terms defaults, late payment interest
11. **Commission Rules** — Earning conditions, tier thresholds, payout frequency

## Acceptance Criteria

- [ ] Document created at `dev_docs_v2/05-references/business-rules-quick-ref.md`
- [ ] All 11 rule categories covered with specific values (not "TBD")
- [ ] Values sourced from `dev_docs/11-ai-dev/92-business-rules-reference.md` and Prisma schema defaults
- [ ] Linked from `dev_docs_v2/05-references/doc-map.md`
- [ ] Linked from relevant service hub files (04-tms-core.md, 06-accounting.md)
- [ ] Format: scannable tables, not prose paragraphs

## Dependencies

- Blocked by: None (documentation task)
- Blocks: None (but informs TMS-005, TMS-007, ACC-002, COM-003)

## Reference

- Source: `dev_docs/11-ai-dev/92-business-rules-reference.md`
- Expert recommendation: Section 11.3 item 4
