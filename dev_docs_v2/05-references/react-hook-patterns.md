# React Hook Patterns

> Standard conventions for React Query hooks in `apps/web`. Copy-paste these patterns for every new service.
> Actual hook files live in `apps/web/lib/hooks/{module}/`.

---

## Query Key Factory

Every module defines a key factory object. This ensures consistent cache invalidation.

```typescript
// lib/hooks/orders/use-orders.ts
export const orderKeys = {
  all:     ['orders'] as const,
  lists:   () => [...orderKeys.all, 'list'] as const,
  list:    (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail:  (id: string) => [...orderKeys.details(), id] as const,
};
```

**Naming convention:** `{entity}Keys` — e.g., `carrierKeys`, `loadKeys`, `invoiceKeys`.

---

## Read Hooks

### List Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Order>>('/orders', { params }),
  });
}
```

### Detail Hook

```typescript
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => apiClient.get<Order>(`/orders/${id}`),
    enabled: !!id,  // Don't fetch if id is empty/undefined
  });
}
```

**Rules:**
- Always use `enabled: !!id` on detail hooks to prevent fetching with empty IDs
- Return the full `useQuery` result — let the component destructure `{ data, isLoading, error }`
- Don't transform data inside hooks unless there's a strong reason

---

## Mutation Hooks

### Create

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) =>
      apiClient.post<Order>('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
}
```

### Update

```typescript
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderInput }) =>
      apiClient.patch<Order>(`/orders/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });
}
```

### Delete

```typescript
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete order');
    },
  });
}
```

---

## Cache Invalidation Rules

| Action | Invalidate |
|--------|-----------|
| Create | `lists()` only (new item shows in list) |
| Update | `detail(id)` + `lists()` (item + list both stale) |
| Delete | `lists()` only (item removed from list) |
| Status change | `detail(id)` + `lists()` |
| Bulk action | `all` (nuclear — everything stale) |

**Pattern:** Always invalidate the most specific key first, then parent keys.

```typescript
// Good: specific then broad
queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

// Bad: too broad (refetches everything)
queryClient.invalidateQueries({ queryKey: orderKeys.all });
```

---

## Error Handling

```typescript
// Always provide a fallback message
onError: (error: Error) => {
  toast.error(error.message || 'Something went wrong');
},
```

**Toast conventions:**
- `toast.success('Order created')` — past tense, concise
- `toast.error(error.message || 'Failed to create order')` — "Failed to {action}"
- `toast.loading('Creating order...')` — only for long operations (>2s)

---

## Optimistic Updates (Advanced)

Use for drag-drop operations like the Dispatch Board:

```typescript
export function useUpdateLoadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LoadStatus }) =>
      apiClient.patch(`/loads/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: loadKeys.lists() });

      // Snapshot previous value
      const previous = queryClient.getQueryData(loadKeys.lists());

      // Optimistically update
      queryClient.setQueryData(loadKeys.lists(), (old: any) => ({
        ...old,
        data: old.data.map((load: Load) =>
          load.id === id ? { ...load, status } : load
        ),
      }));

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      queryClient.setQueryData(loadKeys.lists(), context?.previous);
      toast.error('Failed to update status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: loadKeys.lists() });
    },
  });
}
```

---

## File Organization

```
apps/web/lib/hooks/
├── orders/
│   └── use-orders.ts       # orderKeys + useOrders + useOrder + mutations
├── loads/
│   └── use-loads.ts         # loadKeys + useLoads + useLoad + mutations
├── carriers/
│   └── use-carriers.ts      # carrierKeys + useCarriers + useCarrier + mutations
├── quotes/
│   └── use-quotes.ts
├── invoices/
│   └── use-invoices.ts
├── load-board/
│   └── use-load-board.ts
└── commissions/
    └── use-commissions.ts
```

**Naming:** `use-{module}.ts` — one file per module, exports all hooks for that module.

---

## Full Skeleton: `use-orders.ts`

Copy this for any new module — replace "order/Order" with your entity:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderListParams,
  PaginatedResponse,
} from '@/types';

// --- Key Factory ---

export const orderKeys = {
  all:     ['orders'] as const,
  lists:   () => [...orderKeys.all, 'list'] as const,
  list:    (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail:  (id: string) => [...orderKeys.details(), id] as const,
};

// --- Read Hooks ---

export function useOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Order>>('/orders', { params }),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => apiClient.get<Order>(`/orders/${id}`),
    enabled: !!id,
  });
}

// --- Mutation Hooks ---

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) =>
      apiClient.post<Order>('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderInput }) =>
      apiClient.patch<Order>(`/orders/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete order');
    },
  });
}
```
