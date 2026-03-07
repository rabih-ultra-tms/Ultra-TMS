# Service Index — All 38 Services

> **Active docs:** `dev_docs_v3/01-services/` — read/write
> **Historical refs:** `dev_docs/02-services/` (definitions) | `dev_docs_v2/03-services/` (v2 hubs)
> Last updated: 2026-03-07

---

## P0: MVP Services (9 services — 16-week sprint)

| # | Service | Hub File | Backend | Frontend | Tests | Health | Priority |
|---|---------|----------|---------|----------|-------|--------|----------|
| 01 | Auth & Admin | [01-auth-admin.md](p0-mvp/01-auth-admin.md) | Production | Partial (3 stubs) | Partial | C+ 6.5/10 | P0-Critical |
| 02 | Dashboard Shell | [02-dashboard.md](p0-mvp/02-dashboard.md) | Production | Partial (hardcoded) | None | C 5/10 | P0-High |
| 03 | CRM | [03-crm.md](p0-mvp/03-crm.md) | Production | Partial (missing delete UI) | None | B- 7.1/10 | P0-High |
| 04 | Sales & Quotes | [04-sales-quotes.md](p0-mvp/04-sales-quotes.md) | Production | Partial (Load Planner PROTECTED) | None | C+ 6/10 | P0-High |
| 05 | TMS Core | [05-tms-core.md](p0-mvp/05-tms-core.md) | Production (65 endpoints) | Not Built (0 screens) | None | A- Backend / 0 Frontend | P0-Critical |
| 06 | Carrier Management | [06-carriers.md](p0-mvp/06-carriers.md) | Production (40 endpoints) | Partial (2 x P0 404s) | Partial (45 tests) | D+ 4/10 | P0-High |
| 07 | Accounting | [07-accounting.md](p0-mvp/07-accounting.md) | Production (backend) | Not Built | None | D 3/10 | P0-High |
| 08 | Commission | [08-commission.md](p0-mvp/08-commission.md) | Production (backend) | Not Built | None | D 3/10 | P0-Medium |
| 09 | Load Board | [09-load-board.md](p0-mvp/09-load-board.md) | Partial (backend stub) | Not Built | None | D 2/10 | P0-Medium |

---

## P1: Post-MVP Services (6 services)

| # | Service | Hub File | Backend | Frontend | Health | Notes |
|---|---------|----------|---------|----------|--------|-------|
| 10 | Claims | [10-claims.md](p1-post-mvp/10-claims.md) | Partial (7 controllers) | Not Built | D 2/10 | |
| 11 | Documents | [11-documents.md](p1-post-mvp/11-documents.md) | Partial (3 controllers, .bak) | Partial | D+ 3/10 | .bak dir exists |
| 12 | Communication | [12-communication.md](p1-post-mvp/12-communication.md) | Partial (5 controllers) | Not Built | D 2/10 | Email + SMS |
| 13 | Customer Portal | [13-customer-portal.md](p1-post-mvp/13-customer-portal.md) | Partial (7 controllers) | Not Built | D 2/10 | Separate auth |
| 14 | Carrier Portal | [14-carrier-portal.md](p1-post-mvp/14-carrier-portal.md) | Partial (7 controllers) | Not Built | D 2/10 | Separate auth |
| 15 | Contracts | [15-contracts.md](p1-post-mvp/15-contracts.md) | Partial (8 controllers) | Not Built | D 2/10 | |

---

## P2: Extended Services (7 services)

| # | Service | Hub File | Backend | Frontend | Health | Notes |
|---|---------|----------|---------|----------|--------|-------|
| 16 | Agents | [16-agents.md](p2-extended/16-agents.md) | Partial (6 controllers) | Not Built | D 2/10 | Freight agents/brokers |
| 17 | Credit | [17-credit.md](p2-extended/17-credit.md) | Partial (5 controllers) | Not Built | D 2/10 | Credit management |
| 18 | Factoring Internal | [18-factoring-internal.md](p2-extended/18-factoring-internal.md) | Partial (5 controllers) | Not Built | D 2/10 | |
| 19 | Analytics | [19-analytics.md](p2-extended/19-analytics.md) | Partial (4 controllers, .bak) | Not Built | D 2/10 | .bak dir exists |
| 20 | Workflow | [20-workflow.md](p2-extended/20-workflow.md) | Partial (4 controllers, .bak) | Not Built | D 2/10 | .bak dir exists |
| 21 | Integration Hub | [21-integration-hub.md](p2-extended/21-integration-hub.md) | Partial (5 controllers, .bak) | Not Built | D 2/10 | .bak dir exists |
| 22 | Search | [22-search.md](p2-extended/22-search.md) | Partial (4 controllers) | Not Built | D 2/10 | Elasticsearch |

---

## P3: Future Services (16 services — not in current scope)

See [p3-future/_index.md](p3-future/_index.md) for full list.

| # | Service | Backend Status | Notes |
|---|---------|---------------|-------|
| 23 | HR | Partial (6 controllers) | HR management |
| 24 | Scheduler | Partial (5 controllers) | Job scheduler |
| 25 | Safety | Partial (9 controllers) | FMCSA safety |
| 26 | EDI | Partial (5 controllers) | EDI integration |
| 27 | Help Desk | Partial (5 controllers) | Support ticketing |
| 28 | Feedback | Partial (5 controllers) | User feedback |
| 29 | Rate Intelligence | Partial (6 controllers) | Market rates |
| 30 | Audit | Partial (8 controllers) | Audit trail |
| 31 | Config | Partial (9 controllers) | System configuration |
| 32 | Cache | Partial (4 controllers) | Redis cache layer |
| 33 | Super Admin | Partial (auth exists) | Cross-tenant admin |
| 34 | Operations | In auth | Role-based ops view |
| 35 | Email | In communication | SendGrid integration |
| 36 | Storage | Partial | S3 file storage |
| 37 | Redis | Partial (4 controllers) | Queue management |
| 38 | Health | Production | Health check endpoint |

---

## Coverage Summary

| Layer | P0 MVP | P1 Post-MVP | P2 Extended | P3 Future |
|-------|--------|-------------|-------------|-----------|
| Backend modules | 9/9 active | 6/6 partial | 7/7 partial | 16 partial |
| Frontend screens | ~25% built | 0% | 0% | 0% |
| Unit tests | ~10% | 0% | 0% | 0% |
| E2E tests | 0% | 0% | 0% | 0% |
| Design specs | 100% (89+ files) | Partial | Partial | Partial |

---

## Delta vs Original Plan

| Original Plan | Actual State | Delta |
|--------------|-------------|-------|
| 38 services planned | 42 backend modules exist | +4 modules (partial) |
| 8 MVP services | 9 P0 services (Dashboard added) | +1 |
| ~300 screens planned | 96 routes built | 75% not built |
| 362 screens in full vision | MVP = 30 screens scoped | Reduced to MVP |
| All services "not built" | 30+ services have partial backends | Major delta |

> **Key insight:** The backend is AHEAD of the plan. Virtually every service has partial or full backend implementation. The critical gap is frontend screens and tests.
