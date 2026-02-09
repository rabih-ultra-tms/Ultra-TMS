Show project build status — what's built, in progress, and remaining.

## Instructions

### Step 1: Scan Built Modules

1. **Backend modules**: List all directories in `apps/api/src/modules/` and check each for:
   - Has controller? (`.controller.ts`)
   - Has service? (`.service.ts`)
   - Has DTOs? (`dto/` directory)
   - Has tests? (`.spec.ts` files)
   - Classify as: Complete, Partial, or Stub/Empty

2. **Frontend pages**: List all directories in `apps/web/app/(dashboard)/` and check each for:
   - Has `page.tsx`?
   - Line count (proxy for completeness)
   - Has sub-pages? (`[id]/page.tsx`, `new/page.tsx`, etc.)
   - Classify as: Complete, Partial, or Stub/Empty

3. **Database models**: Count models in `apps/api/prisma/schema.prisma`:
   - Total model count
   - Models with all mandatory fields (tenantId, deletedAt, migration fields)
   - Enums defined

### Step 2: Cross-Reference with Plans

4. **Read the contract registry** at `dev_docs/09-contracts/76-screen-api-contract-registry.md`:
   - Count screens by status: ✅ Complete, 🟡 In Progress, ⬜ Not Started, 🔴 Blocked
   - Group by service/category

5. **Read design specs status** from `dev_docs/12-Rabih-design-Process/`:
   - Count detailed specs (15-section) vs placeholders
   - Group by wave (1-7)

### Step 3: Generate Dashboard

6. **Output a project status dashboard**:

```
## Ultra TMS Project Status

### Overall Progress
[progress bar visual]

### Backend Modules (apps/api/src/modules/)
| Module | Controller | Service | DTOs | Tests | Status |
|--------|-----------|---------|------|-------|--------|
| auth   | ✅        | ✅      | ✅   | ✅    | Complete |
| carrier| ✅        | ✅      | ✅   | ✅    | Complete |
| crm    | ✅        | ✅      | ✅   | 🟡    | Partial |
...

**Summary:** X/40 complete, Y partial, Z not started

### Frontend Pages (apps/web/app/(dashboard)/)
| Page | Type | Lines | Sub-pages | Status |
|------|------|-------|-----------|--------|
| carriers | list | 859 | [id], new | Complete |
...

**Summary:** X/362 complete, Y partial, Z not started

### Database Schema
- Models defined: X
- Enums defined: Y
- Models with full audit fields: X/Y

### Design Specs
- Detailed (15-section): 89
- Placeholders: 298+
- Wave 1 (Auth, Dashboard, CRM, Sales): [status]
- Wave 2 (TMS Core): [status]
- Wave 3 (Carrier): [status]

### Contract Registry Summary
| Category | Screens | DB ✅ | API ✅ | FE ✅ | Fully Done |
|----------|---------|-------|--------|-------|------------|
| Core     | 78      | X     | X      | X     | X          |
| Operations| 68     | X     | X      | X     | X          |
...

### What to Build Next (Recommended)
Based on dependencies and wave priorities:
1. [highest priority screen/feature]
2. [next priority]
3. [next priority]
```

### Step 4: Recommendations

7. **Suggest the next 3-5 features to build** based on:
   - Wave priority (Wave 1 before Wave 2)
   - Dependency chains (build prerequisites first)
   - Existing partial work (finish what's started)
   - Design spec availability (detailed specs first)
