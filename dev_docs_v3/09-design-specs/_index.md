# Design Spec Integration Index

**Source:** `dev_docs/12-Rabih-design-Process/` (411 files across 39 service directories + 1 continuation guide)
**Purpose:** Maps each Rabih design spec to its corresponding frontend route, backend endpoint, and current implementation status.

## Directory Structure

| # | Directory | Files | MVP Tier | Integration File |
|---|-----------|-------|----------|------------------|
| 00 | global | 18 | All | `global-design-tokens.md`, `global-patterns.md` |
| 01 | auth-admin | 13 | P0 | `01-auth-admin.md` |
| 01.1 | dashboard-shell | 6 | P0 | `01.1-dashboard-shell.md` |
| 02 | crm | 13 | P0 | `02-crm.md` |
| 03 | sales | 11 | P0 | `03-sales.md` |
| 04 | tms-core | 15 | P0 | `04-tms-core-screens.md`, `04-tms-core-workflows.md` |
| 05 | carrier | 13 | P0 | `05-carrier.md` |
| 06 | accounting | 15 | P0 | `06-accounting-screens.md`, `06-accounting-workflows.md` |
| 07 | load-board | 5 | P0 | `07-load-board.md` |
| 08 | commission | 7 | P0 | `08-commission.md` |
| 09 | claims | 11 | P1 | `09-claims.md` |
| 10 | documents | 9 | P1 | `10-documents.md` |
| 11 | communication | 11 | P1 | `11-communication.md` |
| 12 | customer-portal | 11 | P2 | `12-customer-portal.md` |
| 13 | carrier-portal | 13 | P2 | `13-carrier-portal.md` |
| 14 | contracts | 9 | P1 | `14-contracts.md` |
| 15 | agents | 9 | P1 | `15-agents.md` |
| 16 | credit | 11 | P2 | `16-credit.md` |
| 17 | factoring | 7 | P2 | `17-factoring.md` |
| 18 | analytics | 11 | P2 | `18-analytics.md` |
| 19 | workflow | 9 | P2 | `19-workflow.md` |
| 20 | integration-hub | 11 | P2 | `20-integration-hub.md` |
| 21 | search | 5 | P2 | `21-search.md` |
| 22 | audit | 7 | P1 | `22-audit.md` |
| 23 | config | 9 | P1 | `23-config.md` |
| 24 | edi | 9 | P2 | `24-edi.md` |
| 25 | safety | 11 | P1 | `25-safety.md` |
| 26 | rate-intelligence | 9 | P2 | `26-rate-intelligence.md` |
| 27 | help-desk | 7 | P3 | `27-help-desk.md` |
| 28 | feedback | 7 | P3 | `28-feedback.md` |
| 29 | fuel-cards | 9 | P3 | `29-fuel-cards.md` |
| 30 | factoring-external | 9 | P3 | `30-factoring-external.md` |
| 31 | load-board-external | 9 | P3 | `31-load-board-external.md` |
| 32 | mobile-app | 9 | P3 | `32-mobile-app.md` |
| 33 | hr | 11 | P3 | `33-hr.md` |
| 34 | eld | 9 | P3 | `34-eld.md` |
| 35 | cross-border | 11 | P3 | `35-cross-border.md` |
| 36 | scheduler | 7 | P2 | `36-scheduler.md` |
| 37 | cache | 5 | P2 | `37-cache.md` |
| 38 | super-admin | 29 | P1 | `38-super-admin-core.md`, `38-super-admin-services.md`, `38-super-admin-tools.md` |

**Total integration files:** 50 (including this index, global tokens, global patterns, continuation guide notes)

## How to Use These Files

1. **Building a new screen?** Find the service in this index → open the integration file → it maps each design spec to the route and backend endpoint
2. **Checking implementation status?** Each integration file shows which screens have frontend pages vs which are stubs/missing
3. **Need the full design spec?** Integration files reference the source file in `dev_docs/12-Rabih-design-Process/` — read that for full UX/UI details

## File count: 411 design spec files total
- Global standards: 18 files
- P0 MVP services: 85 files (auth, dashboard, CRM, sales, TMS, carrier, accounting, load board, commission)
- P1 services: 55 files (claims, documents, communication, contracts, agents, audit, config, safety)
- P2 services: 97 files (portals, credit, factoring, analytics, workflow, integration, search, EDI, rate intel, scheduler, cache)
- P3 future: 137 files (help desk, feedback, fuel cards, external integrations, mobile, HR, ELD, cross-border)
- Super admin: 29 files
