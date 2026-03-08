# SEC-005: Add Rate Limiting to All Public Endpoints

**Priority:** P1
**Files:** `apps/api/src/main.ts`, `apps/api/src/modules/auth/`, `apps/api/src/modules/cache/rate-limiting/`

## Current State
A rate-limiting subdirectory exists in the cache module (`apps/api/src/modules/cache/rate-limiting/`) with a controller and likely a service, but it's unclear if rate limiting is actually applied globally or to specific endpoints. No global rate limiting middleware is configured in `main.ts`. The auth endpoints (login, register, forgot-password, refresh) are especially vulnerable to brute-force attacks without rate limiting.

## Requirements
- Global rate limiting: 100 requests/minute per IP for authenticated endpoints
- Strict rate limiting for auth endpoints: 5 requests/minute for login, 3 for forgot-password, 10 for refresh
- Rate limiting headers in responses (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- Redis-backed rate limiting (Redis is available in docker-compose)
- IP-based and user-based rate limiting
- Whitelist for health check endpoints
- Custom rate limits per endpoint via decorator

## Acceptance Criteria
- [ ] Auth endpoints rate-limited (login: 5/min, forgot-password: 3/min)
- [ ] Global rate limit applied to all endpoints
- [ ] Rate limit headers present in responses
- [ ] 429 Too Many Requests returned when limit exceeded
- [ ] Redis-backed for distributed rate limiting
- [ ] Health endpoints exempt

## Dependencies
- Redis module (already available)
- `@nestjs/throttler` package or custom implementation

## Estimated Effort
M

---

## Multi-Tenant Rate Limit Tiers

### Default Limits (All Tenants)

| Scope | Limit | Window | Applies To |
|-------|-------|--------|-----------|
| Global (per IP) | 1000 requests | 1 minute | All endpoints |
| Auth (per IP) | 5 requests (login) | 1 minute | POST /auth/login |
| Auth (per IP) | 3 requests (forgot-pw) | 1 minute | POST /auth/forgot-password |
| API (per user + tenant) | 200 requests | 1 minute | All authenticated endpoints |
| Bulk operations (per tenant) | 10 requests | 1 minute | POST /bulk/*, export endpoints |
| WebSocket (per connection) | 60 messages | 1 minute | All WS namespaces |
| File upload (per tenant) | 20 uploads | 1 minute | POST /documents/upload |

### Future Plan-Based Overrides

| Plan | API Rate | WS Connections | Storage | Bulk Ops |
|------|----------|---------------|---------|----------|
| Free/Trial | 100/min | 5 | 1 GB | 5/min |
| Pro | 500/min | 25 | 10 GB | 20/min |
| Enterprise | 2000/min | 100 | Unlimited | 50/min |

### Implementation Notes

- Use `@nestjs/throttler` module (already in NestJS ecosystem)
- Store counters in Redis using sliding window algorithm
- Return standard headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Return `429 Too Many Requests` with `Retry-After` header when exceeded
- Tenant-level overrides stored in `TenantSettings` Prisma model
- Auth endpoints get strictest limits (brute force prevention)

### See Also

- ADR-015: Redis for queues and cache (rate limit counters stored in Redis)
- SEC-004: CSRF protection
- architecture.md: Caching strategy (shares Redis instance)
