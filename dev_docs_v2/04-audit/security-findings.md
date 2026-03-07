# Security Audit Findings — 2026-03-06

## P0 — Critical (All FIXED)

### S1: Test-Mode Auth Bypass (FIXED)
- **File:** `apps/api/src/modules/auth/guards/jwt-auth.guard.ts:24`
- **Issue:** When `NODE_ENV=test`, JwtAuthGuard auto-creates an ADMIN user from request headers, bypassing all authentication. If `NODE_ENV=test` leaked to production, ALL endpoints would be open.
- **Fix:** Added `process.env.ALLOW_TEST_AUTH === 'true'` guard. Both conditions must be true for test bypass to activate. `ALLOW_TEST_AUTH` must never be set in production.
- **Verification:** Ensure deployment configs do NOT set `ALLOW_TEST_AUTH=true`

### S2: JWT Fallback Secret (FIXED)
- **File:** `apps/api/src/modules/auth/auth.module.ts:29`
- **Issue:** `configService.get('JWT_SECRET') || 'default-secret'` — if env var missing, app runs with known secret.
- **Fix:** Removed fallback. App now throws `Error('JWT_SECRET environment variable is required')` on startup if missing.

### S3: Health Endpoints Require JWT (FIXED)
- **File:** `apps/api/src/modules/health/health.controller.ts`
- **Issue:** `/health`, `/ready`, `/live` endpoints require JWT auth, breaking monitoring/health checks.
- **Fix:** Added `@Public()` decorator to `HealthController` class.

### S4: Public Tracking Requires JWT (FIXED)
- **File:** `apps/api/src/modules/tms/public-tracking.controller.ts`
- **Issue:** Public tracking page (for customers/recipients) requires auth despite being public-facing.
- **Fix:** Added `@Public()` decorator to `PublicTrackingController` class.

## P2 — Open

### S5: CORS Hardcoded to Localhost
- **File:** `apps/api/src/main.ts:44-47`
- **Issue:** CORS origins hardcoded to `localhost:3000` and `localhost:3002`. No production domain configuration.
- **Recommended Fix:** Use `CORS_ORIGINS` environment variable.

### S6: bcrypt Salt Rounds
- **File:** `apps/api/src/modules/auth/*.service.ts`
- **Issue:** Salt rounds = 10 (industry minimum). 12 recommended for production.
- **Status:** Acceptable for MVP, increase before production launch.
