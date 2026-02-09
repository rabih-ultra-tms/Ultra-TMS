Scan the codebase for multi-tenant safety issues (missing tenantId/deletedAt filters).

## Instructions

### Step 1: Scan Backend Services

1. **Find all Prisma query calls** in `apps/api/src/modules/`:
   - Search for patterns: `prisma.{model}.findMany`, `prisma.{model}.findFirst`, `prisma.{model}.findUnique`, `prisma.{model}.findFirstOrThrow`, `prisma.{model}.findUniqueOrThrow`, `prisma.{model}.update`, `prisma.{model}.updateMany`, `prisma.{model}.delete`, `prisma.{model}.deleteMany`, `prisma.{model}.count`, `prisma.{model}.aggregate`
   - Also search for `this.prisma.` patterns

2. **For each Prisma query found**, check:
   - Does the `where` clause include `tenantId`? (REQUIRED for all queries)
   - Does the `where` clause include `deletedAt: null`? (REQUIRED for all read queries)
   - Exception: Queries inside migration/seeding scripts are exempt
   - Exception: The `health` module is exempt (no tenant context)
   - Exception: Auth module login/register may be exempt for initial tenant lookup

3. **Check for raw SQL queries** (`prisma.$queryRaw`, `prisma.$executeRaw`):
   - These are high-risk — flag ALL raw queries for manual review
   - Check if they include `tenant_id` and `deleted_at IS NULL` conditions

### Step 2: Scan Controllers

4. **Verify all controller methods use `@CurrentTenant()`**:
   - Search for controller methods in `apps/api/src/modules/*/` that DON'T have `@CurrentTenant() tenantId: string` parameter
   - Exceptions: `@Public()` endpoints, health checks

5. **Check for hardcoded tenant IDs**:
   - Search for any UUID-like strings in service files that might be hardcoded tenant IDs
   - Search for `tenantId = '` patterns

### Step 3: Scan Frontend

6. **Check API calls from frontend** in `apps/web/`:
   - Verify that no frontend code passes tenantId as a parameter (it should come from the JWT token, not the client)
   - Search for `tenantId` in frontend API call parameters — these are potential bypasses

### Step 4: Generate Audit Report

7. **Output a structured report**:

```
## Multi-Tenant Safety Audit

### Overall Risk: LOW / MEDIUM / HIGH / CRITICAL

### Summary
- Total Prisma queries scanned: [count]
- Queries with tenantId filter: [count] ([percentage]%)
- Queries with deletedAt filter: [count] ([percentage]%)
- Raw SQL queries found: [count]
- Unsafe queries found: [count]

### CRITICAL: Missing tenantId Filter
[These queries could leak data across tenants]

| File | Line | Query | Model |
|------|------|-------|-------|
| [path] | [line] | prisma.model.findMany | Model |

### WARNING: Missing deletedAt Filter
[These queries could return soft-deleted records]

| File | Line | Query | Model |
|------|------|-------|-------|
| [path] | [line] | prisma.model.findMany | Model |

### INFO: Raw SQL Queries (Manual Review Needed)
| File | Line | Query Preview |
|------|------|---------------|

### INFO: Controllers Missing @CurrentTenant()
| File | Method | Route |
|------|--------|-------|

### Frontend Concerns
| File | Issue |
|------|-------|

### Recommendations
1. [Specific fix for each critical/warning issue]
```

### Step 5: Offer Fixes

8. **For each unsafe query found**, show the current code and the suggested fix:

```
// BEFORE (UNSAFE):
const items = await this.prisma.model.findMany({
  where: { status: 'ACTIVE' },
});

// AFTER (SAFE):
const items = await this.prisma.model.findMany({
  where: { tenantId, status: 'ACTIVE', deletedAt: null },
});
```

9. **Ask the user**: "Want me to auto-fix the [N] unsafe queries found?"

### Important Notes

- This audit is about DATA ISOLATION — the most critical security concern in multi-tenant SaaS
- A single missing `tenantId` filter means one tenant can see another's data
- A missing `deletedAt: null` filter means users see records they "deleted"
- Both are compliance risks (SOC 2, GDPR, etc.)
- When in doubt, flag it — false positives are safer than false negatives
