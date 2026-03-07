# useDebounce

**File:** `apps/web/lib/hooks/use-debounce.ts`
**LOC:** 13

## Signature
```typescript
export function useDebounce<T>(value: T, delay: number = 300): T
```

## API Endpoints Called
None -- pure utility hook.

## Envelope Handling
N/A

## Queries (React Query)
None.

## Mutations
None.

## Quality Assessment
- **Score:** 10/10
- **Anti-patterns:** None. Textbook debounce implementation with proper cleanup.
- **Dependencies:** React `useState`, `useEffect` only.
