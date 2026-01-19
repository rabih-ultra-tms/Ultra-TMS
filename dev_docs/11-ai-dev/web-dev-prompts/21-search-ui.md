# 21 - Search UI Implementation

> **Service:** Search (Global Search & Filtering)  
> **Priority:** P2 - Medium  
> **Pages:** 3  
> **API Endpoints:** 12  
> **Dependencies:** Foundation ✅, Auth API ✅, Search API ✅  
> **Doc Reference:** [28-service-search.md](../../02-services/28-service-search.md)

---

## 📋 Overview

The Search UI provides global search capabilities across all entities in the TMS, including quick search, advanced search, saved searches, and search analytics. This enables users to quickly find loads, customers, carriers, invoices, etc.

### Key Screens
- Global search (header component)
- Advanced search page
- Saved searches
- Search history

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Search API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── search/
│   ├── page.tsx                    # Advanced search
│   ├── saved/
│   │   └── page.tsx                # Saved searches
│   └── history/
│       └── page.tsx                # Search history
```

**Global Component (Header):**
```
components/layout/
└── global-search.tsx               # Command palette / search
```

---

## 🎨 Components to Create

```
components/search/
├── global-search-trigger.tsx       # Header trigger button
├── global-search-dialog.tsx        # Command palette
├── search-input.tsx                # Search input field
├── search-results.tsx              # Results container
├── search-result-item.tsx          # Single result
├── search-result-group.tsx         # Grouped results
├── entity-icon.tsx                 # Entity type icon
├── quick-filters.tsx               # Common filters
├── advanced-search-form.tsx        # Full filter form
├── entity-type-selector.tsx        # Entity selection
├── date-range-filter.tsx           # Date filtering
├── saved-searches-list.tsx         # Saved searches
├── save-search-dialog.tsx          # Save search form
├── search-history-list.tsx         # History list
├── recent-searches.tsx             # Quick access
├── search-suggestions.tsx          # Type-ahead
└── no-results.tsx                  # Empty state
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/search.ts`

```typescript
export type EntityType = 
  | 'LOAD'
  | 'ORDER'
  | 'CUSTOMER'
  | 'CARRIER'
  | 'CONTACT'
  | 'INVOICE'
  | 'QUOTE'
  | 'DOCUMENT'
  | 'USER';

export interface SearchResult {
  id: string;
  entityType: EntityType;
  
  // Display
  title: string;
  subtitle?: string;
  description?: string;
  
  // Reference
  referenceNumber?: string;
  
  // Status
  status?: string;
  statusColor?: string;
  
  // Highlight
  highlights?: { field: string; snippet: string }[];
  
  // Metadata
  metadata?: Record<string, unknown>;
  
  // Navigation
  url: string;
  
  // Score
  score?: number;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  
  // Facets
  facets?: SearchFacet[];
  
  // Suggestions
  suggestions?: string[];
  
  // Query info
  queryTime: number;
}

export interface SearchFacet {
  field: string;
  label: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  label: string;
  count: number;
  selected?: boolean;
}

export interface SearchQuery {
  query: string;
  entityTypes?: EntityType[];
  
  // Filters
  filters?: SearchFilter[];
  
  // Date
  dateField?: string;
  dateFrom?: string;
  dateTo?: string;
  
  // Pagination
  page?: number;
  pageSize?: number;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'in' | 'range' | 'exists';
  value: unknown;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  
  // Query
  query: SearchQuery;
  
  // Display
  isDefault: boolean;
  isPinned: boolean;
  
  // Sharing
  isShared: boolean;
  sharedWith?: string[];
  
  // Usage
  usageCount: number;
  lastUsedAt?: string;
  
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  entityTypes?: EntityType[];
  resultCount: number;
  searchedAt: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'RECENT' | 'POPULAR' | 'ENTITY' | 'FILTER';
  entityType?: EntityType;
  metadata?: Record<string, unknown>;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/search/use-search.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  SearchResult,
  SearchResponse,
  SearchQuery,
  SavedSearch,
  SearchHistoryEntry,
  SearchSuggestion,
} from '@/lib/types/search';
import { toast } from 'sonner';

export const searchKeys = {
  all: ['search'] as const,
  
  results: (query: SearchQuery) => [...searchKeys.all, 'results', query] as const,
  suggestions: (query: string) => [...searchKeys.all, 'suggestions', query] as const,
  
  saved: () => [...searchKeys.all, 'saved'] as const,
  savedList: (params?: Record<string, unknown>) => [...searchKeys.saved(), 'list', params] as const,
  savedDetail: (id: string) => [...searchKeys.saved(), id] as const,
  
  history: (params?: Record<string, unknown>) => [...searchKeys.all, 'history', params] as const,
};

// Search
export function useSearch(query: SearchQuery, options = { enabled: true }) {
  return useQuery({
    queryKey: searchKeys.results(query),
    queryFn: () => apiClient.post<SearchResponse>('/search', query),
    enabled: options.enabled && !!query.query,
    staleTime: 0, // Always refetch
  });
}

// Quick Search (debounced)
export function useQuickSearch(query: string) {
  return useQuery({
    queryKey: searchKeys.results({ query, pageSize: 10 }),
    queryFn: () => apiClient.get<SearchResponse>('/search/quick', { q: query }),
    enabled: query.length >= 2,
    staleTime: 30000, // 30 seconds
  });
}

// Suggestions
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: () => apiClient.get<{ data: SearchSuggestion[] }>('/search/suggestions', { q: query }),
    enabled: query.length >= 2,
    staleTime: 60000, // 1 minute
  });
}

// Saved Searches
export function useSavedSearches(params = {}) {
  return useQuery({
    queryKey: searchKeys.savedList(params),
    queryFn: () => apiClient.get<{ data: SavedSearch[] }>('/search/saved', params),
  });
}

export function useSavedSearch(id: string) {
  return useQuery({
    queryKey: searchKeys.savedDetail(id),
    queryFn: () => apiClient.get<{ data: SavedSearch }>(`/search/saved/${id}`),
    enabled: !!id,
  });
}

export function useSaveSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; description?: string; query: SearchQuery; isPinned?: boolean }) =>
      apiClient.post<{ data: SavedSearch }>('/search/saved', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.saved() });
      toast.success('Search saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save search');
    },
  });
}

export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavedSearch> }) =>
      apiClient.patch<{ data: SavedSearch }>(`/search/saved/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.saved() });
      toast.success('Saved search updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update');
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/search/saved/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.saved() });
      toast.success('Saved search deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete');
    },
  });
}

// Search History
export function useSearchHistory(params = {}) {
  return useQuery({
    queryKey: searchKeys.history(params),
    queryFn: () => apiClient.get<{ data: SearchHistoryEntry[] }>('/search/history', params),
  });
}

export function useClearSearchHistory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.delete('/search/history'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.history() });
      toast.success('History cleared');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clear history');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/search-store.ts`

```typescript
import { createStore } from './create-store';
import { EntityType, SearchQuery, SearchFilter } from '@/lib/types/search';

interface SearchState {
  // Quick Search
  isOpen: boolean;
  query: string;
  
  // Advanced Search
  searchQuery: SearchQuery;
  
  // UI State
  selectedEntityTypes: EntityType[];
  activeFilters: SearchFilter[];
  
  // Actions
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
  setSearchQuery: (query: SearchQuery) => void;
  setEntityTypes: (types: EntityType[]) => void;
  addFilter: (filter: SearchFilter) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  reset: () => void;
}

const defaultSearchQuery: SearchQuery = {
  query: '',
  entityTypes: [],
  filters: [],
  page: 1,
  pageSize: 20,
};

export const useSearchStore = createStore<SearchState>('search-store', (set, get) => ({
  isOpen: false,
  query: '',
  searchQuery: defaultSearchQuery,
  selectedEntityTypes: [],
  activeFilters: [],
  
  setOpen: (open) => set({ isOpen: open }),
  
  setQuery: (query) => set({ query }),
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  setEntityTypes: (types) => set({ 
    selectedEntityTypes: types,
    searchQuery: { ...get().searchQuery, entityTypes: types },
  }),
  
  addFilter: (filter) => {
    const existing = get().activeFilters.filter(f => f.field !== filter.field);
    set({ 
      activeFilters: [...existing, filter],
      searchQuery: { ...get().searchQuery, filters: [...existing, filter] },
    });
  },
  
  removeFilter: (field) => {
    const filters = get().activeFilters.filter(f => f.field !== field);
    set({ 
      activeFilters: filters,
      searchQuery: { ...get().searchQuery, filters },
    });
  },
  
  clearFilters: () => set({ 
    activeFilters: [],
    searchQuery: { ...get().searchQuery, filters: [] },
  }),
  
  reset: () => set({
    query: '',
    searchQuery: defaultSearchQuery,
    selectedEntityTypes: [],
    activeFilters: [],
  }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/search.ts`

```typescript
import { z } from 'zod';

export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  entityTypes: z.array(z.enum([
    'LOAD', 'ORDER', 'CUSTOMER', 'CARRIER', 'CONTACT', 'INVOICE', 'QUOTE', 'DOCUMENT', 'USER'
  ])).optional(),
  dateField: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const saveSearchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  isPinned: z.boolean().default(false),
  isShared: z.boolean().default(false),
});

export type SearchQueryData = z.infer<typeof searchQuerySchema>;
export type SaveSearchData = z.infer<typeof saveSearchSchema>;
```

---

## 🎹 Keyboard Shortcuts

The global search should support keyboard shortcuts:

```typescript
// Keyboard shortcuts for global search
const SEARCH_SHORTCUTS = {
  open: 'cmd+k', // or ctrl+k on Windows
  close: 'Escape',
  selectNext: 'ArrowDown',
  selectPrev: 'ArrowUp',
  openResult: 'Enter',
};
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/search/global-search-trigger.tsx`
- [ ] `components/search/global-search-dialog.tsx`
- [ ] `components/search/search-input.tsx`
- [ ] `components/search/search-results.tsx`
- [ ] `components/search/search-result-item.tsx`
- [ ] `components/search/search-result-group.tsx`
- [ ] `components/search/entity-icon.tsx`
- [ ] `components/search/quick-filters.tsx`
- [ ] `components/search/advanced-search-form.tsx`
- [ ] `components/search/entity-type-selector.tsx`
- [ ] `components/search/date-range-filter.tsx`
- [ ] `components/search/saved-searches-list.tsx`
- [ ] `components/search/save-search-dialog.tsx`
- [ ] `components/search/search-history-list.tsx`
- [ ] `components/search/recent-searches.tsx`
- [ ] `components/search/search-suggestions.tsx`
- [ ] `components/search/no-results.tsx`

### Pages
- [ ] `app/(dashboard)/search/page.tsx`
- [ ] `app/(dashboard)/search/saved/page.tsx`
- [ ] `app/(dashboard)/search/history/page.tsx`

### Layout Integration
- [ ] Add `GlobalSearchTrigger` to dashboard header
- [ ] Add keyboard shortcut listener (Cmd/Ctrl + K)

### Hooks & Stores
- [ ] `lib/types/search.ts`
- [ ] `lib/validations/search.ts`
- [ ] `lib/hooks/search/use-search.ts`
- [ ] `lib/stores/search-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] Keyboard navigation tests
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [22-audit-ui.md](./22-audit-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/28-service-search.md)
- [API Review](../../api-review-docs/21-search-review.html)
