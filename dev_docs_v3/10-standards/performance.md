# Performance Standards

> Source: `dev_docs/08-standards/` (consolidated)
> Covers: Frontend bundle, API latency, database queries, caching

## Frontend Performance

### Bundle Size

- **Target:** < 200KB initial JS (gzipped)
- **Strategy:** Dynamic imports for non-critical routes
- **Monitoring:** `next build` output shows page sizes

```tsx
// Dynamic import for heavy components
const DispatchBoard = dynamic(() => import('@/components/dispatch-board'), {
  loading: () => <PageSkeleton />,
});
```

### React Rendering

- Use `React.memo()` for expensive list item components
- Use `useMemo()` for expensive calculations (NOT for side effects)
- Use `useCallback()` for callbacks passed to memoized children
- Debounce search inputs (300ms) — prevent API hammering

```typescript
const debouncedSearch = useDebouncedValue(searchTerm, 300);
```

### Data Fetching

- React Query `staleTime: 30_000` (30 sec) for list data
- React Query `gcTime: 5 * 60_000` (5 min) garbage collection
- Prefetch next page data for pagination
- Use `keepPreviousData: true` for smoother pagination

## API Performance

### Response Time Targets

| Endpoint Type | Target | Max |
|---------------|--------|-----|
| List (paginated) | < 200ms | 500ms |
| Single item | < 100ms | 300ms |
| Create/Update | < 300ms | 1000ms |
| Dashboard aggregation | < 500ms | 2000ms |
| Search | < 200ms | 500ms |

### Query Optimization

```typescript
// Use select to fetch only needed fields
const carriers = await prisma.carrier.findMany({
  where: { tenantId, deletedAt: null },
  select: { id: true, legalName: true, status: true, mcNumber: true },
  take: limit,
  skip: (page - 1) * limit,
});

// Use include sparingly — only when relations are needed
// NEVER: include: { contacts: true, documents: true, insurance: true }
// GOOD: include only what the screen needs
```

### Pagination (MANDATORY for lists)

```typescript
// NEVER return unbounded lists
// ALWAYS paginate with max 100 items per page
const limit = Math.min(dto.limit ?? 20, 100);
```

## Database Performance

### Index Strategy

- Every `WHERE` clause field needs an index
- Composite indexes for common query patterns: `@@index([tenantId, status])`
- Avoid over-indexing — each index costs write performance

### N+1 Prevention

```typescript
// BAD: N+1 queries
const loads = await prisma.load.findMany({ where: { tenantId } });
for (const load of loads) {
  load.carrier = await prisma.carrier.findUnique({ where: { id: load.carrierId } });
}

// GOOD: Single query with include
const loads = await prisma.load.findMany({
  where: { tenantId },
  include: { carrier: { select: { id: true, legalName: true } } },
});
```

## Caching

### Redis Caching (when implemented)

- Session data: Redis with TTL
- Feature flags: Redis with 5-minute TTL
- Dashboard aggregations: Redis with 1-minute TTL
- API rate limiting: Redis sliding window

### Browser Caching

- Static assets: immutable cache headers (Next.js handles this)
- API responses: no cache by default, React Query handles client-side caching
