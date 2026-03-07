# usePayables (accounting)

**File:** `apps/web/lib/hooks/accounting/use-payables.ts`
**LOC:** 142

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `usePayables` | `(params?: PayableListParams) => UseQueryResult<PaginatedResponse<Payable>>` |
| `usePayable` | `(id: string) => UseQueryResult<{ data: Payable }>` |
| `useCreatePayable` | `() => UseMutationResult<{ data: Payable }, Error, Partial<Payable>>` |
| `useUpdatePayable` | `() => UseMutationResult<{ data: Payable }, Error, { id: string; data: Partial<Payable> }>` |
| `useApprovePayable` | `() => UseMutationResult<void, Error, string>` |
| `useVoidPayable` | `() => UseMutationResult<void, Error, { id: string; reason: string }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| usePayables | GET | /accounting/payables | PaginatedResponse<Payable> |
| usePayable | GET | /accounting/payables/:id | `{ data: Payable }` |
| useCreatePayable | POST | /accounting/payables | `{ data: Payable }` |
| useUpdatePayable | PATCH | /accounting/payables/:id | `{ data: Payable }` |
| useApprovePayable | POST | /accounting/payables/:id/approve | void |
| useVoidPayable | POST | /accounting/payables/:id/void | void |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD. Lifecycle actions return void.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["accounting", "payables", "list", params]` | default | Always |
| `["accounting", "payables", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreatePayable | POST /accounting/payables | list | Yes |
| useUpdatePayable | PATCH /accounting/payables/:id | detail + list | Yes |
| useApprovePayable | POST .../approve | detail + list | Yes |
| useVoidPayable | POST .../void | detail + list | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - No delete mutation -- payables can only be voided (may be intentional business logic)
  - `useVoidPayable` sends `reason` but no validation that reason is non-empty
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from accounting module
