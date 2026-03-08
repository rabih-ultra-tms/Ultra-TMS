# TRIBUNAL-05: Multi-Tenant Architecture

> **Filed:** 2026-03-07
> **Subject:** Row-level tenantId filtering with application-level enforcement
> **Evidence:** `03-multi-tenant-patterns.md`, `security-findings.md`, ADR-012, schema.prisma

---

## Charge

Ultra TMS uses application-level tenantId filtering across 260 Prisma models with no database-level enforcement. Every Prisma query must manually include `WHERE tenantId = ? AND deletedAt IS NULL`. There are no Prisma middleware extensions, no PostgreSQL Row-Level Security policies, and no automated injection of tenant filters. With 801 tenantId references in the schema, 40 backend modules, and 8.7% frontend test coverage, the question is simple: is this one missed WHERE clause away from a cross-tenant data breach?

---

## Prosecution (The Case Against -- "Ticking Time Bomb")

### Argument 1: 801 Points of Failure, Zero Safety Net

The schema contains 801 tenantId references across 260 models. Every single service method that touches the database must manually include `tenantId` in its WHERE clause. There is no Prisma middleware, no Prisma Client Extension, and no PostgreSQL RLS policy to catch omissions. This is not defense-in-depth. This is defense-in-hope. One developer, one AI agent, one rushed code review, and tenant data leaks silently. The database will happily return another tenant's invoices, loads, or settlements without complaint.

### Argument 2: The Global Guard Was Missing Until March 6

SEC-P0-003 is the most damning piece of evidence in this case. Until March 6, 2026, the `JwtAuthGuard` was not applied globally. Every endpoint in the entire API was effectively public. Any unauthenticated request could have hit any controller, and since tenantId extraction depends on JWT payload via the `TenantInterceptor`, requests without a JWT had no tenant context at all. The guard is now applied, but the fact that it was missing for months demonstrates exactly the kind of "discipline failure" that makes application-level-only enforcement dangerous. If the global guard can be forgotten, so can a WHERE clause.

### Argument 3: 8.7% Test Coverage Means No Systematic Verification

There are 72 tests across 13 suites. Zero of those tests systematically verify tenant isolation -- that is, no test creates data for Tenant A, authenticates as Tenant B, and asserts that Tenant B cannot see Tenant A's data. Without tenant isolation tests, the only guarantee is "we looked at the code and it seems right." At 40 modules and ~225 NestJS services, manual code review does not scale. The recurring-patterns.md anti-pattern list tracks 10 patterns but does not include "missing tenantId filter" as a tracked issue, suggesting it is not even on the radar as a systematic risk.

### Argument 4: Real-World Precedent -- This Exact Pattern Causes Breaches

Adobe Analytics (September 2025): a caching optimization that was tenant-unaware caused cross-tenant data visibility for two days. The root cause was identical to Ultra TMS's risk profile -- application-level filtering with no database-level fallback. When the caching layer served a query result to the wrong tenant, the database had no opinion about it. Microsoft Azure (2019): infrastructure misconfiguration bypassed application-level tenant boundaries. AWS AppSync: insufficient tenant boundary enforcement in the API layer. Every post-incident report reaches the same conclusion -- single-layer tenant isolation is insufficient for production SaaS.

### Argument 5: Soft Delete Compounds the Risk

248 of 260 models use soft delete (`deletedAt`). Every query must include both `tenantId` AND `deletedAt IS NULL`. That is two manual filters per query, both of which are silently ignored if omitted. The 12 models without `deletedAt` (characterized as "log/audit tables") could leak data about deleted entities if queried without tenant filtering. Furthermore, with FMCSA's 7-year retention requirement, soft-deleted rows accumulate indefinitely. No archival strategy exists. No partial indexes exist. Tables like `loads`, `check_calls`, and `audit_logs` will grow to millions of rows where the majority are soft-deleted, degrading query performance and inflating index sizes by up to 5x.

---

## Defense (The Case For -- "Correct for Scale")

### Argument 1: Row-Level tenantId Is the Industry Standard

ADR-012 correctly chose row-level tenantId for a platform targeting fewer than 1,000 tenants. Schema-per-tenant would require migrating 260 models x N tenants on every schema change -- a maintenance nightmare. DB-per-tenant causes connection pool explosion at 50+ tenants. PostgreSQL RLS adds query planner overhead, debugging opacity, and has its own CVE history (CVE-2024-10976, CVE-2025-8713). The current approach is the same pattern used by the majority of multi-tenant SaaS platforms at this scale, including those built on Prisma, Django, and Rails.

### Argument 2: The Architecture Enforces tenantId by Design

The `JwtAuthGuard` (now globally applied) extracts tenantId from the JWT on every authenticated request. The `TenantInterceptor` injects it into the NestJS request context. Services receive tenantId from the controller -- it is not optional, and it is not derived from user input. This means a developer cannot accidentally use a tenantId from a URL parameter or request body (the BOLA/IDOR pattern that is OWASP's #1 API vulnerability). The 801 tenantId references in the schema confirm comprehensive model coverage -- every entity that should be tenant-scoped is tenant-scoped.

### Argument 3: RLS Introduces Its Own Risks

PostgreSQL RLS is not a silver bullet. Non-LEAKPROOF functions in RLS policies disable index usage, potentially causing full table scans on tables with millions of rows. Prisma has an open issue (#12735, since 2022) for first-class RLS support -- workarounds exist but are not battle-tested. RLS debugging is opaque: queries silently return empty result sets instead of errors when the tenant context is wrong, making issues harder to diagnose than a missing WHERE clause. The CVE history of RLS itself (optimizer statistics leaking sampled data from protected rows) shows that database-level enforcement is not infallible either.

### Argument 4: The 12 Models Without deletedAt Are Correct

Audit logs, change history records, and system event tables should not have soft delete. Deleting an audit record defeats its purpose. These 12 models are semantically correct without `deletedAt`. They still have `tenantId` and are still filtered by tenant -- they simply do not support deletion, which is the right design for immutable records.

---

## Cross-Examination

1. **How many services use automatic tenantId injection vs. manual WHERE clauses?** Zero use automatic injection. Every service method manually adds `tenantId` to its Prisma queries. ADR-012 explicitly notes "Add Prisma middleware for automatic tenantId injection when scale demands it" -- acknowledging the gap without closing it.

2. **Are there any controllers that bypass the JwtAuthGuard?** Yes. Endpoints decorated with `@Public()` bypass the guard: login, register, forgot-password, reset-password. The health endpoint was also public until SEC-P0-001 was fixed on March 6. Any future developer adding `@Public()` to an endpoint must understand that it also removes tenant context.

3. **What happens if a developer forgets tenantId on a new model?** Nothing prevents it. There is no schema linter, no CI check, and no Prisma generator plugin that validates tenantId presence. Five models needed QS-002 fixes for missing soft delete fields -- the same gap could exist for tenantId and would not be caught until a security audit or, worse, a data leak.

4. **What is the SUPER_ADMIN bypass surface?** SUPER_ADMIN role bypasses tenant filtering for cross-tenant operations. If any code path erroneously grants SUPER_ADMIN context to a regular user request, all tenant isolation is voided. How is this tested?

---

## Evidence Exhibits

| Exhibit | Source | Key Finding |
|---------|--------|-------------|
| EX-01 | `schema.prisma` | 801 tenantId refs, 260 models, 248 with deletedAt |
| EX-02 | `security-findings.md` SEC-P0-003 | Global JwtAuthGuard was missing until Mar 6 |
| EX-03 | ADR-012 | RLS rejected; Prisma middleware noted as "future" |
| EX-04 | `03-multi-tenant-patterns.md` | Adobe Analytics 2025, Azure 2019, AWS AppSync -- all app-level-only failures |
| EX-05 | `recurring-patterns.md` | 10 anti-patterns tracked; "missing tenantId" not among them |
| EX-06 | Test suite (72 tests) | Zero tenant isolation tests exist |
| EX-07 | Prisma GitHub #12735 | RLS support open since 2022, no first-class solution |
| EX-08 | CVE-2024-10976, CVE-2025-8713 | RLS engine-level vulnerabilities |

---

## Verdict: MODIFY

The architectural decision (row-level tenantId) is correct. The implementation (manual WHERE clauses with no automation and no safety net) is not production-ready. This is not a "rip and replace" situation -- it is a hardening exercise.

**Keep:** Row-level tenantId, JwtAuthGuard + TenantInterceptor, soft delete pattern.

**Add:** Three layers of automated enforcement to eliminate human error as the sole line of defense.

---

## Action Items

| # | Action | Priority | Effort | Rationale |
|---|--------|----------|--------|-----------|
| 1 | **Prisma Client Extension** -- automatic tenantId + deletedAt injection on all standard queries | P0 | 4-8 hours | Transforms isolation from "every developer remembers" to "system enforces by default." Single highest-impact change. ADR-012 already acknowledges this as needed. |
| 2 | **CI lint rule** -- static analysis check that every Prisma query uses the tenant-scoped client, not raw `prisma.*` | P0 | 2-4 hours | Catches regressions at CI time. Flags any direct Prisma access that bypasses the extension. |
| 3 | **Tenant isolation test suite** -- create data as Tenant A, query as Tenant B, assert zero results. Cover top 10 entities (loads, orders, carriers, customers, invoices, settlements, users, contacts, documents, payments). | P1 | 8-12 hours | Automated verification that isolation actually works. Currently zero tests validate this. |
| 4 | **Audit all `$queryRaw` and `$executeRaw` calls** for tenantId inclusion | P1 | 2 hours | Raw queries bypass Client Extensions. Must be manually verified and documented. |
| 5 | **Add "missing tenantId filter" to recurring-patterns.md** as tracked anti-pattern #11 | P1 | 30 min | Makes the risk visible in the anti-pattern checklist that developers and AI agents reference. |
| 6 | **RLS on 10 most sensitive tables** (users, loads, invoices, settlements, payments, carriers, customers, orders, contacts, documents) as safety net | P2 | 8-16 hours | Defense-in-depth. Not primary enforcement -- catches what the application misses. Evaluate after Prisma Client Extension is in place. |
| 7 | **Partial indexes** on high-traffic tables for `(tenantId) WHERE deletedAt IS NULL` | P2 | 4-8 hours | Performance hardening. Prevents index bloat from soft-deleted rows accumulating over 7 years. |
| 8 | **Archival strategy** for soft-deleted records older than 1 year | P3 | 1-2 weeks | Prevents table bloat from FMCSA 7-year retention. Move old soft-deleted rows to archive tables or time-based partitions. |

**Total hardening effort (P0+P1):** 16-26 hours across items 1-5.
**Total including P2 safety net:** 28-50 hours.

The current system works correctly if every developer writes perfect code every time. That is not a security posture -- that is a prayer. The Prisma Client Extension alone (item 1) reduces the attack surface from 801 manual filter points to a single, centralized enforcement mechanism. That is the minimum acceptable standard before production.
