import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { SyncService } from './sync.service';
import {
  ApiLogQueryDto,
  CreateSyncJobDto,
  CreateTransformationDto,
  SyncJobQueryDto,
  TransformTestDto,
  UpdateTransformationDto,
} from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('integration-hub/sync-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SyncJobsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listJobs(
    @CurrentTenant() tenantId: string,
    @Query() query: SyncJobQueryDto,
  ) {
    return this.syncService.listJobs(tenantId, query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async getJob(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getJob(tenantId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async createJob(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSyncJobDto,
  ) {
    return this.syncService.createJob(tenantId, userId, dto);
  }

  @Post(':id/cancel')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async cancelJob(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.syncService.cancelJob(tenantId, id, userId);
  }

  @Get(':id/progress')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async getProgress(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getProgress(tenantId, id);
  }

  @Get(':id/errors')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async getErrors(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getErrors(tenantId, id);
  }
}

@Controller('integration-hub/api-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiLogsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listLogs(
    @CurrentTenant() tenantId: string,
    @Query() query: ApiLogQueryDto,
  ) {
    return this.syncService.listLogs(tenantId, query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async getLog(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getLog(tenantId, id);
  }
}

@Controller('integration-hub/transformations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransformationsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listTransformations(@CurrentTenant() tenantId: string) {
    return this.syncService.listTransformations(tenantId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async getTransformation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getTransformation(tenantId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async createTransformation(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTransformationDto,
  ) {
    return this.syncService.createTransformation(tenantId, userId, dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async updateTransformation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateTransformationDto,
  ) {
    return this.syncService.updateTransformation(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async deleteTransformation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.syncService.deleteTransformation(tenantId, id);
    return { success: true };
  }

  @Post('test')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async testTransformation(
    @CurrentTenant() tenantId: string,
    @Body() dto: TransformTestDto,
  ) {
    return this.syncService.testTransformation(tenantId, dto);
  }
}
