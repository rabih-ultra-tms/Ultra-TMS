# useLoadboardDashboard (load-board)

**File:** `apps/web/lib/hooks/load-board/use-loadboard-dashboard.ts`
**LOC:** 43

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useLoadboardStats` | `() => UseQueryResult<LoadboardStats>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useLoadboardStats | GET | /load-board/dashboard/stats | LoadboardStats |

## Envelope Handling

Returns raw apiClient response. No explicit envelope unwrap.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["load-board", "dashboard", "stats"]` | default | Always |

## Mutations

None -- read-only dashboard hook.

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - Very small hook (43 LOC) -- could be merged with `tms/use-load-board.ts` which also has stats
  - Potential overlap with `useLoadBoardStats` in `tms/use-load-board.ts` -- different endpoints or duplicate?
- **Dependencies:** `apiClient`
