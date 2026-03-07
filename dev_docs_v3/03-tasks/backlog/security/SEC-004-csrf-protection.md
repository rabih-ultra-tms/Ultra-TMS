# SEC-004: Implement CSRF Protection

**Priority:** P1
**Files:** `apps/api/src/main.ts`, `apps/web/lib/api/client.ts`

## Current State
No CSRF protection is implemented. The backend uses `credentials: true` in CORS config and the frontend sends cookies with `credentials: 'include'`. While SameSite=Lax cookies provide some protection, they don't prevent all CSRF attack vectors (e.g., top-level GET requests).

Current CORS config in `main.ts` (lines 44-47):
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
});
```

## Requirements
- Implement CSRF token generation on backend (double-submit cookie or synchronizer token pattern)
- Frontend includes CSRF token in all state-changing requests (POST, PUT, PATCH, DELETE)
- CSRF token endpoint or header-based token extraction
- Token rotation on sensitive operations (login, password change)
- Consider using `csurf` package or NestJS CSRF middleware
- Ensure SameSite=Strict on auth cookies (currently Lax)

## Acceptance Criteria
- [ ] CSRF token required for all state-changing requests
- [ ] Token validation fails with 403 for missing/invalid tokens
- [ ] Frontend automatically includes CSRF token
- [ ] Token rotation works correctly
- [ ] GET/HEAD/OPTIONS requests exempt from CSRF check

## Dependencies
- Backend middleware configuration
- Frontend API client modification

## Estimated Effort
M
