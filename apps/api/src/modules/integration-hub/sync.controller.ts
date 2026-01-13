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

@Controller('integration-hub/sync-jobs')
@UseGuards(JwtAuthGuard)
export class SyncJobsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async listJobs(
    @CurrentTenant() tenantId: string,
    @Query() query: SyncJobQueryDto,
  ) {
    return this.syncService.listJobs(tenantId, query);
  }

  @Get(':id')
  async getJob(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getJob(tenantId, id);
  }

  @Post()
  async createJob(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSyncJobDto,
  ) {
    return this.syncService.createJob(tenantId, userId, dto);
  }

  @Post(':id/cancel')
  async cancelJob(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.syncService.cancelJob(tenantId, id, userId);
  }

  @Get(':id/progress')
  async getProgress(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getProgress(tenantId, id);
  }

  @Get(':id/errors')
  async getErrors(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getErrors(tenantId, id);
  }
}

@Controller('integration-hub/api-logs')
@UseGuards(JwtAuthGuard)
export class ApiLogsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async listLogs(
    @CurrentTenant() tenantId: string,
    @Query() query: ApiLogQueryDto,
  ) {
    return this.syncService.listLogs(tenantId, query);
  }

  @Get(':id')
  async getLog(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getLog(tenantId, id);
  }
}

@Controller('integration-hub/transformations')
@UseGuards(JwtAuthGuard)
export class TransformationsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async listTransformations(@CurrentTenant() tenantId: string) {
    return this.syncService.listTransformations(tenantId);
  }

  @Get(':id')
  async getTransformation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getTransformation(tenantId, id);
  }

  @Post()
  async createTransformation(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTransformationDto,
  ) {
    return this.syncService.createTransformation(tenantId, userId, dto);
  }

  @Put(':id')
  async updateTransformation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateTransformationDto,
  ) {
    return this.syncService.updateTransformation(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async deleteTransformation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.syncService.deleteTransformation(tenantId, id);
    return { success: true };
  }

  @Post('test')
  async testTransformation(
    @CurrentTenant() tenantId: string,
    @Body() dto: TransformTestDto,
  ) {
    return this.syncService.testTransformation(tenantId, dto);
  }
}
