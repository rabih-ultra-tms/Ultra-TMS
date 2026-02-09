# LB-004: Posting Detail + Bids

> **Phase:** 5 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/07-load-board.md` — Load Board hub (bids endpoints)

## Objective

Build the Posting Detail page at `/load-board/postings/:id`. Shows full posting data with inline bids management. Actions: accept bid, reject bid, counter-offer. When a bid is accepted, posting moves to COVERED status.

**Bid status machine:** PENDING → ACCEPTED/REJECTED/COUNTERED/WITHDRAWN/EXPIRED

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/load-board/postings/[id]/page.tsx` | Posting detail page |
| CREATE | `apps/web/components/load-board/posting-detail-card.tsx` | Posting summary: origin/dest, equipment, rate, status |
| CREATE | `apps/web/components/load-board/bids-list.tsx` | Bids list with accept/reject/counter actions |
| CREATE | `apps/web/components/load-board/bid-counter-dialog.tsx` | Counter-offer dialog |
| MODIFY | `apps/web/lib/hooks/load-board/use-postings.ts` | Add usePosting(id), useBids(postingId), useAcceptBid(), useRejectBid(), useCounterBid() |

## Acceptance Criteria

- [ ] `/load-board/postings/:id` renders posting detail
- [ ] Posting summary: origin, destination, equipment, weight, commodity, rate, status badge
- [ ] Bids section: list of carrier bids with carrier name, rate, transit time, submitted date
- [ ] Accept bid → POST `/accept` → posting becomes COVERED
- [ ] Reject bid → POST `/reject` → bid removed
- [ ] Counter-offer → dialog with new rate → POST `/counter`
- [ ] Cancel posting action available
- [ ] Loading, error states
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: LB-002 (Post Load creates postings)
- Blocks: LB-005 (Carrier Matches shown on this page)

## Reference

- Hub: `dev_docs_v2/03-services/07-load-board.md`
- Backend: posting detail + bids CRUD + accept/reject/counter
