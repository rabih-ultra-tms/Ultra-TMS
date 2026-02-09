# Session Kickoff Guide

How to start any AI coding session on Ultra TMS. Designed to prevent context rot and hallucination.

---

## Quick Orient (30 seconds)

1. **CLAUDE.md** loads automatically in Claude Code (project context, commands, conventions)
2. **Read the service hub file** for the service you're working on: `dev_docs_v2/03-services/{service}.md` — this is your single source of truth (status, screens, API, components, bugs, tasks, design links all in one file)
3. Read **dev_docs_v2/STATUS.md** to find your specific task and check assignments
4. Read the task file in **dev_docs_v2/01-tasks/{current-phase}/** for detailed acceptance criteria

---

## Maximum Files Before Coding: 6

```
Level 0 (auto):     CLAUDE.md
Level 1 (30 sec):   dev_docs_v2/03-services/{service}.md → service hub (single source of truth)
Level 2 (task):     dev_docs_v2/STATUS.md → find your task → task file in 01-tasks/
Level 3 (deep):     Full 15-section design spec (ONLY if task requires it)
```

**Do NOT read more than 6 files before starting to code.** Every task file lists exactly which files you need. If a file isn't listed, you don't need it.

---

## Context Header Pattern

Every task file starts with a Context Header:

```markdown
## Context Header

Before starting, read:
1. CLAUDE.md (auto-loaded in Claude Code)
2. [specific file relevant to this task]
3. [one more if needed — max 3 items here]
```

**Only read what's listed.** The task file is self-contained. If you need the full design spec, the Reference section at the bottom tells you where.

---

## By Task Type

### Fixing a bug

1. Read `dev_docs_v2/STATUS.md` → find your BUG task
2. Read the task file in `dev_docs_v2/01-tasks/phase-0-bugs/`
3. The task file points to the exact file and line number

### Building a component

1. Read `dev_docs_v2/STATUS.md` → find your COMP task
2. Read the task file in `dev_docs_v2/01-tasks/phase-1-design/`
3. The task file references the design-system.md for tokens/colors

### Building a page

1. Read `dev_docs_v2/03-services/{service}.md` → the hub file has screens, API, components, and links
2. Read `dev_docs_v2/STATUS.md` → find your specific task
3. Read the task file — it links to the web-dev-prompt and design spec
4. If needed, check the full 15-section spec linked in the hub file

### Refactoring existing code

1. Read `dev_docs_v2/STATUS.md` → find your task
2. Read the task file
3. Read the existing page/component you're refactoring
4. Check `dev_docs_v2/04-audit/{service}.md` for the audit findings on that code

---

## After Coding

1. **Update STATUS.md** — mark your task as DONE, add the date
2. **Run verification** — `pnpm check-types && pnpm lint` (every task requires this)
3. **Commit** — use `/commit` or `git commit`
4. **Update work log** — use `/log` to add an entry to `dev_docs/weekly-reports/work-log.md`

---

## For Non-Claude AI Agents (Codex, Gemini, Copilot, Cursor, etc.)

Each AI tool auto-loads its own config file from the repo:

| AI Tool | Auto-loads | What to do |
|---------|-----------|------------|
| OpenAI Codex | `AGENTS.md` | Already loaded — follow the Quick Start section |
| Gemini CLI | `GEMINI.md` | Read `AGENTS.md` for full context |
| GitHub Copilot | `.github/copilot-instructions.md` | Read `AGENTS.md` for full context |
| Claude Code | `CLAUDE.md` | Already loaded — use `/kickoff` |
| Other tools | — | Read `AGENTS.md` manually |

**Key files for non-Claude AIs:**
- `AGENTS.md` — Universal entry point (start here)
- `WORKFLOWS.md` — Manual equivalents of Claude Code's `/kickoff`, `/log`, `/preflight` commands
- `LEARNINGS.md` — Shared knowledge base (add your discoveries here)
- `dev_docs_v2/00-foundations/design-toolkit-guide.md` — Component/design decisions without MCP servers

**The task files are AI-agnostic.** They work with any coding agent — same Context Headers, same acceptance criteria, same file plans.

---

## Rules

1. **One task = one session.** Don't try to do multiple tasks in one context window.
2. **Read only what's listed.** The Context Header tells you what you need. Nothing more.
3. **Update STATUS.md immediately** when you start or finish a task.
4. **Check dependencies** before starting. If your task says "Blocked by: COMP-001", verify COMP-001 is DONE first.
5. **Don't rebuild backend services that already exist.** Check `dev_docs/CURRENT-STATE.md` for the list of existing backend services.
6. **Rebuild UI from design specs.** All frontend screens are rebuilt fresh — don't patch old code, build new from specs. Old code is reference only (for API call patterns).
7. **PROTECT LIST — Do NOT touch these pages:**
   - Load Planner (`/load-planner/[id]/edit`) — works, production-ready
   - Truck Types (`/truck-types`) — 8/10 quality, gold standard
   - Login (`/login`) — works, 8/10 quality
8. **Always fix security bugs** (JWT console logs, localStorage tokens) regardless — these affect shared code, not page-specific.
