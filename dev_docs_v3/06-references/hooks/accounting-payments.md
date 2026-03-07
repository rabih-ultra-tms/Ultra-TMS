# usePayments (accounting)

**File:** `apps/web/lib/hooks/accounting/use-payments.ts`
**LOC:** 225

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `usePayments` | `(params?: PaymentListParams) => UseQueryResult<PaginatedResponse<Payment>>` |
| `usePayment` | `(id: string) => UseQueryResult<{ data: Payment }>` |
| `useCreatePayment` | `() => UseMutationResult<{ data: Payment }, Error, Partial<Payment>>` |
| `useUpdatePayment` | `() => UseMutationResult<{ data: Payment }, Error, { id: string; data: Partial<Payment> }>` |
| `useDeletePayment` | `() => UseMutationResult<void, Error, string>` |
| `useAllocatePayment` | `() => UseMutationResult<void, Error, { paymentId: string; allocations: PaymentAllocation[] }>` |
| `useVoidPayment` | `() => UseMutationResult<void, Error, { id: string; reason: string }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| usePayments | GET | /accounting/payments | PaginatedResponse<Payment> |
| usePayment | GET | /accounting/payments/:id | `{ data: Payment }` |
| useCreatePayment | POST | /accounting/payments | `{ data: Payment }` |
| useUpdatePayment | PATCH | /accounting/payments/:id | `{ data: Payment }` |
| useDeletePayment | DELETE | /accounting/payments/:id | void |
| useAllocatePayment | POST | /accounting/payments/:id/allocate | void |
| useVoidPayment | POST | /accounting/payments/:id/void | void |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD. Allocation and void return void.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["accounting", "payments", "list", params]` | default | Always |
| `["accounting", "payments", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreatePayment | POST /accounting/payments | list | Yes |
| useUpdatePayment | PATCH /accounting/payments/:id | detail + list | Yes |
| useDeletePayment | DELETE /accounting/payments/:id | list | Yes |
| useAllocatePayment | POST .../allocate | detail + list + invoices list | Yes |
| useVoidPayment | POST .../void | detail + list | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - `useAllocatePayment` invalidates invoices list (cross-domain cache invalidation) -- fragile dependency on invoice query key structure
  - `PaymentAllocation[]` type used in mutation but not validated client-side (amounts must sum to payment total)
  - Both delete and void exist -- unclear when to use which
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from accounting module
