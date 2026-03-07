# useTransactions (commissions)

**File:** `apps/web/lib/hooks/commissions/use-transactions.ts`
**LOC:** 176

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useTransactions` | `(params?: TransactionListParams) => UseQueryResult<PaginatedResponse<Transaction>>` |
| `useTransaction` | `(id: string) => UseQueryResult<{ data: Transaction }>` |
| `useApproveTransaction` | `() => UseMutationResult<void, Error, string>` |
| `useVoidTransaction` | `() => UseMutationResult<void, Error, { id: string; reason: string }>` |
| `useBulkApproveTransactions` | `() => UseMutationResult<void, Error, string[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useTransactions | GET | /commissions/transactions | PaginatedResponse<Transaction> |
| useTransaction | GET | /commissions/transactions/:id | `{ data: Transaction }` |
| useApproveTransaction | POST | /commissions/transactions/:id/approve | void |
| useVoidTransaction | POST | /commissions/transactions/:id/void | void |
| useBulkApproveTransactions | POST | /commissions/transactions/bulk-approve | void |

## Envelope Handling

Standard `{ data: T }` envelope for queries. Uses `any` casts in response mapping.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["commissions", "transactions", "list", params]` | default | Always |
| `["commissions", "transactions", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useApproveTransaction | POST .../approve | detail + list | Yes |
| useVoidTransaction | POST .../void | detail + list | Yes |
| useBulkApproveTransactions | POST .../bulk-approve | list | Yes |

## Quality Assessment

- **Score:** 5/10
- **Anti-patterns:**
  - **ANTI-PATTERN:** Response mapping uses `any` casts throughout
  - No create/update mutations -- transactions are system-generated, but the hook doesn't document this
  - Bulk approve has no progress tracking or partial failure handling
  - No optimistic updates for approve/void actions
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from commissions module
