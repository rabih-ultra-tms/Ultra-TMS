Run the pre-feature verification checklist before building a feature. The feature/screen name is: $ARGUMENTS

## Instructions

### Phase 1: Identify the Feature

1. **Parse the feature name** from the arguments. If no argument given, ask the user what feature/screen they want to build.

2. **Search the Screen-API Contract Registry** at `dev_docs/09-contracts/76-screen-api-contract-registry.md` (and `77-screen-api-contract-registry-part2.md` if needed):
   - Find the screen entry matching the feature name
   - Note: DB status, API status, FE status, INT status, VER status
   - List ALL required API endpoints for this screen
   - List ALL required database tables

3. **Check for a design spec** in `dev_docs/12-Rabih-design-Process/`:
   - Search subdirectories (`01-auth-admin/`, `02-crm/`, `03-sales/`, `04-tms-core/`, `05-carrier/`, etc.) for a matching spec file
   - If found, read it and extract: data fields, component inventory, role matrix, status states
   - If not found (only a placeholder), note this as a gap

### Phase 2: Contract Verification

4. **For EACH required API endpoint**, check:
   - Is the contract defined in the registry? (request format, response format, error cases, auth roles)
   - Does the endpoint already exist in `apps/api/src/modules/`? (search for the controller route)
   - If the contract is NOT defined: flag as **BLOCKER** — must define contract before coding

### Phase 3: Database Readiness

5. **Read the Prisma schema** at `apps/api/prisma/schema.prisma` and check:
   - Do the required tables/models exist?
   - Do they have all required fields from the contract?
   - Do they have mandatory fields: `tenantId`, `deletedAt`, `createdAt`, `updatedAt`?
   - Do they have migration fields: `externalId`, `sourceSystem`, `customFields`?
   - Are indexes defined for query/filter fields?
   - If schema changes are needed, list them specifically

### Phase 4: Existing Code Check

6. **Check what already exists** for this feature:
   - Backend: Search `apps/api/src/modules/` for existing controller/service/DTOs
   - Frontend: Search `apps/web/app/(dashboard)/` for existing pages
   - Hooks: Search `apps/web/lib/hooks/` for existing React Query hooks
   - Types: Search `apps/web/types/` or `apps/web/lib/types/` for existing TypeScript types

### Phase 5: Generate Report

7. **Output a structured preflight report** in this format:

```
## Preflight Report: [Feature Name]

### Status: GO / NO-GO / PARTIAL

### Contract Registry
- Screen found: Yes/No
- DB status: [emoji] | API status: [emoji] | FE status: [emoji]
- Endpoints required: [count]
- Endpoints with contracts: [count]

### Database Readiness
- Models exist: [list or "MISSING"]
- Schema changes needed: [list or "None"]

### Existing Code
- Backend module: [exists/partial/missing]
- Frontend page: [exists/partial/missing]
- Hooks/types: [exists/partial/missing]

### Design Spec
- Spec file: [path or "Not found"]
- Quality: [detailed/placeholder]

### Blockers (if any)
1. [blocker description]

### Ready to Build
- [ ] Contracts defined for all endpoints
- [ ] Database schema ready (or changes listed)
- [ ] Design spec available
- [ ] Roles and permissions identified

### Recommended Build Order
1. [step 1]
2. [step 2]
...
```

8. **If there are blockers**, recommend resolving them first and offer to help (e.g., "Want me to define the missing API contract?" or "Want me to add the Prisma model?").

9. **If GO**, suggest the next step: "Ready to build. Use `/scaffold-api` to generate the backend module or `/scaffold-screen` for the frontend."
