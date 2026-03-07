# useFmcsa (carriers)

**File:** `apps/web/lib/hooks/carriers/use-fmcsa.ts`
**LOC:** 96

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useFmcsaLookup` | `() => UseMutationResult<FmcsaCarrierRecord, Error, FmcsaLookupParams>` |
| `useCsaScores` | `(carrierId: string) => UseQueryResult<CsaScore[]>` |

## Exported Types

| Type | Description |
|------|-------------|
| `FmcsaCarrierRecord` | FMCSA carrier data -- DOT/MC numbers, authority flags, operating status, fleet size |
| `CSABasicType` | Union of 7 CSA BASIC category strings |
| `CsaScore` | Individual CSA BASIC score with percentile, threshold, inspection/violation counts |
| `FmcsaLookupParams` | `{ dotNumber?: string; mcNumber?: string }` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useFmcsaLookup (DOT) | GET | /carriers/fmcsa/lookup/dot/:dotNumber | `{ data: FmcsaCarrierRecord }` |
| useFmcsaLookup (MC) | GET | /carriers/fmcsa/lookup/mc/:mcNumber | `{ data: FmcsaCarrierRecord }` |
| useCsaScores | GET | /carriers/:carrierId/csa-scores | `{ data: CsaScore[] }` |

## Envelope Handling

Both hooks correctly unwrap `response.data` from the `{ data: T }` envelope. The `useFmcsaLookup` explicitly types the response as `{ data: FmcsaCarrierRecord }` and returns `response.data`. The `useCsaScores` hook does the same with `{ data: CsaScore[] }`.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["csa-scores", carrierId]` | default | `!!carrierId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useFmcsaLookup | GET /carriers/fmcsa/lookup/... | None | No |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - `useFmcsaLookup` uses `useMutation` for a GET request -- should be `useQuery` with manual trigger or `enabled: false` with `refetch()`
  - Types are defined inline in the hook file (96 LOC mostly types) -- should be in `@/types/carriers`
  - No toast feedback on lookup success or failure
  - No query key factory pattern -- uses flat array keys
  - Lookup requires exactly one of DOT or MC but validation is only a runtime throw, not compile-time
- **Dependencies:** `apiClient`
