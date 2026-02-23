import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CommissionsDashboardService } from '../services/commissions-dashboard.service';

@Controller('commissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Commission')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER', 'SALES_MANAGER', 'SUPER_ADMIN')
export class CommissionsDashboardController {
  constructor(
    private readonly dashboardService: CommissionsDashboardService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get commission dashboard stats' })
  @ApiStandardResponse('Commission dashboard data')
  @ApiErrorResponses()
  getDashboard(@CurrentTenant() tenantId: string) {
    return this.dashboardService.getDashboard(tenantId);
  }

  @Get('reps')
  @ApiOperation({ summary: 'List commission reps' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiStandardResponse('Commission reps list')
  @ApiErrorResponses()
  listReps(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.dashboardService.listReps(tenantId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      status,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });
  }

  @Get('reps/:id')
  @ApiOperation({ summary: 'Get commission rep by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('Commission rep details')
  @ApiErrorResponses()
  getRep(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.dashboardService.getRep(tenantId, id);
  }

  @Get('reps/:id/transactions')
  @ApiOperation({ summary: 'Get rep commission transactions' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Rep transactions')
  @ApiErrorResponses()
  getRepTransactions(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getRepTransactions(
      tenantId,
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('reps/:id/plan')
  @ApiOperation({ summary: 'Assign commission plan to rep' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('Plan assigned')
  @ApiErrorResponses()
  assignPlan(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('planId') planId: string,
  ) {
    return this.dashboardService.assignPlan(tenantId, id, planId);
  }
}
