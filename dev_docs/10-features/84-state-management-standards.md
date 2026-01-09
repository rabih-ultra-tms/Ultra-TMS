# 79 - State Management Standards

**React state patterns with React Query, Context, and Zustand**

---

## âš ï¸ CLAUDE CODE: State Management Rules

1. **Server state â†’ React Query** - All API data
2. **Global UI state â†’ Zustand** - Sidebar, modals, preferences
3. **Local UI state â†’ useState** - Form inputs, toggles
4. **Auth state â†’ Context** - Current user, permissions
5. **NEVER duplicate server state** - Single source of truth

---

## State Categories

| Category            | Tool           | Examples                           |
| ------------------- | -------------- | ---------------------------------- |
| **Server State**    | React Query    | Carriers, loads, invoices          |
| **Global UI State** | Zustand        | Sidebar open, theme, notifications |
| **Local UI State**  | useState       | Form values, dropdown open         |
| **Auth State**      | Context        | User, token, permissions           |
| **URL State**       | Next.js Router | Filters, pagination, search        |

---

## React Query (Server State)

### Setup

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

```typescript
// app/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Query Keys Convention

```typescript
// lib/query-keys.ts

// Hierarchical key structure for cache invalidation
export const queryKeys = {
  // Carriers
  carriers: {
    all: ['carriers'] as const,
    lists: () => [...queryKeys.carriers.all, 'list'] as const,
    list: (filters: CarrierFilters) =>
      [...queryKeys.carriers.lists(), filters] as const,
    details: () => [...queryKeys.carriers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.carriers.details(), id] as const,
    scorecard: (id: string) =>
      [...queryKeys.carriers.detail(id), 'scorecard'] as const,
  },

  // Loads
  loads: {
    all: ['loads'] as const,
    lists: () => [...queryKeys.loads.all, 'list'] as const,
    list: (filters: LoadFilters) =>
      [...queryKeys.loads.lists(), filters] as const,
    details: () => [...queryKeys.loads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.loads.details(), id] as const,
    stops: (id: string) => [...queryKeys.loads.detail(id), 'stops'] as const,
    events: (id: string) => [...queryKeys.loads.detail(id), 'events'] as const,
  },

  // User
  user: {
    current: ['user', 'current'] as const,
    preferences: ['user', 'preferences'] as const,
  },

  // Dashboard
  dashboard: {
    operations: ['dashboard', 'operations'] as const,
    sales: ['dashboard', 'sales'] as const,
    accounting: ['dashboard', 'accounting'] as const,
  },
};
```

### Custom Query Hooks

```typescript
// hooks/use-carriers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { api } from '@/lib/api-client';
import { Carrier, CarrierFilters, CreateCarrierDto } from '@/types';

// List query
export function useCarriers(filters: CarrierFilters = {}) {
  return useQuery({
    queryKey: queryKeys.carriers.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));

      const response = await api.get<{
        data: Carrier[];
        pagination: Pagination;
      }>(`/carriers?${params}`);

      return response;
    },
  });
}

// Detail query
export function useCarrier(id: string) {
  return useQuery({
    queryKey: queryKeys.carriers.detail(id),
    queryFn: () => api.get<{ data: Carrier }>(`/carriers/${id}`),
    enabled: !!id,
  });
}

// Create mutation
export function useCreateCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCarrierDto) =>
      api.post<{ data: Carrier }>('/carriers', data),
    onSuccess: () => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.carriers.lists(),
      });
    },
  });
}

// Update mutation
export function useUpdateCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Carrier> }) =>
      api.put<{ data: Carrier }>(`/carriers/${id}`, data),
    onSuccess: (result, { id }) => {
      // Update cache directly
      queryClient.setQueryData(queryKeys.carriers.detail(id), result);
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.carriers.lists(),
      });
    },
  });
}

// Delete mutation
export function useDeleteCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/carriers/${id}`),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.carriers.detail(id),
      });
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.carriers.lists(),
      });
    },
  });
}
```

### Optimistic Updates

```typescript
// hooks/use-update-load-status.ts
export function useUpdateLoadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loadId, status }: { loadId: string; status: LoadStatus }) =>
      api.put<{ data: Load }>(`/loads/${loadId}/status`, { status }),

    // Optimistically update before server responds
    onMutate: async ({ loadId, status }) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.loads.detail(loadId),
      });

      // Snapshot previous value
      const previousLoad = queryClient.getQueryData<{ data: Load }>(
        queryKeys.loads.detail(loadId)
      );

      // Optimistically update
      if (previousLoad) {
        queryClient.setQueryData(queryKeys.loads.detail(loadId), {
          data: { ...previousLoad.data, status },
        });
      }

      return { previousLoad };
    },

    // Rollback on error
    onError: (err, { loadId }, context) => {
      if (context?.previousLoad) {
        queryClient.setQueryData(
          queryKeys.loads.detail(loadId),
          context.previousLoad
        );
      }
    },

    // Refetch after success or error
    onSettled: (_, __, { loadId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loads.detail(loadId),
      });
    },
  });
}
```

### Infinite Queries (Pagination)

```typescript
// hooks/use-infinite-loads.ts
export function useInfiniteLoads(filters: LoadFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.loads.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.set('page', String(pageParam));
      params.set('limit', '20');
      if (filters.status) params.set('status', filters.status);

      return api.get<{ data: Load[]; pagination: Pagination }>(
        `/loads?${params}`
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

// Usage
function LoadList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteLoads({ status: 'ACTIVE' });

  const loads = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div>
      {loads.map((load) => (
        <LoadCard key={load.id} load={load} />
      ))}
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
```

---

## Zustand (Global UI State)

### Store Setup

```typescript
// stores/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;

  // Active filters (persisted)
  loadFilters: LoadFilters;
  setLoadFilters: (filters: Partial<LoadFilters>) => void;
  resetLoadFilters: () => void;
}

const defaultLoadFilters: LoadFilters = {
  status: undefined,
  dateRange: 'today',
  search: '',
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Notifications
      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),

      // Filters
      loadFilters: defaultLoadFilters,
      setLoadFilters: (filters) =>
        set((state) => ({
          loadFilters: { ...state.loadFilters, ...filters },
        })),
      resetLoadFilters: () => set({ loadFilters: defaultLoadFilters }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        loadFilters: state.loadFilters,
      }),
    }
  )
);
```

### Modal/Dialog Store

```typescript
// stores/modal-store.ts
import { create } from 'zustand';

type ModalType =
  | 'createCarrier'
  | 'editCarrier'
  | 'deleteConfirm'
  | 'dispatchLoad'
  | null;

interface ModalState {
  type: ModalType;
  data: any;
  isOpen: boolean;
  open: (type: ModalType, data?: any) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  data: null,
  isOpen: false,
  open: (type, data = null) => set({ type, data, isOpen: true }),
  close: () => set({ type: null, data: null, isOpen: false }),
}));

// Usage in components
function CarrierList() {
  const openModal = useModalStore((state) => state.open);

  return (
    <Button onClick={() => openModal('createCarrier')}>
      Add Carrier
    </Button>
  );
}

function ModalContainer() {
  const { type, data, isOpen, close } = useModalStore();

  return (
    <>
      {type === 'createCarrier' && (
        <CreateCarrierModal open={isOpen} onClose={close} />
      )}
      {type === 'editCarrier' && (
        <EditCarrierModal open={isOpen} onClose={close} carrier={data} />
      )}
      {type === 'deleteConfirm' && (
        <DeleteConfirmModal open={isOpen} onClose={close} {...data} />
      )}
    </>
  );
}
```

---

## Context (Auth State)

### Auth Context

```typescript
// contexts/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenantId: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/v1/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.data.user);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  }, [router]);

  const hasRole = useCallback(
    (role: string) => user?.roles.includes(role) ?? false,
    [user]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      // Implement permission checking based on roles
      // This would typically check against a permissions map
      return true; // Simplified
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, hasRole, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## URL State (Filters, Pagination)

### URL Search Params

```typescript
// hooks/use-query-params.ts
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useQueryParams<T extends Record<string, string>>() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getParams = useCallback((): Partial<T> => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params as Partial<T>;
  }, [searchParams]);

  const setParams = useCallback(
    (newParams: Partial<T>, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const url = params.toString() ? `${pathname}?${params}` : pathname;

      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [searchParams, router, pathname]
  );

  return { params: getParams(), setParams };
}

// Usage
function LoadsPage() {
  const { params, setParams } = useQueryParams<{
    search: string;
    status: string;
    page: string;
  }>();

  // Sync with React Query
  const { data } = useLoads({
    search: params.search,
    status: params.status,
    page: Number(params.page) || 1,
  });

  return (
    <div>
      <Input
        value={params.search || ''}
        onChange={(e) => setParams({ search: e.target.value, page: '1' })}
        placeholder="Search..."
      />
      <Select
        value={params.status}
        onValueChange={(status) => setParams({ status, page: '1' })}
      >
        {/* Options */}
      </Select>
      <LoadTable loads={data?.data ?? []} />
      <Pagination
        currentPage={Number(params.page) || 1}
        onPageChange={(page) => setParams({ page: String(page) })}
      />
    </div>
  );
}
```

---

## State Decision Matrix

| Question                              | Answer â†’ Use              |
| ------------------------------------- | --------------------------- |
| Is it data from API?                  | React Query                 |
| Does it need to persist across pages? | Zustand (persisted)         |
| Is it auth/user related?              | Context                     |
| Should it be in URL?                  | URL params                  |
| Is it form input?                     | useState or React Hook Form |
| Is it local component toggle?         | useState                    |
| Is it global (sidebar, theme)?        | Zustand                     |

---

## Anti-Patterns to Avoid

```typescript
// âŒ DON'T: Duplicate server state in local state
const [carriers, setCarriers] = useState([]);
useEffect(() => {
  fetch('/api/carriers').then(res => res.json()).then(setCarriers);
}, []);

// âœ… DO: Use React Query
const { data: carriers } = useCarriers();

// âŒ DON'T: Prop drill through many levels
<App>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} />
    </Sidebar>
  </Layout>
</App>

// âœ… DO: Use Context for shared data
<AuthProvider>
  <App />
</AuthProvider>

// âŒ DON'T: Store derived state
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0));
}, [items]);

// âœ… DO: Compute derived values
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);

// âŒ DON'T: Use Context for frequently changing state
<FilterContext.Provider value={{ search, setSearch }}>
  {/* Re-renders entire tree on every keystroke */}
</FilterContext.Provider>

// âœ… DO: Use Zustand for frequently changing global state
const useFilterStore = create((set) => ({
  search: '',
  setSearch: (search) => set({ search }),
}));
```

---

## State Management Checklist

### Before Adding State

- [ ] Is this derived from other state? â†’ Compute it
- [ ] Is this from the server? â†’ React Query
- [ ] Is this URL-worthy? â†’ URL params
- [ ] Is this needed elsewhere? â†’ Zustand or Context
- [ ] Is this form data? â†’ React Hook Form or useState

### Performance

- [ ] Memoize computed values with useMemo
- [ ] Memoize callbacks with useCallback
- [ ] Use Zustand selectors to prevent re-renders
- [ ] Split large stores into slices

---

## Cross-References

- **Frontend Architecture (doc 64)**: Component structure
- **API Design (doc 62)**: Response format for React Query
- **Real-Time (doc 74)**: WebSocket state updates
- **Performance (doc 80)**: Caching strategies

---

## Navigation

- **Previous:** [Accessibility Standards](./78-accessibility-standards.md)
- **Next:** [Performance & Caching Standards](./80-performance-caching-standards.md)
