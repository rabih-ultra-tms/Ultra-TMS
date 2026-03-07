# SEC-008: Add Security Headers (CSP, HSTS)

**Priority:** P1
**Files:** `apps/api/src/main.ts`, `apps/web/next.config.js`

## Current State
No security headers are configured in the backend `main.ts` or frontend `next.config.js`. The backend only configures CORS (hardcoded to localhost:3000 and localhost:3002). Missing critical security headers that browsers use to prevent common attacks.

Current CORS in `main.ts` (lines 44-47):
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
});
```

## Requirements
- **Content-Security-Policy (CSP):** Restrict script/style/image sources. Allow Google Maps API domain, self, inline styles (for Tailwind).
- **Strict-Transport-Security (HSTS):** `max-age=31536000; includeSubDomains; preload` (production only)
- **X-Content-Type-Options:** `nosniff`
- **X-Frame-Options:** `DENY` (or `SAMEORIGIN` if iframe embedding needed)
- **X-XSS-Protection:** `0` (rely on CSP instead of legacy header)
- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **Permissions-Policy:** Disable unused browser features (camera, microphone, geolocation except for tracking)
- Configure via `helmet` package on backend and `next.config.js` headers on frontend
- CORS origin should be configurable via environment variable for production deployments

## Acceptance Criteria
- [ ] All security headers present in responses
- [ ] CSP does not break Google Maps, Lucide icons, or Tailwind styles
- [ ] HSTS enabled in production only
- [ ] X-Frame-Options prevents clickjacking
- [ ] CORS origin configurable via environment variable
- [ ] Headers verified via security scanner (e.g., securityheaders.com)

## Dependencies
- `helmet` package for NestJS
- `next.config.js` headers configuration
- Google Maps API domain for CSP allowlist

## Estimated Effort
M
