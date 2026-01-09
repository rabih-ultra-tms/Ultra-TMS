import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { SyncService } from './sync.service';
import {
  SyncJobQueryDto,
  CreateSyncJobDto,
  ApiLogQueryDto,
  CreateTransformationDto,
  UpdateTransformationDto,
  TransformPreviewDto,
} from './dto';

@Controller('integration-hub/sync-jobs')
@UseGuards(JwtAuthGuard)
export class SyncJobsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: SyncJobQueryDto,
  ) {
    return this.syncService.findAllJobs(tenantId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.findJob(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSyncJobDto,
  ) {
    return this.syncService.createJob(tenantId, userId, dto);
  }

  @Post(':id/cancel')
  async cancel(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.cancelJob(tenantId, id);
  }

  @Get(':id/progress')
  async getProgress(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getJobProgress(tenantId, id);
  }

  @Get(':id/errors')
  async getErrors(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.getJobErrors(tenantId, id);
  }
}

@Controller('integration-hub/api-logs')
@UseGuards(JwtAuthGuard)
export class ApiLogsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: ApiLogQueryDto,
  ) {
    return this.syncService.findAllLogs(tenantId, query);
  }

  @Get('search')
  async search(
    @CurrentTenant() tenantId: string,
    @Query() query: ApiLogQueryDto,
  ) {
    return this.syncService.searchLogs(tenantId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.findLog(tenantId, id);
  }
}

@Controller('integration-hub/transformations')
@UseGuards(JwtAuthGuard)
export class TransformationsController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.syncService.findAllTransformations(tenantId);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.syncService.findTransformation(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateTransformationDto,
  ) {
    return this.syncService.createTransformation(tenantId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransformationDto,
  ) {
    return this.syncService.updateTransformation(tenantId, id, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.syncService.deleteTransformation(tenantId, id);
    return { success: true };
  }

  @Post('preview')
  async preview(
    @CurrentTenant() tenantId: string,
    @Body() dto: TransformPreviewDto,
  ) {
    return this.syncService.previewTransformation(tenantId, dto);
  }

  @Post('validate')
  async validate(
    @CurrentTenant() tenantId: string,
    @Body() dto: TransformPreviewDto,
  ) {
    return this.syncService.validateMapping(tenantId, dto);
  }
}
