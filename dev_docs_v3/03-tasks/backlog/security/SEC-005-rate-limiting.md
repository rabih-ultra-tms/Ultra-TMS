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
