# PST-31: Config Service Tribunal

> **Date:** 2026-03-09
> **Auditor:** Claude Opus 4.6
> **Hub File:** `dev_docs_v3/01-services/p3-future/31-config.md`
> **Module:** `apps/api/src/modules/config/`
> **Verdict:** MODIFY
> **Health Score:** 8.0/10 (was 3.0)

---

## Phase 1: Data Model Verification

### Prisma Models

| Hub Claims | Actual | Verdict |
|-----------|--------|---------|
| SystemConfig | SystemConfig | ✅ MATCH |
| FeatureFlag | FeatureFlag | ✅ MATCH |
| Sequence | **NumberSequence** | ❌ WRONG NAME |
| EmailTemplate | **CommunicationTemplate** | ❌ WRONG NAME |
| ConfigHistory | ConfigHistory | ✅ MATCH |

**Hub names 5 conceptual models. Actual Prisma models used by this module: 15.**

### Missing from Hub (10 undocumented models)

| Model | Fields | Purpose |
|-------|--------|---------|
| FeatureFlagOverride | 13 fields | Per-tenant/user flag overrides with expiry |
| TenantConfig | 12 fields | Tenant-scoped key-value config (@@unique tenantId+configKey) |
| TenantService | 12 fields | Module enable/disable per tenant |
| BusinessHours | 15 fields | Per-day operating hours with location support |
| Holiday | 12 fields | Tenant holidays with recurring support |
| CacheConfig | 12 fields | Per-tenant cache TTL configuration |
| CacheInvalidationRule | 12 fields | Event-driven cache invalidation rules |
| ConfigTemplate | 13 fields | Reusable config schemas with defaults |
| DocumentTemplate | 18 fields | Document generation templates (BOL, invoice, etc.) |
| UserPreference | 13 fields | Per-user preference key-value pairs |

**Hub data model accuracy: ~33% (5/15 models named, 2 wrong names)**

### Hub Model Field Accuracy

| Hub Model | Hub Fields | Actual Fields | Accuracy |
|-----------|-----------|---------------|----------|
| SystemConfig | 7 | 12 (+ category enum, validationRules, deletedAt, createdById, updatedById) | ~58% |
| FeatureFlag | 10 | 14 (+ status enum, rolloutPercent, tenantIds[], userIds[], deletedAt, createdById) | ~50% |
| Sequence (→NumberSequence) | 12 | 14 (sequenceName not name, currentNumber not current, resetFrequency enum not resetPolicy) | ~45% |
| EmailTemplate (→CommunicationTemplate) | 12 | 18 (completely different structure — channel, subjectEn/Es, bodyEn/Es, fromName, fromEmail, replyTo, isSystem) | ~20% |
| ConfigHistory | 8 | 9 (configKey not configType+configKey, changedBy not userId, no before→oldValue, no after→newValue rename) | ~55% |

### Enums Found (5 — hub documents 0)

| Enum | Values |
|------|--------|
| FeatureFlagStatus | ACTIVE, DEPRECATED, ARCHIVED |
| ConfigCategory | SECURITY, LIMITS, DEFAULTS, INTEGRATIONS, EMAIL, NOTIFICATIONS |
| ResetFrequency | NEVER, DAILY, MONTHLY, YEARLY |
| DataType | STRING, NUMBER, BOOLEAN, JSON, DATE |
| CacheType | ENTITY, QUERY, SESSION, CONFIG |

Hub Section 10 describes FeatureFlag lifecycle as DISABLED→ENABLED→PERCENTAGE_ROLLOUT→ARCHIVED. Actual enum has no DISABLED/ENABLED/PERCENTAGE_ROLLOUT values — uses ACTIVE/DEPRECATED/ARCHIVED with a separate `enabled` boolean + `rolloutPercent` int.

---

## Phase 2: Endpoint Verification

### Endpoint Count

| Hub Claims | Actual | Match? |
|-----------|--------|--------|
| 39 | 39 | ✅ 16th consecutive perfect match |

### Controller Breakdown

| Controller | Hub Path Prefix | Actual Prefix | Endpoints | Path Match |
|-----------|----------------|---------------|-----------|------------|
| BusinessHoursController | config/business-hours | config (sub-routes: business-hours, holidays) | 5 | PARTIAL — hub misses 3 holiday endpoints |
| EmailTemplatesController | config/email-templates | config/email-templates | 3 | ✅ MATCH |
| FeaturesController | config/features | **features** | 7 | ❌ WRONG — no `config/` prefix |
| PreferencesController | config/preferences | **preferences** | 4 | ❌ WRONG — no `config/` prefix |
| SequencesController | config/sequences | config/sequences | 3 | ✅ MATCH |
| SystemConfigController | config/system | config/system | 5 | ✅ MATCH |
| TemplatesController | config/templates | config/templates | 2 | ✅ MATCH |
| TenantConfigController | config/tenant | config/tenant | 5 | ✅ MATCH |
| TenantServicesController | config/tenant-services | **tenant-services** | 5 | ❌ WRONG — no `config/` prefix |

**Path accuracy: 6/9 controllers correct (~67%)**. 3 controllers (Features, Preferences, TenantServices) use different route prefixes than hub documents.

### Phantom Endpoints (in hub but not in code)

| Hub Endpoint | Status |
|-------------|--------|
| POST /config/features | ❌ Hub has this at wrong path — actual is POST /features |
| PUT /config/features/:id | ❌ Uses `:code` param, not `:id` |
| DELETE /config/features/:id | ❌ No DELETE on features — only DELETE :code/override |
| POST /config/features/:id/evaluate | ❌ PHANTOM — no evaluate endpoint. Evaluation is internal via FeatureFlagEvaluator |
| POST /config/email-templates | ❌ PHANTOM — no create endpoint, only GET list, GET :id, PUT :id |
| DELETE /config/email-templates/:id | ❌ PHANTOM — no delete endpoint |
| POST /config/email-templates/:id/preview | ❌ PHANTOM — no preview endpoint |
| POST /config/sequences | ❌ PHANTOM — no create endpoint |
| GET /config/sequences/:id | ❌ Uses `:type` param, not `:id` |
| POST /config/sequences/:id/reset | ❌ PHANTOM — no reset endpoint |
| GET /config/preferences/:key | ❌ PHANTOM — no single-key GET (only PUT :key, DELETE :key) |
| GET /config/tenant-services/:service | ❌ PHANTOM — no single service check |
| POST /config/tenant-services/:service/toggle | ❌ PHANTOM — no toggle endpoint |

### Missing Endpoints (in code but not in hub)

| Actual Endpoint | Controller |
|----------------|------------|
| GET config/holidays | BusinessHoursController |
| POST config/holidays | BusinessHoursController |
| DELETE config/holidays/:id | BusinessHoursController |
| GET features/:code/enabled | FeaturesController |
| PUT features/:code/override | FeaturesController |
| DELETE features/:code/override | FeaturesController |
| DELETE preferences/:key | PreferencesController |
| POST preferences/bulk | PreferencesController |
| GET config/system/categories | SystemConfigController |
| POST config/system/validate | SystemConfigController |
| POST config/templates/:code/apply | TemplatesController |
| DELETE config/tenant/:key | TenantConfigController |
| POST config/tenant/bulk | TenantConfigController |
| GET tenant-services/tenants | TenantServicesController |
| GET tenant-services/enabled | TenantServicesController |
| PUT tenant-services/tenants | TenantServicesController |

**13 phantom hub endpoints, 16 missing real endpoints. Hub endpoint distribution heavily fictionalized.**

---

## Phase 3: Security Audit

### Auth Guards

| Controller | JwtAuthGuard | RolesGuard | @Roles | Verdict |
|-----------|-------------|------------|--------|---------|
| BusinessHoursController | ✅ controller | ❌ MISSING | ❌ none | ⚠️ Any authenticated user can modify business hours |
| EmailTemplatesController | ✅ controller | ❌ MISSING | ❌ none | ⚠️ Any user can edit email templates |
| FeaturesController | ✅ controller | ❌ MISSING | ❌ none | ⚠️ Any user can create/modify feature flags |
| PreferencesController | ✅ controller | ❌ MISSING | ❌ none | ⚠️ Any user can modify tenant preferences |
| SequencesController | ✅ controller | ❌ MISSING | ❌ none | ⚠️ Any user can modify number sequences |
| SystemConfigController | ✅ controller | ❌ MISSING | ✅ PUT/validate only | ❌ @Roles decorative — RolesGuard not applied |
| TemplatesController | ✅ controller | ❌ MISSING | ❌ none | ⚠️ Any user can apply templates |
| TenantConfigController | ✅ controller | ❌ MISSING | ❌ none | ⚠️ Any user can modify tenant config |
| TenantServicesController | ✅ controller | ✅ method-level (4/5) | ✅ SUPER_ADMIN | ✅ BEST — only controller with real RBAC |

**RolesGuard: 1/9 controllers (11%) — WORST of any service with this many controllers.** Config endpoints (feature flags, sequences, email templates, business hours) should be ADMIN-only but are open to all authenticated users.

**SystemConfigController is DANGEROUSLY misconfigured:** Has `@Roles('ADMIN', 'SUPER_ADMIN')` on PUT/:key and POST/validate but NO `@UseGuards(RolesGuard)` — roles are completely ignored at runtime. Any authenticated user can modify system config.

### Tenant Isolation

| Service | tenantId Filter | Verdict |
|---------|----------------|---------|
| BusinessHoursService | ✅ YES | OK |
| EmailTemplatesService | ✅ YES | OK |
| FeaturesService | ⚠️ NO — feature flags are global | By design (flags not tenant-scoped) |
| PreferencesService | ✅ YES | OK |
| SequencesService | ✅ YES | OK |
| SystemConfigService | ⚠️ NO — system config is global | By design |
| TemplatesService | ✅ YES | OK |
| TenantConfigService | ✅ YES | OK |
| TenantServicesService | ✅ YES | OK |

Tenant isolation is correct — global services (features, system) are appropriately global, tenant-scoped services filter properly.

### Soft-Delete Compliance

| Service | Checks deletedAt: null | Hard Deletes | Verdict |
|---------|----------------------|-------------|---------|
| BusinessHoursService | ❌ NO | ✅ YES — holiday .delete() | ❌ DOUBLE VIOLATION |
| EmailTemplatesService | ❌ NO | ❌ no | ⚠️ Missing filter |
| FeaturesService | ❌ NO | ❌ no | ⚠️ Missing filter |
| PreferencesService | ❌ NO | ✅ YES — .deleteMany() | ❌ DOUBLE VIOLATION |
| SequencesService | ❌ NO | ❌ no | ⚠️ Missing filter |
| SystemConfigService | ❌ NO | ❌ no | ⚠️ Missing filter |
| TemplatesService | ❌ NO | ❌ no | ⚠️ Missing filter |
| TenantConfigService | ❌ NO | ✅ YES — .deleteMany() (reset) | ❌ DOUBLE VIOLATION |
| TenantServicesService | ✅ YES | ❌ no | ✅ ONLY COMPLIANT SERVICE |
| ConfigHistoryService | N/A | ❌ no | N/A (audit log) |

**Soft-delete compliance: 1/9 (11%) — tied with Feedback for WORST of all services.**
**Hard-delete violations: 3 services** (BusinessHours holidays, Preferences reset, TenantConfig reset)

---

## Phase 4: Test Verification

### Hub Claims vs Reality

| Hub Claim | Actual | Verdict |
|-----------|--------|---------|
| "Partial — spec files exist for most sub-modules" | 11 spec files / 42 tests / 743 LOC | ✅ Hub PARTIALLY accurate (rare!) |

**Test breakdown:**

| Spec File | Tests | LOC |
|-----------|-------|-----|
| tenant-config.service.spec.ts | 10 | 133 |
| config-cache.service.spec.ts | 8 | 99 |
| features.service.spec.ts | 6 | 90 |
| preferences.service.spec.ts | 6 | 87 |
| sequences.service.spec.ts | 3 | 68 |
| system-config.service.spec.ts | 4 | 68 |
| business-hours.service.spec.ts | 4 | 57 |
| templates.service.spec.ts | 3 | 55 |
| email-templates.service.spec.ts | 3 | 42 |
| config-history.service.spec.ts | 1 | 26 |
| feature-flag.evaluator.spec.ts | 2 | 18 |

Hub says "Partial" — directionally correct. This is the **first service where the test claim is approximately accurate** (not an undercount or false "None" claim).

---

## Phase 5: Cross-Cutting Analysis

### Architecture Quality

**Strengths:**
1. **Redis caching layer** — ConfigCacheService with 5-minute TTL, proper key namespacing (`config:{category}:{identifier}`), invalidation on writes. 5/11 services use it.
2. **Feature flag evaluator** — Sophisticated crypto-hash based percentage rollout, per-tenant/user override system with expiry, deterministic evaluation.
3. **Config history** — All config changes audit-logged via ConfigHistoryService with before/after snapshots.
4. **Module exports** — Exports 5 services (SystemConfig, TenantConfig, Preferences, Features, TenantServices) — good API surface for other modules.
5. **Event-driven** — 3 EventEmitter events (feature.enabled, feature.disabled, config.system.updated, config.tenant.updated).
6. **43 TypeScript files** — Well-organized sub-module architecture with dto/, controllers, services, specs per domain.

**Weaknesses:**
1. **0/8 RolesGuard on non-TenantServices controllers** — Config modification endpoints (feature flags, email templates, sequences, system config) are open to ANY authenticated user. This is a foundational security service — this is critical.
2. **SystemConfigController @Roles is decorative** — Has `@Roles('ADMIN', 'SUPER_ADMIN')` but no RolesGuard to enforce it. System config (SMTP, rate limits, maintenance mode) writable by anyone.
3. **3 hard-delete violations** — Holidays, preferences, and tenant config reset use `.delete()`/`.deleteMany()` instead of soft-delete.
4. **1/9 soft-delete compliance** — Only TenantServicesService checks `deletedAt: null`. All other services may return soft-deleted records.

### Hub Accuracy Summary

| Section | Accuracy | Notes |
|---------|----------|-------|
| Endpoint Count | 100% ✅ | 39=39, 16th consecutive perfect match |
| Endpoint Paths | ~67% | 3/9 controller prefixes wrong, 13 phantom endpoints |
| Data Model Names | ~33% | 5/15 models named, 2 wrong names |
| Data Model Fields | ~45% avg | CommunicationTemplate ~20%, NumberSequence ~45%, SystemConfig ~58% |
| Known Issues | ~57% | 4/7 directionally accurate, but misses all security gaps |
| Test Claims | ~80% | "Partial" is accurate — rare for this audit series |
| Security Claims | N/A | Hub doesn't assess security — fair for P3 |

### LOC Summary

| Category | LOC |
|----------|-----|
| Source (non-spec) | 1,873 |
| Specs | 743 |
| **Total** | **2,616** |
| .bak | None |

---

## Verdict: MODIFY (8.0/10)

**Score: 3.0 → 8.0 (+5.0)**

### Justification

Config is a **foundational service** that every other module depends on. The backend is substantially built — 9 controllers, 11 services, sophisticated feature flag evaluation with crypto-hash rollout, Redis caching with proper invalidation, config history audit trail. This is NOT the "Partial" stub the hub implies.

The -2.0 deduction comes from:
- **-1.0:** RolesGuard missing on 8/9 controllers — config endpoints (feature flags, email templates, system config) open to all users
- **-0.5:** 3 hard-delete violations in a service that explicitly has Prisma `deletedAt` fields
- **-0.5:** 8/9 services skip `deletedAt: null` filter — may return soft-deleted config records

### Key Findings

| # | Finding | Severity | Details |
|---|---------|----------|---------|
| 1 | SystemConfigController @Roles is decorative | P1 | Has @Roles but no RolesGuard — system config (SMTP, maintenance mode) writable by any user |
| 2 | 0/8 controllers have RolesGuard (except TenantServices) | P1 | Feature flags, email templates, sequences, preferences — all ADMIN operations open to all |
| 3 | 3 hard-delete operations | P2 | BusinessHours holidays, Preferences deleteMany, TenantConfig deleteMany |
| 4 | 8/9 services skip deletedAt filter | P2 | Only TenantServicesService checks deletedAt: null |
| 5 | Hub misses 10/15 Prisma models | Doc | Including FeatureFlagOverride, TenantConfig, BusinessHours, Holiday, CacheConfig |
| 6 | Hub names 2 models wrong | Doc | Sequence→NumberSequence, EmailTemplate→CommunicationTemplate |
| 7 | 3 controller prefixes wrong in hub | Doc | Features, Preferences, TenantServices not under /config/ |
| 8 | 13 phantom + 16 missing endpoints in hub | Doc | Endpoint distribution heavily fictionalized despite count being correct |
| 9 | 5 Prisma enums undocumented | Doc | FeatureFlagStatus, ConfigCategory, ResetFrequency, DataType, CacheType |
| 10 | Hub FeatureFlag lifecycle states wrong | Doc | No DISABLED/ENABLED/PERCENTAGE_ROLLOUT — uses ACTIVE/DEPRECATED/ARCHIVED + boolean + int |

### Action Items

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Add RolesGuard to SystemConfigController (enforce existing @Roles) | P1 | 5 min |
| 2 | Add @UseGuards(RolesGuard) + @Roles('ADMIN') to all 8 unguarded controllers | P1 | 30 min |
| 3 | Replace 3 hard-delete operations with soft-delete (update deletedAt) | P2 | 30 min |
| 4 | Add deletedAt: null filter to all 8 non-compliant services | P2 | 45 min |
| 5 | Fix hub model names (Sequence→NumberSequence, EmailTemplate→CommunicationTemplate) | Doc | 15 min |
| 6 | Add 10 missing models to hub Section 8 | Doc | 30 min |
| 7 | Fix 3 controller path prefixes in hub Section 4 | Doc | 15 min |
| 8 | Remove 13 phantom endpoints, add 16 missing endpoints in hub | Doc | 30 min |
| 9 | Document 5 Prisma enums in hub | Doc | 15 min |
| 10 | Fix FeatureFlag lifecycle states in hub Section 10 | Doc | 10 min |
| 11 | Add 4 EventEmitter events to hub documentation | Doc | 10 min |
| 12 | Document Redis caching architecture (key structure, TTL, invalidation) | Doc | 15 min |
| 13 | Document FeatureFlagOverride system (per-tenant/user overrides with expiry) | Doc | 15 min |

---

## Tribunal Debate Log

### Round 1: "Is Config really 8.0?"

**Prosecution:** Config has the WORST RolesGuard compliance of any service — 1/9 controllers. System config (SMTP, maintenance mode, rate limits) is writable by any authenticated user. Feature flags can be created/modified by dispatchers. This is a foundational service — if compromised, it cascades to all 38 other services.

**Defense:** Config is a P3 service with no frontend. The lack of RBAC is a gap but not exploitable without authentication. TenantServicesController (the most dangerous one — can disable entire modules) has proper SUPER_ADMIN guards. The architecture is solid: Redis caching, crypto-hash rollout, audit trail.

**Verdict:** RolesGuard gap is P1 but fixable in 30 minutes. Doesn't warrant score below 8.0 given the overall architecture quality.

### Round 2: "Hub data model accuracy at 33%?"

**Prosecution:** Hub names 5 conceptual models. Reality is 15 Prisma models with 2 name mismatches. This is the worst model-to-documentation ratio since Dashboard (PST-02).

**Defense:** Config is a cross-cutting service that touches many models. Some models (CacheConfig, CacheInvalidationRule, DocumentTemplate) are shared with other modules. The hub's conceptual models are the right abstraction for documentation — you don't need to list every Prisma model.

**Verdict:** Hub should at minimum document the 10 models actively used by config controllers/services. CacheConfig and CacheInvalidationRule are config-specific and belong in this hub.

### Round 3: "Soft-delete compliance at 11%?"

**Prosecution:** Every single config Prisma model has a `deletedAt` field, yet 8/9 services ignore it. BusinessHours, Preferences, and TenantConfig hard-delete records despite having soft-delete infrastructure. This is structural negligence.

**Defense:** Config records are typically unique per tenant (@@unique constraints). Soft-delete + unique constraints create conflicts — you can't create a new config key if the old soft-deleted one still occupies the unique slot. The hard-deletes may be intentional.

**Verdict:** Valid point on @@unique conflicts. However, the fix is `@@unique` on `[tenantId, configKey, deletedAt]` or filtered unique indexes. 11% compliance is still a bug, not a design choice.

### Round 4: "Hub test claim actually accurate?"

**Prosecution:** For 30 straight services, hub test claims have been wrong. Config says "Partial" and has 11 spec files / 42 tests. Is this a fluke?

**Defense:** Hub says "Partial — spec files exist for most sub-modules." There are 11 spec files covering 10/11 services (only TenantServicesService lacks a spec). "Partial" is genuinely accurate. This breaks the 22-service streak of false "None" claims.

**Verdict:** Confirmed. Hub test claim is ~80% accurate — a notable outlier in this audit series.

### Round 5: "Is the feature flag evaluator production-grade?"

**Prosecution:** The evaluator uses `crypto.createHash('sha256')` for percentage rollout — good. But there's no persistence of rollout assignments. A user at 49% rollout could get different results if the flag changes from 50% to 48%.

**Defense:** This is standard for stateless flag evaluation (LaunchDarkly, Unleash use similar approaches). The crypto hash ensures deterministic assignment per userId. The override system (FeatureFlagOverride with expiry) handles sticky assignments when needed.

**Verdict:** Evaluator design is correct. Hub's known issue about "no percentage rollout persistence" is valid but architectural, not a bug.
