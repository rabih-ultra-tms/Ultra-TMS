import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { CreateReportDto, ExecuteReportDto, ExecutionQueryDto, UpdateReportDto, UpdateScheduleDto } from './dto';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('analytics/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Post()
  @Roles('ADMIN')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Patch(':id/schedule')
  @Roles('ADMIN')
  updateSchedule(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.service.updateSchedule(tenantId, userId, id, dto);
  }

  @Post(':id/execute')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  execute(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ExecuteReportDto,
  ) {
    return this.service.execute(tenantId, userId, id, dto);
  }

  @Get(':id/executions')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  executions(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: ExecutionQueryDto,
  ) {
    return this.service.executions(tenantId, id, query);
  }

  @Get(':id/executions/:executionId')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  execution(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('executionId') executionId: string,
  ) {
    return this.service.execution(tenantId, id, executionId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
