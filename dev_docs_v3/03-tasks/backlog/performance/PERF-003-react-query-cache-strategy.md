# PERF-003: Implement React Query Cache Invalidation Strategy

**Priority:** P1
**Service:** Frontend Infrastructure
**Scope:** Standardize cache invalidation patterns across all hooks

## Current State
Cache invalidation is inconsistent. Some hooks invalidate broadly (entire query key prefix), others are targeted. Some mutations invalidate 3-4 query keys. No standard `staleTime` or `gcTime` configuration.

Examples from codebase:
- `useUpdateCarrier` invalidates 3 separate key groups
- `useDeleteTruckById` invalidates 2 key groups
- `useCurrentUser` has `staleTime: 5 * 60 * 1000` (5 min)
- `useLoad` has `staleTime: 30000` (30 sec)
- Most hooks have no explicit staleTime

## Requirements
- Define standard staleTime per data type (user: 5min, list: 30sec, detail: 1min, stats: 5min)
- Standardize invalidation patterns (mutation invalidates related list + detail)
- Create utility helpers for common invalidation patterns
- Document cache strategy in dev docs

## Acceptance Criteria
- [ ] Standard staleTime defined per data category
- [ ] All hooks use consistent invalidation patterns
- [ ] Cache invalidation helper utilities created
- [ ] No over-invalidation (too broad) or under-invalidation (stale data)
- [ ] Documentation of cache strategy
- [ ] Verified with React Query DevTools

## Dependencies
- None

## Estimated Effort
M
