import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { CreateReportDto, ExecuteReportDto, ExecutionQueryDto, UpdateReportDto, UpdateScheduleDto } from './dto';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('analytics/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  @ApiOperation({ summary: 'List reports' })
  @ApiStandardResponse('Reports list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiStandardResponse('Report details')
  @ApiErrorResponses()
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create report' })
  @ApiStandardResponse('Report created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiStandardResponse('Report updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Update report schedule' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiStandardResponse('Report schedule updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Execute report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiStandardResponse('Report execution started')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'List report executions' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiStandardResponse('Report executions list')
  @ApiErrorResponses()
  executions(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: ExecutionQueryDto,
  ) {
    return this.service.executions(tenantId, id, query);
  }

  @Get(':id/executions/:executionId')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  @ApiOperation({ summary: 'Get report execution by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiParam({ name: 'executionId', description: 'Execution ID' })
  @ApiStandardResponse('Report execution details')
  @ApiErrorResponses()
  execution(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('executionId') executionId: string,
  ) {
    return this.service.execution(tenantId, id, executionId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiStandardResponse('Report deleted')
  @ApiErrorResponses()
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
