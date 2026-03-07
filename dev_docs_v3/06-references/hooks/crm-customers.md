# useCustomers (CRM)

**File:** `apps/web/lib/hooks/crm/use-customers.ts`
**LOC:** 80

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useCustomers` | `(params?: CustomerListParams) => UseQueryResult<PaginatedResponse<Customer>>` |
| `useCustomer` | `(id: string) => UseQueryResult<{ data: Customer }>` |
| `useCreateCustomer` | `() => UseMutationResult<{ data: Customer }, Error, Partial<Customer>>` |
| `useUpdateCustomer` | `() => UseMutationResult<{ data: Customer }, Error, { id: string; data: Partial<Customer> }>` |
| `useDeleteCustomer` | `() => UseMutationResult<void, Error, string>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useCustomers | GET | /crm/companies?companyType=CUSTOMER | PaginatedResponse<Customer> |
| useCustomer | GET | /crm/companies/:id | `{ data: Customer }` |
| useCreateCustomer | POST | /crm/companies | `{ data: Customer }` |
| useUpdateCustomer | PATCH | /crm/companies/:id | `{ data: Customer }` |
| useDeleteCustomer | DELETE | /crm/companies/:id | void |

## Envelope Handling

Returns raw apiClient response. List query appends `companyType=CUSTOMER` filter to the shared `/crm/companies` endpoint.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["customers", "list", params]` | default | Always |
| `["customers", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateCustomer | POST /crm/companies | list | Yes |
| useUpdateCustomer | PATCH /crm/companies/:id | detail + list | Yes |
| useDeleteCustomer | DELETE /crm/companies/:id | list | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - Shares `/crm/companies` endpoint with `use-companies.ts` but uses different query keys ("customers" vs "companies") -- mutations in one hook will NOT invalidate the other hook's cache
  - `companyType` filter appended manually rather than through typed params
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from `@/lib/types/crm`
