import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import {
  CreateReportDto,
  UpdateReportDto,
  ExecuteReportDto,
  UpdateScheduleDto,
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  ReportCategory,
} from './dto';

@Controller('analytics/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('category') category?: ReportCategory,
    @Query('isScheduled') isScheduled?: string,
  ) {
    return this.reportsService.findAll(
      tenantId,
      category,
      isScheduled === 'true' ? true : isScheduled === 'false' ? false : undefined,
    );
  }

  @Get('templates')
  findAllTemplates(@CurrentTenant() tenantId: string) {
    return this.reportsService.findAllTemplates(tenantId);
  }

  @Get('templates/:id')
  findTemplate(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.reportsService.findTemplate(tenantId, id);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.reportsService.findOne(tenantId, id);
  }

  @Get(':id/executions')
  getExecutions(
    @CurrentTenant() tenantId: string,
    @Param('id') reportId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getExecutions(
      tenantId,
      reportId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':reportId/executions/:executionId')
  getExecution(
    @CurrentTenant() tenantId: string,
    @Param('reportId') reportId: string,
    @Param('executionId') executionId: string,
  ) {
    return this.reportsService.getExecution(tenantId, reportId, executionId);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(tenantId, userId, dto);
  }

  @Post('templates')
  createTemplate(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateReportTemplateDto,
  ) {
    return this.reportsService.createTemplate(tenantId, userId, dto);
  }

  @Post(':id/execute')
  execute(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: ExecuteReportDto,
  ) {
    return this.reportsService.execute(tenantId, userId, id, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportsService.update(tenantId, userId, id, dto);
  }

  @Patch(':id/schedule')
  updateSchedule(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.reportsService.updateSchedule(tenantId, userId, id, dto);
  }

  @Patch('templates/:id')
  updateTemplate(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReportTemplateDto,
  ) {
    return this.reportsService.updateTemplate(tenantId, userId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.reportsService.delete(tenantId, id);
  }

  @Delete('templates/:id')
  deleteTemplate(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.reportsService.deleteTemplate(tenantId, id);
  }
}
