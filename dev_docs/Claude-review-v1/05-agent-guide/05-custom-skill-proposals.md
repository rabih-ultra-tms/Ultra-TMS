# Custom Skill Proposals

**Purpose:** Four proposed custom Claude Code skills specifically designed for Ultra TMS development workflows. Each skill automates a repeatable pattern that currently requires manual orchestration.

---

## Table of Contents

1. [Proposal 1: /tms-screen-builder](#proposal-1-tms-screen-builder)
2. [Proposal 2: /tms-module-scaffolder](#proposal-2-tms-module-scaffolder)
3. [Proposal 3: /tms-test-generator](#proposal-3-tms-test-generator)
4. [Proposal 4: /tms-design-validator](#proposal-4-tms-design-validator)
5. [Implementation Priority](#implementation-priority)
6. [Shared Infrastructure](#shared-infrastructure)

---

## Proposal 1: `/tms-screen-builder`

### Problem

Building a new screen from a 15-section design spec requires the developer to:
1. Read the entire spec manually
2. Identify which components already exist and which need building
3. Build components in the right order (primitives first, composed components second)
4. Create the page composition
5. Wire up data fetching hooks
6. Apply the correct status colors, role-based visibility, and form validation
7. Run quality checks

This process takes 15-30 minutes of agent interaction with manual guidance. A custom skill could automate the orchestration.

### Input Format

```
/tms-screen-builder --spec dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md
```

**Required arguments:**
- `--spec <path>` -- Path to the 15-section design spec file

**Optional arguments:**
- `--route <path>` -- Override the route path (default: inferred from spec file location)
- `--models <names>` -- Comma-separated Prisma model names (default: extracted from spec data fields section)
- `--pattern <path>` -- Path to an existing page to use as reference pattern
- `--skip-hooks` -- Build UI only, skip API hook generation (for when backend is not ready)
- `--mock-data` -- Generate mock data hooks instead of real API hooks

### What It Does (Phase by Phase)

**Phase 1: Spec Analysis (30 seconds)**
- Reads the design spec file
- Extracts: page layout structure, data fields, status states, role matrix, required components
- Reads the status color system from `00-global/03-status-color-system.md`
- Reads design principles from `00-global/01-design-principles.md`
- Identifies Prisma models needed from `schema.prisma`

**Phase 2: Component Inventory (15 seconds)**
- Scans `apps/web/components/ui/` for existing shadcn/ui primitives
- Scans `apps/web/components/` for existing custom components
- Compares against spec requirements
- Produces a build plan: "Need to create: 3 components. Can reuse: 5 components."

**Phase 3: Component Generation (2-5 minutes)**
For each missing component:
- Creates the component file with typed props interface
- Uses shadcn/ui primitives as building blocks
- Implements loading, error, and empty states
- Adds role-based conditional rendering where specified in spec
- Uses the correct status colors from the color system

**Phase 4: Page Composition (1-2 minutes)**
- Creates `apps/web/app/(dashboard)/{route}/page.tsx`
- Imports and composes all components
- Adds page metadata, breadcrumbs, and header
- Implements the layout grid from the spec wireframe
- Sets up URL-based filter state management

**Phase 5: Data Layer (1-2 minutes)**
- Creates React Query hooks in `apps/web/lib/hooks/use-{feature}.ts`
- Defines TypeScript types matching the Prisma models
- Implements pagination, sorting, and filtering
- Creates Zod validation schemas for forms
- Wires up form submission with `useMutation`

**Phase 6: Quality Verification (30 seconds)**
- Runs `pnpm check-types` (TypeScript compilation)
- Runs `pnpm lint` (ESLint)
- Checks Golden Rule compliance:
  - Every button has an `onClick` handler
  - Every link has an `href`
  - No `any` types
  - No `console.log` statements
  - Loading/error/empty states present

### Output

```
Files created:
  apps/web/app/(dashboard)/dispatch/page.tsx          (87 lines)
  apps/web/components/dispatch/DispatchTable.tsx       (145 lines)
  apps/web/components/dispatch/DispatchFilters.tsx     (92 lines)
  apps/web/components/dispatch/DispatchMap.tsx         (178 lines)
  apps/web/components/dispatch/DispatchHeader.tsx      (54 lines)
  apps/web/components/dispatch/index.ts                (5 lines)
  apps/web/lib/hooks/use-dispatch.ts                   (89 lines)
  apps/web/lib/types/dispatch.ts                       (43 lines)

Quality checks:
  TypeScript: PASS (0 errors)
  ESLint: PASS (0 warnings)
  Golden Rules: PASS (all 5 rules satisfied)

Components reused from existing: Button, Badge, DataTable, Card, Dialog
Components created new: DispatchTable, DispatchFilters, DispatchMap, DispatchHeader
```

### Implementation Approach

The skill is implemented as a Claude Code custom slash command (a markdown file in `.claude/commands/`):

```markdown
# /tms-screen-builder

## Instructions

You are building a complete TMS screen from a design specification.

### Phase 1: Read and analyze the spec
Read the file at $ARGUMENTS (the --spec path).
Also read:
- dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md
- dev_docs/12-Rabih-design-Process/00-global/01-design-principles.md

Extract from the spec:
- Section 3 (Wireframe) → page layout
- Section 5 (Data Fields) → types and form fields
- Section 6 (Components) → component inventory
- Section 7 (Status States) → status badge requirements
- Section 8 (Role Matrix) → conditional rendering rules

### Phase 2: Inventory existing components
[...structured instructions for each phase...]
```

### Estimated Development Time

- **Skill file creation:** 2-3 hours (writing the detailed prompt template)
- **Testing with 3 different specs:** 1-2 hours
- **Refinement based on output quality:** 1-2 hours
- **Total:** 4-7 hours

### Expected ROI

- **Without skill:** 15-30 minutes per screen with manual guidance
- **With skill:** 5-10 minutes per screen with a single command
- **Screens remaining:** 298+ placeholder specs to build
- **Time saved per screen:** ~10-20 minutes
- **Total time saved:** ~50-100 hours over the project lifetime

---

## Proposal 2: `/tms-module-scaffolder`

### Problem

Every new NestJS module follows the same pattern: module file, controller, service, DTOs (create, update, query, response), test files, and `app.module.ts` registration. The pattern is well-defined but requires reading the Prisma model, understanding relations, and generating boilerplate that follows Ultra TMS conventions (tenant filtering, soft deletes, guards, Swagger).

### Input Format

```
/tms-module-scaffolder --service carrier-portal --models CarrierPortalUser,CarrierPortalSession
```

**Required arguments:**
- `--service <name>` -- kebab-case service name (becomes the module directory name)
- `--models <names>` -- Comma-separated Prisma model names to scaffold CRUD for

**Optional arguments:**
- `--skip-tests` -- Skip test file generation
- `--skip-swagger` -- Skip Swagger decorator generation
- `--roles <roles>` -- Comma-separated roles that can access this module (default: ADMIN)
- `--prefix <path>` -- API route prefix override (default: `/api/v1/{service}`)
- `--relations` -- Include related entity endpoints (e.g., `GET /carriers/:id/documents`)

### What It Does (Phase by Phase)

**Phase 1: Schema Analysis (15 seconds)**
- Reads the specified Prisma models from `schema.prisma`
- Identifies all fields, types, relations, and enums
- Maps Prisma types to TypeScript types and `class-validator` decorators
- Identifies `tenantId`, `deletedAt`, and migration-first fields

**Phase 2: DTO Generation (1-2 minutes)**
For each model, generates:
- `create-{entity}.dto.ts` -- Required fields only, with validation decorators
- `update-{entity}.dto.ts` -- All fields optional via `PartialType(CreateDto)`
- `query-{entity}.dto.ts` -- Pagination (`page`, `limit`), sorting (`sortBy`, `sortOrder`), common filters
- `{entity}-response.dto.ts` -- Full entity shape with `@ApiProperty()` decorators

DTO conventions applied automatically:
- `@IsString()`, `@IsNumber()`, `@IsEnum()` based on Prisma types
- `@IsOptional()` for nullable fields
- `@ApiProperty({ description, example })` with meaningful examples
- `@Transform()` for query param type coercion
- Fields excluded: `id`, `tenantId`, `createdAt`, `updatedAt`, `deletedAt` (managed by system)

**Phase 3: Service Generation (1-2 minutes)**
Creates `{entity}.service.ts`:
- Constructor injects `PrismaService`
- `findAll(tenantId, queryDto)` -- Paginated list with filters, `where: { tenantId, deletedAt: null }`
- `findOne(tenantId, id)` -- Single record with tenant check, throws `NotFoundException`
- `create(tenantId, createDto)` -- Creates record with tenant assignment
- `update(tenantId, id, updateDto)` -- Updates after ownership verification
- `remove(tenantId, id)` -- Soft delete (sets `deletedAt: new Date()`)
- Includes relation loading for `findOne` based on Prisma model relations

**Phase 4: Controller Generation (1-2 minutes)**
Creates `{entity}.controller.ts`:
- `@Controller('api/v1/{entities}')` with plural, kebab-case path
- `@UseGuards(JwtAuthGuard, RolesGuard)` on every endpoint
- `@Roles()` with specified roles (or `ADMIN` default)
- Swagger decorators: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`
- Extracts `tenantId` from authenticated user via `@Req()`
- Standard CRUD endpoints following the API response format convention
- `@HttpCode(HttpStatus.OK)` on POST (convention)

**Phase 5: Module & Registration (30 seconds)**
- Creates `{entity}.module.ts` with providers and controllers
- Adds import to `apps/api/src/app.module.ts`

**Phase 6: Test Generation (1-2 minutes)**
Creates `{entity}.service.spec.ts`:
- Mocks `PrismaService`
- Tests every service method
- Tests tenant isolation (verifies `tenantId` in every query)
- Tests soft delete (verifies `deletedAt` is set, not hard deleted)
- Tests not-found scenarios

Creates `{entity}.controller.spec.ts`:
- Tests controller instantiation
- Tests endpoint routing
- Tests guard application

### Output

```
Files created:
  apps/api/src/modules/carrier-portal/carrier-portal.module.ts
  apps/api/src/modules/carrier-portal/carrier-portal.controller.ts
  apps/api/src/modules/carrier-portal/carrier-portal.service.ts
  apps/api/src/modules/carrier-portal/dto/create-carrier-portal-user.dto.ts
  apps/api/src/modules/carrier-portal/dto/update-carrier-portal-user.dto.ts
  apps/api/src/modules/carrier-portal/dto/query-carrier-portal-user.dto.ts
  apps/api/src/modules/carrier-portal/dto/carrier-portal-user-response.dto.ts
  apps/api/src/modules/carrier-portal/carrier-portal.service.spec.ts
  apps/api/src/modules/carrier-portal/carrier-portal.controller.spec.ts

Modified:
  apps/api/src/app.module.ts (added CarrierPortalModule import)

Quality checks:
  TypeScript: PASS
  Tests: 14 passing, 0 failing
```

### Implementation Approach

Custom slash command in `.claude/commands/tms-module-scaffolder.md` with structured prompt phases. The key intelligence is in the Prisma-to-DTO type mapping logic and the tenant-filtering pattern application.

### Estimated Development Time

- **Skill file creation:** 3-4 hours
- **Testing with 3 different module types:** 1-2 hours
- **Refinement:** 1-2 hours
- **Total:** 5-8 hours

### Expected ROI

- **Without skill:** 10-15 minutes per module with manual guidance
- **With skill:** 3-5 minutes per module
- **Modules remaining:** ~16 partially-implemented or unimplemented modules
- **Time saved per module:** ~8-10 minutes
- **Total time saved:** ~2-3 hours (lower ROI than screen builder, but still valuable for consistency)

---

## Proposal 3: `/tms-test-generator`

### Problem

The frontend has only 10 test files for 115+ components. The backend has ~100+ spec files but many modules have incomplete coverage. Writing tests manually is tedious, and agents write better tests when given structured guidance about what to test and how.

### Input Format

```
/tms-test-generator --file apps/api/src/modules/carrier/carrier.service.ts
```

**Required arguments:**
- `--file <path>` -- Path to the file to generate tests for

**Optional arguments:**
- `--type <unit|integration|e2e>` -- Test type (default: `unit`)
- `--coverage <methods>` -- Comma-separated method names to test (default: all public methods)
- `--pattern <path>` -- Path to an existing test file to use as style reference
- `--focus <area>` -- Focus area: `happy-path`, `edge-cases`, `error-handling`, `security`, `all` (default: `all`)

### What It Does (Phase by Phase)

**Phase 1: Code Analysis (30 seconds)**
- Reads the target file
- Identifies all public methods/exports
- Maps each method's parameters, return type, and dependencies
- Identifies injected services (constructor injection)
- Identifies branching logic (if/else, switch, try/catch, early returns)
- Counts the number of test cases needed

**Phase 2: Dependency Mapping (15 seconds)**
- Lists all imported dependencies
- Determines which need mocking (external services, database, HTTP)
- Identifies which can be used directly (utility functions, constants)
- Creates mock factory functions for each dependency

**Phase 3: Test Suite Generation (2-5 minutes)**

For **backend services**, generates:
- `describe` block for each public method
- `it('should ...')` for each behavior:
  - Happy path with valid input
  - Tenant isolation (ensures `tenantId` in queries)
  - Soft delete compliance (ensures `deletedAt: null` filter)
  - Not-found scenarios (throws `NotFoundException`)
  - Unauthorized scenarios (wrong tenant)
  - Validation edge cases (empty strings, null values, max lengths)
  - Pagination boundary cases (page 0, negative limit, very large page)

For **frontend components**, generates:
- Rendering tests (default props, minimal props, all props)
- Interaction tests (click handlers, form submissions, keyboard navigation)
- State tests (loading, error, empty, populated)
- Conditional rendering tests (role-based visibility, feature flags)
- Accessibility tests (ARIA labels, keyboard focus, screen reader text)

For **frontend hooks**, generates:
- Success state tests (data returned correctly)
- Loading state tests (isLoading flag behavior)
- Error state tests (API error handling)
- Refetch/invalidation tests
- Parameter change tests (re-fetches when params change)

**Phase 4: Test Execution (30 seconds - 2 minutes)**
- Runs the generated tests
- If any fail, analyzes the failure and fixes the test
- Repeats until all tests pass

**Phase 5: Coverage Report (15 seconds)**
- Reports which methods/branches are covered
- Identifies any untested paths
- Suggests additional tests for complete coverage

### Output

```
Test file created:
  apps/api/src/modules/carrier/carrier.service.spec.ts (287 lines)

Test results:
  carrier.service
    findAll
      ✓ should return paginated carriers for tenant (4ms)
      ✓ should filter by status (3ms)
      ✓ should exclude soft-deleted records (2ms)
      ✓ should sort by specified field (3ms)
      ✓ should default to page 1, limit 10 (2ms)
    findOne
      ✓ should return carrier by id for tenant (2ms)
      ✓ should throw NotFoundException for non-existent carrier (3ms)
      ✓ should throw NotFoundException for carrier in different tenant (2ms)
      ✓ should include relations (3ms)
    create
      ✓ should create carrier with tenant id (3ms)
      ✓ should set migration-first fields (2ms)
    update
      ✓ should update carrier fields (3ms)
      ✓ should throw NotFoundException for wrong tenant (2ms)
    remove
      ✓ should soft-delete carrier (2ms)
      ✓ should not hard delete (3ms)

  15 passing (38ms)

Coverage: 94% statements, 89% branches
Untested: error handling in create() when database constraint fails
```

### Implementation Approach

Custom slash command with type-aware test generation. The key intelligence is in the pattern recognition: identifying which testing patterns apply to each code pattern (service methods get tenant isolation tests, components get state variation tests, hooks get cache behavior tests).

### Estimated Development Time

- **Skill file creation:** 4-5 hours (most complex skill -- needs patterns for services, components, and hooks)
- **Testing across all three code types:** 2-3 hours
- **Refinement:** 2-3 hours
- **Total:** 8-11 hours

### Expected ROI

- **Without skill:** 8-15 minutes per file with manual guidance
- **With skill:** 3-5 minutes per file
- **Files needing tests:** 100+ frontend components + ~20 backend services with gaps
- **Time saved per file:** ~8-10 minutes
- **Total time saved:** ~15-20 hours

---

## Proposal 4: `/tms-design-validator`

### Problem

After building a screen from a design spec, there is no automated way to verify that the implementation matches the spec. Currently, validation requires a human to manually compare the spec document against the rendered output, checking data fields, status states, role-based visibility, component usage, and layout.

### Input Format

```
/tms-design-validator --impl apps/web/app/(dashboard)/dispatch/page.tsx --spec dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md
```

**Required arguments:**
- `--impl <path>` -- Path to the implemented page file (or directory)
- `--spec <path>` -- Path to the design spec file

**Optional arguments:**
- `--strict` -- Fail on any discrepancy (default: report warnings for minor issues)
- `--fix` -- Automatically fix discrepancies where possible
- `--report <path>` -- Save validation report to a file

### What It Does (Phase by Phase)

**Phase 1: Spec Parsing (30 seconds)**
Reads the design spec and extracts structured data:
- **Data fields** (Section 5): Field name, type, required/optional, display format
- **Components** (Section 6): Expected component types and their props
- **Status states** (Section 7): All status values and their display colors
- **Role matrix** (Section 8): Which roles see which elements
- **Actions** (Section 9): All buttons, links, and interactive elements
- **Wireframe layout** (Section 3): Expected page structure

**Phase 2: Implementation Analysis (30 seconds)**
Reads the implemented files and extracts:
- All rendered data fields (from JSX)
- All components used (from imports and JSX)
- Status handling (from conditional rendering and Badge components)
- Role-based rendering (from conditional logic checking user roles)
- Interactive elements (buttons with onClick, links with href, forms with onSubmit)
- Page layout structure

**Phase 3: Comparison (1-2 minutes)**
Compares spec expectations against implementation, checking:

| Check | What It Verifies |
|-------|------------------|
| **Data field coverage** | Every field in the spec appears in the rendered output |
| **Data field types** | Fields are formatted correctly (dates, currencies, percentages) |
| **Status handling** | Every status value from the spec has a corresponding rendering case |
| **Status colors** | Color values match the status color system |
| **Role visibility** | Role-conditional rendering matches the spec's access matrix |
| **Component presence** | All required components from the spec are present |
| **Action handlers** | Every action in the spec has a working handler (Golden Rule 1) |
| **Empty state** | Empty state is handled when no data exists |
| **Loading state** | Loading state is handled while data is being fetched |
| **Error state** | Error state is handled when API calls fail |
| **Form validation** | Required fields from the spec have validation rules |

**Phase 4: Report Generation (15 seconds)**

### Output

```
Design Validation Report
========================
Spec: dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md
Impl: apps/web/app/(dashboard)/dispatch/page.tsx

Score: 87/100

PASS (23 checks)
  ✓ Data field: loadNumber - present and correctly formatted
  ✓ Data field: origin - present
  ✓ Data field: destination - present
  ✓ Status: "In Transit" - rendered with correct color (#3B82F6)
  ✓ Status: "Delivered" - rendered with correct color (#22C55E)
  ✓ Action: "Assign Driver" button - has onClick handler
  ✓ Action: "Update Status" button - has onClick handler
  ✓ Empty state - handled with EmptyState component
  ✓ Loading state - handled with Skeleton components
  ...

FAIL (2 checks)
  ✗ Data field: estimatedDeliveryDate - MISSING from rendered output
    Fix: Add <TableCell>{format(load.estimatedDeliveryDate, 'MMM dd')}</TableCell>
    to the DispatchTable component at line 67

  ✗ Role visibility: "Delete" button should be hidden for DISPATCHER role
    Fix: Wrap the Delete button in <RoleGuard roles={[RoleEnum.ADMIN, RoleEnum.MANAGER]}>

WARN (3 checks)
  ⚠ Status: "Cancelled" - color is #6B7280 (spec says #EF4444)
    Suggestion: Update the StatusBadge variant for "Cancelled"

  ⚠ Data field: weight - present but not formatted as spec requires (should show "lbs" suffix)
    Suggestion: Use formatWeight(load.weight) helper

  ⚠ Component: FilterBar - spec calls for date range filter, implementation has text search only
    Suggestion: Add DateRangePicker to the FilterBar component
```

### Implementation Approach

Custom slash command that performs structured comparison. The core logic is:
1. Parse the spec's markdown sections into structured data (field lists, status maps, role matrices)
2. Parse the implementation's JSX/TSX into a component tree (identify rendered fields, conditional logic, event handlers)
3. Cross-reference the two data sets and report discrepancies

This is the most analytically complex skill because it requires understanding both markdown spec format and React component structure.

### Estimated Development Time

- **Skill file creation:** 5-6 hours (complex spec parsing + JSX analysis)
- **Testing with 5 different spec/implementation pairs:** 2-3 hours
- **Refinement for edge cases:** 2-3 hours
- **Total:** 9-12 hours

### Expected ROI

- **Without skill:** 10-20 minutes of manual comparison per screen
- **With skill:** 2-3 minutes automated validation
- **Screens to validate:** 89 detailed specs (and growing)
- **Time saved per screen:** ~10-15 minutes
- **Total time saved:** ~15-22 hours
- **Quality improvement:** Catches missing fields and incorrect colors that humans miss

---

## Implementation Priority

| Priority | Skill | Dev Time | ROI | Rationale |
|----------|-------|----------|-----|-----------|
| **1** | `/tms-screen-builder` | 4-7 hours | ~50-100 hours saved | Highest volume task (298+ screens). Biggest time savings per use. |
| **2** | `/tms-test-generator` | 8-11 hours | ~15-20 hours saved | Addresses the largest quality gap (10 test files for 115+ components). |
| **3** | `/tms-design-validator` | 9-12 hours | ~15-22 hours saved | Quality assurance for screen builder output. Catches regressions. |
| **4** | `/tms-module-scaffolder` | 5-8 hours | ~2-3 hours saved | Lowest ROI because fewer modules remain, but ensures consistency. |

### Recommended Sequence

1. Build `/tms-screen-builder` first -- it has the highest ROI and establishes the pattern for other skills
2. Build `/tms-test-generator` second -- it can immediately generate tests for screens built by the screen builder
3. Build `/tms-design-validator` third -- it validates output from the screen builder
4. Build `/tms-module-scaffolder` last -- it has the lowest ROI but completes the toolkit

---

## Shared Infrastructure

All four skills share common needs that should be built once:

### Spec Parser Module

A reusable prompt section that teaches the agent how to parse the 15-section design spec format. Used by `/tms-screen-builder` and `/tms-design-validator`.

### Prisma Model Extractor

A reusable prompt section that teaches the agent how to read specific models from `schema.prisma` and map Prisma types to TypeScript types and validation decorators. Used by `/tms-screen-builder` and `/tms-module-scaffolder`.

### Quality Checker

A reusable prompt section that runs the standard quality checks (TypeScript compilation, ESLint, Golden Rules). Used by all four skills.

### Implementation Location

All skills would be implemented as files in `.claude/commands/`:

```
.claude/
  commands/
    tms-screen-builder.md
    tms-module-scaffolder.md
    tms-test-generator.md
    tms-design-validator.md
  shared/
    spec-parser-prompt.md        (included by reference)
    prisma-extractor-prompt.md   (included by reference)
    quality-checker-prompt.md    (included by reference)
```

Each command file is a structured markdown document with phase-by-phase instructions that Claude Code executes sequentially.
