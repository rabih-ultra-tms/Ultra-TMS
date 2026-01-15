import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { ReportsService } from '../services';
import { AgingReportDto, ReportQueryDto } from '../dto/reports.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN', 'ACCOUNTING', 'MANAGER')
@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  async getRevenueReport(
    @Query() query: ReportQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.getRevenueReport(tenantId, query);
  }

  @Get('aging')
  async getAgingReport(
    @Query() query: AgingReportDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.getAgingReport(tenantId, query);
  }

  @Get('payables')
  async getPayablesReport(
    @Query() query: AgingReportDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.getPayablesReport(tenantId, query);
  }
}
