Convert a design spec into a step-by-step implementation plan. Screen or feature: $ARGUMENTS

## Instructions

### Step 1: Read the Design Spec

1. **Find and read the design spec** using the same search logic as `/read-spec`:
   - Search `dev_docs/12-Rabih-design-Process/` for the matching spec file
   - If it's a placeholder, recommend upgrading before planning
   - If it's detailed, proceed with extraction

2. **Also read**:
   - The **contract registry** at `dev_docs/09-contracts/76-screen-api-contract-registry.md` for this screen
   - The **Prisma schema** at `apps/api/prisma/schema.prisma` for existing models
   - The **pre-feature checklist** at `dev_docs/08-standards/74-pre-feature-checklist.md` for what to verify

### Step 2: Analyze Gaps

3. **Determine what exists vs what needs building**:

   **Database layer:**
   - Which Prisma models exist? Which need creating?
   - Which fields are missing from existing models?
   - Are all enums defined?

   **Backend layer:**
   - Which API modules/endpoints exist?
   - Which CRUD operations are missing?
   - Which custom endpoints are needed (from the spec)?

   **Frontend layer:**
   - Which pages/components exist?
   - Which React Query hooks exist?
   - Which TypeScript types are defined?

### Step 3: Generate Implementation Plan

4. **Create a numbered, ordered plan** following the project's build sequence (DB → API → Frontend):

```
## Implementation Plan: [Screen/Feature Name]

### Prerequisites
- [ ] Design spec: [path] (detailed/placeholder)
- [ ] Contract defined: (yes/no — if no, define first)
- [ ] Dependencies: [list any screens/APIs this depends on]

### Phase 1: Database (if needed)
1. Add/modify Prisma model `{ModelName}` in `apps/api/prisma/schema.prisma`
   - Fields to add: [list]
   - Enums to add: [list]
   - Relations: [list]
2. Run migration: `pnpm --filter api exec prisma migrate dev --name {name}`
3. Update seed script if sample data needed

### Phase 2: Backend API
4. Create/extend module at `apps/api/src/modules/{module}/`
   - DTOs needed: [list with fields]
   - Controller endpoints: [list with routes and methods]
   - Service methods: [list with logic description]
5. Register module in `apps/api/src/app.module.ts` (if new)
6. Add Swagger documentation
7. Verify with: `pnpm --filter api exec tsc --noEmit`

### Phase 3: Frontend
8. Create React Query hooks at `apps/web/lib/hooks/{resource}.ts`
   - [list hooks: useList, useDetail, useCreate, etc.]
9. Create TypeScript types at `apps/web/types/{resource}.ts` (if not auto-generated)
10. Create page at `apps/web/app/(dashboard)/{path}/page.tsx`
    - Screen type: [list/detail/form/dashboard]
    - Components: [list from spec component inventory]
    - States: loading, error, empty, success
11. Create sub-pages if needed: `[id]/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx`
12. Verify with: `pnpm --filter web exec tsc --noEmit`

### Phase 4: Integration & Testing
13. Write backend unit tests for service methods
14. Write frontend tests with MSW mocking
15. Manual verification:
    - All 4 states render correctly
    - Every button/link works (Golden Rule #1)
    - CRUD operations function end-to-end
    - Role-based access works correctly
16. Console clean — no errors or warnings

### Phase 5: Documentation
17. Update contract registry status (DB, API, FE, INT, VER)
18. Log session with `/log`

### Estimated Scope
- New files: ~[count]
- Modified files: ~[count]
- Estimated lines: ~[count]
- Complexity: [low/medium/high]
```

### Step 4: Identify Risks

5. **Flag any concerns**:
   - Missing contracts or specs
   - Dependencies on unbuilt features
   - Complex business logic that needs clarification
   - Real-time features requiring WebSocket setup
   - Third-party integrations needed

### Step 5: Present for Approval

6. Show the full plan to the user and ask:
   - "Does this plan look correct?"
   - "Any phases you want to skip or reorder?"
   - "Should I start executing? (recommend starting with Phase 1)"
