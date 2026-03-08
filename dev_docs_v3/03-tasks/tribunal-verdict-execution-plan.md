# Tribunal Verdict Execution Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Execute all 51 Tribunal action items in priority order, transforming Ultra TMS from "impressive backend, incomplete frontend" to "demo-ready for small brokers."

**Architecture:** Work in 5 sprints organized by dependency chains. Foundation hardening first (tenant isolation, tests), then demo-blocking features (rate con, BOL, customer portal), then polish (tier reorganization, documentation updates).

**Source:** `dev_docs_v3/05-audit/tribunal/VERDICTS.md` — 51 action items across P0/P1/P2/P3.

---

## Sprint Overview

| Sprint | Name | Duration | Items | Theme |
|--------|------|----------|-------|-------|
| S1 | Foundation Hardening | 1 week | #1-5, #9-11 | Security + testing + WebSocket fix |
| S2 | Demo Blockers | 2-3 weeks | #6-8, #12 | PDF engine + rate con + BOL + positioning |
| S3 | Tier Reorganization + Docs | 1-2 days | #16, #21-26, #28, #30, #32-34 | Move hubs, update indexes, write ADRs |
| S4 | Launch Readiness | 2-3 weeks | #13-15, #17-20, #27, #29, #31 | Customer portal, test expansion, CI gates |
| S5 | Post-Launch Polish | Ongoing | #35-51 | Benchmarks, RLS, integrations, infra |

---

## Sprint S1: Foundation Hardening (Week 1)

> **Rule:** No new features until this sprint is complete. The foundation must be trustworthy.

### Task S1-1: Prisma Client Extension for Auto tenantId (Verdict #1)

**Priority:** P0 | **Effort:** 4-8 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-05

**What:** Create a Prisma Client Extension that automatically injects `tenantId` and `deletedAt: null` into every query, eliminating 801 manual WHERE clauses as the sole tenant isolation mechanism.

**Files:**
- Create: `apps/api/src/prisma-tenant.extension.ts`
- Modify: `apps/api/src/prisma.service.ts` — apply extension in onModuleInit
- Modify: `apps/api/src/app.module.ts` — ensure tenant context propagation
- Test: `apps/api/src/prisma-tenant.extension.spec.ts`

**Implementation approach:**
- Use `prisma.$extends()` with query component
- Extract tenantId from NestJS request context (AsyncLocalStorage or ClsModule)
- Override `findMany`, `findFirst`, `findUnique`, `create`, `update`, `delete`, `count`, `aggregate`
- Auto-inject `where: { tenantId, deletedAt: null }` on reads
- Auto-inject `data: { tenantId }` on creates
- Skip injection for models without tenantId (log tables, enums)
- Use DMMF reflection (same pattern as existing soft-delete middleware in prisma.service.ts)

**Existing patterns to reuse:**
- `apps/api/src/prisma.service.ts` — already has DMMF-based soft-delete middleware (lines 9-62)
- `apps/api/src/modules/auth/strategies/jwt.strategy.ts` — JwtPayload includes tenantId (line 13)

**Tests:**
1. Verify auto-injection on findMany (tenantId added to where)
2. Verify auto-injection on create (tenantId added to data)
3. Verify skip for non-tenant models
4. Verify override still allows explicit tenantId (doesn't double-filter)
5. Verify deletedAt: null auto-injected on reads

**Acceptance criteria:**
- [ ] Extension created and applied to PrismaService
- [ ] All existing tests still pass
- [ ] New extension tests pass
- [ ] Manual verification: query without tenantId still gets filtered

**Commit:** `feat(api): add Prisma Client Extension for automatic tenantId injection`

---

### Task S1-2: CI Lint Rule for Tenant-Scoped Queries (Verdict #2)

**Priority:** P0 | **Effort:** 2-4 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-05

**What:** Static analysis rule that flags any direct `prisma.model.findMany()` usage that doesn't go through the tenant-scoped client.

**Files:**
- Create: `apps/api/eslint-rules/no-raw-prisma.js` (or ESLint plugin)
- Modify: `apps/api/.eslintrc.js` — register custom rule

**Implementation approach:**
- Custom ESLint rule that flags `this.prisma.{model}.{method}()` calls missing tenantId in where clause
- OR: simpler approach — grep-based CI check in a GitHub Action step
- Decision: start with grep-based (faster to implement), graduate to ESLint later

**Acceptance criteria:**
- [ ] CI script or ESLint rule detects raw prisma calls without tenantId
- [ ] Existing violations documented (baseline count)
- [ ] Rule runs on every PR

**Commit:** `chore(api): add CI lint rule for tenant-scoped Prisma queries`

---

### Task S1-3: Execute QS-008 Route Verification (Verdict #3)

**Priority:** P0 | **Effort:** 4-6 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-08

**What:** Use Playwright to navigate every one of the 98 frontend routes. Record which routes render, which crash, which show blank pages, which have console errors.

**Files:**
- Create: `apps/web/tests/route-verification.spec.ts`
- Create: `dev_docs_v3/05-audit/route-verification-results.md` — results log

**Implementation approach:**
- Scan `apps/web/app/` for all `page.tsx` files to build route list
- For each route: navigate, wait for load, capture screenshot, check console errors
- Categorize: PASS (renders), WARN (renders with console errors), FAIL (crash/blank)
- Output markdown report with route, status, screenshot path, error details

**Existing patterns:**
- QS-008 task file in `dev_docs_v3/03-tasks/sprint-quality/QS-008-*.md` has detailed acceptance criteria

**Acceptance criteria:**
- [ ] All 98 routes visited
- [ ] Results report created with pass/warn/fail counts
- [ ] Critical failures logged as new task items
- [ ] STATUS.md updated with verification results

**Commit:** `test(web): Playwright route verification for all 98 routes`

---

### Task S1-4: Financial Calculation Tests (Verdict #4)

**Priority:** P0 | **Effort:** 6-8 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-08

**What:** Write 10 tests covering invoice totals, commission splits, settlement reconciliation, and decimal handling.

**Files:**
- Create/Enhance: `apps/api/src/modules/accounting/services/invoices.service.spec.ts`
- Create/Enhance: `apps/api/src/modules/accounting/services/settlements.service.spec.ts`
- Create/Enhance: `apps/api/src/modules/commission/services/commission-entries.service.spec.ts`

**Tests to write:**
1. Invoice total calculation — line items sum correctly
2. Invoice with tax — tax applied after subtotal
3. Invoice with discount — discount applied correctly
4. Commission split — percentage-based (e.g., 10% of $5000 margin = $500)
5. Commission split — flat-rate (e.g., $50 per load)
6. Commission split — tiered (e.g., 8% up to $100K, 10% above)
7. Settlement amount — carrier pay matches load rate minus deductions
8. Settlement with quick-pay fee — percentage deducted correctly
9. Decimal precision — never use floating point, always integer cents or Decimal
10. Multi-line-item invoice — totals, taxes, and discounts calculated correctly across items

**Existing patterns to reuse:**
- `apps/api/src/modules/accounting/pdf.service.spec.ts` — PDFKit mocking (81 lines)
- `apps/api/src/modules/tms/loads.service.spec.ts` — service mocking with PrismaService (80 lines)

**Acceptance criteria:**
- [ ] 10 tests written and passing
- [ ] All tests use realistic TMS data (not "test123")
- [ ] No floating-point arithmetic in tested code (assert integer cents or Decimal)

**Commit:** `test(api): add 10 financial calculation tests for accounting and commission`

---

### Task S1-5: Tenant Isolation Tests (Verdict #5)

**Priority:** P0 | **Effort:** 4-6 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-05, TRIBUNAL-08

**What:** Write 5 tests verifying that Tenant A cannot see Tenant B's data across key entities.

**Files:**
- Create: `apps/api/src/tests/tenant-isolation.spec.ts`

**Tests to write:**
1. Loads — Tenant A's loads not returned by Tenant B's query
2. Carriers — Tenant A's carriers not visible to Tenant B
3. Invoices — Tenant A's invoices not accessible by Tenant B
4. Orders — Tenant A's orders not returned for Tenant B
5. Customers — Tenant A's customers isolated from Tenant B

**Implementation approach:**
- Use integration tests with real Prisma client (not mocked)
- Create two tenants with seed data
- Query as each tenant, verify only own data returned
- Verify count matches expected per-tenant count

**Acceptance criteria:**
- [ ] 5 tests written and passing
- [ ] Tests verify both findMany (list) and findFirst (detail) isolation
- [ ] Tests verify create doesn't allow cross-tenant data

**Commit:** `test(api): add 5 tenant isolation tests for loads, carriers, invoices, orders, customers`

---

### Task S1-6: Fix SocketProvider Infinite Reconnection (Verdict #9)

**Priority:** P0 | **Effort:** 2-3 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-09

**What:** Fix the infinite reconnection loop in socket-provider.tsx. Connect only to `/notifications` namespace at MVP.

**Files:**
- Modify: `apps/web/lib/socket/socket-provider.tsx`
- Modify: `apps/web/lib/socket/socket-config.ts` — reduce active namespaces

**Implementation approach:**
- In socket-config.ts: set ACTIVE_NAMESPACES to `['/notifications']` only (currently 4)
- In socket-provider.tsx: add connection guard — only connect if namespace gateway exists
- Add exponential backoff with max retry limit (currently unlimited reconnection)
- Add `enabled` flag — disable socket if no auth token present

**Acceptance criteria:**
- [ ] SocketProvider connects to `/notifications` only
- [ ] No infinite reconnection loop when backend gateway doesn't exist
- [ ] Exponential backoff with max 5 retries
- [ ] Browser console clean (no repeated connection errors)

**Commit:** `fix(web): fix SocketProvider infinite reconnection, limit to /notifications`

---

### Task S1-7: Implement /notifications WebSocket Gateway (Verdict #10)

**Priority:** P0 | **Effort:** 4-5 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-09

**What:** Create the first WebSocket gateway for the `/notifications` namespace with JWT auth and tenant room isolation.

**Files:**
- Create: `apps/api/src/modules/notifications/notifications.gateway.ts`
- Create: `apps/api/src/modules/notifications/notifications.module.ts`
- Create: `apps/api/src/modules/notifications/guards/ws-jwt.guard.ts`
- Modify: `apps/api/src/app.module.ts` — register NotificationsModule
- Modify: `apps/api/src/main.ts` — add Redis IoAdapter (if scaling needed)

**Implementation approach:**
- `@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })`
- WsJwtGuard validates token from `client.handshake.auth.token`
- On connection: join tenant room `tenant:{tenantId}`
- Emit events: `notification:new`, `notification:read`, `notification:count`
- Use EventEmitter2 to bridge HTTP events to WebSocket (e.g., load.created -> notification)

**Existing patterns to reuse:**
- `apps/web/lib/socket/socket-config.ts` — typed event interfaces (lines 30-100+)
- `apps/api/src/modules/auth/guards/jwt-auth.guard.ts` — JWT validation pattern

**Acceptance criteria:**
- [ ] Gateway accepts WebSocket connections on `/notifications`
- [ ] JWT authentication required (unauthorized connections rejected)
- [ ] Tenant room isolation (Tenant A doesn't receive Tenant B notifications)
- [ ] At least one event type working end-to-end (e.g., notification:new)
- [ ] Frontend SocketProvider successfully connects

**Commit:** `feat(api): add /notifications WebSocket gateway with JWT auth and tenant rooms`

---

### Task S1-8: Fix BUG-012 localStorage Tokens (Verdict #11)

**Priority:** P0 | **Effort:** 2-4 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-06

**What:** Investigate and fix any remaining localStorage token storage at `lib/api/client.ts` lines 59, 77.

**Note from codebase exploration:** The current implementation appears to use HTTP-only cookies (`readCookie`, `writeCookie`), NOT localStorage. This bug may already be fixed or the line numbers may have shifted. Task is to verify and close.

**Files:**
- Read: `apps/web/lib/api/client.ts` (full file)
- Search: `localStorage` across entire `apps/web/` directory

**Acceptance criteria:**
- [ ] No `localStorage.setItem` calls storing JWT tokens
- [ ] All token storage uses HTTP-only cookies
- [ ] If already fixed, update bug tracker and close BUG-012
- [ ] Update CLAUDE.md "Known Critical Issues" table

**Commit:** `fix(web): verify and close BUG-012 localStorage token storage`

---

## Sprint S2: Demo Blockers (Weeks 2-4)

> **Rule:** These features must work for a 30-minute broker demo. Focus on end-to-end flow.

### Task S2-1: PDF Template Engine (Verdict #6)

**Priority:** P0 | **Effort:** 1-2 weeks | **Owner:** Claude Code | **Source:** TRIBUNAL-10

**What:** Extend existing PDFKit-based pdf.service.ts to support rate confirmation and BOL templates. Not a new engine — build on what exists.

**Files:**
- Modify: `apps/api/src/modules/accounting/services/pdf.service.ts` — add rateConPdf and bolPdf methods
- OR Create: `apps/api/src/modules/tms/services/document-generation.service.ts` — if separating from accounting
- Create: `apps/api/src/modules/tms/templates/rate-confirmation.template.ts`
- Create: `apps/api/src/modules/tms/templates/bol.template.ts`
- Test: corresponding `.spec.ts` files

**Existing pattern to reuse:**
- `apps/api/src/modules/accounting/services/pdf.service.ts` — generateInvoicePdf() (lines 7-81) uses PDFKit, returns Buffer
- PDFKit already in `apps/api/package.json` (pdfkit@0.17.2)

**Acceptance criteria:**
- [ ] `generateRateConPdf(load)` returns Buffer with correct load data
- [ ] `generateBolPdf(order, load, stops)` returns Buffer with correct shipment data
- [ ] Both methods produce valid PDFs that open in any PDF viewer
- [ ] Templates include: company header, shipment details, terms, signature lines
- [ ] Tests verify data mapping and PDF buffer output

---

### Task S2-2: Rate Confirmation Generation (Verdict #7)

**Priority:** P0 | **Effort:** 1-2 weeks | **Owner:** Claude Code | **Source:** TRIBUNAL-02, TRIBUNAL-04, TRIBUNAL-10

**What:** End-to-end rate confirmation workflow: generate PDF from Load data, preview, send to carrier.

**Files:**
- Create: `apps/api/src/modules/tms/controllers/rate-confirmation.controller.ts`
- Modify: `apps/api/src/modules/tms/loads.service.ts` — add generateRateCon method
- Create: frontend page or modal for rate con preview/send
- Modify: TMS Core hub file to document rate con feature

**Existing patterns:**
- `apps/api/src/modules/tms/dto/rate-confirmation.dto.ts` — DTO exists (20 lines)
- `apps/web/lib/hooks/tms/use-rate-confirmation.ts` — frontend hook exists
- Load model has `rateConfirmationSent`, `rateConfirmationSigned` fields

**Acceptance criteria:**
- [ ] API endpoint: `POST /api/v1/loads/:id/rate-confirmation` generates PDF
- [ ] API endpoint: `POST /api/v1/loads/:id/rate-confirmation/send` emails to carrier
- [ ] Frontend: button on load detail page to generate/preview/send rate con
- [ ] Load model updated: rateConfirmationSent timestamp set on send
- [ ] PDF includes: load details, rates, pickup/delivery info, terms, signature line

---

### Task S2-3: BOL Generation (Verdict #8)

**Priority:** P0 | **Effort:** 1 week | **Owner:** Claude Code | **Source:** TRIBUNAL-02, TRIBUNAL-04, TRIBUNAL-10

**What:** Generate Bill of Lading PDF from Order/Load/Stops data. Shares PDF engine from S2-1.

**Files:**
- Add method to document generation service from S2-1
- Create: frontend page or modal for BOL preview/download
- Modify: TMS Core hub file to document BOL feature

**Acceptance criteria:**
- [ ] API endpoint: `POST /api/v1/loads/:id/bol` generates BOL PDF
- [ ] Frontend: button on load detail page to generate/download BOL
- [ ] BOL includes: shipper/consignee, commodity, weight, piece count, special instructions
- [ ] Standard BOL format recognized by carriers

---

### Task S2-4: Competitive Repositioning (Verdict #12)

**Priority:** P0 | **Effort:** 1 hour | **Owner:** Rabih | **Source:** TRIBUNAL-04

**What:** Update positioning statement from generic "best TMS" to specific differentiator.

**New positioning:** "The only TMS with built-in CRM, accounting, and commission management for small brokerages graduating from spreadsheets."

**Files:**
- Update: `dev_docs_v3/00-foundations/project-brief.md` (if positioning is documented there)
- Update: `CLAUDE.md` — add positioning statement
- Update: any marketing copy or README references

**Acceptance criteria:**
- [ ] Positioning statement updated in project docs
- [ ] No claims of "AI-powered" or "best UX" without substantiation
- [ ] Target market explicitly stated: small brokerages, 10-50 users

---

## Sprint S3: Tier Reorganization + Docs (Days 1-2)

> **Rule:** Documentation-only sprint. No code changes. Can be parallelized with S2.

### Task S3-1: Create p-infra Directory + Move 6 Infrastructure Hubs (Verdicts #32-34)

**Priority:** P2 | **Effort:** 2 hours | **Owner:** Codex/Gemini | **Source:** TRIBUNAL-01

**Files:**
- Create: `dev_docs_v3/01-services/p-infra/` directory
- Create: `dev_docs_v3/01-services/p-infra/_index.md`
- Move: 6 hub files from `p3-future/` to `p-infra/`: email.md, storage.md, redis.md, health.md, operations.md, super-admin.md
- Update: `dev_docs_v3/01-services/p3-future/_index.md` — remove 6 entries
- Update: `dev_docs_v3/04-completeness/service-matrix.md` — reflect 32 services + 6 infra
- Update: `dev_docs_v3/STATUS.md` — update service count and P3 description

**Acceptance criteria:**
- [ ] p-infra/ directory exists with 6 hub files + _index.md
- [ ] p3-future/ updated to 10 services (was 16)
- [ ] All _index.md files consistent
- [ ] STATUS.md reflects new taxonomy

---

### Task S3-2: Move Customer Portal to P0, Claims + Contracts to P2 (Verdicts #22-25)

**Priority:** P1 | **Effort:** 1 hour | **Owner:** Codex/Gemini | **Source:** TRIBUNAL-02

**Files:**
- Move: `dev_docs_v3/01-services/p1-post-mvp/customer-portal.md` to `dev_docs_v3/01-services/p0-mvp/customer-portal.md`
- Move: `dev_docs_v3/01-services/p1-post-mvp/claims.md` to `dev_docs_v3/01-services/p2-extended/claims.md`
- Move: `dev_docs_v3/01-services/p1-post-mvp/contracts.md` to `dev_docs_v3/01-services/p2-extended/contracts.md`
- Update: All 4 affected `_index.md` files
- Update: `dev_docs_v3/STATUS.md` — service health tables
- Update: Customer Portal hub — add "P0-Basic" scope (login, dashboard, tracking, docs)

**Acceptance criteria:**
- [ ] P0 has 10 services (was 9)
- [ ] P1 has 3 services (was 6): Documents, Communication, Carrier Portal
- [ ] P2 has 9 services (was 7): +Claims, +Contracts
- [ ] Customer Portal hub has P0-Basic scope section
- [ ] Carrier Portal hub annotated as "First P1 service to build"

---

### Task S3-3: Add Rate Con + BOL to TMS Core Hub (Verdict #26)

**Priority:** P1 | **Effort:** 30 min | **Owner:** Claude Code | **Source:** TRIBUNAL-01, TRIBUNAL-02

**Files:**
- Modify: `dev_docs_v3/01-services/p0-mvp/tms-core.md` — add Rate Confirmation and BOL sections

**Acceptance criteria:**
- [ ] TMS Core hub has "Rate Confirmation" section with endpoints, workflow, status
- [ ] TMS Core hub has "BOL Generation" section with endpoints, workflow, status

---

### Task S3-4: Write ADR-016 Portal Authentication (Verdict #30)

**Priority:** P1 | **Effort:** 1 hour | **Owner:** Claude Code | **Source:** TRIBUNAL-06

**Files:**
- Modify: `dev_docs_v3/07-decisions/decision-log.md` — add ADR-016

**Content:** Separate JWT secrets for Customer/Carrier portals. Rationale: token isolation, blast radius containment, industry standard. Thin-controller facade pattern. Scope guards (company-scope, carrier-scope).

---

### Task S3-5: Add Anti-Pattern #11 + Dispatch Polling Fallback (Verdicts #16, #28)

**Priority:** P1 | **Effort:** 30 min each | **Owner:** Codex/Gemini | **Source:** TRIBUNAL-05, TRIBUNAL-09

**Files:**
- Modify: `dev_docs_v3/05-audit/recurring-patterns.md` — add "Missing tenantId filter" as pattern #11
- Modify: `dev_docs_v3/01-services/p0-mvp/tms-core.md` — document React Query 30s polling as dispatch fallback

---

### Task S3-6: Update QS-001 Scope + Create QS-011 through QS-016 (Verdicts from strategic recommendations)

**Priority:** P1 | **Effort:** 1 hour | **Owner:** Claude Code | **Source:** VERDICTS.md strategic recommendations

**Files:**
- Modify: `dev_docs_v3/03-tasks/sprint-quality/QS-001-*.md` — reduce scope to /notifications only
- Create: `dev_docs_v3/03-tasks/sprint-quality/QS-011-customer-portal-basic.md`
- Create: `dev_docs_v3/03-tasks/sprint-quality/QS-012-rate-con-pdf.md`
- Create: `dev_docs_v3/03-tasks/sprint-quality/QS-013-bol-pdf.md`
- Create: `dev_docs_v3/03-tasks/sprint-quality/QS-014-prisma-tenant-extension.md`
- Create: `dev_docs_v3/03-tasks/sprint-quality/QS-015-financial-tests.md`
- Create: `dev_docs_v3/03-tasks/sprint-quality/QS-016-tenant-isolation-tests.md`
- Modify: `dev_docs_v3/STATUS.md` — add new QS tasks to sprint table

---

## Sprint S4: Launch Readiness (Weeks 4-6)

### Task S4-1: Basic Customer Portal Frontend (Verdict #13)

**Priority:** P1 | **Effort:** 2-3 weeks | **Owner:** Claude Code | **Source:** TRIBUNAL-02, TRIBUNAL-04, TRIBUNAL-10

**What:** Build 4 pages using existing 40 backend endpoints: login, dashboard, shipment tracking, document access.

**Depends on:** S2-1 (PDF engine) for document download

---

### Task S4-2: Expand Tenant Isolation Tests to 10 Entities (Verdict #14)

**Priority:** P1 | **Effort:** 8-12 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-05

**What:** Extend S1-5 tests from 5 to 10 entities: add documents, settlements, users, contacts, payments.

---

### Task S4-3: Audit Raw Prisma Queries (Verdict #15)

**Priority:** P1 | **Effort:** 2 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-05

**What:** Search for `$queryRaw` and `$executeRaw` calls, verify all include tenantId.

---

### Task S4-4: Remove Elasticsearch from Dev Docker (Verdict #17)

**Priority:** P1 | **Effort:** 30 min | **Owner:** Codex/Gemini | **Source:** TRIBUNAL-03

**What:** Comment out or remove ES + Kibana from docker-compose.yml. Saves 1.5 GB RAM in dev.

---

### Task S4-5: Reach 15% Frontend Coverage (Verdict #19)

**Priority:** P1 | **Effort:** 12-16 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-08

**What:** Add tests to Accounting, TMS Core, and Dashboard modules to reach 15% overall frontend coverage (from 8.7%).

---

### Task S4-6: Financial Mandate CI Gate (Verdict #20)

**Priority:** P1 | **Effort:** 2 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-08

**What:** Add coverage threshold check to CI: Accounting + Commission + Settlement must be >= 20%.

---

### Task S4-7: WebSocket Integration Tests (Verdict #27)

**Priority:** P1 | **Effort:** 2-3 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-09

**What:** 5 tests: connect, auth, tenant isolation, event emit, disconnect.

---

### Task S4-8: Portal Auth Integration Tests (Verdict #29)

**Priority:** P1 | **Effort:** 4-6 hours | **Owner:** Claude Code | **Source:** TRIBUNAL-06

**What:** Test token generation, validation, scope enforcement, cross-portal rejection.

---

### Task S4-9: QuickBooks Sync (Verdict #31)

**Priority:** P1 | **Effort:** 2-3 weeks | **Owner:** Claude Code | **Source:** TRIBUNAL-04, TRIBUNAL-10

**What:** Complete invoice/payment sync via Integration Hub module.

---

## Sprint S5: Post-Launch Polish (Ongoing)

### P2 Items (Verdicts #35-49)

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 35 | Benchmark `prisma generate` time | 15 min | Codex/Gemini |
| 36 | Run `next/bundle-analyzer`, document top 10 chunks | 1 hour | Codex/Gemini |
| 37 | Count `"use client"` directives | 15 min | Codex/Gemini |
| 38 | RLS on 10 most sensitive tables | 8-16 hours | Claude Code |
| 39 | Partial indexes: `(tenantId) WHERE deletedAt IS NULL` | 4-8 hours | Claude Code |
| 40 | Add `@deferred(P2/P3)` comments to schema models | 2 hours | Codex/Gemini |
| 41 | Orphan model audit | 2-3 hours | Codex/Gemini |
| 42 | Audit 114 enums for usage | 1-2 hours | Codex/Gemini |
| 43 | Audit P3 hubs for stale content | 1 hour | Claude Code |
| 44 | DAT/Truckstop API integration | 3-4 weeks | Claude Code |
| 45 | ELD/GPS integration (Samsara/Motive) | 3-4 weeks | Claude Code |
| 46 | Exception dashboard | 3-4 weeks | Claude Code |
| 47 | Build 2 more AI features or remove AI from positioning | 4-6 weeks | Claude Code |
| 48 | Create QS-001b (/dispatch namespace) | 15 min | Codex/Gemini |
| 49 | Create QS-001c (/tracking + /dashboard namespaces) | 15 min | Codex/Gemini |

### P3 Items (Verdicts #50-51)

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 50 | Rename P3 tier from "Future" to "P3-Features" | 15 min | Codex/Gemini |
| 51 | Archival strategy for soft-deleted records > 1 year | 1-2 weeks | Claude Code |

---

## Dependency Chain

```
S1-1 (Prisma Extension) ──┐
S1-2 (CI Lint Rule) ───────┤
S1-5 (Tenant Tests) ───────┼── Foundation Gate ── S2 begins
S1-4 (Financial Tests) ────┤
S1-3 (QS-008 Verification) ┘

S2-1 (PDF Engine) ─────────┬── S2-2 (Rate Con) ──┐
                            └── S2-3 (BOL) ───────┼── Demo Gate ── S4 begins
S1-6 (Fix SocketProvider) ─┐                      │
S1-7 (/notifications GW) ──┘                      │
S1-8 (BUG-012) ───────────────────────────────────┘

S3 (Docs/Tiers) runs in parallel with S2 — no code dependencies
```

---

## Verification Checkpoints

### After S1 (Foundation Gate)
- [ ] Prisma Client Extension deployed, all existing tests pass
- [ ] 10 financial calculation tests passing
- [ ] 5 tenant isolation tests passing
- [ ] QS-008 results documented (X/98 routes pass)
- [ ] WebSocket connects to /notifications without infinite loop
- [ ] BUG-012 closed or verified already fixed

### After S2 (Demo Gate)
- [ ] Rate confirmation PDF generates from Load data
- [ ] BOL PDF generates from Order/Load/Stops data
- [ ] Both PDFs open correctly in standard viewer
- [ ] Send-to-carrier email workflow works for rate con
- [ ] Positioning updated in project docs

### After S3 (Docs Gate)
- [ ] p-infra/ directory with 6 hubs
- [ ] Customer Portal in P0, Claims/Contracts in P2
- [ ] QS-011 through QS-016 task files created
- [ ] ADR-016 written
- [ ] All _index.md files consistent
- [ ] STATUS.md fully updated

### After S4 (Launch Gate)
- [ ] Customer portal: 4 pages working (login, dashboard, tracking, docs)
- [ ] 15% frontend test coverage
- [ ] Financial mandate CI gate enforced
- [ ] Portal auth integration tests passing
- [ ] Elasticsearch removed from dev docker

---

## Effort Summary

| Sprint | Claude Code | Codex/Gemini | Rabih | Total |
|--------|------------|-------------|-------|-------|
| S1 | 30-40 hours | 0 | 0 | 30-40 hours |
| S2 | 3-5 weeks | 0 | 1 hour | 3-5 weeks |
| S3 | 2.5 hours | 4.5 hours | 0 | 7 hours |
| S4 | 5-7 weeks | 30 min | 0 | 5-7 weeks |
| S5 | 12-16 weeks | 8 hours | 0 | 12-16 weeks |

**Critical path to first demo:** S1 (1 week) + S2 (3 weeks) = **4 weeks minimum**.
