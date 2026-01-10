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
import { SalesPerformanceService } from './sales-performance.service';
import { CreateSalesQuotaDto, UpdateSalesQuotaDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesPerformanceController {
  constructor(private readonly salesPerformanceService: SalesPerformanceService) {}

  @Get('quotas')
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
  async getQuota(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.salesPerformanceService.findOneQuota(tenantId, id);
  }

  @Post('quotas')
  async createQuota(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSalesQuotaDto,
  ) {
    return this.salesPerformanceService.createQuota(tenantId, userId, dto);
  }

  @Put('quotas/:id')
  async updateQuota(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSalesQuotaDto,
  ) {
    return this.salesPerformanceService.updateQuota(tenantId, id, userId, dto);
  }

  @Get('performance')
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
