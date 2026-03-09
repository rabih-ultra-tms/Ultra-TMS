# PST-23: HR — Per-Service Tribunal Verdict

> **Date:** 2026-03-09 | **Auditor:** Claude Opus 4.6
> **Verdict:** MODIFY | **Health Score:** 7.0/10 (was 2.0/10, +5.0)
> **Batch:** 5 (P3 Future) — Service 1/10

---

## Phase 1: Endpoint Inventory

**Total: 35 endpoints across 6 controllers (hub: ~35 — 11th PERFECT MATCH)**

| Controller | Prefix | Actual | Hub | Delta |
|------------|--------|--------|-----|-------|
| EmployeesController | `/hr/employees` | 8 | ~8 | 0 |
| DepartmentsController | `/hr/departments` | 5 | ~5 | 0 |
| PositionsController | `/hr/positions` | 5 | ~5 | 0 |
| LocationsController | `/hr/locations` | 5 | ~5 | 0 |
| TimeOffController | `/hr/time-off` | 7 | ~6 | +1 |
| TimeEntriesController | `/hr/time-entries` | 5 | ~6 | -1 |

### Employees (8 endpoints)
- `GET /` — list employees
- `POST /` — create employee
- `GET /:id` — get employee by ID
- `PUT /:id` — update employee
- `DELETE /:id` — soft delete employee
- `GET /:id/org-chart` — get org chart for employee
- `POST /:id/terminate` — terminate employee
- `GET /:id/history` — get employment history

### Departments (5 endpoints) — standard CRUD

### Positions (5 endpoints) — standard CRUD

### Locations (5 endpoints) — standard CRUD

### Time Off (7 endpoints)
- `GET /balances` — list time-off balances (**undocumented in hub**)
- `GET /requests` — list requests
- `POST /requests` — create request
- `GET /requests/:id` — get request
- `PUT /requests/:id` — update request
- `POST /requests/:id/approve` — approve (MANAGER+)
- `POST /requests/:id/deny` — deny (MANAGER+)

### Time Entries (5 endpoints)
- `GET /` — list entries
- `POST /` — create entry
- `PUT /:id` — update entry
- `POST /:id/approve` — approve (MANAGER+)
- `GET /summary` — aggregated summary (**undocumented in hub**)

**Path accuracy: ~100%** — all endpoint paths match hub documentation.

---

## Phase 2: Data Model Verification

### Prisma Models: 10 actual vs 6 documented (4 missing)

| Model | Hub? | Fields (Actual) | Hub Accuracy |
|-------|------|-----------------|--------------|
| Employee | ✓ | 29 | ~55% |
| Department | ✓ | 15 | ~50% |
| Position | ✓ | 15 | ~55% |
| Location | ✓ | 18 | ~40% |
| TimeEntry | ✓ | 17 | ~35% |
| TimeOffRequest | ✓ | 17 | ~55% |
| **TimeOffBalance** | ✗ MISSING | 13 | — |
| **EmploymentHistory** | ✗ MISSING | 14 | — |
| **OnboardingChecklist** | ✗ MISSING | 13 | — |
| **OnboardingTask** | ✗ MISSING | 14 | — |

**Overall data model accuracy: ~48%** — hub section substantially wrong.

### Key Naming Mismatches

| Hub Name | Actual Prisma Name | Impact |
|----------|-------------------|--------|
| `EmployeeType` (enum) | `EmploymentType` | Wrong name |
| `EmployeeStatus` (enum) | `EmploymentStatus` | Wrong name |
| `SEASONAL` (enum value) | `TEMP` | Different value |
| `ONBOARDING` (status value) | NOT IN ENUM | Phantom value |
| `salary` (field) | `annualSalary` | Wrong name |
| `payFrequency` (field) | NOT IN PRISMA | Phantom field |
| `breakMinutes` (TimeEntry) | NOT IN PRISMA | Phantom field |
| `totalHours` (TimeEntry) | `durationHours` | Wrong name |
| `isOvertime` (TimeEntry) | NOT IN PRISMA | Phantom field |
| `TimeEntryStatus` (enum) | NOT IN PRISMA | Phantom enum |
| `zipCode` (Location) | `zip` | Wrong name |
| `BEREAVEMENT` (TimeOffType) | `FLOATING_HOLIDAY` | Different value |
| `JURY_DUTY` (TimeOffType) | NOT IN ENUM | Phantom value |
| `PERSONAL` (TimeOffType) | `PERSONAL` | ✓ Correct |

### Enums (Actual)

| Enum | Values |
|------|--------|
| `EmploymentType` | FULL_TIME, PART_TIME, CONTRACT, TEMP |
| `EmploymentStatus` | ACTIVE, ON_LEAVE, TERMINATED |
| `TimeOffRequestStatus` | PENDING, APPROVED, DENIED, CANCELLED |
| `TimeOffType` | PTO, SICK, VACATION, PERSONAL, FLOATING_HOLIDAY |
| `ChangeReason` | PROMOTION, TRANSFER, SALARY_ADJUSTMENT, DEMOTION, DEPARTMENT_RESTRUCTURE, OTHER |

Hub claims Employee has ONBOARDING status — **FALSE** (only 3 states: ACTIVE, ON_LEAVE, TERMINATED).

### Missing Models Detail

**TimeOffBalance** (13 fields) — tracks per-employee, per-type, per-year balance. Has @@unique([employeeId, timeOffType, year]). BalanceService implements upsert-based balance management with pending/used tracking.

**EmploymentHistory** (14 fields) — tracks position/department changes with ChangeReason enum. Used by `employees.service.history()`.

**OnboardingChecklist** (13 fields) — position-linked checklist templates. No API controllers exist.

**OnboardingTask** (14 fields) — individual onboarding tasks with due dates and completion tracking. No API controllers exist.

---

## Phase 3: Security Audit

| Controller | JwtAuthGuard | RolesGuard | @Roles | Tenant Isolation |
|------------|-------------|------------|--------|-----------------|
| EmployeesController | ✓ | ✗ | ✓ (decorative) | ✓ |
| DepartmentsController | ✓ | ✗ | ✓ (decorative) | ✓ |
| PositionsController | ✓ | ✗ | ✓ (decorative) | ✓ |
| LocationsController | ✓ | ✗ | ✓ (decorative) | ✓ |
| TimeOffController | ✓ | ✗ | ✓ (decorative) | ✓ |
| TimeEntriesController | ✓ | ✗ | ✓ (decorative) | ✓ |

**JwtAuthGuard: 6/6 (100%)** — all controllers protected.
**RolesGuard: 0/6 (0%)** — @Roles decorator is decorative without RolesGuard in @UseGuards().
**Tenant isolation: 6/6 (100%)** — all services pass tenantId through, queries filter by tenantId.

Hub says "Security: Unknown" → Actually: JwtAuthGuard 100%, RolesGuard 0% (decorative @Roles), tenant isolation 100%.

---

## Phase 4: Soft Delete & Data Integrity

### CRITICAL: 3 Hard Delete Bugs

| Service | Method | Bug |
|---------|--------|-----|
| DepartmentsService | `remove()` | `prisma.department.delete()` — **HARD DELETE** |
| PositionsService | `remove()` | `prisma.position.delete()` — **HARD DELETE** |
| LocationsService | `remove()` | `prisma.location.delete()` — **HARD DELETE** |

Only `EmployeesService.remove()` correctly uses soft delete (`data: { deletedAt: new Date() }`).

### Soft Delete Filter Compliance

| Service | `deletedAt: null` filtered? | Impact |
|---------|---------------------------|--------|
| EmployeesService | ✓ (list, findOne) | Safe |
| DepartmentsService | ✗ | Returns deleted departments |
| PositionsService | ✗ | Returns deleted positions |
| LocationsService | ✗ | Returns deleted locations |
| TimeEntriesService | ✗ | Returns deleted time entries |
| TimeOffService (requests) | ✗ | Returns deleted requests |
| TimeOffBalanceService | ✗ | Returns deleted balances |

**Only 1/7 services filter deletedAt** — worst compliance rate of any service audited.

---

## Phase 5: Test Inventory

**48 tests across 7 spec files / 767 LOC** (hub claims "None" — 15th false "no tests" claim)

| Spec File | Tests | LOC |
|-----------|-------|-----|
| employees.service.spec.ts | 8 | 139 |
| departments.service.spec.ts | 5 | 80 |
| positions.service.spec.ts | 5 | 80 |
| locations.service.spec.ts | 5 | 71 |
| time-off.service.spec.ts | 13 | 226 |
| balance.service.spec.ts | 5 | 77 |
| time-entries.service.spec.ts | 7 | 94 |

Test quality: service-level unit tests with PrismaService mocks. TimeOff has best coverage (13 tests covering create, update, approve, deny, balance tracking).

---

## Undocumented Features

1. **TimeOffBalanceService** — separate service for PTO balance management (upsert, addPending, removePending, movePendingToUsed)
2. **Circular hierarchy detection** — validateManager() walks manager chain to prevent loops
3. **Employee number auto-generation** — `EMP-XXXXX` format, auto-incrementing
4. **EventEmitter events** — 6 events: `employee.created`, `employee.updated`, `employee.terminated`, `timeoff.requested`, `timeoff.approved`, `timeoff.denied`
5. **Org chart endpoint** — returns employee + direct reports
6. **Employment history endpoint** — returns EmploymentHistory records
7. **Time entry summary** — aggregated hours/count via Prisma aggregate
8. **OnboardingChecklist + OnboardingTask** — Prisma models exist with no API (future capability)
9. **Employee inline balances** — ptoBalance and sickBalance on Employee model (separate from TimeOffBalance)

---

## Hub Accuracy Assessment

| Section | Accuracy | Notes |
|---------|----------|-------|
| Endpoint count | ~100% | 35=35, 11th perfect match |
| Endpoint paths | ~100% | All paths correct |
| Model names | ~50% | 6/10 models documented, 3+ field name mismatches |
| Field accuracy | ~48% | Many phantom fields, wrong names |
| Enum values | ~60% | TEMP not SEASONAL, no ONBOARDING status, no BEREAVEMENT/JURY_DUTY |
| Tests | 0% | "None" — actually 48 tests / 7 spec files |
| Security | N/A | "Unknown" — actually JwtAuthGuard 100% |
| Frontend | 100% | "Not Built" confirmed correct |
| "Scaffolded" claim | WRONG | Full implementation with business logic |

**Overall hub accuracy: ~55%**

---

## Code Quality Assessment

| Aspect | Score | Notes |
|--------|-------|-------|
| Code organization | 8/10 | Clean sub-module structure, shared DTO file |
| Business logic | 7/10 | Balance tracking, hierarchy validation, approval workflows |
| Tenant isolation | 9/10 | All queries filter by tenantId |
| Error handling | 7/10 | NotFoundException, BadRequestException used correctly |
| Soft delete | 3/10 | 3 hard deletes, 6/7 missing deletedAt filter |
| Security | 5/10 | JwtAuthGuard ✓, RolesGuard missing (decorative) |
| Testing | 6/10 | 48 tests, reasonable coverage |
| Events | 7/10 | 6 EventEmitter events for key lifecycle actions |
| Documentation (Swagger) | 8/10 | ApiOperation, ApiTags, ApiParam on all endpoints |

**LOC breakdown:** 2,138 total (1,371 active code + 767 test code)

---

## Action Items

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Fix hard deletes in Departments, Positions, Locations (use `update({deletedAt})` not `delete()`) | P1 | S (1h) |
| 2 | Add `deletedAt: null` filter to all 6 non-Employee services | P1 | S (1h) |
| 3 | Add RolesGuard to @UseGuards on all 6 controllers | P1 | S (30m) |
| 4 | Document TimeOffBalance model in hub Section 8 | P2 | S (15m) |
| 5 | Document EmploymentHistory model in hub Section 8 | P2 | S (15m) |
| 6 | Document OnboardingChecklist + OnboardingTask models | P2 | S (15m) |
| 7 | Fix hub enum names (EmploymentType not EmployeeType, EmploymentStatus not EmployeeStatus) | P2 | S (15m) |
| 8 | Fix hub field names (annualSalary not salary, durationHours not totalHours, etc.) | P2 | S (30m) |
| 9 | Remove phantom fields from hub (breakMinutes, isOvertime, TimeEntryStatus, payFrequency) | P2 | S (15m) |
| 10 | Document 6 EventEmitter events | P3 | S (15m) |
| 11 | Document BalanceService as separate service | P3 | S (15m) |
| 12 | Add missing Employee email uniqueness per tenant (@@unique constraint) | P2 | S (30m) |
| 13 | Employee.employeeNumber has @unique globally but @@unique per tenant — duplicate uniqueness | P3 | S (15m) |
| 14 | Module exports nothing — add service exports for cross-module consumption | P2 | S (15m) |
| 15 | Hub status "Scaffolded" → change to "Implemented" (production-quality CRUD + business logic) | P2 | S (5m) |

---

## Tribunal Debate Summary

### Round 1: "Scaffolded" vs "Implemented"
Hub calls all 6 controllers "Scaffolded." Code has circular hierarchy detection, auto employee number generation, PTO balance management with pending/used tracking, approval workflows with status validation, employment history, org chart, time entry aggregation. **Verdict: "Implemented" — this is NOT scaffold code.**

### Round 2: Data Model Accuracy
Hub documents 6 models with ~48% field accuracy. Reality: 10 Prisma models, 5 enums, extensive migration-first fields. Hub has phantom fields (breakMinutes, isOvertime, payFrequency) and wrong enum names. **Verdict: Hub data model section needs full rewrite.**

### Round 3: Hard Delete — Design or Bug?
Departments, Positions, Locations use `prisma.*.delete()` — hard delete. All 3 models have `deletedAt` fields in Prisma. This is clearly a bug, not intentional design. Only Employee correctly soft-deletes. **Verdict: Bug — fix to soft delete.**

### Round 4: Balance Tracking Quality
TimeOffBalanceService implements addPending/removePending/movePendingToUsed pattern. However, `movePendingToUsed()` is a stub (returns `{ moved: true }` without actual balance transfer logic). The addPending/removePending work correctly. **Verdict: Partial implementation — movePendingToUsed needs real logic.**

### Round 5: Test Quality
48 tests with proper PrismaService mocking. TimeOff has 13 tests covering the approval workflow. Good coverage for a P3 service. **Verdict: Solid test foundation, hub claim of "None" is the 15th false claim.**

---

## Final Verdict

| Metric | Hub Claim | Actual | Delta |
|--------|-----------|--------|-------|
| Health Score | 2/10 | 7.0/10 | +5.0 |
| Status | Scaffolded | Implemented | Upgrade |
| Endpoints | ~35 | 35 | ✓ Match |
| Models | 6 | 10 | +4 missing |
| Tests | None | 48 / 7 spec files / 767 LOC | 15th false claim |
| Security | Unknown | JwtAuth 100%, RolesGuard 0% | Known |
| Soft Delete | Not mentioned | 1/7 compliance, 3 hard deletes | Critical bug |

**MODIFY** — Backend is production-quality CRUD with real business logic, not scaffolded. Critical issues: 3 hard-delete bugs, 6/7 services missing deletedAt filter, 0/6 RolesGuard. Hub needs significant data model rewrite. No frontend (correctly documented). No .bak directory (clean).
