# Plan Gaps Analysis

**Project:** Ultra TMS - 3PL Logistics Platform
**Review Date:** 2026-02-07
**Reviewer:** Claude Opus 4.6
**Scope:** Identification of structural gaps in the current development plan

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [GAP-001: No Week-by-Week Task Breakdown](#gap-001)
3. [GAP-002: No Centralized API Contract Registry Connecting FE-BE](#gap-002)
4. [GAP-003: No Code-Linkable Business Rules Reference](#gap-003)
5. [GAP-004: No MVP Prioritization Applied to Screens](#gap-004)
6. [GAP-005: No Dependency Graph for Module Build Order](#gap-005)
7. [GAP-006: No Integration Testing Plan](#gap-006)
8. [GAP-007: No Deployment or DevOps Strategy](#gap-007)
9. [GAP-008: No Data Migration Plan](#gap-008)
10. [GAP-009: No Error Budget or SLA Targets for MVP](#gap-009)
11. [GAP-010: No Developer Onboarding or Bus Factor Mitigation](#gap-010)
12. [Gap Priority Matrix](#gap-priority-matrix)

---

## 1. Executive Summary

The Ultra TMS development plan has **strong strategic vision** (93 documentation files, 38 service specifications, 362 screen catalog, 89 design specs) but **weak tactical execution readiness**. The plan tells developers *what* to build across 78 weeks, but does not tell them *how* to build it day-by-day, *in what order* modules depend on each other, or *how to verify* that what they built works correctly across module boundaries.

**10 structural gaps** have been identified. The top 3 by impact are:

1. **GAP-004 (No MVP Prioritization):** Without P0/P1/P2/P3 tiers, every feature appears equally important, leading to scope creep and misallocated effort.
2. **GAP-005 (No Dependency Graph):** Without knowing that Accounting depends on TMS Core depends on CRM, developers risk building features that reference unfinished upstream modules.
3. **GAP-006 (No Integration Testing Plan):** With 38 modules that must work together, the absence of cross-module testing means defects will compound silently until late in Phase A.

**Total estimated effort to close all gaps: 80-120 hours (2-3 weeks of one developer's time).**

---

## GAP-001: No Week-by-Week Task Breakdown {#gap-001}

### Description

The roadmap (`dev_docs/05-roadmap/53-roadmap-phase-a.md`) defines sprints with checkbox task lists at the feature level (e.g., "Quote entity & workflow", "Rate table structure"), but does not break these down into:

- Individual developer assignments
- Day-level or half-week-level task estimates
- Story point sizing or hour estimates per task
- Acceptance criteria per task (only per sprint)

### Evidence

From `dev_docs/05-roadmap/53-roadmap-phase-a.md`, Sprint 9-12 (Sales Module, Weeks 17-24):

```
Week 17-18:
[ ] Quote entity & workflow
[ ] Rate table structure
[ ] Lane-based pricing
[ ] Quote builder UI
```

Each checkbox represents 15-40 hours of work but is presented as a single line item. "Quote builder UI" alone involves a multi-step form, rate lookup, margin calculation display, approval workflow UI, and PDF generation -- easily 40+ hours.

No individual week files exist under `dev_docs/05-roadmap/phase-a/` despite the roadmap overview (`52-roadmap-overview.md`) referencing paths like `./phase-a/week-01.md` through `./phase-a/week-78.md`.

### Impact

- **Severity: Medium-High**
- Developers cannot estimate how much work fits into a given week
- Sprint progress is binary (done/not done) with no intermediate visibility
- Risk of "90% done" syndrome where features appear close to completion but have significant remaining work
- No mechanism to identify that a sprint is falling behind until the sprint is over

### Recommended Fix

Create a lightweight sprint planning template with:

1. Task breakdown to 4-8 hour chunks
2. Developer assignment (Dev A / Dev B)
3. Estimated hours per task
4. Dependencies between tasks within a sprint
5. Done criteria per task

**Template:**
```markdown
## Week 17: Quote Module Backend

### Dev A Tasks (30 hrs)
- [ ] Quote Prisma model + migration (4h)
- [ ] QuoteService CRUD methods (6h)
- [ ] QuoteController with DTOs + validation (4h)
- [ ] Quote status state machine (6h)
- [ ] Unit tests for QuoteService (4h)
- [ ] Rate table data model + seed data (6h)

### Dev B Tasks (30 hrs)
- [ ] Quote list page with DataTable (6h)
- [ ] Quote detail page layout (4h)
- [ ] Quote builder form (multi-step) (8h)
- [ ] Rate lookup API integration (4h)
- [ ] Quote status badge component (2h)
- [ ] Quote list filters + search (6h)
```

### Effort to Fix

**20-30 hours** to create detailed task breakdowns for the next 12 weeks (current sprint through TMS Core). Future weeks can be planned 2-4 weeks in advance using rolling wave planning.

---

## GAP-002: No Centralized API Contract Registry Connecting FE-BE {#gap-002}

### Description

The API contract registry (`dev_docs/09-contracts/76-screen-api-contract-registry.md`) exists and is well-structured, mapping 324 screens to their required API endpoints with request/response formats. However, it has critical gaps:

1. **Status tracking is all "Not Started"** -- every screen shows empty status checkboxes for DB/API/FE/INT/VER, meaning the registry is not being maintained as development progresses
2. **No versioning** -- contracts are defined but there is no mechanism to track when a contract changes and whether the frontend/backend have been updated to match
3. **No link to actual code** -- the registry references endpoints like `POST /api/v1/auth/login` but does not link to the actual controller file (`apps/api/src/modules/auth/auth.controller.ts`) or the frontend API client call
4. **Part 2 exists** (`77-screen-api-contract-registry-part2.md`) but the split creates navigation friction

### Evidence

From `dev_docs/09-contracts/76-screen-api-contract-registry.md`, Screen 01.01 (Login):

```
| Status | DB  | API | FE  | INT | VER |
|--------|-----|-----|-----|-----|-----|
|        | [ ] | [ ] | [ ] | [ ] | [ ] |
```

But in reality, the Login screen is **fully implemented**: the Prisma User model exists, `auth.controller.ts` has a POST `/auth/login` endpoint, and `apps/web/app/(auth)/login/page.tsx` exists with a working form. The registry does not reflect this.

### Impact

- **Severity: Medium**
- Developers cannot quickly see which screens are already built vs. planned
- No early warning when backend API changes break a frontend screen
- Duplicate effort risk: a developer might re-implement something that already exists because the registry shows everything as "Not Started"
- The Golden Rule #2 ("API Contracts Before Code") from `dev_docs/08-standards/65-development-standards-overview.md` is unenforceable without an up-to-date registry

### Recommended Fix

1. **Update the registry** for all 49 existing page.tsx files and their corresponding API endpoints. Mark DB/API/FE status accurately.
2. **Add code links** to each contract entry:
   ```
   Controller: `apps/api/src/modules/auth/auth.controller.ts:45`
   Frontend: `apps/web/app/(auth)/login/page.tsx`
   ```
3. **Merge Part 1 and Part 2** into a single searchable document or split by service instead of by arbitrary page count.
4. **Automate status tracking** -- consider a script that checks if controller files and page.tsx files exist for registered screens.

### Effort to Fix

**8-12 hours** for initial status update. **4-6 hours** for adding code links. **2 hours** for document restructuring.

---

## GAP-003: No Code-Linkable Business Rules Reference {#gap-003}

### Description

The master guide references a business rules document (`dev_docs/00-master/00-master-development-guide.md`, line 266: `92-business-rules-reference.md`), and the design specs in `dev_docs/12-Rabih-design-Process/` contain status state machines and role-based access matrices. However:

1. **No single canonical business rules file** exists that maps rules to code locations
2. **Business rules are scattered** across design specs, service specs, and the data dictionary
3. **No rule IDs** -- rules cannot be referenced in code comments or test descriptions
4. **Status state machines** are defined in design specs but not validated against the Prisma schema enums

### Evidence

The Prisma schema contains 114 enums (from `dev_docs/Claude-review-v1/01-code-review/02-backend-module-audit.md`), many of which define status workflows. For example, `OrderStatus`, `LoadStatus`, `InvoiceStatus`, `QuoteStatus` all have specific allowed transitions. But there is no document that maps:

- OrderStatus.PENDING can transition to: CONFIRMED, CANCELLED
- OrderStatus.CONFIRMED can transition to: DISPATCHED, CANCELLED
- OrderStatus.DISPATCHED can transition to: IN_TRANSIT, CANCELLED

The design spec for orders (`dev_docs/12-Rabih-design-Process/04-tms-core/02-orders-list.md`) likely contains this, but it is not in a format that developers can quickly reference or validate against the code.

### Impact

- **Severity: Medium-High**
- Developers may implement incorrect status transitions
- Business rules may differ between frontend validation and backend enforcement
- No way to audit whether all defined rules are actually implemented
- Test cases cannot reference specific rule IDs (e.g., "Test BR-ORDER-003: Cancel only allowed before dispatch")

### Recommended Fix

Create `dev_docs/Claude-review-v1/06-gap-analysis/business-rules-registry.md` with:

1. **Rule ID system**: `BR-{SERVICE}-{NUMBER}` (e.g., `BR-TMS-001`, `BR-ACCT-015`)
2. **Status state machine tables** extracted from design specs
3. **Validation rules** extracted from DTOs
4. **Authorization rules** extracted from guards/decorators
5. **Code references** for each implemented rule

### Effort to Fix

**16-24 hours** for initial extraction from existing design specs and code. **Ongoing: 1-2 hours per sprint** to maintain.

---

## GAP-004: No MVP Prioritization Applied to Screens {#gap-004}

### Description

The roadmap lists 362 screens across 38 services. The Phase A plan treats all services as equally important within their scheduled sprint. There is no P0/P1/P2/P3 classification that distinguishes:

- **P0:** What must work for the first paying customer
- **P1:** What should be added within 2 weeks of first customer
- **P2:** What can wait 2 months
- **P3:** What can wait until after Phase A

The service delivery schedule in `dev_docs/05-roadmap/53-roadmap-phase-a.md` does assign P1/P2/P3 to entire services, but not to individual screens within those services.

### Evidence

From `dev_docs/05-roadmap/53-roadmap-phase-a.md` Service Delivery Schedule:

```
| Claims          | 55-58 | P2       |
| Customer Portal | 61-64 | P2       |
| Analytics       | 63-66 | P2       |
| Workflow        | 65-68 | P3       |
```

But within the P1 services (Auth, CRM, Sales, TMS, Carrier, Accounting), every screen is treated as equally mandatory. For example, TMS Core has 15 design specs:

```
00-service-overview.md
01-operations-dashboard.md
02-orders-list.md
03-order-detail.md
04-order-entry.md
05-loads-list.md
06-load-detail.md
07-load-builder.md
08-dispatch-board.md
09-stop-management.md
10-tracking-map.md
11-status-updates.md
12-load-timeline.md
13-check-calls.md
14-appointment-scheduler.md
```

But for MVP, you need Order CRUD (02-04), Load management (05-07), and basic dispatch (08). The tracking map (10), load timeline (12), check calls (13), and appointment scheduler (14) are P1 at best, P2 at worst.

### Impact

- **Severity: Critical**
- Without prioritization, developers will build features sequentially as listed, spending equal time on must-have and nice-to-have screens
- Phase A will reach week 78 with 70% of all features at 80% completion instead of 100% of critical features at 100% completion
- Stakeholders have no mechanism to decide "cut this, keep that" when schedule pressure mounts
- The difference between a shippable MVP and a pile of half-finished features

### Recommended Fix

See `03-mvp-reprioritization.md` for the complete screen-level prioritization. Every screen in the 362-screen catalog should be tagged P0/P1/P2/P3 with clear criteria:

- **P0:** System is unusable without this screen
- **P1:** Users can work around the absence for 2 weeks
- **P2:** Users can work around the absence for 2 months
- **P3:** Postpone to Phase B or later

### Effort to Fix

**8-12 hours** to classify all 362 screens. Requires stakeholder input for 20-30 borderline decisions.

---

## GAP-005: No Dependency Graph for Module Build Order {#gap-005}

### Description

The roadmap specifies a linear build sequence (auth -> CRM -> sales -> TMS -> carrier -> accounting -> ...) but does not document:

1. **Data dependencies** -- which Prisma models reference which other models via foreign keys
2. **API dependencies** -- which backend services call which other services
3. **Feature dependencies** -- which screens require data from which other modules
4. **Circular dependencies** -- where two modules depend on each other

### Evidence

The Prisma schema (`apps/api/prisma/schema.prisma`, 257 models) has extensive foreign key relationships. For example:
- `Load` references `Order`, `Carrier`, `Driver`, `User` (dispatcher), `Tenant`
- `Invoice` references `Load`, `Company` (customer), `Tenant`
- `Order` references `Company` (customer), `Contact`, `Quote`, `Tenant`

But there is no visual or textual map showing these dependencies. A developer building the Invoice module has no quick reference for "I need Order, Load, Company, and Carrier models to be complete before I can build invoicing."

The weekly dependency format in `dev_docs/05-roadmap/52-roadmap-overview.md` mentions:

```
## Dependencies
- Requires: [Previous week/feature]
- Blocks: [Future week/feature]
```

But the individual week files (`phase-a/week-01.md` through `week-78.md`) do not exist, so these dependencies are never instantiated.

### Impact

- **Severity: High**
- Without a dependency graph, parallel development is risky -- two developers might build features that depend on each other's unfinished work
- Sprint planning cannot identify which tasks can run in parallel vs. which must be sequential
- Database migration order is undefined -- adding a foreign key to a table that does not yet exist will fail
- The "build order" is implicit (it follows the sprint sequence) but not explicit (there is no "build X before Y because..." justification)

### Recommended Fix

See `04-dependency-graph.md` for the complete dependency analysis. Key deliverables:

1. **Mermaid dependency diagram** showing all 38 modules and their data/API dependencies
2. **Build order table** with explicit "requires" and "enables" for each module
3. **Critical path identification** -- which module, if delayed, delays the most other modules
4. **Parallel track identification** -- which modules can be built simultaneously

### Effort to Fix

**12-16 hours** for complete dependency analysis. **4-6 hours** for mermaid diagram creation.

---

## GAP-006: No Integration Testing Plan {#gap-006}

### Description

The testing strategy (`dev_docs/08-standards/72-testing-strategy.md`) defines unit testing patterns, service test patterns, and E2E test patterns. However:

1. **No cross-module integration test plan** -- how to test "create order -> assign carrier -> update tracking -> generate invoice" as a workflow
2. **No test data strategy** for integration tests -- which seed data is needed, how test tenants are provisioned
3. **No CI pipeline for tests** -- `turbo.json` has no `test` task defined (noted in `dev_docs/Claude-review-v1/01-code-review/01-architecture-assessment.md`)
4. **Frontend testing gap** -- only ~10 test files for 115+ components

### Evidence

From `dev_docs/Claude-review-v1/01-code-review/01-architecture-assessment.md`:

> "Missing: `test` task. There is no `test` task defined in `turbo.json`, meaning `pnpm --filter api test` and `pnpm --filter web test` are not orchestrated through Turborepo."

From the backend module audit: ~100+ `.spec.ts` files exist but are primarily unit tests for individual services. No files matching patterns like `*.e2e-spec.ts` or `*.integration-spec.ts` for cross-module workflows were identified.

### Impact

- **Severity: High**
- Bugs at module boundaries (e.g., order status change not triggering carrier notification) will go undetected until manual testing or production
- Regression risk increases with each new module -- changing the Order model may break Invoicing without any test catching it
- The plan's Section 12 (Weeks 71-78) allocates testing to the very end, meaning 70 weeks of untested integrations accumulate
- Without a CI test pipeline, broken tests do not block deployments

### Recommended Fix

1. **Define 10-15 critical workflow tests** covering the end-to-end freight brokerage flow:
   - User login -> Create customer -> Create quote -> Convert to order -> Build load -> Assign carrier -> Track load -> Deliver -> Generate invoice -> Receive payment
2. **Create a test database seeding strategy** with `prisma db seed` for integration test data
3. **Add `test` task to `turbo.json`** with proper dependency ordering
4. **Set testing milestones**: 50% coverage by M4, 70% by M6, 80% by M9
5. **Start integration tests now** -- do not defer to weeks 71-78

### Effort to Fix

**16-20 hours** for workflow test design + initial implementation of 3-5 critical path tests. **4-6 hours** for CI pipeline setup.

---

## GAP-007: No Deployment or DevOps Strategy {#gap-007}

### Description

The project has a `docker-compose.yml` for local development (PostgreSQL, Redis, Elasticsearch, Kibana) but no documented strategy for:

1. **Staging environment** -- where to deploy for pre-production testing
2. **Production environment** -- cloud provider, infrastructure, scaling
3. **CI/CD pipeline** -- GitHub Actions workflow files
4. **Environment variable management** -- how secrets move from local to staging to production
5. **Database migration strategy** -- how Prisma migrations run in production
6. **Zero-downtime deployment** -- how to deploy without breaking active users

### Evidence

From `CLAUDE.md` (project root):

```bash
# Development
pnpm dev                          # Start all (web:3000, api:3001)
docker-compose up -d              # Start infra (PostgreSQL, Redis, ES, Kibana)
```

The infrastructure document is referenced at `dev_docs/04-checklists/51-operations-infrastructure-sla.md` but is a planning document, not an implemented strategy.

The roadmap mentions "AWS infrastructure (Terraform)" in Sprint 1-2 but no Terraform files exist in the repository. The first Go-Live (GL-1, Week 6: "Admin & user management live") has no deployment target defined.

### Impact

- **Severity: High**
- Cannot achieve any Go-Live milestone without a deployment target
- First deployment will be chaotic if not planned and practiced
- Environment configuration mismatches (local dev vs. staging vs. production) will cause unexpected failures
- Database migrations in production are risky without a tested rollback strategy
- No monitoring means production issues go undetected

### Recommended Fix

1. **Choose a deployment platform** (Railway, Render, Vercel + separate API host, or AWS with Terraform)
2. **Create GitHub Actions workflows** for:
   - PR checks (lint, type-check, test)
   - Staging deployment (on merge to `develop`)
   - Production deployment (on merge to `main` with approval)
3. **Document environment variable management** -- use platform secrets + `.env.example` files
4. **Test deployment by week 12** -- deploy auth module to staging as a dry run
5. **Set up basic monitoring** -- health checks, error alerting (Sentry or similar)

### Effort to Fix

**20-30 hours** for platform selection, CI/CD setup, and first deployment. **8-12 hours** for documentation and monitoring setup.

---

## GAP-008: No Data Migration Plan {#gap-008}

### Description

The master guide (`dev_docs/00-master/00-master-development-guide.md`) highlights "migration-first architecture" with `external_id`, `source_system`, and `custom_fields` on every entity. Migration playbooks exist (`dev_docs/06-external/58-migration-playbooks.md`) for McLeod and Revenova. However:

1. **No plan for initial data population** -- how does the first tenant get their existing customers, carriers, and rates into the system?
2. **No import tool** -- CSV upload, API-based bulk import, or ETL pipeline
3. **No data validation strategy** -- how to verify imported data is correct
4. **No rollback plan** -- if a migration fails partway, how to recover

### Evidence

The Prisma schema includes migration-ready fields on all entities:

```prisma
externalId    String?    @map("external_id")
sourceSystem  String?    @map("source_system")
customFields  Json       @default("{}")  @map("custom_fields")
```

But there are no API endpoints for bulk data import, no CSV parsing utilities, and no documentation describing the actual migration process for a new customer.

### Impact

- **Severity: Medium**
- A new customer cannot start using the TMS without their existing data (customers, carriers, rates, active loads)
- Manual data entry for hundreds of customers and carriers is not viable
- Data migration is often the longest part of a TMS deployment (2-6 weeks for a medium-sized brokerage)
- Without a plan, migration becomes a custom consulting engagement for every new customer

### Recommended Fix

1. **Build CSV import endpoints** for the core entities: Companies, Contacts, Carriers, Rate Tables
2. **Create import validation rules** -- check for duplicates, validate required fields, report errors
3. **Document the migration checklist** -- what data to export from legacy systems, in what format, what field mappings are needed
4. **Build an import status dashboard** showing progress, errors, and validation results

### Effort to Fix

**24-32 hours** for CSV import implementation (backend endpoints + validation). **8-12 hours** for documentation and migration playbook updates.

---

## GAP-009: No Error Budget or SLA Targets for MVP {#gap-009}

### Description

The success criteria in `dev_docs/05-roadmap/53-roadmap-phase-a.md` lists performance targets:

```
- < 500ms p95 API response
- 99.9% uptime
- < 3s page load
- Support 50 concurrent users
```

But there is no:

1. **Error budget definition** -- what percentage of errors is acceptable during MVP
2. **Monitoring implementation** -- how these metrics will be measured
3. **Alerting strategy** -- who gets paged and when
4. **Performance testing plan** -- how to validate these targets before launch
5. **Degradation strategy** -- what happens when a third-party service (HubSpot, QB, FMCSA) is down

### Impact

- **Severity: Medium**
- Performance targets are aspirational without measurement
- 99.9% uptime (8.7 hours downtime/year) is aggressive for an MVP with 2 developers
- No alerting means production outages go unnoticed until users report them
- Third-party dependency failures (HubSpot rate limits, QB API downtime) will appear as system failures

### Recommended Fix

1. **Lower MVP SLA targets**: 99.5% uptime, < 1s p95 API response, < 5s page load
2. **Implement health check endpoints** (already have `/health` module)
3. **Set up Sentry** for error tracking (free tier sufficient for MVP)
4. **Set up Uptime Robot** or similar for availability monitoring
5. **Define circuit breakers** for HubSpot, QuickBooks, FMCSA integrations

### Effort to Fix

**8-12 hours** for monitoring setup. **4-6 hours** for documentation.

---

## GAP-010: No Developer Onboarding or Bus Factor Mitigation {#gap-010}

### Description

The project relies on 2 developers who have deep context from 4+ weeks of intensive development. There is no:

1. **Developer onboarding guide** -- how a new developer (or the existing developers after a break) would get up to speed
2. **Architecture decision records (ADRs)** -- why specific technology and design choices were made
3. **Code walkthrough documentation** -- how the major modules connect
4. **Bus factor mitigation** -- if one developer is unavailable, can the other continue effectively?

### Evidence

The `CLAUDE.md` file and `dev_docs/00-master/00-master-development-guide.md` provide excellent high-level orientation. But the critical knowledge gap is in the *implemented* architecture decisions:

- Why is auth using dual Redis + DB session storage?
- Why are there `.bak` directories for 4 modules?
- What is the `operations` module vs. the service-specific modules?
- How does the API proxy work between Next.js and NestJS?

These answers exist in the code but are not documented.

### Impact

- **Severity: Medium**
- If one developer leaves or is unavailable for 2+ weeks, project velocity drops by more than 50% due to lost context
- Onboarding a third developer (planned for Phase B) will be slow without documentation
- AI assistants (Claude Code) need context that is currently in developers' heads, not in docs

### Recommended Fix

1. **Create `ARCHITECTURE_DECISIONS.md`** documenting the top 10 architecture choices and their rationale
2. **Document the `.bak` story** -- what was refactored and why
3. **Create a code walkthrough video** (or written guide) covering the request lifecycle: HTTP request -> NestJS guard -> controller -> service -> Prisma -> response
4. **Cross-train developers** -- each developer should be able to work on any module

### Effort to Fix

**8-12 hours** for documentation. **Ongoing** for cross-training.

---

## Gap Priority Matrix

### By Impact x Urgency

| Gap | Impact | Urgency | Priority | Fix Effort |
|-----|--------|---------|----------|------------|
| GAP-004: No MVP Prioritization | Critical | Immediate | **P0** | 8-12 hrs |
| GAP-005: No Dependency Graph | High | Immediate | **P0** | 16-22 hrs |
| GAP-006: No Integration Testing Plan | High | Before TMS Core | **P1** | 20-26 hrs |
| GAP-007: No Deployment Strategy | High | Before GL-3 (Week 20) | **P1** | 28-42 hrs |
| GAP-001: No Task Breakdown | Medium-High | Before next sprint | **P1** | 20-30 hrs |
| GAP-003: No Business Rules Registry | Medium-High | Before TMS Core | **P2** | 16-24 hrs |
| GAP-002: No Up-to-Date Contract Registry | Medium | Before next sprint | **P2** | 14-20 hrs |
| GAP-008: No Data Migration Plan | Medium | Before GL-5 (Week 36) | **P2** | 32-44 hrs |
| GAP-009: No Error Budget/SLA | Medium | Before GL-3 (Week 20) | **P2** | 12-18 hrs |
| GAP-010: No Onboarding/Bus Factor | Medium | Before Phase B | **P3** | 8-12 hrs |

### By Fix Order (Recommended Sequence)

```
Week 1-2 of remediation:
  1. GAP-004: Define MVP tiers (P0/P1/P2/P3)     [8-12 hrs]
  2. GAP-005: Build dependency graph               [16-22 hrs]
  3. GAP-001: Break down next 12 weeks of tasks    [20-30 hrs]

Week 3-4 of remediation:
  4. GAP-007: Set up CI/CD + staging deployment    [28-42 hrs]
  5. GAP-006: Design integration test framework    [20-26 hrs]

Week 5-6 of remediation (parallel with development):
  6. GAP-002: Update API contract registry         [14-20 hrs]
  7. GAP-003: Create business rules registry       [16-24 hrs]
  8. GAP-009: Set up monitoring + define SLAs      [12-18 hrs]

Deferred:
  9. GAP-008: Data migration plan (before GL-5)    [32-44 hrs]
  10. GAP-010: Onboarding docs (before Phase B)    [8-12 hrs]
```

### Total Remediation Effort

| Timeline | Hours | Weeks (at 30 hrs/week, 1 dev) |
|----------|-------|-------------------------------|
| Immediate (P0) | 44-64 hrs | 1.5-2 weeks |
| Before TMS Core (P1) | 68-98 hrs | 2.3-3.3 weeks |
| Before GL-5 (P2) | 74-106 hrs | 2.5-3.5 weeks |
| Before Phase B (P3) | 8-12 hrs | 0.3-0.4 weeks |
| **Grand Total** | **194-280 hrs** | **6.5-9.3 weeks** |

**Recommendation:** Allocate one developer full-time for 2-3 weeks to close P0 and P1 gaps before resuming feature development. The upfront investment pays for itself by preventing rework, missed dependencies, and late-stage integration failures.

---

## Appendix: Source Documents Referenced

| Document | Path |
|----------|------|
| Roadmap Overview | `dev_docs/05-roadmap/52-roadmap-overview.md` |
| Phase A Detail | `dev_docs/05-roadmap/53-roadmap-phase-a.md` |
| Master Development Guide | `dev_docs/00-master/00-master-development-guide.md` |
| API Contract Registry | `dev_docs/09-contracts/76-screen-api-contract-registry.md` |
| Development Standards | `dev_docs/08-standards/65-development-standards-overview.md` |
| Testing Strategy | `dev_docs/08-standards/72-testing-strategy.md` |
| Pre-Feature Checklist | `dev_docs/08-standards/74-pre-feature-checklist.md` |
| Architecture Assessment | `dev_docs/Claude-review-v1/01-code-review/01-architecture-assessment.md` |
| Backend Module Audit | `dev_docs/Claude-review-v1/01-code-review/02-backend-module-audit.md` |
| Design Specs (TMS Core) | `dev_docs/12-Rabih-design-Process/04-tms-core/` (15 files) |
| Prisma Schema | `apps/api/prisma/schema.prisma` (9,854 lines, 257 models, 114 enums) |

---

*Document Version: 1.0.0*
*Review Date: 2026-02-07*
*Reviewer: Claude Opus 4.6*
