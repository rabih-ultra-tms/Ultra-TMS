# usePostings (load-board)

**File:** `apps/web/lib/hooks/load-board/use-postings.ts`
**LOC:** 312

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `usePostings` | `(filters: LoadPostingSearchFilters) => UseQueryResult<LoadPostingListResponse>` |
| `useSearchPostings` | `(filters: LoadPostingSearchFilters) => UseQueryResult<LoadPostingListResponse>` |
| `usePosting` | `(id: string) => UseQueryResult<LoadPosting>` |
| `useCreatePosting` | `() => UseMutationResult<LoadPosting, Error, CreateLoadPostingPayload>` |
| `useUpdatePosting` | `(id: string) => UseMutationResult<LoadPosting, Error, Partial<CreateLoadPostingPayload>>` |
| `useCancelPosting` | `(id: string) => UseMutationResult<LoadPosting, Error, void>` |
| `useBids` | `(postingId: string) => UseQueryResult<LoadBidListResponse>` |
| `useAcceptBid` | `(postingId: string) => UseMutationResult<LoadBid, Error, string>` |
| `useRejectBid` | `(postingId: string) => UseMutationResult<LoadBid, Error, { bidId: string; reason: string }>` |
| `useCounterBid` | `(postingId: string) => UseMutationResult<LoadBid, Error, { bidId: string; counterAmount: number; counterNotes?: string }>` |
| `useCarrierMatches` | `(postingId: string) => UseQueryResult<CarrierMatch[]>` |
| `useTenderToCarrier` | `(postingId: string) => UseMutationResult<unknown, Error, string>` |

## Exported Utilities

| Export | Description |
|--------|-------------|
| `postingKeys` | Query key factory -- `all`, `lists()`, `list(params)`, `details()`, `detail(id)`, `bids(postingId)`, `matches(postingId)` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| usePostings | GET | /load-postings?{params} | LoadPostingListResponse |
| useSearchPostings | POST | /load-postings/search | LoadPostingListResponse |
| usePosting | GET | /load-postings/:id | LoadPosting |
| useCreatePosting | POST | /load-postings | LoadPosting |
| useUpdatePosting | PUT | /load-postings/:id | LoadPosting |
| useCancelPosting | PUT | /load-postings/:id (status=CANCELLED) | LoadPosting |
| useBids | GET | /load-bids/posting/:postingId | LoadBidListResponse |
| useAcceptBid | POST | /load-bids/:bidId/accept | LoadBid |
| useRejectBid | POST | /load-bids/:bidId/reject | LoadBid |
| useCounterBid | POST | /load-bids/:bidId/counter | LoadBid |
| useCarrierMatches | GET | /load-bids/posting/:postingId/matches | CarrierMatch[] |
| useTenderToCarrier | POST | /load-tenders | unknown |

## Envelope Handling

Uses local `unwrap<T>()` helper that extracts `body.data ?? response`. The `useCarrierMatches` hook manually casts `body.data ?? []` instead of using `unwrap`. The `useTenderToCarrier` returns `unwrap<unknown>` -- no typed response.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["load-postings", "list", filters]` | default | Always |
| `["load-postings-search", filters]` | default | At least one filter field set |
| `["load-postings", "detail", id]` | 15s | `!!id` |
| `["load-postings", "bids", postingId]` | 10s | `!!postingId` |
| `["load-postings", "matches", postingId]` | 60s | `!!postingId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreatePosting | POST /load-postings | all postings | Yes |
| useUpdatePosting | PUT /load-postings/:id | detail + lists | Yes |
| useCancelPosting | PUT /load-postings/:id | all postings | Yes |
| useAcceptBid | POST .../accept | bids + detail + lists | Yes |
| useRejectBid | POST .../reject | bids | Yes |
| useCounterBid | POST .../counter | bids | Yes |
| useTenderToCarrier | POST /load-tenders | matches | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - 312 LOC -- large file covering postings, bids, and carrier matching; should be split into 3 separate hook files
  - `usePostings` manually builds URLSearchParams instead of passing params object to apiClient
  - `useSearchPostings` uses separate query key `["load-postings-search"]` outside the `postingKeys` factory -- cache inconsistency risk
  - `useTenderToCarrier` returns `unwrap<unknown>` -- no type safety on tender response
  - `useCarrierMatches` manually casts response instead of using `unwrap` helper
  - `useCancelPosting` uses PUT with status body instead of a dedicated cancel endpoint
  - `placeholderData: (prev) => prev` used for pagination -- correct pattern
- **Dependencies:** `apiClient`, `sonner`, types from `@/types/load-board`
