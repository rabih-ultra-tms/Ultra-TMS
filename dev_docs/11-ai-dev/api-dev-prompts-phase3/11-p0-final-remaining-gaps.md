# P0-FINAL: Complete Remaining RBAC Gaps

## Priority: P0 - BLOCKER
## Estimated Time: 4 hours
## Status: Required to reach 95% frontend readiness

---

## Context

After the initial implementation, **4 controllers** are still missing RolesGuard:

| Service | Controller | Current State | Risk |
|---------|------------|---------------|------|
| Sales | `rate-contracts.controller.ts` | JwtAuthGuard only | Any authenticated user can modify rate contracts |
| Sales | `sales-performance.controller.ts` | JwtAuthGuard only | Any authenticated user can view/modify sales quotas |
| Sales | `accessorial-rates.controller.ts` | JwtAuthGuard only | Any authenticated user can modify pricing |
| Load Board | `load-tenders.controller.ts` | JwtAuthGuard only | Any authenticated user can create/respond to tenders |

---

## Implementation

### 1. Sales - Rate Contracts Controller

```typescript
// apps/api/src/modules/sales/rate-contracts.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RateContractsService } from './rate-contracts.service';
import { 
  CreateRateContractDto, 
  UpdateRateContractDto, 
  CreateLaneRateDto, 
  UpdateLaneRateDto 
} from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('rate-contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RateContractsController {
  constructor(private readonly rateContractsService: RateContractsService) {}

  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'PRICING_ANALYST')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.rateContractsService.findAll(tenantId, { page, limit, status, companyId });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'PRICING_ANALYST')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rateContractsService.findOne(tenantId, id);
  }

  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateRateContractDto,
    @CurrentUser() userId: string,
  ) {
    return this.rateContractsService.create(tenantId, dto, userId);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRateContractDto,
  ) {
    return this.rateContractsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_MANAGER')
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rateContractsService.remove(tenantId, id);
  }

  // Lane rates - pricing authority required
  @Post(':id/lanes')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  async addLaneRate(
    @CurrentTenant() tenantId: string,
    @Param('id') contractId: string,
    @Body() dto: CreateLaneRateDto,
  ) {
    return this.rateContractsService.addLaneRate(tenantId, contractId, dto);
  }

  @Put(':id/lanes/:laneId')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  async updateLaneRate(
    @CurrentTenant() tenantId: string,
    @Param('id') contractId: string,
    @Param('laneId') laneId: string,
    @Body() dto: UpdateLaneRateDto,
  ) {
    return this.rateContractsService.updateLaneRate(tenantId, contractId, laneId, dto);
  }

  @Delete(':id/lanes/:laneId')
  @Roles('ADMIN', 'SALES_MANAGER')
  async removeLaneRate(
    @CurrentTenant() tenantId: string,
    @Param('id') contractId: string,
    @Param('laneId') laneId: string,
  ) {
    return this.rateContractsService.removeLaneRate(tenantId, contractId, laneId);
  }
}
```

### 2. Sales - Sales Performance Controller

```typescript
// apps/api/src/modules/sales/sales-performance.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SalesPerformanceService } from './sales-performance.service';
import { CreateSalesQuotaDto, UpdateSalesQuotaDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesPerformanceController {
  constructor(private readonly salesPerformanceService: SalesPerformanceService) {}

  @Get('quotas')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP')
  async getQuotas(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('periodType') periodType?: string,
    @Query('status') status?: string,
  ) {
    return this.salesPerformanceService.findAllQuotas(tenantId, {
      page, limit, userId, periodType, status,
    });
  }

  @Get('quotas/:id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP')
  async getQuota(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.salesPerformanceService.findQuota(tenantId, id);
  }

  @Post('quotas')
  @Roles('ADMIN', 'SALES_MANAGER') // Only managers can set quotas
  async createQuota(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateSalesQuotaDto,
    @CurrentUser() userId: string,
  ) {
    return this.salesPerformanceService.createQuota(tenantId, dto, userId);
  }

  @Put('quotas/:id')
  @Roles('ADMIN', 'SALES_MANAGER')
  async updateQuota(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSalesQuotaDto,
  ) {
    return this.salesPerformanceService.updateQuota(tenantId, id, dto);
  }

  // Performance metrics - managers see all, reps see own
  @Get('performance')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP')
  async getPerformance(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Sales reps can only see their own performance
    const targetUserId = user.role === 'SALES_REP' ? user.id : userId;
    return this.salesPerformanceService.getPerformance(tenantId, targetUserId, { startDate, endDate });
  }

  @Get('performance/leaderboard')
  @Roles('ADMIN', 'SALES_MANAGER') // Only managers see leaderboard
  async getLeaderboard(
    @CurrentTenant() tenantId: string,
    @Query('periodType') periodType?: string,
  ) {
    return this.salesPerformanceService.getLeaderboard(tenantId, periodType);
  }
}
```

### 3. Sales - Accessorial Rates Controller

```typescript
// apps/api/src/modules/sales/accessorial-rates.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessorialRatesService } from './accessorial-rates.service';
import { CreateAccessorialRateDto, UpdateAccessorialRateDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('accessorial-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccessorialRatesController {
  constructor(private readonly accessorialRatesService: AccessorialRatesService) {}

  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'PRICING_ANALYST', 'DISPATCHER')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
  ) {
    return this.accessorialRatesService.findAll(tenantId, { page, limit, type });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'PRICING_ANALYST', 'DISPATCHER')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accessorialRatesService.findOne(tenantId, id);
  }

  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST') // Pricing authority required
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAccessorialRateDto,
  ) {
    return this.accessorialRatesService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccessorialRateDto,
  ) {
    return this.accessorialRatesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_MANAGER') // Only managers can delete rates
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accessorialRatesService.remove(tenantId, id);
  }
}
```

### 4. Load Board - Load Tenders Controller

```typescript
// apps/api/src/modules/load-board/controllers/load-tenders.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { LoadTendersService } from '../services';
import { CreateLoadTenderDto, UpdateLoadTenderDto, RespondToTenderDto } from '../dto';

@Controller('load-tenders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoadTendersController {
  constructor(private readonly loadTendersService: LoadTendersService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
  async create(@Request() req: any, @Body() createDto: CreateLoadTenderDto) {
    return this.loadTendersService.create(req.user.tenantId, createDto, req.user.sub);
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER', 'CARRIER_MANAGER')
  async findAll(
    @Request() req: any,
    @Query('loadId') loadId?: string,
    @Query('status') status?: string,
  ) {
    return this.loadTendersService.findAll(req.user.tenantId, loadId, status);
  }

  @Get('carrier/:carrierId/active')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'CARRIER')
  async getActiveForCarrier(@Request() req: any, @Param('carrierId') carrierId: string) {
    return this.loadTendersService.getActiveForCarrier(req.user.tenantId, carrierId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER', 'CARRIER_MANAGER', 'CARRIER')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loadTendersService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateLoadTenderDto,
  ) {
    return this.loadTendersService.update(req.user.tenantId, id, updateDto);
  }

  @Post(':id/respond')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'CARRIER')
  async respond(
    @Request() req: any,
    @Param('id') id: string,
    @Body() respondDto: RespondToTenderDto,
  ) {
    return this.loadTendersService.respond(req.user.tenantId, id, respondDto, req.user.sub);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
  async cancel(@Request() req: any, @Param('id') id: string) {
    return this.loadTendersService.cancel(req.user.tenantId, id);
  }
}
```

---

## Verification

```bash
# Test rate contracts - should require auth + role
curl http://localhost:3001/rate-contracts # 401
curl -H "Authorization: Bearer $DISPATCHER_TOKEN" http://localhost:3001/rate-contracts # 403
curl -H "Authorization: Bearer $SALES_REP_TOKEN" http://localhost:3001/rate-contracts # 200

# Test sales performance - managers see all, reps see own
curl -H "Authorization: Bearer $SALES_REP_TOKEN" http://localhost:3001/sales/performance/leaderboard # 403
curl -H "Authorization: Bearer $SALES_MANAGER_TOKEN" http://localhost:3001/sales/performance/leaderboard # 200

# Test load tenders - dispatcher can create, carrier can respond
curl -X POST -H "Authorization: Bearer $DISPATCHER_TOKEN" http://localhost:3001/load-tenders # 201
curl -X POST -H "Authorization: Bearer $CARRIER_TOKEN" http://localhost:3001/load-tenders/123/respond # 200
```

---

## Files to Modify

- [ ] `apps/api/src/modules/sales/rate-contracts.controller.ts`
- [ ] `apps/api/src/modules/sales/sales-performance.controller.ts`
- [ ] `apps/api/src/modules/sales/accessorial-rates.controller.ts`
- [ ] `apps/api/src/modules/load-board/controllers/load-tenders.controller.ts`

---

## Success Criteria

- [ ] All 4 controllers have `@UseGuards(JwtAuthGuard, RolesGuard)`
- [ ] All endpoints have `@Roles(...)` decorator
- [ ] Pricing operations restricted to managers/pricing analysts
- [ ] Sales performance leaderboard restricted to managers
- [ ] Load tenders creation restricted to dispatchers
- [ ] Tender responses allowed for carriers
- [ ] E2E tests verify role enforcement
