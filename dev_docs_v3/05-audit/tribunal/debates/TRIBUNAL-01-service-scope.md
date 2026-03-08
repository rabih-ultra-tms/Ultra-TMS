# TRIBUNAL-01: Service Scope -- Are 38 Services Right?

> **Filed:** 2026-03-07
> **Topic:** Is 38 services the right scope for a 3PL TMS? Should some be merged, split, or cut?
> **Verdict:** MODIFY

---

## Charge

The project defines 38 services across 4 priority tiers (9 P0, 6 P1, 7 P2, 16 P3) for a pre-revenue 3PL TMS built by 2 AI agents. The backend has 35 active modules and 260 Prisma models supporting this taxonomy. The question is whether this scope is appropriate architecture for a startup TMS, or whether it represents over-engineering that dilutes focus and inflates maintenance burden.

---

## Prosecution (The Case for Reducing Scope)

### Argument 1: A third of your "services" are not services

P3 contains 16 entries. Six of them -- Email (#34), Storage (#35), Redis (#36), Health (#37), Super Admin (#33), and Operations (#38) -- are not services by any reasonable definition. The P3 index file itself labels Email, Storage, and Redis as "Infrastructure (0 controllers, 1 service)." Health has exactly one endpoint: `GET /api/v1/health`. Operations is explicitly documented as "NOT a separate service -- backend sub-modules that power TMS Core." Super Admin is "role in auth," meaning it is a permission level inside the Auth module, not a standalone service.

Calling these "services" inflates the count from a defensible 32 to an impressive-sounding 38. Each one required a hub file to be written, an entry in STATUS.md, a row in the service matrix, and a slot in the P3 index. That is documentation effort spent on things that do not need service-level documentation. A Redis wrapper does not need a 15-section hub file.

### Argument 2: Several P3 "services" are not TMS features

HR (#23) manages employee records, leave requests, and payroll. Help Desk (#27) is an internal ticketing system with 31 endpoints. Feedback (#28) collects user satisfaction surveys with 25 endpoints. Cache (#32) is a Redis cache management layer with 20 endpoints.

None of these move freight. None of these appear in any TMS buyer's guide, competitive analysis, or RFP template referenced in the table-stakes audit. The table-stakes audit lists 30 features that brokers expect -- HR, Help Desk, Feedback, and Cache are not among them. These are generic SaaS platform features that a pre-revenue startup should not be building, let alone documenting to service-hub depth.

### Argument 3: 260 Prisma models is extreme for a product with zero customers

The schema has 9,938 lines, 260 models, and 114 enums. For comparison, a mature production TMS like Tai Software -- which has been in market for 15+ years -- likely has fewer models than this. The schema supports 38 services, most of which have no frontend. Every model is a maintenance obligation: migrations, seed data, type generation, relationship management, query optimization. The project has had 31 migrations already and has not shipped to a single customer.

The root cause is scope creep through the service taxonomy. When you define 38 services, each one "needs" its own models. HR alone has 6 models. Help Desk has 8. Feedback has 7. That is 21 models for features that will not exist in the product for years, if ever.

### Argument 4: Two AI agents cannot maintain 38 service specifications

Each service hub file follows a 15-section format. The dev_docs_v3 audit (2026-03-07) found that many hub files were already stale -- 37+ pages listed as "Not Built" that actually existed. When specifications outnumber the team's ability to maintain them, they become misleading. The audit itself took an entire session across 6 phases to bring documentation to 9/10 accuracy. With 38 hubs to maintain, this audit cost will recur every time the codebase evolves significantly.

### Argument 5: The "38 services" number creates false confidence

When stakeholders see "38 services documented," they may believe the project is further along than it is. The reality: 23 of 30 table-stakes features have gaps. 6 are rated CRITICAL. The product cannot be demoed to a broker today. The documentation breadth masks the depth problem -- it is more useful to have 15 services documented and built than 38 services documented and 16 of them having zero frontend.

---

## Defense (The Case for 38 Services)

### Argument 1: 38 is a documentation taxonomy, not a build commitment

The tier system exists precisely to prevent scope creep. P0 has 9 services -- that is the build commitment. P1 has 6. P2 has 7. P3's 16 services are explicitly labeled "do not build without explicit user approval." The 38-service taxonomy is a map of the territory, not a construction plan. Removing services from the map does not remove the code -- it just makes the code undocumented.

### Argument 2: The infrastructure modules exist as NestJS code -- they need documentation

Email, Storage, Redis, Health, and Operations are real directories in `apps/api/src/modules/`. They are imported by other modules. They have configuration requirements. If a developer (human or AI) touches the email module without understanding its contract, they risk breaking notification flows across the entire application. The 6 "infrastructure" hub files are cheap insurance against cross-wiring. An abbreviated hub (which is exactly what they have -- the P3 index notes "6 have abbreviated hubs appropriate to scope") is the right level of documentation for infrastructure.

### Argument 3: Every TMS competitor has 30+ features when you count everything

The table-stakes audit references BrokerWare (3PL Systems), Tai Software, Aljex, Rose Rocket, and others. Count their feature pages: BrokerWare lists 40+ features. Tai lists 35+. The difference is they do not call them "services" -- they call them "features" or "modules." Ultra TMS's 38-service count is not unusually large for a TMS platform. It is unusually transparent in documenting everything that exists.

### Argument 4: Removing documentation costs effort with no code benefit

Deleting hub files for HR, Help Desk, Feedback, and Cache does not delete the NestJS modules. The code still exists. The Prisma models still exist. The 21 models for those 3 modules are already in the schema and migrated. Removing documentation creates undocumented code -- which is strictly worse than documented code. The prosecution's argument reduces to "we should have less documentation," which is rarely a winning position.

### Argument 5: The tier system already solves the prioritization problem

The prosecution argues that focus is diluted. But the Quality Sprint (QS-001 through QS-010) targets only P0 services. The session kickoff protocol reads STATUS.md and routes to the next QS task. No one is accidentally building Help Desk when QS-001 (WebSocket gateways) is still planned. The tier system is the focus mechanism. It is working.

---

## Cross-Examination

### Question 1: How many P3 hub files have been consulted during actual development work?

Finding: The git history and session logs show zero evidence that any P3 hub file has been referenced during a coding session. The 10 full-format P3 hubs (HR at 35 endpoints, Scheduler at 25, Safety at 43, etc.) were written during the dev_docs_v3 audit as a completeness exercise, not because anyone needed them. This supports the prosecution's argument that they are documentation for documentation's sake -- but also supports the defense's argument that they are cheap insurance.

### Question 2: Are there services that should exist but do not?

The table-stakes audit identifies Rate Confirmation Automation, BOL Generation, and Exception/Alert Dashboard as CRITICAL gaps. None of these are defined as standalone services. Rate confirmation is partially in TMS Core. BOL generation is nowhere. Exception dashboard is proposed but not planned. The 38-service taxonomy missed features that are more important than HR and Help Desk.

### Question 3: Should Safety (P3, #25) be reclassified given that FMCSA lookup is table-stakes?

The table-stakes audit rates FMCSA carrier lookup as "Built" and "Table stakes. Cannot dispatch a carrier without verifying authority." Yet the full Safety service with its 43 endpoints and 7 models is classified P3. The basic FMCSA lookup lives in Carrier Management (P0), but the safety dashboard, scoring engine, and compliance monitoring are P3. This split seems correct -- basic lookup is P0, full safety suite is P3. No reclassification needed.

---

## Evidence Exhibits

| Exhibit | Source | Finding |
|---------|--------|---------|
| E1 | `dev_docs_v3/01-services/p3-future/_index.md` | 6 of 16 P3 services are infrastructure modules with 0-1 controllers |
| E2 | `dev_docs_v3/STATUS.md` -- P3 section | "10 have full 15-section hubs... 6 have abbreviated hubs" |
| E3 | `00-evidence-pack.md` -- Prisma metrics | 260 models, 114 enums, 9,938 schema lines |
| E4 | `02-table-stakes-audit.md` -- checklist | 30 table-stakes features evaluated; HR, Help Desk, Feedback, Cache absent from all 30 |
| E5 | `02-table-stakes-audit.md` -- critical gaps | 6 CRITICAL + 9 HIGH gaps; none relate to P3 services |
| E6 | `dev_docs_v3/STATUS.md` -- Quality Sprint | All 10 QS tasks target P0-P1 services; zero P3 tasks |
| E7 | P3 index -- module paths | Email, Storage, Redis each have "0 controllers, 1 service" |

---

## Verdict

**MODIFY** -- The 38-service taxonomy is not wrong, but it is misleading. Six entries (Email, Storage, Redis, Health, Operations, Super Admin) are infrastructure components, not services. They should be reclassified into an "Infrastructure" tier separate from P3, which should be reserved for actual future features. This leaves 32 services across 4 tiers (P0/P1/P2/P3) plus an Infrastructure tier of 6.

Additionally, the P3 tier should be split into "P3-Features" (HR, Scheduler, Safety, EDI, Help Desk, Feedback, Rate Intelligence, Audit, Config, Cache -- 10 services) to distinguish between future TMS capabilities and internal platform tooling. The full 15-section hub format is overkill for infrastructure modules; a 5-section abbreviated format (purpose, dependencies, config, API surface, owner) is sufficient.

The prosecution's strongest point -- that some P3 entries are not TMS features -- is valid but does not justify deletion. The defense's strongest point -- that documentation follows code -- is also valid. The compromise is better taxonomy, not less documentation.

---

## Action Items

| # | Action | Priority | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | Create `p-infra/` directory under `01-services/` for Email, Storage, Redis, Health, Operations, Super Admin | P2 | 30min | Codex/Gemini |
| 2 | Move 6 infrastructure hub files from `p3-future/` to `p-infra/`, convert to 5-section abbreviated format | P2 | 1h | Codex/Gemini |
| 3 | Update `_index.md` files, STATUS.md, and service-matrix to reflect 32 services + 6 infrastructure | P2 | 30min | Codex/Gemini |
| 4 | Rename P3 header from "Future" to "P3-Features" in all references | P3 | 15min | Codex/Gemini |
| 5 | Audit P3 hub files for stale content; mark any with zero backend code as "Proposed Only" | P2 | 1h | Claude Code |
| 6 | Add Rate Confirmation Automation and BOL Generation as explicit service entries or sub-services of TMS Core | P1 | 30min | Claude Code |
