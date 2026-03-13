---
name: Backend Test Connection Pool Investigation
description: Root cause analysis of "too many database connections" errors in test suite
type: project
---

## Problem

Backend tests fail with: `FATAL: sorry, too many clients already` when running multiple test files.

## Root Cause

**Not a code bug** — this is a test infrastructure constraint:

1. **37 test files** each call `createTestApp()` → NestJS `Test.createTestingModule()`
2. Each test module **imports AppModule** (40+ service modules)
3. AppModule initialization creates **multiple PrismaService instances** across dependency tree:
   - FactoringModule → creates Prisma for contracts
   - CarriersModule → creates Prisma for operations
   - OrdersModule → creates Prisma for TMS
   - Each module's services instantiate PrismaService independently

4. Even with `--runInBand` flag (sequential execution), connections don't release fast enough between files
5. PostgreSQL `max_connections` (default ~100) exhausted by ~20 test files

## Attempted Fixes & Results

| Approach           | Change                      | Result                                |
| ------------------ | --------------------------- | ------------------------------------- |
| Increase pool size | `connection_limit=5` → `20` | ❌ Still hits limit                   |
| Add pool_timeout   | Set to 60s                  | ❌ Connections not releasing          |
| Singleton reset    | Reset after `app.close()`   | ❌ Modules still create own instances |

## Why Simple Fixes Fail

- **Override PrismaService in TestingModule** only overrides at module root, not in child providers
- **NestJS Test.createTestingModule()** deeply instantiates all module dependencies before allowing overrides
- **Connection pool limit is per-connection-string**, not per-instance — if 20 test files each create 5 connections = 100 total

## Proper Solutions

### Option 1: Increase PostgreSQL (Recommended)

```bash
# In docker-compose.yml postgres service
environment:
  POSTGRES_INIT_ARGS: "-c max_connections=200"

# Or in PostgreSQL config
ALTER SYSTEM SET max_connections = 200;
```

### Option 2: Use Connection Pooler (PgBouncer)

Deploy PgBouncer between tests and PostgreSQL:

- Reuses connections across clients
- Supports more concurrent test connections with fewer DB connections

### Option 3: Run Tests in Parallel with Separate DBs

- Create test database per worker
- Run `pnpm test -- --maxWorkers=4` (instead of `--runInBand`)
- Requires updating jest.config.ts

### Option 4: Mock All Prisma Operations

- Replace `PrismaService` with Jest mock in TestingModule
- Prevents actual DB connections
- Trade-off: loses integration testing benefits

## Decision

**Recommend Option 1** (increase PostgreSQL max_connections to 200). This:

- ✅ Requires no code changes
- ✅ Preserves full integration tests
- ✅ Works immediately
- ✅ Minimal DevOps impact (single env var change)

## Related Files

- `test/helpers/test-app.helper.ts` — Creates test apps, uses singleton
- `test/setup.ts` — Global test setup with connection limit config
- `apps/api/jest.config.ts` — Jest configuration with `maxWorkers: 1`
- `docker-compose.yml` — PostgreSQL service definition
