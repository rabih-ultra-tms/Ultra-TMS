# Agent Capabilities & Limitations

**Model:** Claude Opus 4.6 | **Context Window:** 200K tokens
**Project:** Ultra TMS (504 design docs, 9,853-line Prisma schema, 42 backend modules, 49 page routes)

---

## Table of Contents

1. [What Agents Do Well](#1-what-agents-do-well)
2. [What Agents Struggle With](#2-what-agents-struggle-with)
3. [Optimal Task Sizing](#3-optimal-task-sizing)
4. [Context Window Management](#4-context-window-management)
5. [Speed Expectations](#5-speed-expectations)
6. [How to Get the Best Results](#6-how-to-get-the-best-results)

---

## 1. What Agents Do Well

### Multi-File Editing

Agents excel at making coordinated changes across multiple files in a single session. Examples:

- Adding a new field to a Prisma model, then updating the DTO, service, controller, and frontend type in one pass
- Renaming a function across 15 files consistently
- Creating a complete NestJS module (module, controller, service, DTOs, tests) from a specification

**Why this works:** The agent holds all files in context simultaneously and understands how they relate to each other.

### Codebase Understanding

Agents can rapidly index and comprehend large codebases:

- Reading `schema.prisma` and understanding all 257 models and their relationships
- Tracing a request from the frontend button click through the API proxy, controller, service, and database query
- Identifying patterns used across the codebase (e.g., how every module handles pagination, guards, and tenant filtering)

### Design Specs to Code

One of the highest-value use cases for Ultra TMS specifically:

- Reading a 15-section design spec from `dev_docs/12-Rabih-design-Process/` and generating a complete page implementation
- Translating ASCII wireframes into actual component hierarchies
- Mapping data field specifications to React Hook Form + Zod schemas
- Implementing role-based visibility from the access matrices in each spec

### Test Generation

Agents write thorough tests because they can read the implementation and systematically cover every branch:

- Unit tests for NestJS services (mocking Prisma, testing every method)
- Component tests with Testing Library (rendering, user interactions, API mocking with MSW)
- Edge case identification (null tenant, soft-deleted records, unauthorized roles)

### Refactoring

Breaking apart monolithic files into clean component hierarchies:

- Extracting the 858-line carriers page into focused components
- Converting raw `fetch()` calls into proper API client hooks
- Replacing `any` types with proper TypeScript interfaces
- Reorganizing file structures to match project conventions

### Parallel Execution

When using multiple agent instances:

- Building backend and frontend simultaneously
- Generating tests while building implementation
- Working on independent modules that do not share files

---

## 2. What Agents Struggle With

### Context Window Saturation

Ultra TMS is a large project. Loading everything at once is not possible:

| Content | Approximate Tokens |
|---------|-------------------|
| `schema.prisma` (9,853 lines) | ~40,000 |
| Single design spec file | ~3,000-5,000 |
| All 89 detailed design specs | ~350,000+ |
| Full `CLAUDE.md` | ~3,000 |
| A typical page component (500 lines) | ~2,000 |

**Impact:** If you ask an agent to "build all 362 screens," it will run out of context. If you load too many reference files, the agent has less room for reasoning and output.

**Mitigation:** Work in feature-sized chunks. Provide only the relevant spec, the relevant schema models, and the relevant existing patterns.

### Visual Design Judgment

Agents cannot see the rendered output. They will:

- Follow design specs accurately but cannot judge if the result "looks right"
- Miss spacing/alignment issues that are obvious visually
- Not catch color contrast problems or visual hierarchy issues without explicit WCAG rules
- Generate technically correct but aesthetically mediocre layouts unless given very specific design tokens

**Mitigation:** Use the `/frontend-design` skill (which includes design critique steps), run Playwright screenshots for visual verification, and have a human review the rendered output.

### Complex Cross-File State Management

When state flows through many layers (Zustand store + React Query cache + URL params + form state + WebSocket updates), agents can lose track of:

- Which source of truth wins in conflict scenarios
- Race conditions between optimistic updates and server responses
- Cache invalidation sequences across related queries

**Mitigation:** Break state management work into layers. Build the data fetching layer first, then the store, then the UI bindings. Test each layer independently.

### Very Long Sessions

After 30+ back-and-forth exchanges in a single session:

- Earlier context starts to fade in importance
- The agent may repeat work or forget decisions made earlier
- Quality of reasoning can degrade as the context fills with conversation history

**Mitigation:** Keep sessions focused on one feature or module. Start fresh sessions for new topics. Use the work log to carry context between sessions.

### Ambiguous Requirements

Agents perform best with specific instructions. They struggle when:

- Requirements are vague ("make it better")
- Business logic is implied but not stated ("handle the carrier onboarding workflow")
- Domain-specific TMS/3PL knowledge is needed that is not in the codebase or docs

**Mitigation:** Reference specific design spec files. State expected inputs and outputs. Provide examples of similar completed work.

---

## 3. Optimal Task Sizing

### The Sweet Spot: Feature-Sized Tasks

| Size | Example | Effectiveness |
|------|---------|---------------|
| **Too small** | "Add a CSS class to this button" | Works but overkill -- human is faster |
| **Just right** | "Build the Dispatch Board page from spec `04-tms-core/08-dispatch-board.md`" | Ideal -- agent reads spec, builds components, wires up hooks, adds types |
| **Just right** | "Create the `carrier` NestJS module with CRUD endpoints for the Carrier model" | Ideal -- complete module in one session |
| **Just right** | "Refactor the 858-line carriers page into proper components" | Ideal -- clear scope, clear completion criteria |
| **Too large** | "Build all of TMS Core (15 screens)" | Context overflow -- will lose track, quality degrades |
| **Too large** | "Set up the entire project infrastructure" | Too many interdependent decisions |

### Sizing Rules of Thumb

1. **One page or one module per session** -- A single screen with its components, hooks, and types. Or a single backend module with controller, service, DTOs, and tests.

2. **Maximum 5-8 files created per session** -- Beyond this, the agent starts losing track of what it has already done.

3. **Maximum 3 reference files loaded** -- The design spec, the schema models section, and one example of a similar completed feature.

4. **Clear completion criteria** -- "The page renders with all data fields from the spec, all buttons have onClick handlers, and TypeScript compiles without errors."

---

## 4. Context Window Management

### What to Include in Every Prompt

Always provide:

1. **The specific design spec file path** -- e.g., `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md`
2. **Reference to `CLAUDE.md`** -- The agent reads this automatically but remind it of specific conventions
3. **The relevant Prisma models** -- Point to the model names; the agent can read the schema itself

### What to Let Agents Discover

Do not pre-load these; let the agent search for them:

- Existing component patterns (the agent can grep for similar components)
- Import paths and file locations (the agent can glob for files)
- Existing type definitions (the agent can search `lib/types/`)

### What to Reference but Not Load

Mention these exist but do not paste their contents:

- The full status color system (`00-global/03-status-color-system.md`) -- agent reads when needed
- Development standards (`dev_docs/08-standards/`) -- agent reads the specific standard relevant to the task
- The 34 shadcn/ui components already installed -- agent can check `components/ui/`

### Context Budget Planning

For a typical "build a new screen" session:

| Item | Tokens | Priority |
|------|--------|----------|
| System prompt + CLAUDE.md | ~5,000 | Required |
| Design spec for target screen | ~4,000 | Required |
| Relevant Prisma models (subset) | ~2,000 | Required |
| Example of similar completed page | ~3,000 | Recommended |
| Agent reasoning + output | ~50,000 | Reserved |
| Safety margin | ~20,000 | Reserved |
| **Total used** | **~84,000** | |
| **Remaining for conversation** | **~116,000** | |

This leaves plenty of room for back-and-forth refinement.

---

## 5. Speed Expectations

### Realistic Timelines by Task Type

| Task Type | Agent Time | Human Equivalent |
|-----------|-----------|-----------------|
| Build a new page from design spec | 5-15 minutes | 2-4 hours |
| Build a NestJS module (CRUD) | 5-10 minutes | 1-3 hours |
| Write tests for existing module | 3-8 minutes | 1-2 hours |
| Refactor monolithic page | 5-10 minutes | 1-2 hours |
| Fix a specific bug | 2-10 minutes | 15 min - 2 hours |
| Add a field end-to-end (schema to UI) | 3-5 minutes | 30-60 minutes |
| Code review with detailed feedback | 3-5 minutes | 30-60 minutes |

### Time Multipliers

These factors increase agent time:

- **Ambiguous requirements:** 2-3x (agent asks clarifying questions or makes wrong assumptions)
- **No existing patterns to follow:** 1.5-2x (agent must invent patterns instead of copying them)
- **Complex state management:** 2x (more reasoning needed for state flow)
- **First module of a new type:** 1.5x (no example to follow; subsequent modules are faster)

---

## 6. How to Get the Best Results

### Do

- **Be specific about file paths** -- "Read `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md` and build the page" is far better than "Build the dispatch board."
- **State completion criteria** -- "All buttons must have onClick handlers. TypeScript must compile. Loading and error states must be handled."
- **Provide one example of a similar completed feature** -- "Follow the pattern used in `apps/web/app/(dashboard)/carriers/page.tsx`."
- **Break large work into sessions** -- Build Module A in session 1, Module B in session 2.
- **Use the work log** -- Update `dev_docs/weekly-reports/work-log.md` at the end of each session so the next session has context.

### Do Not

- **Do not paste entire files into the prompt** -- Let the agent read files itself. It gets the exact content and you save context space.
- **Do not ask for "everything"** -- "Build all 15 TMS Core screens" will produce lower quality than building them one at a time.
- **Do not skip quality checks** -- Always ask the agent to run `pnpm check-types` and `pnpm lint` after building.
- **Do not assume visual correctness** -- The agent cannot see the rendered output. Run the dev server and check visually.
- **Do not mix unrelated tasks in one session** -- "Build the dispatch board AND fix the login bug AND update the schema" creates cognitive overload.

### The Ideal Agent Interaction Pattern

```
1. Human: Specific task + file references + completion criteria
2. Agent: Reads files, asks 0-2 clarifying questions
3. Agent: Builds implementation (creates/edits files)
4. Agent: Runs type checks and linting
5. Human: Reviews rendered output visually
6. Human: Requests adjustments (1-3 rounds)
7. Agent: Makes adjustments, runs checks again
8. Human: Approves, agent commits
```

This pattern typically completes in 10-20 minutes for a single screen or module.
