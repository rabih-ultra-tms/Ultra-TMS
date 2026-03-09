# Service Hub: Operations Sub-Modules (38)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-38 tribunal)
> **Priority:** P-Infra (umbrella module) — sub-modules are business-critical P0 code
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-38-operations.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B+ (7.5/10) — 61 endpoints, 100% guard coverage, 2 P0 tenant bugs |
| **Confidence** | High — code-verified via PST-38 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — `apps/api/src/modules/operations/` with 7 sub-modules, 61 endpoints, ~5,500+ LOC |
| **Frontend** | Production — pages live under TMS Core (Service 05), 13+ pages consume these endpoints |
| **Tests** | None — 0 spec files, 0% coverage on 61 endpoints (largest untested module by endpoint count) |
| **Note** | OperationsModule (33 LOC) is an umbrella — imports/exports 7 sub-modules that power TMS Core, Sales, and Carrier Management frontends. |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Umbrella module with 7 sub-modules |
| Backend Controllers | Production | 7 controllers, 61 endpoints, all auth-guarded |
| Prisma Models | 10+ owned | OperationsCarrier, LoadPlannerQuote, LoadHistory, TruckType, etc. |
| Frontend Pages | Production | 13+ pages across TMS Core, Sales, Carriers |
| Tests | None | 0% coverage — P1 to add tests for carriers, load-history, load-planner-quotes |
| Security | Strong (with gaps) | 100% JwtAuthGuard + RolesGuard on all 7 controllers; 2 P0 tenant bugs in LoadHistory |

---

## 3. Architecture — Umbrella Module Pattern

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

---

## 4. Sub-Modules

| Sub-Module | Path | Endpoints | Purpose |
|------------|------|-----------|---------|
| carriers | `operations/carriers/` | 21 | Carrier operations (distinct from Carrier Management module) |
| dashboard | `operations/dashboard/` | 5 | Operations dashboard KPIs, charts, alerts, activity |
| equipment | `operations/equipment/` | 8 | Equipment/trailer management (makes, models, types) |
| inland-service-types | `operations/inland-service-types/` | 1 | Inland service type definitions (global catalog) |
| load-history | `operations/load-history/` | 8 | Historical load data, lane statistics, similar loads |
| load-planner-quotes | `operations/load-planner-quotes/` | 11 | Load Planner quote CRUD (6 nested entities in transactions) |
| truck-types | `operations/truck-types/` | 7 | Truck type definitions (PROTECTED: 8/10 frontend) |

---

## 5. API Endpoints (61 total)

### Carriers (21 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| (21 endpoints) | `/api/v1/operations/carriers/*` | Production | Full CRUD + search, JwtAuthGuard + RolesGuard class-level, @Roles per-method, tenantId on all queries |

### Dashboard (5 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/operations/dashboard` | Production | KPI data (role-aware, period + scope + comparison params) |
| GET | `/api/v1/operations/dashboard/charts` | Production | Loads by status + revenue trend |
| GET | `/api/v1/operations/dashboard/alerts` | Production | Active alerts |
| GET | `/api/v1/operations/dashboard/activity` | Production | Recent activity feed |
| GET | `/api/v1/operations/dashboard/needs-attention` | Production | Loads needing attention |

### Equipment (8 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| (8 endpoints) | `/api/v1/operations/equipment/*` | Production | Makes, models, types; uses raw SQL with table fallback |

### Inland Service Types (1 endpoint)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/operations/inland-service-types` | Production | Global catalog (no tenantId needed, isActive only) |

### Load History (8 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| (8 endpoints) | `/api/v1/operations/load-history/*` | Production | **P0: getByCarrier() + getSimilarLoads() missing tenantId** |

### Load Planner Quotes (11 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| (11 endpoints) | `/api/v1/operations/load-planner-quotes/*` | Production | Full CRUD + cargo items, trucks, services, accessorials, permits; 6 nested entities in transaction |

### Truck Types (7 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| (7 endpoints) | `/api/v1/operations/truck-types/*` | Production | CRUD + restore (soft-delete with undo), @Roles on write-only |

---

## 6. Security Analysis

### Guard Coverage: 100% (7/7 controllers)

| Sub-Module | JwtAuthGuard | RolesGuard | @Roles |
|-----------|-------------|------------|--------|
| Carriers | class-level | class-level | per-method |
| Dashboard | class-level | class-level | none |
| Equipment | class-level | class-level | none |
| Inland Service Types | class-level | class-level | none |
| Load History | class-level | class-level | per-method |
| Load Planner Quotes | class-level | class-level | per-method |
| Truck Types | class-level | write-only | write-only |

**NOTABLE:** Only non-infra service with 100% JwtAuthGuard + RolesGuard on ALL controllers.

### Tenant Isolation

| Sub-Module | tenantId Filtering | Gaps |
|------------|-------------------|------|
| Carriers | All methods | None |
| Dashboard | All methods | None |
| Equipment | Raw SQL | Unclear — raw SQL with table fallback |
| Inland Service Types | None needed | Global catalog (isActive only) |
| Load History | **2 gaps** | **P0: getByCarrier() + getSimilarLoads() missing tenantId** |
| Load Planner Quotes | All methods | None |
| Truck Types | None needed | Global catalog |

### Soft-Delete Compliance

| Sub-Module | deletedAt Filtering | Gaps |
|------------|-------------------|------|
| Carriers | All queries | None (uses isActive + deletedAt) |
| Dashboard | All queries | None |
| Equipment | N/A | Raw SQL, no soft-delete |
| Inland Service Types | isActive | None |
| Load History | Most queries | getByCarrier/getSimilarLoads may skip |
| Load Planner Quotes | All queries | None |
| Truck Types | All + restore | None (has restore endpoint) |

---

## 7. Data Model

### Prisma Models Owned (10+)

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

### Global Catalogs Consumed

- TruckType
- InlandServiceType
- LoadHistory (has own Prisma model)

---

## 8. Business Rules

1. **Umbrella Pattern:** OperationsModule (33 LOC) is purely structural — imports/exports 7 sub-modules. No controllers or services of its own.
2. **Load Planner Quotes:** Transactional creation with 6 nested entities (quote + cargo items + trucks + services + accessorials + permits). Serves the 9/10 Load Planner frontend.
3. **Truck Types PROTECTED:** Frontend rated 8/10 (gold standard CRUD). Do not modify truck-types endpoints without frontend review.
4. **Equipment Table Fallback:** `queryWithTableFallback()` tries `makes` then `equipment_makes`, returns `[]` on error. Silent failure pattern — incomplete migration.
5. **Dashboard Sparklines:** `getKPIs()` returns empty arrays `[]` for all 6 sparkline fields. Feature incomplete but KPI numbers are real.
6. **Global Catalogs:** InlandServiceTypes and TruckTypes are tenant-agnostic — filter by `isActive` only, no tenantId needed.

---

## 9. Relationship to P0 Services

These sub-modules provide backend endpoints consumed by:
- **TMS Core (05):** Operations dashboard, load history, equipment
- **Sales & Quotes (04):** Load Planner quotes (11 endpoints, 845 LOC service)
- **Carrier Management (06):** Carriers (21 endpoints), truck types, equipment

The frontend pages for these sub-modules are documented in their respective P0 service hubs.

---

## 10. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| `getByCarrier()` missing tenantId | **P0 BUG** | **Open** | load-history.service.ts:~259 — cross-tenant load history leakage |
| `getSimilarLoads()` missing tenantId | **P0 BUG** | **Open** | load-history.service.ts:~289 — cross-tenant similar loads leakage |
| 0% test coverage on 61 endpoints | P1 | Open | Largest untested module by endpoint count |
| Dashboard sparklines return empty arrays | P2 | Open | dashboard.service.ts:207-214 — cosmetic, incomplete feature |
| Equipment silent failure on query | P2 | Open | equipment.service.ts:53 — returns [] instead of throwing |
| Equipment raw SQL + table fallback | P2 | Open | Suggests incomplete migration, dual table names |
| LoadPlannerQuotesService is 845 LOC | Info | Open | Monolithic — consider splitting |
| Dashboard @Roles missing | Info | Open | Any authenticated user can see any dashboard data |

---

## 11. Tasks

### Open (from PST-38 tribunal findings)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| OPS-001 | Fix tenantId in LoadHistoryService.getByCarrier() | XS (30min) | **P0** |
| OPS-002 | Fix tenantId in LoadHistoryService.getSimilarLoads() | XS (30min) | **P0** |
| OPS-003 | Add test coverage (carriers, load-history, load-planner-quotes) | L (8h) | P1 |
| OPS-004 | Implement dashboard sparklines | M (3h) | P2 |
| OPS-005 | Fix equipment silent failures — throw instead of return [] | S (1h) | P2 |
| OPS-006 | Consolidate equipment table names (remove fallback) | S (1h) | P2 |
| OPS-007 | Consider splitting LoadPlannerQuotesService (845 LOC) | M (3h) | Low |

---

## 12. Score Breakdown (PST-38 Tribunal)

| Category | Score |
|----------|-------|
| Functionality | 8/10 — 61 endpoints working, dashboard sparklines incomplete |
| Security | 7/10 — 100% guard coverage, but 2 P0 tenant bugs |
| Code Quality | 7/10 — clean layers, some raw SQL, 1 monolithic service |
| Testing | 0/10 — zero tests |
| Architecture | 9/10 — best umbrella module pattern in codebase |
| Documentation | 6/10 — hub was sparse, Swagger present |
| **Overall** | **7.5/10** |

---

## 13. Cross-Cutting Patterns

- **Tenant isolation in analytics queries** — same pattern as Search (PST-22). LoadHistory omits tenantId in aggregate/lookup queries. Cross-cutting fix needed: audit ALL analytics/lookup methods across all services for tenantId enforcement.

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Hub listed 7 sub-modules, no detail | 61 endpoints across 7 controllers, fully documented | Hub was a stub |
| Health Score 7/10 | 7.5/10 verified by PST-38 tribunal | +0.5 — strong guards offset by 2 P0 bugs |
| No endpoint counts | 61 endpoints cataloged | Largest functional module by endpoint count |
| No security analysis | 100% guard coverage documented, 2 P0 tenant bugs found | First full security audit |
| No test status | 0% confirmed — largest untested module | Gap identified |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT authentication, role guards)
- Prisma models (Load, Carrier, Equipment, TruckType, LoadHistory, LoadPlannerQuote)

**Depended on by:**
- TMS Core (05) — operations dashboard, load history
- Sales & Quotes (04) — load planner quotes
- Carrier Management (06) — carriers, equipment, truck types
- Command Center (39) — will consume operations dashboard + load history endpoints
