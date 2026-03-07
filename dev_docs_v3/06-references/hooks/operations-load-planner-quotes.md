# useLoadPlannerQuotes (operations)

**File:** `apps/web/lib/hooks/operations/use-load-planner-quotes.ts`
**LOC:** 204

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useLoadPlannerQuotes` | `(loadPlannerId: string, params?: QuoteListParams) => UseQueryResult<PaginatedResponse<Quote>>` |
| `useLoadPlannerQuote` | `(loadPlannerId: string, quoteId: string) => UseQueryResult<{ data: Quote }>` |
| `useCreateQuote` | `() => UseMutationResult<{ data: Quote }, Error, { loadPlannerId: string; data: Partial<Quote> }>` |
| `useUpdateQuote` | `() => UseMutationResult<{ data: Quote }, Error, { loadPlannerId: string; quoteId: string; data: Partial<Quote> }>` |
| `useDeleteQuote` | `() => UseMutationResult<void, Error, { loadPlannerId: string; quoteId: string }>` |
| `useAcceptQuote` | `() => UseMutationResult<void, Error, { loadPlannerId: string; quoteId: string }>` |
| `useRejectQuote` | `() => UseMutationResult<void, Error, { loadPlannerId: string; quoteId: string; reason?: string }>` |
| `useSendQuote` | `() => UseMutationResult<void, Error, { loadPlannerId: string; quoteId: string }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useLoadPlannerQuotes | GET | /load-planner/:id/quotes | PaginatedResponse<Quote> |
| useLoadPlannerQuote | GET | /load-planner/:id/quotes/:quoteId | `{ data: Quote }` |
| useCreateQuote | POST | /load-planner/:id/quotes | `{ data: Quote }` |
| useUpdateQuote | PATCH | /load-planner/:id/quotes/:quoteId | `{ data: Quote }` |
| useDeleteQuote | DELETE | /load-planner/:id/quotes/:quoteId | void |
| useAcceptQuote | POST | /load-planner/:id/quotes/:quoteId/accept | void |
| useRejectQuote | POST | /load-planner/:id/quotes/:quoteId/reject | void |
| useSendQuote | POST | /load-planner/:id/quotes/:quoteId/send | void |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD. Lifecycle actions (accept/reject/send) return void.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["load-planner", loadPlannerId, "quotes", "list", params]` | default | `!!loadPlannerId` |
| `["load-planner", loadPlannerId, "quotes", "detail", quoteId]` | default | `!!loadPlannerId && !!quoteId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateQuote | POST /load-planner/:id/quotes | quotes list | Yes |
| useUpdateQuote | PATCH /load-planner/:id/quotes/:quoteId | detail + list | Yes |
| useDeleteQuote | DELETE /load-planner/:id/quotes/:quoteId | quotes list | Yes |
| useAcceptQuote | POST .../accept | detail + list | Yes |
| useRejectQuote | POST .../reject | detail + list | Yes |
| useSendQuote | POST .../send | detail + list | Yes |

## Quality Assessment

- **Score:** 8/10
- **Anti-patterns:**
  - `useRejectQuote` accepts `reason` param but may not send it in the request body
  - Quote lifecycle transitions (accept/reject/send) don't validate current state before calling
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from load-planner module
