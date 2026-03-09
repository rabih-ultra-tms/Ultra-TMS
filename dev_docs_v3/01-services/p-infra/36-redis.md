# Service Hub: Redis Infrastructure (36)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-36 tribunal)
> **Priority:** Infrastructure — `@Global()` module used by Auth, Cache, Rate Intelligence, Config
> **Tribunal file:** dev_docs_v3/05-audit/tribunal/per-service/PST-36-redis.md

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (7.5/10) |
| **Confidence** | High — code-verified via PST-36 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Built — `apps/api/src/modules/redis/` (1 service, 0 controllers) |
| **Frontend** | N/A — no UI, infrastructure only |
| **Tests** | Strong — `redis.service.spec.ts`, ~30 tests covering all 28 methods (273 LOC tests / 321 LOC source = 85% ratio) |
| **Module Type** | `@Global()` — available to all modules without explicit import |
| **Priority** | P2 — replace KEYS with SCAN, add tenant isolation to key namespaces |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Module | Built | `redis.module.ts` — `@Global()` NestJS module, exports RedisService |
| Service | Built | `redis.service.ts` — 321 LOC, 28 methods across 6 domains |
| Tests | Strong | `redis.service.spec.ts` — 273 LOC, ~30 tests, all 28 methods covered |
| Controllers | None | No REST endpoints — consumed internally via DI |
| Lifecycle | Built | `OnModuleInit` (connect) / `OnModuleDestroy` (quit) |

---

## 3. Screens

N/A — Infrastructure module. No UI screens.

**Files:**

| File | Purpose | LOC |
|------|---------|-----|
| `apps/api/src/modules/redis/redis.module.ts` | `@Global()` module definition, exports RedisService | ~15 |
| `apps/api/src/modules/redis/redis.service.ts` | Redis client — 28 methods across 6 domains | 321 |
| `apps/api/src/modules/redis/redis.service.spec.ts` | Unit tests — ~30 tests covering all methods | 273 |

**Total LOC: 594**

---

## 4. API Endpoints

None — Redis is a pure infrastructure module with no REST controllers. All access is via injected `RedisService`.

---

## 5. Components

N/A — Infrastructure module. No frontend components.

---

## 6. Hooks

N/A — Infrastructure module. No React hooks.

**Service Methods (28 total across 6 domains):**

### Generic Key-Value (12 methods)
| Method | Purpose |
|--------|---------|
| `get(key)` | Get string value |
| `set(key, value)` | Set string value |
| `del(key)` | Delete key |
| `getValue(key)` | Get with error handling |
| `setValue(key, value)` | Set with error handling |
| `deleteKeys(pattern)` | Delete matching keys |
| `getJson(key)` | Get and parse JSON (with error handling) |
| `setJson(key, value)` | Stringify and set JSON |
| `setWithTTL(key, value, ttl)` | Set with expiration |
| `keys(pattern)` | Find keys matching pattern (**P2: uses KEYS, blocks at scale**) |
| `deleteByPattern(pattern)` | Delete by pattern (**P2: uses KEYS**) |
| `ping()` | Health check |

### Session Management (6 methods)
| Method | Key Pattern | Purpose |
|--------|-------------|---------|
| `storeSession()` | `session:{userId}:{sessionId}` | Store session data with TTL |
| `getSession()` | `session:{userId}:{sessionId}` | Retrieve session (**P3: returns `Promise<any>`**) |
| `revokeSession()` | `session:{userId}:{sessionId}` | Delete specific session |
| `revokeAllUserSessions()` | `session:{userId}:*` | Revoke all sessions (**P2: uses KEYS**) |
| `getUserSessions()` | `session:{userId}:*` | List active sessions (**P2: uses KEYS**) |
| `getUserSessionCount()` | `session:{userId}:*` | Count active sessions (**P2: uses KEYS**) |

### Token Blacklisting (2 methods)
| Method | Key Pattern | Purpose |
|--------|-------------|---------|
| `blacklistToken()` | `blacklist:{token}` | Add JWT to blacklist with TTL |
| `isTokenBlacklisted()` | `blacklist:{token}` | Check if JWT is blacklisted |

### Password Reset Tokens (2 methods)
| Method | Key Pattern | Purpose |
|--------|-------------|---------|
| `storePasswordResetToken()` | `reset:{token}` | Store reset token with TTL |
| `consumePasswordResetToken()` | `reset:{token}` | Get and delete (**P3: TOCTOU — non-atomic**) |

### Login Attempts / Account Locking (5 methods)
| Method | Key Pattern | Purpose |
|--------|-------------|---------|
| `incrementLoginAttempts()` | `login_attempts:{email}` | Increment failed count (**P2: no tenantId**) |
| `getLoginAttempts()` | `login_attempts:{email}` | Get current count |
| `resetLoginAttempts()` | `login_attempts:{email}` | Clear after successful login |
| `lockAccount()` | `account_locked:{email}` | Set lockout with TTL (**P2: no tenantId**) |
| `isAccountLocked()` | `account_locked:{email}` | Check lockout status |

### Email Verification (2 methods)
| Method | Key Pattern | Purpose |
|--------|-------------|---------|
| `storeEmailVerificationToken()` | `email_verify:{token}` | Store verification token with TTL |
| `consumeEmailVerificationToken()` | `email_verify:{token}` | Get and delete (**P3: TOCTOU — non-atomic**) |

---

## 7. Business Rules

1. **Connection:** Uses `REDIS_URL` env var. Default in code: `redis://localhost:6379` (no password). Docker-compose expects password — env mismatch if REDIS_URL not set.
2. **Library:** Uses `ioredis` (not `@nestjs/cache-manager`).
3. **Retry Strategy:** Exponential backoff 50ms to 2s cap, max 3 retries per request.
4. **Lifecycle:** Connects on `onModuleInit()`, quits on `onModuleDestroy()`. Error event handler with structured logging.
5. **JSON Helpers:** `getJson()` / `setJson()` include parse error handling with logging.
6. **Auth-Specialized:** Despite being a "generic" Redis wrapper, 16 of 28 methods (57%) are auth-domain specific (sessions, blacklisting, login attempts, password reset, email verification).
7. **Key Namespaces:** 6 distinct namespaces — `session`, `blacklist`, `reset`, `login_attempts`, `account_locked`, `email_verify`.

---

## 8. Data Model

No Prisma models — Redis is a pure key-value store. Key namespaces documented in Section 6.

---

## 9. Validation Rules

N/A — No REST endpoints. All method inputs are validated by consuming services before calling RedisService methods. Key patterns are constructed internally (not user-supplied).

---

## 10. Status States

N/A — No entity state machine. Redis stores ephemeral key-value data with TTL-based expiration.

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| `KEYS` command blocks Redis at scale — O(N), blocks server. Used in `deleteByPattern()`, `revokeAllUserSessions()`, `getUserSessions()`, `getUserSessionCount()` | **P2 BUG** | **Open** | Must replace with `SCAN` iterator (4 methods). Lines 44-51, 139-147, 152-157, 162-166 |
| No tenant isolation in key namespacing — `login_attempts:{email}`, `account_locked:{email}` have no tenantId prefix. Multi-tenant email collision = shared lockout state | **P2 BUG** | **Open** | All 6 key namespaces need `tenantId` prefix. Lines 97-166, 220-265 |
| TOCTOU in `consumePasswordResetToken()` — `exists()` then `del()` is non-atomic. Race allows double-consume | P3 | Open | Use `GETDEL` or Redis transaction. Lines 204-214 |
| TOCTOU in `consumeEmailVerificationToken()` — same non-atomic pattern | P3 | Open | Use `GETDEL` or Redis transaction. Lines 282-292 |
| `getSession()` returns `Promise<any>` — untyped return | P3 | Open | Should have typed interface. Line 116 |
| Default REDIS_URL mismatch — code: `redis://localhost:6379`, docker-compose: requires password | P3 | Open | Missing env = connection failure. Line 13 |
| No connection readiness guard — `getClient()` returns uninitialized `client!` if called before `onModuleInit()` | Info | Open | Lines 8, 36-38 |

**Phantom capabilities removed during PST-36 tribunal:**
- ~~pub/sub for real-time events~~ — zero pub/sub methods in service
- ~~distributed locking~~ — zero lock methods; locking lives in Cache module's DistributedLockService
- ~~rate limiting~~ — zero rate limit methods

---

## 12. Tasks

### Open (from PST-36 tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| REDIS-001 | Replace all `KEYS` calls with `SCAN` iterator (4 methods) | M (2h) | P2 |
| REDIS-002 | Add `tenantId` prefix to all key patterns (6 namespaces) | M (3h) | P2 |
| REDIS-003 | Use `GETDEL` or Redis transaction for consume methods (2 methods) | S (1h) | P3 |
| REDIS-004 | Type `getSession()` return value with interface | XS (15min) | P3 |
| REDIS-005 | Align default REDIS_URL with docker-compose password | XS (15min) | P3 |

---

## 13. Design Links

N/A — Infrastructure module. No design specs.

---

## 14. Delta vs Original Plan

| Original Hub Claim | Actual (PST-36 verified) | Delta |
|--------------------|--------------------------|-------|
| Health 5/10 | 7.5/10 | +2.5 — strong test coverage, well-structured auth methods |
| Consumers: Cache, Scheduler, WebSocket, Config | Auth, Cache, Rate Intelligence, Config | 33% accurate — Scheduler + WebSocket phantom, Auth + Rate Intelligence missing |
| Operations: get/set/del, pub/sub, distributed locking | 28 methods across 6 domains, no pub/sub, no locking | Hub described ~15% of actual functionality |
| Default URL: `redis://:redis_password@localhost:6379` | Code: `redis://localhost:6379` (no password) | URL mismatch |
| "No direct access — injected into Cache, Scheduler, WebSocket" | Auth directly injects RedisService | Direct access pattern exists |

---

## 15. Dependencies

**Depends on:**
- Redis 7 (via docker-compose.yml)
- `ioredis` npm package
- `REDIS_URL` environment variable

**Depended on by (4 verified consumers):**
- Auth (01) — sessions, token blacklisting, login attempts, account locking, email verification, password reset
- Cache (32) — generic key-value operations
- Rate Intelligence (29) — rate lookup caching
- Config (31) — config caching

---

## 16. Metrics

| Metric | Value |
|--------|-------|
| Source files | 2 (module + service) |
| Test files | 1 |
| Source LOC | 321 |
| Test LOC | 273 |
| Total LOC | 594 |
| Methods | 28 |
| Prisma models | 0 |
| Controllers / Endpoints | 0 / 0 |
| Key namespaces | 6 |
| .bak | None |
