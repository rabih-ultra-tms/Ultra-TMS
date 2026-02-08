# Security Review

**Application:** Ultra TMS - 3PL Logistics Platform
**Stack:** Next.js 16 + NestJS 10 + PostgreSQL + Redis
**Review Date:** 2026-02-07
**Scope:** Authentication, authorization, multi-tenant isolation, input validation, API security, secret management

---

## Executive Summary

The Ultra TMS platform has a solid authentication foundation with JWT + refresh token rotation, bcrypt password hashing, Redis-backed session management, and account lockout protection. The RBAC system supports role-based and permission-based access control. However, several critical security gaps exist that must be addressed before production deployment, including missing security headers (Helmet), console logging of sensitive token data, hardcoded CORS origins, absent CSRF protection, and reliance on application-level-only multi-tenant isolation without database-level enforcement.

**Overall Security Grade: C+**
- Authentication: B+
- Authorization: B
- Multi-tenant isolation: C
- Input validation: B+
- API security headers: D
- Secret management: C-
- Session management: B+
- Logging & monitoring: C+

---

## 1. JWT Authentication Implementation

### Architecture Overview

The platform uses a three-tier authentication system:
1. **Main Application:** JWT via Passport.js with `JWT_SECRET`
2. **Customer Portal:** Separate JWT with `CUSTOMER_PORTAL_JWT_SECRET`
3. **Carrier Portal:** Separate JWT with `CARRIER_PORTAL_JWT_SECRET`

### Token Generation

**File:** `apps/api/src/modules/auth/auth.service.ts`

```typescript
// Access token: 15-minute expiry (configurable via JWT_ACCESS_EXPIRATION)
const accessToken = this.jwtService.sign(accessTokenPayload, {
  expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
});

// Refresh token: 30-day expiry (configurable via JWT_REFRESH_EXPIRATION)
const refreshToken = this.jwtService.sign(refreshTokenPayload, {
  expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d'),
});
```

### Token Payload

```typescript
const accessTokenPayload = {
  sub: user.id,
  email: user.email,
  tenantId: user.tenantId,
  roleId: user.roleId,
  roleName: normalizedRoleName,
  roles: [normalizedRoleName],
  type: 'access',
};
```

---

### SEC-001: Token Payload Contains Excessive Claims

**Severity:** MEDIUM
**Component:** `apps/api/src/modules/auth/auth.service.ts` (lines 416-424)

**Evidence:**
The access token payload includes `email`, `tenantId`, `roleId`, `roleName`, and `roles`. While these facilitate frontend rendering, they increase the attack surface if the token is intercepted.

**Risk:**
- Leaked tokens reveal user email, tenant, and role information
- Token size increases with each claim, impacting every API request

**Fix:**
Minimize access token payload to `{ sub, tenantId, type }`. Fetch role/permissions server-side during JWT validation (which is already done in `JwtStrategy.validate()`).

---

### SEC-002: Refresh Token in Test Environment Bypasses Verification

**Severity:** HIGH
**Component:** `apps/api/src/modules/auth/auth.service.ts` (lines 114-194)

**Evidence:**
```typescript
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
// ...
if (isTestEnv) {
  payload = this.jwtService.decode(refreshToken); // Decodes WITHOUT verification
}
```

The refresh token flow uses `jwtService.decode()` (no signature verification) when `NODE_ENV === 'test'`. Additionally, in the catch block (line 167-191), test mode attempts to decode and use the token even after verification failure.

**Risk:**
- If `NODE_ENV=test` is accidentally set in production, refresh tokens are accepted without signature verification
- Any forged JWT would be accepted

**Fix:**
1. Remove test-specific bypass from production code entirely
2. Use dependency injection to swap auth behavior in test environments
3. Add a startup check that logs an error and exits if `NODE_ENV=test` in production

---

### SEC-003: No Token Binding/Fingerprinting

**Severity:** MEDIUM
**Component:** `apps/api/src/modules/auth/auth.service.ts`

**Evidence:**
Access tokens are not bound to the client session. No device fingerprint, IP binding, or token binding mechanism exists. The refresh token stores `userAgent` and `ipAddress` in the payload but does not validate them during refresh.

**Risk:**
- Stolen access tokens can be used from any device/IP
- Stolen refresh tokens can be used to generate new access tokens from different devices

**Fix:**
1. Add client fingerprint to refresh token and validate during refresh
2. Consider IP-based anomaly detection (not strict binding, which breaks mobile users)

---

## 2. RBAC Middleware & Guards

### Backend Guards

**Files:**
- `apps/api/src/modules/auth/guards/jwt-auth.guard.ts` -- JWT authentication
- `apps/api/src/common/guards/roles.guard.ts` -- Role-based authorization
- `apps/api/src/modules/auth/strategies/jwt.strategy.ts` -- JWT validation strategy

### Frontend Middleware

**File:** `apps/web/middleware.ts`

---

### SEC-004: Frontend Middleware Decodes JWT Without Signature Verification

**Severity:** HIGH
**Component:** `apps/web/middleware.ts` (lines 12-45)

**Evidence:**
```typescript
function decodeRoles(token?: string): string[] {
  const payloadSegment = rawToken.split(".")[1];
  const decoded = decodeBase64(normalizedSegment);
  const payload = JSON.parse(decoded);
  // Uses role/roleName/roles from payload without verification
}
```

The frontend middleware decodes JWT by base64-decoding the payload segment. No signature verification is performed. While the middleware runs on the server (Next.js Edge Runtime), it trusts the token claims for RBAC decisions.

**Risk:**
- A modified cookie with forged role claims could bypass frontend RBAC
- The middleware redirects based on unverified role data

**Mitigation Note:** The backend still validates JWT signature via Passport.js, so API calls are protected. This primarily affects SSR page access control.

**Fix:**
1. Use `jose` library (Edge-compatible) to verify JWT signature in middleware
2. Or validate token against the API before making RBAC decisions

---

### SEC-005: Only One Frontend RBAC Rule Defined

**Severity:** MEDIUM
**Component:** `apps/web/middleware.ts` (lines 5-10)

**Evidence:**
```typescript
const rbacRules = [
  {
    pattern: /^\/admin(\/|$)/,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
];
```

Only `/admin` paths have frontend RBAC protection. All other dashboard paths (dispatch, accounting, carrier management, reports, settings) are accessible to any authenticated user regardless of role.

**Risk:**
- A VIEWER role user can access the dispatch board, accounting pages, and all other protected screens
- Frontend-only, but exposes sensitive UI to unauthorized roles

**Fix:**
Add RBAC rules for all protected route groups:
```typescript
const rbacRules = [
  { pattern: /^\/admin(\/|$)/, roles: ["ADMIN", "SUPER_ADMIN"] },
  { pattern: /^\/accounting(\/|$)/, roles: ["ADMIN", "ACCOUNTING", "SUPER_ADMIN"] },
  { pattern: /^\/dispatch(\/|$)/, roles: ["ADMIN", "DISPATCHER", "OPS_MANAGER", "SUPER_ADMIN"] },
  { pattern: /^\/carrier(\/|$)/, roles: ["ADMIN", "CARRIER_MANAGER", "SUPER_ADMIN"] },
  // ... etc
];
```

---

### SEC-006: Console Logging of Auth Token in Middleware

**Severity:** HIGH
**Component:** `apps/web/middleware.ts` (lines 83-88)

**Evidence:**
```typescript
console.log('[RBAC Middleware]', {
  pathname,
  userRoles: roles,
  requiredRoles: required,
  tokenValue: authToken?.value?.substring(0, 50) + '...',
});
```

The middleware logs the first 50 characters of the JWT token value to the console on every RBAC-protected route. In Next.js, middleware runs on the server, so this appears in server logs.

**Risk:**
- First 50 characters of JWT includes the header and part of the payload
- Log aggregation systems (CloudWatch, Datadog, etc.) would store partial token data
- Combined with other logged data, could aid in token reconstruction

**Fix:**
Remove all `console.log` statements from the middleware immediately. If RBAC debugging is needed, use a conditional debug flag that is never enabled in production:
```typescript
if (process.env.DEBUG_RBAC === 'true' && process.env.NODE_ENV === 'development') {
  console.log('[RBAC]', { pathname, userRoles: roles });
}
```

---

### SEC-007: JwtAuthGuard Test Mode Bypass Creates Synthetic Users

**Severity:** HIGH
**Component:** `apps/api/src/modules/auth/guards/jwt-auth.guard.ts` (lines 24-61)

**Evidence:**
```typescript
if (process.env.NODE_ENV === 'test') {
  if (!req.user) {
    req.user = {
      id: userId ?? 'test-user',
      email: email ?? 'test-user@example.com',
      tenantId: tenantId ?? 'tenant-test',
      roleName: role ?? 'ADMIN',
      roles: [role ?? 'ADMIN'],
      permissions: [],
    };
  }
  return true;
}
```

When `NODE_ENV === 'test'`, the JWT guard creates a synthetic admin user from request headers (`x-test-role`, `x-test-user-id`, etc.) and bypasses all authentication. Defaults to ADMIN role.

**Risk:**
- If `NODE_ENV=test` in production, ALL endpoints become unauthenticated with ADMIN access
- Test headers could be injected by any client

**Fix:**
1. Remove test bypass from production code
2. Use a separate test-only guard injected via DI module configuration
3. Add deployment pipeline check to ensure `NODE_ENV !== 'test'` in production

---

### SEC-008: SUPER_ADMIN Bypass Without Audit

**Severity:** MEDIUM
**Component:** `apps/api/src/common/guards/roles.guard.ts` (lines 51-56), `apps/web/middleware.ts` (lines 91-93)

**Evidence:**
```typescript
// Backend RolesGuard
if (normalizeRole(userRole ?? '') === 'SUPER_ADMIN' || normalizedUserRoles.includes('SUPER_ADMIN')) {
  return true;
}

// Frontend middleware
if (roles.includes('SUPER_ADMIN')) {
  return NextResponse.next();
}
```

SUPER_ADMIN bypasses all role and permission checks silently. No audit trail is generated for SUPER_ADMIN access.

**Risk:**
- Compromised SUPER_ADMIN account has unlimited access with no monitoring
- No forensic trail for SUPER_ADMIN actions

**Fix:**
1. Log all SUPER_ADMIN access decisions to audit log
2. Require MFA for SUPER_ADMIN accounts
3. Implement SUPER_ADMIN session duration limits (e.g., 1 hour)
4. Alert on SUPER_ADMIN login from new IP/device

---

## 3. Multi-Tenant Isolation

### SEC-009: Application-Only Tenant Isolation (No Database-Level Enforcement)

**Severity:** CRITICAL
**Component:** Database layer / `apps/api/prisma/schema.prisma`

**Evidence:**
All multi-tenant isolation relies on application-level `WHERE tenantId = ?` filters in Prisma queries. The CLAUDE.md warns: "Always filter tenantId - Queries without it leak data across tenants." But there is no database-level enforcement.

**Risk:**
- A single missing `tenantId` filter in any Prisma query exposes all tenants' data
- Raw SQL queries or direct database access bypass isolation entirely
- With 257 models, the probability of at least one missing filter is high

**Fix:**
1. **Immediate:** Implement Prisma middleware that automatically injects `tenantId` filters:
```typescript
prisma.$use(async (params, next) => {
  if (params.model && params.action !== 'create') {
    params.args.where = { ...params.args.where, tenantId: currentTenantId };
  }
  return next(params);
});
```
2. **Medium-term:** Implement PostgreSQL Row-Level Security (RLS):
```sql
ALTER TABLE "Carrier" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Carrier"
  USING (tenant_id = current_setting('app.tenant_id')::text);
```
3. **Testing:** Create integration tests that verify no cross-tenant data access

---

### SEC-010: Tenant ID from Token Not Validated Against Request

**Severity:** HIGH
**Component:** API controllers (general pattern)

**Evidence:**
The JWT payload contains `tenantId` (from `JwtStrategy.validate()`), but controllers may accept `tenantId` from request body or query parameters. If a controller uses the request-provided tenantId instead of the token's tenantId, an authenticated user could access other tenants' data.

**Risk:**
- IDOR (Insecure Direct Object Reference) via tenantId parameter manipulation
- One authenticated user accessing another tenant's data

**Fix:**
1. Create a `@TenantId()` decorator that always extracts tenantId from the JWT token
2. Never accept tenantId from request body, query, or path parameters
3. Add middleware that validates tenantId in request matches token's tenantId

---

## 4. Input Validation

### SEC-011: Global ValidationPipe Properly Configured

**Severity:** POSITIVE FINDING
**Component:** `apps/api/src/main.ts` (lines 53-59)

**Evidence:**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
);
```

The global validation pipe strips unknown fields (`whitelist`), transforms types (`transform`), and rejects requests with unknown properties (`forbidNonWhitelisted`). This is a strong defense against mass assignment attacks.

**Assessment:** Well configured. This prevents most common input validation issues.

---

### SEC-012: Login Throttling Implemented

**Severity:** POSITIVE FINDING
**Component:** `apps/api/src/modules/auth/auth.controller.ts` (line 42)

**Evidence:**
```typescript
@Throttle({ long: { limit: 5, ttl: 60000 } })
async login(@Body() loginDto: LoginDto, ...) { ... }
```

Plus Redis-backed account lockout in `auth.service.ts`:
```typescript
this.maxLoginAttempts = parseInt(this.configService.get<string>('MAX_LOGIN_ATTEMPTS', '5'), 10);
// Locks account for 15 minutes after 5 failed attempts
```

**Assessment:** Good implementation with both request-level throttling and account-level lockout.

---

### SEC-013: Email Verification Has N+1 Performance Issue

**Severity:** MEDIUM
**Component:** `apps/api/src/modules/auth/auth.service.ts` (lines 302-333)

**Evidence:**
```typescript
async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
  const users = await this.prisma.user.findMany({
    where: { emailVerifiedAt: null },
  });
  for (const user of users) {
    const isValid = await this.redisService.consumeEmailVerificationToken(user.id, tokenHash);
    if (isValid) { verifiedUser = user; break; }
  }
}
```

The email verification iterates through ALL unverified users and checks each against Redis. This is both a performance issue and a timing-based side channel.

**Risk:**
- As user count grows, this becomes a DoS vector (one verification request queries all unverified users)
- Timing differences could reveal the number of unverified users

**Fix:**
Store a user-to-token mapping in the database or Redis, then look up directly:
```typescript
const userId = await this.redisService.getUserIdByVerificationToken(tokenHash);
```

---

## 5. API Security (CORS, Rate Limiting, Headers)

### SEC-014: CORS Origins Hardcoded to Localhost

**Severity:** HIGH
**Component:** `apps/api/src/main.ts` (lines 44-47)

**Evidence:**
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
});
```

CORS origins are hardcoded to localhost only. No production domain configured.

**Risk:**
- In production, either CORS will block legitimate requests, or it will be set to `*` as a quick fix (which is worse)
- No environment-based CORS configuration

**Fix:**
```typescript
const allowedOrigins = this.configService.get<string>('CORS_ORIGINS', 'http://localhost:3000').split(',');
app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Tenant-Id'],
});
```

---

### SEC-015: No Security Headers (Helmet Missing)

**Severity:** HIGH
**Component:** `apps/api/src/main.ts`

**Evidence:**
No `helmet` middleware is configured. The following security headers are absent:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`
- `Referrer-Policy`

**Risk:**
- Clickjacking via iframe embedding
- MIME type sniffing attacks
- Missing HSTS allows SSL stripping

**Fix:**
```typescript
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
```

---

### SEC-016: No CSRF Protection

**Severity:** HIGH
**Component:** `apps/api/src/main.ts`

**Evidence:**
No CSRF token mechanism is implemented. The API uses cookie-based authentication (`credentials: true` in CORS), which is vulnerable to CSRF attacks.

**Risk:**
- State-changing operations (create load, approve payment, etc.) can be triggered by malicious websites if the user is authenticated
- Combined with the cookie-based auth, this is a significant attack vector

**Fix:**
1. Implement double-submit cookie pattern or synchronizer token pattern
2. Or switch to Authorization header-only token transmission (removes CSRF risk entirely)
3. If using cookies, add `SameSite=Strict` attribute

---

### SEC-017: Swagger Exposed Without Production Guard

**Severity:** MEDIUM
**Component:** `apps/api/src/main.ts` (line 68)

**Evidence:**
```typescript
setupSwagger(app);
```

Swagger documentation is unconditionally enabled. No check for production environment.

**Risk:**
- Full API documentation exposed to public in production
- Attackers can map all endpoints, request/response formats, and parameter requirements

**Fix:**
```typescript
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}
```

---

### SEC-018: Rate Limiting Not Globally Applied

**Severity:** MEDIUM
**Component:** `apps/api/src/main.ts`

**Evidence:**
Rate limiting exists via `@nestjs/throttler` (used on login endpoint) and a custom `RateLimitGuard`, but neither is globally applied. Most API endpoints have no rate limiting.

**Risk:**
- API abuse and scraping
- DoS via high-volume requests to expensive endpoints (reports, analytics, search)

**Fix:**
Apply throttler globally with generous limits, then tighten per-endpoint:
```typescript
app.useGlobalGuards(new ThrottlerGuard());
// Configure defaults: 100 requests per 60 seconds
```

---

## 6. Secret Management

### SEC-019: Secrets in Environment Variables Without Rotation Strategy

**Severity:** MEDIUM
**Component:** `apps/api/src/main.ts` (lines 11-17), `.env` files

**Evidence:**
Required secrets: `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`
Optional secrets: `CUSTOMER_PORTAL_JWT_SECRET`, `CARRIER_PORTAL_JWT_SECRET`, `SENDGRID_API_KEY`, `TWILIO_ACCOUNT_SID`

No secret rotation mechanism exists. JWT_SECRET change would invalidate all active sessions.

**Risk:**
- Long-lived secrets increase exposure window
- JWT_SECRET compromise gives unlimited token forgery capability

**Fix:**
1. Use a secret management service (AWS Secrets Manager, HashiCorp Vault)
2. Implement JWT key rotation with key ID (`kid`) in JWT header
3. Support multiple active JWT secrets during rotation window

---

### SEC-020: Database Credentials in Plain Text

**Severity:** MEDIUM
**Component:** `docker-compose.yml`, `.env` files

**Evidence:**
From CLAUDE.md: "Docker defaults: DB_USER=postgres, DB_PASSWORD=postgres"

**Risk:**
- Default credentials may be used in non-development environments
- `DATABASE_URL` in .env typically contains credentials in plaintext

**Fix:**
1. Use IAM authentication for production database connections
2. Never commit .env files (verify .gitignore)
3. Use docker secrets for container credentials

---

### SEC-021: EDI Trading Partner FTP Passwords Stored in Database

**Severity:** HIGH
**Component:** Schema: `EdiTradingPartner.ftpPassword` (VarChar 500)

**Evidence:**
```prisma
model EdiTradingPartner {
  ftpPassword String? @db.VarChar(500)
  // ...
}
```

FTP passwords for EDI trading partners are stored in the database. The field name and type suggest plaintext or simple encoding, not proper encryption.

**Risk:**
- Database breach exposes all trading partner FTP credentials
- Compliance violation (PCI-DSS, SOC 2)

**Fix:**
1. Encrypt FTP passwords using AES-256-GCM with application-managed keys
2. Store encrypted value + IV in the database
3. Decrypt only when establishing FTP connections

---

### SEC-022: Factoring Company API Keys in Database

**Severity:** HIGH
**Component:** Schema: `FactoringCompany.apiKey` (VarChar 255)

**Evidence:**
```prisma
model FactoringCompany {
  apiKey String? @db.VarChar(255)
  // ...
}
```

API keys for factoring company integrations stored in the database, likely in plaintext.

**Risk:**
- Database breach exposes integration API keys
- Could be used to manipulate factoring company interactions

**Fix:**
Same as SEC-021 -- encrypt at rest using application-level encryption.

---

## 7. Session Management

### SEC-023: Session Management is Well Implemented (Positive)

**Severity:** POSITIVE FINDING
**Component:** `apps/api/src/modules/auth/auth.service.ts`

**Evidence:**
- Refresh token hashes stored in both Redis (fast lookup) and PostgreSQL (durability)
- Token rotation on refresh (new tokens issued, old session updated)
- Session revocation support (single session and all sessions)
- Refresh token hash comparison prevents token reuse

**Assessment:** The dual-storage session model with token rotation is a strong pattern.

---

### SEC-024: Password Hashing is Properly Implemented (Positive)

**Severity:** POSITIVE FINDING
**Component:** `apps/api/src/modules/auth/auth.service.ts`

**Evidence:**
```typescript
const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
// ...
const passwordHash = await bcrypt.hash(newPassword, 10);
```

bcrypt with cost factor 10 is used for password hashing. Password reset tokens use SHA-256 hashing.

**Assessment:** bcrypt cost factor 10 is acceptable. Consider increasing to 12 for higher security.

---

### SEC-025: Account Lockout Implemented (Positive)

**Severity:** POSITIVE FINDING
**Component:** `apps/api/src/modules/auth/auth.service.ts` (lines 489-506)

**Evidence:**
- 5 failed attempts triggers lockout (configurable via MAX_LOGIN_ATTEMPTS)
- 15-minute lockout duration (configurable via ACCOUNT_LOCKOUT_DURATION)
- Redis-backed lockout tracking
- Database-level lockout tracking (failedLoginAttempts, lockedUntil)

**Assessment:** Good implementation with configurable thresholds and dual tracking.

---

## 8. Additional Security Concerns

### SEC-026: No Content Security Policy on Frontend

**Severity:** MEDIUM
**Component:** `apps/web/` (general)

**Evidence:**
No CSP headers configured in Next.js response headers.

**Risk:**
- XSS attacks can execute arbitrary scripts
- Inline styles/scripts not restricted

**Fix:**
Add CSP headers in `next.config.js`:
```javascript
headers: [
  {
    source: '/(.*)',
    headers: [
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" },
    ],
  },
],
```

---

### SEC-027: No API Versioning Sunset Strategy

**Severity:** LOW
**Component:** `apps/api/src/main.ts` (line 50)

**Evidence:**
```typescript
app.setGlobalPrefix('api/v1');
```

API is versioned at `/api/v1/` but no strategy exists for deprecating old versions or forcing client upgrades.

**Risk:**
- Old API versions with known vulnerabilities may persist indefinitely

**Fix:**
Document API version lifecycle and implement deprecation headers.

---

### SEC-028: Upload Directory Served Statically Without Auth

**Severity:** MEDIUM
**Component:** `apps/api/src/main.ts` (lines 37-41)

**Evidence:**
```typescript
if (process.env.NODE_ENV !== 'production') {
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });
}
```

The uploads directory is served statically in development without authentication. While gated by `NODE_ENV`, uploaded documents (PODs, insurance certificates, contracts) contain sensitive data.

**Risk:**
- Any file in the uploads directory is accessible without authentication in development
- Directory traversal potential if file names are not sanitized

**Fix:**
Serve uploaded files through an authenticated endpoint that validates access permissions.

---

## 9. Findings Summary

| ID | Finding | Severity | Category |
|----|---------|----------|----------|
| SEC-001 | Excessive JWT payload claims | MEDIUM | Authentication |
| SEC-002 | Test environment bypasses JWT verification | HIGH | Authentication |
| SEC-003 | No token binding/fingerprinting | MEDIUM | Authentication |
| SEC-004 | Frontend JWT decoded without signature verification | HIGH | Authorization |
| SEC-005 | Only one frontend RBAC rule defined | MEDIUM | Authorization |
| SEC-006 | Console logging of auth tokens | HIGH | Logging |
| SEC-007 | Test mode creates synthetic admin users | HIGH | Authentication |
| SEC-008 | SUPER_ADMIN bypass without audit | MEDIUM | Authorization |
| SEC-009 | Application-only tenant isolation | CRITICAL | Multi-Tenant |
| SEC-010 | Tenant ID not validated against token | HIGH | Multi-Tenant |
| SEC-011 | ValidationPipe properly configured | POSITIVE | Input Validation |
| SEC-012 | Login throttling implemented | POSITIVE | Rate Limiting |
| SEC-013 | Email verification N+1 performance/timing issue | MEDIUM | Authentication |
| SEC-014 | CORS origins hardcoded to localhost | HIGH | API Security |
| SEC-015 | No security headers (Helmet missing) | HIGH | API Security |
| SEC-016 | No CSRF protection | HIGH | API Security |
| SEC-017 | Swagger exposed without production guard | MEDIUM | API Security |
| SEC-018 | Rate limiting not globally applied | MEDIUM | API Security |
| SEC-019 | No secret rotation strategy | MEDIUM | Secret Management |
| SEC-020 | Database credentials in plain text | MEDIUM | Secret Management |
| SEC-021 | EDI FTP passwords stored in database | HIGH | Secret Management |
| SEC-022 | Factoring company API keys in database | HIGH | Secret Management |
| SEC-023 | Session management well implemented | POSITIVE | Session Management |
| SEC-024 | Password hashing properly implemented | POSITIVE | Session Management |
| SEC-025 | Account lockout implemented | POSITIVE | Session Management |
| SEC-026 | No Content Security Policy | MEDIUM | API Security |
| SEC-027 | No API versioning sunset strategy | LOW | API Security |
| SEC-028 | Upload directory served without auth | MEDIUM | API Security |

---

## 10. Remediation Priority

### Immediate (Before Any Production Deployment)
1. **SEC-009:** Implement database-level tenant isolation (RLS or Prisma middleware)
2. **SEC-006:** Remove console.log of token data from middleware
3. **SEC-007:** Remove test mode bypass from JWT guard (use DI instead)
4. **SEC-002:** Remove test environment JWT bypass from auth service
5. **SEC-015:** Add Helmet security headers
6. **SEC-016:** Implement CSRF protection
7. **SEC-014:** Make CORS origins configurable via environment variables

### High Priority (Within 2 Weeks)
8. **SEC-004:** Add JWT signature verification to frontend middleware
9. **SEC-010:** Enforce tenant ID from token, never from request
10. **SEC-021:** Encrypt EDI FTP passwords at rest
11. **SEC-022:** Encrypt factoring company API keys at rest
12. **SEC-005:** Add RBAC rules for all protected route groups
13. **SEC-017:** Disable Swagger in production

### Medium Priority (Within 1 Month)
14. **SEC-001:** Minimize JWT payload claims
15. **SEC-008:** Add audit logging for SUPER_ADMIN actions
16. **SEC-018:** Apply global rate limiting
17. **SEC-019:** Implement secret rotation strategy
18. **SEC-013:** Fix email verification N+1 issue
19. **SEC-026:** Add Content Security Policy headers
20. **SEC-028:** Serve uploads through authenticated endpoint

### Low Priority (Ongoing)
21. **SEC-003:** Implement token binding/fingerprinting
22. **SEC-020:** Use IAM database authentication in production
23. **SEC-027:** Document API version lifecycle
