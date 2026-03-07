# useSettlements (accounting)

**File:** `apps/web/lib/hooks/accounting/use-settlements.ts`
**LOC:** 195

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useSettlements` | `(params?: SettlementListParams) => UseQueryResult<PaginatedResponse<Settlement>>` |
| `useSettlement` | `(id: string) => UseQueryResult<{ data: Settlement }>` |
| `useCreateSettlement` | `() => UseMutationResult<{ data: Settlement }, Error, Partial<Settlement>>` |
| `useUpdateSettlement` | `() => UseMutationResult<{ data: Settlement }, Error, { id: string; data: Partial<Settlement> }>` |
| `useApproveSettlement` | `() => UseMutationResult<void, Error, string>` |
| `useProcessSettlement` | `() => UseMutationResult<void, Error, string>` |
| `useVoidSettlement` | `() => UseMutationResult<void, Error, { id: string; reason: string }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useSettlements | GET | /accounting/settlements | PaginatedResponse<Settlement> |
| useSettlement | GET | /accounting/settlements/:id | `{ data: Settlement }` |
| useCreateSettlement | POST | /accounting/settlements | `{ data: Settlement }` |
| useUpdateSettlement | PATCH | /accounting/settlements/:id | `{ data: Settlement }` |
| useApproveSettlement | POST | /accounting/settlements/:id/approve | void |
| useProcessSettlement | POST | /accounting/settlements/:id/process | void |
| useVoidSettlement | POST | /accounting/settlements/:id/void | void |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD. Lifecycle actions (approve/process/void) return void.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["accounting", "settlements", "list", params]` | default | Always |
| `["accounting", "settlements", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateSettlement | POST /accounting/settlements | list | Yes |
| useUpdateSettlement | PATCH /accounting/settlements/:id | detail + list | Yes |
| useApproveSettlement | POST .../approve | detail + list | Yes |
| useProcessSettlement | POST .../process | detail + list | Yes |
| useVoidSettlement | POST .../void | detail + list | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - Settlement lifecycle (create -> approve -> process) has no client-side state validation before calling mutations
  - No optimistic updates for status transitions
  - `useProcessSettlement` may trigger payment processing -- no confirmation step in the hook
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from accounting module
