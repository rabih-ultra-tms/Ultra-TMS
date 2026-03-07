# useLoadHistory (operations)

**File:** `apps/web/lib/hooks/operations/use-load-history.ts`
**LOC:** 233

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useLoadHistory` | `(params?: LoadHistoryParams) => UseQueryResult<PaginatedResponse<LoadHistoryItem>>` |
| `useLoadHistoryDetail` | `(id: string) => UseQueryResult<{ data: LoadHistoryItem }>` |
| `useLoadHistoryStats` | `() => UseQueryResult<LoadHistoryStats>` |
| `useLaneStats` | `(params?: LaneStatsParams) => UseQueryResult<LaneStats[]>` |
| `useSimilarLoads` | `(loadId: string) => UseQueryResult<LoadHistoryItem[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useLoadHistory | GET | /load-history | PaginatedResponse<LoadHistoryItem> |
| useLoadHistoryDetail | GET | /load-history/:id | `{ data: LoadHistoryItem }` |
| useLoadHistoryStats | GET | /load-history/stats | LoadHistoryStats |
| useLaneStats | GET | /load-history/lane-stats | LaneStats[] |
| useSimilarLoads | GET | /load-history/:id/similar | LoadHistoryItem[] |

## Envelope Handling

List query uses `PaginatedResponse`. Detail uses standard `{ data: T }` envelope. Stats and lane-stats return raw objects/arrays without envelope wrapping.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["load-history", "list", params]` | default | Always |
| `["load-history", "detail", id]` | default | `!!id` |
| `["load-history", "stats"]` | default | Always |
| `["load-history", "lane-stats", params]` | default | Always |
| `["load-history", "similar", loadId]` | default | `!!loadId` |

## Mutations

None -- read-only hooks for historical load data.

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - Stats and lane-stats endpoints may return `{ data: T }` envelope but hooks don't unwrap -- potential mismatch
  - No `staleTime` configured for stats data that changes infrequently
  - `useSimilarLoads` returns unbounded array -- no pagination
- **Dependencies:** `apiClient`, `PaginatedResponse`, types from load-history module
