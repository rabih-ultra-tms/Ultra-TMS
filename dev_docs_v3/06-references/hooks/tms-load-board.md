# useLoadBoard (TMS)

**File:** `apps/web/lib/hooks/tms/use-load-board.ts`
**LOC:** 62

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useLoadPosts` | `(params?: LoadPostParams) => UseQueryResult<PaginatedResponse<LoadPost>>` |
| `useLoadBoardStats` | `() => UseQueryResult<LoadBoardStats>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useLoadPosts | GET | /load-board/posts | PaginatedResponse<LoadPost> |
| useLoadBoardStats | GET | /load-board/stats | LoadBoardStats |

## Envelope Handling

Returns raw apiClient response. Stats endpoint may return `{ data: T }` envelope without unwrap.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["load-board", "posts", params]` | default | Always |
| `["load-board", "stats"]` | default | Always |

## Mutations

None -- read-only hooks. Posting mutations are in `load-board/use-postings.ts`.

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - Read-only split from `use-postings.ts` -- creates two files for the same domain
  - No `refetchInterval` for live load board data
- **Dependencies:** `apiClient`, `PaginatedResponse`
