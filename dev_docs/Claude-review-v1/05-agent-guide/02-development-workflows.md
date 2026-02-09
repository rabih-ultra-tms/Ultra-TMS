# Development Workflows

**Purpose:** Five standard workflows for building Ultra TMS features with Claude agents.
Each workflow specifies what to provide, what the agent does, and how to verify quality.

---

## Table of Contents

1. [Workflow A: Build a New Frontend Screen](#workflow-a-build-a-new-frontend-screen)
2. [Workflow B: Build a New Backend Module](#workflow-b-build-a-new-backend-module)
3. [Workflow C: Bug Fix](#workflow-c-bug-fix)
4. [Workflow D: Refactor Monolithic Page](#workflow-d-refactor-monolithic-page)
5. [Workflow E: Add Tests](#workflow-e-add-tests)
6. [Workflow Comparison Matrix](#workflow-comparison-matrix)

---

## Workflow A: Build a New Frontend Screen

**When to use:** Building a new page in `apps/web/app/(dashboard)/` from a design spec.
**Typical duration:** 10-20 minutes for a single screen.
**Expected output:** 3-8 new files (page, components, hooks, types).

### Documents to Provide

| Document | Path | Purpose |
|----------|------|---------|
| Design spec | `dev_docs/12-Rabih-design-Process/{service}/{screen}.md` | Primary input -- wireframes, data fields, states, roles |
| Design principles | `dev_docs/12-Rabih-design-Process/00-global/01-design-principles.md` | Visual style, spacing, color system |
| Status colors | `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md` | Status badge colors for the entity |
| Frontend standard | `dev_docs/08-standards/68-frontend-development-standards.md` | File naming, component patterns |
| Example page | An existing page that follows similar patterns (e.g., `/carriers/page.tsx`) | Reference for project conventions |

### Steps

**Step 1: Agent reads the design spec**

The agent reads the 15-section spec and identifies:
- Page layout (header, filters, table/grid, sidebars)
- Data fields and their types
- Status states and transitions
- Role-based visibility rules
- Required components (existing shadcn/ui vs. new custom components)

**Step 2: Agent identifies needed components**

The agent checks `apps/web/components/ui/` for existing shadcn/ui primitives and `apps/web/components/` for existing custom components. It lists what exists and what must be created.

**Step 3: Build missing components first**

For each new component needed:
- Create the component file in `apps/web/components/{feature}/`
- Use shadcn/ui primitives as building blocks
- Add proper TypeScript props interface
- Handle loading, error, and empty states

**Step 4: Compose the page**

Create `apps/web/app/(dashboard)/{feature}/page.tsx`:
- Import and compose the components built in Step 3
- Add page metadata (`title`, breadcrumbs)
- Implement route-level data fetching
- Wire up search, filter, and sort state
- Handle the empty state for new installations

**Step 5: Wire up API hooks**

Create or update hooks in `apps/web/lib/hooks/`:
- Use React Query (`useQuery`, `useMutation`) for server state
- Point to the correct API endpoints via the API proxy (`/api/v1/{resource}`)
- Add proper TypeScript return types
- Handle pagination parameters
- Implement optimistic updates where appropriate

**Step 6: Run quality checks**

```bash
pnpm check-types          # Must pass with zero errors
pnpm lint                 # Must pass with zero warnings
pnpm --filter web test    # Run existing tests (no regressions)
```

### Quality Checklist

- [ ] All buttons have `onClick` handlers (Golden Rule 1)
- [ ] All links have valid `href` values
- [ ] Loading state shows skeleton or spinner
- [ ] Error state shows user-friendly message with retry option
- [ ] Empty state shows helpful message (not blank page)
- [ ] Status badges use correct colors from the color system
- [ ] Role-based elements are conditionally rendered
- [ ] Page title and breadcrumbs are correct
- [ ] TypeScript compiles with zero errors
- [ ] No `any` types in new code
- [ ] No `console.log` statements left in code
- [ ] API calls use the proxy path (`/api/v1/...`), not direct port access

---

## Workflow B: Build a New Backend Module

**When to use:** Creating a new NestJS module in `apps/api/src/modules/`.
**Typical duration:** 8-15 minutes for a CRUD module.
**Expected output:** 6-10 new files (module, controller, service, DTOs, tests).

### Documents to Provide

| Document | Path | Purpose |
|----------|------|---------|
| Prisma schema | `apps/api/prisma/schema.prisma` (relevant models section) | Source of truth for data structure |
| API standards | `dev_docs/08-standards/66-api-development-standards.md` | Endpoint naming, response format, guards |
| Database standards | `dev_docs/08-standards/67-database-standards.md` | Query patterns, tenant filtering, soft deletes |
| API contract | `dev_docs/09-contracts/{service}.md` (if exists) | Pre-defined request/response shapes |
| Example module | An existing fully-implemented module (e.g., `modules/carrier/`) | Reference for project conventions |

### Steps

**Step 1: Agent reads Prisma models**

The agent reads the relevant models from `schema.prisma`, understanding:
- Field names, types, and constraints
- Relations to other models
- Enums used by the model
- Migration-first fields (`externalId`, `sourceSystem`, `customFields`, `tenantId`)

**Step 2: Create DTOs from models**

Create `dto/` directory with:
- `create-{entity}.dto.ts` -- Input for creation, with `class-validator` decorators
- `update-{entity}.dto.ts` -- Partial input for updates (extends `PartialType`)
- `query-{entity}.dto.ts` -- Pagination + filter parameters
- `{entity}-response.dto.ts` -- Response shape with Swagger decorators

Key conventions:
- `whitelist: true` strips unknown fields (global `ValidationPipe`)
- Use `@IsOptional()` for optional fields
- Use `@ApiProperty()` for Swagger documentation
- Use `@Transform()` for type coercion (strings to numbers from query params)

**Step 3: Create service with business logic**

Create `{entity}.service.ts`:
- Inject `PrismaService`
- Every query filters by `tenantId` and `deletedAt: null`
- `findAll()` with pagination, sorting, and filtering
- `findOne()` with tenant check
- `create()` with tenant assignment
- `update()` with ownership check
- `softDelete()` (set `deletedAt`, never hard delete)
- Return shapes match the API response format

**Step 4: Create controller with endpoints**

Create `{entity}.controller.ts`:
- `@Controller('api/v1/{entities}')` -- Plural, kebab-case
- `@UseGuards(JwtAuthGuard, RolesGuard)` on every endpoint
- `@Roles()` with appropriate role restrictions
- `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` for Swagger
- Standard CRUD: `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`
- Extract `tenantId` from `@Req()` user object

**Step 5: Create test files**

Create `{entity}.service.spec.ts` and `{entity}.controller.spec.ts`:
- Mock `PrismaService` with jest mocks
- Test every method in the service
- Test guard application on controller
- Test tenant isolation (queries always include `tenantId`)
- Test soft delete behavior
- Test validation rejection of invalid input

**Step 6: Register in app.module.ts**

Update `apps/api/src/app.module.ts`:
- Import the new module
- Add to `imports` array
- Verify no circular dependencies

### Quality Checklist

- [ ] Every query includes `tenantId` filter (Gotcha 1)
- [ ] Every query includes `deletedAt: null` filter (Gotcha 2)
- [ ] All endpoints have `JwtAuthGuard` and `RolesGuard`
- [ ] All endpoints have `@Roles()` with appropriate roles
- [ ] Response format matches: `{ data: T }` or `{ data: T[], pagination: {...} }`
- [ ] Swagger decorators on all endpoints and DTOs
- [ ] No `any` types
- [ ] Tests pass: `pnpm --filter api test:unit`
- [ ] Module registered in `app.module.ts`
- [ ] TypeScript compiles: `pnpm check-types`

---

## Workflow C: Bug Fix

**When to use:** When a specific bug has been identified and needs fixing.
**Typical duration:** 3-10 minutes depending on complexity.
**Expected output:** 1-3 modified files + 1 new test file.

### Documents to Provide

| Document | Purpose |
|----------|---------|
| Bug description | What happens vs. what should happen |
| Reproduction steps | Exact steps or API request that triggers the bug |
| Relevant file paths | Where you suspect the bug lives (optional but helpful) |
| Error messages | Console errors, stack traces, API responses |

### Steps

**Step 1: Agent searches for root cause**

The agent uses grep, glob, and file reads to:
- Find the code path described in the reproduction
- Trace the data flow from input to output
- Identify where behavior diverges from expectation
- Check if the bug is in frontend, backend, or both

**Step 2: Agent creates the fix**

The fix must:
- Address the root cause, not just the symptom
- Not break existing functionality
- Follow existing code conventions
- Include proper error handling

**Step 3: Agent adds regression test**

Create or update a test file that:
- Reproduces the exact bug scenario
- Verifies the fix resolves it
- Tests edge cases related to the bug
- Prevents the bug from recurring

**Step 4: Agent runs verification**

```bash
pnpm check-types              # No new type errors
pnpm lint                     # No new lint warnings
pnpm --filter {app} test      # All tests pass including new regression test
```

### Quality Checklist

- [ ] Root cause identified and explained
- [ ] Fix addresses root cause (not a workaround)
- [ ] Regression test added
- [ ] All existing tests still pass
- [ ] No new `any` types or `console.log` statements
- [ ] Fix description added to commit message

---

## Workflow D: Refactor Monolithic Page

**When to use:** When a page file exceeds ~300 lines and mixes concerns (data fetching, state management, rendering, business logic).
**Reference:** The 858-line `carriers/page.tsx` is the canonical example of what needs refactoring.
**Typical duration:** 8-15 minutes.
**Expected output:** 4-8 new files replacing 1 large file.

### Documents to Provide

| Document | Path | Purpose |
|----------|------|---------|
| Target page | The monolithic file to refactor | Primary input |
| Frontend standard | `dev_docs/08-standards/68-frontend-development-standards.md` | Target file structure |
| UI standard | `dev_docs/08-standards/69-ui-ux-standards.md` | Component patterns |

### Steps

**Step 1: Agent analyzes the monolithic file**

The agent reads the file and identifies:
- Distinct UI sections (header, filters, table, modals, forms)
- Data fetching logic (React Query hooks, API calls)
- State management (local state, store interactions)
- Shared vs. page-specific logic

**Step 2: Agent plans the extraction**

Creates a decomposition plan:

```
carriers/
  page.tsx              (< 100 lines - composition only)
  components/
    CarrierTable.tsx     (table rendering + column definitions)
    CarrierFilters.tsx   (search, filter, sort controls)
    CarrierForm.tsx      (create/edit form)
    CarrierHeader.tsx    (page header + actions)
    CarrierStats.tsx     (summary statistics cards)
  hooks/
    useCarriers.ts       (React Query hooks for carrier API)
    useCarrierFilters.ts (filter state management)
```

**Step 3: Agent extracts components**

For each extracted component:
- Define a clear props interface
- Move only the relevant JSX and handlers
- Keep the component focused on one responsibility
- Maintain all existing functionality (no behavior changes)

**Step 4: Agent creates proper file structure**

- Page file becomes a thin composition layer (imports + layout)
- Each component is independently testable
- Hooks are separated from rendering logic
- Types are extracted to a shared types file if used across components

**Step 5: Agent verifies no behavior change**

```bash
pnpm check-types          # Must pass (refactoring should not change types)
pnpm lint                 # Must pass
```

The refactored code must produce identical behavior to the original. No features added, no features removed.

### Quality Checklist

- [ ] Original page is now under 100 lines
- [ ] Each extracted component is under 200 lines
- [ ] Each component has a clear, typed props interface
- [ ] No functionality was lost during extraction
- [ ] No new functionality was added (pure refactoring)
- [ ] File structure follows project conventions
- [ ] All imports resolve correctly
- [ ] TypeScript compiles with zero errors

---

## Workflow E: Add Tests

**When to use:** Adding test coverage to existing code that lacks tests.
**Context:** The frontend has only 10 test files for 115+ components. The backend has ~100+ spec files but many modules lack coverage.
**Typical duration:** 5-10 minutes per module or page.
**Expected output:** 1-5 test files.

### Documents to Provide

| Document | Purpose |
|----------|---------|
| Target file path | The code to test |
| Existing test example | A well-written test file in the project to follow as a pattern |
| Test commands | `pnpm --filter web test` or `pnpm --filter api test:unit` |

### Steps

**Step 1: Agent reads the code**

The agent reads the target file and understands:
- All public methods/exports
- Input/output shapes
- Dependencies that need mocking
- Edge cases and error paths
- Branching logic (if/else, switch, early returns)

**Step 2: Agent writes tests**

For **backend services:**
- Create `{service}.spec.ts` in the same directory
- Mock `PrismaService` and any injected dependencies
- Test every public method
- Test tenant isolation
- Test soft delete behavior
- Test validation edge cases
- Test error handling (not found, unauthorized, conflict)

For **frontend components:**
- Create `{component}.test.tsx` alongside the component
- Use `@testing-library/react` for rendering
- Use `@testing-library/user-event` for interactions
- Mock API calls with MSW or jest mocks
- Test rendering with different props
- Test user interactions (click, type, submit)
- Test loading, error, and empty states
- Test conditional rendering based on roles

For **frontend hooks:**
- Create `{hook}.test.ts` alongside the hook
- Use `renderHook` from `@testing-library/react`
- Mock API responses
- Test success, loading, and error states
- Test cache invalidation behavior

**Step 3: Agent runs the tests**

```bash
pnpm --filter web test -- --testPathPattern="{test-file}"   # Run specific test
pnpm --filter api test:unit -- --testPathPattern="{test-file}"
```

All tests must pass. If tests fail, the agent fixes them before completing.

### Quality Checklist

- [ ] Every public method/component export has at least one test
- [ ] Happy path tested
- [ ] Error/edge cases tested
- [ ] Mocks are minimal (only mock what is necessary)
- [ ] Test descriptions are clear and describe behavior, not implementation
- [ ] No `any` types in test code
- [ ] Tests actually assert something meaningful (no empty tests)
- [ ] Tests pass independently (no order dependency)
- [ ] Tests run in under 10 seconds

---

## Workflow Comparison Matrix

| Aspect | A: Frontend Screen | B: Backend Module | C: Bug Fix | D: Refactor | E: Add Tests |
|--------|-------------------|-------------------|------------|-------------|--------------|
| **Input** | Design spec | Prisma models | Bug report | Monolithic file | Existing code |
| **Files created** | 3-8 | 6-10 | 1-3 modified | 4-8 | 1-5 |
| **Duration** | 10-20 min | 8-15 min | 3-10 min | 8-15 min | 5-10 min |
| **Key risk** | Visual quality | Tenant isolation | Incomplete fix | Lost functionality | False confidence |
| **Verification** | Visual review | Test suite | Regression test | Behavior parity | Test results |
| **Parallelizable** | Yes (with B) | Yes (with A) | Usually no | Usually no | Yes (with A/B) |
| **Requires human** | Visual check | API testing | Reproduction | Before/after compare | Coverage review |
