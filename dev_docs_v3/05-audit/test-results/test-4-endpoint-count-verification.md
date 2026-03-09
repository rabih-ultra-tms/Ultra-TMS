# Test 4: Endpoint Count Verification

> **Date:** 2026-03-09
> **Objective:** Verify that hub file endpoint claims match actual code across all Ultra TMS backend services
> **Scope:** 33 services with REST controllers, 148 controller files, excluding `.bak` backups

---

## Executive Summary

| Metric | Result |
|--------|--------|
| Total hub-claimed endpoints | 1,248 |
| Total actual endpoints (grep) | 1,230 |
| Overall delta | -18 (1.4% over-claim) |
| Exact matches | 23/33 (70%) |
| Within ±10% | 32/33 (97%) |
| >10% discrepancy | 1/33 (3%) — TMS Core only |
| >20% discrepancy | 0/33 (0%) |
| Worst discrepancy | TMS Core (hub: 51, actual: 45, -11.8%) |

**Verdict: PASS.** Hub documentation is highly accurate. Only 10 of 33 services have any discrepancy at all, and only 1 exceeds 10%.

---

## Methodology

### Counting Approach

Two independent runs were performed to ensure accuracy:

**Run 1 — Manual Agent Counting (unreliable):**
Six parallel Explore agents read each controller file and manually counted HTTP method decorators. This produced a -61 endpoint delta (4.9%) and only 36% exact matches. Post-analysis revealed significant undercounting by agents, especially in larger files.

**Run 2 — Programmatic Grep (authoritative):**
Deterministic decorator count using:

```bash
find apps/api/src/modules -name "*.controller.ts" ! -path "*.bak*" \
  -exec sh -c 'module=$(echo "$1" | sed "s|apps/api/src/modules/||" | cut -d"/" -f1); \
  count=$(grep -cE "@(Get|Post|Put|Patch|Delete)\(" "$1"); echo "$module|$count"' _ {} \;
```

This counts every line containing `@Get(`, `@Post(`, `@Put(`, `@Patch(`, or `@Delete(` — the standard NestJS HTTP method decorators.

### What Was Counted

- Every `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()` decorator in active controller files
- Parameterized variants included (e.g., `@Get(':id')`)
- `.bak` directories excluded (analytics.bak, carrier.bak, documents.bak, integration-hub.bak, workflow.bak)

### What Was Compared Against

- Hub file Section 4 (API Endpoints) claimed totals from `dev_docs_v3/01-services/`

---

## Full Results Table

| # | Service | Hub Path | Controllers Found | Hub Claims | Actual (Grep) | Delta | Accuracy |
|---|---------|----------|-------------------|------------|----------------|-------|----------|
| 01 | Auth & Admin | p0-mvp/01 | auth, profile, roles, sessions, tenant, users (6) | 34 | 34 | 0 | 100% |
| 03 | CRM | p0-mvp/03 | activities, companies, contacts, hubspot, opportunities (5) | 48 | 49 | +1 | 98% |
| 04 | Sales & Quotes | p0-mvp/04 | accessorial-rates, quotes, rate-contracts, sales-performance (4) | 47 | 47 | 0 | 100% |
| 05 | TMS Core | p0-mvp/05 | loads, orders, public-tracking, stops, tracking (5) | 51 | 45 | **-6** | **88%** |
| 06 | Carriers | p0-mvp/06 | carriers, contacts, documents, drivers-global, drivers, insurances (6) | 52 | 50 | -2 | 96% |
| 07 | Accounting | p0-mvp/07 | accounting, chart-of-accounts, invoices, journal-entries, payments-made, payments-received, payments, quickbooks, reports, settlements (10) | 54 | 54 | 0 | 100% |
| 08 | Commission | p0-mvp/08 | commission-entries, commission-payouts, commission-plans, commissions-dashboard (4) | 31 | 28 | -3 | 90% |
| 09 | Load Board | p0-mvp/09 | accounts, analytics, capacity, load-bids, load-postings, load-tenders, leads, posting, rules (9) | 62 | 62 | 0 | 100% |
| 10 | Claims | p2-ext/10 | claims, claim-documents, claim-items, claim-notes, reports, resolution, subrogation (7) | 39 | 39 | 0 | 100% |
| 11 | Documents | p1-post/11 | document-folders, document-templates, documents (3) | 20 | 20 | 0 | 100% |
| 12 | Communication | p1-post/12 | email, notifications, preferences, sms, templates (5) | 30 | 30 | 0 | 100% |
| 13 | Customer Portal | p0-mvp/13 | portal-auth, portal-dashboard, portal-invoices, portal-payments, portal-quotes, portal-shipments, portal-users (7) | 40 | 40 | 0 | 100% |
| 14 | Carrier Portal | p1-post/14 | carrier-portal-auth, -compliance, -dashboard, -documents, -invoices, -loads, -users (7) | 56 | 54 | -2 | 96% |
| 15 | Contracts | p2-ext/15 | amendments, contracts, fuel-surcharge, rate-lanes, rate-tables, slas, contract-templates, volume-commitments (8) | 58 | 58 | 0 | 100% |
| 16 | Agents | p2-ext/16 | agents, agent-agreements, customer-assignments, agent-commissions, agent-leads, agent-statements (6) | 43 | 42 | -1 | 98% |
| 17 | Credit | p2-ext/17 | credit-applications, collections, credit-holds, credit-limits, payment-plans (5) | 31 | 31 | 0 | 100% |
| 18 | Factoring | p2-ext/18 | carrier-factoring-status, factoring-companies, noa-records, factored-payments, factoring-verifications (5) | 30 | 30 | 0 | 100% |
| 19 | Analytics | p2-ext/19 | alerts, dashboards, kpis, reports (4) | 41 | 40 | -1 | 98% |
| 20 | Workflow | p2-ext/20 | approvals, executions, templates, workflows (4) | 35 | 35 | 0 | 100% |
| 21 | Integration Hub | p2-ext/21 | integrations, sync, webhooks (3) | 45 | 45 | 0 | 100% |
| 22 | Search | p2-ext/22 | admin, entity-search, global-search, saved-searches (4) | 27 | 27 | 0 | 100% |
| 23 | HR | p3-future/23 | departments, employees, locations, positions, time-off, time-entries (6) | 35 | 35 | 0 | 100% |
| 24 | Scheduler | p3-future/24 | executions, jobs, reminders, tasks, templates (5) | 25 | 25 | 0 | 100% |
| 25 | Safety | p3-future/25 | alerts, csa, dqf, fmcsa, incidents, insurance, safety-reports, safety-scores, watchlist (9) | 43 | 43 | 0 | 100% |
| 26 | EDI | p3-future/26 | edi-documents, edi-generation, edi-mappings, edi-queue, trading-partners (5) | 38 | 35 | -3 | 92% |
| 27 | Help Desk | p3-future/27 | canned-responses, kb, sla-policies, teams, tickets (5) | 31 | 31 | 0 | 100% |
| 28 | Feedback | p3-future/28 | feedback-entries, features, nps, surveys, widgets (5) | 25 | 25 | 0 | 100% |
| 29 | Rate Intelligence | p3-future/29 | rate-alerts, analytics, rate-history, lane-analytics, rate-lookup, providers (6) | 21 | 21 | 0 | 100% |
| 30 | Audit | p3-future/30 | user-activity, alerts, api-audit, audit, compliance, change-history, audit-logs, retention (8) | 33 | 31 | -2 | 94% |
| 31 | Config | p3-future/31 | business-hours, email-templates, features, preferences, sequences, system-config, templates, tenant-services, tenant-config (9) | 39 | 39 | 0 | 100% |
| 32 | Cache | p3-future/32 | cache-config, locks, cache-management, rate-limit (4) | 20 | 20 | 0 | 100% |
| 37 | Health | p-infra/37 | health (1) | 3 | 3 | 0 | 100% |
| 38 | Operations | p-infra/38 | carriers, dashboard, equipment, inland-service-types, load-history, load-planner-quotes, truck-types (7) | 61 | 62 | +1 | 98% |

---

## Services with Discrepancies (10 of 33)

### Hub Over-Claims (phantom endpoints in docs, not in code)

| Service | Hub | Actual | Delta | Phantom Endpoints |
|---------|-----|--------|-------|-------------------|
| **TMS Core** | 51 | 45 | -6 | 6 endpoints listed in hub but no matching decorator in code |
| **Commission** | 31 | 28 | -3 | 3 phantom endpoints |
| **EDI** | 38 | 35 | -3 | 3 phantom endpoints |
| **Carrier Portal** | 56 | 54 | -2 | 2 phantom endpoints |
| **Carriers** | 52 | 50 | -2 | 2 phantom endpoints |
| **Audit** | 33 | 31 | -2 | 2 phantom endpoints |
| **Agents** | 43 | 42 | -1 | 1 phantom endpoint |
| **Analytics** | 41 | 40 | -1 | 1 phantom endpoint |

### Code Has More Than Hub Claims

| Service | Hub | Actual | Delta | Extra Endpoints |
|---------|-----|--------|-------|-----------------|
| **CRM** | 48 | 49 | +1 | 1 undocumented endpoint (likely convenience route) |
| **Operations** | 61 | 62 | +1 | 1 undocumented endpoint |

---

## Per-Controller Breakdown (Discrepancy Services)

### TMS Core (Delta: -6, worst discrepancy)

| Controller File | Grep Count |
|-----------------|------------|
| loads.controller.ts | 15 |
| orders.controller.ts | 19 |
| public-tracking.controller.ts | 1 |
| stops.controller.ts | 8 |
| tracking.controller.ts | 2 |
| **Total** | **45** |

### Commission (Delta: -3)

| Controller File | Grep Count |
|-----------------|------------|
| commission-entries.controller.ts | 7 |
| commission-payouts.controller.ts | 6 |
| commission-plans.controller.ts | 6 |
| commissions-dashboard.controller.ts | 9 |
| **Total** | **28** |

### EDI (Delta: -3)

| Controller File | Grep Count |
|-----------------|------------|
| edi-documents.controller.ts | 10 |
| edi-generation.controller.ts | 6 |
| edi-mappings.controller.ts | 5 |
| edi-queue.controller.ts | 6 |
| trading-partners.controller.ts | 8 |
| **Total** | **35** |

### Carrier Portal (Delta: -2)

| Controller File | Grep Count |
|-----------------|------------|
| carrier-portal-auth.controller.ts | 7 |
| carrier-portal-compliance.controller.ts | 5 |
| carrier-portal-dashboard.controller.ts | 5 |
| carrier-portal-documents.controller.ts | 6 |
| carrier-portal-invoices.controller.ts | 8 |
| carrier-portal-loads.controller.ts | 15 |
| carrier-portal-users.controller.ts | 8 |
| **Total** | **54** |

### Carriers (Delta: -2)

| Controller File | Grep Count |
|-----------------|------------|
| carriers.controller.ts | 20 |
| contacts.controller.ts | 4 |
| documents.controller.ts | 6 |
| drivers-global.controller.ts | 6 |
| drivers.controller.ts | 7 |
| insurances.controller.ts | 7 |
| **Total** | **50** |

### Audit (Delta: -2)

| Controller File | Grep Count |
|-----------------|------------|
| user-activity.controller.ts | 4 |
| alerts.controller.ts | 4 |
| api-audit.controller.ts | 3 |
| audit.controller.ts | 6 |
| compliance.controller.ts | 3 |
| change-history.controller.ts | 3 |
| audit-logs.controller.ts | 5 |
| retention.controller.ts | 3 |
| **Total** | **31** |

---

## Excluded Services

| # | Service | Hub Path | Reason |
|---|---------|----------|--------|
| 02 | Dashboard | p0-mvp/02 | Cross-cutting aggregation — claims "33+ endpoints across 6 controllers" but those endpoints belong to Operations, Analytics, Accounting, Commission, Carrier Portal, and Customer Portal (already counted under those modules) |
| 33 | Super Admin | p-infra/33 | Not a standalone module — reuses Auth's 34 endpoints via SUPER_ADMIN role bypass in RolesGuard |
| 34 | Email | p-infra/34 | Internal infrastructure service — no REST controllers, consumed internally by Auth module |
| 35 | Storage | p-infra/35 | Internal infrastructure service — no REST controllers, consumed via STORAGE_SERVICE DI token |
| 36 | Redis | p-infra/36 | Internal infrastructure service — no REST controllers, consumed via DI |
| 39 | Command Center | p0-mvp/39 | Not yet built — planned for Phase 4 |

---

## Run 1 vs Run 2 Comparison

The manual agent-based Run 1 produced significantly different results from the authoritative grep-based Run 2:

| Metric | Run 1 (Manual) | Run 2 (Grep) | Improvement |
|--------|---------------|--------------|-------------|
| Total actual endpoints | 1,187 | 1,230 | +43 corrected |
| Overall delta | -61 (4.9%) | -18 (1.4%) | 3.5x more accurate |
| Exact matches | 12/33 (36%) | 23/33 (70%) | +11 services |
| Within ±10% | 24/33 (73%) | 32/33 (97%) | +8 services |
| >10% discrepancy | 9/33 (27%) | 1/33 (3%) | -8 services |

### Largest Manual Counting Errors

| Module | Run 1 (Manual) | Run 2 (Grep) | Agent Error | Direction |
|--------|---------------|--------------|-------------|-----------|
| Accounting | 44 | 54 | -10 | Undercounted |
| Load Board | 55 | 62 | -7 | Undercounted |
| Workflow | 29 | 35 | -6 | Undercounted |
| Carrier | 45 | 50 | -5 | Undercounted |
| Integration Hub | 42 | 45 | -3 | Undercounted |
| CRM | 52 | 49 | +3 | Overcounted |
| Analytics | 43 | 40 | +3 | Overcounted |
| Carrier Portal | 56 | 54 | +2 | Overcounted |

**Root cause:** AI agents reading large controller files manually tend to undercount, especially in files with many endpoints. `invoices.controller.ts` has 11 decorators but the agent counted 7. Programmatic grep is deterministic and should always be preferred for this type of verification.

---

## Findings

### F1: Hub Documentation Accuracy is High (70% exact, 97% within ±10%)

23 of 33 services have perfect endpoint count matches between hub files and actual code. Only TMS Core exceeds 10% discrepancy. The dev_docs_v3 hub files are a reliable source of truth for API surface area.

### F2: Net Over-Claim Pattern

Where discrepancies exist, hubs tend to over-claim by listing planned endpoints that were never implemented. The net deficit is -18 endpoints (20 phantom minus 2 undocumented). This suggests hubs were written with aspirational endpoint lists that were trimmed during implementation.

### F3: TMS Core Has the Largest Documentation Gap

Hub claims 51 endpoints but only 45 exist. Six phantom endpoints need to be identified and either implemented or removed from documentation. This is the only service exceeding 10% discrepancy.

### F4: Manual AI Counting is Unreliable for Large-Scale Verification

Run 1 agents produced 43 counting errors across 33 services, with the worst being 10 missed endpoints in a single module. Programmatic verification should always be used for endpoint audits.

### F5: Total API Surface is 1,230 Endpoints

148 controller files across 33 active modules implement 1,230 HTTP endpoints. An additional 5 `.bak` directories contain archived controllers not included in this count.

---

## Recommendations

### R1: Fix TMS Core Hub (Priority: Medium)

Update `dev_docs_v3/01-services/p0-mvp/05-tms-core.md` Section 4 to reflect 45 actual endpoints (not 51). Identify which 6 endpoints are phantom and either:
- Remove them from documentation, or
- Add them to the backlog if they represent planned functionality

### R2: Fix Commission Hub (Priority: Low)

Update `dev_docs_v3/01-services/p0-mvp/08-commission.md` to reflect 28 endpoints (not 31). Remove 3 phantom entries.

### R3: Fix EDI Hub (Priority: Low)

Update `dev_docs_v3/01-services/p3-future/26-edi.md` to reflect 35 endpoints (not 38). Remove 3 phantom entries.

### R4: Fix Minor Discrepancies (Priority: Low)

Update hub files for Carrier Portal (-2), Carriers (-2), Audit (-2), Agents (-1), Analytics (-1). Document the +1 undocumented endpoints in CRM and Operations.

### R5: Add Automated Endpoint Count CI Check (Priority: Future)

Add a CI script that runs the grep command and compares against hub claims. This would catch documentation drift automatically:

```bash
# Example CI check
ACTUAL=$(find apps/api/src/modules -name "*.controller.ts" ! -path "*.bak*" \
  -exec grep -cE "@(Get|Post|Put|Patch|Delete)\(" {} + | awk -F: '{sum+=$2} END {print sum}')
echo "Total endpoints: $ACTUAL"
# Compare against expected count in a config file
```

### R6: Always Use Programmatic Verification (Process)

For any future endpoint audits, use grep-based counting exclusively. Manual AI agent counting has a ~3.5% error rate that compounds across modules.

---

## Reproducibility

To reproduce these results, run from the repository root:

```bash
# Per-module totals
find apps/api/src/modules -name "*.controller.ts" ! -path "*.bak*" \
  -exec sh -c 'module=$(echo "$1" | sed "s|apps/api/src/modules/||" | cut -d"/" -f1); \
  count=$(grep -cE "@(Get|Post|Put|Patch|Delete)\(" "$1"); echo "$module|$count"' _ {} \; \
  | awk -F'|' '{sum[$1]+=$2} END {for(m in sum) print m, sum[m]}' | sort

# Grand total
find apps/api/src/modules -name "*.controller.ts" ! -path "*.bak*" \
  -exec grep -cE "@(Get|Post|Put|Patch|Delete)\(" {} + \
  | awk -F: '{sum+=$NF} END {print "Total:", sum}'
```
