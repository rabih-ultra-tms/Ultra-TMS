# QS-009: Delete .bak Directories

**Priority:** P3
**Effort:** S (30 minutes)
**Status:** planned
**Assigned:** Anyone

---

## Context Header (Read These First)

1. `apps/api/src/modules/analytics.bak/` — Diff against analytics/
2. `apps/api/src/modules/workflow.bak/` — Diff against workflow/
3. `apps/api/src/modules/integration-hub.bak/` — Diff against integration-hub/

---

## Objective

Delete 5 `.bak` directories from the backend modules folder. These are old backups that are confusing — the active modules have replaced them. Verify no unique code exists before deletion.

---

## .bak Directories to Delete

| Directory | Active Replacement |
|-----------|-------------------|
| `apps/api/src/modules/analytics.bak/` | `apps/api/src/modules/analytics/` |
| `apps/api/src/modules/workflow.bak/` | `apps/api/src/modules/workflow/` |
| `apps/api/src/modules/integration-hub.bak/` | `apps/api/src/modules/integration-hub/` |
| `apps/api/src/modules/documents.bak/` | `apps/api/src/modules/documents/` |
| `apps/api/src/modules/carrier.bak/` | `apps/api/src/modules/carrier/` |

---

## File Plan

| Action | Command |
|--------|---------|
| Diff each .bak vs active | `diff -r analytics.bak/ analytics/` |
| If no unique code: delete | `rm -rf analytics.bak/` |
| Update backend-module-map.md | Remove .bak from module count |

---

## Process

```bash
# For each .bak directory:
cd "apps/api/src/modules"

# 1. Check for unique code
diff -r analytics.bak/ analytics/
# If output shows .bak has code not in active dir, save it first

# 2. Delete if clean
rm -rf analytics.bak/
rm -rf workflow.bak/
rm -rf integration-hub.bak/
rm -rf documents.bak/
rm -rf carrier.bak/

# 3. Verify backend still builds
pnpm --filter api build
```

---

## Acceptance Criteria

1. All 5 `.bak` directories are deleted
2. `pnpm --filter api build` passes with 0 errors after deletion
3. `pnpm check-types` passes with 0 errors
4. `dev_docs_v3/04-specs/catalogs/backend-modules.md` updated to remove .bak references

---

## Dependencies

- **Blocks:** Nothing
- **Blocked by:** Nothing — safe to do anytime
- **Risk:** Very low — these are backups, not imported anywhere (NestJS module system would fail to build if they were imported)
