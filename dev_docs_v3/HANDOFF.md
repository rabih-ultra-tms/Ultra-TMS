# dev_docs_v3 Handoff Document

> Entry point for any new session on Ultra TMS.
> Last updated: 2026-03-07

---

## What dev_docs_v3 Is

**dev_docs_v3 is the single source of truth for ALL 38 services of the Ultra TMS project.** It was built using the Master Starter Kit methodology adapted for mid-project use (we had code, not greenfield). It replaces dev_docs_v2 as the active planning layer.

**What was done:**
- All 30 Master Kit orchestrator steps executed (adapted for mid-project)
- 9 full 15-section P0 service hub files (4-way merge: spec + v2 hub + design specs + actual code)
- 6 abbreviated P1 hub files, 7 abbreviated P2 hub files, 1 P3 index
- Screen catalog: 98 routes inventoried
- Task files: 10 Quality Sprint tasks (QS-001 through QS-010)
- API catalog: ~500 endpoints documented
- Audit consolidation: all findings from Jan-Mar 2026
- Reference catalogs: 304 components, 51 hooks, 260 Prisma models, 35 backend modules
- 3-round self-audit completed (see below)

---

## File Count

```
dev_docs_v3/
  00-foundations/   13 files
  01-services/      24 files (9 P0 + 6 P1 + 7 P2 + 1 P3 + 2 indexes)
  02-screens/        3 files
  03-tasks/         14 files (10 QS tasks + indexes + backlog + completed)
  04-completeness/   5 files
  04-specs/          1 file
  05-audit/          5 files
  06-references/     6 files
  07-decisions/      1 file
  08-sprints/        1 file
  Root files:        5 (STATUS.md, CHANGELOG.md, PROTECT-LIST.md, HANDOFF.md, SUMMARY-CARD.md)
  Total:            ~78 files
```

---

## Where to Find Things

| Need | Location |
|------|----------|
| Current task status | `STATUS.md` |
| Next task to work on | `STATUS.md` → Quality Sprint table → pick first `planned` task |
| Session startup instructions | `00-foundations/session-kickoff.md` |
| Service info (endpoints, bugs, business rules) | `01-services/p0-mvp/{service}.md` |
| All routes + verification status | `02-screens/_index.md` |
| Task details (acceptance criteria) | `03-tasks/sprint-quality/QS-{NNN}-{name}.md` |
| API endpoint list | `04-specs/api-catalog.md` |
| Bug tracking | `05-audit/latest-audit.md` |
| Anti-patterns to avoid | `05-audit/recurring-patterns.md` |
| Technical debt | `05-audit/technical-debt.md` |
| Design decisions (why X was chosen) | `07-decisions/decision-log.md` |
| Quick lookup guide | `06-references/where-things-live.md` |

---

## Day-1 Checklist

For any developer (human or AI) starting work on this project:

1. **Read CLAUDE.md** — tech stack, golden rules, commands
2. **Read dev_docs_v3/STATUS.md** — current health, active tasks, blockers
3. **Read dev_docs_v3/PROTECT-LIST.md** — files you must not touch
4. **Read dev_docs_v3/05-audit/recurring-patterns.md** — 10 anti-patterns that keep recurring
5. **Run `/kickoff`** skill — finds next task, reads context files, presents briefing
6. **Verify dev environment:**
   ```bash
   docker-compose up -d   # Start infra
   pnpm dev               # Start web:3000 + api:3001
   pnpm check-types       # Should be 0 errors
   pnpm lint              # Should be 0 warnings
   pnpm --filter api test # Should be 72 tests passing
   ```

---

## Team Workflow

### Starting a Task

```
1. /kickoff skill → reads STATUS.md, finds highest-priority planned task
2. Read the task file: dev_docs_v3/03-tasks/sprint-quality/QS-{N}.md
3. Read the service hub: dev_docs_v3/01-services/p0-mvp/{service}.md
4. Read the actual code files listed in the task's Context Header
5. MAX 6 files before starting to code (anti-context-rot rule)
```

### During Implementation

```
6. Grep to verify backend endpoints exist before writing frontend code
7. Use Context7 to check current library docs (NestJS, Prisma, Next.js)
8. Write tests FIRST (TDD) for backend changes
9. Run pnpm check-types + pnpm lint after every significant change
```

### Completing a Task

```
10. Run all acceptance criteria from task file — check each individually
11. Playwright: navigate to route, take screenshot, verify it renders
12. Update STATUS.md (mark task done)
13. Update the service hub if routes/endpoints changed
14. Add entry to CHANGELOG.md
15. Run /log skill to update work log
```

---

## Key Numbers to Know

| Number | What |
|--------|------|
| 98 | Frontend routes (page.tsx files) |
| 304 | React components in components/ |
| 51 | Hook files in lib/hooks/ |
| 35 | Active NestJS backend modules |
| 260 | Prisma models |
| 114 | Prisma enums |
| 31 | Database migrations |
| 72 | Tests currently passing |
| 10 | Active Quality Sprint tasks |
| 3 | Protected files (do not touch) |
| 62 | Bugs found in Sonnet audit |
| 57 | Bugs fixed in Sonnet audit |
| 5 | Bugs deferred (now QS tasks) |

---

## Historical Context

| Layer | Created | Covers | Status |
|-------|---------|--------|--------|
| dev_docs/ | Jan 2026 | 38 services, 381 design specs, 162-week plan | READ-ONLY (historical) |
| dev_docs_v2/ | Feb 8 2026 | 8 MVP services, 72 tasks, 71 completed | READ-ONLY (historical) |
| dev_docs_v3/ | Mar 7 2026 | ALL 38 services, all Master Kit steps | **ACTIVE — use this** |

---

## What's NOT in dev_docs_v3

- The actual design specs (still in `dev_docs/12-Rabih-design-Process/`)
- The completed v2 task files (still in `dev_docs_v2/01-tasks/`)
- The original service definitions (still in `dev_docs/02-services/`)
- The code review reports (still in `dev_docs/Claude-review-v1/` and `dev_docs/gemini-review-v2/`)

These are preserved as read-only references. The dev_docs_v3 hub files link to them rather than duplicating their content.
