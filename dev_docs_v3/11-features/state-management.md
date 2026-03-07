# State Management

> Source: `dev_docs/10-features/84-state-management-standards.md`
> Last updated: 2026-03-07

---

## Overview

Ultra TMS uses a **layered state strategy** — each type of state has a designated tool. No duplication of server state on the client.

---

## State Categories

| Category | Tool | Examples |
|----------|------|----------|
| **Server State** | React Query (TanStack Query) | Carriers, loads, invoices, users |
| **Global UI State** | Zustand | Sidebar open, theme, notification panel |
| **Local UI State** | useState / useReducer | Form inputs, dropdown visibility |
| **Auth State** | React Context | Current user, permissions, token |
| **URL State** | Next.js Router (useSearchParams) | Filters, pagination, search terms |

---

## Core Rules

1. **Server state → React Query** — All API data
2. **Global UI state → Zustand** — Sidebar, modals, preferences
3. **Local UI state → useState** — Form inputs, toggles
4. **Auth state → Context** — Current user, permissions
5. **NEVER duplicate server state** — Single source of truth

---

## React Query Setup

```typescript
// lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      gcTime: 1000 * 60 * 30,       // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});
```

### Query Keys Convention

```typescript
// lib/query-keys.ts — hierarchical keys for cache invalidation
export const queryKeys = {
  carriers: {
    all: ['carriers'] as const,
    lists: () => [...queryKeys.carriers.all, 'list'] as const,
    list: (filters: CarrierFilters) => [...queryKeys.carriers.lists(), filters] as const,
    details: () => [...queryKeys.carriers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.carriers.details(), id] as const,
  },
  loads: {
    all: ['loads'] as const,
    lists: () => [...queryKeys.loads.all, 'list'] as const,
    list: (filters: LoadFilters) => [...queryKeys.loads.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.loads.all, 'detail', id] as const,
  },
};
```

### Custom Hook Pattern

```typescript
// lib/hooks/useCarriers.ts
export function useCarriers(filters: CarrierFilters) {
  return useQuery({
    queryKey: queryKeys.carriers.list(filters),
    queryFn: async () => {
      const response = await apiClient.get('/carriers', { params: filters });
      return response.data.data; // Unwrap API envelope
    },
  });
}

export function useCreateCarrier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCarrierDto) =>
      apiClient.post('/carriers', data).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.carriers.all });
      toast.success('Carrier created');
    },
  });
}
```

---

## Zustand (Global UI State)

```typescript
// lib/stores/ui-store.ts
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  notificationPanelOpen: boolean;
  toggleNotificationPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  notificationPanelOpen: false,
  toggleNotificationPanel: () => set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),
}));
```

**When to use Zustand vs Context:**
- Zustand: frequently changing state, multiple subscribers, no React tree dependency
- Context: auth state (rarely changes), theme, locale

---

## URL State (Filters & Pagination)

```typescript
// Use Next.js searchParams for shareable filter state
export function useUrlFilters<T extends Record<string, string>>() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() =>
    Object.fromEntries(searchParams.entries()) as T,
    [searchParams]
  );

  const setFilters = useCallback((newFilters: Partial<T>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  return { filters, setFilters };
}
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Correct Approach |
|-------------|-------------|-----------------|
| Storing API data in useState | Stale data, no cache | Use React Query |
| Zustand for server data | Duplicates source of truth | React Query for server state |
| Context for high-frequency state | Re-renders entire tree | Zustand with selectors |
| No query key hierarchy | Can't invalidate related queries | Use `queryKeys` factory |
| `response.data` without unwrapping | Wrong data shape (envelope) | Always `response.data.data` |

---

## Cache Invalidation Strategy

```typescript
// After mutation, invalidate related queries
onSuccess: () => {
  // Invalidate all carrier lists (but not details)
  queryClient.invalidateQueries({ queryKey: queryKeys.carriers.lists() });

  // Or invalidate everything for carriers
  queryClient.invalidateQueries({ queryKey: queryKeys.carriers.all });

  // Or update a single item optimistically
  queryClient.setQueryData(
    queryKeys.carriers.detail(id),
    (old) => ({ ...old, ...updatedFields })
  );
};
```
