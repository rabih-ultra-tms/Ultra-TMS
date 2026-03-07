# Multi-AI Workflow

> AI Dev Guide | Claude Code vs Gemini vs Codex task assignment rules

---

## AI Tool Capabilities

### Claude Code (Primary)

**Best for:**
- Complex multi-file features
- Architecture decisions
- Code audits and reviews
- WebSocket implementations
- Debugging complex issues
- Documentation generation
- Large refactoring tasks

**Configuration:** `CLAUDE.md` (auto-loaded in Claude Code sessions)

### Gemini (Secondary)

**Best for:**
- CRUD screen builds (following established patterns)
- Form creation and validation
- Component refactoring
- Pattern-based code generation
- Test writing
- Cleanup and formatting tasks

**Configuration:** `GEMINI.md` at project root

### GitHub Codex / Copilot

**Best for:**
- Quick fixes and small changes
- Code completion
- Repetitive code generation
- Documentation inline comments

**Configuration:** `.github/copilot-instructions.md`

## Task Assignment Matrix

| Task Type | Assign To | Reason |
|-----------|-----------|--------|
| WebSocket gateways (QS-001) | Claude Code | Complex, multi-file, real-time |
| Accounting dashboard endpoint (QS-003) | Claude Code | Aggregation logic, multi-table |
| Build Orders List page | Gemini | CRUD pattern, follows existing template |
| Build Invoice Detail page | Gemini | CRUD pattern |
| Replace window.confirm (7 instances) | Gemini | Repetitive, pattern-based |
| Add search debounce | Gemini | Simple pattern application |
| Write carrier tests | Gemini | Pattern-based, repetitive |
| Decompose 858-line monolith | Claude Code | Architecture decision required |
| Schema migration | Claude Code | Database changes need careful planning |
| Design system token update | Gemini | CSS changes, pattern-based |

## Workflow Rules

### Rule 1: One Service Per Session

Each AI session should focus on a single service (e.g., Carrier Management). Don't mix accounting tasks with CRM tasks in the same session.

### Rule 2: Claude Code for First Implementation, Gemini for Replication

When building a new pattern (first CRUD page, first form, first test), use Claude Code. When replicating that pattern for other entities, use Gemini.

### Rule 3: Sequential, Not Parallel

Don't have Claude Code and Gemini editing the same files simultaneously. Use STATUS.md to coordinate:
- Claude Code marks task as "In Progress"
- Gemini checks STATUS.md before starting
- Completed tasks are marked with the AI tool that did them

### Rule 4: Handoff via STATUS.md

Every AI session MUST update STATUS.md before ending. The next AI tool reads this to understand current state.

## Coordination Protocol

```
1. Check STATUS.md for available tasks
2. Claim a task: mark as "In Progress -- [AI Tool Name]"
3. Read the service hub for context
4. Do the work
5. Update STATUS.md with results
6. Mark task as "COMPLETED -- [AI Tool Name]"
```

## Configuration Files

| File | AI Tool | Auto-Loaded? |
|------|---------|-------------|
| `CLAUDE.md` | Claude Code | Yes (auto) |
| `GEMINI.md` | Gemini | Yes (via config) |
| `AGENTS.md` | All tools | Manual -- universal entry point |
| `.github/copilot-instructions.md` | GitHub Copilot | Yes (auto) |

## Quality Gate Responsibility

- **Claude Code:** Responsible for architecture quality, security review, complex logic
- **Gemini:** Responsible for pattern consistency, completeness, test coverage
- **Both:** Must pass L1 (Functional) and L2 (Data) quality gates before marking complete

## Current Task Assignments

See `dev_docs_v3/STATUS.md` for the live assignment board.

### Quality Sprint Priorities

| Task | Effort | Suggested AI |
|------|--------|-------------|
| QS-007: CORS config | 30 min | Gemini (simple config) |
| QS-009: .bak cleanup | 30 min | Gemini (file operations) |
| QS-001: WebSocket gateways | 12-16h | Claude Code (complex) |
| QS-003: Accounting endpoint | 2-4h | Claude Code (aggregation) |
| QS-008: Runtime verify | 2h | Claude Code (investigation) |
