import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
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
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('integration-hub/sync-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Integration Hub')
@ApiBearerAuth('JWT-auth')
export class SyncJobsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  @ApiOperation({ summary: 'List sync jobs' })
  @ApiStandardResponse('Sync jobs list')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listJobs(
    @CurrentTenant() tenantId: string,
    @Query() query: SyncJobQueryDto,
  ) {
    return this.syncService.listJobs(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sync job by ID' })
  @ApiParam({ name: 'id', description: 'Sync job ID' })
  @ApiStandardResponse('Sync job details')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async getJob(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getJob(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create sync job' })
  @ApiStandardResponse('Sync job created')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async createJob(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSyncJobDto,
  ) {
    return this.syncService.createJob(tenantId, userId, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel sync job' })
  @ApiParam({ name: 'id', description: 'Sync job ID' })
  @ApiStandardResponse('Sync job canceled')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async cancelJob(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.syncService.cancelJob(tenantId, id, userId);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get sync job progress' })
  @ApiParam({ name: 'id', description: 'Sync job ID' })
  @ApiStandardResponse('Sync job progress')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async getProgress(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getProgress(tenantId, id);
  }

  @Get(':id/errors')
  @ApiOperation({ summary: 'Get sync job errors' })
  @ApiParam({ name: 'id', description: 'Sync job ID' })
  @ApiStandardResponse('Sync job errors')
  @ApiErrorResponses()
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
@ApiTags('Integration Hub')
@ApiBearerAuth('JWT-auth')
export class ApiLogsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  @ApiOperation({ summary: 'List API logs' })
  @ApiStandardResponse('API logs list')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listLogs(
    @CurrentTenant() tenantId: string,
    @Query() query: ApiLogQueryDto,
  ) {
    return this.syncService.listLogs(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API log by ID' })
  @ApiParam({ name: 'id', description: 'API log ID' })
  @ApiStandardResponse('API log details')
  @ApiErrorResponses()
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
@ApiTags('Integration Hub')
@ApiBearerAuth('JWT-auth')
export class TransformationsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  @ApiOperation({ summary: 'List transformations' })
  @ApiStandardResponse('Transformations list')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async listTransformations(@CurrentTenant() tenantId: string) {
    return this.syncService.listTransformations(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transformation by ID' })
  @ApiParam({ name: 'id', description: 'Transformation ID' })
  @ApiStandardResponse('Transformation details')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async getTransformation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getTransformation(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create transformation' })
  @ApiStandardResponse('Transformation created')
  @ApiErrorResponses()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  async createTransformation(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTransformationDto,
  ) {
    return this.syncService.createTransformation(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transformation' })
  @ApiParam({ name: 'id', description: 'Transformation ID' })
  @ApiStandardResponse('Transformation updated')
  @ApiErrorResponses()
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
