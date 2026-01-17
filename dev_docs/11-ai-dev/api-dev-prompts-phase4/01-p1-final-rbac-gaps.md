# P1: Complete Final RBAC Gaps

## Priority: P1 - HIGH (Complete before full frontend)
## Estimated Time: 4 hours
## Dependencies: None

---

## Overview

4 controllers are missing `RolesGuard` protection. This prompt provides the exact changes needed to achieve 100% RBAC coverage on all P0 services.

---

## Current State

| Service | Controller | Current RBAC | Target |
|---------|------------|--------------|--------|
| Sales | `rate-contracts.controller.ts` | ❌ None | ✅ Full |
| Sales | `sales-performance.controller.ts` | ❌ None | ✅ Full |
| Sales | `accessorial-rates.controller.ts` | ❌ None | ✅ Full |
| Load Board | `load-tenders.controller.ts` | ❌ None | ✅ Full |

---

## Task 1: Sales - Rate Contracts Controller

**File:** `apps/api/src/modules/sales/rate-contracts.controller.ts`

### Required Changes

```typescript
// Add imports at top of file
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

// Add guards to controller class
@Controller('rate-contracts')
@UseGuards(JwtAuthGuard, RolesGuard)  // ADD THIS LINE
export class RateContractsController {
  
  // Add @Roles to each endpoint
  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'ACCOUNT_MANAGER')
  async findAll(...) { }
  
  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'ACCOUNT_MANAGER', 'SALES_REP')
  async findOne(...) { }
  
  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  async create(...) { }
  
  @Patch(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  async update(...) { }
  
  @Delete(':id')
  @Roles('ADMIN', 'SALES_MANAGER')
  async remove(...) { }
}
```

### Roles Rationale

| Role | Access | Reason |
|------|--------|--------|
| ADMIN | Full CRUD | System administration |
| SALES_MANAGER | Full CRUD | Manages sales team contracts |
| PRICING_ANALYST | Create/Update/Read | Responsible for rate management |
| ACCOUNT_MANAGER | Read only | Needs to view customer contracts |
| SALES_REP | Read specific only | Can view assigned customer contracts |

---

## Task 2: Sales - Sales Performance Controller

**File:** `apps/api/src/modules/sales/sales-performance.controller.ts`

### Required Changes

```typescript
// Add imports at top of file
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

// Add guards to controller class
@Controller('sales-performance')
@UseGuards(JwtAuthGuard, RolesGuard)  // ADD THIS LINE
export class SalesPerformanceController {
  
  // Add @Roles to each endpoint
  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE')
  async getPerformanceMetrics(...) { }
  
  @Get('dashboard')
  @Roles('ADMIN', 'SALES_MANAGER', 'EXECUTIVE')
  async getDashboard(...) { }
  
  @Get('rep/:userId')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP')  // SALES_REP can view own
  async getRepPerformance(...) { }
  
  @Get('team')
  @Roles('ADMIN', 'SALES_MANAGER')
  async getTeamPerformance(...) { }
  
  @Get('trends')
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE')
  async getTrends(...) { }
}
```

### Roles Rationale

| Role | Access | Reason |
|------|--------|--------|
| ADMIN | All metrics | System administration |
| SALES_MANAGER | All metrics | Manages sales team performance |
| OPERATIONS_MANAGER | Aggregate metrics | Cross-department visibility |
| EXECUTIVE | Aggregate metrics | Executive dashboards |
| SALES_REP | Own metrics only | Can view personal performance |

---

## Task 3: Sales - Accessorial Rates Controller

**File:** `apps/api/src/modules/sales/accessorial-rates.controller.ts`

### Required Changes

```typescript
// Add imports at top of file
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

// Add guards to controller class
@Controller('accessorial-rates')
@UseGuards(JwtAuthGuard, RolesGuard)  // ADD THIS LINE
export class AccessorialRatesController {
  
  // Add @Roles to each endpoint
  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'DISPATCHER', 'OPERATIONS')
  async findAll(...) { }
  
  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'DISPATCHER', 'OPERATIONS')
  async findOne(...) { }
  
  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  async create(...) { }
  
  @Patch(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  async update(...) { }
  
  @Delete(':id')
  @Roles('ADMIN', 'SALES_MANAGER')
  async remove(...) { }
}
```

### Roles Rationale

| Role | Access | Reason |
|------|--------|--------|
| ADMIN | Full CRUD | System administration |
| SALES_MANAGER | Full CRUD | Rate management ownership |
| PRICING_ANALYST | Create/Update/Read | Accessorial rate configuration |
| DISPATCHER | Read only | Needs rates for load building |
| OPERATIONS | Read only | Needs rates for cost calculations |

---

## Task 4: Load Board - Load Tenders Controller

**File:** `apps/api/src/modules/load-board/controllers/load-tenders.controller.ts`

### Required Changes

```typescript
// Add imports at top of file
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

// Add guards to controller class
@Controller('load-tenders')
@UseGuards(JwtAuthGuard, RolesGuard)  // ADD THIS LINE
export class LoadTendersController {
  
  // Add @Roles to each endpoint
  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'CARRIER_MANAGER')
  async findAll(...) { }
  
  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'CARRIER_MANAGER')
  async findOne(...) { }
  
  @Post()
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
  async create(...) { }
  
  @Post(':id/send')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
  async sendTender(...) { }
  
  @Patch(':id')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
  async update(...) { }
  
  @Post(':id/accept')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER')
  async acceptTender(...) { }
  
  @Post(':id/reject')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER')
  async rejectTender(...) { }
  
  @Delete(':id')
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  async remove(...) { }
}
```

### Roles Rationale

| Role | Access | Reason |
|------|--------|--------|
| ADMIN | Full CRUD | System administration |
| DISPATCHER | Create/Send/Accept/Reject | Core dispatch function |
| OPERATIONS_MANAGER | Create/Update/Delete | Operations oversight |
| SALES_MANAGER | Read only | Visibility into load tenders |
| CARRIER_MANAGER | Accept/Reject | Carrier relations management |

---

## Validation Steps

### 1. Run E2E Tests
```bash
pnpm run test:e2e -- --grep "sales|load-board"
```

### 2. Verify Guards are Applied
```bash
# Search for controllers without RolesGuard
grep -r "@Controller" apps/api/src/modules/sales --include="*.controller.ts" | \
  xargs -I {} sh -c 'grep -L "RolesGuard" {}'
```

### 3. Test Endpoint Access
```bash
# Test unauthorized access (should return 403)
curl -X GET http://localhost:3000/api/rate-contracts \
  -H "Authorization: Bearer <token_with_wrong_role>"
```

---

## Completion Checklist

- [ ] `rate-contracts.controller.ts` - Added JwtAuthGuard + RolesGuard
- [ ] `rate-contracts.controller.ts` - Added @Roles to all endpoints
- [ ] `sales-performance.controller.ts` - Added JwtAuthGuard + RolesGuard
- [ ] `sales-performance.controller.ts` - Added @Roles to all endpoints
- [ ] `accessorial-rates.controller.ts` - Added JwtAuthGuard + RolesGuard
- [ ] `accessorial-rates.controller.ts` - Added @Roles to all endpoints
- [ ] `load-tenders.controller.ts` - Added JwtAuthGuard + RolesGuard
- [ ] `load-tenders.controller.ts` - Added @Roles to all endpoints
- [ ] E2E tests pass
- [ ] Manual testing confirms role restrictions work

---

## Expected Outcome

After completing this prompt:
- Sales service: 40% → **100%** RBAC coverage
- Load Board service: 67% → **100%** RBAC coverage
- Overall P0 completion: 82% → **100%**
- Frontend team can proceed with all services
