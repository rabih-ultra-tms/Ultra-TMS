# Context Management

> AI Dev Guide | What files to read first, max context budget, session kickoff

---

## The 6-File Rule

Read at most 6 files before starting to code. More than 6 creates context overload and reduces output quality.

## Session Kickoff Checklist

### Step 1: Read STATUS.md (1 file)

```
dev_docs_v3/STATUS.md
```

Find your assigned task. Check what's done, what's in progress, what's blocked.

### Step 2: Read Service Hub (1 file)

```
dev_docs_v3/01-services/p0-mvp/{service}.md
```

This single file contains: screens, API endpoints, components, hooks, business rules, data models, validation rules, status machines, known issues, tasks, and dependencies.

### Step 3: Read Task File (if exists) (1 file)

```
dev_docs_v3/03-tasks/sprint-quality/QS-{NNN}-{name}.md
```

Contains specific acceptance criteria, affected files, and test plan.

### Step 4: Read Relevant Source Code (2-3 files)

Pick from:
- The page/component you're modifying
- The hook(s) involved
- The backend controller (if needed)

**Total: 5-6 files max before coding.**

## Context Priority Matrix

| If your task is... | Read these first |
|---------------------|-----------------|
| Building a new screen | Service hub + Design spec + Existing hooks |
| Fixing a bug | Service hub (Known Issues) + Affected file + Hook |
| Writing tests | Component file + Hook file + Test playbook |
| Schema migration | schema.prisma + Migration playbook + Service hub |
| API endpoint | Controller + Service + DTOs + Service hub |

## What NOT to Read

- `dev_docs_v2/` -- historical, read-only archive
- All 105 files in `dev_docs/11-ai-dev/` -- too much context
- The entire `schema.prisma` (260 models) -- read only the relevant model section
- Other service hubs not related to your task

## Context Budget by Task Size

| Task Size | Files to Read | Coding Time |
|-----------|--------------|-------------|
| Small (S) | 3-4 files | 30 min - 1 hour |
| Medium (M) | 4-5 files | 2-4 hours |
| Large (L) | 5-6 files | 6-8 hours |
| Extra Large (XL) | 6 files + split task | 8-16 hours |

## Key Reference Files

| File | What It Contains | When to Read |
|------|-----------------|--------------|
| `CLAUDE.md` | Conventions, gotchas, commands | Every session |
| `dev_docs_v3/STATUS.md` | Task assignments, progress | Every session |
| `dev_docs_v3/PROTECT-LIST.md` | Files you must not modify | Before modifying anything |
| `dev_docs_v3/05-audit/recurring-patterns.md` | 10 anti-patterns to avoid | Before writing hooks |
| `apps/api/prisma/schema.prisma` | Database schema | When working with data |

## Session Handoff

At the end of every session:
1. Update STATUS.md with what was done
2. Note any blockers or findings
3. List files modified
4. Summarize next steps

This enables the next AI session (or different AI tool) to pick up seamlessly.
