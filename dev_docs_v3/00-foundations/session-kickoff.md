# Session Kickoff — Ultra TMS

> **Rule:** Max 6 files before coding. Read these first, then code.
> **Never ask "Ready to start?" — present the briefing and immediately start.**

---

## Step 1: Find Your Task

Read [../STATUS.md](../STATUS.md) → look at "Quality Sprint — Active Tasks" table.

Pick the highest-priority task with status `planned` that isn't blocked.
If all tasks are blocked or in-progress, look at backlog: [../03-tasks/backlog/_index.md](../03-tasks/backlog/_index.md)

---

## Step 2: Read the Task File (1 of 6)

Go to: `dev_docs_v3/03-tasks/sprint-quality/QS-{NNN}-{name}.md`

Read:
- **Objective** — what you're building
- **Context Header** — the 3-6 files you must read next
- **File Plan** — every file you'll create or modify
- **Acceptance Criteria** — what "done" means

---

## Step 3: Read the Service Hub (2 of 6)

Go to: `dev_docs_v3/01-services/p0-mvp/{service}.md`

Read:
- **Implementation Status** — what's built vs. not built in each layer
- **API Endpoints** — which endpoints exist (Production/Stub/Not Built)
- **Known Issues** — bugs you need to be aware of
- **Business Rules** — domain constraints you cannot violate

---

## Step 4: Read the Actual Code (3-6 of 6)

The task file's Context Header lists 3-6 specific files. Read those files.

**Common files to read:**
- Backend controller: `apps/api/src/modules/{service}/{service}.controller.ts`
- Backend service: `apps/api/src/modules/{service}/{service}.service.ts`
- Frontend page: `apps/web/app/(dashboard)/{service}/page.tsx`
- Design spec: `dev_docs/12-Rabih-design-Process/{folder}/{screen}.md`

---

## Step 5: Verify Backend Exists Before Writing Frontend

Before writing ANY frontend code that calls an API:
```bash
# Check if the backend endpoint exists
grep -r "'{route}'" apps/api/src/modules/
```

If the endpoint doesn't exist, build it first (or create a task for it).

---

## Step 6: Write Tests First (TDD)

Use the `test-driven-development` skill before writing implementation code.

For backend:
```bash
# Run existing tests to see what passes
pnpm --filter api test
```

For frontend:
```bash
pnpm --filter web test
```

---

## Step 7: Build → Verify → Ship

After implementing:

```bash
pnpm check-types    # Must be 0 errors
pnpm lint           # Must be 0 errors
pnpm --filter web test  # Must pass
```

Then verify in browser:
1. Use Playwright to navigate to the route
2. Take a screenshot
3. Verify all 4 states work (loading, error, empty, populated)
4. Click through all interactive elements
5. Submit any forms

---

## Step 8: Update Docs Before Closing

After completing a task:
1. Mark task as `done` in STATUS.md
2. Update the service hub file if routes/endpoints/components changed
3. Update CHANGELOG.md with what was done
4. Run `/log` to update the work log

---

## Anti-Context-Rot Rules

- **Max 6 files before coding.** If you need more context, split the task.
- **Read, don't assume.** If you're not sure what a backend endpoint returns, read the code.
- **Grep before building.** Before building anything, check if it already exists.
- **One task at a time.** Fully complete a task (including tests and doc updates) before starting the next one.

---

## Quick Reference

| What | Where |
|---|---|
| Current tasks | [../STATUS.md](../STATUS.md) |
| Task files | [../03-tasks/sprint-quality/](../03-tasks/sprint-quality/) |
| Service hubs | [../01-services/](../01-services/) |
| Screen catalog | [../02-screens/_index.md](../02-screens/_index.md) |
| API catalog | [../04-specs/api-catalog.md](../04-specs/api-catalog.md) |
| Design specs | `dev_docs/12-Rabih-design-Process/` |
| Backend code | `apps/api/src/modules/` |
| Frontend code | `apps/web/app/(dashboard)/` |
| Components | `apps/web/components/tms/` |
| Quality gates | [quality-gates.md](quality-gates.md) |
| Domain rules | [domain-rules.md](domain-rules.md) |
| Protect list | [../PROTECT-LIST.md](../PROTECT-LIST.md) |
