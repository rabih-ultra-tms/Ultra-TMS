# PST-16: Agents — Per-Service Tribunal Audit

> **Date:** 2026-03-08 | **Auditor:** Claude Opus 4.6 | **Verdict:** MODIFY | **Health Score:** 6.5/10 (was 2.0)

---

## Phase 1: Hub vs Reality — Factual Comparison

### Endpoint Count

| Source | Count | Match? |
|--------|-------|--------|
| Hub Section 4 | 43 | ✅ MATCHES (includes duplicate `/agents/rankings` in both AgentsController and CommissionsController) |
| Actual (6 controllers) | 43 (42 unique + 1 duplicate) | — |

**Breakdown:**

| Controller | Hub | Actual | Match? |
|-----------|-----|--------|--------|
| AgentsController | 13 | 13 | ✅ |
| AgentAgreementsController | 6 | 6 | ✅ |
| CustomerAssignmentsController | 8 | 8 | ✅ |
| AgentLeadsController | 8 | 8 | ✅ |
| AgentCommissionsController | 3 | 3 | ✅ |
| AgentStatementsController | 4 | 4 | ✅ |

**Endpoint count: 100% accurate.** 5th perfect count match after Documents (20), Communication (30), Claims (39), Contracts (58).

### Endpoint Paths

Hub paths verified against actual controller decorators:

- **AgentsController**: All 13 paths correct ✅
- **AgentAgreementsController**: All 6 paths correct ✅
- **CustomerAssignmentsController**: All 8 paths correct ✅
- **AgentLeadsController**: All 8 paths correct ✅
- **AgentCommissionsController**: All 3 paths correct ✅
- **AgentStatementsController**: All 4 paths correct ✅

**Path accuracy: ~100%.** Best path accuracy of any service audited. Every route prefix, parameter, and method matches.

### Prisma Models

| Source | Count | Match? |
|--------|-------|--------|
| Hub Section 8 | 9 models | ✅ |
| Actual schema | 9 models | — |

**Model names: 9/9 correct (100%).** Agent, AgentAgreement, AgentCommission, AgentCustomerAssignment, AgentLead, AgentPayout, AgentContact, AgentDrawBalance, AgentPortalUser — all verified.

### Data Model Field Accuracy

| Model | Hub Fields | Actual Fields | Accuracy | Notes |
|-------|-----------|---------------|----------|-------|
| Agent | 43 | 47 | ~90% | Missing PLATINUM tier value (hub says 3 tiers, actual has 4) |
| AgentAgreement | ~24 | 21 | ~85% | Hub inflates field count slightly |
| AgentCommission | ~20 | 25 | ~80% | Hub misses commissionPeriod detail |
| AgentCustomerAssignment | ~18 | 19 | ~95% | Very accurate |
| AgentLead | ~22 | 26 | ~85% | Missing city, assignedAt, assignedTo |
| AgentPayout | ~15 | 16 | ~95% | Very accurate |
| AgentContact | ~11 | 11 | ~100% | Perfect match |
| AgentDrawBalance | ~9 | 9 | ~100% | Perfect match |
| AgentPortalUser | ~12 | 12 | ~100% | Perfect match |

**Overall data model accuracy: ~90%.** Best of any service with 9+ models.

### Enums

| Source | Count | Match? |
|--------|-------|--------|
| Hub Section 1 | 10 enums | ✅ |
| Actual schema | 10 enums | — |

**Error:** Hub lists `AgentTier` with 3 values (STANDARD, SILVER, GOLD). Actual has **4** values (STANDARD, SILVER, GOLD, **PLATINUM**). Minor omission.

### Tests

| Source | Claim | Actual | Match? |
|--------|-------|--------|--------|
| Hub Section 2 | "None" / "Zero test files" | 6 spec files, 28 test cases, 453 LOC | ❌ FALSE |

**11th false "no tests" claim across all services.** The 6 spec files are real unit tests with proper mocking (PrismaService, EventEmitter2), assertions, and error case coverage. Not stubs.

Note: Tests could not be executed due to Windows path matching issue in Jest config, but code inspection confirms they are valid unit tests.

### Frontend

| Source | Claim | Actual | Match? |
|--------|-------|--------|--------|
| Hub Section 2 | "Not Built — no pages, no components, no hooks" | 0 pages, 0 components, 0 hooks | ✅ TRUE |

**Frontend "Not Built" claim: 100% accurate.** Second consecutive service with fully correct frontend assessment (after Contracts).

### Known Issues Verification

| # | Hub Issue | Actual Status | Verdict |
|---|-----------|---------------|---------|
| 1 | No frontend pages | TRUE ✅ | Correctly identified |
| 2 | No hooks or components | TRUE ✅ | Correctly identified |
| 3 | No tests for any controller | FALSE ❌ | 6 spec files / 28 tests exist |
| 4 | Agent portal no UI | TRUE ✅ | Schema only, no portal pages |
| 5 | Rankings duplicated in 2 controllers | TRUE ✅ | Confirmed: both AgentsController and CommissionsController register GET /agents/rankings |
| 6 | Commission calculation logic unverified | TRUE ✅ | Service only reads/aggregates, no calculation logic found |
| 7 | Statement PDF generation unverified | PARTIALLY TRUE | Simple text-to-PDF buffer exists (not a real PDF template) |
| 8 | Draw balance tracking unverified | TRUE ✅ | Model exists, no automated tracking/cron found |
| 9 | Sunset schedule execution unverified | TRUE ✅ | JSON stored, no cron/job to apply rate reductions |
| 10 | Lead conversion unverified | FALSE ❌ | `/convert` WORKS — creates customer assignment with PRIMARY type, 12-month protection, ACTIVE status |
| 11 | AgentType enum mismatch | TRUE ✅ | Enum has REFERRING/SELLING/HYBRID, business docs reference INTERNAL/EXTERNAL |

**Known issues accuracy: 8/11 correct (73%).** 2 false claims (tests exist, lead conversion works), 1 partially true.

---

## Phase 2: Security Audit

### Guard Coverage

| Controller | JwtAuthGuard | RolesGuard | Agent Self-Access | Security Rating |
|-----------|-------------|------------|-------------------|----------------|
| AgentsController | ✅ | ✅ | ✅ `ensureAgentSelfAccess()` | FULL |
| AgentAgreementsController | ✅ | ❌ MISSING | ❌ | **BROKEN** |
| CustomerAssignmentsController | ✅ | ❌ MISSING | ❌ | **BROKEN** |
| AgentLeadsController | ✅ | ❌ MISSING | ❌ | **BROKEN** |
| AgentCommissionsController | ✅ | ✅ | ✅ `ensureAgentSelfAccess()` | FULL |
| AgentStatementsController | ✅ | ✅ | ✅ `ensureAgentSelfAccess()` | FULL |

**3/6 controllers missing RolesGuard.** @Roles decorators exist on methods but are decorative without the guard. Any authenticated user can access agreements, assignments, and leads endpoints.

### Tenant Isolation

| Service | tenantId Coverage | Gap? |
|---------|------------------|------|
| AgentsService | ✅ All queries filtered | No |
| AgentAgreementsService | ✅ All queries filtered | No |
| CustomerAssignmentsService | ✅ All queries filtered | No |
| AgentLeadsService | ✅ All queries filtered | No |
| AgentCommissionsService | ⚠️ `rankings()` leaks | **YES** |
| AgentStatementsService | ✅ All queries filtered | No |

**CRITICAL BUG:** `AgentCommissionsService.rankings()` — after grouping commissions by agentId (with tenantId filter), it fetches agent details with `agent.findMany({ where: { id: { in: agentIds } } })` — **missing tenantId filter**. Could leak agent names from other tenants into rankings response.

### Soft-Delete Compliance

| Table | Has deletedAt? | Queries filter it? | Status |
|-------|---------------|--------------------:|--------|
| Agent | ✅ Yes | ✅ `findAll`, `requireAgent` | COMPLIANT |
| AgentAgreement | ❌ No field | N/A | NO FIELD (by design?) |
| AgentCommission | ❌ No field | N/A | NO FIELD |
| AgentCustomerAssignment | ❌ No field | N/A | NO FIELD |
| AgentLead | ❌ No field | N/A | NO FIELD |
| AgentPayout | ❌ No field | N/A | NO FIELD |
| AgentContact | ❌ Uses `isActive` | Deactivate only | ALTERNATIVE PATTERN |
| AgentDrawBalance | ❌ No field | N/A | NO FIELD |
| AgentPortalUser | ❌ Uses `status` | N/A | ALTERNATIVE PATTERN |

**Only 1/9 models has deletedAt.** However, this may be by design — child records (agreements, commissions, leads, etc.) are managed through status workflows (TERMINATED, VOIDED, REJECTED) rather than soft-delete. The Agent parent has soft-delete; children use status-based lifecycle. This is a valid pattern but inconsistent with the project's general soft-delete convention.

---

## Phase 3: Architecture & Code Quality

### Module Structure

Clean domain-driven decomposition:
- 6 subfolders (agents, agreements, assignments, commissions, leads, statements)
- Each has: controller + service + DTOs + spec file
- Total: ~2,332 LOC production + 453 LOC tests
- 23 DTO files with proper validation decorators

### Strengths

1. **Clean domain separation** — 6 submodules with clear boundaries
2. **Comprehensive business logic** — lead pipeline, customer assignments with protection/sunset, commission tracking, statement generation, draw balances
3. **Good helper patterns** — `requireAgent()`, `requireLead()`, `requireAssignment()` prevent code duplication
4. **Event-driven** — agent.created, agent.activated events emitted via EventEmitter2
5. **Auto-generated codes** — A-0001 (agents), AG-YYYY-0001 (agreements), AL-YYYYMM-0001 (leads)
6. **Agent self-access control** — 3 controllers verify AGENT role users can only access their own data

### Weaknesses

1. **3 controllers missing RolesGuard** — agreements, assignments, leads all have `@Roles` decorators but no `RolesGuard` to enforce them
2. **Tenant leak in rankings** — missing tenantId filter on agent detail fetch
3. **No commission calculation engine** — commission records exist but no service calculates them from load data
4. **No sunset automation** — sunset schedule stored as JSON but no cron/job to apply rate reductions
5. **No draw tracking automation** — AgentDrawBalance model exists but no automated shortfall calculation
6. **Statement PDF is text-only** — `generatePdf()` creates a simple text buffer, not a formatted PDF
7. **Module not exported** — `agents.module.ts` exports nothing, preventing other modules from consuming agent services
8. **Duplicate rankings endpoint** — registered in both AgentsController and CommissionsController

---

## Phase 4: Hub Accuracy Assessment

### Section-by-Section Scoring

| Section | Accuracy | Notes |
|---------|----------|-------|
| 1. Status Box | 85% | Correct except "Tests: None" (should be 28 tests), missing PLATINUM tier |
| 2. Implementation Status | 90% | "Tests: None" is false; rest accurate |
| 3. Screens | 100% | All 8 screens correctly listed as "Not Built" |
| 4. API Endpoints | ~100% | All 43 endpoints with correct methods, paths, and controllers |
| 5. Components | 100% | Correctly lists 10 components as "Not Built" |
| 6. Hooks | 100% | Correctly lists 10 hooks as "Not Built" |
| 7. Business Rules | 95% | 15 rules, all substantively accurate. Minor: AgentType enum vs INTERNAL/EXTERNAL noted |
| 8. Data Model | 90% | All 9 models listed with correct names. Field accuracy ~90%. Missing PLATINUM tier |
| 9. Validation Rules | 95% | Accurate DTO constraints |
| 10. Status States | 100% | All 6 status machines correctly documented |
| 11. Known Issues | 73% | 8/11 correct, 2 false (tests, lead conversion), 1 partial |
| 12. Tasks | 90% | Reasonable task breakdown, effort estimates plausible |
| 13. Design Links | 100% | All 9 spec files correctly referenced |
| 14. Delta | 95% | Accurate assessment of hub vs original scope |
| 15. Dependencies | 95% | Correct dependency mapping |

### Overall Hub Accuracy: ~92%

**This is the MOST ACCURATE hub of all 16 services audited.** Previous best was Claims at ~87%.

Key accuracy achievements:
- Endpoint count: 100% (5th perfect match)
- Endpoint paths: ~100% (best path accuracy ever)
- Model names: 100% (9/9)
- Model count: 100% (9/9)
- Enum count: 100% (10/10)
- Frontend assessment: 100% accurate

Key errors:
- Tests: "None" → 28 tests / 6 spec files (11th false claim)
- AgentTier: Missing PLATINUM value
- Lead conversion: "Unverified" but it works
- No security analysis in hub (3 controllers missing RolesGuard, 1 tenant leak)

---

## Phase 5: Tribunal Verdict

### Score Breakdown

| Dimension | Score | Notes |
|-----------|-------|-------|
| Backend Architecture | 8/10 | Clean 6-submodule domain separation, good helpers |
| Security (Guards) | 5/10 | 3/6 controllers missing RolesGuard |
| Tenant Isolation | 8/10 | 1 leak (rankings), rest fully filtered |
| Soft Delete | 5/10 | Only Agent has deletedAt; children use status patterns |
| API Completeness | 9/10 | 43 endpoints covering full agent lifecycle |
| Tests | 5/10 | 28 tests exist but can't execute; coverage is shallow |
| Frontend | 0/10 | Zero pages, components, or hooks |
| Hub Documentation | 9/10 | Most accurate hub of all 16 services |

### Health Score: 6.5/10 (was 2.0 — hub's "D (2/10)" rating)

**Score delta: +4.5** (3rd largest jump after Carrier Portal +5.0 and Communication +4.5)

The hub's 2/10 rating was based on "Frontend Not Built" dominating the score. Reality: the backend is a well-structured, feature-rich module with 43 endpoints, 9 models, and 28 tests. The 6.5 reflects strong backend architecture dragged down by zero frontend, security gaps in 3 controllers, and missing automation (commission calc, sunset cron, draw tracking).

### Verdict: MODIFY

### Action Items

| # | Priority | Action | Target |
|---|----------|--------|--------|
| 1 | P0 | Add RolesGuard to AgentAgreementsController | `agreements/agent-agreements.controller.ts:10` |
| 2 | P0 | Add RolesGuard to CustomerAssignmentsController | `assignments/customer-assignments.controller.ts:16` |
| 3 | P0 | Add RolesGuard to AgentLeadsController | `leads/agent-leads.controller.ts:17` |
| 4 | P0 | Fix tenant leak in AgentCommissionsService.rankings() | `commissions/agent-commissions.service.ts:64` — add tenantId to agent.findMany where clause |
| 5 | P1 | Remove duplicate rankings endpoint | One of AgentsController or CommissionsController should own `/agents/rankings`, not both |
| 6 | P1 | Update hub Section 1: Tests "None" → "6 spec files, 28 tests, 453 LOC" | `16-agents.md` Section 1 + 2 |
| 7 | P1 | Update hub: AgentTier add PLATINUM value | `16-agents.md` Section 8 |
| 8 | P1 | Update hub: Lead conversion VERIFIED — creates assignment with proper defaults | `16-agents.md` Section 11, issue #10 |
| 9 | P2 | Add `ensureAgentSelfAccess()` to AgentLeadsController | Agents can currently submit/view leads for other agents |
| 10 | P2 | Export AgentsService from module | Enable other modules to consume agent data |
| 11 | P2 | Implement commission calculation trigger | Currently no service computes commissions from load data |
| 12 | P2 | Implement sunset cron job | `sunsetSchedule` JSON stored but never executed |

---

## Cross-Cutting Patterns (Cumulative)

| Pattern | Occurrences | Services |
|---------|-------------|----------|
| False "no tests" claim | 11 | Auth, Dashboard, CRM, Sales, TMS Core, Carrier, Load Board, Customer Portal, Communication, Carrier Portal, **Agents** |
| Missing RolesGuard | 6+ services | Carrier, Load Board, Customer Portal, Accounting, Contracts, **Agents** (3 controllers) |
| Tenant isolation gap | 5+ services | CRM, Sales, Accounting, Carrier Portal, **Agents** (rankings) |
| Endpoint count accurate | 5 perfect | Documents (20), Communication (30), Claims (39), Contracts (58), **Agents (43)** |
| Hub score too low | 12+ services | Nearly all — hub systematically underrates backend quality |
