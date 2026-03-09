# Backend Module Map — Ultra TMS

> Last updated: 2026-03-07
> Source: `apps/api/src/modules/` — actual file count scan
> Format: module name | controllers | services | tier | service hub

---

## Summary

| Metric | Count |
|--------|-------|
| Active modules | 35 |
| .bak directories (dead) | 5 |
| Total module dirs | 40 |
| Total controller files | ~187 |
| Total service files | ~225 |
| Modules with 0 controllers | 3 (email, redis, storage — service-only helpers) |

---

## Active Modules (35)

| Module | Controllers | Services | Tier | Service Hub | Notes |
|--------|------------|----------|------|-------------|-------|
| `accounting` | 10 | 10 | P0 MVP | `01-services/p0-mvp/07-accounting.md` | Backend partial, FE not built |
| `agents` | 6 | 6 | P2 | `01-services/p2-extended/16-agents.md` | Broker agent management |
| `analytics` | 4 | 4 | P2 | `01-services/p2-extended/19-analytics.md` | Partial — analytics.bak also exists |
| `audit` | 8 | 11 | P3 | `01-services/p3-future/30-audit.md` | Audit trail logging |
| `auth` | 6 | 6 | P0 MVP | `01-services/p0-mvp/01-auth-admin.md` | Production — JWT, RBAC, MFA |
| `cache` | 4 | 7 | P3 | `01-services/p3-future/32-cache.md` | Redis wrapper service |
| `carrier` | 6 | 5 | P0 MVP | `01-services/p0-mvp/06-carriers.md` | Note: dir is `carrier/` not `carriers/` |
| `carrier-portal` | 7 | 7 | P1 | `01-services/p1-post-mvp/14-carrier-portal.md` | Carrier self-service portal |
| `claims` | 7 | 7 | P1 | `01-services/p1-post-mvp/10-claims.md` | Claims management |
| `commission` | 4 | 4 | P0 MVP | `01-services/p0-mvp/08-commission.md` | Rep commissions |
| `communication` | 5 | 5 | P1 | `01-services/p1-post-mvp/12-communication.md` | Email/SMS messaging |
| `config` | 9 | 11 | P3 | `01-services/p3-future/31-config.md` | System configuration |
| `contracts` | 8 | 9 | P1 | `01-services/p1-post-mvp/15-contracts.md` | Contract management |
| `credit` | 5 | 5 | P2 | `01-services/p2-extended/17-credit.md` | Customer credit limits |
| `crm` | 5 | 5 | P0 MVP | `01-services/p0-mvp/03-crm.md` | Production — companies, contacts, leads |
| `customer-portal` | 7 | 7 | P1 | `01-services/p1-post-mvp/13-customer-portal.md` | Customer self-service portal |
| `documents` | 3 | 3 | P1 | `01-services/p1-post-mvp/11-documents.md` | Document management — documents.bak also exists |
| `edi` | 5 | 7 | P3 | `01-services/p3-future/26-edi.md` | EDI integration |
| `email` | 0 | 1 | P3 | `01-services/p3-future/34-email.md` | Email service helper (no controller) |
| `factoring` | 5 | 6 | P2 | `01-services/p2-extended/18-factoring-internal.md` | Internal factoring |
| `feedback` | 5 | 9 | P3 | `01-services/p3-future/28-feedback.md` | User feedback collection |
| `health` | 1 | 0 | P3 | `01-services/p3-future/37-health.md` | Health check endpoint — Production |
| `help-desk` | 5 | 10 | P3 | `01-services/p3-future/27-help-desk.md` | Support tickets |
| `hr` | 6 | 7 | P3 | `01-services/p3-future/23-hr.md` | HR management |
| `integration-hub` | 3 | 5 | P2 | `01-services/p2-extended/21-integration-hub.md` | Third-party integrations — integration-hub.bak also exists |
| `load-board` | 9 | 10 | P0 MVP | `01-services/p0-mvp/09-load-board.md` | Load board (all stubs) |
| `operations` | 7 | 7 | P0 MVP | `01-services/p0-mvp/05-tms-core.md` | TMS Core — orders, loads, dispatch, stops, check calls |
| `rate-intelligence` | 6 | 8 | P3 | `01-services/p3-future/29-rate-intelligence.md` | Market rate data |
| `redis` | 0 | 1 | P3 | `01-services/p3-future/36-redis.md` | Redis helper (no controller) |
| `safety` | 9 | 9 | P3 | `01-services/p3-future/25-safety.md` | Driver/vehicle safety |
| `sales` | 4 | 5 | P0 MVP | `01-services/p0-mvp/04-sales-quotes.md` | Quotes, AI cargo extraction |
| `scheduler` | 5 | 9 | P3 | `01-services/p3-future/24-scheduler.md` | Appointment scheduling |
| `search` | 4 | 8 | P2 | `01-services/p2-extended/22-search.md` | Elasticsearch-powered search |
| `storage` | 0 | 1 | P3 | `01-services/p3-future/35-storage.md` | S3-compatible file storage (no controller) |
| `tms` | 5 | 4 | P0 MVP | `01-services/p0-mvp/05-tms-core.md` | TMS module (part of TMS Core with operations) |
| `workflow` | 4 | 4 | P2 | `01-services/p2-extended/20-workflow.md` | Business process automation — workflow.bak also exists |

---

## .bak Directories (5 — Delete per QS-009)

| Directory | Active Replacement | Action |
|-----------|-------------------|--------|
| `analytics.bak` | `analytics/` | Diff → confirm no unique code → delete |
| `carrier.bak` | `carrier/` | Diff → confirm no unique code → delete |
| `documents.bak` | `documents/` | Diff → confirm no unique code → delete |
| `integration-hub.bak` | `integration-hub/` | Diff → confirm no unique code → delete |
| `workflow.bak` | `workflow/` | Diff → confirm no unique code → delete |

---

## P0 MVP Modules — Health Overview

| Module | Directory | Controllers | Status | Key Issues |
|--------|-----------|------------|--------|------------|
| Auth & Admin | `auth/` + admin via auth | 6 | Production | localStorage token (P1 security bug) |
| CRM | `crm/` | 5 | Production | Missing delete/convert buttons (frontend) |
| Sales & Quotes | `sales/` | 4 | Production | Load Planner PROTECTED |
| TMS Core | `operations/` + `tms/` | 7 + 5 = 12 | Production (backend) | 12 frontend pages built (unverified runtime) |
| Carriers | `carrier/` | 6 | Production | 6 pages + Truck Types PROTECTED |
| Accounting | `accounting/` | 10 | Partial | 10 pages built; missing dashboard endpoint (QS-003) |
| Commission | `commission/` | 4 | Partial | 11 pages built (8.5/10 avg); auto-calc trigger unverified |
| Load Board | `load-board/` | 9 | Stub | 4 pages built; all backend endpoints return stub data |

---

## Service-to-Module Mapping

For finding backend code for a given service:

| Service | Module Path | Controller Pattern |
|---------|------------|-------------------|
| Auth | `apps/api/src/modules/auth/` | `auth.controller.ts` |
| Users | `apps/api/src/modules/auth/` | `users.controller.ts` |
| Roles | `apps/api/src/modules/auth/` | `roles.controller.ts` |
| Tenants | `apps/api/src/modules/auth/` | `tenants.controller.ts` |
| Audit Logs | `apps/api/src/modules/audit/` | `audit.controller.ts` |
| CRM | `apps/api/src/modules/crm/` | `customers.controller.ts`, `contacts.controller.ts`, `opportunities.controller.ts` |
| Quotes | `apps/api/src/modules/sales/` | `quotes.controller.ts` |
| Orders | `apps/api/src/modules/operations/` | `orders.controller.ts` |
| Loads | `apps/api/src/modules/operations/` | `loads.controller.ts` |
| Stops | `apps/api/src/modules/operations/` | `stops.controller.ts` |
| Check Calls | `apps/api/src/modules/operations/` | `check-calls.controller.ts` |
| Tracking | `apps/api/src/modules/tms/` | `tracking.controller.ts` |
| Dispatch | `apps/api/src/modules/tms/` | `dispatch.controller.ts` |
| Carriers | `apps/api/src/modules/carrier/` | `carriers.controller.ts` |
| Truck Types | `apps/api/src/modules/carrier/` | `truck-types.controller.ts` |
| Accounting | `apps/api/src/modules/accounting/` | `invoices.controller.ts`, `settlements.controller.ts`, `payments.controller.ts` |
| Commission | `apps/api/src/modules/commission/` | `commission.controller.ts`, `plans.controller.ts` |
| Load Board | `apps/api/src/modules/load-board/` | `load-board.controller.ts` |
