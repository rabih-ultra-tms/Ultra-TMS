# useOrders (TMS)

**File:** `apps/web/lib/hooks/tms/use-orders.ts`
**LOC:** 228

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useOrders` | `(params?: OrderListParams) => UseQueryResult<PaginatedResponse<Order>>` |
| `useOrder` | `(id: string) => UseQueryResult<{ data: Order }>` |
| `useCreateOrder` | `() => UseMutationResult<{ data: Order }, Error, OrderFormData>` |
| `useUpdateOrder` | `() => UseMutationResult<{ data: Order }, Error, { id: string; data: OrderFormData }>` |
| `useDeleteOrder` | `() => UseMutationResult<void, Error, string>` |
| `useConvertOrderToLoad` | `() => UseMutationResult<{ data: Load }, Error, string>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useOrders | GET | /orders | PaginatedResponse<Order> |
| useOrder | GET | /orders/:id | `{ data: Order }` |
| useCreateOrder | POST | /orders | `{ data: Order }` |
| useUpdateOrder | PATCH | /orders/:id | `{ data: Order }` |
| useDeleteOrder | DELETE | /orders/:id | void |
| useConvertOrderToLoad | POST | /orders/:id/convert | `{ data: Load }` |

## Envelope Handling

Standard `{ data: T }` envelope. Uses `mapOrderFormToApi()` helper to transform frontend form data to API format before sending.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["orders", "list", params]` | default | Always |
| `["orders", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateOrder | POST /orders | list | Yes |
| useUpdateOrder | PATCH /orders/:id | detail + list | Yes |
| useDeleteOrder | DELETE /orders/:id | list | Yes |
| useConvertOrderToLoad | POST /orders/:id/convert | orders list + loads list | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - `mapOrderFormToApi()` does manual field mapping with potential data loss -- fields not in the map are silently dropped
  - `useConvertOrderToLoad` invalidates both orders and loads caches but uses string-based keys -- fragile
  - `OrderFormData` type is separate from `Order` type -- two sources of truth for order shape
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from TMS module
