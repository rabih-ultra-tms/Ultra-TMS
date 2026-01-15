# Prompt 17: Phase A Services - RBAC Implementation

> **Priority:** P5 (Phase A Services Completion)  
> **Estimated Time:** 4-6 hours  
> **Prerequisites:** Prompts 01-13 completed  
> **Services:** 12 modules needing RBAC (414 endpoints) + 2 portal modules (82 endpoints - skip)

---

## Objective

Add `@Roles()` decorator-based RBAC to Phase A services that currently lack role-based access control. 

**Note:** Portal modules (Customer Portal, Carrier Portal) use dedicated auth guards and do NOT need @Roles decorators.

---

## Current State

| Module | Controllers | Endpoints | Has RBAC | Action |
|--------|-------------|-----------|----------|--------|
| Customer Portal | 7 | 37 | ✅ PortalAuthGuard | **SKIP** |
| Carrier Portal | 5 | 45 | ✅ CarrierPortalAuthGuard | **SKIP** |
| Contracts | 8 | 55 | ❌ | Add @Roles |
| Credit | 5 | 30 | ❌ | Add @Roles |
| Agents | 6 | 37 | ❌ | Add @Roles |
| HR | 6 | 33 | ❌ | Add @Roles |
| Workflow | 4 | 35 | ❌ | Add @Roles |
| Search | 4 | 27 | ❌ | Add @Roles |
| Help Desk | 5 | 30 | ❌ | Add @Roles |
| EDI | 5 | 34 | ❌ | Add @Roles |
| Rate Intelligence | 6 | 21 | ❌ | Add @Roles |
| Claims | 7 | 40 | ❌ | Add @Roles |
| Factoring | 5 | 29 | ❌ | Add @Roles |
| Safety | 9 | 43 | ❌ | Add @Roles |
| **TOTAL (Need RBAC)** | **70** | **414** | **0/12** | |
| **Portal (Skip)** | **12** | **82** | **✅** | |

---

## Target State

All 496 endpoints should have appropriate `@Roles()` decorators based on operation type:

### Role Mapping

| Operation Type | Required Role(s) |
|----------------|------------------|
| Read (GET list/detail) | `viewer`, `user`, `manager`, `admin` |
| Create (POST) | `user`, `manager`, `admin` |
| Update (PATCH/PUT) | `user`, `manager`, `admin` |
| Delete (DELETE) | `manager`, `admin` |
| Approve/Reject | `manager`, `admin` |
| **Admin-only operations** | `admin` only |
| Portal endpoints | Implicit via PortalAuthGuard (no @Roles needed) |

### Admin-Only Operations (~61 endpoints)

These require `@Roles('admin')` only - stricter than manager:

| Category | Operations | Modules |
|----------|------------|---------|
| **System/Index Management** | Reindex, initialize indexes, rebuild | Search |
| **Integration Config** | Trading partner CRUD, provider config, test connections | EDI, Rate Intelligence |
| **Template Management** | Workflow templates, contract templates CRUD | Workflow, Contracts |
| **Entity Lifecycle** | Terminate, activate, suspend, deactivate | HR, Agents, Factoring |
| **Financial Approvals** | Credit approve/reject, claim payouts, holds | Credit, Claims |
| **Compliance/Safety** | Watchlist management, FMCSA verify, score recalc | Safety |
| **Policy Configuration** | SLA policies, canned responses CRUD | Help Desk |

**Specific admin-only endpoints:**
```typescript
// Search - System administration
POST   /search/indexes              // Full reindex
POST   /search/indexes/:name/init   // Initialize index
POST   /search/synonyms             // Modify search behavior
DELETE /search/synonyms/:id

// Workflow - Template management  
POST   /workflow-templates          // Create templates
DELETE /workflow-templates/:id
POST   /workflows/:id/publish       // Production publish

// EDI - Integration config
POST   /edi/trading-partners        // Add partners
DELETE /edi/trading-partners/:id
POST   /edi/mappings                // Field mappings
POST   /edi/queue/process           // Manual queue trigger

// HR - Org structure
POST   /hr/employees/:id/terminate  // Termination
DELETE /hr/departments/:id
DELETE /hr/positions/:id

// Contracts - Templates & approvals
POST   /contract-templates
DELETE /contract-templates/:id
POST   /contracts/:id/terminate

// Credit - Financial controls
POST   /credit/applications/:id/approve
POST   /credit/applications/:id/reject
POST   /credit/limits
POST   /credit/holds

// Safety - Compliance
POST   /safety/watchlist
POST   /safety/fmcsa/verify
POST   /safety/scores/recalculate

// Help Desk - Policies
POST   /support/sla-policies
DELETE /support/sla-policies/:id
```

### Portal Endpoints - No @Roles() Needed

Customer Portal and Carrier Portal use **implicit authentication** via dedicated guards:

```typescript
// ✅ CORRECT: Portal guards handle auth implicitly
@Controller('customer-portal/shipments')
@UseGuards(PortalAuthGuard)  // No @Roles() - guard validates portal JWT
export class PortalShipmentsController { }

@Controller('carrier-portal/loads')
@UseGuards(CarrierPortalAuthGuard)  // No @Roles() - guard validates carrier JWT
export class CarrierPortalLoadsController { }
```

**Why no explicit @Roles for portals:**
- `PortalAuthGuard` validates customer JWT against `portalUser` table
- `CarrierPortalAuthGuard` validates carrier JWT against `carrierPortalUser` table
- These are separate user pools, not internal users with roles
- Adding @Roles would conflict with the global RolesGuard expecting internal user roles

**Skip RBAC for these 12 portal controllers:**
- `customer-portal/` (7 controllers, 37 endpoints) - uses PortalAuthGuard
- `carrier-portal/` (5 controllers, 45 endpoints) - uses CarrierPortalAuthGuard

---

## Implementation Approach

### ✅ Established Patterns (Follow These)

Based on existing codebase patterns:

**1. Class-level @Roles() with method overrides (PREFERRED)**

```typescript
// ✅ PREFERRED: Class-level default with method overrides
@Controller('contracts')
@UseGuards(JwtAuthGuard)
@Roles('user', 'manager', 'admin')  // Default for most operations
export class ContractsController {
  
  @Get()
  @Roles('viewer', 'user', 'manager', 'admin')  // Override: broader access for read
  findAll() {}
  
  @Post()
  // Inherits class-level: 'user', 'manager', 'admin'
  create() {}
  
  @Delete(':id')
  @Roles('manager', 'admin')  // Override: stricter for delete
  remove() {}
}
```

**2. RolesGuard is GLOBAL - No need for @UseGuards(RolesGuard)**

```typescript
// ❌ WRONG: RolesGuard already registered globally in app.module.ts
@UseGuards(JwtAuthGuard, RolesGuard)

// ✅ CORRECT: Only JwtAuthGuard needed (RolesGuard is global)
@UseGuards(JwtAuthGuard)
```

> **Note:** RolesGuard is registered as `APP_GUARD` in `app.module.ts` (line 128).
> It automatically checks `@Roles()` on every request. Only add `@UseGuards(JwtAuthGuard)` for authentication.

**3. Role Inheritance Pattern**

| Class Default | Method Override For |
|---------------|---------------------|
| `'user', 'manager', 'admin'` | Most CRUD operations |
| Override to `'viewer', 'user', 'manager', 'admin'` | GET list/detail (read-only) |
| Override to `'manager', 'admin'` | DELETE, approve, reject |
| Override to `'admin'` | Admin-only operations |

---

## Implementation Approach: Single Pass Per Module ✅

**Recommended:** Complete each module entirely before moving to the next.

### Why Single Pass Per Module (Not by Operation Type)

| Approach | Pros | Cons |
|----------|------|------|
| **✅ Single pass per module** | Focus on one domain, easier testing, clear progress tracking, can commit per module | Need to remember role patterns |
| ❌ Grouped by operation type | Consistent patterns | Lots of file switching, hard to track progress |

### Execution Order

Complete modules in this order (complexity-based):

| Order | Module | Controllers | Complexity | Notes |
|-------|--------|-------------|------------|-------|
| 1 | Search | 4 | Low | Mostly reads, some admin indexing |
| 2 | Rate Intelligence | 6 | Low | Provider config is admin |
| 3 | Credit | 5 | Medium | Financial approvals are admin |
| 4 | Help Desk | 5 | Medium | SLA policies are admin |
| 5 | HR | 6 | Medium | Terminations are admin |
| 6 | Agents | 6 | Medium | Transfers/terminations are admin |
| 7 | Factoring | 5 | Medium | Company config is admin |
| 8 | Claims | 7 | Medium | Payouts/resolutions are admin |
| 9 | EDI | 5 | High | Integration config is admin |
| 10 | Safety | 9 | High | Watchlist/compliance is admin |
| 11 | Workflow | 4 | High | Templates/publish is admin |
| 12 | Contracts | 8 | High | Templates/terminate is admin |

### Per-Module Checklist

For each module, apply roles in this order:
1. Add class-level `@Roles('user', 'manager', 'admin')` default
2. Override GET endpoints to `@Roles('viewer', 'user', 'manager', 'admin')`
3. Override DELETE endpoints to `@Roles('manager', 'admin')`
4. Override admin-only endpoints to `@Roles('admin')`
5. Run E2E tests for that module
6. Commit: `feat(api): add RBAC to {module} module`

---

## Complete Admin-Only Endpoints Reference

These require `@Roles('admin')` - **confirmed comprehensive list**:

### System & Index Operations
```typescript
// Search module
POST   /search/indexes              // Full reindex
POST   /search/indexes/:name/init   // Initialize index
POST   /search/synonyms             // Modify search behavior
DELETE /search/synonyms/:id         // Delete synonym rules
```

### Integration Configuration
```typescript
// EDI module
POST   /edi/trading-partners        // Add trading partners
PUT    /edi/trading-partners/:id    // Modify partner config
DELETE /edi/trading-partners/:id    // Remove partners
POST   /edi/mappings                // Create field mappings
DELETE /edi/mappings/:id            // Delete mappings
POST   /edi/queue/process           // Manual queue trigger
POST   /edi/documents/import        // Bulk import documents
POST   /edi/documents/:id/reprocess // Reprocess failed docs

// Rate Intelligence module
POST   /rates/providers             // Add rate data providers
PUT    /rates/providers/:id         // Modify provider config
DELETE /rates/providers/:id         // Remove providers
POST   /rates/providers/:id/test    // Test connections
```

### Template & Workflow Management
```typescript
// Workflow module
POST   /workflow-templates          // Create templates
PUT    /workflow-templates/:id      // Modify templates
DELETE /workflow-templates/:id      // Delete templates
POST   /workflows/:id/publish       // Publish for production
POST   /workflows/:id/activate      // Activate automation
POST   /workflows/:id/deactivate    // Deactivate automation
DELETE /workflows/:id               // Delete workflow definitions

// Contracts module
POST   /contract-templates          // Create contract templates
PUT    /contract-templates/:id      // Modify templates
DELETE /contract-templates/:id      // Delete templates
POST   /contracts/:id/terminate     // Terminate contracts
POST   /fuel-tables                 // Create fuel surcharge tables
DELETE /fuel-tables/:id             // Delete fuel tables
POST   /rate-tables/:id/import      // Bulk import rate data
```

### Entity Lifecycle Management
```typescript
// HR module
POST   /hr/employees/:id/terminate  // Employee termination
DELETE /hr/departments/:id          // Delete departments
DELETE /hr/positions/:id            // Delete positions
DELETE /hr/locations/:id            // Delete locations

// Agents module
DELETE /agents/:id                  // Remove agent records
POST   /agents/:id/activate         // Activate agent accounts
POST   /agents/:id/suspend          // Suspend agent accounts
POST   /agents/:id/terminate        // Terminate relationships
POST   /agent-assignments/:id/transfer  // Transfer assignments

// Factoring module
POST   /factoring-companies         // Add factoring companies
DELETE /factoring-companies/:id     // Remove companies
PATCH  /factoring-companies/:id/status  // Toggle status
DELETE /noa-records/:id             // Delete NOA records
```

### Financial Controls
```typescript
// Credit module
POST   /credit/applications/:id/approve   // Approve applications
POST   /credit/applications/:id/reject    // Reject applications
POST   /credit/limits                     // Set credit limits
PATCH  /credit/limits/:id/increase        // Increase limits
POST   /credit/holds                      // Create holds
PATCH  /credit/holds/:id/release          // Release holds

// Claims module
POST   /claims/:id/approve-payout         // Approve payouts
POST   /claims/:id/deny                   // Deny claims
POST   /claims/:id/process-payment        // Process payments
POST   /claims/:id/close                  // Close claims
DELETE /claims/:id                        // Delete claim records
```

### Compliance & Safety
```typescript
// Safety module
POST   /safety/watchlist                  // Add to watchlist
POST   /safety/watchlist/:id/resolve      // Resolve entries
POST   /safety/fmcsa/verify               // Verify compliance
POST   /safety/fmcsa/refresh              // Refresh FMCSA data
POST   /safety/csa/refresh                // Refresh CSA scores
POST   /safety/scores/recalculate         // Recalculate scores
POST   /safety/incidents/:id/close        // Close incidents
```

### Policy Configuration
```typescript
// Help Desk module
POST   /support/sla-policies              // Create SLA policies
PUT    /support/sla-policies/:id          // Modify policies
DELETE /support/sla-policies/:id          // Delete policies
POST   /support/teams                     // Create teams
POST   /support/teams/:id/members         // Manage membership
POST   /support/canned-responses          // Create responses
DELETE /support/canned-responses/:id      // Delete responses
POST   /support/kb/categories             // Create KB categories
POST   /support/kb/articles/:id/publish   // Publish articles
```

**Total Admin-Only Endpoints: ~75**

---

## Implementation Tasks

### Task 1: Internal Admin Modules (Contracts, Credit, HR, Workflow)

**File:** `apps/api/src/modules/contracts/controllers/*.controller.ts`

```typescript
// Before
@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  @Get()
  findAll() {}
  
  @Post()
  create() {}
}

// After (using class-level default with overrides)
@Controller('contracts')
@UseGuards(JwtAuthGuard)
@Roles('user', 'manager', 'admin')  // Class default
export class ContractsController {
  @Get()
  @Roles('viewer', 'user', 'manager', 'admin')  // Override for read
  findAll() {}
  
  @Post()
  // Inherits class default
  create() {}
  
  @Post(':id/approve')
  @Roles('manager', 'admin')  // Override for approval
  approve() {}
  
  @Delete(':id')
  @Roles('manager', 'admin')  // Override for delete
  remove() {}
}
```

**Apply to:**
- `contracts/*.controller.ts` (8 controllers, 55 endpoints)
- `credit/*.controller.ts` (5 controllers, 30 endpoints)
- `hr/*.controller.ts` (6 controllers, 33 endpoints)
- `workflow/*.controller.ts` (4 controllers, 35 endpoints)

### Task 2: Operations Modules (Agents, Claims, Factoring, Safety)

Apply RBAC to operational/financial modules:

- `agents/*.controller.ts` (6 controllers, 37 endpoints)
- `claims/*.controller.ts` (7 controllers, 40 endpoints)
- `factoring/*.controller.ts` (5 controllers, 29 endpoints)
- `safety/*.controller.ts` (9 controllers, 43 endpoints)

### Task 3: System Modules (Search, Help Desk, EDI, Rate Intelligence)

Apply RBAC to system/integration modules:

- `search/*.controller.ts` (4 controllers, 27 endpoints)
- `help-desk/*.controller.ts` (5 controllers, 30 endpoints)
- `edi/*.controller.ts` (5 controllers, 34 endpoints)
- `rate-intelligence/*.controller.ts` (6 controllers, 21 endpoints)

### Task 4: Portal Modules (Customer Portal, Carrier Portal)

These use separate guards. Add portal-specific role decorators:

```typescript
// Customer Portal - use PortalRoles or check user.portalRole
@Controller('customer-portal/shipments')
@UseGuards(PortalAuthGuard)
export class PortalShipmentsController {
  @Get()
  // Customer portal users have implicit 'customer' role via PortalAuthGuard
  findAll() {}
}
```

---

## Acceptance Criteria

- [ ] All 84 controllers have `@UseGuards(JwtAuthGuard, RolesGuard)` (except portals)
- [ ] All 496 endpoints have appropriate `@Roles()` decorators
- [ ] Admin-only endpoints (approve, delete, terminate) require `admin` or `manager`
- [ ] Read endpoints allow `viewer` role
- [ ] Create/Update endpoints require at least `user` role
- [ ] Portal modules maintain their specific auth guards
- [ ] All E2E tests still pass with proper role setup

---

## Verification

```bash
# Run all E2E tests
pnpm --filter api test:e2e

# Check for TypeScript errors
pnpm --filter api build

# Grep for unprotected controllers
grep -r "@Controller" apps/api/src/modules/{contracts,credit,hr,workflow,agents,claims,factoring,safety,search,help-desk,edi,rate-intelligence} --include="*.controller.ts" | wc -l
# Should match controllers with RolesGuard
```

---

## Files to Modify

```
apps/api/src/modules/
├── contracts/controllers/          # 8 files
├── credit/controllers/             # 5 files  
├── hr/controllers/                 # 6 files
├── workflow/controllers/           # 4 files
├── agents/controllers/             # 6 files
├── claims/controllers/             # 7 files
├── factoring/controllers/          # 5 files
├── safety/controllers/             # 9 files
├── search/controllers/             # 4 files
├── help-desk/controllers/          # 5 files
├── edi/controllers/                # 5 files
├── rate-intelligence/controllers/  # 6 files
└── (70 controller files total)
```

---

## Notes

- Customer Portal and Carrier Portal use separate authentication flows
- The `RolesGuard` already exists from Prompt 01
- Import `@Roles()` from `@common/decorators/roles.decorator`
- Import `RolesGuard` from `@common/guards/roles.guard`

---

## ✅ After Completion - Update Progress

**IMPORTANT:** After completing this prompt, update the following files:

### 1. Update README.md Progress Tracker

In `dev_docs/11-ai-dev/api-dev-prompts-phase2/README.md`, update:

```markdown
| 17 | [Phase A RBAC](17-p5-phase-a-services-rbac.md) | P5 | 4-6h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics Table

In the same README.md, update the Current Status table:

```markdown
| Phase A Services RBAC | 0% | 100% | 100% |
```

### 3. Add Changelog Entry

Add to the Changelog section:

```markdown
### [Date] - Prompt 17: Phase A Services RBAC
**Completed by:** [Your Name]
**Time spent:** [X] hours

#### Changes
- Added @Roles() decorators to 70 controller files
- 496 endpoints now have role-based access control
- Contracts, Credit, HR, Workflow, Agents, Claims, Factoring, Safety, Search, Help Desk, EDI, Rate Intelligence modules secured

#### Metrics Updated
- Phase A Services RBAC: 0% → 100%
```

### 4. Proceed to Next Prompt

➡️ **Next:** [18-p5-phase-a-services-swagger.md](18-p5-phase-a-services-swagger.md)
