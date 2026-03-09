# Endpoint Count Verification (Test 4)

> **Date:** 2026-03-09
> **Methodology:** Two runs — Run 1 (manual agent counting), Run 2 (programmatic grep, authoritative)
> **Scope:** 33 services with REST controllers (excluding Dashboard aggregation, Super Admin alias, 3 infra services, Command Center)

## Methodology

### Run 1: Manual Agent Counting

Six parallel Explore agents read each controller file and manually counted `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()` decorators. This approach proved unreliable — agents consistently undercounted endpoints in larger files.

### Run 2: Programmatic Grep (AUTHORITATIVE)

Deterministic count using:

```bash
find apps/api/src/modules -name "*.controller.ts" ! -path "*.bak*" \
  -exec sh -c 'module=$(echo "$1" | sed "s|apps/api/src/modules/||" | cut -d"/" -f1); \
  count=$(grep -cE "@(Get|Post|Put|Patch|Delete)\(" "$1"); echo "$module|$count"' _ {} \;
```

This counts every line containing an HTTP method decorator across all active (non-.bak) controller files, grouped by module.

---

## Run 2 Results (Grep-Based — AUTHORITATIVE)

| # | Service | Hub Path | Controllers | Hub Claims | Grep Count | Delta | Accuracy |
|---|---------|----------|-------------|------------|------------|-------|----------|
| 01 | Auth & Admin | p0-mvp/01 | auth, profile, roles, sessions, tenant, users | 34 | 34 | 0 | 100% |
| 03 | CRM | p0-mvp/03 | activities, companies, contacts, hubspot, opportunities | 48 | 49 | +1 | 98% |
| 04 | Sales & Quotes | p0-mvp/04 | accessorial-rates, quotes, rate-contracts, sales-performance | 47 | 47 | 0 | 100% |
| 05 | TMS Core | p0-mvp/05 | loads, orders, public-tracking, stops, tracking | 51 | 45 | -6 | 88% |
| 06 | Carriers | p0-mvp/06 | carriers, contacts, documents, drivers-global, drivers, insurances | 52 | 50 | -2 | 96% |
| 07 | Accounting | p0-mvp/07 | accounting, chart-of-accounts, invoices, journal-entries, payments-made, payments-received, payments, quickbooks, reports, settlements | 54 | 54 | 0 | 100% |
| 08 | Commission | p0-mvp/08 | commission-entries, commission-payouts, commission-plans, commissions-dashboard | 31 | 28 | -3 | 90% |
| 09 | Load Board | p0-mvp/09 | accounts, analytics, capacity, load-bids, load-postings, load-tenders, leads, posting, rules | 62 | 62 | 0 | 100% |
| 10 | Claims | p2-ext/10 | claims, claim-documents, claim-items, claim-notes, reports, resolution, subrogation | 39 | 39 | 0 | 100% |
| 11 | Documents | p1-post/11 | document-folders, document-templates, documents | 20 | 20 | 0 | 100% |
| 12 | Communication | p1-post/12 | email, notifications, preferences, sms, templates | 30 | 30 | 0 | 100% |
| 13 | Customer Portal | p0-mvp/13 | portal-auth, portal-dashboard, portal-invoices, portal-payments, portal-quotes, portal-shipments, portal-users | 40 | 40 | 0 | 100% |
| 14 | Carrier Portal | p1-post/14 | carrier-portal-auth, -compliance, -dashboard, -documents, -invoices, -loads, -users | 56 | 54 | -2 | 96% |
| 15 | Contracts | p2-ext/15 | amendments, contracts, fuel-surcharge, rate-lanes, rate-tables, slas, contract-templates, volume-commitments | 58 | 58 | 0 | 100% |
| 16 | Agents | p2-ext/16 | agents, agent-agreements, customer-assignments, agent-commissions, agent-leads, agent-statements | 43 | 42 | -1 | 98% |
| 17 | Credit | p2-ext/17 | credit-applications, collections, credit-holds, credit-limits, payment-plans | 31 | 31 | 0 | 100% |
| 18 | Factoring | p2-ext/18 | carrier-factoring-status, factoring-companies, noa-records, factored-payments, factoring-verifications | 30 | 30 | 0 | 100% |
| 19 | Analytics | p2-ext/19 | alerts, dashboards, kpis, reports | 41 | 40 | -1 | 98% |
| 20 | Workflow | p2-ext/20 | approvals, executions, templates, workflows | 35 | 35 | 0 | 100% |
| 21 | Integration Hub | p2-ext/21 | integrations, sync, webhooks | 45 | 45 | 0 | 100% |
| 22 | Search | p2-ext/22 | admin, entity-search, global-search, saved-searches | 27 | 27 | 0 | 100% |
| 23 | HR | p3-future/23 | departments, employees, locations, positions, time-off, time-entries | 35 | 35 | 0 | 100% |
| 24 | Scheduler | p3-future/24 | executions, jobs, reminders, tasks, templates | 25 | 25 | 0 | 100% |
| 25 | Safety | p3-future/25 | alerts, csa, dqf, fmcsa, incidents, insurance, safety-reports, safety-scores, watchlist | 43 | 43 | 0 | 100% |
| 26 | EDI | p3-future/26 | edi-documents, edi-generation, edi-mappings, edi-queue, trading-partners | 38 | 35 | -3 | 92% |
| 27 | Help Desk | p3-future/27 | canned-responses, kb, sla-policies, teams, tickets | 31 | 31 | 0 | 100% |
| 28 | Feedback | p3-future/28 | feedback-entries, features, nps, surveys, widgets | 25 | 25 | 0 | 100% |
| 29 | Rate Intelligence | p3-future/29 | rate-alerts, analytics, rate-history, lane-analytics, rate-lookup, providers | 21 | 21 | 0 | 100% |
| 30 | Audit | p3-future/30 | user-activity, alerts, api-audit, audit, compliance, change-history, audit-logs, retention | 33 | 31 | -2 | 94% |
| 31 | Config | p3-future/31 | business-hours, email-templates, features, preferences, sequences, system-config, templates, tenant-services, tenant-config | 39 | 39 | 0 | 100% |
| 32 | Cache | p3-future/32 | cache-config, locks, cache-management, rate-limit | 20 | 20 | 0 | 100% |
| 37 | Health | p-infra/37 | health | 3 | 3 | 0 | 100% |
| 38 | Operations | p-infra/38 | carriers, dashboard, equipment, inland-service-types, load-history, load-planner-quotes, truck-types | 61 | 62 | +1 | 98% |

---

## Per-Controller Breakdown (Services with Discrepancies)

### TMS Core (Hub: 51, Actual: 45, Delta: -6) — WORST DISCREPANCY

| Controller | Path | Grep Count |
|------------|------|------------|
| loads.controller.ts | tms/ | 15 |
| orders.controller.ts | tms/ | 19 |
| public-tracking.controller.ts | tms/ | 1 |
| stops.controller.ts | tms/ | 8 |
| tracking.controller.ts | tms/ | 2 |
| **Total** | | **45** |

Hub claims 51 — 6 phantom endpoints listed in hub that don't exist as decorators in code.

### Commission (Hub: 31, Actual: 28, Delta: -3)

| Controller | Path | Grep Count |
|------------|------|------------|
| commission-entries.controller.ts | commission/controllers/ | 7 |
| commission-payouts.controller.ts | commission/controllers/ | 6 |
| commission-plans.controller.ts | commission/controllers/ | 6 |
| commissions-dashboard.controller.ts | commission/controllers/ | 9 |
| **Total** | | **28** |

### EDI (Hub: 38, Actual: 35, Delta: -3)

| Controller | Path | Grep Count |
|------------|------|------------|
| edi-documents.controller.ts | edi/documents/ | 10 |
| edi-generation.controller.ts | edi/generation/ | 6 |
| edi-mappings.controller.ts | edi/mappings/ | 5 |
| edi-queue.controller.ts | edi/queue/ | 6 |
| trading-partners.controller.ts | edi/trading-partners/ | 8 |
| **Total** | | **35** |

### Carrier Portal (Hub: 56, Actual: 54, Delta: -2)

| Controller | Path | Grep Count |
|------------|------|------------|
| carrier-portal-auth.controller.ts | carrier-portal/auth/ | 7 |
| carrier-portal-compliance.controller.ts | carrier-portal/compliance/ | 5 |
| carrier-portal-dashboard.controller.ts | carrier-portal/dashboard/ | 5 |
| carrier-portal-documents.controller.ts | carrier-portal/documents/ | 6 |
| carrier-portal-invoices.controller.ts | carrier-portal/invoices/ | 8 |
| carrier-portal-loads.controller.ts | carrier-portal/loads/ | 15 |
| carrier-portal-users.controller.ts | carrier-portal/users/ | 8 |
| **Total** | | **54** |

### Carriers (Hub: 52, Actual: 50, Delta: -2)

| Controller | Path | Grep Count |
|------------|------|------------|
| carriers.controller.ts | carrier/ | 20 |
| contacts.controller.ts | carrier/ | 4 |
| documents.controller.ts | carrier/ | 6 |
| drivers-global.controller.ts | carrier/ | 6 |
| drivers.controller.ts | carrier/ | 7 |
| insurances.controller.ts | carrier/ | 7 |
| **Total** | | **50** |

### Audit (Hub: 33, Actual: 31, Delta: -2)

| Controller | Path | Grep Count |
|------------|------|------------|
| user-activity.controller.ts | audit/activity/ | 4 |
| alerts.controller.ts | audit/alerts/ | 4 |
| api-audit.controller.ts | audit/api/ | 3 |
| audit.controller.ts | audit/ | 6 |
| compliance.controller.ts | audit/compliance/ | 3 |
| change-history.controller.ts | audit/history/ | 3 |
| audit-logs.controller.ts | audit/logs/ | 5 |
| retention.controller.ts | audit/retention/ | 3 |
| **Total** | | **31** |

---

## Excluded Services (No Standalone REST Controllers)

| # | Service | Reason |
|---|---------|--------|
| 02 | Dashboard | Cross-cutting aggregation — endpoints belong to Operations, Analytics, Accounting, Commission, Carrier Portal, Customer Portal modules (already counted there) |
| 33 | Super Admin | Not a standalone module — reuses Auth's 34 endpoints with SUPER_ADMIN role bypass |
| 34 | Email | Internal service — no REST endpoints |
| 35 | Storage | Internal service — no REST endpoints |
| 36 | Redis | Internal service — no REST endpoints |
| 39 | Command Center | Not yet built |

---

## Summary

| Metric | Run 1 (Manual Agents) | Run 2 (Grep) |
|--------|----------------------|--------------|
| Total hub claims | 1,248 | 1,248 |
| Total actual endpoints | 1,187 | 1,230 |
| Overall delta | -61 (4.9%) | -18 (1.4%) |
| Exact matches | 12/33 (36%) | 23/33 (70%) |
| Within ±10% | 24/33 (73%) | 32/33 (97%) |
| >10% discrepancy | 9/33 (27%) | 1/33 (3%) |
| >20% discrepancy | 0/33 | 0/33 |
| Worst discrepancy | Accounting -18.5% | TMS Core -11.8% |

---

## Run 1 vs Run 2: Where Manual Counting Failed

| Module | Run 1 (Manual) | Run 2 (Grep) | Agent Error |
|--------|---------------|--------------|-------------|
| Accounting | 44 | 54 | -10 (missed 10!) |
| Load Board | 55 | 62 | -7 |
| Workflow | 29 | 35 | -6 |
| Carrier | 45 | 50 | -5 |
| Integration Hub | 42 | 45 | -3 |
| CRM | 52 | 49 | +3 (overcounted) |
| Carrier Portal | 56 | 54 | +2 (overcounted) |
| Analytics | 43 | 40 | +3 (overcounted) |

**Root cause:** Agents reading large controller files manually tended to undercount, especially in files with many endpoints (e.g., `invoices.controller.ts` has 11 decorators but agent counted 7). Grep is deterministic and authoritative.

---

## Key Findings

1. **Hub accuracy is HIGH:** 23/33 services (70%) have exact endpoint count matches between hub documentation and code. Only TMS Core exceeds 10% discrepancy.

2. **Manual AI counting is unreliable:** Run 1 agents produced 43 errors across 33 services. Largest single error: Accounting (missed 10 of 54 endpoints). Always prefer programmatic verification.

3. **Hub over-count pattern:** Where discrepancies exist, hubs tend to over-claim (list endpoints not in code). Net -18 endpoints across all services.

4. **Services needing hub correction:** TMS Core (-6), Commission (-3), EDI (-3), Carrier Portal (-2), Carriers (-2), Audit (-2).

5. **Services with extra code endpoints:** CRM (+1), Operations (+1) — minor, likely undocumented convenience endpoints.

6. **Total API surface:** 1,230 endpoints across 33 modules (148 controller files, excluding .bak backups).
