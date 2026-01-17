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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { SalesPerformanceService } from './sales-performance.service';
import { CreateSalesQuotaDto, UpdateSalesQuotaDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Sales')
@ApiBearerAuth('JWT-auth')
export class SalesPerformanceController {
  constructor(private readonly salesPerformanceService: SalesPerformanceService) {}

  @Get('quotas')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'EXECUTIVE')
  @ApiOperation({ summary: 'List sales quotas' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'periodType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiStandardResponse('Sales quotas list')
  @ApiErrorResponses()
  async getQuotas(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('periodType') periodType?: string,
    @Query('status') status?: string,
  ) {
    return this.salesPerformanceService.findAllQuotas(tenantId, {
      page,
      limit,
      userId,
      periodType,
      status,
    });
  }

  @Get('quotas/:id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'EXECUTIVE')
  @ApiOperation({ summary: 'Get sales quota by ID' })
  @ApiParam({ name: 'id', description: 'Quota ID' })
  @ApiStandardResponse('Sales quota details')
  @ApiErrorResponses()
  async getQuota(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.salesPerformanceService.findOneQuota(tenantId, id);
  }

  @Post('quotas')
  @Roles('ADMIN', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Create sales quota' })
  @ApiStandardResponse('Sales quota created')
  @ApiErrorResponses()
  async createQuota(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSalesQuotaDto,
  ) {
    return this.salesPerformanceService.createQuota(tenantId, userId, dto);
  }

  @Put('quotas/:id')
  @Roles('ADMIN', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Update sales quota' })
  @ApiParam({ name: 'id', description: 'Quota ID' })
  @ApiStandardResponse('Sales quota updated')
  @ApiErrorResponses()
  async updateQuota(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSalesQuotaDto,
  ) {
    return this.salesPerformanceService.updateQuota(tenantId, id, userId, dto);
  }

  @Get('performance')
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE', 'SALES_REP')
  @ApiOperation({ summary: 'Get sales performance' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiStandardResponse('Sales performance')
  @ApiErrorResponses()
  async getPerformance(
    @CurrentTenant() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    return this.salesPerformanceService.getPerformance(tenantId, {
      startDate,
      endDate,
      userId,
    });
  }

  @Get('leaderboard')
  @Roles('ADMIN', 'SALES_MANAGER', 'EXECUTIVE')
  @ApiOperation({ summary: 'Get sales leaderboard' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiStandardResponse('Sales leaderboard')
  @ApiErrorResponses()
  async getLeaderboard(
    @CurrentTenant() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesPerformanceService.getLeaderboard(tenantId, {
      startDate,
      endDate,
    });
  }

  @Get('conversion-metrics')
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE', 'SALES_REP')
  @ApiOperation({ summary: 'Get conversion metrics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiStandardResponse('Conversion metrics')
  @ApiErrorResponses()
  async getConversionMetrics(
    @CurrentTenant() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    return this.salesPerformanceService.getConversionMetrics(tenantId, {
      startDate,
      endDate,
      userId,
    });
  }

  @Get('win-loss')
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE', 'SALES_REP')
  @ApiOperation({ summary: 'Get win-loss analysis' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiStandardResponse('Win-loss analysis')
  @ApiErrorResponses()
  async getWinLoss(
    @CurrentTenant() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    return this.salesPerformanceService.getWinLossAnalysis(tenantId, {
      startDate,
      endDate,
      userId,
    });
  }
}
