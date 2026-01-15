# Prompt 18: Phase A Services - Swagger Documentation

> **Priority:** P5 (Phase A Services Completion)  
> **Estimated Time:** 6-8 hours  
> **Prerequisites:** Prompts 01-13, 17 completed  
> **Services:** 14 modules (84 controllers, 496 endpoints)

---

## ⚠️ Important: Use Existing Patterns

Before implementing, note these established patterns in the codebase:

### 1. ⚠️ FIX REQUIRED: Auth Scheme Name Mismatch

**Problem:** The existing Swagger helpers in `common/swagger/index.ts` use `ApiBearerAuth()` without the required `'JWT-auth'` parameter.

**Current (INCORRECT in helpers):**
```typescript
// common/swagger/index.ts lines 93, 103, 115, 125, 136
ApiBearerAuth(),  // ❌ Won't match security scheme
```

**Required fix:** Update `apps/api/src/common/swagger/index.ts` to use `'JWT-auth'`:
```typescript
ApiBearerAuth('JWT-auth'),  // ✅ Matches swagger.ts config
```

**TASK:** Before using the helpers, fix all 5 occurrences in `common/swagger/index.ts`:
- Line 93 (ApiCreate)
- Line 103 (ApiList)
- Line 115 (ApiGetById)
- Line 125 (ApiUpdate)
- Line 136 (ApiDelete)

### 2. ⚠️ FIX REQUIRED: Response Schema Alignment

**Problem:** Swagger helpers document a different schema than `response.helper.ts` produces.

| Field | Swagger Schema | Actual Response |
|-------|---------------|-----------------|
| Meta field | `meta: { timestamp, requestId }` | `timestamp` (string, top-level) |
| Pagination | `meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage }` | `pagination: { page, limit, total, totalPages, hasNext, hasPrev }` |

**Required fix:** Update `apps/api/src/common/swagger/index.ts` to match actual response structure:

```typescript
// Fix ApiStandardResponse schema
export function ApiStandardResponse(description: string, type?: any) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: type
        ? {
            properties: {
              success: { type: 'boolean', example: true },
              data: { $ref: `#/components/schemas/${type.name}` },
              message: { type: 'string', nullable: true },
              timestamp: { type: 'string', format: 'date-time' },
            },
          }
        : undefined,
    }),
  );
}

// Fix ApiPaginatedResponse schema  
export function ApiPaginatedResponse(description: string, type: any) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${type.name}` },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              hasNext: { type: 'boolean' },
              hasPrev: { type: 'boolean' },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
}
```

### 3. Portal Public Endpoints (Omit @ApiBearerAuth)

**These portal auth endpoints are PUBLIC and should NOT have `@ApiBearerAuth('JWT-auth')`:**

| Portal | Controller | Public Endpoints |
|--------|-----------|------------------|
| Customer Portal | `portal-auth.controller.ts` | `POST /portal/auth/login` |
| | | `POST /portal/auth/refresh` |
| | | `POST /portal/auth/forgot-password` |
| | | `POST /portal/auth/reset-password` |
| | | `POST /portal/auth/register` |
| | | `GET /portal/auth/verify-email/:token` |
| Carrier Portal | `carrier-portal-auth.controller.ts` | `POST /carrier-portal/auth/login` |
| | | `POST /carrier-portal/auth/refresh` |
| | | `POST /carrier-portal/auth/logout` |
| | | `POST /carrier-portal/auth/forgot-password` |
| | | `POST /carrier-portal/auth/reset-password` |
| | | `POST /carrier-portal/auth/register` |
| | | `GET /carrier-portal/auth/verify-email/:token` |

**Portal endpoints requiring auth (use portal-specific JWT scheme):**

| Portal | Controller | Protected Endpoints |
|--------|-----------|---------------------|
| Customer Portal | `portal-auth.controller.ts` | `POST /portal/auth/logout` (PortalAuthGuard) |
| | | `POST /portal/auth/change-password` (PortalAuthGuard) |
| | All other controllers | All dashboard/loads/documents/etc endpoints |
| Carrier Portal | All controllers except auth | All loads/documents/payments/etc endpoints |

**For protected portal endpoints, use a separate bearer auth scheme:**
```typescript
// Add to swagger.ts (alongside 'JWT-auth')
.addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'Portal-JWT')

// Then in portal controllers
@ApiBearerAuth('Portal-JWT')  // Different scheme for portal auth
```

### 4. Response Envelope: USE EXISTING HELPERS (after fixes)

**After applying the fixes above**, use the existing helpers in `apps/api/src/common/swagger/index.ts`:

```typescript
// ✅ USE THESE - already exist
import { 
  ApiStandardResponse,    // For single item responses
  ApiPaginatedResponse,   // For list responses
  ApiErrorResponses,      // Standard 400/401/403/404/500
  ApiCreate,              // Combines operation + body + responses
  ApiList,                // Combines operation + pagination + responses
  ApiGetById,             // Combines operation + param + responses
  ApiUpdate,              // Combines operation + param + body + responses
  ApiDelete               // Combines operation + param + responses
} from '@common/swagger';

// Example usage:
@Get()
@ApiList('Contract', ContractDto)  // All-in-one decorator
findAll() {}

@Get(':id')
@ApiGetById('Contract', ContractDto)
findOne() {}

@Post()
@ApiCreate('Contract', CreateContractDto)
create() {}
```

### 2. ApiBearerAuth: ✅ USE `'JWT-auth'` (matches Swagger config)

```typescript
// ✅ CORRECT - matches swagger.ts config (line 62)
@ApiBearerAuth('JWT-auth')

// ❌ WRONG - won't match the security scheme
@ApiBearerAuth()
```

The Swagger config in `apps/api/src/swagger.ts` defines:
```typescript
.addBearerAuth({ ... }, 'JWT-auth')  // Named 'JWT-auth'
```

### 3. API Tags: ✅ USE EXISTING TAG REGISTRY

Existing tags defined in `swagger.ts` (lines 69-81):

| Existing Tag | Use For |
|--------------|---------|
| `Auth` | Authentication endpoints |
| `Users` | User management |
| `Customers` | CRM/Customer management |
| `Orders` | Order management |
| `Loads` | Load/dispatch management |
| `Carriers` | Carrier management |
| `Tracking` | Real-time tracking |
| `Accounting` | Invoicing/payments |
| `Reports` | Financial/operational reports |
| `Audit` | Audit logs/compliance |
| `Config` | System configuration |
| `Documents` | Document management |
| `Search` | Full-text search |

**For NEW modules, ADD tags to swagger.ts first:**

```typescript
// Add to apps/api/src/swagger.ts (after line 81)
.addTag('Contracts', 'Contract management')
.addTag('Credit', 'Credit applications and limits')
.addTag('HR', 'Human resources management')
.addTag('Workflow', 'Workflow automation')
.addTag('Agents', 'Agent/broker management')
.addTag('Claims', 'Cargo claims management')
.addTag('Factoring', 'Factoring and quick pay')
.addTag('Safety', 'Safety and compliance')
.addTag('Help Desk', 'Support tickets and KB')
.addTag('EDI', 'Electronic data interchange')
.addTag('Rate Intelligence', 'Market rates and benchmarks')
.addTag('Customer Portal', 'Customer self-service portal')
.addTag('Carrier Portal', 'Carrier self-service portal')
```

---

## Objective

Add comprehensive Swagger/OpenAPI documentation to all Phase A services that currently lack API documentation. This enables frontend developers to understand and integrate with these APIs.

---

## Current State

| Module | Controllers | Endpoints | Has Swagger |
|--------|-------------|-----------|-------------|
| Customer Portal | 7 | 37 | ❌ |
| Carrier Portal | 7 | 45 | ❌ |
| Contracts | 8 | 55 | ❌ |
| Credit | 5 | 30 | ❌ |
| Agents | 6 | 37 | ❌ |
| HR | 6 | 33 | ❌ |
| Workflow | 4 | 35 | ❌ |
| Search | 4 | 27 | ❌ |
| Help Desk | 5 | 30 | ❌ |
| EDI | 5 | 34 | ❌ |
| Rate Intelligence | 6 | 21 | ❌ |
| Claims | 7 | 40 | ❌ |
| Factoring | 5 | 29 | ❌ |
| Safety | 9 | 43 | ❌ |
| **TOTAL** | **84** | **496** | **0/14** |

---

## Target State

All controllers and endpoints documented with:
- `@ApiTags()` on every controller
- `@ApiOperation()` on every endpoint
- `@ApiResponse()` for success and error responses
- `@ApiProperty()` on all DTO properties
- `@ApiBearerAuth()` on protected endpoints

---

## Implementation Tasks

### Task 0: Fix Swagger Helper Issues (PREREQUISITE)

**Before documenting modules, fix these issues in `apps/api/src/common/swagger/index.ts`:**

#### 0a. Fix ApiBearerAuth scheme name (5 locations)

```typescript
// Change from:
ApiBearerAuth(),

// To:
ApiBearerAuth('JWT-auth'),
```

**Locations:**
- Line 93 (in `ApiCreate`)
- Line 103 (in `ApiList`)  
- Line 115 (in `ApiGetById`)
- Line 125 (in `ApiUpdate`)
- Line 136 (in `ApiDelete`)

#### 0b. Fix ApiStandardResponse schema

```typescript
export function ApiStandardResponse(description: string, type?: any) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: type
        ? {
            properties: {
              success: { type: 'boolean', example: true },
              data: { $ref: `#/components/schemas/${type.name}` },
              message: { type: 'string', nullable: true },
              timestamp: { type: 'string', format: 'date-time' },
            },
          }
        : undefined,
    }),
  );
}
```

#### 0c. Fix ApiPaginatedResponse schema

```typescript
export function ApiPaginatedResponse(description: string, type: any) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${type.name}` },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              hasNext: { type: 'boolean' },
              hasPrev: { type: 'boolean' },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
}
```

#### 0d. Add Portal JWT scheme to swagger.ts

```typescript
// In apps/api/src/swagger.ts, add after 'JWT-auth':
.addBearerAuth(
  { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Portal user authentication' },
  'Portal-JWT',
)
```

### Task 1: Register New Tags in swagger.ts

**FIRST**, add new tags to `apps/api/src/swagger.ts`:

```typescript
// Add after existing .addTag() calls (around line 81)
.addTag('Contracts', 'Contract management')
.addTag('Contract Templates', 'Contract template library')
.addTag('Contract Rates', 'Contract-specific rates')
.addTag('Credit Applications', 'Credit application workflow')
.addTag('Credit Limits', 'Credit limit management')
.addTag('Credit Holds', 'Credit hold management')
.addTag('Agents', 'Agent/broker management')
.addTag('Agent Agreements', 'Agent agreement management')
.addTag('Agent Commissions', 'Agent commission tracking')
.addTag('Employees', 'Employee management')
.addTag('Departments', 'Department management')
.addTag('Teams', 'Team management')
.addTag('Positions', 'Position/role definitions')
.addTag('Workflows', 'Workflow definitions')
.addTag('Workflow Actions', 'Workflow step actions')
.addTag('Workflow Executions', 'Workflow execution tracking')
.addTag('Global Search', 'Cross-entity search')
.addTag('Entity Search', 'Entity-specific search')
.addTag('Saved Searches', 'User saved searches')
.addTag('Tickets', 'Help desk tickets')
.addTag('Knowledge Base', 'Knowledge base articles')
.addTag('FAQ', 'Frequently asked questions')
.addTag('EDI Partners', 'EDI trading partners')
.addTag('EDI Transactions', 'EDI transaction management')
.addTag('EDI Documents', 'EDI document management')
.addTag('Market Rates', 'Rate intelligence data')
.addTag('Rate History', 'Historical rate analysis')
.addTag('Rate Benchmarks', 'Rate benchmarking')
.addTag('Claims', 'Cargo claims management')
.addTag('Claim Documents', 'Claims documentation')
.addTag('Claim Settlements', 'Claims settlement processing')
.addTag('Factoring Requests', 'Invoice factoring')
.addTag('NOA Management', 'Notice of assignment')
.addTag('Quick Pay', 'Quick pay processing')
.addTag('Safety Scores', 'Carrier safety scoring')
.addTag('FMCSA Data', 'FMCSA/CSA compliance')
.addTag('Insurance', 'Insurance certificate management')
.addTag('Incidents', 'Safety incident tracking')
.addTag('Customer Portal', 'Customer self-service portal')
.addTag('Carrier Portal', 'Carrier self-service portal')
```

### Task 2: Controller-Level Decorators

Add to every controller:

```typescript
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Contracts')           // ✅ Use tag from registry
@ApiBearerAuth('JWT-auth')      // ✅ Must be 'JWT-auth' to match config
@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  // ...
}
```

### Task 3: Endpoint-Level Decorators (Use Existing Helpers!)

**Use the helper decorators from `@common/swagger`:**

```typescript
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiList, ApiGetById, ApiCreate, ApiUpdate, ApiDelete } from '@common/swagger';

@Get()
@ApiList('Contract', ContractDto)  // ✅ All-in-one helper
@Roles('viewer', 'user', 'manager', 'admin')
findAll(@Query() query: ListContractsDto) {
  return this.contractsService.findAll(query);
}

@Get(':id')
@ApiGetById('Contract', ContractDto)  // ✅ All-in-one helper
@Roles('viewer', 'user', 'manager', 'admin')
findOne(@Param('id') id: string) {
  return this.contractsService.findOne(id);
}

@Post()
@ApiCreate('Contract', CreateContractDto)  // ✅ All-in-one helper
@Roles('user', 'manager', 'admin')
create(@Body() dto: CreateContractDto) {
  return this.contractsService.create(dto);
}

@Patch(':id')
@ApiUpdate('Contract', UpdateContractDto)  // ✅ All-in-one helper
@Roles('user', 'manager', 'admin')
update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
  return this.contractsService.update(id, dto);
}

@Delete(':id')
@ApiDelete('Contract')  // ✅ All-in-one helper
@Roles('manager', 'admin')
remove(@Param('id') id: string) {
  return this.contractsService.remove(id);
}
```

**For custom endpoints, use the lower-level helpers:**

```typescript
import { ApiStandardResponse, ApiPaginatedResponse, ApiErrorResponses } from '@common/swagger';

@Post(':id/activate')
@ApiOperation({ summary: 'Activate contract' })
@ApiParam({ name: 'id', description: 'Contract UUID' })
@ApiStandardResponse(ContractDto)  // ✅ Wraps response type properly
@ApiErrorResponses()               // ✅ Adds 400/401/403/404/500
@Roles('manager', 'admin')
activate(@Param('id') id: string) {
  return this.contractsService.activate(id);
}
```

### Task 4: DTO Decorators

Add `@ApiProperty()` to all DTOs:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiProperty({ description: 'Customer ID', example: 'uuid-here' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'Contract type', enum: ContractType })
  @IsEnum(ContractType)
  type: ContractType;

  @ApiPropertyOptional({ description: 'Contract start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;
}
```

### Task 5: ⚠️ DO NOT Create New Response DTOs

The response envelope is already handled by:

1. **Controller response helpers** (`apps/api/src/common/helpers/response.helper.ts`):
   - `ok(data)` - Single item success response
   - `paginated(data, pagination)` - List with pagination
   - `created(data)` - 201 response
   - `updated(data)` - Update response
   - `deleted()` - Delete response

2. **Swagger helpers** (`apps/api/src/common/swagger/index.ts`):
   - `ApiStandardResponse(DtoType)` - Documents wrapped response
   - `ApiPaginatedResponse(DtoType)` - Documents paginated response

**DO NOT create:**
- ❌ `ApiResponseDto<T>` 
- ❌ `PaginatedResponseDto<T>`
- ❌ `ContractListResponseDto`
- ❌ `ContractResponseDto` (just use `ContractDto`)

These patterns are already established. Use them consistently.

---

## Module-Specific Notes

### Customer Portal & Carrier Portal

**Public endpoints (NO `@ApiBearerAuth`):**
```typescript
// These are unauthenticated - do NOT add @ApiBearerAuth
@Post('login')
@Post('refresh')
@Post('forgot-password')
@Post('reset-password')
@Post('register')
@Get('verify-email/:token')
```

**Protected endpoints (USE `@ApiBearerAuth('Portal-JWT')`):**
```typescript
// Use Portal-JWT scheme, not JWT-auth
@ApiBearerAuth('Portal-JWT')
@Post('logout')
@Post('change-password')
// All dashboard, loads, documents, invoices controllers
```

### EDI Module
- Document X12 transaction types (204, 210, 214, 990, 997)
- Include EDI format examples in descriptions
- Note partner configuration requirements

### Rate Intelligence
- Document rate lookup parameters
- Include lane format examples
- Note data source integrations (DAT, Greenscreens)

### Safety Module
- Document FMCSA/CSA score types
- Include DOT number format examples
- Note external API dependencies

---

## Acceptance Criteria

**Prerequisite Fixes:**
- [x] Fixed `ApiBearerAuth()` → `ApiBearerAuth('JWT-auth')` in 5 helper functions
- [x] Fixed `ApiStandardResponse` schema to match `response.helper.ts`
- [x] Fixed `ApiPaginatedResponse` schema to match `response.helper.ts`
- [x] Added `'Portal-JWT'` bearer auth scheme to swagger.ts

**Documentation:**
- [x] All 84 controllers have `@ApiTags()` decorator
- [x] All 496 endpoints have `@ApiOperation()` decorator
- [x] All endpoints have appropriate `@ApiResponse()` decorators
- [x] All DTOs have `@ApiProperty()` on every property
- [x] Protected endpoints use correct auth scheme (`JWT-auth` or `Portal-JWT`)
- [x] Portal auth endpoints (login/register/etc) have NO `@ApiBearerAuth`
- [x] Swagger UI at `/api/docs` shows all endpoints
- [x] No "any" types in Swagger schemas

---

## Verification

```bash
# Start API and check Swagger
pnpm --filter api dev

# Open http://localhost:3001/api/docs
# Verify all 14 module tags appear
# Verify endpoints have descriptions

# Check for missing decorators
grep -r "@Controller" apps/api/src/modules/{contracts,credit,hr,workflow,agents,claims,factoring,safety,search,help-desk,edi,rate-intelligence,customer-portal,carrier-portal} --include="*.controller.ts" -A1 | grep -v "@ApiTags"
# Should return empty (all controllers have tags)
```

---

## Files to Modify

```
apps/api/src/modules/
├── contracts/
│   ├── controllers/*.controller.ts  # Add Swagger decorators
│   └── dto/*.dto.ts                 # Add @ApiProperty
├── credit/
├── hr/
├── workflow/
├── agents/
├── claims/
├── factoring/
├── safety/
├── search/
├── help-desk/
├── edi/
├── rate-intelligence/
├── customer-portal/
└── carrier-portal/
    (All controller and DTO files)
```

---

## ✅ After Completion - Update Progress

**IMPORTANT:** After completing this prompt, update the following files:

### 1. Update README.md Progress Tracker

In `dev_docs/11-ai-dev/api-dev-prompts-phase2/README.md`, update:

```markdown
| 18 | [Phase A Swagger](18-p5-phase-a-services-swagger.md) | P5 | 6-8h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics Table

In the same README.md, update the Current Status table:

```markdown
| Phase A Services Swagger | 0% | 100% | 100% |
```

### 3. Add Changelog Entry

Add to the Changelog section:

```markdown
### [Date] - Prompt 18: Phase A Services Swagger
**Completed by:** [Your Name]
**Time spent:** [X] hours

#### Changes
- Added @ApiTags() to 84 controllers
- Added @ApiOperation() to 496 endpoints
- Added @ApiProperty() to all DTOs in 14 modules
- Customer Portal, Carrier Portal, Contracts, Credit, HR, Workflow, Agents, Claims, Factoring, Safety, Search, Help Desk, EDI, Rate Intelligence now documented

#### Metrics Updated
- Phase A Services Swagger: 0% → 100%
```

### 4. Proceed to Next Prompt

➡️ **Next:** [19-p5-phase-a-services-e2e-expansion.md](19-p5-phase-a-services-e2e-expansion.md)
