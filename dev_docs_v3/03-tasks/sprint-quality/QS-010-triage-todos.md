# QS-010: Triage 339 TODOs

**Priority:** P2
**Effort:** M (2-4 hours)
**Status:** planned
**Assigned:** Claude Code

---

## Context Header (Read These First)

1. `dev_docs_v3/05-audit/technical-debt.md` — Current TODO analysis + categories
2. `dev_docs_v3/03-tasks/backlog/_index.md` — Where to add new backlog tasks from TODOs

---

## Objective

Find all TODO/FIXME comments in the codebase. Categorize them. Create backlog tasks for actionable ones. Delete stale/obsolete TODOs. Result: 0 orphaned TODOs — every TODO either has a task or is deleted.

---

## Process

### Step 1: Find All TODOs
```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/ --include="*.ts" --include="*.tsx" | \
  grep -v "node_modules" | \
  sort > /tmp/todos.txt

wc -l /tmp/todos.txt  # Expect ~339
```

### Step 2: Categorize Each TODO

| Category | Action |
|----------|--------|
| WebSocket implementation | Already covered by QS-001 — add note, then delete TODO |
| Soft delete | Already covered by QS-002 — add note, then delete TODO |
| API connection (FE hook) | Add to "Build screens" backlog, then delete TODO |
| Test coverage | Add to testing backlog, then delete TODO |
| Business logic stub | Review and add specific task, or delete if out of scope |
| Obsolete (feature removed/changed) | Delete immediately |
| Already done | Delete immediately |

### Step 3: Create Backlog Tasks

For each meaningful TODO, add an entry to `dev_docs_v3/03-tasks/backlog/_index.md`:
```markdown
| BUG-XXX | TODO at file:line — description | P1 | 1-2h |
```

### Step 4: Delete Resolved TODOs

For each TODO that's either covered by an existing task or obsolete:
```bash
# Remove the TODO comment (but keep the code if it's a real stub)
# Use Edit tool to remove the comment line
```

---

## File Plan

| File | Change |
|------|--------|
| `dev_docs_v3/03-tasks/backlog/_index.md` | Add new tasks discovered from TODO triage |
| Various `*.ts` and `*.tsx` files | Remove obsolete TODO comments |

---

## Acceptance Criteria

1. `grep -rn "TODO\|FIXME" apps/` count is reduced by at least 50% (from ~339 to <170)
2. Every remaining TODO has a corresponding task in the backlog (can grep both lists to verify)
3. `dev_docs_v3/03-tasks/backlog/_index.md` has been updated with newly-discovered tasks
4. `pnpm check-types` passes with 0 errors after any comment removals (removing comments can't break types, but verify anyway)

---

## Dependencies

- **Blocks:** Accurate backlog
- **Blocked by:** None — can run at any time
- **Note:** Run QS-008 (runtime verification) first so you know which TODOs are in actually-working code vs. never-touched stubs
