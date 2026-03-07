# BLD-028: Load Board Posting Detail

**Priority:** P0
**Service:** Load Board
**Route:** `/load-board/postings/[id]`
**Page file:** `apps/web/app/(dashboard)/load-board/postings/[id]/page.tsx`

## Current State

Route exists. Implementation quality unverified.

## Requirements

- Display posting detail: origin/destination, equipment, rate, dates
- Show carrier bids with accept/reject/counter actions
- Carrier matching suggestions
- Tender to carrier workflow
- Status lifecycle: ACTIVE → TENDERED → ACCEPTED → EXPIRED

## Acceptance Criteria

- [ ] Bid management actions work (accept, reject, counter)
- [ ] Carrier matching list with scores
- [ ] Tender workflow completes end-to-end
- [ ] Loading, error, and empty states handled
- [ ] TypeScript strict — no `any` types

## Dependencies

- Backend: `GET /load-postings/:id`, `GET /load-bids/posting/:id`, `POST /load-tenders`
- Hook: `lib/hooks/load-board/use-postings.ts`
- Components: PostingDetail, BidList, CarrierMatchCard

## Estimated Effort

L
