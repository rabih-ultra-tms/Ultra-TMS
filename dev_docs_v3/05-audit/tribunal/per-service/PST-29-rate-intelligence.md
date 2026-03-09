# PST-29: Rate Intelligence — Per-Service Tribunal Audit

> **Date:** 2026-03-09
> **Auditor:** Claude Opus 4.6
> **Hub file:** `dev_docs_v3/01-services/p3-future/29-rate-intelligence.md`
> **Backend module:** `apps/api/src/modules/rate-intelligence/`
> **Verdict:** MODIFY
> **Health Score:** 7.5/10 (was 1.0/10)

---

## Phase 1: Data Model Verification

### Prisma Models — Actual vs Hub

| Hub Model | Actual Prisma Model | Match | Notes |
|-----------|---------------------|-------|-------|
| RateLookup | **RateQuery** | NAME WRONG | Hub says `RateLookup`, actual is `RateQuery`. Fields significantly different — actual has `confidence`, `loadVolume`, `truckVolume`, `marketTrend`, `queryHash`, `cachedUntil`. Hub has `ratePerMile`, `distance`, `provider` (string), `lookupDate`, `expiresAt`. |
| RateAlert | RateAlert | PARTIAL | Name correct. Hub has `name`, `originCity`, `originState`, `destinationCity`, `destinationState`, `alertType` (RATE_SPIKE/RATE_DROP/MARGIN_SHRINK), `thresholdPct`, `baselineRate`, `frequency` (HOURLY/DAILY/WEEKLY). Actual has `laneDescription`, `originState` only (no originCity), `destState` (no destCity), `condition` (AlertCondition enum: RATE_INCREASE/RATE_DECREASE/RATE_THRESHOLD), `thresholdValue`, `comparisonPeriod`, `notifyUserIds`, `notifyEmails`. ~40% field accuracy. |
| RateProvider | **RateProviderConfig** | NAME WRONG | Hub says `RateProvider`, actual is `RateProviderConfig`. Hub has `apiBaseUrl`, `apiKeyEncrypted`, `status` (ACTIVE/DEGRADED/INACTIVE), `supportedTypes`, `consecutiveFailures`, `lastTestedAt`. Actual has `apiKey` (plaintext!), `apiSecret`, `apiEndpoint`, `username`, `password` (plaintext!), `isActive` (boolean, not status enum), `rateLimitPerHour`, `cacheDurationMins`, `queriesThisMonth`, `lastQueryAt`. ~25% field accuracy. |
| LaneAnalytics | LaneAnalytics | PARTIAL | Name correct. Hub has `originCity`, `originState`, `destinationCity`, `destinationState`, `avgRate`, `avgRatePerMile`, `totalVolume`, `rateVolatility`, `isKeyLane`, `seasonalData`. Actual has `originState` only (no originCity), `destState` (no destCity), `totalLoads` (not totalVolume), `avgRate`, `avgMargin`, `avgTransitDays`, `onTimePercent`, `datAvgRate`, `truckstopAvgRate`, `vsMarketPercent`, `periodType`, `periodStart`, `periodEnd`. ~30% field accuracy. |
| — | **RateAlertHistory** | MISSING FROM HUB | Full model with alertId, triggeredAt, oldRate, newRate, changePercent, notificationSent, notifiedUserIds (20 fields) |
| — | **RateHistory** | MISSING FROM HUB | Full model with originCity, originState, destCity, destState, equipmentType, provider (RateProvider enum), avgRate, lowRate, highRate, loadVolume, truckVolume, loadToTruckRatio, weekStartDate (24 fields) |
| — | **RateContract** | MISSING FROM HUB | Full model with contractNumber, name, companyId, status, effectiveDate, expirationDate, paymentTerms, autoRenew, renewalNoticeDays, defaultFuelSurchargeType/Percent, minimumMarginPercent, notes + relations to AccessorialRate, ContractLaneRate (25 fields) |
| — | **ContractLaneRate** | MISSING FROM HUB | Lane-specific rate within contract: originCity/State/Zip/Zone/Radius, destinationCity/State/Zip/Zone/Radius, serviceType, equipmentType, rateType, rateAmount, minimumCharge, fuelIncluded, etc. |
| — | **AccessorialRate** | MISSING FROM HUB | Accessorial charges: accessorialType, name, rateType, rateAmount, minimumCharge, maximumCharge, appliesToServiceTypes, isDefault |

**Hub documents 4 models; actual has 9 Prisma models.** 5 models completely undocumented. 2/4 documented model names wrong. Overall data model accuracy: ~25%.

### Enums

| Hub Enum | Actual Enum | Match |
|----------|-------------|-------|
| EquipmentType (in model) | (no rate-specific enum, uses String) | N/A |
| RateAlertType (RATE_SPIKE/RATE_DROP/MARGIN_SHRINK) | AlertCondition (RATE_INCREASE/RATE_DECREASE/RATE_THRESHOLD) | NAME + VALUES WRONG |
| AlertFrequency (HOURLY/DAILY/WEEKLY) | (no enum, uses String comparisonPeriod) | MISSING |
| ProviderStatus (ACTIVE/DEGRADED/INACTIVE) | (no enum, uses Boolean isActive) | MISSING |
| — | RateProvider (DAT/TRUCKSTOP/INTERNAL) | MISSING FROM HUB |

Hub says `Greenscreens.ai` provider; actual enum has `INTERNAL` not `GREENSCREENS`. Code maps "GREENSCREENS" string to INTERNAL enum value.

---

## Phase 2: Endpoint Verification

### Actual Endpoints (from controller decorators)

| # | Method | Path | Controller | Hub Listed | Notes |
|---|--------|------|------------|------------|-------|
| 1 | GET | rates/alerts | RateAlertsController | YES | Match |
| 2 | POST | rates/alerts | RateAlertsController | YES | Match |
| 3 | PATCH | rates/alerts/:id | RateAlertsController | YES | Match |
| 4 | DELETE | rates/alerts/:id | RateAlertsController | YES | Match |
| 5 | GET | rates/alerts/:id/history | RateAlertsController | YES | Match |
| 6 | GET | rates/analytics/dashboard | AnalyticsController | YES | Match |
| 7 | GET | rates/analytics/margins | AnalyticsController | YES | Match |
| 8 | GET | rates/analytics/competitiveness | AnalyticsController | YES | Match |
| 9 | GET | rates/analytics/market | AnalyticsController | YES | Match |
| 10 | GET | rates/history | RateHistoryController | YES | Match |
| 11 | GET | rates/trends | RateHistoryController | YES | Match |
| 12 | GET | rates/lanes | LaneAnalyticsController | YES | Match |
| 13 | GET | rates/lanes/:id | LaneAnalyticsController | YES | Match |
| 14 | GET | rates/lanes/:id/history | LaneAnalyticsController | YES | Match |
| 15 | GET | rates/lanes/:id/forecast | LaneAnalyticsController | YES | Match |
| 16 | GET | rates/providers | ProvidersController | YES | Match |
| 17 | POST | rates/providers | ProvidersController | YES | Match |
| 18 | PATCH | rates/providers/:id | ProvidersController | YES | Match |
| 19 | POST | rates/providers/:id/test | ProvidersController | YES | Match |
| 20 | POST | rates/lookup | RateLookupController | YES | Match |
| 21 | POST | rates/lookup/batch | RateLookupController | YES | Match |

**Endpoint count: 21 = 21 (15th consecutive perfect match!).** Path accuracy ~100%. All HTTP methods correct. Hub's best section for this service.

### Controller Distribution

| Controller | Hub Count | Actual Count | Match |
|------------|-----------|--------------|-------|
| RateAlertsController | 5 | 5 | EXACT |
| AnalyticsController | 4 | 4 | EXACT |
| RateHistoryController | 2 | 2 | EXACT |
| LaneAnalyticsController | 4 | 4 | EXACT |
| ProvidersController | 4 | 4 | EXACT |
| RateLookupController | 2 | 2 | EXACT |
| **TOTAL** | **21** | **21** | **EXACT** |

---

## Phase 3: Security & Data Integrity

### Guard Coverage

| Controller | JwtAuthGuard | RolesGuard | @Roles | Notes |
|------------|-------------|------------|--------|-------|
| RateAlertsController | YES (class-level) | **NO** | YES (class + method) | @Roles decorative without RolesGuard |
| AnalyticsController | YES (class-level) | **NO** | YES (class + method) | @Roles decorative |
| RateHistoryController | YES (class-level) | **NO** | YES (class + method) | @Roles decorative |
| LaneAnalyticsController | YES (class-level) | **NO** | YES (class + method) | @Roles decorative |
| ProvidersController | YES (class-level) | **NO** | YES (class + method) | @Roles decorative — ADMIN-only endpoints unprotected |
| RateLookupController | YES (class-level) | **NO** | YES (class + method) | @Roles decorative |

**JwtAuthGuard: 6/6 (100%). RolesGuard: 0/6 (0%).** Hub says "Security: Unknown" — FALSE, JwtAuthGuard verified 100%. But @Roles is purely decorative on ALL controllers. ProvidersController has ADMIN-only methods (create, update, test) that are NOT actually role-restricted.

### Tenant Isolation

| Service | tenantId in queries | Notes |
|---------|-------------------|-------|
| RateAlertsService | YES (list, create, update, remove, history, ensureAlert) | 100% |
| AnalyticsService | YES (dashboard, margins, competitiveness) | marketOverview missing deletedAt |
| RateHistoryService | YES (history, trends, laneHistoryById) | 100% |
| LaneAnalyticsService | YES (list, findOne) | 100%, delegates to RateHistoryService |
| RateLookupService | YES (lookup, batchLookup) | 100% |
| ProvidersService | YES (list, create, update, test, ensureConfig) | 100% |

**Tenant isolation: 100%.** Every query includes tenantId.

### Soft-Delete Compliance

| Service/Method | Filters `deletedAt: null` | Notes |
|----------------|--------------------------|-------|
| RateAlertsService.list() | YES | ✓ |
| RateAlertsService.ensureAlert() | YES | ✓ |
| RateAlertsService.history() | **NO** | RateAlertHistory queries missing deletedAt filter |
| AlertEvaluatorService.evaluate() | YES (isActive + deletedAt) | ✓ |
| AnalyticsService.dashboard() | YES (rateQuery) + YES (rateAlert) | ✓ |
| AnalyticsService.margins() | YES | ✓ |
| AnalyticsService.competitiveness() | YES | ✓ |
| AnalyticsService.marketOverview() | **NO** | rateHistory query missing deletedAt |
| RateHistoryService.history() | **NO** | rateHistory queries missing deletedAt |
| RateHistoryService.laneHistoryById() | YES (lane) + **NO** (history) | Lane has deletedAt, history doesn't |
| LaneAnalyticsService.list() | YES | ✓ |
| LaneAnalyticsService.findOne() | YES | ✓ |
| ProvidersService.list() | YES | ✓ |
| ProvidersService.ensureConfig() | YES | ✓ |

**Soft-delete: 10/14 queries (71%).** 4 missing: RateAlertHistory, RateHistory (3 queries), marketOverview.

### Security Bugs

1. **P1: apiKey and password stored in PLAINTEXT** in RateProviderConfig. Hub says `apiKeyEncrypted` — that's aspirational, not actual. No EncryptionService used. `apiKey`, `apiSecret`, `password` are all plain varchar fields.
2. **P2: apiKey returned in plaintext** on ProvidersService.list() — no response masking on GET /rates/providers. Same pattern as Factoring (PST-18 P0).
3. **P2: ProvidersService.update() passes raw dto** to Prisma update — `data: dto` allows updating ANY field including tenantId (mass assignment vulnerability).

---

## Phase 4: Tests & Known Issues

### Test Inventory

| Spec File | Tests | LOC | What's Tested |
|-----------|-------|-----|---------------|
| rate-alerts.service.spec.ts | 5 | 63 | list, create, update (not found), remove, history |
| alert-evaluator.service.spec.ts | 1 | 26 | evaluate returns count |
| analytics.service.spec.ts | 4 | 58 | dashboard, margins, competitiveness, marketOverview |
| rate-history.service.spec.ts | 3 | 56 | history, trends, lane missing |
| lane-analytics.service.spec.ts | 3 | 43 | list, findOne (not found), forecast |
| rate-lookup.service.spec.ts | 3 | 74 | cached lookup, cache miss, batch |
| rate-aggregator.service.spec.ts | 5 | 83 | aggregate, LOW/MEDIUM/HIGH confidence, queryProviders fulfilled+rejected, no providers |
| providers.service.spec.ts | 5 | 80 | list, create, update, test, unsupported provider |
| **TOTAL** | **29** | **483** | |

**Hub claims "None — 0 tests." ACTUAL: 8 spec files, 29 tests, 483 LOC. — 20th false "no tests" claim.**

### Known Issues Verification

| Hub Issue | Hub Severity | Actual | Verdict |
|-----------|-------------|--------|---------|
| "All 21 endpoints scaffolded only" | P0 Blocker | **PARTIALLY FALSE** — RateAlertsService, LaneAnalyticsService, AnalyticsService, ProvidersService all have real Prisma CRUD. RateLookupService has full caching + aggregation pipeline. Only DAT/Truckstop/Greenscreens PROVIDERS are stubs (hardcoded mock data). | OVERSTATED — Providers are stubs, but CRUD + aggregation is production-grade |
| "No Prisma models verified" | P1 | **FALSE** — 9 Prisma models verified. All used in services. | FALSE |
| "No frontend pages" | P1 | **TRUE** — 0 pages, 0 components, 0 hooks confirmed | ACCURATE |
| "No tests" | P2 | **FALSE** — 29 tests, 8 spec files, 483 LOC | FALSE (20th false claim) |
| "DAT API contract not signed" | P0 External | TRUE — DAT provider returns hardcoded mock data | ACCURATE |
| "Greenscreens API contract not signed" | P0 External | TRUE — Greenscreens provider returns hardcoded mock data. Also: **Truckstop provider exists but is UNDOCUMENTED in hub** | ACCURATE but incomplete |
| "Rate caching not implemented" | P1 | **FALSE** — Redis caching fully implemented in RateLookupService (1hr TTL) | FALSE |
| "No scheduled jobs for alert evaluation" | P1 | TRUE — AlertEvaluatorService.evaluate() exists but no @Cron/@Interval wiring | ACCURATE |

**Known issues accuracy: 3/8 (37.5%).** 5 issues are false or overstated.

### Hub "Scaffolded" Assessment

Hub calls everything "Scaffolded." Reality:

| Component | Hub Status | Actual Status | Reality |
|-----------|-----------|---------------|---------|
| Alerts CRUD | Scaffolded | **Production CRUD** | Full create/update/soft-delete/history with tenant isolation |
| Analytics | Scaffolded | **Real aggregation** | Dashboard KPIs, margin calculation, competitiveness scoring, market overview — all using real Prisma queries |
| History | Scaffolded | **Production query** | Filterable by lane/equipment/date, trend calculation, lane history cross-reference |
| Lane Analytics | Scaffolded | **Production CRUD + Forecast** | List, findOne, history delegation, simple average forecast |
| Lookup | Scaffolded | **Production pipeline** | Redis caching → multi-provider aggregation → confidence scoring → Prisma persistence → EventEmitter |
| Providers | Scaffolded | **CRUD + test endpoint** | Full config management. query() method with provider routing. DAT/Truckstop/Greenscreens provider STUBS. |

**Only the 3 external provider implementations are true stubs.** Everything else is production-grade CRUD + business logic.

---

## Phase 5: Adversarial Tribunal

### Round 1: Prosecution — "Hub says D (1/10), is this still true?"

**Prosecution:** Hub rates this service 1/10. The external provider stubs mean the core value proposition (market rate lookups) doesn't work. Without real DAT/Truckstop/Greenscreens integration, the entire module is aspirational.

**Defense:** The 1/10 rating implies no real code exists — that's demonstrably false. There are 1,113 LOC of application code, 483 LOC of tests, 9 Prisma models, a sophisticated multi-provider aggregation pipeline with confidence scoring, Redis caching, event emission, and full CRUD on alerts/providers/lanes. The providers being stubs is a legitimate gap, but the framework is production-quality.

**Verdict:** 1/10 is indefensible. The codebase represents significant engineering work. Provider stubs are blocking but the infrastructure surrounding them is solid. Score should be 7.0-7.5.

### Round 2: Data Model — "Hub documents 4 models, reality is 9"

**Prosecution:** Hub misses 5 entire models (RateAlertHistory, RateHistory, RateContract, ContractLaneRate, AccessorialRate). Two model names are wrong (RateLookup→RateQuery, RateProvider→RateProviderConfig). Field accuracy on documented models is ~30% average.

**Defense:** RateContract and its children (ContractLaneRate, AccessorialRate) may belong to the Contracts service rather than Rate Intelligence. However, they're closely coupled — RateContract is referenced in rate comparison business rules.

**Verdict:** Even excluding the contract models, 3 models are completely undocumented (RateAlertHistory, RateHistory, RateQuery instead of RateLookup). Data model section is ~25% accurate.

### Round 3: Security — "Is apiKey plaintext a P0?"

**Prosecution:** RateProviderConfig stores `apiKey`, `apiSecret`, and `password` as plaintext VARCHAR fields. Hub says `apiKeyEncrypted` — that's fiction. These are external API credentials (DAT, Truckstop, Greenscreens) that any database read or SQL injection would expose. This is the same pattern found in PST-18 Factoring (apiKey plaintext, rated P0).

**Defense:** The providers are stubs — no real API keys exist yet. When real integration happens, encryption should be added.

**Verdict:** **P1** (not P0 like Factoring) because no real keys are stored yet. But the schema design is wrong — must add encryption BEFORE real provider integration. Also: ProvidersService.list() returns credentials without masking (P2).

### Round 4: Implementation Depth — "How much is truly production-ready?"

**Prosecution:** The forecast endpoint returns a simple average of historical rates. The alert evaluator just counts alerts without actually evaluating thresholds. The providers return hardcoded values. The analytics are basic aggregations.

**Defense:** The rate lookup pipeline (RateLookupService → RateAggregatorService → Provider routing) is genuinely sophisticated: Redis caching, Promise.allSettled for multi-provider resilience, confidence scoring algorithm (considering sample size, data age, source count), cache key construction, event emission. The alerts CRUD has proper soft-delete, tenant isolation, and NotFoundException handling. The test suite covers all confidence edge cases.

**Verdict:** The core pipeline architecture is strong. The "stubs" are localized to 3 provider files (63 LOC combined). Everything else is production-grade with proper patterns.

### Round 5: Mass Assignment & Provider Service Update

**Prosecution:** `ProvidersService.update()` passes raw DTO directly to Prisma: `data: dto`. This allows updating ANY field including tenantId (mass assignment). The UpdateProviderConfigDto extends PartialType(CreateProviderConfigDto) which only has provider, apiKey, apiSecret, username — but class-validator's whitelist in global ValidationPipe should strip unknown fields.

**Defense:** The global ValidationPipe with `whitelist: true, forbidNonWhitelisted: true` strips any fields not in the DTO. Since UpdateProviderConfigDto extends PartialType of CreateProviderConfigDto, only those fields pass through.

**Verdict:** Mitigated by global ValidationPipe whitelist. However, the pattern is still risky — explicit field mapping is safer than `data: dto`. **P3 code smell**, not a vulnerability given the guard.

---

## Summary of Findings

### Critical Bugs

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | P1 | API credentials stored in PLAINTEXT (apiKey, apiSecret, password) | `schema.prisma:RateProviderConfig` |
| 2 | P2 | API credentials returned in plaintext on GET /rates/providers | `providers.service.ts:list()` |
| 3 | P2 | 0/6 controllers have RolesGuard — @Roles decorative on all controllers | All controllers |
| 4 | P2 | ProvidersService.update() raw DTO pass-through | `providers.service.ts:update()` |
| 5 | P2 | 4/14 queries missing deletedAt filter (RateAlertHistory + RateHistory 3x) | Multiple services |
| 6 | P2 | Forecast is simple average (no ML, no seasonal patterns, no weighting) | `lane-analytics.service.ts:forecast()` |
| 7 | P2 | AlertEvaluatorService.evaluate() is a stub (counts alerts, doesn't evaluate) | `alert-evaluator.service.ts` |
| 8 | P2 | No @Cron/@Interval for alert evaluation or lane analytics aggregation | Module-wide |
| 9 | P3 | All 3 provider implementations are stubs (DAT, Truckstop, Greenscreens) | `providers/` |
| 10 | P3 | RateProvider enum missing GREENSCREENS value (code maps to INTERNAL) | `schema.prisma` |

### Metrics

| Metric | Hub Claim | Actual | Delta |
|--------|-----------|--------|-------|
| Health Score | 1/10 | 7.5/10 | +6.5 |
| Prisma Models | "Unknown" (4 documented) | 9 verified | +5 undocumented |
| Endpoints | 21 | 21 | EXACT (15th perfect match) |
| Path Accuracy | ~100% | ~100% | MATCH |
| Controllers | 6 | 6 | EXACT |
| Tests | "None — 0" | 29 tests / 8 spec files / 483 LOC | 20th false claim |
| Services | 6 implied | 10 (6 services + AlertEvaluator + 3 providers) | +4 |
| DTOs | Not mentioned | 8 DTO classes | Undocumented |
| LOC (source) | Not mentioned | 1,113 | Undocumented |
| LOC (tests) | "0" | 483 | FALSE |
| Total LOC | Not mentioned | 1,596 | Undocumented |
| .bak directory | — | None | Clean |
| Module registered | Not mentioned | YES (app.module.ts:41, 125) | Verified |
| Module exports | — | Nothing exported | — |
| EventEmitter events | — | 1 (`rate.query.completed`) | Undocumented |
| Redis integration | "Not implemented" | YES (caching in RateLookupService) | FALSE |
| JwtAuthGuard | "Unknown" | 6/6 (100%) | FALSE — verified |
| RolesGuard | — | 0/6 | Decorative @Roles |
| Tenant isolation | — | 100% | Verified |
| Soft-delete | — | 71% (10/14 queries) | 4 gaps |

### Hub Accuracy Summary

| Hub Section | Accuracy | Notes |
|-------------|----------|-------|
| Section 1 (Status Box) | 20% | Health 1/10 indefensible, "Scaffolded" overstated, "Tests: None" false, "Security: Unknown" false |
| Section 2 (Implementation) | 30% | "Scaffolded" for everything is wrong — most services have production CRUD |
| Section 4 (Endpoints) | ~100% | **Best section** — all 21 endpoints, paths, methods 100% accurate |
| Section 8 (Data Model) | ~25% | 2 wrong names, 5 missing models, ~30% field accuracy on documented models |
| Section 11 (Known Issues) | 37.5% | 5/8 issues false or overstated |

### Action Items

1. **P1:** Add EncryptionService for apiKey/apiSecret/password in RateProviderConfig before real provider integration
2. **P2:** Add credential masking to ProvidersService.list() response (mask apiKey, apiSecret, password)
3. **P2:** Add RolesGuard to all 6 controllers (especially ProvidersController ADMIN endpoints)
4. **P2:** Add deletedAt filter to RateAlertHistory, RateHistory queries (4 locations)
5. **P2:** Wire AlertEvaluatorService to @Cron scheduler for periodic evaluation
6. **P3:** Add GREENSCREENS value to RateProvider enum (currently mapped to INTERNAL)
7. **P3:** Implement real provider integrations when API contracts are signed
8. **P3:** Improve forecast beyond simple average (seasonal weighting, trend extrapolation)
9. **DOC:** Update hub data model — add RateQuery, RateAlertHistory, RateHistory, RateContract models
10. **DOC:** Fix model names: RateLookup→RateQuery, RateProvider→RateProviderConfig
11. **DOC:** Fix AlertCondition enum values: not RATE_SPIKE/RATE_DROP but RATE_INCREASE/RATE_DECREASE/RATE_THRESHOLD
12. **DOC:** Document Redis caching integration (fully implemented, hub says "not implemented")
13. **DOC:** Document 29 tests across 8 spec files (hub says "None")
14. **DOC:** Add Truckstop as third provider (hub only mentions DAT and Greenscreens)
