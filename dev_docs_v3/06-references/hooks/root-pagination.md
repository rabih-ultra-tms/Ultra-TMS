# usePagination

**File:** `apps/web/lib/hooks/use-pagination.ts`
**LOC:** 50

## Signature
```typescript
export function usePagination(options?: {
  initialPage?: number;   // default: 1
  initialLimit?: number;  // default: 20
}): {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
}
```

## API Endpoints Called
None -- pure state management hook.

## Envelope Handling
N/A

## Queries (React Query)
None.

## Mutations
None.

## Quality Assessment
- **Score:** 9/10
- **Anti-patterns:** None. Clean, well-memoized callbacks. `setLimit` resets page to 1.
- **Dependencies:** React `useState`, `useCallback` only.
