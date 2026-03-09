# PST-05: TMS Core (Orders, Loads, Dispatch) — Per-Service Tribunal

> **Audit Date:** 2026-03-08
> **Hub File:** `dev_docs_v3/01-services/p0-mvp/05-tms-core.md`
> **Auditor:** Claude Code (Opus 4.6)
> **Previous PST:** PST-02 Dashboard (MODIFY, 8.5/10)

---

## Phase 1: Hub File Verification

### 1A. Status Box Accuracy

| Field | Hub Claim | Actual | Verdict |
|-------|-----------|--------|---------|
| Health Score | A- Backend (9/10) / B Frontend (7.4/10) / Overall B+ (8/10) | See verdict | REASSESSED BELOW |
| Backend | Production — 65 endpoints, fully tested, multi-tenant validated | **51 endpoints** across 5 controllers. Tenant isolation 100%. Soft delete 100%. Auth guards 100%. | **STALE** — overcounted by 14 endpoints |
| Frontend | Built — 12 of 14 screens (10 real, 2 wrapper-stubs) | **12 pages verified**, all exist under `app/(dashboard)/operations/`. Average quality 7.75/10 | **ACCURATE** |
| Tests | Backend: Tested. Frontend: None | **16 frontend test files** exist in `__tests__/tms/`. Backend tests exist. | **FALSE** — frontend tests exist |
| Revenue Impact | CRITICAL | CRITICAL — confirmed | **ACCURATE** |

### 1B. Implementation Status — Layer by Layer

| Layer | Hub Claim | Actual Finding | Verdict |
|-------|-----------|----------------|---------|
| Backend — Orders | Production, 18 endpoints | **19 endpoints** (10 match hub, 8 documented don't exist, 9 undocumented exist) | **STALE** — wrong endpoint list |
| Backend — Loads | Production, 22 endpoints | **15 endpoints** (11 match, 11 documented don't exist, 4 undocumented exist) | **STALE** — overcounted by 7 |
| Backend — Stops | Production, 10 endpoints | **8 endpoints** — NESTED under `/orders/:orderId/stops/`, NOT top-level `/stops/` | **WRONG ROUTING** |
| Backend — Check Calls | Production, 8 endpoints | **2 endpoints** — NESTED under `/loads/:id/check-calls`, NO standalone controller | **ARCHITECTURE MISMATCH** |
| Backend — Dashboard | Production, 5 endpoints | **5 endpoints** — exact match | **ACCURATE** |
| Backend — Tracking | Production, 2 endpoints | **2 endpoints** — exact match | **ACCURATE** |
| Frontend Pages | 12 of 14 built | **12 pages verified**, all functional | **ACCURATE** |
| React Hooks | 10 hooks, all use unwrap() | **10 hooks exist**, 3 different envelope patterns (not all use unwrap()) | **PARTIALLY STALE** |
| Components | ~95 components in components/tms/ | Verified — substantial component library | **ACCURATE** |
| WebSocket Gateways | Not Built | Frontend handlers READY (dispatch-ws 526 LOC, tracking hooks wired). Backend gateway missing. | **ACCURATE** — backend not built |
| Tests (Frontend) | Not Built | **16 test files** in `__tests__/tms/` | **FALSE** |

### 1C. Screen Verification

| Screen | Hub Route | Hub Quality | Actual Quality | Verdict |
|--------|-----------|-------------|----------------|---------|
| Operations Dashboard | `/operations` | 8/10 | 8/10 — 189 LOC, WebSocket via SocketProvider, role-based scope, 6 widgets | **ACCURATE** |
| Orders List | `/operations/orders` | 7/10 | 7/10 — 165 LOC, stats, pagination, search, filters. Delete is no-op. Status change uses `as any`. | **ACCURATE** |
| Order Detail | `/operations/orders/[id]` | 8/10 | 8/10 — 114 LOC, 6 tabs with dynamic counts, edit button works | **ACCURATE** |
| New Order Form | `/operations/orders/new` | 6/10 (wrapper) | 6/10 — 13 LOC thin wrapper, delegates to OrderForm | **ACCURATE** |
| Edit Order Form | `/operations/orders/[id]/edit` | 9/10 | 9/10 — 180 LOC, Prisma Decimal conversion, complex form mapping, proper error states | **ACCURATE** |
| Loads List | `/operations/loads` | 8/10 | 8/10 — 147 LOC, KPI cards, filter bar, data table, row-click drawer | **ACCURATE** |
| Load Detail | `/operations/loads/[id]` | 7/10 (wrapper) | 7/10 — 6 LOC server + 120 LOC client, 5 tabs, tab persistence in URL hash | **ACCURATE** |
| New Load Form | `/operations/loads/new` | 8/10 | 8/10 — 120 LOC, optional orderId pre-fill, stop mapping, hazmat conditional fields | **ACCURATE** |
| Edit Load Form | `/operations/loads/[id]/edit` | 9/10 | 9/10 — 160 LOC, Decimal conversion, stop data mapping with fallback logic, status restrictions | **ACCURATE** |
| Dispatch Board | `/operations/dispatch` | 5/10 (wrapper) | 5/10 page / **8/10 actual** — 29 LOC wrapper + 200+ LOC DispatchBoard component with kanban, filters, WebSocket, optimistic updates | **UNDERRATED** — actual implementation is substantial |
| Tracking Map | `/operations/tracking` | 5/10 (wrapper) | 5/10 page / **8/10 actual** — 33 LOC wrapper + 400+ LOC TrackingMap with Google Maps, real-time positions, color-coded markers | **UNDERRATED** — actual implementation is substantial |
| Rate Confirmation | `/operations/loads/[id]/rate-con` | 9/10 | 9/10 — 232 LOC, options panel, load summary, preview, Generate/Download/Email, blob cleanup | **ACCURATE** |

**Screen Scores Summary:** Hub quality scores are mostly accurate. Only Dispatch Board and Tracking Map are underrated — their page.tsx files are thin wrappers but the actual component implementations are 8/10.

---

## Phase 2: Data Model Verification

### CRITICAL FINDINGS — Hub Section 8 Needs Complete Rewrite

| Model | Hub Accuracy | Key Errors |
|-------|-------------|------------|
| **Order** | 40% correct | Missing 9+ real fields (customerReference, poNumber, bolNumber, commodity, weightLbs, pieceCount, equipmentType, isHazmat, specialInstructions). `revenue`/`cost`/`margin` documented but DON'T EXIST in schema (calculated). `status` is String not enum. `createdBy` should be `createdById`. |
| **Load** | 25% correct | Missing 30+ real fields (driverName, driverPhone, truckNumber, carrierRate, currentLocationLat/Lng, eta, rateConfirmationSent, dispatchedAt, pickedUpAt, deliveredAt). `driverId` FK doesn't exist (uses driverName/driverPhone strings). `weight` field doesn't exist. `trackingEvents[]` is PHANTOM. |
| **Stop** | 35% correct | `address` is NOT Json — denormalized into 10 separate fields (facilityName, addressLine1, city, state, postalCode, latitude, longitude, etc.). `scheduledAt` doesn't exist. `freeTimeHrs` doesn't exist. `detention` doesn't exist. `sequence` should be `stopSequence`. Missing `orderId` FK, appointment fields. |
| **CheckCall** | 20% correct | `type` field DOESN'T EXIST. `message` field DOESN'T EXIST (has `notes` instead). `lat`/`lng` should be `latitude`/`longitude`. Missing fields: city, state, status, contacted, contactMethod, milesRemaining, source, deletedAt. |
| **TrackingEvent** | **PHANTOM MODEL** | Does NOT exist anywhere in the Prisma schema. Tracking data is stored on Load model (currentLocationLat/Lng) and CheckCall. |

### Enum Analysis

| Hub Claims | Reality | Impact |
|-----------|---------|--------|
| OrderStatus enum (9 values) | `String @db.VarChar(30)` — no enum | LOW — validation in DTOs |
| LoadStatus enum (12 values) | `String @db.VarChar(30)` — no enum | LOW — validation in DTOs |
| StopType enum (3 values) | `String @db.VarChar(20)` — no enum | LOW — validation in DTOs |
| StopStatus enum (4 values) | `String @db.VarChar(20)` — no enum | LOW — validation in DTOs |
| CheckCallType enum (6 values) | **Field doesn't exist** | HIGH — phantom enum for phantom field |
| EquipmentType enum | String field — no enum | LOW — validation in DTOs |

**Root Cause:** Hub data model was written from a logical design spec, not the actual Prisma schema. All "enums" are application-enforced via DTOs, not database-enforced.

---

## Phase 3: API Endpoint Verification

### Endpoint Count Reconciliation

| Service | Hub Claims | Actual | Match Rate | Key Discrepancies |
|---------|-----------|--------|------------|-------------------|
| Orders | 18 | 19 | 53% match | 8 phantom endpoints (documents, notes, stats, audit, bulk-status, export, PATCH). 9 undocumented real endpoints (cancel, history, from-template, items CRUD, stops, create-load-for-order). |
| Loads | 22 | 15 | 50% match | 11 phantom endpoints (tender, accept, reject, documents, timeline, notes, export, audit, PATCH, stops, check-calls-GET). 4 undocumented (board view, assign-carrier, assign PATCH, location update). |
| Stops | 10 | 8 | 40% match | **ROUTING WRONG**: Hub says `/api/v1/stops/:id`, actual is `/orders/:orderId/stops/:id`. Hub says PATCH arrive/depart, actual is POST. Missing: status PATCH, detention endpoint. |
| Check Calls | 8 | 2 | 0% match | **ARCHITECTURE WRONG**: Hub documents 8 standalone endpoints. Reality: 2 nested endpoints under `/loads/:id/check-calls`. No standalone CheckCalls controller exists. |
| Dashboard | 5 | 5 | 100% | Perfect match |
| Tracking | 2 | 2 | 100% | Perfect match (minor path differences) |
| **TOTAL** | **65** | **51** | **78%** | **14 endpoints overcounted** |

### Security Audit (Backend)

| Check | Status | Evidence |
|-------|--------|---------|
| Tenant Isolation | **100% VERIFIED** | All 39 database queries filter by tenantId |
| Soft Delete | **100% VERIFIED** | All 37 list/detail queries filter `deletedAt: null` |
| Auth Guards | **100% VERIFIED** | `@UseGuards(JwtAuthGuard)` on all controllers |
| Role Guards | **PARTIAL** | Some endpoints have `@Roles()` (stats, rate-con, templates), most don't |

**Backend Security Verdict: STRONG (9.5/10).** No cross-tenant access possible. All deletes are soft. All routes authenticated.

---

## Phase 4: Hooks & Known Issues Verification

### Hook Quality Assessment

| Hook | LOC | Envelope Pattern | Quality |
|------|-----|-----------------|---------|
| use-orders.ts | 228 | ✅ `unwrap()` helper | 9/10 |
| use-loads.ts | 377 | ⚠️ Mixed (unwrap + manual destructure) | 8/10 |
| use-stops.ts | 271 | ✅ `unwrap()` helper | 8/10 |
| use-checkcalls.ts | 167 | ⚠️ Manual unwrap + 11 field fallbacks | 6/10 — fragile |
| use-dispatch.ts | 612 | ✅ `unwrap()` helper | 9/10 — sophisticated |
| use-dispatch-ws.ts | 526 | N/A (WebSocket) | 7/10 |
| use-tracking.ts | 273 | ✅ `unwrap()` helper | 7/10 |
| use-ops-dashboard.ts | 276 | ✅ `unwrap()` helper | 8/10 |
| use-load-board.ts | 62 | ✅ `unwrap()` helper | 7/10 |
| use-rate-confirmation.ts | 121 | N/A (PDF blob) | 8/10 |

**Cross-cutting: 3 envelope unwrap patterns detected** (standard unwrap, manual destructure, hybrid reshape). Hub claims all use `unwrap()` — FALSE for 2 hooks.

**use-checkcalls.ts is FRAGILE:** 11 field name fallback chains (e.g., `cc.type ?? cc.status`, `cc.locationDescription ?? cc.location`, `cc.latitude ?? cc.lat`). Will break silently if backend changes field names.

### Known Issues Verification

| # | Issue | Hub Status | Actual Status | Verdict |
|---|-------|-----------|---------------|---------|
| 1 | WebSocket gateways not implemented | Open | **Frontend READY** (dispatch-ws 526 LOC, tracking hooks, dashboard hooks all wired). Backend gateway missing. | **ACCURATE** — backend blocker |
| 2 | Loads list title says "Dispatch Board" | Open | Unable to independently verify text content (agents disagree) | **NEEDS RUNTIME VERIFICATION** |
| 3 | Orders list delete is no-op | Open | **CONFIRMED** — `toast.info("Delete not available yet")` | **ACCURATE** |
| 4 | Orders list bulk actions missing | Open | Row selection state exists, no bulk action buttons | **ACCURATE** |
| 5 | Dispatch/Tracking thin wrappers | Open | **FALSE** — page.tsx files are thin, but actual implementations are 200-400+ LOC with kanban, maps, real-time, optimistic updates | **MISLEADING** — components are substantial |
| 6 | Column visibility not persisted | Open | No localStorage or Zustand persistence found | **ACCURATE** |
| 7 | `as any` type assertions | Open | Confirmed in orders page: `formData: {} as any`, `status: newStatus as any` | **ACCURATE** |
| 8 | Soft delete missing on Order/Quote/Invoice/Settlement/Payment | Open | Order model in Prisma has `deletedAt` field. Other models need verification. | **PARTIALLY STALE** — Order has it |
| 9 | No tests for frontend TMS screens | Open | **16 test files exist** in `__tests__/tms/` (check-call, dispatch-board, dispatch-drag-drop, dispatch-realtime, load-detail, load-form, loads-list, order-detail, order-form, orders-list, public-tracking, rate-confirmation, stop-management, tracking-map + 2 regression) | **FALSE** — tests exist |
| 10 | Check Call Form needs RHF refactor | Open | **CONFIRMED** — uses `useState` + manual validation, not React Hook Form | **ACCURATE** |

---

## Phase 5: Tribunal Verdict

### Score Assessment

| Dimension | Hub Score | Verified Score | Delta | Notes |
|-----------|----------|---------------|-------|-------|
| Backend Quality | 9/10 | **9/10** | 0 | Tenant isolation, soft delete, auth all 100%. Security is excellent. |
| Backend Completeness | 9/10 (65 endpoints) | **7.5/10** (51 endpoints) | -1.5 | 14 fewer endpoints than claimed. Missing tender/accept/reject workflow. CheckCalls architecture wrong. |
| Frontend Quality | 7.4/10 | **7.75/10** | +0.35 | Average across 12 pages. Dispatch + Tracking underrated. |
| Data Model Docs | 9/10 (implied) | **3/10** | -6.0 | 5 models documented, 4 have 60-80% field errors, 1 is phantom. |
| Known Issues Accuracy | — | **5/10** | — | 6 accurate, 2 false (tests exist, dispatch/tracking aren't thin), 1 partially stale, 1 needs verification |
| Test Coverage | 0/10 (claimed none) | **6/10** | +6.0 | 16 frontend test files exist |

### Overall Health Score

| Hub Score | Verified Score | Delta |
|-----------|---------------|-------|
| B+ (8/10) | **B+ (7.8/10)** | -0.2 |

**The overall score is nearly accurate**, but for wrong reasons. Backend is slightly overcredited (fewer endpoints), frontend is slightly undercredited (tests exist, dispatch/tracking are substantial), and the data model documentation is catastrophically wrong.

### Verdict: **MODIFY**

The service implementation is strong — backend security is excellent, frontend pages all exist and work, hooks are well-structured. But the hub documentation has critical errors:

1. **Data model section is ~30% accurate** — needs complete rewrite from Prisma schema
2. **Endpoint count inflated by 27%** (65 → 51)
3. **CheckCalls architecture documented backwards** (standalone vs nested)
4. **Stops routing documented wrong** (top-level vs nested under orders)
5. **"No tests" claim is false** — 16 test files exist
6. **TrackingEvent model is phantom** — doesn't exist in schema
7. **"Thin wrapper" characterization misleading** for Dispatch/Tracking

---

## Action Items

| # | Action | Priority | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | **Rewrite hub Section 8 (Data Model)** — all 5 models have 60-80% field errors, TrackingEvent is phantom. Rewrite from actual Prisma schema. | P0 | 3-4h | Claude Code |
| 2 | **Rewrite hub Section 4 (API Endpoints)** — 14 phantom endpoints, 13 undocumented real endpoints. Update routing for Stops (nested under orders) and CheckCalls (nested under loads). | P0 | 2-3h | Claude Code |
| 3 | **Update hub Section 11 (Known Issues)** — close #9 (tests exist), update #5 (dispatch/tracking not thin), update #8 (Order has deletedAt). | P0 | 30min | Claude Code |
| 4 | **Update hub "Tests" line** in Status Box and Section 2 — 16 frontend tests exist, not zero. | P0 | 15min | Claude Code |
| 5 | **Wire Orders delete handler** — currently no-op toast. Implement `useDeleteOrder` hook and connect. | P1 | 1-2h | Any |
| 6 | **Fix Orders status change** — `formData: {} as any` passed to mutation. Needs proper type mapping. | P1 | 1h | Any |
| 7 | **Add Orders bulk action buttons** — row selection exists, buttons don't. | P1 | 2h | Any |
| 8 | **Refactor use-checkcalls.ts** — 11 field name fallback chains are fragile. Align to actual backend field names. | P1 | 1h | Any |
| 9 | **Implement missing Load state transitions** — tender, accept, reject endpoints not built. These are needed for carrier workflow. | P1 | 4-6h | Claude Code |
| 10 | **Document enum strategy** — add note explaining enums are DTO-enforced (String fields), not DB-enforced. | P2 | 15min | Claude Code |
| 11 | **Persist column visibility** — loads list column settings reset on navigation. Add localStorage or Zustand. | P2 | 1h | Any |
| 12 | **Standardize envelope unwrap** — 3 patterns across 10 hooks. Should all use `unwrap()`. | P2 | 2h | Any |

### New Tasks Generated

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| TMS-016 | Wire Orders delete to API (currently no-op toast) | S (1h) | P1 |
| TMS-017 | Fix Orders status change type assertions | S (1h) | P1 |
| TMS-018 | Implement Load tender/accept/reject endpoints | L (4-6h) | P1 |
| TMS-019 | Refactor use-checkcalls.ts field mapping (11 fallbacks) | S (1h) | P1 |
| TMS-020 | Rewrite hub data model section from Prisma schema | M (3-4h) | P0 |
| TMS-021 | Rewrite hub API endpoints section (51 actual vs 65 claimed) | M (2-3h) | P0 |

---

## Cross-Cutting Findings (Systemic)

### Confirmed Systemic Patterns (seen in 5/5 services now)

1. **Hub data models written from specs, not schema** — Every service audited so far has 10-30+ field errors in Section 8. This is the single most unreliable section across all hubs.

2. **Envelope unwrap inconsistency** — Now confirmed in TMS Core (3 patterns in 10 hooks). PST-04 found the same. This is a codebase-wide issue, not per-service.

3. **Hub screen quality scores reasonably accurate** — Unlike previous services where scores were off by 4-5 points, TMS Core scores are mostly correct. Exception: Dispatch Board and Tracking Map component quality (8/10) doesn't match page wrapper score (5/10).

4. **"No tests" claims are systematically wrong** — PST-04 and PST-05 both found tests that the hub claimed don't exist. Future audits should always verify test claims.

5. **Backend security consistently strong** — 5/5 services have 100% tenant isolation and soft delete enforcement. This is a genuine strength of the codebase.

### New Systemic Finding

6. **Nested resource routing not reflected in hub** — Stops are `/orders/:orderId/stops/`, CheckCalls are `/loads/:id/check-calls`. Hub documents them as top-level resources. This pattern may affect other services (e.g., Documents, Notes).
