# LB-005: Carrier Matches Panel

> **Phase:** 5 | **Priority:** P2 | **Status:** NOT STARTED
> **Effort:** M (3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/07-load-board.md` — Load Board hub (matching logic)

## Objective

Build the Carrier Matches panel, shown on the Posting Detail page. Displays suggested carriers ranked by match score (0-100) based on geography, equipment, scorecard, and lane preferences. Dispatcher can tender a load to a matched carrier directly.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/load-board/carrier-matches-panel.tsx` | Suggested carriers with scores |
| CREATE | `apps/web/components/load-board/carrier-match-card.tsx` | Individual match: carrier name, score, metrics |
| MODIFY | `apps/web/lib/hooks/load-board/use-postings.ts` | Add useCarrierMatches(postingId), useTenderToCarrier() |
| MODIFY | `apps/web/app/(dashboard)/load-board/postings/[id]/page.tsx` | Add matches panel |

## Acceptance Criteria

- [ ] Carrier Matches panel shows on posting detail page
- [ ] Each match: carrier name, MC#, match score (0-100), on-time %, claims rate, insurance status
- [ ] Sorted by match score descending
- [ ] "Tender" button → sends load offer to carrier
- [ ] Loading state
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: LB-004 (Posting Detail page)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/07-load-board.md`
- Backend: `GET /api/v1/load-board/matches/:postingId`, `POST /api/v1/load-board/tender`
