# INTEG-001: FMCSA Integration

> **Phase:** 6 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/05-carrier.md` — Carrier hub (FMCSA endpoint)
3. `dev_docs/06-external/59-integrations-external-apis.md` — FMCSA API details

## Objective

Wire the carrier onboarding flow to FMCSA SAFER Web Services for automatic carrier verification. When a user enters MC# or DOT#, auto-fill carrier data (legal name, authority status, safety rating, fleet size). Display CSA scores in the carrier compliance tab.

**Backend endpoint already exists:** `POST /api/v1/carriers/fmcsa/lookup`

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/carriers/fmcsa-lookup.tsx` | MC#/DOT# input with "Lookup" button + auto-fill results |
| CREATE | `apps/web/components/carriers/csa-scores-display.tsx` | CSA BASIC scores visualization |
| MODIFY | `apps/web/components/operations/carriers/carrier-form.tsx` | Add FMCSA lookup to onboarding step |
| CREATE | `apps/web/lib/hooks/carriers/use-fmcsa.ts` | useFmcsaLookup() hook |

## Acceptance Criteria

- [ ] MC# or DOT# input with "Verify with FMCSA" button
- [ ] Lookup auto-fills: legal name, DBA, authority status, safety rating, power units, drivers
- [ ] Visual indicator: green check if authority is ACTIVE, red warning if not
- [ ] CSA scores displayed on carrier detail compliance tab (7 BASIC categories)
- [ ] Error handling: FMCSA unavailable → manual entry allowed
- [ ] Loading state during lookup
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: BUG-001 (Carrier Detail page must exist)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/05-carrier.md`
- Integration: `dev_docs/06-external/59-integrations-external-apis.md` → FMCSA section
- Backend: `POST /api/v1/carriers/fmcsa/lookup` (already production-ready)
