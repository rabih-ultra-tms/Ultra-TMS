# Parallel Agent Patterns

**Purpose:** When and how to run multiple Claude agents simultaneously to accelerate Ultra TMS development.
**Key principle:** Parallelization only helps when agents work on independent file sets. If two agents edit the same file, you get merge conflicts and wasted time.

---

## Table of Contents

1. [Pattern 1: Backend + Frontend in Parallel](#pattern-1-backend--frontend-in-parallel)
2. [Pattern 2: Multi-Module Backend](#pattern-2-multi-module-backend)
3. [Pattern 3: Component + Page](#pattern-3-component--page)
4. [Pattern 4: Tests + Implementation](#pattern-4-tests--implementation)
5. [Coordination Strategy](#coordination-strategy)
6. [Anti-Patterns](#anti-patterns)
7. [Work Splitting Guide](#work-splitting-guide)

---

## Pattern 1: Backend + Frontend in Parallel

**When:** Building a new feature end-to-end (e.g., a new TMS Core screen with its API).
**Speedup:** ~1.5-2x (the slower of the two determines total time).

### How It Works

```
Agent A (Backend)                    Agent B (Frontend)
---------------------------------    ---------------------------------
1. Read Prisma models                1. Read design spec
2. Create DTOs                       2. Build UI components
3. Create service                    3. Build page layout
4. Create controller                 4. Create mock data hooks
5. Create tests                      5. Build form validation
6. Register module                   6. Wait for Agent A...
                                     7. Replace mocks with real API hooks
                                     8. Run integration checks
```

### Prerequisites

- The Prisma schema must already define the models (both agents need this as source of truth)
- The API endpoint paths must be agreed upon before starting (or use the API contract from `dev_docs/09-contracts/`)
- The design spec must exist for Agent B

### Prompt for Agent A (Backend)

```
Build the NestJS module for {service}. Read the Prisma models {Model1}, {Model2} from
schema.prisma. Follow the patterns in the carrier module. Create:
- DTOs (create, update, query, response)
- Service with full CRUD + tenant filtering
- Controller at /api/v1/{entities}
- Unit tests for service and controller
- Register in app.module.ts

Endpoints needed:
- GET /api/v1/{entities} (paginated list with filters)
- GET /api/v1/{entities}/:id
- POST /api/v1/{entities}
- PATCH /api/v1/{entities}/:id
- DELETE /api/v1/{entities}/:id
```

### Prompt for Agent B (Frontend)

```
Build the {Screen} page from the design spec at
dev_docs/12-Rabih-design-Process/{service}/{screen}.md.

The backend is being built in parallel. For now, create the hooks with
mock data that matches the Prisma {Model} shape. Use this endpoint
structure (will be connected later):
- GET /api/v1/{entities}
- GET /api/v1/{entities}/:id
- POST /api/v1/{entities}
- PATCH /api/v1/{entities}/:id
- DELETE /api/v1/{entities}/:id

Build all components, the page composition, and form validation.
Mark the mock hooks with a TODO comment for replacement.
```

### Merging

After both agents complete:
1. Agent A's work is in `apps/api/src/modules/{service}/` -- no frontend files touched
2. Agent B's work is in `apps/web/app/(dashboard)/{feature}/` and `apps/web/lib/hooks/` -- no backend files touched
3. Have a third agent (or Agent B) replace the mock hooks with real API calls
4. Run `pnpm check-types` and `pnpm build` to verify integration

### File Conflict Risk: **LOW**

The only potential conflict is `apps/api/src/app.module.ts` (Agent A modifies it). Agent B does not touch backend files.

---

## Pattern 2: Multi-Module Backend

**When:** Building multiple independent backend modules simultaneously (e.g., `accounting`, `claims`, `factoring`).
**Speedup:** Nearly linear -- 3 agents build 3 modules in the time of 1.

### How It Works

```
Agent A                    Agent B                    Agent C
(Accounting Module)        (Claims Module)            (Factoring Module)
---------------------      ---------------------      ---------------------
1. Read Prisma models      1. Read Prisma models      1. Read Prisma models
2. Create DTOs             2. Create DTOs             2. Create DTOs
3. Create service          3. Create service          3. Create service
4. Create controller       4. Create controller       4. Create controller
5. Create tests            5. Create tests            5. Create tests
```

### Prerequisites

- All Prisma models must already exist in `schema.prisma`
- Modules must be truly independent (no imports between them)
- Each agent gets a different module directory

### File Conflict Risk: **MEDIUM**

All agents need to modify `app.module.ts` to register their module. Solution:
- Have each agent create the module but **do not** register it in `app.module.ts`
- After all agents complete, register all modules in one pass (manually or with a final agent)

### Coordination Rules

1. Each agent works exclusively in its own `apps/api/src/modules/{service}/` directory
2. No agent creates shared utilities (if needed, create a ticket for later)
3. No agent modifies `schema.prisma` (schema changes must happen before parallelization)
4. `app.module.ts` registration is done sequentially after all agents complete

---

## Pattern 3: Component + Page

**When:** A page needs several custom components that do not yet exist.
**Speedup:** ~1.3-1.5x.

### How It Works

```
Agent A (Components)                  Agent B (Page Shell)
-----------------------------------   -----------------------------------
1. Read design spec                   1. Read design spec
2. Build DataTable component          2. Build page layout with placeholders
3. Build FilterBar component          3. Build page header + breadcrumbs
4. Build StatusBadge component        4. Build data fetching hooks
5. Build DetailPanel component        5. Build state management
6. Export all from index.ts           6. Wait for Agent A...
                                      7. Import real components
                                      8. Wire up data flow
```

### Prerequisites

- The design spec must be read by both agents
- Component interfaces (props) must be agreed upon upfront
- Agent B uses placeholder `<div>` elements while waiting for Agent A

### Prompt for Agent A (Components)

```
From the design spec at {path}, build these standalone components in
apps/web/components/{feature}/:

1. {Feature}Table - props: { data: {Type}[], onRowClick, onSort, isLoading }
2. {Feature}Filters - props: { filters, onFilterChange, onReset }
3. {Feature}StatusBadge - props: { status: {StatusEnum} }
4. {Feature}DetailPanel - props: { item: {Type}, onClose }

Each component should:
- Use shadcn/ui primitives from components/ui/
- Have a typed props interface
- Handle loading states
- Be independently renderable

Create an index.ts barrel export for all components.
```

### Prompt for Agent B (Page Shell)

```
From the design spec at {path}, build the page shell at
apps/web/app/(dashboard)/{feature}/page.tsx.

Components are being built in parallel. Use placeholder divs:
  <div data-placeholder="{Feature}Table" />

Build:
- Page layout and composition
- Data fetching hooks in lib/hooks/use-{feature}.ts
- URL-based filter state management
- Page header with actions

I will merge the real components after both agents complete.
```

### File Conflict Risk: **LOW**

Agent A writes to `components/{feature}/`, Agent B writes to `app/(dashboard)/{feature}/` and `lib/hooks/`. No overlap.

---

## Pattern 4: Tests + Implementation

**When:** Practicing test-driven development or adding tests to a module while extending it.
**Speedup:** ~1.2-1.4x (the test agent often finishes first and waits).

### How It Works

```
Agent A (Implementation)              Agent B (Tests)
-----------------------------------   -----------------------------------
1. Read requirements                  1. Read requirements
2. Build service methods              2. Write service test stubs
3. Build controller endpoints         3. Write controller test stubs
4. Handle edge cases                  4. Write edge case tests
5. Complete implementation            5. Complete test suite

--- Merge Point ---
Agent B: Run tests, fix any mismatches between test expectations and implementation
```

### Prerequisites

- Both agents must agree on the public API surface (method names, parameter types, return types)
- Agent B writes tests against the expected behavior, not the actual implementation
- The interface must be defined first (type file or DTO) before both agents start

### File Conflict Risk: **NONE**

Agent A writes `.ts` files, Agent B writes `.spec.ts` files. They never touch the same files.

### Caveat

Test expectations may not match implementation details. After both agents complete, run the tests and have one agent fix discrepancies. This is usually a 2-5 minute task.

---

## Coordination Strategy

### Before Starting Parallel Work

1. **Define the interface contract** -- What endpoints, what component props, what method signatures. Write this down explicitly.
2. **Assign file ownership** -- Each agent gets exclusive directories. No shared files.
3. **Handle shared file modifications sequentially** -- Files like `app.module.ts`, `layout.tsx`, or barrel exports are modified by one agent at a time, after parallel work completes.
4. **Set a merge point** -- Decide when agents sync up. Usually after both complete their independent work.

### During Parallel Work

- Each agent works in its own Claude Code session
- Agents do not communicate with each other
- Each agent runs its own type checks and linting within its scope
- If an agent discovers it needs to modify a shared file, it notes this as a TODO instead of making the change

### After Parallel Work (Merge Phase)

1. **Check for conflicts:** `git diff` to see all changes from both agents
2. **Register modules:** Add new modules to `app.module.ts`
3. **Wire up connections:** Replace mocks with real implementations
4. **Run full verification:**
   ```bash
   pnpm check-types    # Full monorepo type check
   pnpm lint           # Full monorepo lint
   pnpm build          # Full build to catch any issues
   ```
5. **Commit together:** All parallel work goes into one commit (or one commit per module)

---

## Anti-Patterns

### Anti-Pattern 1: Two Agents Editing the Same File

**Symptom:** Both agents modify `apps/web/app/(dashboard)/dashboard/page.tsx`.
**Result:** The second agent's changes overwrite the first agent's work.
**Fix:** Only one agent should own any given file. Split work by file, not by feature within a file.

### Anti-Pattern 2: Shared State Store Conflicts

**Symptom:** Agent A adds fields to `useCarrierStore` while Agent B reads from the same store.
**Result:** Agent B's code references store fields that do not exist yet (or have different names).
**Fix:** Define the store interface first, then have one agent build the store and another consume it.

### Anti-Pattern 3: Schema Changes During Parallel Work

**Symptom:** Agent A modifies `schema.prisma` while Agent B reads it.
**Result:** Agent B generates code based on the old schema. After merge, types do not match.
**Fix:** All schema changes must happen before any parallel work begins. Run `prisma generate` and commit the schema before spawning agents.

### Anti-Pattern 4: Premature Parallelization

**Symptom:** Spinning up 4 agents for a task that a single agent can complete in 10 minutes.
**Result:** Coordination overhead exceeds time saved. You spend more time merging and fixing conflicts than you would have spent with one agent.
**Fix:** Only parallelize when the task naturally decomposes into 2+ independent workstreams with clear file ownership boundaries. If the total sequential time would be under 15 minutes, just use one agent.

### Anti-Pattern 5: No Merge Verification

**Symptom:** Merging parallel work without running `pnpm check-types` and `pnpm build`.
**Result:** Broken imports, type mismatches, and missing dependencies ship to the branch.
**Fix:** Always run full verification after merging parallel work. Budget 5 minutes for the merge phase.

---

## Work Splitting Guide

### Decision Tree: Should You Parallelize?

```
Is the task naturally divisible into independent workstreams?
├── No  → Use single agent
└── Yes
    └── Do the workstreams share any files?
        ├── Many shared files → Use single agent
        └── Few or no shared files
            └── Will total sequential time exceed 15 minutes?
                ├── No  → Use single agent (overhead not worth it)
                └── Yes → Parallelize!
```

### Splitting Rules

| Scenario | Split Strategy | Agents |
|----------|---------------|--------|
| New feature (API + UI) | Backend module vs. Frontend screen | 2 |
| 3 independent backend modules | One module per agent | 3 |
| Large page with many components | Components vs. page shell | 2 |
| Test suite for existing module | Tests vs. implementation extension | 2 |
| 5 bug fixes across different files | One bug per agent (max 3 parallel) | 2-3 |
| Refactor + add feature to same page | **Do not parallelize** -- same files | 1 |
| Update shared types used everywhere | **Do not parallelize** -- shared dependency | 1 |

### Maximum Recommended Parallel Agents

- **2 agents:** Most common and safest. Easy to coordinate.
- **3 agents:** Works well for independent backend modules.
- **4+ agents:** Rarely worth the coordination overhead. Only for truly independent work like building 4 completely unrelated modules.

### Communication Template Between Parallel Agents

Since agents cannot directly communicate, use this pattern to set up work that merges cleanly:

```
## Parallel Work Agreement

### Shared Contract
- Endpoint: GET /api/v1/loads → returns { data: Load[], pagination: {...} }
- Component props: LoadTable({ data: Load[], isLoading: boolean, onRowClick: (id: string) => void })

### Agent A Owns
- apps/api/src/modules/loads/ (all files)
- apps/api/src/app.module.ts (add LoadsModule import)

### Agent B Owns
- apps/web/app/(dashboard)/loads/ (all files)
- apps/web/components/loads/ (all files)
- apps/web/lib/hooks/use-loads.ts

### Shared Files (modified sequentially after merge)
- None

### Merge Point
- After both complete, run: pnpm check-types && pnpm build
```
