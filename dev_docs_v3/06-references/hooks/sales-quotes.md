# useQuotes (sales)

**File:** `apps/web/lib/hooks/sales/use-quotes.ts`
**LOC:** 351

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useQuotes` | `(params: QuoteListParams) => UseQueryResult<QuoteListResponse>` |
| `useQuoteStats` | `() => UseQueryResult<QuoteStats>` |
| `useQuote` | `(id: string) => UseQueryResult<QuoteDetail>` |
| `useQuoteVersions` | `(id: string) => UseQueryResult<QuoteVersion[]>` |
| `useQuoteTimeline` | `(id: string) => UseQueryResult<QuoteTimelineEvent[]>` |
| `useQuoteNotes` | `(id: string) => UseQueryResult<QuoteNote[]>` |
| `useCreateQuote` | `() => UseMutationResult<Quote, Error, QuoteFormValues>` |
| `useUpdateQuote` | `() => UseMutationResult<Quote, Error, { id: string; data: QuoteFormValues }>` |
| `useDeleteQuote` | `() => UseMutationResult<void, Error, string>` |
| `useCloneQuote` | `() => UseMutationResult<Quote, Error, string>` |
| `useSendQuote` | `() => UseMutationResult<Quote, Error, string>` |
| `useConvertQuote` | `() => UseMutationResult<{ orderId: string; orderNumber: string }, Error, string>` |
| `useAcceptQuote` | `() => UseMutationResult<Quote, Error, string>` |
| `useRejectQuote` | `() => UseMutationResult<Quote, Error, { id: string; reason: string }>` |
| `useCreateQuoteVersion` | `() => UseMutationResult<Quote, Error, string>` |
| `useAddQuoteNote` | `() => UseMutationResult<QuoteNote, Error, { id: string; content: string }>` |
| `useCalculateRate` | `() => UseMutationResult<CalculateRateResponse, Error, CalculateRateRequest>` |

## Exported Utilities

| Export | Description |
|--------|-------------|
| `mapFormToDto` | Internal helper -- maps `QuoteFormValues` field names to API DTO field names (not exported but critical to understand) |
| `unwrap` | Local `unwrap<T>()` helper -- extracts `body.data ?? response` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useQuotes | GET | /quotes?{params} | QuoteListResponse |
| useQuoteStats | GET | /quotes/stats | `{ data: QuoteStats }` |
| useQuote | GET | /quotes/:id | QuoteDetail (unwrapped) |
| useQuoteVersions | GET | /quotes/:id/versions | QuoteVersion[] (unwrapped) |
| useQuoteTimeline | GET | /quotes/:id/timeline | QuoteTimelineEvent[] (unwrapped) |
| useQuoteNotes | GET | /quotes/:id/notes | QuoteNote[] (unwrapped) |
| useCreateQuote | POST | /quotes | Quote (unwrapped) |
| useUpdateQuote | PATCH | /quotes/:id | Quote (unwrapped) |
| useDeleteQuote | DELETE | /quotes/:id | void |
| useCloneQuote | POST | /quotes/:id/clone | Quote (unwrapped) |
| useSendQuote | POST | /quotes/:id/send | Quote (unwrapped) |
| useConvertQuote | POST | /quotes/:id/convert | `{ orderId, orderNumber }` (unwrapped) |
| useAcceptQuote | POST | /quotes/:id/accept | Quote (unwrapped) |
| useRejectQuote | POST | /quotes/:id/reject | Quote (unwrapped) |
| useCreateQuoteVersion | POST | /quotes/:id/version | Quote (unwrapped) |
| useAddQuoteNote | POST | /quotes/:id/notes | QuoteNote |
| useCalculateRate | POST | /quotes/calculate-rate | CalculateRateResponse |

## Envelope Handling

Mixed patterns. `useQuoteStats` correctly unwraps `response.data` from `{ data: QuoteStats }`. Detail hooks (useQuote, useQuoteVersions, useQuoteTimeline, useQuoteNotes) and most mutations use the local `unwrap<T>()` helper. However, `useQuotes` list query returns `apiClient.get<QuoteListResponse>()` directly without unwrapping -- may double-wrap if apiClient already handles envelopes. `useAddQuoteNote` and `useCalculateRate` also return raw apiClient responses.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["quotes", "list", params]` | default | Always |
| `["quotes", "stats"]` | 30s | Always |
| `["quotes", "detail", id]` | default | `!!id` |
| `["quotes", "versions", id]` | default | `!!id` |
| `["quotes", "timeline", id]` | default | `!!id` |
| `["quotes", "notes", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateQuote | POST /quotes | all quotes | Yes |
| useUpdateQuote | PATCH /quotes/:id | detail + all | Yes |
| useDeleteQuote | DELETE /quotes/:id | removes detail/timeline/notes/versions + invalidates list/stats | Yes |
| useCloneQuote | POST .../clone | all quotes | Yes |
| useSendQuote | POST .../send | all quotes | Yes |
| useConvertQuote | POST .../convert | all quotes | Yes |
| useAcceptQuote | POST .../accept | detail + timeline + all | Yes |
| useRejectQuote | POST .../reject | detail + timeline + all | Yes |
| useCreateQuoteVersion | POST .../version | detail + versions + all | Yes |
| useAddQuoteNote | POST .../notes | notes + timeline | Yes |
| useCalculateRate | POST /quotes/calculate-rate | None | Yes (error only) |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - 351 LOC -- large file covering full quote lifecycle (list, detail, versions, timeline, notes, CRUD, workflow actions, rate calc); should be split into at least 2-3 files
  - `mapFormToDto` casts stop items through `unknown as Record<string, unknown>` -- loses type safety
  - `mapFormToDto` computes `totalAmount` client-side -- should be server-authoritative
  - Inconsistent envelope handling: `useQuotes` returns raw response, `useQuoteStats` unwraps `response.data`, detail hooks use `unwrap()`, `useAddQuoteNote`/`useCalculateRate` return raw
  - `useDeleteQuote` uses `removeQueries` for detail/sub-resources then `invalidateQueries` for list/stats -- correct but verbose
  - `placeholderData: (previousData) => previousData` for list pagination -- correct pattern
  - No query key factory -- uses inline `[QUOTES_KEY, ...]` arrays (consistent but not a factory object)
  - `mapFormToDto` maps `validityDays` to `validUntil` date with client timezone -- potential timezone drift
- **Dependencies:** `apiClient`, `sonner`, types from `@/types/quotes`
