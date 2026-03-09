# Remediation Roadmap

> **Last Updated:** 2026-03-09
> **Total Estimated Effort:** ~220-280 hours of code remediation (12-16 developer-weeks)
> **Staffing Assumption:** 2 senior developers, 40h/week each
> **Timeline:** 12-16 weeks to production-ready (Sprints S4 through S7)
> **Companion Files:** [SECURITY-REMEDIATION.md](SECURITY-REMEDIATION.md) | [ROLESGUARD-GAP-MATRIX.md](ROLESGUARD-GAP-MATRIX.md) | [PRODUCTION-READINESS-ASSESSMENT.md](PRODUCTION-READINESS-ASSESSMENT.md)

---

## Sprint Sequencing

### Sprint S4: Security Hardening (3-4 weeks, ~80-100 hours)

**Goal:** Close ALL STOP-SHIP security items. No production deployment possible without completing this sprint.

| ID | Task | Effort | Priority | Dependency | Assignee |
|----|------|--------|----------|------------|----------|
| S4-01 | **QS-014: Prisma Client Extension for auto tenantId + deletedAt** | 8h | P0 | None | Claude Code |
| S4-02 | Fix RolesGuard gaps on all financial controllers (Accounting 6, Credit 5, Contracts 6, Factoring 3, Agents 3) | 4h | P0 | None | Claude Code |
| S4-03 | Fix RolesGuard gaps on data-modifying controllers (Config 8, Audit 8, Load Board 6, HR 6, Scheduler 5, Safety 5) | 6h | P0 | None | Codex/Gemini |
| S4-04 | Fix RolesGuard gaps on remaining controllers (Help Desk 5, Feedback 5, Cache 4, EDI 4, Search 2, Workflow 3, Claims 1) | 4h | P1 | None | Codex/Gemini |
| S4-05 | Fix JWT secret inconsistency in Customer Portal (PORTAL_JWT_SECRET vs CUSTOMER_PORTAL_JWT_SECRET) | 30min | P0 | None | Any |
| S4-06 | Fix Carrier Portal login tenant isolation (add tenantId to login query) | 30min | P0 | None | Any |
| S4-07 | Fix plaintext credential storage — Factoring apiKey (@Exclude or select clause) | 1h | P0 | None | Any |
| S4-08 | Fix plaintext credential storage — Rate Intelligence (encrypt apiKey, apiSecret, password) | 2h | P0 | S4-09 | Claude Code |
| S4-09 | Fix Integration Hub EncryptionService hardcoded fallback key (fail-fast in production) | 1h | P0 | None | Any |
| S4-10 | Fix plaintext credential storage — EDI ftpPassword (encrypt + @Exclude on response) | 1h | P0 | S4-09 | Any |
| S4-11 | Fix ES queries to include tenantId filtering in Search service | 2h | P0 | None | Claude Code |
| S4-12 | Fix Cache 8/20 endpoints missing tenantId | 2h | P0 | None | Claude Code |
| S4-13 | Fix Operations LoadHistory 2 tenant bugs (getByCarrier + getSimilarLoads) | 1h | P0 | None | Any |
| S4-14 | Fix CRM tenant isolation in mutations (4 services) | 2h | P0 | S4-01 | Claude Code |
| S4-15 | Fix Accounting 4 cross-tenant bugs in PaymentReceived | 2h | P0 | S4-01 | Claude Code |
| S4-16 | Fix Sales tenant isolation in mutations (Quotes, RateContracts, AccessorialRates) | 2h | P0 | S4-01 | Claude Code |
| S4-17 | Fix Contracts FuelSurchargeTier missing tenantId (migration + backfill) | 1h | P0 | None | Claude Code |
| S4-18 | Fix Agents rankings tenant leak | 30min | P0 | S4-01 | Any |
| S4-19 | Fix Search deleteSynonym cross-tenant bug | 30min | P0 | S4-01 | Any |
| S4-20 | Fix Super Admin deleted admin auth (add deletedAt filter) | 15min | P0 | S4-01 | Any |
| S4-21 | Fix localStorage token storage — migrate to HttpOnly cookies | 4h | P0 | None | Claude Code |
| S4-22 | Fix CORS env variable (QS-007) | 30min | P1 | None | Any |
| S4-23 | Add CSP headers to Next.js config | 2h | P1 | None | Any |
| S4-24 | Add @nestjs/throttler rate limiting (auth: 5/min, API: 100/min) | 2h | P1 | None | Claude Code |
| S4-25 | Fix webhook auth — Communication SMS (@Public + Twilio signature validation) | 2h | P1 | None | Claude Code |
| S4-26 | Fix webhook auth — CRM HubSpot (disable or authenticate) | 1h | P1 | None | Any |
| S4-27 | Fix Storage path traversal vulnerability (path.resolve + startsWith check) | 1h | P2 | None | Any |
| S4-28 | Fix Redis KEYS command — replace with SCAN iterator in 4 methods | 2h | P2 | None | Claude Code |
| S4-29 | Verify CSRF protection (SameSite cookie attribute) | 30min | P2 | None | Any |
| S4-30 | Add gitleaks pre-commit hook | 1h | P2 | None | Any |

**Sprint S4 Total: ~55-65 hours**

### Sprint S5: Table-Stakes Features (3-4 weeks, ~60-80 hours)

**Goal:** Build the features that any TMS customer expects on day one. Without these, the product cannot be sold.

| ID | Task | Effort | Priority | Dependency | Assignee |
|----|------|--------|----------|------------|----------|
| S5-01 | **QS-012: Rate Confirmation PDF Generation** | 8h | P0 | None | Claude Code |
| S5-02 | **QS-013: BOL PDF Generation** | 6h | P0 | S5-01 (shared PDF engine) | Claude Code |
| S5-03 | **QS-011: Customer Portal — Basic 4-Page MVP** (login, dashboard, shipment list, shipment detail) | 16h | P0 | S4-05 (JWT fix) | Claude Code |
| S5-04 | Wire commission auto-calculation trigger (event listener on load delivery) | 4h | P1 | None | Claude Code |
| S5-05 | Wire `enforceMinimumMargin()` into quote create/update flow | 2h | P0 | None | Any |
| S5-06 | Create quote expiry cron job (check validUntil, mark EXPIRED) | 1h | P0 | None | Any |
| S5-07 | Fix document upload architecture (add FileInterceptor or S3-first flow) | 3h | P0 | None | Claude Code |
| S5-08 | Wire Orders delete handler (currently no-op toast) | 2h | P1 | None | Any |
| S5-09 | Build Invoice Edit page (`/accounting/invoices/[id]/edit`) | 3h | P1 | None | Any |
| S5-10 | Build public tracking endpoint `GET /portal/track/:code` for Customer Portal | 4h | P0 | None | Claude Code |
| S5-11 | Wrap Commission createPayout/processPayout in $transaction | 1h | P1 | None | Any |
| S5-12 | Connect notification bell to backend unread-count API | 1h | P1 | None | Any |
| S5-13 | Implement Load tender/accept/reject endpoints (carrier workflow) | 6h | P1 | None | Claude Code |
| S5-14 | Carrier Portal soft-delete filtering (5/7 services) | 3h | P0 | S4-01 (may be auto-fixed) | Any |

**Sprint S5 Total: ~60-70 hours**

### Sprint S6: Testing & Verification (2-3 weeks, ~50-60 hours)

**Goal:** Establish test coverage for the highest-risk areas. Financial calculations and tenant isolation are SEV-1 incidents if wrong.

| ID | Task | Effort | Priority | Dependency | Assignee |
|----|------|--------|----------|------------|----------|
| S6-01 | **QS-015: Financial Calculation Tests** (10 tests: invoice totals, commission calc, settlement amounts, payment application, aging buckets, credit limits, factoring advances, fuel surcharge, batch processing, rounding) | 8h | P0 | None | Claude Code |
| S6-02 | **QS-016: Tenant Isolation Tests** (5 tests: CRUD isolation, search isolation, portal isolation, cache isolation, cross-service isolation) | 6h | P0 | S4-01 | Claude Code |
| S6-03 | **QS-008: Runtime Route Verification** (Playwright scan of all 98 routes) | 8h | P0 | None | Claude Code |
| S6-04 | RolesGuard integration tests — confirm 403 on unauthorized access for all financial controllers | 4h | P0 | S4-02 | Claude Code |
| S6-05 | Add unit tests for Operations DashboardService (594 LOC, complex aggregation) | 4h | P1 | None | Any |
| S6-06 | Add frontend accounting tests (0 tests for 5,244 LOC) | 6h | P2 | None | Codex/Gemini |
| S6-07 | Add portal auth integration tests (Customer Portal + Carrier Portal JWT flows) | 4h | P1 | S4-05, S4-06 | Claude Code |
| S6-08 | Add soft-delete verification tests (confirm deleted records excluded from all queries) | 3h | P1 | S4-01 | Any |
| S6-09 | Webhook integration tests (Twilio signature, HubSpot signature) | 2h | P2 | S4-25, S4-26 | Any |

**Sprint S6 Total: ~45-55 hours**

### Sprint S7: DevOps & Production (2-3 weeks, ~40-50 hours)

**Goal:** Everything needed to run in production with confidence.

| ID | Task | Effort | Priority | Dependency | Assignee |
|----|------|--------|----------|------------|----------|
| S7-01 | Production environment setup (AWS/GCP, managed PostgreSQL, managed Redis, managed ES) | 8h | P0 | None | DevOps |
| S7-02 | CI/CD pipeline (build, test, lint, deploy to staging/production) | 6h | P0 | None | DevOps |
| S7-03 | Monitoring & alerting (error tracking, uptime, performance baselines) | 4h | P0 | S7-01 | DevOps |
| S7-04 | Deployment runbook validation (pre-deploy, deploy, rollback procedures) | 2h | P0 | S7-02 | DevOps |
| S7-05 | Database backup & recovery (automated daily, tested restore) | 3h | P0 | S7-01 | DevOps |
| S7-06 | Secret management (env vars in vault, no hardcoded secrets) | 3h | P0 | S7-01 | DevOps |
| S7-07 | SSL/TLS configuration + domain setup | 2h | P0 | S7-01 | DevOps |
| S7-08 | Load testing (baseline performance under expected concurrency) | 4h | P1 | S7-01 | Claude Code |
| S7-09 | Security audit (penetration test or automated scan) | 4h | P1 | S4 complete | External |
| S7-10 | Delete .bak directories (QS-009) — ~57K LOC of dead code | 30min | P2 | None | Any |
| S7-11 | Triage 339 TODOs (QS-010) | 3h | P2 | S6-03 | Codex/Gemini |
| S7-12 | JWT secret rotation runbook | 1h | P2 | S7-06 | DevOps |
| S7-13 | Account lockout after N failed login attempts | 2h | P2 | S4-24 | Any |

**Sprint S7 Total: ~42-50 hours**

---

## Parallelization Map

```
Week 1-2 (Sprint S4 start):
  Developer A: S4-01 (QS-014, 8h) --> S4-14, S4-15, S4-16 (tenant fixes)
  Developer B: S4-02, S4-03 (RolesGuard, 10h) --> S4-05, S4-06, S4-07 (quick fixes)

Week 2-3 (Sprint S4 middle):
  Developer A: S4-11, S4-12 (ES + Cache tenant, 4h) --> S4-21 (localStorage, 4h)
  Developer B: S4-04 (RolesGuard remaining) --> S4-08, S4-09, S4-10 (credential encryption)

Week 3-4 (Sprint S4 end):
  Developer A: S4-24 (rate limiting) --> S4-25, S4-26 (webhook auth)
  Developer B: S4-22, S4-23, S4-27, S4-28, S4-29, S4-30 (P1/P2 security)

Week 5-8 (Sprint S5):
  Developer A: S5-01 (Rate Con PDF) --> S5-02 (BOL PDF) --> S5-03 (Customer Portal MVP)
  Developer B: S5-05, S5-06, S5-07, S5-08, S5-09, S5-10, S5-11, S5-12 (quick features)

Week 9-11 (Sprint S6):
  Developer A: S6-01, S6-02 (financial + tenant tests) --> S6-04 (RolesGuard tests)
  Developer B: S6-03 (Playwright 98 routes) --> S6-05, S6-06 (unit tests)
  Both: S6-07, S6-08, S6-09 (remaining tests)

Week 12-14 (Sprint S7):
  DevOps: S7-01 through S7-07 (infrastructure)
  Developer A: S7-08 (load testing)
  Developer B: S7-10, S7-11, S7-13 (cleanup)
```

---

## Dependency Graph

```
S4-01 (QS-014: Prisma Extension)
  |
  +---> S4-14 (CRM tenant fix)
  +---> S4-15 (Accounting tenant fix)
  +---> S4-16 (Sales tenant fix)
  +---> S4-17 (Contracts tenantId migration)
  +---> S4-18 (Agents rankings fix)
  +---> S4-19 (Search synonym fix)
  +---> S4-20 (Super Admin auth fix)
  +---> S5-14 (Carrier Portal soft-delete)
  +---> S6-02 (QS-016: Tenant isolation tests)
  +---> S6-08 (Soft-delete verification tests)

S4-05 (Customer Portal JWT fix)
  |
  +---> S5-03 (Customer Portal 4-page MVP)
  +---> S6-07 (Portal auth tests)

S4-09 (Integration Hub encryption fix)
  |
  +---> S4-08 (Rate Intelligence encryption)
  +---> S4-10 (EDI encryption)

S5-01 (QS-012: Rate Con PDF)
  |
  +---> S5-02 (QS-013: BOL PDF — shared engine)

S4-02 (Financial RolesGuard)
  |
  +---> S6-04 (RolesGuard integration tests)

S4-25 + S4-26 (Webhook auth)
  |
  +---> S6-09 (Webhook integration tests)

S6-03 (QS-008: Runtime verification)
  |
  +---> S7-11 (QS-010: Triage TODOs)

S7-01 (Production environment)
  |
  +---> S7-02 (CI/CD)
  +---> S7-03 (Monitoring)
  +---> S7-05 (Backups)
  +---> S7-06 (Secrets)
  +---> S7-07 (SSL)
  +---> S7-08 (Load testing)

ALL S4 tasks
  |
  +---> S7-09 (Security audit — only meaningful after fixes applied)
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| QS-014 is harder than estimated | Delays all tenant fixes (S4-14 through S4-20) | Manual fixes as fallback (already scoped in PST action items) |
| EncryptionService refactor breaks existing integrations | Breaks Rate Intelligence, EDI, Factoring | Test with existing provider configs before deploying |
| Playwright route scan finds many broken routes | Scope creep in S6 | Cap fixes at 2 hours per route; defer cosmetic issues |
| Production environment setup takes longer | Delays launch | Start S7-01 in parallel with S6 (no dependency) |
| Financial tests reveal calculation bugs | Additional remediation work | Budget 1 extra week for financial bug fixes |

---

## Success Criteria

Sprint S4 is complete when:
- [ ] Zero STOP-SHIP items remain in SECURITY-REMEDIATION.md
- [ ] All financial controllers have RolesGuard
- [ ] All credentials encrypted at rest
- [ ] QS-014 Prisma Extension deployed and auto-injecting tenantId

Sprint S5 is complete when:
- [ ] Rate Confirmation PDF generates from load data
- [ ] BOL PDF generates from load data
- [ ] Customer Portal login + dashboard + shipment list + detail working
- [ ] All dead-code business logic wired (margin enforcement, quote expiry)

Sprint S6 is complete when:
- [ ] 10 financial calculation tests passing
- [ ] 5 tenant isolation tests passing
- [ ] All 98 routes verified via Playwright
- [ ] RolesGuard 403 tests for financial controllers

Sprint S7 is complete when:
- [ ] Production environment provisioned and accessible
- [ ] CI/CD deploying to staging successfully
- [ ] Monitoring alerting on errors and uptime
- [ ] Deployment runbook tested (deploy + rollback)
- [ ] Database backups automated and restore tested
