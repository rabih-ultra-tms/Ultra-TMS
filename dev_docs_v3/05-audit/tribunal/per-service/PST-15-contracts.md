# PST-15: Contracts Service Tribunal Audit

> **Service:** Contracts (Service #15)
> **Priority Tier:** P2 Extended (Financial)
> **Batch:** 3 (P2 Financial)
> **Date:** 2026-03-08
> **Verdict:** MODIFY
> **Health Score:** 7.5/10 (was 3.5/10, +4.0)

---

## Phase 1: Hub Accuracy Verification

### 1.1 Endpoint Count & Paths

**Hub Claim:** 58 endpoints across 8 controllers
**Reality:** 58 endpoints across 8 controllers — **COUNT MATCHES**

However, **endpoint PATHS are ~65% accurate** (38/58 correct, 20 wrong or missing):

#### ContractsController (13 endpoints)
| Hub Claims | Reality | Match? |
|------------|---------|--------|
| GET `/contracts` | GET `/contracts` | YES |
| POST `/contracts` | POST `/contracts` | YES |
| GET `/contracts/:id` | GET `/contracts/:id` | YES |
| PUT `/contracts/:id` | PUT `/contracts/:id` | YES |
| PATCH `/contracts/:id` | — | NO — no PATCH, only PUT |
| DELETE `/contracts/:id` | DELETE `/contracts/:id` | YES |
| PATCH `/contracts/:id/status` | — | **PHANTOM** — doesn't exist |
| POST `/contracts/:id/activate` | POST `/contracts/:id/activate` | YES |
| POST `/contracts/:id/renew` | POST `/contracts/:id/renew` | YES |
| POST `/contracts/:id/cancel` | POST `/contracts/:id/terminate` | **WRONG NAME** — terminate not cancel |
| POST `/contracts/:id/clone` | — | **PHANTOM** — doesn't exist |
| GET `/contracts/stats` | — | **PHANTOM** — doesn't exist |
| GET `/contracts/expiring` | — | **PHANTOM** — doesn't exist |
| — | POST `/contracts/:id/submit` | **UNDOCUMENTED** |
| — | POST `/contracts/:id/approve` | **UNDOCUMENTED** |
| — | POST `/contracts/:id/reject` | **UNDOCUMENTED** |
| — | POST `/contracts/:id/send-for-signature` | **UNDOCUMENTED** |
| — | GET `/contracts/:id/history` | **UNDOCUMENTED** |

**Contracts verdict:** 8 correct, 4 phantom, 1 wrong name, 5 undocumented. Hub misses the full approval workflow (submit→approve→reject) and e-signature send endpoint.

#### FuelSurchargeController (9 endpoints)
| Hub Claims | Reality | Match? |
|------------|---------|--------|
| GET `/fuel-surcharges` | GET `/fuel-tables` | **WRONG PATH** |
| POST `/fuel-surcharges` | POST `/fuel-tables` | **WRONG PATH** |
| GET `/fuel-surcharges/:id` | GET `/fuel-tables/:id` | **WRONG PATH** |
| PUT `/fuel-surcharges/:id` | PUT `/fuel-tables/:id` | **WRONG PATH** |
| PATCH `/fuel-surcharges/:id` | — | **PHANTOM** — no PATCH |
| DELETE `/fuel-surcharges/:id` | DELETE `/fuel-tables/:id` | **WRONG PATH** |
| POST `/fuel-surcharges/:id/activate` | — | **PHANTOM** |
| GET `/fuel-surcharges/active` | — | **PHANTOM** |
| GET `/fuel-surcharges/:id/calculate` | GET `/fuel-surcharge/calculate` | **WRONG PATH** |
| — | GET `/fuel-tables/:id/tiers` | **UNDOCUMENTED** |
| — | POST `/fuel-tables/:id/tiers` | **UNDOCUMENTED** |
| — | PUT `/fuel-tiers/:tierId` | **UNDOCUMENTED** |

**Fuel verdict:** 0 correct paths. Hub uses `/fuel-surcharges` but code uses `/fuel-tables`. 3 phantom endpoints, 3 undocumented tier management endpoints.

#### RateTablesController (7 endpoints)
| Hub Claims | Reality | Match? |
|------------|---------|--------|
| GET `/contracts/:contractId/rate-tables` | GET `/contracts/:contractId/rate-tables` | YES |
| POST `/contracts/:contractId/rate-tables` | POST `/contracts/:contractId/rate-tables` | YES |
| GET `/contracts/:contractId/rate-tables/:id` | GET `/rate-tables/:id` | **WRONG PATH** |
| PUT `/contracts/:contractId/rate-tables/:id` | PUT `/rate-tables/:id` | **WRONG PATH** |
| PATCH `/contracts/:contractId/rate-tables/:id` | — | **PHANTOM** |
| DELETE `/contracts/:contractId/rate-tables/:id` | DELETE `/rate-tables/:id` | **WRONG PATH** |
| POST `/contracts/:contractId/rate-tables/:id/clone` | — | **PHANTOM** |
| — | POST `/rate-tables/:id/import` | **UNDOCUMENTED** |
| — | GET `/rate-tables/:id/export` | **UNDOCUMENTED** |

**Rate Tables verdict:** 2 correct, 3 wrong paths (nested vs flat), 2 phantom, 2 undocumented (import/export).

#### ContractTemplatesController (6 endpoints)
| Hub Claims | Reality | Match? |
|------------|---------|--------|
| GET `/contract-templates` | GET `/contract-templates` | YES |
| POST `/contract-templates` | POST `/contract-templates` | YES |
| GET `/contract-templates/:id` | GET `/contract-templates/:id` | YES |
| PUT `/contract-templates/:id` | PUT `/contract-templates/:id` | YES |
| DELETE `/contract-templates/:id` | DELETE `/contract-templates/:id` | YES |
| POST `/contract-templates/:id/create-contract` | POST `/contract-templates/:id/clone` | **WRONG NAME** |

**Templates verdict:** 5 correct, 1 wrong name (clone vs create-contract).

#### AmendmentsController (6 endpoints) — ~83% accurate
#### RateLanesController (5 endpoints) — ~100% accurate
#### SlasController (6 endpoints) — ~83% accurate (has `/performance` not `/compliance`)
#### VolumeCommitmentsController (6 endpoints) — ~83% accurate (has `/performance` not `/progress`)

### 1.2 Prisma Models

**Hub Claim:** 11 models + legacy RateContract
**Reality:** 12 active models + 1 legacy = 13 total

| Hub Name | Actual Name | Found? | Field Accuracy |
|----------|-------------|--------|----------------|
| Contract | Contract | YES | ~85% (32 fields, hub docs 27) |
| ContractAmendment | ContractAmendment | YES | ~50% (21 fields, hub docs ~10; different field names) |
| ContractRateTable | ContractRateTable | YES | ~70% (15 fields, hub docs 11) |
| ContractRateLane | ContractRateLane | YES | ~60% (22 fields, hub docs 9; schema adds currency, fuel link) |
| ContractSLA | ContractSLA | YES | ~60% (17 fields, hub docs ~11; adds slaType enum, status) |
| VolumeCommitment | VolumeCommitment | YES | ~50% — **NAME MISMATCH** (hub: ContractVolumeCommitment) |
| FuelSurchargeTable | FuelSurchargeTable | YES | ~40% — **NAME MISMATCH** (hub: FuelSurchargeSchedule) |
| FuelSurchargeTier | FuelSurchargeTier | YES | ~60% — **MISSING tenantId** (isolation bug) |
| ContractTemplate | ContractTemplate | YES | ~65% (16 fields, hub docs 13; adds version, isActive) |
| ContractMetric | ContractMetric | YES | ~50% (20 fields, hub docs sparse) |
| ContractClause | ContractClause | YES | **UNDOCUMENTED** — not in hub at all (16 fields) |
| — | ContractLaneRate | YES | **UNDOCUMENTED** — legacy model for RateContract (35 fields) |
| RateContract (legacy) | RateContract | YES | Confirmed present (23 fields) |

**Data model verdict:** All 11 hub models exist. 2 name mismatches, 1 undocumented model (ContractClause), 1 undocumented legacy model (ContractLaneRate). Field accuracy ~55% average — hub consistently under-documents by 5-10 fields per model. Schema is MUCH richer than documented.

**CRITICAL BUG:** FuelSurchargeTier model lacks `tenantId` field — potential data leak across tenants.

### 1.3 Tests

**Hub Claim:** "2 spec files (contracts.service.spec.ts, amendments.service.spec.ts), mostly boilerplate"
**Reality:** 9 spec files, 60 test cases with real business logic

| Spec File | Test Cases | Quality |
|-----------|-----------|---------|
| contracts.service.spec.ts | 15 | State transitions, event emission |
| amendments.service.spec.ts | 4 | Amendment numbering, approval flow |
| rate-tables.service.spec.ts | 4 | CSV import/export |
| rate-lanes.service.spec.ts | 3 | Soft delete enforcement |
| slas.service.spec.ts | 8 | Violation/warning thresholds |
| fuel-surcharge.service.spec.ts | 8 | Tier-based calculations |
| contract-templates.service.spec.ts | 8 | Cloning, versioning |
| volume-commitments.service.spec.ts | 8 | Shortfall calculations |
| docusign.service.spec.ts | 1 | Envelope ID generation |
| **TOTAL** | **60** | **Logic tests, NOT boilerplate** |

**Test verdict:** Hub claim "2 files, mostly boilerplate" is **FALSE**. 10th service with false "minimal tests" claim. 9 files, 60 tests covering business logic.

### 1.4 Security

**Hub Claim:** Not documented (no security section in hub)

**Reality:**
- **2/8 controllers** have full guards (JwtAuthGuard + RolesGuard): ContractsController, RateTablesController
- **6/8 controllers** missing RolesGuard: Amendments, RateLanes, SLAs, FuelSurcharge, Templates, VolumeCommitments
- **100% tenant isolation** — all services filter by tenantId
- **100% soft delete compliance** — all queries filter deletedAt: null

### 1.5 Frontend

**Hub Claim:** "Not Built — 0 pages, 0 components, 0 hooks"
**Reality:** **CONFIRMED ACCURATE** — 0 pages, 0 components, 0 hooks, 0 navigation items

First hub claim verified 100% correct in this audit. No .bak directory exists either.

### 1.6 Events

**Hub Claim:** 11 event types
**Reality:** 13 event types (hub missed amendment.created, amendment.approved)

### 1.7 Enums

**Hub Claim:** 6 enums
**Reality:** 6 enums confirmed — ContractStatus (7 values), ContractType (5 values), ContractClauseType (9 values), RateType, SLAType, MetricType

**Status machine discrepancy:** Hub says `DRAFT → ACTIVE → EXPIRING → EXPIRED` but code has `DRAFT → PENDING_APPROVAL → APPROVED → SENT_FOR_SIGNATURE → ACTIVE → EXPIRED → TERMINATED`. Hub misses approval workflow entirely.

---

## Phase 2: Code Quality Assessment

### 2.1 Architecture
- **Well-structured:** 8 sub-modules with clear separation (contracts, amendments, rate-tables, rate-lanes, slas, fuel-surcharge, templates, volume-commitments)
- **Event-driven:** EventEmitter2 for state changes, listener file for cross-cutting concerns
- **DocuSign integration:** Properly stubbed with mock envelopeId generation
- **DTOs:** 16+ DTO files with class-validator decorators and Swagger annotations

### 2.2 Strengths
- 100% tenant isolation in all services
- 100% soft delete compliance
- Rich business logic: approval workflows, amendment tracking, SLA performance, fuel surcharge calculation, volume shortfall detection
- Event emission on all state transitions
- CSV import/export for rate tables

### 2.3 Weaknesses
- 6/8 controllers missing RolesGuard (75% unprotected by role)
- FuelSurchargeTier missing tenantId (data isolation bug)
- No cron job for auto-renewal processing
- Dual model system (Contract + RateContract) — migration status unclear
- Hub documents wrong status machine (misses 3 states)

---

## Phase 3: Cross-Cutting Patterns

| Pattern | Status |
|---------|--------|
| Tenant isolation | 100% compliant |
| Soft delete | 100% compliant |
| Migration fields | 100% compliant (all models have externalId, sourceSystem, customFields) |
| API envelope | N/A (no frontend hooks yet) |
| Event emission | Strong — 13 event types across 4 services |
| RolesGuard | 25% (2/8 controllers) — **systemic gap** |

---

## Phase 4: Known Issues Verification

| Hub Issue | Verified? |
|-----------|-----------|
| "No frontend screens exist" | TRUE — 0 pages confirmed |
| "No hooks exist" | TRUE — 0 hooks confirmed |
| "No tests" | **FALSE** — 60 tests across 9 files |
| "Rate resolution untested" | LIKELY TRUE — no integration tests found |
| "E-signature not implemented" | TRUE — DocuSign is stubbed (mock IDs only) |
| "Auto-renewal cron may not exist" | LIKELY TRUE — no scheduled task found |
| "Fuel surcharge accuracy untested" | **FALSE** — 8 test cases cover tier-based calculations |

---

## Phase 5: Adversarial Tribunal (5 Rounds)

### Round 1: Hub Accuracy Prosecutor
**Charge:** Hub endpoint paths are severely inaccurate.
**Evidence:** Hub documents `/fuel-surcharges` but code uses `/fuel-tables` (0% path accuracy for entire controller). Hub misses the entire approval workflow (submit→approve→reject→send-for-signature). 4 phantom endpoints on ContractsController alone.
**Verdict:** GUILTY. Hub Section 4 (endpoints) is ~65% path-accurate. The endpoint COUNT is perfect (58=58), but paths are wrong for ~20 endpoints. This is the worst endpoint path accuracy for a service where the count was correct.

### Round 2: Security Advocate
**Charge:** 6/8 controllers lack RolesGuard — authenticated but unprivileged users can modify contracts, amendments, fuel surcharges, SLAs, and volume commitments.
**Evidence:** Only ContractsController and RateTablesController have `@UseGuards(JwtAuthGuard, RolesGuard)`. Other 6 controllers use `@UseGuards(JwtAuthGuard)` only.
**Verdict:** GUILTY. HIGH risk for a financial service. Amendments controller (can modify contract terms) and FuelSurchargeController (affects pricing) are especially sensitive without role enforcement.

### Round 3: Data Model Defense
**Charge:** Hub data model section is incomplete and inaccurate.
**Defense:** All 11 hub-claimed models DO exist. The schema is consistently richer than documented — this means the code is BETTER than the docs claim, not worse. Field accuracy is ~55% because hub under-documents, not because fields are wrong.
**Counter:** But 2 model names are wrong (FuelSurchargeSchedule→FuelSurchargeTable, ContractVolumeCommitment→VolumeCommitment), ContractClause is entirely undocumented, and the status machine is wrong (misses 3 states). Naming errors in docs propagate to frontend builds.
**Verdict:** PARTIALLY GUILTY. Models exist and are well-designed, but hub naming errors will cause integration bugs when frontend is built.

### Round 4: Test Coverage Challenger
**Charge:** Hub massively underreports test coverage.
**Evidence:** Hub claims "2 spec files, mostly boilerplate." Reality: 9 spec files, 60 test cases covering state transitions, amendment numbering, SLA violations, fuel surcharge calculations, and volume shortfall detection. This is the 10th service where hub falsely claims minimal/no tests.
**Verdict:** Hub claim is FALSE. Tests are legitimate business logic tests, not boilerplate. This is now a systemic documentation pattern — hub test claims should be assumed false until verified.

### Round 5: Production Readiness
**Charge:** Despite being the "richest P1 backend," Contracts has critical gaps blocking production use.
**Evidence:** (1) FuelSurchargeTier missing tenantId — multi-tenant data leak. (2) No auto-renewal cron job — contracts won't auto-renew as documented. (3) 0 frontend — invisible to users. (4) Rate resolution integration unverified — contract rates may not flow into quoting.
**Verdict:** GUILTY on all 4 counts. The FuelSurchargeTier tenantId gap is the most critical — it's a data isolation bug in a financial model. Auto-renewal is a broken business promise. The service works in isolation but isn't integrated into the broader TMS workflow.

---

## Final Scores

| Area | Score | Notes |
|------|-------|-------|
| Backend Architecture | 8.5/10 | Well-structured 8-module design, event-driven, rich business logic |
| Backend Security | 6.0/10 | 100% tenant isolation but 75% missing RolesGuard |
| Data Model | 8.0/10 | 13 models, all with migration fields, but FuelSurchargeTier tenantId bug |
| Test Coverage | 7.5/10 | 60 tests covering business logic, but no integration tests |
| Frontend | 0/10 | Confirmed: nothing built |
| Hub Accuracy | 5.0/10 | Count perfect but paths ~65% accurate, model names wrong, status machine wrong, tests massively underreported |
| **Overall** | **7.5/10** | Rich backend, zero frontend, hub path accuracy is worst of any count-accurate service |

---

## Action Items

### CRITICAL (P0)
1. **Add tenantId to FuelSurchargeTier** — data isolation bug in financial model
2. **Add RolesGuard to 6 controllers** — Amendments, RateLanes, SLAs, FuelSurcharge, Templates, VolumeCommitments

### HIGH (P1)
3. **Fix hub endpoint paths** — `/fuel-surcharges` → `/fuel-tables`, add approval workflow endpoints, remove 4 phantom endpoints from ContractsController
4. **Fix hub model names** — FuelSurchargeSchedule → FuelSurchargeTable, ContractVolumeCommitment → VolumeCommitment
5. **Document ContractClause model** — 16 fields, 9-value enum, entirely missing from hub
6. **Fix hub status machine** — add PENDING_APPROVAL, APPROVED, SENT_FOR_SIGNATURE states
7. **Fix hub test claims** — 9 files / 60 tests, not "2 files, boilerplate"
8. **Verify/build auto-renewal cron job** — documented business rule but no implementation found

### MEDIUM (P2)
9. **Clarify Contract vs RateContract** — dual model system needs migration plan
10. **Add integration test for rate resolution** — verify contract rates flow into quoting/Load Planner
11. **Document ContractLaneRate legacy model** — 35-field model for RateContract system
12. **Update hub event count** — 13 events, not 11 (missing amendment.created, amendment.approved)

---

## Cross-Service Patterns Confirmed

| # | Pattern | Count Now |
|---|---------|-----------|
| 1 | Hub data models systematically wrong | 15/15 services |
| 2 | "No tests"/"stubs" claim FALSE | 10/15 services |
| 3 | Endpoint count accurate but paths wrong | 5/15 services |
| 4 | Soft-delete systemic gaps | 6/15 services (NOT this one — 100% compliant) |
| 5 | RolesGuard missing on controllers | 10/15 services |
| 6 | Migration fields (externalId, etc.) present | 15/15 services |
| 7 | Hub status machines wrong/incomplete | 3/15 services |

---

## Hub Sections Accuracy

| Section | Accuracy | Notes |
|---------|----------|-------|
| 1. Status Box | 6/10 | Health score was right (low), but "2 spec files" wrong |
| 2. Implementation Status | 7/10 | Correct on frontend (0), wrong on tests |
| 3. Screens | 10/10 | Correctly says all "Not Built" |
| 4. API Endpoints | 5/10 | Count perfect (58=58), paths ~65% accurate, worst path accuracy of count-accurate services |
| 5. Components | 10/10 | Correctly says none exist |
| 6. Hooks | 10/10 | Correctly says none exist |
| 7. Business Rules | 7/10 | Mostly correct but misses approval workflow, status machine wrong |
| 8. Data Model | 4/10 | 2 name mismatches, 1 undocumented model, fields ~55% complete, status enum wrong |
| 9. Validation Rules | 7/10 | Reasonable but some rules don't match actual status transitions |
| 10. Status States | 4/10 | Missing 3 states (PENDING_APPROVAL, APPROVED, SENT_FOR_SIGNATURE), wrong transition name (cancel→terminate) |
| 11. Known Issues | 5/10 | "No tests" is false, "fuel surcharge untested" is false |
| 12. Tasks | 8/10 | Well-structured task breakdown |
| 13. Design Links | 9/10 | All 8 design spec paths listed |
| 14. Delta vs Original Plan | 8/10 | Good analysis of scope expansion |
| 15. Dependencies | 9/10 | Accurate dependency graph |

**Overall Hub Accuracy: ~65%** — endpoint paths and data model sections drag it down significantly.
