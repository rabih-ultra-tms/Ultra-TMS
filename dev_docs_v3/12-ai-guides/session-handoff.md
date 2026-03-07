# Session Handoff Guide

> AI Dev Guide | How to hand off work between AI sessions

---

## Why Handoffs Matter

AI sessions have limited context windows. When a session ends, the next session starts with zero memory. Good handoff documentation bridges this gap.

## End-of-Session Checklist

### 1. Update STATUS.md

```markdown
## Session Summary (YYYY-MM-DD)

**Task:** QS-007 (CORS Configuration)
**Status:** COMPLETED
**Files Modified:**
- apps/api/src/main.ts (line 45: updated CORS origins)
- apps/api/src/config/cors.config.ts (new file)

**What Was Done:**
- Added configurable CORS origins from environment variable
- Added localhost:3002 for docs app
- Added production domain placeholder

**What's Left:**
- Nothing -- task complete

**Blockers Found:**
- None
```

### 2. Update Service Hub Known Issues

If you found new bugs during work, add them to the service hub's Known Issues section (Section 11).

### 3. Log Any Decisions Made

If you made architectural or design decisions, document them in `dev_docs_v3/07-decisions/`.

## Start-of-Session Checklist

### 1. Read STATUS.md

Find the last session summary. Understand what was done and what's next.

### 2. Check for In-Progress Tasks

Look for tasks marked "In Progress" -- these should be completed before starting new work.

### 3. Read the Relevant Service Hub

Load context for the service you'll be working on.

### 4. Verify the Codebase State

```bash
# Check for uncommitted changes
git status

# Check if build is clean
pnpm build

# Check if tests pass
pnpm --filter web test
```

## Handoff Template

Copy this template for end-of-session documentation:

```markdown
## Session: [DATE]

### Task(s) Worked On
- [Task ID]: [Title] -- [COMPLETED / IN PROGRESS / BLOCKED]

### Files Created
- [absolute path] -- [purpose]

### Files Modified
- [absolute path]:[line range] -- [what changed]

### Key Decisions
- [Decision] because [reason]

### Issues Discovered
- [Issue] in [file] -- severity: [P0/P1/P2]

### Next Steps
1. [First thing to do next session]
2. [Second thing]

### Context Files for Next Session
1. [file to read first]
2. [file to read second]
```

## Cross-AI Handoff

When handing off between different AI tools (Claude Code vs Gemini vs Codex):

### From Claude Code to Gemini/Codex

1. Claude Code updates STATUS.md and service hub
2. Gemini/Codex reads `AGENTS.md` (universal entry point)
3. Gemini/Codex reads STATUS.md for current state
4. Gemini/Codex reads `GEMINI.md` for Gemini-specific rules

### From Gemini/Codex to Claude Code

1. Gemini/Codex updates STATUS.md
2. Claude Code reads `CLAUDE.md` (auto-loaded)
3. Claude Code reads STATUS.md
4. Claude Code picks up from the summary

## Work Log Location

```
dev_docs_v3/STATUS.md          -- Primary status dashboard
dev_docs_v3/CHANGELOG.md       -- Change history
dev_docs_v3/HANDOFF.md         -- Cross-session handoff notes
```

## Anti-Patterns

| Bad Practice | Why | Better |
|-------------|-----|--------|
| No session summary | Next session starts blind | Always write summary |
| "Fixed some bugs" | Too vague to continue from | List specific files and changes |
| Forgetting to update STATUS.md | Tasks appear unfinished | Update before ending session |
| Starting without reading status | May redo completed work | Always read STATUS.md first |
| Mixing tasks from different services | Context overload | One service per session |
