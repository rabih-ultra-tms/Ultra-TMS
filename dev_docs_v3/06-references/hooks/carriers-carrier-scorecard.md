# useCarrierScorecard (carriers)

**File:** `apps/web/lib/hooks/carriers/use-carrier-scorecard.ts`
**LOC:** 20

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useCarrierScorecard` | `(carrierId: string) => UseQueryResult<CarrierScorecardResponse>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useCarrierScorecard | GET | /operations/carriers/:carrierId/scorecard | `{ data: CarrierScorecardResponse }` |

## Envelope Handling

Correctly unwraps `raw.data` from the `{ data: T }` envelope. Types the raw response as `{ data: CarrierScorecardResponse }` and returns the inner data.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["carriers", carrierId, "scorecard"]` | default | `!!carrierId` |

## Mutations

None -- read-only scorecard hook.

## Quality Assessment

- **Score:** 8/10
- **Anti-patterns:**
  - Very small hook (20 LOC) -- could be co-located in a larger carriers hook file
  - Uses `retry: 1` instead of default retry -- may miss transient errors
  - `CarrierScorecardResponse` type imported from `@/types/carriers` -- good pattern
  - Correct envelope unwrap -- good pattern
- **Dependencies:** `apiClient`, `CarrierScorecardResponse` from `@/types/carriers`
