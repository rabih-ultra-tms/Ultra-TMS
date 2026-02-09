Update the Screen-API Contract Registry after building a feature. Feature/screen name: $ARGUMENTS

## Instructions

### Step 1: Identify What Was Built

1. **Parse arguments** for the feature/screen name. If not provided, check recent git commits or ask the user.

2. **Find the screen entry** in the contract registry at `dev_docs/09-contracts/76-screen-api-contract-registry.md` (and `77-screen-api-contract-registry-part2.md` if needed).

3. **Check what was actually built** by scanning:
   - **DB**: Does the Prisma model exist in `apps/api/prisma/schema.prisma`?
   - **API**: Does the controller exist in `apps/api/src/modules/`? Are endpoints implemented?
   - **FE**: Does the page exist in `apps/web/app/(dashboard)/`?
   - **INT**: Can we verify integration? (Check if hooks call the right API paths)
   - **VER**: Has manual verification been done? (Ask user)

### Step 2: Update the Registry

4. **Update the status columns** for this screen in the contract registry:
   - Change status emoji based on what exists:
     - `✅` — Complete (code exists and works)
     - `🟡` — In Progress (partially built)
     - `⬜` — Not Started
     - `🔴` — Blocked

5. **Update endpoint details** if the actual implementation differs from the planned contract:
   - Correct API paths if they changed
   - Add any new endpoints that were added during implementation
   - Note any endpoints that were deferred

6. **Add actual file paths** as code references where helpful.

### Step 3: Verify Consistency

7. **Cross-check** that the registry entry matches reality:
   - API route in registry matches controller `@Controller()` route
   - HTTP methods match controller decorators
   - Role assignments match `@Roles()` decorators
   - Response format matches service return values

### Step 4: Report

8. **Show the user** what was updated:
   ```
   ## Contract Registry Updated: [Screen Name]

   ### Before
   DB: [old] | API: [old] | FE: [old] | INT: [old] | VER: [old]

   ### After
   DB: [new] | API: [new] | FE: [new] | INT: [new] | VER: [new]

   ### Changes Made
   - [list of specific changes to the registry]
   ```

9. **If multiple screens were affected** (e.g., building a module touches list + detail + form screens), update ALL of them.
