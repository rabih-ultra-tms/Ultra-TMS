# PST-10: Claims Service Tribunal Audit

> **Service:** Claims (#10)
> **Priority:** P2-Extended (was P1 in hub)
> **Date:** 2026-03-08
> **Auditor:** Claude Opus 4.6
> **Verdict:** MODIFY
> **Health Score:** 7.0/10 (was 3.5/10, Δ +3.5)

---

## Phase 1: Hub vs Reality Comparison

### Endpoint Count
| Source | Count | Accuracy |
|--------|-------|----------|
| Hub | 39 | **100%** ✅ |
| Actual | 39 | — |

**3rd service with perfect endpoint count** (after Documents 20=20, Communication 30=30).

### Endpoint Breakdown (all match hub)
| Controller | Hub | Actual | Match |
|------------|-----|--------|-------|
| Claims Core | 8 | 8 | ✅ |
| Documents | 3 | 3 | ✅ |
| Items | 5 | 5 | ✅ |
| Notes | 5 | 5 | ✅ |
| Resolution | 8 | 8 | ✅ |
| Subrogation | 6 | 6 | ✅ |
| Reports | 4 | 4 | ✅ |

### Prisma Models
| Source | Count | Models |
|--------|-------|--------|
| Hub | 8 | Claim, ClaimAdjustment, ClaimContact, ClaimDocument, ClaimItem, ClaimNote, ClaimTimeline, SubrogationRecord |
| Actual | 8 | Same 8 models |
| **Match** | **100%** ✅ | Model names 100% correct |

### Data Model Accuracy
| Model | Hub Accuracy | Issues |
|-------|-------------|--------|
| Claim | ~90% | Missing: createdById, updatedById (audit fields) |
| ClaimItem | ~90% | Missing: createdById, updatedById |
| ClaimDocument | ~85% | Missing: createdById, updatedById, externalId, sourceSystem, customFields, deletedAt |
| ClaimNote | ~85% | Missing: createdById, updatedById, externalId, sourceSystem, customFields, deletedAt |
| ClaimTimeline | ~85% | Missing: createdById, updatedById, externalId, sourceSystem, customFields, deletedAt, updatedAt |
| ClaimAdjustment | ~85% | Missing: createdById, updatedById, externalId, sourceSystem, customFields, updatedAt, deletedAt |
| ClaimContact | ~85% | Missing: createdById, updatedById, title field, externalId, sourceSystem, customFields, updatedAt, deletedAt |
| SubrogationRecord | N/A | Not documented in hub data model section (mentioned in endpoints only) |

**Overall data model accuracy: ~85%** — Best of any audited service. Hub misses migration-first fields (externalId, sourceSystem, customFields) and audit fields (createdById, updatedById) on sub-models, but gets all core business fields correct.

**SubrogationRecord model completely undocumented** in Section 8 despite having 22 fields including attorneyName, attorneyFirm, caseNumber, filingDate, settlementDate, settlementAmount, closureReason.

### Frontend
| Source | Pages | Components | Hooks |
|--------|-------|------------|-------|
| Hub | 0 | 0 | 0 |
| Actual | 0 | 0 | 0 |
| **Match** | ✅ | ✅ | ✅ |

Frontend "Not Built" confirmed correct. Claims rate data referenced in Carrier Scorecard and Load Board components only.

### Tests
| Source | Claim | Notes |
|--------|-------|-------|
| Hub | "Spec files exist, likely empty/minimal" | 7 files |
| Actual | **56+ real unit tests across 7 spec files** | Comprehensive coverage |
| **Match** | ❌ FALSE | **9th false "empty stubs" claim** |

---

## Phase 2: Security Audit

### Guard Coverage
| Controller | JwtAuthGuard | RolesGuard | @Roles | Status |
|------------|-------------|------------|--------|--------|
| Claims | ✅ | ✅ | ✅ per-method | SECURE |
| Documents | ✅ | ✅ | ✅ per-method | SECURE |
| Items | ✅ | ✅ | ✅ per-method | SECURE |
| Notes | ✅ | ✅ | ✅ per-method | SECURE |
| Resolution | ✅ | ✅ | ✅ per-method | SECURE |
| Subrogation | ✅ | ✅ | ✅ per-method | SECURE |
| Reports | ✅ | ❌ missing | ✅ per-method | ⚠️ PARTIAL |

**Security: 6/7 controllers fully guarded (86%).**
Reports controller missing RolesGuard at controller level — per-method @Roles decorators may or may not enforce without the guard being registered.

### Tenant Isolation
- ✅ All 7 services filter by `tenantId` in every query
- ✅ All services use `@CurrentTenant()` decorator to extract tenant from JWT
- **100% tenant isolation** — no cross-tenant leaks found

### Soft-Delete Compliance
- ✅ All 7 services include `deletedAt: null` in all read queries
- ✅ All delete operations use soft-delete (`deletedAt = new Date()`)
- **100% soft-delete compliance** — best of any P2 service

### Audit Trail
- ✅ 4 critical resolution endpoints have `@Audit` decorator (approve, deny, pay, close)
- ✅ Timeline events recorded for all state changes (create, update, delete, status transitions, assignments)
- **Excellent audit trail** — better than most P0 services

### Role Matrix
| Role | Access | Endpoints |
|------|--------|-----------|
| ADMIN | Full | 39/39 |
| CLAIMS_MANAGER | Full | 39/39 |
| CLAIMS_ADJUSTER | Most (no deletes) | ~32/39 |
| DISPATCHER | Read + Create | ~14/39 |
| CLAIMS_VIEWER | Reports only | 4/39 |

---

## Phase 3: Business Logic Verification

### Status Machine
Hub documents: `DRAFT → SUBMITTED → UNDER_INVESTIGATION → PENDING_DOCUMENTATION ↔ UNDER_INVESTIGATION → APPROVED/DENIED → SETTLED → CLOSED`

**Verified transitions in code:**
- ✅ DRAFT → SUBMITTED (via `fileClaim()`)
- ✅ SUBMITTED → UNDER_INVESTIGATION (via `updateStatus()`)
- ✅ UNDER_INVESTIGATION → APPROVED (via `approve()`)
- ✅ UNDER_INVESTIGATION → DENIED (via `deny()`)
- ✅ APPROVED → auto-CLOSED when paidAmount ≥ approvedAmount (via `pay()`)
- ✅ Manual CLOSED (via `close()`)
- ✅ Prevents updates to CLOSED claims
- ✅ Prevents payment on non-APPROVED claims

### Filing Window Enforcement (9-Month Rule)
**NOT IMPLEMENTED.** Hub lists as "Needs check" — confirmed missing. No code checks whether a cargo claim is filed within 9 months of delivery. This is a documented FMCSA regulatory requirement.

### Auto-Calculated Fields
- ✅ `totalValue = quantity × unitPrice` calculated in ClaimItemsService.create() and update()
- ✅ `claimNumber` auto-generated as `CLM-YYYYMMDD-XXXX` with uniqueness retry
- ✅ `paidAmount` accumulated, auto-closes claim when fully paid

### Insurance Routing ($10K Threshold)
**NOT IMPLEMENTED.** Hub Section 7 states "Claims above $10,000 are automatically routed to the carrier's insurance provider." No code enforces this.

### Carrier Performance Impact
**NOT IMPLEMENTED** in Claims module. Claims rate metric exists in carrier scorecard (frontend read-only) but no Claims → Carrier scoring integration in backend.

---

## Phase 4: Hub Accuracy Scorecard

| Hub Section | Accuracy | Notes |
|-------------|----------|-------|
| 1. Status Box | 60% | Health score too low (3.5 → 7.0). "Tests likely empty" FALSE. |
| 2. Implementation Status | 85% | Tests row wrong ("Minimal" → 56+ real tests) |
| 3. Screens | 100% | All 8 correctly listed as "Not Built" |
| 4. API Endpoints | **100%** | All 39 endpoints, all paths, all methods correct |
| 5. Components | 100% | Correctly "Not Built" |
| 6. Hooks | 100% | Correctly "Not Built" |
| 7. Business Rules | 80% | Rules documented but 2 not enforced (filing window, insurance routing) |
| 8. Data Model | 75% | Core fields correct, missing audit/migration fields. SubrogationRecord undocumented. |
| 9. Validation Rules | 70% | Rules listed but not all enforced in DTOs |
| 10. Status States | 95% | Accurate, verified in code |
| 11. Known Issues | 80% | 4/5 correct, 1 FALSE ("spec files likely empty") |
| 12. Tasks | 90% | Reasonable backlog |
| 13. Design Links | 100% | All 10 spec files referenced |
| 14. Delta vs Original | 90% | Accurate assessment |
| 15. Dependencies | 90% | Correct dependency graph |

**Overall Hub Accuracy: ~87%** — HIGHEST of any audited service.

---

## Phase 5: Tribunal Verdicts

### Round 1: Keep / Modify / Rebuild?
**VERDICT: MODIFY**

The Claims backend is production-quality with excellent architecture, security, tenant isolation, and test coverage. Hub is remarkably accurate (87%) — the most accurate of any audited service. Only modifications needed are:
1. Fix hub test claims (stubs → real)
2. Add missing data model fields to hub
3. Document SubrogationRecord model in Section 8
4. Implement 2 missing business rules

### Round 2: Critical Bugs Found
| # | Bug | Severity | Location | Impact |
|---|-----|----------|----------|--------|
| 1 | Reports controller missing RolesGuard | MEDIUM | `reports/reports.controller.ts` | May allow unauthorized report access |
| 2 | Filing window (9-month) not enforced | MEDIUM | `claims/claims.service.ts` | FMCSA regulatory gap |
| 3 | Insurance routing ($10K) not enforced | LOW | `claims/claims.service.ts` | Business rule gap |
| 4 | ClaimContact has no API exposure | LOW | No controller exists | Dead model |

### Round 3: Test Coverage Assessment
- **56+ real unit tests** across 7 spec files
- **0 integration tests** — all mocked Prisma
- **0 frontend tests** (no frontend exists)
- Quality: GOOD — tests cover CRUD, business logic, error handling, timeline recording
- ClaimsService has the most thorough tests (18 tests including retry logic)
- Gap: No tests for status transition edge cases (e.g., invalid transitions should throw)

### Round 4: Cross-Cutting Patterns
| Pattern | Claims Status | Notes |
|---------|--------------|-------|
| Tenant isolation | ✅ 100% | All queries filter tenantId |
| Soft-delete | ✅ 100% | All queries filter deletedAt: null |
| API envelope | ⚠️ Unknown | Controllers return raw Prisma objects — needs runtime verification |
| Role guards | ⚠️ 86% | Reports controller partial |
| @Audit on financial ops | ✅ Yes | 4 critical endpoints audited |
| Error handling | ✅ Good | NotFoundException for missing resources |
| Pagination | ✅ Yes | ClaimsService.findAll() supports skip/take |

### Round 5: Final Score Breakdown
| Dimension | Score | Notes |
|-----------|-------|-------|
| Architecture | 9/10 | Clean 7-module separation, proper nesting |
| Security | 8.5/10 | Near-perfect, 1 partial controller |
| Data integrity | 9/10 | Full audit trail, proper soft-delete |
| Business logic | 7/10 | Core logic excellent, 2 rules unimplemented |
| Test coverage | 7/10 | 56+ unit tests, no integration tests |
| Documentation (hub) | 8.5/10 | Most accurate hub of any service |
| Frontend | 0/10 | Not built (expected for P2) |
| **Weighted Score** | **7.0/10** | Backend-only score: 8.5/10 |

---

## Action Items

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Fix hub: Tests are 56+ real tests, not "likely empty/minimal" | P0 | 5min |
| 2 | Fix hub: Add SubrogationRecord model to Section 8 | P1 | 15min |
| 3 | Fix hub: Add audit fields (createdById, updatedById) to all models | P1 | 15min |
| 4 | Fix hub: Add migration-first fields to sub-models | P1 | 10min |
| 5 | Add RolesGuard to ClaimsReportsController | P1 | 5min |
| 6 | Implement filing window enforcement (9-month cargo claim deadline) | P2 | 2h |
| 7 | Implement insurance routing threshold ($10K auto-route) | P2 | 2h |
| 8 | Build ClaimContact controller/service (or remove dead model) | P2 | 2h |
| 9 | Add integration tests with real database | P2 | 4h |
| 10 | Verify API response envelope consistency at runtime | P2 | 1h |
| 11 | Fix hub: Priority should be P2-Extended, not P1 (per _PROGRESS.md batch 3) | P1 | 5min |

---

## Summary

Claims is the **most accurately documented service** of all 13 audited so far. Hub endpoint count matches perfectly (39=39), model names are 100% correct, model count matches (8=8), and frontend "Not Built" is correctly documented. The only significant hub error is the test claim — "likely empty/minimal" is FALSE (56+ real tests, 9th service with this false claim).

Backend quality is excellent: clean 7-module architecture, 100% tenant isolation, 100% soft-delete compliance, 4 @Audit decorators on critical financial operations, and proper role-based access control. Two business rules from the hub (filing window, insurance routing) are documented but not implemented.

**Key differentiator:** This is the first service where the hub's backend documentation is substantially correct. Previous services had endpoint ratios of 2-9x reality; Claims is 1:1.
