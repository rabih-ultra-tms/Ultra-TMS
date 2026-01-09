import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateSyncJobDto,
  SyncJobQueryDto,
  SyncJobResponseDto,
  SyncJobListResponseDto,
  SyncJobProgressDto,
  ApiLogQueryDto,
  ApiLogResponseDto,
  ApiLogListResponseDto,
  CreateTransformationDto,
  UpdateTransformationDto,
  TransformationResponseDto,
  TransformationListResponseDto,
  TransformPreviewDto,
  TransformPreviewResponseDto,
} from './dto';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // SYNC JOBS
  // ============================================
  async findAllJobs(tenantId: string, query: SyncJobQueryDto): Promise<SyncJobListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (query.integrationId) {
      where.integrationId = query.integrationId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.jobType) {
      where.jobType = query.jobType;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.syncJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          integration: { select: { name: true } },
        },
      }),
      this.prisma.syncJob.count({ where }),
    ]);

    return {
      data: jobs.map(j => this.toJobDto(j)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findJob(tenantId: string, id: string): Promise<SyncJobResponseDto> {
    const job = await this.prisma.syncJob.findFirst({
      where: { id, tenantId },
      include: {
        integration: { select: { name: true } },
      },
    });

    if (!job) {
      throw new NotFoundException('Sync job not found');
    }

    return this.toJobDto(job);
  }

  async createJob(
    tenantId: string,
    userId: string,
    dto: CreateSyncJobDto,
  ): Promise<SyncJobResponseDto> {
    // Verify integration belongs to tenant
    const integration = await this.prisma.integration.findFirst({
      where: { id: dto.integrationId, tenantId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const job = await this.prisma.syncJob.create({
      data: {
        tenantId,
        integrationId: dto.integrationId,
        jobType: dto.jobType,
        entityType: dto.entityType,
        direction: dto.direction,
        filters: dto.filters as any,
        scheduledBy: 'MANUAL',
        createdBy: userId,
      },
      include: {
        integration: { select: { name: true } },
      },
    });

    // Simulate job start
    await this.prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        totalRecords: Math.floor(Math.random() * 100) + 10,
      },
    });

    return this.findJob(tenantId, job.id);
  }

  async cancelJob(tenantId: string, id: string): Promise<SyncJobResponseDto> {
    const job = await this.findJob(tenantId, id);

    if (!['PENDING', 'RUNNING'].includes(job.status)) {
      throw new BadRequestException('Job cannot be cancelled in current status');
    }

    await this.prisma.syncJob.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    return this.findJob(tenantId, id);
  }

  async getJobProgress(tenantId: string, id: string): Promise<SyncJobProgressDto> {
    const job = await this.findJob(tenantId, id);

    const progressPercent = job.totalRecords > 0
      ? Math.round((job.processedRecords / job.totalRecords) * 100)
      : 0;

    return {
      id: job.id,
      status: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      successCount: job.successCount,
      errorCount: job.errorCount,
      progressPercent,
    };
  }

  async getJobErrors(tenantId: string, id: string): Promise<Record<string, unknown>[]> {
    const job = await this.findJob(tenantId, id);
    return job.errorDetails || [];
  }

  // ============================================
  // API LOGS
  // ============================================
  async findAllLogs(tenantId: string, query: ApiLogQueryDto): Promise<ApiLogListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (query.integrationId) {
      where.integrationId = query.integrationId;
    }

    if (query.direction) {
      where.direction = query.direction;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.correlationId) {
      where.correlationId = query.correlationId;
    }

    if (query.method) {
      where.method = query.method;
    }

    if (query.path) {
      where.path = { contains: query.path, mode: 'insensitive' };
    }

    const [logs, total] = await Promise.all([
      this.prisma.apiRequestLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          integration: { select: { name: true } },
        },
      }),
      this.prisma.apiRequestLog.count({ where }),
    ]);

    return {
      data: logs.map(l => this.toLogDto(l)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findLog(tenantId: string, id: string): Promise<ApiLogResponseDto> {
    const log = await this.prisma.apiRequestLog.findFirst({
      where: { id, tenantId },
      include: {
        integration: { select: { name: true } },
      },
    });

    if (!log) {
      throw new NotFoundException('API log not found');
    }

    return this.toLogDto(log);
  }

  async searchLogs(tenantId: string, query: ApiLogQueryDto): Promise<ApiLogListResponseDto> {
    return this.findAllLogs(tenantId, query);
  }

  // ============================================
  // TRANSFORMATIONS
  // ============================================
  async findAllTransformations(tenantId: string): Promise<TransformationListResponseDto> {
    const templates = await this.prisma.transformationTemplate.findMany({
      where: {
        OR: [
          { tenantId },
          { tenantId: null, isSystem: true },
        ],
        isActive: true,
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });

    return {
      data: templates.map(t => this.toTransformationDto(t)),
      total: templates.length,
    };
  }

  async findTransformation(tenantId: string, id: string): Promise<TransformationResponseDto> {
    const template = await this.prisma.transformationTemplate.findFirst({
      where: {
        id,
        OR: [
          { tenantId },
          { tenantId: null, isSystem: true },
        ],
      },
    });

    if (!template) {
      throw new NotFoundException('Transformation template not found');
    }

    return this.toTransformationDto(template);
  }

  async createTransformation(
    tenantId: string,
    dto: CreateTransformationDto,
  ): Promise<TransformationResponseDto> {
    const template = await this.prisma.transformationTemplate.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        sourceFormat: dto.sourceFormat,
        targetFormat: dto.targetFormat,
        mappingRules: dto.mappingRules as any,
        validationRules: dto.validationRules as any,
        category: dto.category,
        isSystem: false,
      },
    });

    return this.toTransformationDto(template);
  }

  async updateTransformation(
    tenantId: string,
    id: string,
    dto: UpdateTransformationDto,
  ): Promise<TransformationResponseDto> {
    const existing = await this.prisma.transformationTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Transformation template not found or is a system template');
    }

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.mappingRules !== undefined) updateData.mappingRules = dto.mappingRules;
    if (dto.validationRules !== undefined) updateData.validationRules = dto.validationRules;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.prisma.transformationTemplate.update({
      where: { id },
      data: updateData,
    });

    return this.findTransformation(tenantId, id);
  }

  async deleteTransformation(tenantId: string, id: string): Promise<void> {
    const template = await this.prisma.transformationTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Transformation template not found or is a system template');
    }

    await this.prisma.transformationTemplate.delete({ where: { id } });
  }

  async previewTransformation(
    tenantId: string,
    dto: TransformPreviewDto,
  ): Promise<TransformPreviewResponseDto> {
    let mappingRules = dto.mappingRules;

    if (dto.templateId) {
      const template = await this.findTransformation(tenantId, dto.templateId);
      mappingRules = template.mappingRules;
    }

    if (!mappingRules) {
      return {
        success: false,
        errors: ['No mapping rules provided'],
      };
    }

    // Simple transformation preview (in production, implement actual mapping)
    try {
      const result: Record<string, unknown> = {};
      const rules = mappingRules as Record<string, string>;

      for (const [targetField, sourceField] of Object.entries(rules)) {
        if (typeof sourceField === 'string' && sourceField in dto.sourceData) {
          result[targetField] = dto.sourceData[sourceField];
        }
      }

      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        errors: [(error as Error).message],
      };
    }
  }

  async validateMapping(
    tenantId: string,
    dto: TransformPreviewDto,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const preview = await this.previewTransformation(tenantId, dto);

    return {
      valid: preview.success,
      errors: preview.errors || [],
    };
  }

  private toJobDto(job: any): SyncJobResponseDto {
    return {
      id: job.id,
      integrationId: job.integrationId,
      integrationName: job.integration?.name,
      jobType: job.jobType,
      entityType: job.entityType,
      direction: job.direction,
      filters: job.filters ? JSON.parse(JSON.stringify(job.filters)) : undefined,
      status: job.status,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      successCount: job.successCount,
      errorCount: job.errorCount,
      errorDetails: job.errorDetails ? JSON.parse(JSON.stringify(job.errorDetails)) : undefined,
      scheduledBy: job.scheduledBy,
      scheduledAt: job.scheduledAt,
      createdAt: job.createdAt,
      createdBy: job.createdBy,
    };
  }

  private toLogDto(log: any): ApiLogResponseDto {
    return {
      id: log.id,
      integrationId: log.integrationId,
      integrationName: log.integration?.name,
      direction: log.direction,
      method: log.method,
      url: log.url,
      path: log.path,
      queryParams: log.queryParams ? JSON.parse(JSON.stringify(log.queryParams)) : undefined,
      headers: log.headers ? JSON.parse(JSON.stringify(log.headers)) : undefined,
      body: log.body,
      bodySize: log.bodySize,
      responseStatus: log.responseStatus,
      responseHeaders: log.responseHeaders ? JSON.parse(JSON.stringify(log.responseHeaders)) : undefined,
      responseBody: log.responseBody,
      responseSize: log.responseSize,
      responseTimeMs: log.responseTimeMs,
      correlationId: log.correlationId,
      userId: log.userId,
      sourceIp: log.sourceIp,
      status: log.status,
      errorMessage: log.errorMessage,
      retryOf: log.retryOf,
      createdAt: log.createdAt,
    };
  }

  private toTransformationDto(template: any): TransformationResponseDto {
    return {
      id: template.id,
      code: template.code,
      name: template.name,
      description: template.description,
      sourceFormat: template.sourceFormat,
      targetFormat: template.targetFormat,
      mappingRules: JSON.parse(JSON.stringify(template.mappingRules || {})),
      validationRules: template.validationRules ? JSON.parse(JSON.stringify(template.validationRules)) : undefined,
      isSystem: template.isSystem,
      category: template.category,
      version: template.version,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
