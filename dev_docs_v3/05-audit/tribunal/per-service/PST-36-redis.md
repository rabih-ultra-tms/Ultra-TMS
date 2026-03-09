# PST-36: Redis Infrastructure — Per-Service Tribunal Audit

> **Date:** 2026-03-09 | **Auditor:** Claude Opus 4.6 | **Verdict:** MODIFY
> **Hub Score:** 5.0/10 → **Actual Score:** 7.5/10 (+2.5)

---

## 1. Hub Accuracy Summary

| Section | Accuracy | Notes |
|---------|----------|-------|
| Files | 100% | 3/3 correct |
| Module type | 80% | Misses `@Global()` decorator |
| Consumer list | 33% | 2/4 correct, 2 phantom (Scheduler, WebSocket), 2 missing (Auth, Rate Intelligence) |
| Business rules | ~30% | Phantom pub/sub, locking, rate limiting. Wrong default URL. |
| Operations | ~30% | Misses entire auth domain (60% of service) |
| Tests | 100% | Correctly notes spec file exists |
| **Overall** | **~40%** | Hub describes a generic Redis wrapper; reality is auth-specialized |

---

## 2. What Hub Gets Wrong

### Consumer List (33% accurate)

| Hub Claims | Actual |
|---|---|
| Cache (32) | **CORRECT** — 4 services import RedisService |
| Scheduler (24) | **PHANTOM** — zero imports found |
| WebSocket gateways | **PHANTOM** — zero imports found |
| Config (config caching) | **CORRECT** — config-cache.service.ts |
| *(unlisted)* Auth | **MISSING** — auth.service.ts line 10 |
| *(unlisted)* Rate Intelligence | **MISSING** — rate-lookup.service.ts line 5 |

### Phantom Capabilities

| Hub Claim | Reality |
|---|---|
| "pub/sub for real-time events" | Zero pub/sub methods in service |
| "distributed locking" | Zero lock methods — locking is in Cache module's DistributedLockService |
| "rate limiting" | Zero rate limit methods |

### Business Rule Errors

| Hub Claim | Reality |
|---|---|
| Default: `redis://:redis_password@localhost:6379` | Code: `redis://localhost:6379` (no password) |
| "No direct access — injected into Cache, Scheduler, WebSocket" | Auth directly injects RedisService |

---

## 3. What Actually Exists

### 28 Methods Across 6 Domains

| Domain | Methods | LOC (est.) | Hub Documented? |
|--------|---------|------------|-----------------|
| Generic key-value | 12 (get, set, del, getValue, setValue, deleteKeys, getJson, setJson, setWithTTL, keys, deleteByPattern, ping) | ~80 | Partially ("get/set/del") |
| Session management | 6 (store, get, revoke, revokeAll, getSessions, getCount) | ~60 | No |
| Token blacklisting | 2 (blacklist, isBlacklisted) | ~15 | No |
| Password reset tokens | 2 (store, consume) | ~25 | No |
| Login attempts / locking | 5 (increment, get, reset, lock, isLocked) | ~50 | No |
| Email verification | 2 (store, consume) | ~20 | No |

Hub describes ~40% of domain 1 and 0% of domains 2-6.

### Module Architecture

- `@Global()` — available to all modules without explicit import
- `@Injectable()` with `OnModuleInit` / `OnModuleDestroy` lifecycle
- Uses `ioredis` library (not `@nestjs/cache-manager`)
- Retry strategy: exponential backoff 50ms → 2s cap, max 3 retries per request
- Exports: `RedisService`

---

## 4. Bugs & Issues

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | **P2** | **`KEYS` command blocks Redis at scale** — O(N), blocks server. Used in `deleteByPattern()`, `revokeAllUserSessions()`, `getUserSessions()`, `getUserSessionCount()`. Must use `SCAN`. | Lines 44-51, 139-147, 152-157, 162-166 |
| 2 | **P2** | **No tenant isolation in key namespacing** — `session:{userId}`, `login_attempts:{email}`, `account_locked:{email}` have no tenantId. Multi-tenant email collision = shared lockout state. | Lines 97-166, 220-265 |
| 3 | **P3** | **TOCTOU in `consumePasswordResetToken()`** — `exists()` then `del()` is non-atomic. Race allows double-consume. | Lines 204-214 |
| 4 | **P3** | **TOCTOU in `consumeEmailVerificationToken()`** — same non-atomic pattern. | Lines 282-292 |
| 5 | **P3** | **`getSession()` returns `Promise<any>`** — untyped return, should have interface. | Line 116 |
| 6 | **P3** | **Default REDIS_URL mismatch** — code: `redis://localhost:6379`, docker-compose: requires password. Missing env = connection failure. | Line 13 |
| 7 | **Info** | **No connection readiness guard** — `getClient()` returns uninitialized `client!` if called before `onModuleInit()`. | Lines 8, 36-38 |

---

## 5. Strengths

- Well-structured, focused single-service module — no bloat
- Proper NestJS lifecycle hooks (connect on init, quit on destroy)
- Retry strategy with exponential backoff and cap
- JSON helpers with parse error handling and logging
- Comprehensive auth security methods (sessions, blacklisting, lockout, verification)
- ~30 tests covering all 28 methods — 273 LOC of tests for 321 LOC of source
- `@Global()` with proper export — clean DI pattern
- Error event handling with structured logging

---

## 6. Metrics

| Metric | Value |
|---|---|
| Source files | 2 (module + service) |
| Test files | 1 |
| Source LOC | 321 |
| Test LOC | 273 |
| Total LOC | 594 |
| Methods | 28 |
| Prisma models | 0 |
| Controllers / Endpoints | 0 / 0 |
| Actual consumers | 4 (Auth, Cache, Rate Intelligence, Config) |
| Key namespaces | 6 (session, blacklist, reset, login_attempts, account_locked, email_verify) |
| .bak | None |

---

## 7. Action Items

| # | Priority | Action |
|---|----------|--------|
| 1 | P2 | Replace all `KEYS` calls with `SCAN` iterator (4 methods) |
| 2 | P2 | Add `tenantId` prefix to all key patterns (6 namespaces) |
| 3 | P3 | Use `GETDEL` or Redis transaction for consume methods (2 methods) |
| 4 | P3 | Type `getSession()` return value with interface |
| 5 | P3 | Align default REDIS_URL with docker-compose password |
| 6 | Hub | Remove phantom pub/sub, distributed locking, rate limiting claims |
| 7 | Hub | Add Auth + Rate Intelligence to consumer list |
| 8 | Hub | Remove Scheduler + WebSocket from consumer list |
| 9 | Hub | Document all 28 methods across 6 domains |
| 10 | Hub | Add `@Global()` to module description |

---

## 8. Tribunal Rounds

### Round 1: "Is this really 7.5/10?"

**Challenge:** A module with KEYS blocking and no tenant isolation — isn't that too high?

**Defense:** The test coverage ratio (273/321 = 85%) is exceptional. The auth domain methods are well-designed with proper TTL management, atomic-ish patterns, and clean key namespacing conventions. The issues are real but P2 (production scale) not P0 (broken now). For an infrastructure wrapper, this is solid.

**Verdict:** 7.5 stands.

### Round 2: "Hub says pub/sub — maybe it was planned?"

**Challenge:** Perhaps the hub documents intended functionality, not current state.

**Defense:** Hub Section 1 says "Built" status. If built, capabilities should exist. The hub's Business Rules section states operations as present-tense facts. Zero pub/sub methods = phantom capability.

**Verdict:** Hub is wrong. Pub/sub is phantom.

### Round 3: "Scheduler and WebSocket don't consume this?"

**Challenge:** They might use Redis through the Cache module transitively.

**Defense:** Hub specifically says RedisService is "injected into Cache, Scheduler, and WebSocket modules" — implying direct dependency injection. Grep confirms zero imports in Scheduler or any WebSocket-related files. Transitive consumption through Cache ≠ direct dependency.

**Verdict:** Hub consumer list inaccurate. Scheduler and WebSocket are phantom.

### Round 4: "The auth domain — should it be in a separate module?"

**Challenge:** Session management, token blacklisting, login attempts — these feel like AuthRedisService, not generic RedisService.

**Defense:** Valid architectural concern but outside audit scope. The current design works because Auth injects RedisService directly. A refactor to split generic/auth Redis concerns would be cleaner but isn't a bug.

**Verdict:** Noted as architectural recommendation, not a bug.

### Round 5: "Tenant isolation — how bad is the email collision?"

**Challenge:** If two tenants both have user@company.com, login attempts and account locks are shared.

**Defense:** This is a real multi-tenant bug. If Tenant A's user@company.com gets locked out, Tenant B's user@company.com is also locked. All 6 key namespaces need `tenantId` prefix. Severity is P2 because it requires multi-tenant setup to trigger (most dev/staging environments are single-tenant).

**Verdict:** P2 confirmed. Must fix before production multi-tenant deployment.
