# usePayouts (commissions)

**File:** `apps/web/lib/hooks/commissions/use-payouts.ts`
**LOC:** 183

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `usePayouts` | `(params?: PayoutListParams) => UseQueryResult<PaginatedResponse<Payout>>` |
| `usePayout` | `(id: string) => UseQueryResult<{ data: Payout }>` |
| `useCreatePayout` | `() => UseMutationResult<{ data: Payout }, Error, any>` |
| `useApprovePayout` | `() => UseMutationResult<void, Error, string>` |
| `useProcessPayout` | `() => UseMutationResult<void, Error, string>` |
| `useVoidPayout` | `() => UseMutationResult<void, Error, { id: string; reason: string }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| usePayouts | GET | /commissions/payouts | PaginatedResponse<Payout> |
| usePayout | GET | /commissions/payouts/:id | `{ data: Payout }` |
| useCreatePayout | POST | /commissions/payouts | `{ data: Payout }` |
| useApprovePayout | POST | /commissions/payouts/:id/approve | void |
| useProcessPayout | POST | /commissions/payouts/:id/process | void |
| useVoidPayout | POST | /commissions/payouts/:id/void | void |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD. Uses `mapPayout()` helper with `any` casts to normalize backend response.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["commissions", "payouts", "list", params]` | default | Always |
| `["commissions", "payouts", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreatePayout | POST /commissions/payouts | list | Yes |
| useApprovePayout | POST .../approve | detail + list | Yes |
| useProcessPayout | POST .../process | detail + list | Yes |
| useVoidPayout | POST .../void | detail + list | Yes |

## Quality Assessment

- **Score:** 5/10
- **Anti-patterns:**
  - **ANTI-PATTERN:** `useCreatePayout` mutation input typed as `any` -- no type safety
  - **ANTI-PATTERN:** `mapPayout()` uses `any` casts internally to map between backend and frontend field names
  - No update mutation -- payouts can only be created, then lifecycle-managed
  - Payout lifecycle (create -> approve -> process) has no client-side state guard
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from commissions module
