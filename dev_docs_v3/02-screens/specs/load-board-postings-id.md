# Load Board Posting Detail

**Route:** `/load-board/postings/[id]`
**File:** `apps/web/app/(dashboard)/load-board/postings/[id]/page.tsx`
**LOC:** 146
**Status:** Complete

## Data Flow

- **Hooks:** `usePosting` + `useBids` + `useAcceptBid` + `useRejectBid` + `useCounterBid` + `useCancelPosting` + `useCarrierMatches` + `useTenderToCarrier` (`lib/hooks/load-board`)
- **API calls:** `GET /api/v1/load-board/postings/{id}`, `GET /api/v1/load-board/postings/{id}/bids`, `POST /api/v1/load-board/bids/{bidId}/accept`, `POST /api/v1/load-board/bids/{bidId}/reject`, `POST /api/v1/load-board/bids/{bidId}/counter`, `PATCH /api/v1/load-board/postings/{id}/cancel`, `GET /api/v1/load-board/postings/{id}/matches`, `POST /api/v1/load-board/postings/{id}/tender`
- **Envelope:** `bidsResponse?.data` -- correct

## UI Components

- **Pattern:** Custom (header with cancel action + posting detail card + bids list + carrier matches panel)
- **Key components:** PostingDetailCard (`components/load-board/posting-detail-card`), BidsList (`components/load-board/bids-list`), CarrierMatchesPanel (`components/load-board/carrier-matches-panel`), ConfirmDialog, Skeleton, Button, Link
- **Interactive elements:** "Cancel Posting" button (conditional on ACTIVE status, opens ConfirmDialog), bid accept/reject/counter actions (passed to BidsList), tender-to-carrier action (passed to CarrierMatchesPanel), back link. All wired with loading states.

## State Management

- **URL params:** `id` from route params (React 19 `use(params)` with `Promise<{ id: string }>`)
- **React Query keys:** Via `usePosting(id)`, `useBids(id)`, `useCarrierMatches(id)`
- **Local state:** `showCancelDialog` (boolean)

## Quality Assessment

- **Score:** 8/10
- **Bugs:**
  - `cancelPosting.mutate()` called inside `onConfirm` then immediately `setShowCancelDialog(false)` -- dialog closes before mutation completes, no `isLoading` prop on ConfirmDialog
- **Anti-patterns:** None significant
- **Missing:** Loading state via Skeleton (good). Not-found state with back link (good). Cancel with ConfirmDialog (good). All bid/tender actions properly pass loading states (good). Carrier matches panel for proactive tendering (good feature). Well-structured detail page with rich functionality.
