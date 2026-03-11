# RolesGuard Coverage Matrix

> **Last Updated:** 2026-03-11
> **Purpose:** Track authorization guard coverage across all backend controllers
> **Source:** Per-Service Tribunal verdicts (PST-01 through PST-38)
> **Companion:** [SECURITY-REMEDIATION.md](SECURITY-REMEDIATION.md)

---

## Summary

- **Total services with controllers:** 32 (6 infra modules have 0-1 controllers)
- **Services with 100% RolesGuard coverage:** 16 (Commission, Customer Portal, Documents, Analytics, Operations, Accounting, Contracts, Credit, Factoring, Agents — MP-01-002; **Config, Audit, Load Board, HR, Scheduler, Safety** — MP-01-003)
- **Services with 0% RolesGuard coverage:** 4 (Help Desk, Feedback, Cache — MP-01-004 scope; Claims Reports — 1 controller)
- **Financial controllers without guards:** ~~17~~ **0** — ALL fixed 2026-03-11 (MP-01-002)
- **Data-modifying controllers without guards:** **0** — ALL fixed 2026-03-11 (MP-01-003: 38 controllers across 6 services)
- **Total controllers without RolesGuard:** ~20 controllers across 7 services (was ~58 across 18)

> **NOTE (2026-03-11):** RolesGuard is registered globally via `APP_GUARD` in `app.module.ts`. The `@Roles()` decorator was always enforced — the gap was that `RolesGuard` was not explicitly listed in local `@UseGuards()`, making intent unclear. All financial controllers now explicitly include `@UseGuards(JwtAuthGuard, RolesGuard)` for consistency and clarity.

---

## Matrix

Sorted by risk level (financial-first), then by gap percentage descending.

### TIER 1: Financial Controllers — **FIXED** (2026-03-11, MP-01-002)

| # | Service | Tier | Total Controllers | With RolesGuard | Without | Gap % | Risk Level | Notes |
|---|---------|------|-------------------|-----------------|---------|-------|------------|-------|
| 07 | Accounting | P0-MVP | 10 | **10** | **0** | **0%** | **RESOLVED** | All 10 controllers now have explicit `@UseGuards(JwtAuthGuard, RolesGuard)` |
| 15 | Contracts | P2 | 8 | **8** | **0** | **0%** | **RESOLVED** | All 8 controllers now have explicit guards |
| 17 | Credit | P2 | 5 | **5** | **0** | **0%** | **RESOLVED** | All 5 controllers now have explicit guards |
| 18 | Factoring | P2 | 5 | **5** | **0** | **0%** | **RESOLVED** | All 5 controllers now have explicit guards |
| 16 | Agents | P2 | 6 | **6** | **0** | **0%** | **RESOLVED** | All 6 controllers now have explicit guards |

**Financial subtotal: 34 controllers, 34 covered, 0 missing (0% gap)**

### TIER 2: Data-Modifying Controllers — **FIXED** (2026-03-11, MP-01-003)

| # | Service | Tier | Total Controllers | With RolesGuard | Without | Gap % | Risk Level | Notes |
|---|---------|------|-------------------|-----------------|---------|-------|------------|-------|
| 31 | Config | P3 | 9 | 1 | **8** | **89%** | **HIGH** | Only TenantServicesController has guard. SystemConfig writable by any auth user (SECURITY category settings!) |
| 30 | Audit | P3 | 8 | 0 | **8** | **100%** | **HIGH** | All @Roles decorative. Audit logs modifiable by any auth user — defeats purpose of audit trail |
| 09 | Load Board | P0-MVP | 9 | 3 | **6** | **67%** | **HIGH** | AccountsController (6 ep, ADMIN-only) + RulesController (5 ep, ADMIN/DISPATCHER) are highest risk |
| 23 | HR | P3 | 6 | 0 | **6** | **100%** | **HIGH** | All @Roles decorative. Employee PII, PTO balances, payroll data exposed |
| 24 | Scheduler | P3 | 5 | 0 | **5** | **100%** | **HIGH** | Task scheduling modifiable by any user |
| 25 | Safety | P3 | 9 | 4 | **5** | **56%** | **HIGH** | 5 controllers missing — inspection, incident, compliance endpoints |
| 26 | EDI | P3 | 8 | 4 | **4** | **50%** | **HIGH** | 4 controllers with decorative @Roles |
| 22 | Search | P2 | 4 | 2 | **2** | **50%** | **HIGH** | SearchSuggestionsController + SearchSynonymsController |
| 20 | Workflow | P2 | 5 | 2 | **3** | **60%** | **MEDIUM** | @Roles decorative on 3 controllers |

### TIER 3: Lower-Risk Controllers (Fix Third)

| # | Service | Tier | Total Controllers | With RolesGuard | Without | Gap % | Risk Level | Notes |
|---|---------|------|-------------------|-----------------|---------|-------|------------|-------|
| 27 | Help Desk | P3 | 5 | 0 | **5** | **100%** | **MEDIUM** | All @Roles decorative. Ticket data, KB articles |
| 28 | Feedback | P3 | 5 | 0 | **5** | **100%** | **MEDIUM** | No @Roles at all. Survey + voting endpoints fully open |
| 32 | Cache | P3 | 4 | 0 | **4** | **100%** | **MEDIUM** | No @Roles at all. Should be SUPER_ADMIN only |
| 10 | Claims | P2 | ~8 | ~7 | **1** | **13%** | **LOW** | Only Reports controller missing guard |

### TIER 4: 100% Coverage (No Action Needed)

| # | Service | Tier | Total Controllers | With RolesGuard | Gap % | Notes |
|---|---------|------|-------------------|-----------------|-------|-------|
| 08 | Commission | P0-MVP | 4+ | All | **0%** | 100% on all 31 endpoints — CLEANEST P0 service |
| 13 | Customer Portal | P0-MVP | 5+ | All | **0%** | CompanyScopeGuard + RolesGuard on all endpoints |
| 11 | Documents | P1 | 3 | All | **0%** | Custom DocumentAccessGuard + RolesGuard |
| 19 | Analytics | P2 | 6 | All | **0%** | First P2 with zero gaps |
| 38 | Operations | P-Infra | 7 | All | **0%** | 100% on all 61 endpoints — BEST non-infra service |

### Services Without Standard Controllers

| # | Service | Tier | Notes |
|---|---------|------|-------|
| 02 | Dashboard | P0-MVP | Uses Operations module controllers |
| 34 | Email | P-Infra | 0 controllers — service-only module |
| 35 | Storage | P-Infra | 0 controllers — service-only module |
| 36 | Redis | P-Infra | 0 controllers — service-only module |
| 37 | Health | P-Infra | @Public() endpoint — no auth needed |
| 33 | Super Admin | P-Infra | Not a standalone module — cross-cutting SUPER_ADMIN role on Auth |

### Services Not Fully Audited for RolesGuard

| # | Service | Tier | Notes |
|---|---------|------|-------|
| 01 | Auth & Admin | P0-MVP | Auth endpoints use @Public(), admin endpoints use RolesGuard — PST did not flag gaps |
| 03 | CRM | P0-MVP | PST focused on tenant isolation, not RolesGuard — assume partial coverage |
| 04 | Sales | P0-MVP | PST focused on tenant isolation — assume partial coverage |
| 05 | TMS Core | P0-MVP | PST did not flag RolesGuard gaps — assume covered |
| 06 | Carriers | P0-MVP | PST focused on dual-module issue — assume partial coverage |
| 12 | Communication | P1 | PST focused on webhook auth issue, not RolesGuard — assume covered |
| 14 | Carrier Portal | P1 | Uses CarrierPortalAuthGuard + CarrierScopeGuard (different guard system) |
| 21 | Integration Hub | P2 | 100% guards confirmed by PST-21 |
| 29 | Rate Intelligence | P3 | PST did not specify RolesGuard status — needs verification |

---

## Priority Remediation Order

### Phase 1: Financial Controllers (Week 1 — ~8 hours)

1. **Accounting** (6 controllers) — Estimated 1 hour
   - Add `RolesGuard` to `@UseGuards()` on: ChartOfAccountsController, SettlementsController, PaymentsReceivedController, PaymentsMadeController, JournalEntriesController, PaymentsBatchController
   - Assign roles: `@Roles('ADMIN', 'ACCOUNTING')` minimum

2. **Credit** (5 controllers) — Estimated 1 hour
   - Add `RolesGuard` to all 5 controllers
   - Assign roles: `@Roles('ADMIN', 'ACCOUNTING', 'CREDIT_MANAGER')` as appropriate

3. **Contracts** (6 controllers) — Estimated 1 hour
   - Add `RolesGuard` to 6 controllers
   - Consider: Amendments + SLAs may need ADMIN only

4. **Factoring** (3 controllers) — Estimated 30 minutes

5. **Agents** (3 controllers) — Estimated 30 minutes

### Phase 2: Data-Modifying Controllers (Week 2 — ~6 hours)

6. **Config** (8 controllers) — Estimated 1 hour
   - SystemConfigController MUST be `SUPER_ADMIN` only
   - FeatureFlags, EmailTemplates, Sequences = `ADMIN`

7. **Audit** (8 controllers) — Estimated 1 hour
   - All write operations = `ADMIN` only
   - Read operations may allow broader access

8. **Load Board** (6 controllers) — Estimated 1 hour
   - AccountsController = `ADMIN`
   - RulesController = `ADMIN`, `DISPATCHER`

9. **HR** (6 controllers), **Scheduler** (5 controllers), **Safety** (5 controllers) — Estimated 1.5 hours

10. **EDI** (4 controllers), **Search** (2 controllers), **Workflow** (3 controllers) — Estimated 1 hour

### Phase 3: Lower-Risk Controllers (Week 2-3 — ~3 hours)

11. **Help Desk** (5 controllers), **Feedback** (5 controllers), **Cache** (4 controllers) — Estimated 1.5 hours
    - Cache MUST be `SUPER_ADMIN` only
    - Help Desk may allow `AGENT` role for ticket operations

12. **Claims** (1 controller) — Estimated 15 minutes

### Phase 4: Verification (Week 3 — ~2 hours)

13. Verify all unaudited services (Auth, CRM, Sales, TMS Core, Carriers, Communication, Rate Intelligence)
14. Write integration tests confirming unauthorized access returns 403

---

## Verification Checklist

For each controller fix:

- [ ] `@UseGuards(JwtAuthGuard, RolesGuard)` present on controller class
- [ ] `@Roles(...)` decorator with appropriate roles on each endpoint (or class-level)
- [ ] No `@Public()` on endpoints that should be protected
- [ ] Existing tests still pass
- [ ] Manual test: call endpoint as unauthorized role, confirm 403

---

## Role Reference

| Role | Access Level | Financial? |
|------|-------------|------------|
| SUPER_ADMIN | All endpoints, all tenants (authorization only, data still tenant-scoped) | Yes |
| ADMIN | All endpoints within tenant | Yes |
| ACCOUNTING | Financial module endpoints | Yes |
| DISPATCHER | Load, carrier, and operational endpoints | No |
| AGENT | Sales, quotes, commission viewing | No |
| DRIVER | Limited read-only (assigned loads, check-in) | No |
