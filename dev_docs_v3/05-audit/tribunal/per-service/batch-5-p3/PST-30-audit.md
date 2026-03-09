# PST-30: Audit Service — Per-Service Tribunal

> **Service:** 30 - Audit | **Priority:** P3 Future | **Hub Score:** 3/10
> **Date:** 2026-03-09 | **Auditor:** Claude Code (Opus 4.6)
> **Verdict:** MODIFY | **Verified Score:** 8.0/10 | **Delta:** +5.0

---

## Phase 1: Hub vs Reality — Factual Verification

### Endpoint Count
- **Hub claims:** 31 endpoints across 8 controllers
- **Actual:** 33 endpoints across 8 controllers
- **Accuracy:** 94% (missed 2 endpoints)
- **Missed:** `GET /audit/logins/summary` (login summary), `GET /audit/api/errors` (error listing)

### Controller Count
- **Hub claims:** 8 controllers (audit, alerts, api, events, compliance/checkpoints, history, logs, retention)
- **Actual:** 8 controllers ✓
- **Names partially wrong:** Hub says "events" controller — actual is `AuditController` (main), no standalone events controller. Hub says "activity" is missing — actual `UserActivityController` handles logins/access.
- **Accuracy:** Count correct, names ~75% accurate

### Prisma Models
- **Hub claims:** "AuditLog + related tables" (no enumeration — worst data model section of all 30 services)
- **Actual:** 9 models:
  1. **AuditLog** — Core audit records (21 fields, 10 indexes)
  2. **APIAuditLog** — API call tracking (11 fields, 5 indexes)
  3. **LoginAudit** — Login attempts (12 fields, 5 indexes)
  4. **AccessLog** — Resource access (12 fields, 5 indexes)
  5. **ChangeHistory** — Field-level changes (16 fields, 6 indexes)
  6. **ComplianceCheckpoint** — Compliance verification (17 fields, 5 indexes)
  7. **AuditAlert** — Alert rule definitions (15 fields, 4 indexes)
  8. **AuditAlertIncident** — Alert triggers (17 fields, 6 indexes)
  9. **AuditRetentionPolicy** — Retention rules (15 fields, 4 indexes)
- **Hub accuracy:** ~11% (only names AuditLog, misses 8 models entirely)
- **Note:** SafetyAuditTrail also exists in Prisma but belongs to Safety module

### Enums
- **Hub claims:** Not mentioned
- **Actual:** 5 audit enums:
  - `AuditAction` (CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, IMPORT)
  - `AuditActionCategory` (DATA, AUTH, ADMIN, SYSTEM)
  - `AuditEventType` (LOGIN_SUCCESS, LOGIN_FAILED, PASSWORD_RESET, MFA_ENABLED, DATA_EXPORT, PERMISSION_CHANGE)
  - `AuditSeverity` (INFO, WARNING, CRITICAL)
  - `AuditSeverityLevel` (LOW, MEDIUM, HIGH, CRITICAL)

### Tests
- **Hub claims:** "None" (Section 2), "Single spec file" (Section 10/15)
- **Actual:** 12 spec files, ~56 tests, ~820+ LOC
- **Verdict:** Hub Section 2 "Tests: None" is FALSE — **21st consecutive false "no tests" claim**
- **Hub Section 10** mentions "audit.service.spec.ts exists" but misses 11 other spec files

### Frontend
- **Hub claims:** "No dedicated frontend pages"
- **Actual:** 3 components + 1 page exist in `apps/web/`:
  - `components/admin/audit/audit-log-table.tsx` (40 LOC)
  - `components/admin/audit/audit-log-detail.tsx` (23 LOC)
  - `components/admin/audit/audit-log-filters.tsx` (15 LOC)
  - `app/(dashboard)/admin/audit-logs/page.tsx` (13 LOC, stub)
- **Verdict:** Hub says "None dedicated" — partially wrong. Basic components exist under Auth & Admin, but they are stubs (91 total LOC). Directionally correct that no production-ready audit UI exists.

### Security
- **Hub claims:** Not explicitly assessed (no security section in known issues)
- **Actual:**
  - JwtAuthGuard: 8/8 controllers (100%) ✓
  - RolesGuard: 0/8 controllers (0%) — `@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')` on all 8 but NO `@UseGuards(RolesGuard)` — **decorative only**
  - Consistent pattern: All use `@Roles` without `RolesGuard` in `@UseGuards`

### Module Registration
- **Hub claims:** Not mentioned
- **Actual:** Registered in `app.module.ts` (line 130) ✓
- **Exports:** `AuditLogsService` + `AuditInterceptor` (used by other modules)

### Known Issues Accuracy
| Hub Issue | Accurate? | Reality |
|-----------|-----------|---------|
| No dedicated frontend | PARTIAL | 3 stub components + 1 page exist (91 LOC) |
| Sentiment analysis depth unknown | N/A | Wrong service (this is Audit, not Feedback) — hub error |
| Analytics sub-module depth unknown | N/A | Wrong service — hub error |
| Widget rate limiting not implemented | N/A | Wrong service — hub error |
| No email integration for NPS | N/A | Wrong service — hub error |
| No Prisma models verified | FALSE | 9 models fully verified |
| Test coverage insufficient | FALSE | 12 spec files, ~56 tests |
| Retention purge job not verified | CORRECT | No @Cron/@Interval found — no purge job |

**CRITICAL ERROR: Hub Section 11 (Known Issues) contains 4 items from the FEEDBACK service (sentiment, analytics, widgets, NPS).** This is a copy-paste contamination bug — the worst documentation error of any service hub.

---

## Phase 2: Architecture & Code Quality

### Service Architecture
The Audit module is one of the most sophisticated in the codebase:

1. **Event-Driven Logging** — `AuditEventsListener` with wildcard patterns (`*.created`, `*.updated`, `*.deleted`) auto-captures all CRUD across the platform
2. **HTTP Interceptor** — `AuditInterceptor` logs every API request with metadata (duration, IP, user agent, method→action mapping)
3. **Hash Chain Integrity** — `AuditHashService` provides SHA256 blockchain-style tamper detection with chain verification
4. **Alert Processing** — `AlertProcessorService` evaluates rules against incoming logs, creates incidents
5. **Sensitive Data Redaction** — `AuditLogsService.redactSensitiveData()` strips password, ssn, taxId, bankAccount, creditCard, apiKey, token, secret

### LOC Breakdown
- **Total:** ~2,249 LOC (active, non-test)
- **Tests:** ~820 LOC across 12 spec files
- **No .bak directory** — clean module

### EventEmitter Integration
**5 custom events emitted:**
- `audit.logged` — Every audit log creation
- `audit.integrity.broken` — Chain verification failure
- `audit.alert.triggered` — Alert incident created
- `audit.checkpoint.created` — Compliance checkpoint
- `audit.retention.completed` — Retention policy applied

**6 @OnEvent listeners:**
- `*.created` / `*.updated` / `*.deleted` — Wildcard CRUD capture
- `user.login` / `user.logout` / `user.login.failed` — Auth events

### DTO Coverage
8 DTO files with comprehensive validation across all controllers.

---

## Phase 3: Security & Data Isolation

### Tenant Isolation: 100% ✓
All 9 services consistently filter by `tenantId` in every query. **Best tenant isolation of any P3 service.**

### Soft-Delete Filtering: 0/5 ⚠
5 models have `deletedAt` field (AuditLog, ChangeHistory, ComplianceCheckpoint, AuditAlert, AuditAlertIncident, AuditRetentionPolicy) but **ZERO queries filter `deletedAt: null`**.
- **Impact:** Deleted audit alerts, compliance checkpoints, and retention policies visible to users
- **Severity:** P2 (audit records themselves should arguably be immutable, but alerts/policies should filter)

### RolesGuard: 0/8 Decorative
All 8 controllers have `@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')` but none include `RolesGuard` in `@UseGuards`. Pattern consistent with systemic issue across codebase.

### No Retention Purge Job
Hub correctly flags this: no `@Cron`, `@Interval`, or scheduled task exists to enforce retention policies. Policies can be created but never execute.

---

## Phase 4: Hub Quality Assessment

### Hub Accuracy Breakdown
| Section | Accuracy | Notes |
|---------|----------|-------|
| Section 1 (Purpose) | 90% | Accurate description of cross-cutting concern |
| Section 2 (Scope) | 70% | Correct controller count, endpoint count off by 2, "Tests: None" FALSE |
| Section 3 (Backend Structure) | 85% | Directory listing accurate, controller table mostly correct |
| Section 4 (Frontend) | 75% | Says "None" — 3 stub components exist |
| Section 5 (Database Schema) | 15% | Only names AuditLog, misses 8 models — worst data model section of all 30 services |
| Section 6 (Business Rules) | 90% | Excellent — accurately describes event-driven architecture, retention, alerts, compliance |
| Section 7 (API Envelope) | 100% | Standard envelope documented |
| Section 8 (Integration Points) | 85% | Accurate integration map |
| Section 9 (Security) | 80% | Good conceptual description, misses RolesGuard gap |
| Section 10 (Testing) | 40% | Claims "single spec file" — actually 12 spec files |
| Section 11 (Known Issues) | 20% | **4/6 items are from FEEDBACK service (copy-paste contamination)** |
| Section 12 (Tasks) | N/A | No tasks section |
| Section 15 (Health Rationale) | 50% | Backend score 7/10 is accurate, but "Test coverage 2/10" is wrong (should be ~5/10) |

### Overall Hub Accuracy: ~60%
Above average for P3 services. Business rules section is excellent. Data model section is the worst of all 30 services. Known issues section has unprecedented copy-paste contamination.

---

## Phase 5: Tribunal — 5 Rounds of Adversarial Debate

### Round 1: Is 3/10 Hub Health Defensible?

**Prosecution:** Hub rates this D+ (3/10). Backend has 8 controllers, 33 endpoints, 9 Prisma models, blockchain-style integrity, event-driven logging used by EVERY service. This is core platform infrastructure, not a stub.

**Defense:** No dedicated frontend, minimal test coverage for a platform-critical module, retention doesn't execute.

**Verdict:** 3/10 is INDEFENSIBLE. Backend is 8/10 quality — event-driven architecture, hash chain integrity, alert processing, sensitive data redaction. The only weak points are frontend stubs and no retention execution. **Verified: 8.0/10.**

### Round 2: "Tests: None" Claim

**Prosecution:** Hub Section 2 says "Tests: None". Reality: 12 spec files, ~56 tests, ~820 LOC. This is the **21st consecutive false "no tests" claim** across 30 services.

**Defense:** None possible.

**Verdict:** FALSE. This systemic error pattern continues. Hub Section 10 partially contradicts Section 2 by mentioning "audit.service.spec.ts exists" but still massively undercounts (1 file vs 12).

### Round 3: Known Issues Copy-Paste Contamination

**Prosecution:** Hub Section 11 contains: "Sentiment analysis sub-module implementation depth unknown", "Analytics sub-module implementation depth unknown", "Widget rate limiting may not be implemented", "No email integration for NPS survey distribution". These are ALL from the Feedback service (Service 28), not the Audit service (Service 30). This is copy-paste contamination.

**Defense:** Hub does have 2 legitimate audit issues (no frontend, retention not verified).

**Verdict:** This is the **worst documentation error found in any of the 30 services audited so far**. 4/6 known issues belong to a completely different service. Undermines trust in the entire section.

### Round 4: @Audit Decorator Adoption

**Prosecution:** Hub describes `@Audited()` decorator for declarative audit logging. The actual decorator is `@Audit()` (wrong name in hub). More critically — while the decorator exists, it's NOT systematically used across the codebase. The interceptor handles generic logging, but explicit sensitive-operation auditing via `@Audit()` appears rarely applied.

**Defense:** The interceptor provides automatic universal logging regardless of decorator usage. The decorator adds enrichment, not core functionality.

**Verdict:** MODIFY — hub should clarify that the interceptor provides baseline logging for all requests, while `@Audit()` is an optional enrichment decorator. Current hub implies all logging goes through decorators, which is misleading.

### Round 5: Infrastructure vs Service Classification

**Prosecution:** Audit is classified P3 but is used by EVERY service in the platform. Changes to audit internals are platform-wide changes. The AuditInterceptor runs on every HTTP request. AuditLogsService is exported and consumed by other modules. This is infrastructure, not a "future" service.

**Defense:** The P3 classification refers to the dedicated frontend, not the backend infrastructure which is active.

**Verdict:** Hub Section 1 correctly explains this distinction. P3 classification is appropriate for the standalone UI scope. However, the hub should prominently flag that the backend is P0-level infrastructure with a WARNING not to modify without regression testing.

---

## Verified Health Score: 8.0/10

| Factor | Hub Score | Verified Score | Notes |
|--------|-----------|----------------|-------|
| Backend completeness | 7/10 | 8/10 | 33 endpoints, 9 services, hash chain, alert processing, event-driven |
| Frontend completeness | 0/10 | 1/10 | 3 stub components exist (91 LOC) |
| Test coverage | 2/10 | 5/10 | 12 spec files, ~56 tests — decent for module size |
| Design spec coverage | 5/10 | 5/10 | 7 design files unbuilt (agree) |
| Integration health | 6/10 | 9/10 | Interceptor runs on ALL requests, event listener captures ALL CRUD, exports consumed |
| Documentation | 2/10 | 3/10 | Hub has copy-paste contamination, worst data model section |
| Security | N/A | 7/10 | 100% JwtAuth, 0% RolesGuard (decorative), 100% tenant isolation |
| **Weighted Average** | **3/10** | **8.0/10** | **Delta: +5.0** |

---

## Action Items (13)

### P0 — Must Fix
1. **Fix hub Known Issues section** — Remove 4 Feedback-service items (sentiment, analytics, widget, NPS). Add real audit issues: soft-delete gap, RolesGuard decorative, no retention execution.
2. **Add RolesGuard to @UseGuards** on all 8 controllers (systemic fix across codebase)

### P1 — Should Fix
3. **Add deletedAt filtering** to queries for AuditAlert, AuditAlertIncident, ComplianceCheckpoint, AuditRetentionPolicy, ChangeHistory
4. **Implement retention purge cron job** — AuditRetentionPolicy records exist but no @Cron executes them
5. **Rewrite hub Section 5** (Database Schema) — enumerate all 9 models with field definitions
6. **Update hub Section 10** (Testing) — document all 12 spec files, not just 1
7. **Fix hub endpoint count** — 33 not 31

### P2 — Nice to Have
8. **Expand @Audit decorator adoption** — apply to sensitive operations across platform (financial mutations, auth changes, data exports)
9. **Add hub Section 4 detail** — document the 3 existing frontend components
10. **Document all 5 EventEmitter events** emitted by audit services
11. **Document all 5 audit enums** in hub
12. **Add integration test** for AuditInterceptor → AuditLogsService → hash chain flow
13. **Fix hub controller names** — "events" controller doesn't exist, "activity" controller does

---

## Key Findings Summary

| Finding | Severity | Details |
|---------|----------|---------|
| **Copy-paste contamination** in Known Issues | P0 DOC | 4/6 known issues belong to Feedback service, not Audit |
| **Worst data model section** of all 30 services | P1 DOC | Only names 1 of 9 models (~11% accuracy) |
| **0/8 RolesGuard** | P1 SEC | All @Roles decorative — systemic |
| **0/5 soft-delete filtering** | P2 SEC | Deleted alerts/policies/checkpoints visible |
| **No retention purge execution** | P2 FUNC | Policies created but never enforced |
| **21st false "no tests" claim** | P1 DOC | 12 spec files, ~56 tests exist |
| **Blockchain-style integrity** | STRENGTH | SHA256 hash chain for tamper detection |
| **Wildcard event capture** | STRENGTH | Auto-logs all CRUD across platform |
| **100% tenant isolation** | STRENGTH | Best of any P3 service |
| **Sensitive data redaction** | STRENGTH | 8 field patterns auto-redacted |
