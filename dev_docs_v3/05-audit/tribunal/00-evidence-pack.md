# Tribunal Evidence Pack -- Ultra TMS

> Consolidated reference index for all 10 Tribunal debates.
> Generated: 2026-03-07

---

## Project Metrics (Verified 2026-03-07)

| Metric | Value |
|--------|-------|
| Services defined | 38 (9 P0, 6 P1, 7 P2, 16 P3) |
| Frontend routes | 98 |
| React components | 304 |
| Custom hooks | 51 |
| Backend modules | 35 active + 5 .bak |
| Controllers | ~187 |
| NestJS services | ~225 |
| DTOs | 309 |
| Prisma models | 260 |
| Prisma enums | 114 |
| Schema lines | 9,938 |
| Migrations | 31 |
| Tests | 72 passing (13 suites) |
| Test coverage | 8.7% FE, ~15% BE |
| Design specs | 381 files |
| Overall grade | B- (7.0/10) |

---

## Key Evidence Sources

### Project Status & Architecture
- `dev_docs_v3/STATUS.md` -- build metrics, task status, service health table
- `dev_docs_v3/00-foundations/architecture.md` -- tech stack, caching, deployment architecture
- `dev_docs_v3/00-foundations/data-flow.md` -- revenue pipeline, entity lifecycles, service dependencies
- `dev_docs_v3/07-decisions/decision-log.md` -- 15 ADRs (all LOCKED)

### Audit & Quality
- `dev_docs_v3/05-audit/latest-audit.md` -- consolidated grade with section scores
- `dev_docs_v3/05-audit/security-findings.md` -- 13 security findings + severity framework
- `dev_docs_v3/05-audit/technical-debt.md` -- 339 TODOs triaged by severity
- `dev_docs_v3/05-audit/recurring-patterns.md` -- 10 root-cause anti-patterns
- `dev_docs_v3/05-audit/sonnet-audit-tracker.md` -- 62 bugs found, 57 fixed

### Competitive Analysis (Pre-Existing)
- `dev_docs/Claude-review-v1/06-gap-analysis/02-competitive-analysis.md` -- 6 competitor deep dives
- `dev_docs/Claude-review-v1/06-gap-analysis/03-missing-features.md` -- 28 gaps (11 missing, 9 underspec, 8 enhance)
- `dev_docs/Claude-review-v1/06-gap-analysis/01-3pl-broker-expectations.md` -- day-in-the-life workflow
- `dev_docs_v3/00-foundations/research-synthesis.md` -- MoSCoW verdicts from original research

### Service Hubs
- P0: `dev_docs_v3/01-services/p0-mvp/{service}.md` -- 9 hubs (8-10/10 depth)
- P1: `dev_docs_v3/01-services/p1-post-mvp/{service}.md` -- 6 hubs (6.5-7/10 depth)
- P2: `dev_docs_v3/01-services/p2-extended/{service}.md` -- 7 hubs (8.5-10/10 depth)
- P3: `dev_docs_v3/01-services/p3-future/{service}.md` -- 16 hubs (1-10/10 depth, 6 are infra stubs)

### Codebase Evidence
- `apps/api/prisma/schema.prisma` -- 9,938 lines, 260 models, 114 enums
- `apps/api/src/modules/` -- 40 module directories (35 active + 5 .bak)
- `apps/web/lib/socket/socket-provider.tsx` -- 175 lines, frontend WebSocket infra
- `apps/web/lib/socket/socket-config.ts` -- 185 lines, 20+ typed events
- `apps/api/src/modules/customer-portal/` -- 7 sub-modules
- `apps/api/src/modules/carrier-portal/` -- 7 sub-modules

### Testing Evidence
- `dev_docs_v3/10-standards/testing-standards.md` -- coverage targets + financial mandate
- 72 tests total: 45 carrier, 14 commission FE, 13 load board suites
- 0 tests: Dashboard, Sales/Quotes, TMS Core FE, Accounting

### Quality Sprint Tasks
- QS-001: WebSocket Gateways (XL, P0, planned)
- QS-002: Soft Delete Migration (M, P0, planned)
- QS-003: Accounting Dashboard Endpoint (M, P1, planned)
- QS-008: Runtime Verification (L, P0, planned)
