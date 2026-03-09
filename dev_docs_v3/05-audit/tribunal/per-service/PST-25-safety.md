# PST-25: Safety — Per-Service Tribunal Verdict

> **Audited:** 2026-03-09 | **Batch:** 5 (P3 Future) | **Verdict:** MODIFY | **Health:** 2.0 → **7.5/10**

---

## 1. Executive Summary

The Safety module is a **comprehensive, production-quality backend** with 9 sub-modules covering FMCSA compliance, CSA scoring, DQF management, insurance tracking, incident lifecycle, watchlist management, and a custom scoring engine. The hub accurately captures the endpoint count (43=43, 12th consecutive perfect match) and correctly identifies which controllers have RolesGuard. However, the hub undercounts Prisma models (7 listed vs 9 actual — misses `CarrierInsurance` and `CarrierWatchlist` which the module operates on), undercounts spec files (7 claimed vs 11 actual with 63 tests), and the FMCSA API client is a stub returning mock data (not disclosed in hub). Hub's D rating (2/10) is indefensible — this is a well-structured, domain-rich backend with 100% tenant isolation and 100% soft-delete compliance.

---

## 2. Quantitative Audit

| Metric | Hub Claim | Actual | Match |
|--------|-----------|--------|-------|
| Controllers | 9 | 9 | 100% |
| Endpoints | 43 | 43 | 100% (12th consecutive perfect match) |
| Endpoint paths | ~100% | ~100% | All paths verified correct |
| Prisma models (listed) | 7 | 9 | 78% (misses CarrierInsurance, CarrierWatchlist) |
| Spec files | 7 | 11 | 64% (misses fmcsa-api.client, scoring.engine, +2 uncounted) |
| Test cases | "Partial" | 63 | Hub vague, actual is substantial |
| DTO classes | Not mentioned | 20 | Not documented |
| Services | Not mentioned | 11 (9 services + 1 API client + 1 scoring engine) | Not documented |
| Total LOC | Not mentioned | 3,188 | Not documented |
| Frontend pages | 0 | 0 | 100% |
| Frontend hooks | 0 | 0 | 100% |
| Frontend components | 0 | 0 | 100% |
| EventEmitter events | Not mentioned | 5 events across 4 services | Not documented |
| Module registered in app.module | "Needs verification" | YES (line 40, 124) | Hub WRONG — already registered |
| Module exports | Not mentioned | 9 services exported | Not documented |

---

## 3. Security Audit

### RolesGuard Compliance

| Controller | JwtAuthGuard | RolesGuard | Hub Says | Match |
|-----------|:----------:|:----------:|----------|:-----:|
| Alerts | YES | **NO** | Missing RolesGuard | YES |
| CSA | YES | **NO** | Not mentioned specifically | — |
| DQF | YES | YES | RolesGuard on DQF | YES |
| FMCSA | YES | **NO** | Not mentioned specifically | — |
| Incidents | YES | YES | RolesGuard on Incidents | YES |
| Insurance | YES | **NO** | Missing RolesGuard | YES |
| Reports | YES | YES | RolesGuard on Reports | YES |
| Scores | YES | YES | RolesGuard on Scores | YES |
| Watchlist | YES | **NO** | Not mentioned specifically | — |

**Hub security section accuracy: GOOD** — Correctly identifies the 4 controllers with RolesGuard (DQF, Incidents, Reports, Scores) and flags Alerts and Insurance as missing. However, it omits CSA, FMCSA, and Watchlist from the missing list.

**Result: 4/9 controllers have RolesGuard (44%).** 5 controllers have decorative `@Roles` — any authenticated user bypasses role checks.

### Tenant Isolation
- **100% compliant** — All 9 controllers inject `@CurrentTenant()` on every endpoint
- All services filter by `tenantId` in every query
- Cross-entity validation via `requireCarrier()` / `requireDriver()` helpers

### Soft-Delete Compliance
- **100% compliant** — All queries include `deletedAt: null`
- No hard deletes anywhere in the module
- DQF `remove()` and Insurance `remove()` both use soft delete

---

## 4. Data Model Verification

### Hub-Listed Models (7) — All Exist

| Model | Hub Fields | Actual Fields | Accuracy |
|-------|-----------|---------------|----------|
| SafetyAlert | 18 fields | 18 fields | ~95% |
| SafetyIncident | 21 fields | 21 fields | ~95% |
| SafetyInspection | 18 fields | 18 fields | ~95% |
| SafetyAuditTrail | 11 fields | 11 fields | ~95% |
| CsaScore | 17 fields | 17 fields | ~95% |
| DriverQualificationFile | 17 fields | 17 fields | ~95% |
| FmcsaCarrierRecord | 23 fields | 23 fields | ~95% |

### Missing from Hub (2 models)

| Model | Location | Fields | Used By |
|-------|----------|--------|---------|
| **CarrierInsurance** | schema.prisma:1174 | 20 fields | InsuranceService (CRUD, verify, expiring) |
| **CarrierWatchlist** | schema.prisma:1551 | 17 fields | WatchlistService (CRUD, resolve) |

These are carrier-domain models but the Safety module is the primary consumer via its insurance and watchlist sub-modules. Hub Section 8 omits them entirely.

### Enums — Hub Accurate
| Enum | Hub | Actual | Match |
|------|-----|--------|-------|
| CSABasicType | 7 values | 7 values | 100% |
| SafetyAlertType | 5 values | 5 values | 100% |
| SafetyIncidentType | 5 values | 5 values | 100% |
| DQFDocumentType | 8 values | 8 values | 100% |
| InsuranceType | Used by CarrierInsurance | Exists | Not in hub |

---

## 5. Business Logic Audit

### Scoring Engine (`scoring.engine.ts`)
Hub says "undocumented." Actual implementation:
- **Weights:** Authority 20%, Insurance 20%, CSA 25%, Incident 20%, Compliance 10%, Performance 5%
- **Risk levels:** 85+ = LOW, 70-84 = MEDIUM, 55-69 = HIGH, <55 = CRITICAL
- **Performance score:** Hardcoded to 80 (stub — no real performance data source)

### CSA Score Refresh
- Uses `seededPercentile()` to generate **deterministic test data** — NOT real FMCSA data
- Hardcoded CSA thresholds per BASIC type (65-80 range)
- Metrics injected: inspectionCount always 3, violationCount 2 if alert else 0

### FMCSA API Client (`fmcsa-api.client.ts`)
- **STUB IMPLEMENTATION** — Returns mock data, no real SAFER Web API call
- Hub mentions "No integration tests for FMCSA external API calls" — understates the issue (there IS no API call to test)

### Insurance Validation
- Minimum coverage enforcement per type (AUTO_LIABILITY: $1M, CARGO: $100K, etc.)
- Expiring event emission within 30-day window
- Separate expired vs expiring events

### DQF Compliance
- Checks all 8 required document types present, non-expired, verified
- Returns status: EXPIRED / COMPLETE / INCOMPLETE + missing documents list
- **Bug:** `addDocument()` resets `isVerified: false` — may be intentional (re-verification on doc update) but not documented

---

## 6. Test Audit

| Spec File | Test Cases | LOC | Coverage |
|-----------|-----------|-----|----------|
| alerts.service.spec.ts | 9 | ~100 | CRUD + state transitions |
| csa.service.spec.ts | 4 | ~80 | Score retrieval + refresh + events |
| dqf.service.spec.ts | 8 | ~120 | CRUD + compliance + doc addition |
| fmcsa.service.spec.ts | 6 | ~90 | Lookup + cache + verify + events |
| fmcsa-api.client.spec.ts | 2 | ~30 | Stub data return |
| incidents.service.spec.ts | 8 | ~110 | CRUD + close + violations |
| insurance.service.spec.ts | 8 | ~120 | CRUD + coverage validation + events |
| safety-reports.service.spec.ts | 3 | ~60 | 3 report types |
| safety-scores.service.spec.ts | 6 | ~100 | Score calc + cache + history |
| scoring.engine.spec.ts | 2 | ~40 | Weighted calc + risk levels |
| watchlist.service.spec.ts | 7 | ~90 | CRUD + resolve + carrier validation |
| **TOTAL** | **63** | **~940** | **All services covered** |

Hub claims "7 spec files" — actual is **11 spec files, 63 tests, ~940 LOC**. This is the **16th false test undercount** across all services.

---

## 7. EventEmitter Events (Undocumented)

| Event | Service | Payload | Trigger |
|-------|---------|---------|---------|
| `safety.csa.alert` | CsaService | CSA score data | Score exceeds threshold on refresh |
| `safety.csa.updated` | CsaService | All 7 created scores | After refresh completes |
| `safety.carrier.verified` | FmcsaService | `{ carrierId, status }` | After carrier verification |
| `safety.insurance.expiring` | InsuranceService | Insurance data | Policy within 30 days of expiry |
| `safety.insurance.expired` | InsuranceService | Insurance data | Policy past expiry date |
| `safety.score.updated` | SafetyScoresService | `{ carrierId, score }` | After score calculation |

---

## 8. Known Issues Verification

| Hub Issue | Hub Severity | Verdict | Notes |
|-----------|:----------:|---------|-------|
| No frontend pages exist | P3 | **ACCURATE** | 0 pages confirmed |
| No frontend hooks or components | P3 | **ACCURATE** | 0 hooks, 0 components confirmed |
| No integration tests for FMCSA external API | P2 | **UNDERSTATED** | The API client is a STUB — there IS no real API to test |
| Scoring engine formula/weights undocumented | P2 | **ACCURATE** | Weights exist in code but not in hub docs |
| Safety module not registered in app.module | P1 | **FALSE** | Registered at app.module.ts lines 40, 124 |
| Watchlist missing GET /:id endpoint | P2 | **PARTIALLY FALSE** | Service has `get()` method; controller lacks the route (service exists, route missing) |
| Alerts controller missing RolesGuard | P2 | **ACCURATE** | Confirmed — @Roles decorative |
| Insurance controller missing RolesGuard | P2 | **ACCURATE** | Confirmed — @Roles decorative |
| Backend spec files exist but coverage unknown | P2 | **RESOLVED** | 11 spec files, 63 tests, all services covered |

**Accuracy: 6/9 correct (67%), 1 false, 1 understated, 1 resolved**

---

## 9. New Findings (Not in Hub)

### P1 — Security
1. **CSA controller missing RolesGuard** — Any authenticated user can refresh CSA scores (ADMIN-only action)
2. **FMCSA controller missing RolesGuard** — Any authenticated user can verify/refresh FMCSA data (ADMIN-only actions)
3. **Watchlist controller missing RolesGuard** — Any authenticated user can create/update watchlist entries (ADMIN-only actions)
4. **8 endpoints across Alerts, Insurance, Watchlist missing method-level @Roles** — Even if RolesGuard added, these methods have no role restriction

### P2 — Stubs & Hardcoded Values
5. **FMCSA API client is a stub** — Returns deterministic mock data, never calls real SAFER Web API
6. **CSA refresh generates fake percentiles** — `seededPercentile()` produces test data, not real scores
7. **Performance score hardcoded to 80** — No data source for actual carrier performance
8. **CSA metrics injected** — inspectionCount=3, violationCount=2|0 are not from real data

### P2 — Data
9. **DQF `addDocument()` resets `isVerified`** — Document update clears verification (may need review)
10. **CarrierInsurance and CarrierWatchlist models not documented in hub** — 2 models the module directly operates on

### P3 — Architecture
11. **6 EventEmitter events undocumented** — 4 services emit domain events not captured in hub
12. **20 DTO classes not mentioned** — Full validation layer exists but hub doesn't document it
13. **Scoring engine weights not in hub** — Authority 20%, Insurance 20%, CSA 25%, Incident 20%, Compliance 10%, Performance 5%

---

## 10. Hub Accuracy Summary

| Hub Section | Accuracy | Notes |
|-------------|----------|-------|
| Section 1 (Status Box) | 70% | Health score indefensible (2/10 for production backend). "Partial" tests understated. Module registration "needs verification" — it's registered. |
| Section 2 (Implementation) | 85% | Backend status accurate. Test count understated (7→11 files). |
| Section 3 (Screens) | 100% | All "Not Built" — confirmed |
| Section 4 (Endpoints) | 98% | Count 43=43 perfect. All paths verified. Slight role description gaps. |
| Section 5 (Components) | 100% | All "Not Built" — confirmed |
| Section 6 (Hooks) | 100% | All "Not Built" — confirmed |
| Section 7 (Business Rules) | 85% | Mostly accurate. Misses FMCSA stub nature, scoring weights, insurance minimums. |
| Section 8 (Data Model) | 78% | 7/9 models listed. Field accuracy ~95% for listed models. Missing CarrierInsurance, CarrierWatchlist. |
| Section 9 (Validation) | 90% | Rules match DTO validators. Missing insurance minimum coverage validation. |
| Section 10 (Status States) | 85% | Lifecycles accurate. Missing some transitions in Watchlist. |
| Section 11 (Known Issues) | 67% | 6/9 accurate, 1 false (module registration), 1 understated, 1 resolved |
| Section 14 (Delta) | 90% | Accurate assessment of backend-ahead status |
| Section 15 (Dependencies) | 90% | Accurate. Missing EventEmitter integration points. |
| **Overall** | **~85%** | **3rd most accurate hub** (after Agents ~92% and Factoring ~100% paths) |

---

## 11. Verdict

### Score: 2.0 → 7.5/10 (+5.5)

| Component | Score | Rationale |
|-----------|-------|-----------|
| Architecture | 8.5/10 | Clean 9-submodule structure. Domain-driven. Proper separation of concerns. |
| Security | 6.0/10 | 100% tenant isolation + soft-delete. But 5/9 controllers missing RolesGuard (decorative @Roles). |
| Data Model | 8.0/10 | 9 well-designed models. Comprehensive field coverage. Proper indexes. |
| Business Logic | 7.0/10 | Scoring engine, CSA tracking, DQF compliance all implemented. BUT: FMCSA is stub, CSA uses fake data, performance score hardcoded. |
| Tests | 7.5/10 | 63 tests across 11 spec files. All services covered. Good coverage. |
| Documentation (hub) | 6.5/10 | ~85% accurate. Missing 2 models, understates tests, false module registration claim. |
| Frontend | 0/10 | Nothing exists (expected for P3) |

### Recommendation: MODIFY

**Action items (13):**
1. **P1:** Add RolesGuard to Alerts, CSA, FMCSA, Insurance, Watchlist controllers (5 controllers)
2. **P1:** Add method-level @Roles to 8 unprotected endpoints (Alerts create/acknowledge/dismiss/resolve, Insurance create/update/verify, Watchlist update)
3. **P2:** Replace FMCSA API client stub with real SAFER Web integration
4. **P2:** Replace CSA `seededPercentile()` with real FMCSA CSA data
5. **P2:** Implement real performance score calculation (replace hardcoded 80)
6. **P2:** Add GET `/:id` route to WatchlistController (service method exists, route missing)
7. **P2:** Review DQF `addDocument()` isVerified reset behavior — document or fix
8. **P2:** Document scoring engine weights in hub Section 7
9. **P2:** Add CarrierInsurance and CarrierWatchlist to hub Section 8
10. **P3:** Document 6 EventEmitter events in hub
11. **P3:** Document 20 DTO classes in hub
12. **P3:** Update hub Section 11 — remove false module registration issue, mark test coverage as resolved
13. **P3:** Wire safety alerts to notification system (hub Section 15 notes this dependency)

---

## 12. Cross-Cutting Patterns

| Pattern | This Service | Running Total |
|---------|-------------|---------------|
| Perfect endpoint count | YES (43=43) | 12/25 services |
| False "no tests" claim | YES (63 tests, hub: "Partial/7 files") | 16th occurrence |
| Missing RolesGuard | 5/9 controllers | Systemic across codebase |
| Hub health score indefensible | YES (2→7.5, +5.5 delta) | 25th consecutive MODIFY |
| FMCSA stub data | NEW pattern | 1st occurrence |
| Module registration confirmed | YES | Hub's "needs verification" was false |
| 100% tenant isolation | YES | Maintained streak |
| 100% soft-delete compliance | YES | Best compliance in P3 batch |
