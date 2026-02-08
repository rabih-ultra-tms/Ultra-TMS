# Session Templates

**Purpose:** Copy-paste prompt templates for common Ultra TMS development sessions. Each template includes the full prompt text, context files to reference, expected output, and quality criteria.

**Usage:** Copy the prompt text in the fenced block, replace the `{PLACEHOLDERS}` with your actual values, and paste into a new Claude Code session.

---

## Table of Contents

1. [Template A: Build TMS Core Screen X](#template-a-build-tms-core-screen-x)
2. [Template B: Build Backend Module Y](#template-b-build-backend-module-y)
3. [Template C: Fix Bug Z](#template-c-fix-bug-z)
4. [Template D: Add Tests for Module W](#template-d-add-tests-for-module-w)
5. [Template E: Refactor Page into Components](#template-e-refactor-page-into-components)
6. [Template F: Design Review Session](#template-f-design-review-session)
7. [Template G: Weekly Planning Session](#template-g-weekly-planning-session)

---

## Template A: Build TMS Core Screen X

**When:** Building a new frontend page from a design specification.
**Expected duration:** 10-20 minutes.
**Expected output:** 3-8 new files (page, components, hooks, types).

### Prompt

```
Build the {SCREEN_NAME} page from the design spec.

Read this design spec first:
  dev_docs/12-Rabih-design-Process/{SERVICE_FOLDER}/{SPEC_FILE}.md

Also reference:
  dev_docs/12-Rabih-design-Process/00-global/01-design-principles.md
  dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md

Follow the pattern established in:
  apps/web/app/(dashboard)/{EXAMPLE_PAGE}/page.tsx

The page route should be:
  apps/web/app/(dashboard)/{ROUTE}/page.tsx

Prisma models to reference: {MODEL_1}, {MODEL_2}
(Read these from apps/api/prisma/schema.prisma)

Requirements:
1. Build any missing components in apps/web/components/{FEATURE}/
2. Use existing shadcn/ui components from apps/web/components/ui/ wherever possible
3. Create React Query hooks in apps/web/lib/hooks/use-{FEATURE}.ts
4. Create TypeScript types in apps/web/lib/types/{FEATURE}.ts
5. Wire up to API endpoints at /api/v1/{ENDPOINT}
6. Handle loading, error, and empty states
7. Apply role-based visibility from the spec's role matrix
8. Use correct status colors from the color system

After building, run:
  pnpm check-types
  pnpm lint

Every button must have an onClick handler. Every link must have an href.
No any types. No console.log statements.
```

### Placeholder Reference

| Placeholder | Example | Where to Find |
|-------------|---------|---------------|
| `{SCREEN_NAME}` | Dispatch Board | The spec file title |
| `{SERVICE_FOLDER}` | 04-tms-core | The design doc folder |
| `{SPEC_FILE}` | 08-dispatch-board | The spec file name without `.md` |
| `{EXAMPLE_PAGE}` | carriers | Any well-built existing page |
| `{ROUTE}` | dispatch | The URL path segment |
| `{MODEL_1}` | Load | Prisma model names from schema |
| `{FEATURE}` | dispatch | kebab-case feature name |
| `{ENDPOINT}` | loads | Plural kebab-case resource name |

### Expected Context Files Read by Agent

The agent will automatically read:
1. `CLAUDE.md` (project conventions)
2. The design spec file
3. The design principles and status color files
4. The example page for pattern reference
5. Relevant Prisma models from schema
6. Existing components in `components/ui/`

### Quality Criteria

- [ ] Page renders without TypeScript errors
- [ ] All data fields from the spec are present in the UI
- [ ] Status badges use the correct colors
- [ ] All interactive elements have handlers
- [ ] Loading skeleton appears while data loads
- [ ] Error state shows retry option
- [ ] Empty state shows helpful message
- [ ] Role-based elements are conditionally rendered
- [ ] ESLint passes with zero warnings

---

## Template B: Build Backend Module Y

**When:** Creating a new NestJS module with CRUD endpoints.
**Expected duration:** 8-15 minutes.
**Expected output:** 6-10 new files.

### Prompt

```
Build the {MODULE_NAME} NestJS module.

Read these Prisma models from apps/api/prisma/schema.prisma:
  {MODEL_1}, {MODEL_2}

Follow the pattern in:
  apps/api/src/modules/{EXAMPLE_MODULE}/

Create the module at:
  apps/api/src/modules/{MODULE_DIR}/

Generate these files:
1. {module-name}.module.ts - NestJS module definition
2. {module-name}.controller.ts - REST endpoints at /api/v1/{ENDPOINT}
3. {module-name}.service.ts - Business logic with Prisma queries
4. dto/create-{entity}.dto.ts - Creation DTO with class-validator decorators
5. dto/update-{entity}.dto.ts - Update DTO (PartialType of create)
6. dto/query-{entity}.dto.ts - Pagination + filter query params
7. dto/{entity}-response.dto.ts - Response shape with Swagger decorators
8. {module-name}.service.spec.ts - Unit tests for service
9. {module-name}.controller.spec.ts - Unit tests for controller

Mandatory patterns (from CLAUDE.md):
- Every query must filter by tenantId
- Every query must filter by deletedAt: null
- Every endpoint must use @UseGuards(JwtAuthGuard, RolesGuard)
- Every endpoint must have @Roles({ROLES})
- Response format: { data: T } or { data: T[], pagination: {...} }
- All DTOs must have @ApiProperty() for Swagger
- Soft delete only (set deletedAt, never hard delete)
- Include migration-first fields: externalId, sourceSystem, customFields

After building:
- Register the module in apps/api/src/app.module.ts
- Run: pnpm check-types
- Run: pnpm --filter api test:unit

Roles for this module: {ROLE_LIST}
```

### Placeholder Reference

| Placeholder | Example | Where to Find |
|-------------|---------|---------------|
| `{MODULE_NAME}` | Carrier Portal | Human-readable name |
| `{MODULE_DIR}` | carrier-portal | kebab-case directory name |
| `{MODEL_1}` | CarrierPortalUser | Prisma model name |
| `{EXAMPLE_MODULE}` | carrier | Existing module to follow |
| `{ENDPOINT}` | carrier-portal-users | Plural kebab-case route |
| `{ROLES}` | ADMIN, CARRIER | NestJS roles |
| `{ROLE_LIST}` | RoleEnum.ADMIN, RoleEnum.CARRIER | TypeScript role enums |

### Quality Criteria

- [ ] TypeScript compiles with zero errors
- [ ] All unit tests pass
- [ ] Every query includes `tenantId` filter
- [ ] Every query includes `deletedAt: null`
- [ ] All endpoints have auth guards
- [ ] All DTOs have Swagger decorators
- [ ] Module registered in `app.module.ts`
- [ ] Response format follows the standard

---

## Template C: Fix Bug Z

**When:** Investigating and fixing a specific bug.
**Expected duration:** 3-10 minutes.
**Expected output:** 1-3 modified files + 1 regression test.

### Prompt

```
Fix this bug:

## Bug Description
{DESCRIPTION_OF_WHAT_HAPPENS}

## Expected Behavior
{WHAT_SHOULD_HAPPEN_INSTEAD}

## Reproduction Steps
1. {STEP_1}
2. {STEP_2}
3. {STEP_3}

## Error Messages
```
{PASTE_ERROR_MESSAGES_OR_CONSOLE_OUTPUT}
```

## Suspected Location
{FILE_PATH_IF_KNOWN} (or "unknown - please investigate")

## Requirements
1. Find the root cause (not just the symptom)
2. Implement the fix
3. Add a regression test that:
   - Reproduces the exact bug scenario
   - Verifies the fix resolves it
   - Prevents the bug from recurring
4. Run: pnpm check-types
5. Run: pnpm --filter {APP} test
6. Verify no other tests broke
```

### Placeholder Reference

| Placeholder | Example |
|-------------|---------|
| `{DESCRIPTION_OF_WHAT_HAPPENS}` | "Clicking 'Add Carrier' shows a 500 error toast. The carrier is not created." |
| `{WHAT_SHOULD_HAPPEN_INSTEAD}` | "The carrier should be created and appear in the list. A success toast should show." |
| `{STEP_1}` | "Navigate to /carriers" |
| `{STEP_2}` | "Click 'Add Carrier' button" |
| `{STEP_3}` | "Fill in the form and click 'Save'" |
| `{FILE_PATH_IF_KNOWN}` | "apps/api/src/modules/carrier/carrier.service.ts" |
| `{APP}` | "api" or "web" |

### Quality Criteria

- [ ] Root cause identified and explained in the response
- [ ] Fix addresses root cause (not a workaround)
- [ ] Regression test added and passing
- [ ] All existing tests still pass
- [ ] No new `any` types introduced
- [ ] Fix commit message explains what was wrong and why

---

## Template D: Add Tests for Module W

**When:** Adding test coverage to existing, untested code.
**Expected duration:** 5-10 minutes per file.
**Expected output:** 1-5 test files.

### Prompt

```
Add comprehensive tests for:
  {FILE_PATH}

Follow the test patterns in:
  {EXAMPLE_TEST_PATH}

Test framework:
  {FRAMEWORK_DETAILS}

Generate tests covering:
1. Happy path for every public method/export
2. Error handling (invalid input, not found, unauthorized)
3. Edge cases (empty arrays, null values, boundary values)
4. For backend services:
   - Tenant isolation (tenantId always in queries)
   - Soft delete compliance (deletedAt: null filter)
   - Pagination boundaries
5. For frontend components:
   - Rendering with different prop combinations
   - User interactions (click, type, submit)
   - Loading, error, and empty states
   - Role-based conditional rendering
6. For frontend hooks:
   - Success, loading, and error states
   - Cache invalidation
   - Parameter change re-fetching

After writing tests, run them:
  {TEST_COMMAND}

All tests must pass. Fix any failures before completing.
Report the final count: X tests passing, Y assertions.
```

### Placeholder Reference

| Placeholder | Example |
|-------------|---------|
| `{FILE_PATH}` | `apps/api/src/modules/carrier/carrier.service.ts` |
| `{EXAMPLE_TEST_PATH}` | `apps/api/src/modules/auth/auth.service.spec.ts` |
| `{FRAMEWORK_DETAILS}` | "Jest 29 + Supertest for API" or "Jest 30 + Testing Library + MSW for Web" |
| `{TEST_COMMAND}` | `pnpm --filter api test:unit -- --testPathPattern="carrier.service"` |

### Quality Criteria

- [ ] Every public method has at least one test
- [ ] Happy path, error path, and edge cases covered
- [ ] Mocks are minimal and focused
- [ ] Test descriptions describe behavior (not implementation)
- [ ] All tests pass independently (no order dependency)
- [ ] No `any` types in test code
- [ ] Tests run in under 10 seconds

---

## Template E: Refactor Page into Components

**When:** Breaking a monolithic page file (300+ lines) into proper component architecture.
**Expected duration:** 8-15 minutes.
**Expected output:** 4-8 new files, 1 significantly reduced file.

### Prompt

```
Refactor this monolithic page into proper components:
  {PAGE_PATH}

This file is {LINE_COUNT} lines and mixes:
- Page layout
- Data fetching
- State management
- Form handling
- Table rendering
- Modal/dialog content

Target structure:
  {FEATURE}/
    page.tsx              (< 100 lines - composition only)
    components/
      {Feature}Table.tsx
      {Feature}Filters.tsx
      {Feature}Form.tsx
      {Feature}Header.tsx
      {Feature}Stats.tsx
      index.ts             (barrel export)
    hooks/
      use-{feature}.ts     (React Query hooks)
      use-{feature}-filters.ts (filter state)

Follow the component patterns in:
  {EXAMPLE_COMPONENT_DIR}

Rules:
1. This is a PURE REFACTOR - no behavior changes
2. Every component gets a typed props interface
3. Each component should be independently testable
4. The page.tsx file should only import, compose, and lay out components
5. Data fetching logic moves to hooks
6. Form logic moves to the form component
7. Table column definitions move to the table component

After refactoring:
  pnpm check-types (must pass - refactoring should not change types)
  pnpm lint (must pass)

Verify: the refactored code produces identical behavior to the original.
No features added. No features removed.
```

### Placeholder Reference

| Placeholder | Example |
|-------------|---------|
| `{PAGE_PATH}` | `apps/web/app/(dashboard)/carriers/page.tsx` |
| `{LINE_COUNT}` | 858 |
| `{FEATURE}` | carriers |
| `{Feature}` | Carrier (PascalCase) |
| `{feature}` | carrier (camelCase) |
| `{EXAMPLE_COMPONENT_DIR}` | `apps/web/components/crm/` |

### Quality Criteria

- [ ] Original page is now under 100 lines
- [ ] Each extracted component is under 200 lines
- [ ] Each component has a typed props interface
- [ ] No functionality was lost
- [ ] No new functionality was added
- [ ] TypeScript compiles with zero errors
- [ ] All existing tests still pass
- [ ] All imports resolve correctly

---

## Template F: Design Review Session

**When:** Reviewing an implemented screen against its design spec and identifying improvements.
**Expected duration:** 10-15 minutes.
**Expected output:** A review report with specific improvement suggestions.

### Prompt

```
Review the implementation of {SCREEN_NAME} against its design spec.

Implementation files:
  {IMPL_PAGE_PATH}
  {IMPL_COMPONENTS_DIR} (if applicable)

Design spec:
  dev_docs/12-Rabih-design-Process/{SERVICE_FOLDER}/{SPEC_FILE}.md

Also reference:
  dev_docs/12-Rabih-design-Process/00-global/01-design-principles.md
  dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md

Perform these checks:

1. DATA FIELD COVERAGE
   - Compare every field in Section 5 (Data Fields) of the spec
   - Report any fields in the spec that are missing from the implementation
   - Report any fields in the implementation not in the spec

2. STATUS HANDLING
   - Compare every status in Section 7 (Status States) of the spec
   - Verify status badge colors match the status color system
   - Check that every status transition is handled

3. ROLE-BASED VISIBILITY
   - Compare the role matrix in Section 8 against conditional rendering
   - Report any elements visible to roles that should not see them
   - Report any elements hidden from roles that should see them

4. INTERACTIVE ELEMENTS
   - Verify every button in the spec has an onClick handler
   - Verify every link has an href
   - Check that form validation matches required/optional from spec

5. STATE HANDLING
   - Loading state present and appropriate
   - Error state with retry option
   - Empty state with helpful message

6. COMPONENT QUALITY
   - Check for any types
   - Check for console.log statements
   - Check for TODO/FIXME comments
   - Verify proper TypeScript types

Output a structured report with:
- PASS items (what matches the spec)
- FAIL items (what does not match, with specific fix instructions)
- WARN items (minor issues or improvements)
- Overall score (X/Y checks passed)
```

### Placeholder Reference

| Placeholder | Example |
|-------------|---------|
| `{SCREEN_NAME}` | Dispatch Board |
| `{IMPL_PAGE_PATH}` | `apps/web/app/(dashboard)/dispatch/page.tsx` |
| `{IMPL_COMPONENTS_DIR}` | `apps/web/components/dispatch/` |
| `{SERVICE_FOLDER}` | 04-tms-core |
| `{SPEC_FILE}` | 08-dispatch-board |

### Quality Criteria for the Review

- [ ] Every field in the spec was checked
- [ ] Every status was verified against the color system
- [ ] Every role combination was checked
- [ ] Every interactive element was verified
- [ ] Fix instructions are specific (file, line, exact change)
- [ ] Report is actionable (not vague suggestions)

---

## Template G: Weekly Planning Session

**When:** At the start of each week, to plan the week's development priorities.
**Expected duration:** 15-20 minutes.
**Expected output:** Prioritized task list for the week.

### Prompt

```
Help me plan this week's Ultra TMS development.

Read the current state:
1. dev_docs/weekly-reports/work-log.md (recent session entries)
2. dev_docs/Claude-review-v1/01-code-review/05-bug-inventory.md (open bugs)
3. dev_docs/Claude-review-v1/01-code-review/06-tech-debt-catalog.md (tech debt)
4. dev_docs/Claude-review-v1/06-gap-analysis/03-missing-features.md (feature gaps)

Context:
- Last week's focus: {LAST_WEEK_SUMMARY}
- This week's priority area: {PRIORITY_AREA}
- Available development time: {HOURS} hours
- Team capacity: {CAPACITY_DESCRIPTION}

Generate a weekly plan with:

1. TOP 3 PRIORITIES
   For each: what to build, which files to change, estimated time, and why it matters.

2. BUG FIXES (if any critical bugs exist)
   Specific bugs from the bug inventory that should be fixed this week.

3. TECH DEBT (if time permits)
   One or two tech debt items that would improve velocity next week.

4. AGENT SESSION PLAN
   Break the priorities into specific agent sessions:
   - Session 1: {description} (~{time} min)
   - Session 2: {description} (~{time} min)
   - ...
   Each session should be feature-sized (one page or one module).

5. PARALLEL OPPORTUNITIES
   Identify sessions that can run in parallel (non-overlapping files).

6. RISK ASSESSMENT
   What might block progress? Dependencies, unknowns, or decision points.

Format as a markdown checklist that I can track through the week.
```

### Placeholder Reference

| Placeholder | Example |
|-------------|---------|
| `{LAST_WEEK_SUMMARY}` | "Built the carrier management module (backend + frontend). Fixed 3 CRM bugs." |
| `{PRIORITY_AREA}` | "TMS Core - Load Management and Dispatch" |
| `{HOURS}` | 20 |
| `{CAPACITY_DESCRIPTION}` | "Solo developer, 4 hours/day, 5 days" |

### Quality Criteria

- [ ] Priorities are specific and achievable within the time budget
- [ ] Each session has clear completion criteria
- [ ] Dependencies between sessions are identified
- [ ] Parallel opportunities are correctly identified (no file conflicts)
- [ ] Risk assessment is realistic, not generic

---

## Template Tips

### Customizing Templates

These templates are starting points. Customize them for your specific situation:

- **Remove sections you do not need** -- If the bug location is obvious, remove "please investigate" and provide the file path directly.
- **Add project-specific context** -- If you have been working on a feature across multiple sessions, add a brief summary of what was done in previous sessions.
- **Specify constraints** -- If there are patterns you want followed or avoided, state them explicitly.

### Chaining Templates

For large features, chain templates in sequence:

1. **Template G** (Weekly Planning) -- Plan the week
2. **Template B** (Backend Module) -- Build the API first
3. **Template A** (Frontend Screen) -- Build the UI second
4. **Template D** (Add Tests) -- Add test coverage
5. **Template F** (Design Review) -- Validate against spec

### Session Boundaries

Start a new Claude Code session when:

- You finish one template and move to the next
- The conversation exceeds 20+ exchanges
- You switch between unrelated tasks
- The agent seems to be losing context or repeating itself

Between sessions, the `CLAUDE.md` file and work log provide continuity. The agent reads these at the start of every session.

### Recording What You Did

After every session, update the work log. You can ask the agent:

```
Update dev_docs/weekly-reports/work-log.md with what we did in this session.
Add the entry before the <!-- NEXT SESSION ENTRY GOES HERE --> comment.
Include: date, files changed, what was built, and any issues encountered.
```
