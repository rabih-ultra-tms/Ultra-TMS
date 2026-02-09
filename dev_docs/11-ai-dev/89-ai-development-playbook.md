# 84 - AI Development Playbook

**How to effectively use Claude Code for 3PL Platform development**

> **UPDATED Feb 2026:** Added Backend-First Discovery, Design-to-Code Workflow, and Quality Gates sections. MVP scope is 8 services / ~30 screens / 16 weeks. See `00-MVP-PROMPTS-INDEX.md` for which prompts are in scope.

---

## Purpose

This playbook ensures Claude Code (or any AI assistant) can efficiently build features for the 3PL platform. It provides:

- Context that should ALWAYS be provided
- Prompt templates for common tasks
- Decision trees for complex situations
- Verification steps

---

## Backend-First Discovery (NEW — ALWAYS DO THIS)

The Gemini Review (Feb 2026) found that backend services exist but are disconnected from the frontend. **Before building anything, check if the backend already exists.**

### Step 1: Check for existing backend service

```bash
# Search for the service class
grep -r "class.*Service" apps/api/src/modules/{service-name}/

# Check file sizes (large files = substantial implementation)
ls -la apps/api/src/modules/{service-name}/*.service.ts
```

### Step 2: If backend EXISTS → Wire it up, don't rebuild

```
1. Read the service file — understand all methods
2. Read the controller — understand all endpoints
3. Read the DTOs — understand request/response shapes
4. Build frontend hooks that call the existing endpoints
5. Build UI components that use those hooks
```

### Step 3: If backend does NOT exist → Build API first

```
1. Check schema.prisma for the data model
2. Create service with CRUD methods
3. Create controller with REST endpoints
4. Create DTOs with Zod/class-validator
5. Test endpoints with curl
6. THEN build frontend
```

### Known Backend Services (DO NOT REBUILD)

| Service | Location | Methods |
|---------|----------|---------|
| LoadsService (19KB) | `apps/api/src/modules/load/` | Full CRUD, status mgmt, filtering, pagination |
| OrdersService (22KB) | `apps/api/src/modules/order/` | Full CRUD, multi-stop, status workflow |
| RateConfirmationService | `apps/api/src/modules/rate-confirmation/` | PDF generation |
| Check Calls | `apps/api/src/modules/check-call/` | Fully implemented |
| Dispatch (assignCarrier) | Inside LoadsService | Carrier assignment logic |

---

## Design-to-Code Workflow (NEW)

Every screen must go through this pipeline. Reference: `Claude-review-v1/04-screen-integration/01-design-to-code-workflow.md`

```
1. READ design spec  → dev_docs/12-Rabih-design-Process/{service}/{screen}.md
2. CHECK priority    → Claude-review-v1/04-screen-integration/03-screen-priority-matrix.md
3. CHECK backend     → Does the API exist? (see Backend-First Discovery above)
4. BUILD             → Follow the design spec's component inventory and data fields
5. VERIFY            → Run through quality gates (see below)
```

### Design Spec Structure (each screen file has 15 sections)

1. Purpose & context
2. ASCII wireframe layout
3. Component inventory (shadcn/ui components to use)
4. Data field mappings (API field → UI label)
5. Status state machine (all valid transitions)
6. Role-based feature matrix (who sees what)
7. Real-time WebSocket events
8. Bulk operations
9. Keyboard shortcuts
10. Empty/error/loading states
11. Print/export layouts
12. Responsive breakpoints
13. Accessibility requirements
14. Stitch design prompt
15. Implementation notes

---

## Quality Gates (NEW)

Before shipping ANY screen, verify all 4 levels pass. Reference: `Claude-review-v1/03-design-strategy/05-quality-gates.md`

| Gate | Check | Fail = Block? |
|------|-------|---------------|
| **L1: Functional** | All buttons work, no `onClick={() => {}}`, no `window.confirm()`, no bare "Loading..." | Yes |
| **L2: Data** | Real API data (not mocked), proper loading/error/empty states, pagination works | Yes |
| **L3: Design** | Uses design tokens (not hardcoded colors), follows spec layout, responsive | Yes |
| **L4: Polish** | Animations, keyboard shortcuts, print layout, accessibility | No (nice-to-have) |

### Anti-Patterns to Check For

```bash
# Find hardcoded colors (should use design tokens)
grep -rn "text-red-\|text-green-\|text-yellow-\|bg-red-\|bg-green-" apps/web/app/ --include="*.tsx"

# Find window.confirm (should use dialog component)
grep -rn "window.confirm" apps/web/ --include="*.tsx"

# Find bare loading text (should use skeleton/spinner)
grep -rn '"Loading..."' apps/web/ --include="*.tsx"

# Find empty handlers (should have real logic)
grep -rn "onClick={() => {}}" apps/web/ --include="*.tsx"
```

---

## ðŸŽ¯ The Golden Prompt Formula

Every development request should include:

```
[TASK TYPE] + [ENTITY/SCREEN] + [CONTEXT DOCS] + [SPECIFIC REQUIREMENTS]
```

### Example:

```
BUILD the Carrier List screen (05.01 in doc 72).

CONTEXT:
- Screen-API Registry: doc 72, section 05.01
- Entity fields: doc 86, Carrier entity
- Business rules: doc 87, Carrier section
- UI patterns: doc 65

REQUIREMENTS:
- Follow List Page template from doc 64
- Include filters: status, insurance expiry, MC number
- Actions: View, Edit, Deactivate
- Must handle 1000+ carriers with pagination
```

---

## ðŸ“‹ Pre-Task Checklist (AI Must Complete)

Before writing ANY code, Claude Code should:

```markdown
## Pre-Implementation Checklist

### 1. Understand the Request

- [ ] What screen/feature is being built?
- [ ] What doc 72 section applies?
- [ ] What entities are involved?

### 2. Gather Context

- [ ] Read Screen-API contract (doc 72)
- [ ] Read Entity Data Dictionary (doc 86) for fields
- [ ] Read Business Rules (doc 87) for validations
- [ ] Check dependencies in Service Graph (doc 90)

### 3. Verify Prerequisites

- [ ] Database tables exist? (check schema.prisma)
- [ ] API endpoints exist? (check controllers)
- [ ] Required services built?

### 4. Plan Implementation

- [ ] List all files to create/modify
- [ ] List all API endpoints needed
- [ ] List all UI components needed
```

---

## ðŸ”§ Task Templates

### Template 1: Build a New Screen

```markdown
## Task: Build [SCREEN NAME] Screen

### Screen Reference

- Doc 72 Section: [XX.XX]
- Route: /[path]
- Access: [ROLES]

### Required APIs

From doc 72:

- GET /api/v1/[entity] - List with pagination
- GET /api/v1/[entity]/:id - Single item
- POST /api/v1/[entity] - Create
- PUT /api/v1/[entity]/:id - Update
- DELETE /api/v1/[entity]/:id - Delete

### Entity Fields (from doc 86)

[List key fields]

### Business Rules (from doc 87)

[List applicable rules]

### UI Requirements

- Page type: [List | Detail | Form | Dashboard]
- Use template from doc 64
- Follow UI standards from doc 65

### Deliverables

1. [ ] Frontend page component
2. [ ] API integration hooks
3. [ ] Type definitions
4. [ ] Update doc 72 status checkboxes
```

### Template 2: Build an API Endpoint

````markdown
## Task: Build [ENDPOINT] API

### Endpoint Reference

- Method: [GET|POST|PUT|DELETE]
- Path: /api/v1/[path]
- Auth: Required
- Roles: [ROLES]

### Request Schema

```json
{
  "field1": "type",
  "field2": "type"
}
```
````

### Response Schema

```json
{
  "data": { ... },
  "pagination": { ... }  // if list
}
```

### Business Rules (from doc 87)

[List validations]

### Database Operations

- Tables: [list]
- Include tenant filtering: YES
- Include soft delete check: YES

### Deliverables

1. [ ] Controller method
2. [ ] Service method
3. [ ] DTO classes
4. [ ] Update doc 72 status

````

### Template 3: Fix a Bug

```markdown
## Task: Fix [BUG DESCRIPTION]

### Symptoms
[What's happening]

### Expected Behavior
[What should happen]

### Affected Areas
- Screen: [if applicable]
- API: [if applicable]
- Database: [if applicable]

### Investigation Steps
1. [ ] Check console errors
2. [ ] Check network requests
3. [ ] Check server logs
4. [ ] Verify database state

### Root Cause
[After investigation]

### Fix
[Proposed solution]

### Verification
- [ ] Bug no longer occurs
- [ ] No regression in related features
- [ ] Tests pass
````

### Template 4: Add Field to Entity

```markdown
## Task: Add [FIELD] to [ENTITY]

### Field Specification (for doc 86)

- Name: [fieldName]
- Type: [string|number|boolean|date|enum]
- Required: [yes|no]
- Default: [value or null]
- Validation: [rules]

### Changes Required

1. [ ] Prisma schema - add field
2. [ ] Migration - create and run
3. [ ] DTO - add to Create/Update DTOs
4. [ ] Service - handle in CRUD operations
5. [ ] Frontend forms - add input
6. [ ] Frontend display - show in list/detail
7. [ ] Update doc 86 entity definition

### Business Rules

[Any rules involving this field]
```

---

## ðŸŒ³ Decision Trees

### Decision Tree 1: What to Build First?

```
START: Need to build feature X
  â”‚
  â”œâ”€â–º Does database schema exist?
  â”‚     â”‚
  â”‚     â”œâ”€â–º NO â†’ Create Prisma model first
  â”‚     â”‚         â””â”€â–º Run migration
  â”‚     â”‚
  â”‚     â””â”€â–º YES â†’ Does API endpoint exist?
  â”‚                 â”‚
  â”‚                 â”œâ”€â–º NO â†’ Build API first
  â”‚                 â”‚         â”œâ”€â–º Controller
  â”‚                 â”‚         â”œâ”€â–º Service
  â”‚                 â”‚         â””â”€â–º DTOs
  â”‚                 â”‚
  â”‚                 â””â”€â–º YES â†’ Build Frontend
  â”‚                           â”œâ”€â–º Page component
  â”‚                           â”œâ”€â–º API hooks
  â”‚                           â””â”€â–º Types
```

### Decision Tree 2: Which Screen Template?

```
START: Building a screen
  â”‚
  â”œâ”€â–º Is it showing a LIST of items?
  â”‚     â””â”€â–º YES â†’ Use List Page Template (doc 64)
  â”‚               â”œâ”€â–º Table with pagination
  â”‚               â”œâ”€â–º Search/filter bar
  â”‚               â””â”€â–º Action dropdown per row
  â”‚
  â”œâ”€â–º Is it showing ONE item's details?
  â”‚     â””â”€â–º YES â†’ Use Detail Page Template (doc 64)
  â”‚               â”œâ”€â–º Header with actions
  â”‚               â”œâ”€â–º Info sections
  â”‚               â””â”€â–º Related items tabs
  â”‚
  â”œâ”€â–º Is it a CREATE/EDIT form?
  â”‚     â””â”€â–º YES â†’ Use Form Page Template (doc 64)
  â”‚               â”œâ”€â–º Zod validation schema
  â”‚               â”œâ”€â–º React Hook Form
  â”‚               â””â”€â–º Submit handler
  â”‚
  â””â”€â–º Is it a DASHBOARD?
        â””â”€â–º YES â†’ Use Dashboard Template
                  â”œâ”€â–º KPI cards
                  â”œâ”€â–º Charts
                  â””â”€â–º Recent activity
```

### Decision Tree 3: Handling Errors

```
START: Something isn't working
  â”‚
  â”œâ”€â–º Is it a BUILD error?
  â”‚     â”œâ”€â–º TypeScript error â†’ Check types match
  â”‚     â”œâ”€â–º Import error â†’ Check file paths
  â”‚     â””â”€â–º Prisma error â†’ Run prisma generate
  â”‚
  â”œâ”€â–º Is it a RUNTIME error?
  â”‚     â”œâ”€â–º 401 Unauthorized â†’ Check JWT token
  â”‚     â”œâ”€â–º 403 Forbidden â†’ Check role permissions
  â”‚     â”œâ”€â–º 404 Not Found â†’ Check route/endpoint exists
  â”‚     â””â”€â–º 500 Server Error â†’ Check logs for stack trace
  â”‚
  â””â”€â–º Is it a UI issue?
        â”œâ”€â–º Button doesn't work â†’ Check onClick handler
        â”œâ”€â–º Data not showing â†’ Check API response format
        â””â”€â–º Styles wrong â†’ Check Tailwind classes
```

---

## ðŸ“ Context Always Needed

When starting ANY task, ensure this context is available:

### Minimum Context

```markdown
1. What screen/feature (doc 72 reference)
2. What entities involved (doc 86)
3. What business rules apply (doc 87)
4. Current state of codebase (what exists)
```

### Full Context (for complex tasks)

```markdown
1. Screen-API Contract (doc 72)
2. Entity definitions (doc 86)
3. Business rules (doc 87)
4. Related screens that already exist
5. Database schema (schema.prisma)
6. Existing API endpoints (controllers)
7. Existing frontend pages
8. UI component library available
```

---

## âœ… Verification Commands

After completing ANY task, run these checks:

### TypeScript Check

```bash
# Backend
cd apps/api && npx tsc --noEmit

# Frontend
cd apps/web && npx tsc --noEmit
```

### Lint Check

```bash
npm run lint
```

### Build Check

```bash
npm run build
```

### Test Check

```bash
npm run test
```

### UI Audit (from doc 65)

```bash
# Find buttons without onClick
grep -rn "<Button" --include="*.tsx" | grep -v "onClick\|asChild\|type="

# Find empty handlers
grep -rn "onClick={() => {}}" --include="*.tsx"
grep -rn "onClick={() => { /\*" --include="*.tsx"
```

### API Contract Check

```bash
# Verify all endpoints in doc 72 have implementations
# Manual review required
```

---

## ðŸš€ Prompt Examples

### Example 1: Build List Screen

```
Build the Carriers List screen (doc 72, section 05.01).

Context:
- API endpoints: GET /api/v1/carriers (paginated list)
- Entity: Carrier (doc 86)
- Business rules: doc 87 Carrier section

Requirements:
- Use List Page template from doc 64
- Columns: Name, MC#, DOT#, Status, Insurance Expiry, Rating
- Filters: Status dropdown, Search by name/MC#
- Row actions: View, Edit, Compliance Check
- Bulk actions: Export, Deactivate Selected

Files to create:
- apps/web/app/(dashboard)/carriers/page.tsx
- apps/web/hooks/use-carriers.ts
- apps/web/types/carrier.ts

Follow all UI standards from doc 65 - every button must work.
```

### Example 2: Build API Endpoint

```
Build the Create Load API endpoint (doc 72, section 04.01).

Endpoint: POST /api/v1/loads

Request body (from doc 86):
{
  "customerId": "string (required)",
  "originAddress": "Address object (required)",
  "destinationAddress": "Address object (required)",
  "pickupDate": "ISO date (required)",
  "deliveryDate": "ISO date (required)",
  "equipmentType": "enum (required)",
  "weight": "number (optional)",
  "rate": "number (optional)"
}

Business rules (from doc 87):
- deliveryDate must be after pickupDate
- Customer must exist and be active
- Customer credit must not be exceeded

Response: Standard single item response
{
  "data": Load,
  "message": "Load created successfully"
}

Files to modify:
- apps/api/src/modules/load/load.controller.ts
- apps/api/src/modules/load/load.service.ts
- apps/api/src/modules/load/dto/create-load.dto.ts

Follow API standards from doc 62.
```

### Example 3: Fix Bug

```
Fix: Carrier dropdown on Load form shows inactive carriers.

Current behavior:
- Dropdown shows ALL carriers including INACTIVE

Expected behavior:
- Only show ACTIVE carriers
- Sort alphabetically by name

Investigation:
1. Check the API: GET /api/v1/carriers/dropdown
2. Check if it filters by status
3. Check frontend select component

Likely fix:
- Add { status: 'ACTIVE' } filter to API query
- Or filter in frontend if API is correct
```

---

## ðŸ”„ Iterative Development Pattern

For large features, use this iterative approach:

### Phase 1: Schema & Types

```
1. Define/verify Prisma model
2. Run migration
3. Create TypeScript types
4. Create DTOs
```

### Phase 2: Backend

```
1. Create service with CRUD methods
2. Create controller with endpoints
3. Test with Postman/curl
4. Verify response format matches doc 62
```

### Phase 3: Frontend

```
1. Create API hook (useQuery/useMutation)
2. Create page component (list, detail, or form)
3. Wire up all interactive elements
4. Test all user flows
```

### Phase 4: Verification

```
1. Run all verification commands
2. Test happy path
3. Test error cases
4. Update doc 72 status checkboxes
```

---

## âš ï¸ Common Mistakes to Avoid

| Mistake                       | Prevention                          |
| ----------------------------- | ----------------------------------- |
| Building UI before API exists | Always check API first              |
| Forgetting tenant filtering   | EVERY query must include tenantId   |
| Empty onClick handlers        | Never commit, use TODO list instead |
| Mismatched types              | Generate types from API response    |
| Missing loading states        | Always handle loading/error/empty   |
| Hardcoded values              | Use config/env variables            |
| Skipping validation           | Add Zod schema FIRST                |

---

## Navigation

- **Previous:** [Environment & Secrets Management](./83-environment-secrets-management.md)
- **Next:** [Seed Data & Test Fixtures](./85-seed-data-fixtures.md)
