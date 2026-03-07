# useInvoices (accounting)

**File:** `apps/web/lib/hooks/accounting/use-invoices.ts`
**LOC:** 299

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useInvoices` | `(params?: InvoiceListParams) => UseQueryResult<PaginatedResponse<Invoice>>` |
| `useInvoice` | `(id: string) => UseQueryResult<{ data: Invoice }>` |
| `useCreateInvoice` | `() => UseMutationResult<{ data: Invoice }, Error, Partial<Invoice>>` |
| `useUpdateInvoice` | `() => UseMutationResult<{ data: Invoice }, Error, { id: string; data: Partial<Invoice> }>` |
| `useDeleteInvoice` | `() => UseMutationResult<void, Error, string>` |
| `useSendInvoice` | `() => UseMutationResult<void, Error, { id: string; email?: string }>` |
| `useVoidInvoice` | `() => UseMutationResult<void, Error, { id: string; reason: string }>` |
| `useUpdateInvoiceStatus` | `() => UseMutationResult<void, Error, { id: string; status: string }>` |
| `useInvoiceLineItems` | `(invoiceId: string) => UseQueryResult<InvoiceLineItem[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useInvoices | GET | /accounting/invoices | PaginatedResponse<Invoice> |
| useInvoice | GET | /accounting/invoices/:id | `{ data: Invoice }` |
| useCreateInvoice | POST | /accounting/invoices | `{ data: Invoice }` |
| useUpdateInvoice | PATCH | /accounting/invoices/:id | `{ data: Invoice }` |
| useDeleteInvoice | DELETE | /accounting/invoices/:id | void |
| useSendInvoice | POST | /accounting/invoices/:id/send | void |
| useVoidInvoice | POST | /accounting/invoices/:id/void | void |
| useUpdateInvoiceStatus | PATCH | /accounting/invoices/:id/status | void |
| useInvoiceLineItems | GET | /accounting/invoices/:id/line-items | InvoiceLineItem[] |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD. Line items return raw array. Lifecycle actions return void.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["accounting", "invoices", "list", params]` | default | Always |
| `["accounting", "invoices", "detail", id]` | default | `!!id` |
| `["accounting", "invoices", id, "line-items"]` | default | `!!invoiceId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateInvoice | POST /accounting/invoices | list | Yes |
| useUpdateInvoice | PATCH /accounting/invoices/:id | detail + list | Yes |
| useDeleteInvoice | DELETE /accounting/invoices/:id | list | Yes |
| useSendInvoice | POST .../send | detail + list | Yes |
| useVoidInvoice | POST .../void | detail + list | Yes |
| useUpdateInvoiceStatus | PATCH .../status | detail + list | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - 299 LOC -- large file mixing CRUD, lifecycle mutations, and line items
  - Both `useUpdateInvoiceStatus` and `useVoidInvoice` change status -- overlapping concerns
  - Line items query returns raw array without pagination -- could be large for complex invoices
  - `useSendInvoice` optional email param means it may send to a default -- no way to preview before sending
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from accounting module
