# useInlandServiceTypes (operations)

**File:** `apps/web/lib/hooks/operations/use-inland-service-types.ts`
**LOC:** 27

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useInlandServiceTypes` | `() => UseQueryResult<InlandServiceType[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useInlandServiceTypes | GET | /inland-service-types | InlandServiceType[] |

## Envelope Handling

Uses `apiClient` from `@/lib/api-client` (different import than most hooks which use `@/lib/api`). Returns raw response without explicit envelope unwrap.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["inland-service-types"]` | default | Always |

## Mutations

None -- read-only hook.

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - Uses `@/lib/api-client` import instead of `@/lib/api` -- inconsistent with other hooks
  - No pagination support -- assumes small dataset
  - No `enabled` option for conditional fetching
- **Dependencies:** `apiClient` from `@/lib/api-client`
