# useAging (accounting)

**File:** `apps/web/lib/hooks/accounting/use-aging.ts`
**LOC:** 103

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useAgingReport` | `(params?: AgingReportParams) => UseQueryResult<AgingReport>` |
| `useAgingBuckets` | `(params?: AgingBucketParams) => UseQueryResult<AgingBucket[]>` |
| `useAgingSummary` | `() => UseQueryResult<AgingSummary>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useAgingReport | GET | /accounting/aging | AgingReport |
| useAgingBuckets | GET | /accounting/aging/buckets | AgingBucket[] |
| useAgingSummary | GET | /accounting/aging/summary | AgingSummary |

## Envelope Handling

Returns raw apiClient responses. `normalizeAgingBucket()` maps backend bucket format to frontend display format (e.g., renaming `dayRange` -> `range`, calculating percentages).

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["accounting", "aging", params]` | default | Always |
| `["accounting", "aging", "buckets", params]` | default | Always |
| `["accounting", "aging", "summary"]` | default | Always |

## Mutations

None -- read-only reporting hooks.

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - Bucket normalization logic should be shared with backend or defined as a shared type
  - No `staleTime` for aging data that changes infrequently (daily at most)
  - Three separate queries on mount for one page -- could be combined into a single endpoint
- **Dependencies:** `apiClient`, types from accounting module
