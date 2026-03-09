# PST-38: Operations — Per-Service Tribunal Audit

> **Date:** 2026-03-09 | **Auditor:** Claude Opus 4.6 | **Verdict:** MODIFY | **Health Score:** 7.5/10 (was 7.0)

---

## Phase 1: Hub Accuracy Assessment

### Hub Claims vs Reality

| Hub Claim | Reality | Accurate? |
|-----------|---------|-----------|
| Health Score 7/10 | 7.5/10 — umbrella module with strong sub-modules | ⚠️ SLIGHTLY LOW |
| Backend: Production | ✅ 7 sub-modules, all registered, all functional | ✅ YES |
| Umbrella module | ✅ OperationsModule imports/exports 7 sub-modules | ✅ YES |
| Endpoint count | Hub doesn't specify — actual: ~61 across 7 controllers | N/A |
| Tests | Hub doesn't specify — actual: 0 spec files, 0% coverage | N/A |
| Frontend | Hub references /operations/ routes — 13+ pages exist | ✅ YES |

**Hub Accuracy: ~70%** — Hub is sparse (infrastructure hub), correctly identifies umbrella pattern but lacks detail on sub-modules, endpoints, security status.

---

## Phase 2: Code Deep-Dive

### Architecture — Umbrella Module Pattern

```
apps/api/src/modules/operations/
├── operations.module.ts              (33 LOC — imports/exports all sub-modules)
├── carriers/
│   ├── carriers.module.ts            (12 LOC)
│   ├── carriers.controller.ts        (299 LOC, 21 endpoints)
│   ├── carriers.service.ts           (790 LOC)
│   └── dto/ (4 files)               (~400 LOC)
├── dashboard/
│   ├── dashboard.module.ts           (12 LOC)
│   ├── dashboard.controller.ts       (71 LOC, 5 endpoints)
│   ├── dashboard.service.ts          (594 LOC)
│   └── dashboard.dto.ts              (31 LOC)
├── equipment/
│   ├── equipment.module.ts           (12 LOC)
│   ├── equipment.controller.ts       (97 LOC, 8 endpoints)
│   ├── equipment.service.ts          (259 LOC)
│   └── dto/                          (~60 LOC)
├── inland-service-types/
│   ├── inland-service-types.module.ts  (12 LOC)
│   ├── inland-service-types.controller.ts (21 LOC, 1 endpoint)
│   └── inland-service-types.service.ts   (24 LOC)
├── load-history/
│   ├── load-history.module.ts        (11 LOC)
│   ├── load-history.controller.ts    (151 LOC, 8 endpoints)
│   ├── load-history.service.ts       (381 LOC)
│   └── dto/                          (~243 LOC)
├── load-planner-quotes/
│   ├── load-planner-quotes.module.ts   (11 LOC)
│   ├── load-planner-quotes.controller.ts (242 LOC, 11 endpoints)
│   ├── load-planner-quotes.service.ts    (845 LOC)
│   └── dto/ (7 files)                    (~720 LOC)
└── truck-types/
    ├── truck-types.module.ts         (12 LOC)
    ├── truck-types.controller.ts     (117 LOC, 7 endpoints)
    ├── truck-types.service.ts        (225 LOC)
    └── truck-types.dto.ts            (210 LOC)

Total: 38+ files, ~5,500+ active LOC
```

### Endpoint Summary (61 total)

| Sub-Module | Endpoints | JwtAuthGuard | RolesGuard | @Roles |
|-----------|-----------|-------------|------------|--------|
| Carriers | 21 | ✅ class-level | ✅ class-level | ✅ per-method |
| Dashboard | 5 | ✅ class-level | ✅ class-level | ❌ none |
| Equipment | 8 | ✅ class-level | ✅ class-level | ❌ none |
| Inland Service Types | 1 | ✅ class-level | ✅ class-level | ❌ none |
| Load History | 8 | ✅ class-level | ✅ class-level | ✅ per-method |
| Load Planner Quotes | 11 | ✅ class-level | ✅ class-level | ✅ per-method |
| Truck Types | 7 | ✅ class-level | ✅ write-only | ✅ write-only |
| **TOTAL** | **61** | **7/7** | **7/7** | **4/7 use @Roles** |

**NOTABLE: 100% JwtAuthGuard + RolesGuard coverage** — BEST of all 38 services. All 7 controllers have both guards at class level.

### Security Analysis

**Guard Coverage:** 100% (7/7 controllers) — **first non-infra service with perfect guard coverage**

**Tenant Isolation:**

| Sub-Module | tenantId Filtering | Gaps |
|------------|-------------------|------|
| Carriers | ✅ all methods | None |
| Dashboard | ✅ all methods | None |
| Equipment | ⚠️ raw SQL | Unclear — raw SQL with table fallback |
| Inland Service Types | ⚠️ none | Global catalog — no tenantId needed (isActive only) |
| Load History | ❌ 2 gaps | **P0: getByCarrier() + getSimilarLoads() missing tenantId** |
| Load Planner Quotes | ✅ all methods | None |
| Truck Types | ⚠️ none | Global catalog — no tenantId needed |

**Soft-Delete Compliance:**

| Sub-Module | deletedAt Filtering | Gaps |
|------------|-------------------|------|
| Carriers | ✅ all queries | None (uses isActive + deletedAt) |
| Dashboard | ✅ all queries | None |
| Equipment | N/A | Raw SQL, no soft-delete |
| Inland Service Types | ✅ isActive | None |
| Load History | ✅ most queries | ⚠️ getByCarrier/getSimilarLoads may skip |
| Load Planner Quotes | ✅ all queries | None |
| Truck Types | ✅ all + restore | None (has restore endpoint!) |

### Prisma Models (10+ owned/consumed)

**Owned by Operations:**
1. OperationsCarrier
2. OperationsCarrierDriver
3. OperationsCarrierTruck
4. OperationsCarrierDocument
5. LoadPlannerQuote
6. LoadPlannerCargoItem
7. LoadPlannerTruck
8. LoadPlannerServiceItem
9. LoadPlannerAccessorial
10. LoadPlannerPermit

**Global catalogs consumed:**
- TruckType
- InlandServiceType
- LoadHistory (has own Prisma model)

### Tests: 0

**Zero spec files across all 7 sub-modules.** This is the LARGEST untested module by endpoint count (61 endpoints, 0 tests).

---

## Phase 3: Adversarial Tribunal (5 Rounds)

### Round 1: "Two P0 tenant isolation bugs in Load History"

**Prosecution:** `getByCarrier(carrierId)` and `getSimilarLoads()` in load-history.service.ts both query without tenantId filtering. Any authenticated user could access load history from other tenants by guessing carrier IDs or querying by state.

**Defense:** The controller injects `@CurrentTenant() tenantId` — the service methods receive it but may not apply it to all queries.

**Verdict:** **P0 CONFIRMED.** Even if controller passes tenantId, service must enforce it in WHERE clause. These are genuine cross-tenant data leakage vectors. Must fix before production.

### Round 2: "61 endpoints with 0 tests — acceptable?"

**Prosecution:** This is the LARGEST untested module in the entire codebase. 61 endpoints, including transactional quote creation, financial calculations (margin, revenue), and analytics queries. Zero test coverage.

**Defense:** The module is backend-focused with straightforward Prisma CRUD. The frontend (Load Planner at 9/10) exercises these endpoints in practice.

**Verdict:** **P1.** Frontend usage doesn't substitute for unit tests. The quote creation flow (6 nested entities in a transaction), dashboard KPI calculations, and lane statistics are non-trivial business logic that MUST have test coverage. However, this is a P1, not P0 — the code works, it just lacks regression protection.

### Round 3: "Dashboard sparklines are empty arrays"

**Prosecution:** `getKPIs()` returns empty arrays `[]` for all 6 sparkline fields. The frontend displays empty charts.

**Defense:** Sparklines are cosmetic — they show trend direction but aren't critical for decision-making. The actual KPI numbers are fully implemented.

**Verdict:** **P2.** Feature is incomplete but non-blocking. Dashboard still provides actionable KPI data.

### Round 4: "Equipment sub-module uses raw SQL with table fallback"

**Prosecution:** `queryWithTableFallback()` tries multiple table names (`makes` then `equipment_makes`) and returns `[]` on error. This hides real database issues and suggests an incomplete migration.

**Defense:** This is a pragmatic approach to handle legacy table naming during migration. The fallback prevents crashes.

**Verdict:** **P2.** Silent failure pattern is concerning. Should consolidate to one table name and throw on genuine errors. The dual-table approach suggests unfinished cleanup work.

### Round 5: "Hub documents this as infrastructure — is it really?"

**Prosecution:** Hub categorizes Operations as P-Infra. But it has 61 endpoints, 10+ Prisma models, and is consumed by 13+ frontend pages. This is clearly a P0 MVP service.

**Defense:** The hub correctly identifies it as an "umbrella" infrastructure pattern — the Operations module itself is just a routing layer. The actual business logic lives in sub-modules that serve TMS Core, Carriers, Sales.

**Verdict:** **Both are right.** The OperationsModule (33 LOC) IS infrastructure — it imports/exports sub-modules. But the sub-modules ARE business-critical P0 code. The hub should acknowledge both aspects.

---

## Phase 4: Findings Summary

### P0 Issues: 2

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| 1 | **getByCarrier() missing tenantId** | load-history.service.ts:~259 | Cross-tenant load history leakage |
| 2 | **getSimilarLoads() missing tenantId** | load-history.service.ts:~289 | Cross-tenant similar loads leakage |

### P1 Issues: 1

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| 3 | **0% test coverage on 61 endpoints** | All sub-modules | No regression protection on business-critical code |

### P2 Issues: 3

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| 4 | Dashboard sparklines empty | dashboard.service.ts:207-214 | Cosmetic, incomplete feature |
| 5 | Equipment silent failure | equipment.service.ts:53 | Hides real errors |
| 6 | Equipment raw SQL + table fallback | equipment.service.ts | Suggests incomplete migration |

### Informational: 2

| # | Finding | Location |
|---|---------|----------|
| 7 | LoadPlannerQuotesService is 845 LOC (monolithic) | load-planner-quotes.service.ts |
| 8 | Dashboard @Roles missing (any authenticated user can see any dashboard) | dashboard.controller.ts |

### Hub Corrections Needed: 3

| # | Section | Current | Should Be |
|---|---------|---------|-----------|
| 1 | Status | 7/10 | 7.5/10 — strong sub-modules despite 2 P0 bugs |
| 2 | Endpoints | Not documented | 61 endpoints across 7 controllers |
| 3 | Tests | Not documented | 0 spec files, 0% coverage |

---

## Phase 5: Verdict

### Score: 7.5/10 (was 7.0 in hub)

**Classification: MODIFY**

**Rationale:**
1. **Largest functional module** — 61 endpoints, 7 sub-modules, 5,500+ LOC
2. **100% guard coverage** — only non-infra service where ALL controllers have both JwtAuthGuard AND RolesGuard
3. **Strong architecture** — clean umbrella pattern, proper sub-module separation
4. **2 P0 tenant isolation bugs** — load history service has 2 cross-tenant leakage vectors
5. **0% test coverage** — largest gap in the codebase by endpoint count
6. **Load Planner Quotes sub-module** — production quality, serves the 9/10 Load Planner frontend

**Score Breakdown:**

| Category | Score |
|----------|-------|
| Functionality | 8/10 — 61 endpoints working, dashboard sparklines incomplete |
| Security | 7/10 — 100% guard coverage, but 2 P0 tenant bugs |
| Code Quality | 7/10 — clean layers, some raw SQL, 1 monolithic service |
| Testing | 0/10 — zero tests |
| Architecture | 9/10 — best umbrella module pattern in codebase |
| Documentation | 6/10 — hub sparse, Swagger present |

### Action Items: 8

| # | Priority | Action | Owner |
|---|----------|--------|-------|
| 1 | P0 | Fix tenantId in LoadHistoryService.getByCarrier() | Backend |
| 2 | P0 | Fix tenantId in LoadHistoryService.getSimilarLoads() | Backend |
| 3 | P1 | Add test coverage (target: carriers, load-history, load-planner-quotes) | Backend |
| 4 | P2 | Implement dashboard sparklines | Backend |
| 5 | P2 | Fix equipment silent failures — throw instead of return [] | Backend |
| 6 | P2 | Consolidate equipment table names (remove fallback) | Backend |
| 7 | Low | Update hub with endpoint counts, test status, security findings | Docs |
| 8 | Low | Consider splitting LoadPlannerQuotesService (845 LOC) | Backend |

### Cross-Cutting Patterns: 1

- **Tenant isolation in analytics queries** — same pattern as Search (PST-22), Load History omits tenantId in aggregate/lookup queries. Cross-cutting fix needed: audit ALL analytics/lookup methods across all services for tenantId enforcement.

---

## Metrics

| Metric | Value |
|--------|-------|
| Backend LOC | ~5,500+ |
| Sub-Modules | 7 |
| Controllers | 7 |
| Endpoints | 61 |
| Prisma Models (owned) | 10+ |
| Test Files | 0 |
| Test Cases | 0 |
| P0 Bugs | 2 |
| P1 Bugs | 1 |
| P2 Bugs | 3 |
| Hub Accuracy | ~70% |
| Score Delta | +0.5 |
| Verdict | MODIFY |
