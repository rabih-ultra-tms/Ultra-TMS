# SEC-003: Add RolesGuard to Cache Module Endpoints

**Priority:** P1
**Files:** `apps/api/src/modules/cache/config/cache-config.controller.ts`, `apps/api/src/modules/cache/locking/locks.controller.ts`, `apps/api/src/modules/cache/management/cache-management.controller.ts`, `apps/api/src/modules/cache/rate-limiting/rate-limit.controller.ts`

## Current State
All four cache controllers use `@UseGuards(JwtAuthGuard)` for authentication but do NOT apply `RolesGuard` or `@Roles()` decorator. This means any authenticated user (including basic users, customers, or carrier portal users) can access cache management endpoints including:
- Cache configuration (read/write)
- Cache invalidation (delete cache entries)
- Lock management (view/release distributed locks)
- Rate limit configuration (modify rate limits)

These are administrative/infrastructure endpoints that should be restricted to SUPER_ADMIN or ADMIN roles only.

## Vulnerable Code
```typescript
// cache-config.controller.ts line 11
@UseGuards(JwtAuthGuard)  // Missing: RolesGuard
// Missing: @Roles('SUPER_ADMIN', 'ADMIN')

// Same pattern in all 4 controllers
```

## Requirements
- Add `RolesGuard` to all cache module controllers
- Restrict to SUPER_ADMIN and ADMIN roles only
- Apply `@Roles('SUPER_ADMIN', 'ADMIN')` decorator at controller level
- Add `stats/` subdirectory controllers if they exist (check)

## Acceptance Criteria
- [ ] All cache endpoints require SUPER_ADMIN or ADMIN role
- [ ] Non-admin users receive 403 Forbidden
- [ ] Existing admin functionality unaffected
- [ ] Tests updated to verify role restrictions

## Dependencies
- Auth module RolesGuard

## Estimated Effort
S
