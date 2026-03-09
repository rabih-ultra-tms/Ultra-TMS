# Test 6: Task/Issue Deduplication Report

**Date:** 2026-03-09
**Scope:** All 38 hub files in `dev_docs_v3/01-services/` + `_CROSS-CUTTING-ADDENDUM.md`
**Grade: 7/10** (Good, with notable gaps)

---

## A: Task ID Uniqueness

**Total task IDs found:** ~571 across 38 hub files (37 with tasks + Health with 0)
**Unique IDs:** ~571 (no exact duplicates found)
**Exact Duplicate IDs:** 0

### Prefix Collisions (Same prefix, different services)

| Prefix | Service 1 | ID Range | Service 2 | ID Range | Overlap? |
|--------|-----------|----------|-----------|----------|----------|
| **COMM-** | Commission (#08) | COMM-101 → COMM-113 | Communication (#12) | COMM-001 → COMM-016 | **No overlap in numbers** but ambiguous prefix |
| **CPORT-** | Customer Portal (#13) | CPORT-001 → CPORT-018 | Carrier Portal (#14) | CPORT-101 → CPORT-123 | **No overlap in numbers** but ambiguous prefix |

**Assessment:** While no actual ID collisions exist (number ranges don't overlap), two prefix collisions create ambiguity. When someone references "COMM-105" or "CPORT-015", it's unclear which service owns it without checking the number range. **Recommend renaming:** Communication → `COMMS-` or `NOTIF-`; Carrier Portal → `CPRT-` or `CARPORT-`.

### Cross-Cutting Prefixes (By Design — Shared Across Hubs)

| Prefix | Purpose | Appears In |
|--------|---------|------------|
| **QS-** | Quality Sprint tasks | Auth (#01), TMS Core (#05), Carrier (#06), Accounting (#07), Analytics (#19) |
| **BUG-** | Bug tracker | Auth (#01), CRM (#03), Carrier (#06) |
| **CC-** | Command Center | Command Center (#39) only |

These are intentional cross-references, not duplicates. QS- and BUG- tasks are sprint-level items referenced from the relevant hub.

### Cross-Hub Task References (Not Duplicates)

- AUTH-104 listed as "Completed" in Dashboard (#02) hub — it's a cross-reference to Auth's task, not a duplicate
- QS-001, QS-003, QS-005, QS-008, QS-012, QS-013 referenced in multiple hubs — these are Quality Sprint tasks

### Complete Prefix Registry (38 Services)

| # | Service | Prefix | Task Count |
|---|---------|--------|------------|
| 01 | Auth & Admin | AUTH- | ~11 |
| 02 | Dashboard Shell | DASH- | ~8 |
| 03 | CRM | CRM- | ~14 |
| 04 | Sales & Quotes | SALES- | ~11 |
| 05 | TMS Core | TMS- | ~21 |
| 06 | Carrier Management | CARR- | ~14 |
| 07 | Accounting | ACC- | ~16 |
| 08 | Commission | COMM- | ~13 |
| 09 | Load Board | LB- | ~14 |
| 10 | Claims | CLM- | ~13 |
| 11 | Documents | DOC- | ~17 |
| 12 | Communication | COMM- | ~15 |
| 13 | Customer Portal | CPORT- | ~18 |
| 14 | Carrier Portal | CPORT- | ~17 |
| 15 | Contracts | CONT- | ~23 |
| 16 | Agents | AGT- | ~26 |
| 17 | Credit | CRED- | 23 |
| 18 | Factoring | FACT- | 18 |
| 19 | Analytics | ANA- | 20 |
| 20 | Workflow | WF- | 24 |
| 21 | Integration Hub | INT- | 18 |
| 22 | Search | SRCH- | 18 |
| 23 | HR | HR- | ~17 |
| 24 | Scheduler | SCHED- | ~15 |
| 25 | Safety | SAFE- | ~22 |
| 26 | EDI | EDI- | ~16 |
| 27 | Help Desk | HD- | ~28 |
| 28 | Feedback | FB- | ~7 |
| 29 | Rate Intelligence | RATE- | ~22 |
| 30 | Audit | AUD- | ~6 |
| 31 | Config | CFG- | ~15 |
| 32 | Cache | CACHE- | ~17 |
| 33 | Super Admin | SA- | 9 |
| 34 | Email | EMAIL- | 4 |
| 35 | Storage | STOR- | 6 |
| 36 | Redis | REDIS- | 5 |
| 37 | Health | (none) | 0 |
| 38 | Operations | OPS- | 7 |
| 39 | Command Center | CC- | ~25 |

---

## B: Cross-Cutting Issue Coverage

### Specific Cross-Cutting Findings vs Hub Coverage

The `_CROSS-CUTTING-ADDENDUM.md` contains 37 findings (CCF-001 through CCF-037). Key findings with verifiable service counts:

| Finding | Description | Confirmed In (per addendum) | Actually Found In | Status |
|---------|-------------|---------------------------|-------------------|--------|
| **CCF-004** | Cross-tenant mutations missing tenantId | 3 (Auth, CRM, Sales) | **9+** (Auth, CRM, Sales, Accounting, Carrier Portal, Contracts, Agents, Cache, Operations, Search) | **UNDERCOUNT** — addendum says 3 but tribunal found 9+ affected services |
| **CCF-011** | Soft-delete gaps in dashboard/analytics | 4 (Accounting, Commission, Carrier Portal, Customer Portal) | **15+** (also HR, Scheduler, EDI, Feedback, Audit, Config, Cache, Search, Dashboard, Rate Intelligence, Analytics) | **SEVERE UNDERCOUNT** — nearly all services have soft-delete gaps |
| **CCF-016/026/028/035** | "No tests" claims false | 22 services (universal) | Confirmed in hubs: Dashboard, Sales, TMS Core, Carriers, Commission, Communication, Super Admin + others | **Accurate** — CCF consolidated this correctly |
| **CCF-017** | RolesGuard gaps in financial controllers | Accounting confirmed, Commission clean | **12+** (Accounting, Load Board, Claims, Contracts, Agents, HR, Safety, EDI, Help Desk, Feedback, Rate Intelligence, Audit, Config, Cache) | **SEVERE UNDERCOUNT** — extends far beyond financial controllers |
| **CCF-022** | Soft-delete confirmed in 3rd service | 3 (Accounting, Dashboard, Commission) | Same 15+ as CCF-011 | **UNDERCOUNT** — should reference CCF-011's full scope |
| **CCF-031** | Prisma model naming mismatches | 3 (Communication, Commission, Carrier) | Not independently verified in all hubs | Likely accurate |
| **CCF-034/036** | Tenant isolation in non-CRUD queries | Cache, Search, Operations | 3 confirmed | **Accurate** |

### Cross-Cutting Issues That SHOULD Appear in Every Affected Hub

| Pattern | Expected In | Appears In Hub Section 11? | Missing From |
|---------|-------------|---------------------------|--------------|
| **Tenant isolation (tenantId missing)** | CRM, Sales, Accounting, Carrier Portal, Contracts, Agents, Cache, Operations, Search | Yes in: CRM, Sales, Accounting, Carrier Portal, Contracts, Agents, Cache, Operations | Possibly missing from: Search (needs verification) |
| **RolesGuard gaps** | Accounting, Load Board, Claims, Contracts, Agents, HR, Safety, EDI, Help Desk, Feedback, Rate Intelligence, Audit, Config, Cache | Yes in all listed | Coverage appears complete in corrected hubs |
| **Soft-delete gaps** | Dashboard, Accounting, Commission, HR, Scheduler, EDI, Feedback, Audit, Config, Cache, Rate Intelligence, Analytics, Search | Yes in most | Coverage appears complete post-tribunal |
| **Plaintext credentials** | EDI (ftpPassword), Rate Intelligence (apiKey/apiSecret/password), Email (MFA code in log) | Yes in all 3 | None missing |

---

## C: Strikethrough Consistency

### All Struck-Through Issues Found

| Hub | Struck-Through Issue | Reason Given? |
|-----|---------------------|---------------|
| **Carrier (#06)** | ~~window.confirm() in carrier files~~ | Yes — "no `window.confirm` found" |
| **Carrier (#06)** | ~~Carriers list is 858-line monolith~~ | Yes — "actually 594 LOC with separate columns.tsx and actions-menu" |
| **Carrier (#06)** | ~~No frontend tests for carrier pages~~ | Yes — "1 Playwright E2E test + regression test exist" |
| **Safety (#25)** | ~~No integration tests for FMCSA external API calls~~ | Yes — "RECLASSIFIED: FMCSA API client is a stub" |
| **Safety (#25)** | ~~Scoring engine formula/weights undocumented~~ | Yes — "RESOLVED" |
| **Safety (#25)** | ~~Safety module not registered in app.module~~ | Yes — "FALSE" |
| **Claims (#10)** | ~~SubrogationRecord undocumented~~ | Yes — "FIXED" |

**Total struck-through issues:** 7
**With reason:** 7 (100%)
**Without reason:** 0

### Contradictions (Open in One Hub, Closed in Another)

| Issue | Hub A (Status) | Hub B (Status) | Contradiction? |
|-------|---------------|----------------|----------------|
| "No tests" for carriers | Carrier (#06) — ~~STRUCK~~ | CCF-016 — universal pattern | **No** — Carrier correctly struck it; CCF-016 confirms the pattern was systematically wrong |
| Soft-delete gaps | Dashboard (#02) — OPEN | CCF-011/022 — confirmed open | **No** — consistent |

**Contradictions found: 0** — All struck-through issues are consistently handled across hubs.

---

## D: Task-to-Issue Traceability

### Issues WITH Matching Tasks (Good Coverage)

Most P0 and P1 issues in corrected hub files have corresponding tasks in Section 12. Examples of good traceability:

| Hub | Issue | Matching Task |
|-----|-------|---------------|
| Auth (#01) | localStorage token storage (XSS) | QS-005 (completed) / AUTH-103+ |
| TMS Core (#05) | WebSocket gateways not implemented | QS-001 |
| Accounting (#07) | Cross-tenant bugs in PaymentReceived | ACC-201 through ACC-205 |
| Accounting (#07) | RolesGuard missing on 6 controllers | ACC-201+ |
| Cache (#32) | 8/20 endpoints missing tenantId | CACHE-101 |
| Operations (#38) | getByCarrier() missing tenantId | OPS-001 |
| Operations (#38) | getSimilarLoads() missing tenantId | OPS-002 |
| Super Admin (#33) | findMany missing deletedAt filter | SA-001 |
| EDI (#26) | 4 controllers missing RolesGuard | EDI-013 |
| EDI (#26) | ftpPassword in plaintext | EDI-015 |

### Issues WITHOUT Matching Tasks (Gaps)

These open issues in Section 11 have **no corresponding task in Section 12** to address them:

| Hub | Issue | Priority | Gap Risk |
|-----|-------|----------|----------|
| Auth (#01) | 19 `any` types in auth module | P3 | Low |
| Auth (#01) | SocialLoginButtons — text only, no OAuth | P3 | Low |
| Dashboard (#02) | 0% test coverage on 4,225+ LOC | P1 | **High** — no task to add tests |
| Dashboard (#02) | DashboardWidget uses hard delete | P2 | Medium |
| Dashboard (#02) | `useQuoteStats()` uses manual `response.data` | P2 | Low |
| CRM (#03) | Activity timeline hardcoded limit=50 | P2 | Low |
| CRM (#03) | LeadsPipeline logs console.error on drag fail | P2 | Low |
| Sales (#04) | 3 different envelope unwrapping patterns | P2 | Low |
| TMS Core (#05) | Loads list page title says "Dispatch Board" | P2 | Low (cosmetic) |
| Commission (#08) | Multi-step operations lack $transaction | P2 | Medium |
| Load Board (#09) | DAT TMS API not integrated | P1 | Medium — no task |
| Load Board (#09) | Truckstop.com API not integrated | P1 | Medium — no task |
| Customer Portal (#13) | No frontend portal exists at all | P0 | **Critical** — CPORT tasks exist but unclear coverage |
| Carrier Portal (#14) | Mobile-optimized design not started | P1 | Low — deferred |
| Rate Intelligence (#29) | DAT/Truckstop/Greenscreens API contracts not signed | P0 External | Blocked — external dependency |
| Health (#37) | Hardcoded version "1.0.0" | INFO | None — CONFIRM verdict |

**Estimated issues without tasks:** ~30-40 across all hubs (mostly P2-P3 severity)

### Tasks WITHOUT Corresponding Issues

Most tasks trace to either a known issue or a feature build requirement. A few task categories exist purely as backlog items without a Section 11 issue:

- **Frontend build tasks** (e.g., HR-004 through HR-017, SCHED-201+, SAFE-001+) — These are feature-build tasks for P3 services with no frontend. No corresponding "bug" issue because it's planned future work.
- **Testing tasks** (e.g., OPS-003, SCHED-301+) — Coverage improvement tasks, not tied to specific bugs.

These are appropriate — not every task needs to originate from a bug report.

---

## Summary: Organizational Hygiene Assessment

### Grade: **7/10** (Good, with notable gaps)

### Strengths

1. **No exact duplicate task IDs** across 571+ tasks — impressive for 38 services
2. **Consistent prefix patterns** — every service uses a clear, recognizable prefix
3. **100% strikethrough compliance** — all 7 struck-through issues have documented reasons
4. **Zero contradictions** — no issue is struck through in one hub but open in another
5. **Strong P0/P1 traceability** — most critical issues have matching tasks

### Issues Found

1. **2 prefix collisions** (COMM-, CPORT-) — no ID overlap yet, but a maintenance risk
2. **Cross-cutting undercounts** — CCF-004 says "3 services" but 9+ are affected; CCF-017 says "financial controllers" but 12+ services have RolesGuard gaps; soft-delete affects 15+ not 3
3. **~30-40 open issues with no task** — mostly P2-P3, but includes some P1 items (Dashboard 0% test coverage, Load Board API integrations)
4. **Cross-cutting prefix ambiguity** — QS- and BUG- tasks appear in multiple hubs without a central registry

### Recommendations

1. **Rename prefixes:** Communication → `NOTIF-`, Carrier Portal → `CPRT-` to eliminate collision risk
2. **Update cross-cutting addendum** to reflect actual affected service counts discovered during per-service tribunal
3. **Create tasks for orphaned P1 issues:** Dashboard test coverage, Load Board API integrations
4. **Add a central task registry** (single file mapping all prefixes to services) to prevent future collisions
5. **Re-audit CCF service counts** — the addendum was written incrementally and undercounts were never corrected as more services were audited
