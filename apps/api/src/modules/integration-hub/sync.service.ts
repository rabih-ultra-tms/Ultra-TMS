import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ExecutionStatus, Prisma, SyncDirection } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  ApiLogListResponseDto,
  ApiLogQueryDto,
  ApiLogResponseDto,
  CreateSyncJobDto,
  CreateTransformationDto,
  SyncJobListResponseDto,
  SyncJobQueryDto,
  SyncJobResponseDto,
  TransformTestDto,
  TransformTestResponseDto,
  TransformationListResponseDto,
  TransformationResponseDto,
  UpdateTransformationDto,
} from './dto';

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  // Sync jobs
  async listJobs(tenantId: string, query: SyncJobQueryDto): Promise<SyncJobListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SyncJobWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.integrationId ? { integrationId: query.integrationId } : {}),
      ...(query.jobType ? { jobType: query.jobType } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.syncJob.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.syncJob.count({ where }),
    ]);

    return {
      data: rows.map(r => this.toJobDto(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getJob(tenantId: string, id: string): Promise<SyncJobResponseDto> {
    const job = await this.prisma.syncJob.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!job) {
      throw new NotFoundException('Sync job not found');
    }
    return this.toJobDto(job);
  }

  async createJob(tenantId: string, userId: string, dto: CreateSyncJobDto): Promise<SyncJobResponseDto> {
    const integration = await this.prisma.integration.findFirst({ where: { id: dto.integrationId, tenantId, deletedAt: null } });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const job = await this.prisma.syncJob.create({
      data: {
        tenantId,
        integrationId: dto.integrationId,
        jobType: dto.jobType,
        direction: dto.direction,
        schedule: dto.schedule,
        customFields: dto.filters ? ({ filters: dto.filters } as Prisma.InputJsonValue) : undefined,
        status: ExecutionStatus.PENDING,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.getJob(tenantId, job.id);
  }

  async cancelJob(tenantId: string, id: string, userId: string): Promise<SyncJobResponseDto> {
    const job = await this.getJob(tenantId, id);

    const cancellable: ExecutionStatus[] = [ExecutionStatus.PENDING, ExecutionStatus.RUNNING];
    if (!cancellable.includes(job.status)) {
      throw new BadRequestException('Job cannot be cancelled in the current status');
    }

    await this.prisma.syncJob.update({
      where: { id },
      data: { status: ExecutionStatus.CANCELLED, lastError: 'Cancelled by user', updatedById: userId },
    });

    return this.getJob(tenantId, id);
  }

  async getProgress(tenantId: string, id: string) {
    const job = await this.getJob(tenantId, id);
    const processed = job.recordsProcessed ?? 0;
    const failed = job.recordsFailed ?? 0;
    const total = processed + failed;
    const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;

    return { ...job, progressPercent };
  }

  async getErrors(tenantId: string, id: string): Promise<string[]> {
    const job = await this.getJob(tenantId, id);
    return job.lastError ? [job.lastError] : [];
  }

  // API logs (read-only, tenant scoped)
  async listLogs(tenantId: string, query: ApiLogQueryDto): Promise<ApiLogListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.APIRequestLogWhereInput = {
      tenantId,
      ...(query.integrationId ? { integrationId: query.integrationId } : {}),
      ...(query.method ? { method: query.method } : {}),
      ...(query.endpoint ? { endpoint: { contains: query.endpoint, mode: 'insensitive' } } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.aPIRequestLog.findMany({ where, skip, take: limit, orderBy: { timestamp: 'desc' } }),
      this.prisma.aPIRequestLog.count({ where }),
    ]);

    return {
      data: rows.map(row => this.toLogDto(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLog(tenantId: string, id: string): Promise<ApiLogResponseDto> {
    const log = await this.prisma.aPIRequestLog.findFirst({ where: { id, tenantId } });
    if (!log) {
      throw new NotFoundException('API log not found');
    }
    return this.toLogDto(log);
  }

  // Transformation templates
  async listTransformations(tenantId: string): Promise<TransformationListResponseDto> {
    const templates = await this.prisma.transformationTemplate.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: templates.map(t => this.toTransformationDto(t)),
      total: templates.length,
    };
  }

  async getTransformation(tenantId: string, id: string): Promise<TransformationResponseDto> {
    const template = await this.prisma.transformationTemplate.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!template) {
      throw new NotFoundException('Transformation template not found');
    }
    return this.toTransformationDto(template);
  }

  async createTransformation(
    tenantId: string,
    userId: string,
    dto: CreateTransformationDto,
  ): Promise<TransformationResponseDto> {
    const template = await this.prisma.transformationTemplate.create({
      data: {
        tenantId,
        templateName: dto.templateName,
        sourceFormat: dto.sourceFormat,
        targetFormat: dto.targetFormat,
        transformationLogic: dto.transformationLogic,
        testCases: (dto.testCases ?? []) as Prisma.InputJsonValue,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.toTransformationDto(template);
  }

  async updateTransformation(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateTransformationDto,
  ): Promise<TransformationResponseDto> {
    await this.getTransformation(tenantId, id);

    const data: Prisma.TransformationTemplateUpdateInput = {
      ...(dto.templateName !== undefined ? { templateName: dto.templateName } : {}),
      ...(dto.sourceFormat !== undefined ? { sourceFormat: dto.sourceFormat } : {}),
      ...(dto.targetFormat !== undefined ? { targetFormat: dto.targetFormat } : {}),
      ...(dto.transformationLogic !== undefined ? { transformationLogic: dto.transformationLogic } : {}),
      ...(dto.testCases !== undefined ? { testCases: dto.testCases as Prisma.InputJsonValue } : {}),
      ...(dto.isActive !== undefined ? { deletedAt: dto.isActive ? null : new Date() } : {}),
      updatedById: userId,
    };

    await this.prisma.transformationTemplate.update({ where: { id }, data });
    return this.getTransformation(tenantId, id);
  }

  async deleteTransformation(tenantId: string, id: string): Promise<void> {
    await this.getTransformation(tenantId, id);
    await this.prisma.transformationTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async testTransformation(tenantId: string, dto: TransformTestDto): Promise<TransformTestResponseDto> {
    let logic = dto.transformationLogic;

    if (dto.templateId) {
      const template = await this.getTransformation(tenantId, dto.templateId);
      logic = logic ?? template.transformationLogic;
    }

    if (!logic) {
      return { success: false, error: 'No transformation logic provided' };
    }

    try {
      // Placeholder transformation: echo sourceData with metadata
      const result = { ...dto.sourceData, _transformation: 'applied', _logicPreview: logic } as Record<string, unknown>;
      return { success: true, result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private toJobDto(job: any): SyncJobResponseDto {
    const customFields = (job.customFields ?? {}) as Record<string, unknown>;
    const filters = (customFields.filters as Record<string, unknown>) ?? undefined;

    return {
      id: job.id,
      integrationId: job.integrationId,
      jobType: job.jobType,
      direction: job.direction as SyncDirection,
      schedule: job.schedule,
      filters,
      lastSyncAt: job.lastSyncAt,
      recordsProcessed: job.recordsProcessed,
      recordsFailed: job.recordsFailed,
      status: job.status as ExecutionStatus,
      lastError: job.lastError,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  private toLogDto(log: any): ApiLogResponseDto {
    return {
      id: log.id,
      integrationId: log.integrationId,
      endpoint: log.endpoint,
      method: log.method,
      responseStatus: log.responseStatus,
      durationMs: log.durationMs,
      timestamp: log.timestamp,
    };
  }

  private toTransformationDto(template: any): TransformationResponseDto {
    return {
      id: template.id,
      templateName: template.templateName,
      sourceFormat: template.sourceFormat,
      targetFormat: template.targetFormat,
      transformationLogic: template.transformationLogic,
      testCases: JSON.parse(JSON.stringify(template.testCases ?? [])),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
