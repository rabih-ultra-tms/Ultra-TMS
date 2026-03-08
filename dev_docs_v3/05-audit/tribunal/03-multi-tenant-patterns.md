# Tribunal Research Brief 3: Multi-Tenant Architecture Patterns

> Generated: 2026-03-07
> Purpose: Feed TRIBUNAL-05 (Multi-Tenant Architecture) and TRIBUNAL-07 (Data Model)

---

## Ultra TMS Current Approach

Ultra TMS uses row-level tenant isolation with application-level filtering. The key facts from ADR-003, ADR-012, ADR-013, and the security audit:

- **801 `tenantId` references** in `schema.prisma` across 260 models
- **Application-level filtering only** -- every Prisma query must include `WHERE tenantId = ? AND deletedAt IS NULL`
- **No PostgreSQL RLS** -- rejected in ADR-012 citing "debugging opacity, query planner overhead, Prisma compatibility concerns"
- **Global `JwtAuthGuard`** extracts tenantId from JWT payload; `TenantInterceptor` injects it into the request context
- **248/260 models have `deletedAt`** (soft delete); the 12 without are log/audit tables
- **SUPER_ADMIN role bypasses tenant filtering** for cross-tenant operations
- **No Prisma middleware or client extensions** for automatic tenantId injection -- currently manual WHERE clauses in every service method
- **ADR-012 future note:** "Add Prisma middleware for automatic tenantId injection when scale demands it"

### Known Vulnerabilities (from security-findings.md)

- SEC-P1-001: localStorage token storage means XSS could steal the JWT containing the tenantId
- SEC-P2-003: CSRF protection unverified on cookies
- SEC-P3-003: Audit log coverage unverified for tenant-sensitive operations
- **No defense-in-depth:** If application code misses a WHERE clause, there is zero database-level fallback

---

## Multi-Tenant Isolation Patterns Compared

| Pattern | Description | Scale Fit | Isolation Level | Complexity | Cost | Migration Effort |
|---------|------------|-----------|----------------|------------|------|-----------------|
| **Row-Level (App)** | tenantId column, WHERE clause in every query at application layer | Any (with discipline) | Low -- one missed WHERE = data leak | Low | Low | N/A (current) |
| **Row-Level (RLS)** | PostgreSQL Row-Level Security policies enforce filtering at DB level | <5000 tenants | Medium -- DB enforces even if app forgets | Medium | Low | Medium (policy per table) |
| **Hybrid (App + RLS)** | App-level filtering as primary, RLS as safety net | <5000 tenants | High -- defense in depth | Medium-High | Low | Medium |
| **Schema-per-Tenant** | Separate PostgreSQL schema per tenant, shared DB instance | 10-500 tenants | High -- physical separation within DB | High | Medium | Very High (260 models x N) |
| **DB-per-Tenant** | Separate database per tenant | <50 tenants | Highest -- complete physical isolation | Highest | High | Extreme |
| **Partitioned Tables** | Native PostgreSQL partitioning by tenantId | >1000 tenants, large data | Medium-High -- partition pruning | Medium | Low | High (schema restructure) |

**Sources:**
- [Multi-Tenant Architecture Complete Guide - Bix Tech](https://bix-tech.com/multi-tenant-architecture-the-complete-guide-for-modern-saas-and-analytics-platforms-2/)
- [WorkOS Developer's Guide to Multi-Tenant Architecture](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture)
- [Debugg.ai: RLS vs Schemas vs Separate DBs](https://debugg.ai/resources/postgres-multitenancy-rls-vs-schemas-vs-separate-dbs-performance-isolation-migration-playbook-2025)
- [AWS Multi-Tenant Data Isolation with RLS](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/)

---

## When Each Pattern Breaks

### Row-Level (Application-Level) -- Ultra TMS's Pattern

**Breaks when:**
- A single service method omits the `tenantId` filter -- instant cross-tenant data leak
- A developer writes a raw SQL query or uses `prisma.$queryRaw` without tenant filtering
- A new model is added without tenantId (happened: 5 models needed QS-002 fix)
- Complex queries with subqueries, aggregations, or joins accidentally drop the tenant filter
- SUPER_ADMIN code path leaks into non-admin contexts due to conditional logic bugs

**Scale limit:** Not a scale problem per se -- it is a **discipline problem**. At 260 models and 801 tenantId references, the surface area for a missed filter is enormous. Every new endpoint, every new query, every new developer is another chance for a leak.

### Row-Level Security (PostgreSQL RLS)

**Breaks when:**
- RLS policies use non-LEAKPROOF functions, preventing index usage and causing exponential query degradation ([Scott Pierce: Optimizing RLS](https://scottpierce.dev/posts/optimizing-postgres-rls/))
- Subqueries within RLS policies chain to other RLS policies, compounding overhead
- CVE-2024-10976: Row security policies below subqueries could disregard user ID changes
- CVE-2025-8713: Optimizer statistics could leak sampled data from RLS-protected rows
- ORM tools (including Prisma) issue queries that bypass or interact poorly with RLS policies
- Debugging becomes opaque -- queries silently return empty results instead of errors when tenant context is wrong

### Schema-per-Tenant

**Breaks when:**
- Tenant count exceeds ~500: PostgreSQL catalog bloat from thousands of schema objects degrades `pg_catalog` lookups
- Migration complexity explodes: 260 models x N tenants means every schema migration must run N times
- Connection pooling becomes complex: each schema needs its own search_path configuration
- Per-tenant customization creates schema drift that is hard to reconcile

**Real example:** Companies using Django with schema-per-tenant (django-tenants) report migration times growing from seconds to hours as tenant count increases.

### DB-per-Tenant

**Breaks when:**
- Connection pool explosion: each database needs its own connection pool; at 50+ tenants, this exhausts server resources
- Operational overhead per tenant: backups, monitoring, upgrades multiply by N
- Cross-tenant reporting becomes a federation problem requiring external tooling

---

## Application-Level vs RLS Filtering

### Pros of Application-Level (Ultra TMS's Current Approach)

1. **Simplicity:** No database-level configuration; all logic is in application code
2. **Full ORM compatibility:** Prisma works without any workarounds or raw SQL
3. **Debuggability:** Every query is visible in code; you can grep for missing `tenantId` filters
4. **No query planner impact:** PostgreSQL sees normal WHERE clauses, uses indexes normally
5. **Flexible super-admin bypass:** SUPER_ADMIN can simply omit the tenantId filter in code
6. **Auditable:** Static analysis can scan for queries missing tenantId (e.g., custom ESLint/grep rules)
7. **Zero database migration required:** No RLS policies, no functions, no session variables to manage

### Cons of Application-Level (Risks)

1. **One missed WHERE clause = data leak:** The fundamental flaw. With 260 models and growing, the attack surface is vast. There is no safety net at the database level.
2. **No defense-in-depth:** If application-layer auth is compromised (XSS stealing JWT, as in SEC-P1-001), the database has zero independent isolation.
3. **Developer discipline dependency:** Every developer, every code review, every AI agent must remember to add tenantId to every query. Human (and AI) error is inevitable.
4. **Raw queries are unprotected:** Any `prisma.$queryRaw` or `prisma.$executeRaw` call has no automatic tenantId injection.
5. **Complex queries are risky:** Aggregations, CTEs, subqueries, and window functions can easily lose the tenant filter.
6. **No enforcement on database admin tools:** Anyone with direct DB access (psql, Prisma Studio, pgAdmin) sees all tenant data.
7. **Scales linearly with codebase:** More endpoints = more places to forget. Ultra TMS has 40 modules; each one is a potential leak point.

### Pros of PostgreSQL RLS

1. **Database-level enforcement:** Even if application code forgets the filter, the database blocks cross-tenant access
2. **Defense-in-depth:** Works independently of application-layer bugs, XSS exploits, or JWT theft
3. **Protects raw queries:** `$queryRaw` calls are still filtered by RLS policies
4. **Protects admin tools:** Direct psql access respects RLS policies (unless superuser)
5. **Compliance-friendly:** Auditors prefer database-level controls over application-level promises
6. **Single point of policy:** Tenant isolation is defined once per table, not scattered across hundreds of service methods

### Cons of PostgreSQL RLS

1. **Query planner overhead:** RLS adds predicate injection at the planner level; poorly written policies cause catastrophic performance ([Bytebase RLS Limitations](https://www.bytebase.com/blog/postgres-row-level-security-limitations-and-alternatives/))
2. **Non-LEAKPROOF function trap:** If a policy calls a function not marked LEAKPROOF, PostgreSQL disables index usage on that query, potentially scanning entire tables ([Scott Pierce: Optimizing RLS](https://scottpierce.dev/posts/optimizing-postgres-rls/))
3. **Debugging opacity:** Queries silently return zero rows instead of failing when tenant context is wrong -- hard to diagnose
4. **Prisma compatibility:** Prisma has an open issue (#12735) for RLS support since 2022; workarounds exist via client extensions but are not first-class ([Prisma RLS Issue](https://github.com/prisma/prisma/issues/12735))
5. **Session variable management:** Each request must `SET` a session variable before querying -- requires connection-aware middleware
6. **Superuser bypass:** PostgreSQL superusers and roles with BYPASSRLS ignore all RLS policies -- must restrict production access
7. **CVE history:** CVE-2024-10976 and CVE-2025-8713 demonstrate that RLS is not bulletproof at the PostgreSQL engine level

---

## Prisma 6 and Multi-Tenancy

### Current State of Prisma Multi-Tenancy Support

Prisma does **not** have built-in multi-tenancy support. There is no `@tenant` decorator, no automatic WHERE clause injection, and no first-class RLS integration. The community has been requesting this since 2020 (GitHub Discussion #2846, Issue #12735).

### Available Approaches

**1. Manual WHERE Clauses (Ultra TMS's current approach)**
```typescript
// Every query must include tenantId manually
await prisma.carrier.findMany({
  where: { tenantId, deletedAt: null }
});
```
- Pros: Simple, no abstraction overhead
- Cons: Error-prone at scale, no safety net

**2. Prisma Middleware (deprecated pattern)**
```typescript
prisma.$use(async (params, next) => {
  if (params.action === 'findMany') {
    params.args.where = { ...params.args.where, tenantId };
  }
  return next(params);
});
```
- Pros: Automatic injection
- Cons: Middleware is being superseded by Client Extensions; does not handle relation filters correctly; can miss edge cases in nested writes

**3. Prisma Client Extensions (recommended since Prisma 4.16+)**
```typescript
const tenantClient = prisma.$extends({
  query: {
    $allOperations({ args, query }) {
      args.where = { ...args.where, tenantId: currentTenantId };
      return query(args);
    }
  }
});
```
- Pros: Per-request scoping without multiple PrismaClient instances; avoids connection pool explosion; composable
- Cons: Still requires developer to use the extended client; does not protect `$queryRaw`

**4. Prisma + PostgreSQL RLS (hybrid)**
```typescript
// Client extension sets session variable before each query
const tenantClient = prisma.$extends({
  query: {
    $allOperations({ args, query }) {
      return prisma.$transaction([
        prisma.$executeRaw`SET app.current_tenant = ${tenantId}`,
        query(args),
      ]);
    }
  }
});
```
Combined with RLS policies:
```sql
CREATE POLICY tenant_isolation ON carriers
  USING (tenant_id = current_setting('app.current_tenant'));
```
- Pros: Defense-in-depth; RLS catches anything the extension misses
- Cons: Transaction overhead; session variable management; Prisma connection pooling complicates session state

**Sources:**
- [ZenStack: Multi-Tenant Implementation with Prisma](https://zenstack.dev/blog/multi-tenant)
- [NestJS + Prisma Multi-Tenancy with Client Extensions](https://dev.to/moofoo/nestjspostgresprisma-multi-tenancy-using-nestjs-prisma-nestjs-cls-and-prisma-client-extensions-ok7)
- [Prisma GitHub Discussion #2846](https://github.com/prisma/prisma/discussions/2846)
- [Prisma RLS Issue #12735](https://github.com/prisma/prisma/issues/12735)
- [NestJS + Prisma Proxy for Auto Tenant Filtering](https://dev.to/murilogervasio/how-to-make-multi-tenant-applications-with-nestjs-and-a-prisma-proxy-to-automatically-filter-tenant-queries--4kl2)

---

## Soft Delete at Scale (260 Models)

### Performance Implications

Ultra TMS has 248 models with `deletedAt` fields. Every query must include `WHERE deletedAt IS NULL`. At scale, this creates several compounding problems:

**1. Table Bloat**
- Soft-deleted rows remain in the table forever. PostgreSQL's MVCC stores dead tuples alongside live tuples.
- Queries scan 8 KB pages that may contain mostly soft-deleted rows, wasting I/O.
- Over years of operation (FMCSA requires 7-year retention), tables like `loads`, `check_calls`, and `audit_logs` will accumulate millions of soft-deleted rows.
- Unlike hard-deleted rows (which VACUUM can reclaim), soft-deleted rows are live data that VACUUM cannot touch.

**2. Index Bloat**
- Standard B-tree indexes include soft-deleted rows. An index on `(tenantId, status)` includes rows where `deletedAt IS NOT NULL`, wasting space and slowing lookups.
- Without partial indexes, index scans must filter out soft-deleted rows after reading index entries.

**3. Query Performance Degradation**
- Every query pays the cost of the `deletedAt IS NULL` predicate.
- Sequential scans over large tables with high soft-delete ratios (e.g., 80% deleted over 7 years) are dramatically slower.
- JOIN operations multiply the problem: joining two tables with 80% soft-deleted rows means scanning 25x more data than necessary.

### Index Strategies for (tenantId, deletedAt)

**Recommended: Partial Indexes**
```sql
-- Only indexes active (non-deleted) rows -- dramatically smaller index
CREATE INDEX idx_carriers_tenant_active
  ON carriers (tenant_id, status)
  WHERE deleted_at IS NULL;

-- Partial unique index -- allows soft-deleted duplicates
CREATE UNIQUE INDEX idx_carriers_tenant_mc_unique
  ON carriers (tenant_id, mc_number)
  WHERE deleted_at IS NULL;
```

Benefits:
- Index only contains active rows -- if 80% are soft-deleted, the index is 5x smaller
- Smaller index fits in RAM, dramatically improving cache hit rates
- PostgreSQL's query planner uses partial indexes when the query's WHERE clause matches the index predicate

**Current Gap in Ultra TMS:** The Prisma schema does not define partial indexes (Prisma has limited support via `@@index` with no WHERE clause). These must be added via raw SQL migrations.

**Compound Index Strategy:**
```sql
-- For the most common query pattern: tenant + active records + ordering
CREATE INDEX idx_loads_tenant_active_created
  ON loads (tenant_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- For filtered lists: tenant + active + status
CREATE INDEX idx_loads_tenant_status_active
  ON loads (tenant_id, status)
  WHERE deleted_at IS NULL;
```

### When Soft Delete Becomes a Problem

| Threshold | Symptom | Mitigation |
|-----------|---------|------------|
| >1M rows per table | Sequential scan slowdown | Partial indexes, EXPLAIN ANALYZE monitoring |
| >70% soft-deleted ratio | Index bloat, wasted I/O | Archive to separate table or partition |
| >10M rows per table | VACUUM struggles, table bloat | Table partitioning by date range |
| >100M rows per table | Query planner instability | Partition + archive + possibly separate read replica |

### Archival Strategy (Not Yet Implemented)

For Ultra TMS's 7-year retention requirement, the recommended pattern is:
1. Keep active + recent (e.g., 1 year) soft-deleted rows in the main table
2. Move older soft-deleted rows to an `{table}_archive` table or time-based partition
3. Archive tables can live on cheaper storage with relaxed performance requirements
4. Regulatory queries can UNION across main + archive when needed

**Sources:**
- [Tiger Data: Reducing Bloat in Large PostgreSQL Tables](https://www.tigerdata.com/learn/how-to-reduce-bloat-in-large-postgresql-tables)
- [Cybertec: Table Bloat Revisited](https://www.cybertec-postgresql.com/en/table-bloat-revisited-making-tables-shrink/)
- [OneSignal: Lessons from 5 Years of Scaling PostgreSQL](https://onesignal.com/blog/lessons-learned-from-5-years-of-scaling-postgresql/)
- [DEV.to: PostgreSQL Soft-Delete Strategies](https://dev.to/oddcoder/postgresql-soft-delete-strategies-balancing-data-retention-50lo)
- [Think and Grow: Stop Using != deleted_at](https://blog.thnkandgrow.com/stop-using-deleted_at-database-soft-delete-performance-guide/)

---

## Real-World Tenant Data Leak Incidents

### 1. Adobe Analytics (September 2025)

**What happened:** A performance optimization upgrade to the Adobe Analytics platform introduced a bug that caused cross-tenant data visibility. A subset of global customers could see each other's analytics data for nearly two days.

**Root cause:** A caching layer optimization that was tenant-unaware. The performance change inadvertently shared cached query results across tenant boundaries.

**What could have prevented it:** Database-level tenant isolation (RLS) would have prevented the cache from serving cross-tenant data, since the database itself would enforce row-level filtering regardless of what the cache layer did.

**Source:** [Red-Team News: Adobe Analytics Data Leak](https://www.redteamnews.com/threat-intelligence/data-breach/adobe-analytics-data-leak-architectural-failure-exposes-cross-tenant-data/)

### 2. Microsoft Azure (2019)

**What happened:** A misconfiguration in Azure infrastructure allowed unauthorized access to customer data across multiple tenants.

**Root cause:** Infrastructure-level misconfiguration in shared services that did not properly enforce tenant boundaries.

**What could have prevented it:** Defense-in-depth at the data layer. Even if infrastructure misconfiguration occurs, database-level isolation should independently prevent cross-tenant access.

**Source:** [Josys: Multitenancy Security Vulnerabilities](https://www.josys.com/article/multitenancy-how-shared-infrastructure-can-expose-security-vulnerabilities)

### 3. AWS AppSync Cross-Tenant Vulnerability

**What happened:** A cross-tenant vulnerability in AWS AppSync allowed attackers to abuse the service to access resources in other organizations' accounts.

**Root cause:** Insufficient tenant boundary enforcement in the API layer. Tenant identity was not independently verified at the resource access layer.

**What could have prevented it:** Independent tenant verification at every layer (API gateway, application, database) rather than relying on a single layer's enforcement.

**Source:** [StartupDefense: Cross-Tenant Attacks in Cloud](https://www.startupdefense.io/cyberattacks/cross-tenant-attack-in-cloud)

### 4. Generic BOLA/IDOR Pattern (Widespread)

**What happens:** Security controls based on tenant GUID in request URLs are not verified against access tokens. Attackers change the tenant ID in the URL and access another tenant's data. This is a form of Broken Object Level Authorization (BOLA) -- the #1 OWASP API vulnerability.

**Relevance to Ultra TMS:** If any endpoint accepts tenantId as a URL parameter or request body (rather than exclusively extracting it from the JWT), this vulnerability applies. Ultra TMS's `TenantInterceptor` extracting from JWT is the correct pattern -- but any deviation is a leak.

**Source:** [Dana Epp: Cross-Tenant Data Leaks](https://danaepp.com/cross-tenant-data-leaks-ctdl-why-api-hackers-should-be-on-the-lookout)

### Key Lesson

Every incident above shares a common theme: **reliance on a single layer for tenant isolation**. When that layer fails (cache bug, misconfiguration, code error), there is no fallback. Defense-in-depth is not optional for multi-tenant SaaS.

---

## Recommendations for Ultra TMS

### Immediate (Sprint Priority)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | **Add Prisma Client Extension for automatic tenantId injection** | 4-8 hours | Eliminates the "missed WHERE clause" risk for all standard Prisma queries. This is the single highest-impact change. ADR-012 already notes this as a future step. |
| 2 | **Add Prisma Client Extension for automatic `deletedAt: null` injection** | 2-4 hours | Same pattern as tenantId -- eliminates the second most common missed filter. Can be combined with #1. |
| 3 | **Add static analysis rule** (custom ESLint or grep CI check) that flags any `prisma.*.findMany`, `prisma.*.findFirst`, `prisma.*.findUnique`, `prisma.*.update`, `prisma.*.delete` call that does not go through the tenant-scoped client | 4 hours | Catches regressions at CI time. |

### Short-Term (Next 2-4 Weeks)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 4 | **Add partial indexes** on the 10 highest-traffic tables (loads, orders, carriers, customers, invoices, settlements, check_calls, stops, contacts, documents) via raw SQL migration | 4-8 hours | Immediate query performance improvement; smaller indexes; better cache utilization. |
| 5 | **Audit all `$queryRaw` and `$executeRaw` calls** for tenantId inclusion | 2 hours | These bypass any Prisma extension; must be manually verified. |
| 6 | **Fix SEC-P1-001** (localStorage tokens) | Included in QS-001 | Removes the XSS vector that could expose tenant-bearing JWTs. |

### Medium-Term (1-3 Months)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 7 | **Evaluate PostgreSQL RLS as a safety net** (not primary enforcement) | 2-3 days | Add RLS policies on the 10 most sensitive tables (users, loads, invoices, settlements, payments). Keep app-level filtering as primary; RLS catches what the app misses. This is the defense-in-depth approach recommended by AWS, OWASP, and every post-incident analysis above. |
| 8 | **Design archival strategy** for soft-deleted records older than 1 year | 1-2 weeks | Prevents table/index bloat from 7-year retention. Partition-based approach preferred over archive tables for simpler queries. |
| 9 | **Add tenant-aware integration tests** that verify no endpoint returns data from a different tenant | 2-3 days | Automated cross-tenant leak detection in CI. |

### Not Recommended (Confirm ADR-012 Rejection)

| Pattern | Why Not |
|---------|---------|
| Schema-per-tenant | 260 models x N tenants = migration nightmare. ADR-003 and ADR-012 correctly reject this. |
| DB-per-tenant | Connection pool explosion, operational overhead. Correctly rejected. |
| Full RLS replacement of app-level filtering | Prisma compatibility is not mature enough. RLS should supplement, not replace. |

### Priority Order

**Recommendation #1 (Prisma Client Extension) is the single most impactful action.** It transforms tenant isolation from "every developer must remember" to "the system enforces by default." Combined with #3 (static analysis), it creates a two-layer defense at the application level. Adding #7 (RLS safety net) later creates a three-layer defense.

The current approach is not wrong -- it is **incomplete**. ADR-012's decision to use row-level tenantId is correct. The gap is that enforcement is manual rather than automatic, leaving no margin for human error across 260 models and 40+ modules.

---

## Summary for Tribunal

**Verdict on Ultra TMS's multi-tenant approach:** Architecturally sound choice (row-level tenantId), but critically lacking in enforcement automation.

**The core risk is not the pattern -- it is the implementation:** Manual WHERE clauses across 801 query points with zero database-level fallback. One missed filter, one raw query, one caching bug (see: Adobe Analytics), and tenant data leaks.

**The fix is incremental, not revolutionary:** Prisma Client Extensions (4-8 hours) + partial indexes (4-8 hours) + eventual RLS safety net (2-3 days) transforms the isolation from "hope every query is correct" to "system enforces at multiple layers."

**Sources referenced in this brief:**
- [OWASP Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)
- [Future Processing: Multi-Tenant Architecture Guide 2026](https://www.future-processing.com/blog/multi-tenant-architecture/)
- [InstaTunnel: When RLS Fails in SaaS](https://medium.com/@instatunnel/multi-tenant-leakage-when-row-level-security-fails-in-saas-da25f40c788c)
- [Permit.io: Postgres RLS Implementation Guide](https://www.permit.io/blog/postgres-rls-implementation-guide)
- [Bytebase: Common RLS Footguns](https://www.bytebase.com/blog/postgres-row-level-security-footguns/)
- [Microsoft Azure Multi-Tenant Patterns](https://learn.microsoft.com/en-us/azure/architecture/guide/saas-multitenant-solution-architecture/)
- [The Nile: Shipping Multi-Tenant SaaS with RLS](https://www.thenile.dev/blog/multi-tenant-rls)
