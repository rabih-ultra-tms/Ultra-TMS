import { Injectable, NotFoundException } from '@nestjs/common';
import { ExecutionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CreateReportDto, ExecuteReportDto, ExecutionQueryDto, UpdateReportDto, UpdateScheduleDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.report.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        reportExecutions: { orderBy: { executedAt: 'desc' }, take: 1 },
      },
      orderBy: [{ name: 'asc' }],
    });
  }

  private async ensureReport(tenantId: string, id: string) {
    const report = await this.prisma.report.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async get(tenantId: string, id: string) {
    return this.ensureReport(tenantId, id);
  }

  async create(tenantId: string, userId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        reportType: dto.reportType,
        sourceQuery: dto.sourceQuery,
        parameters: (dto.parameters ?? {}) as Prisma.InputJsonValue,
        outputFormat: dto.outputFormat ?? 'PDF',
        isScheduled: dto.isScheduled ?? false,
        scheduleExpression: dto.scheduleExpression,
        isPublic: dto.isPublic ?? false,
        ownerId: dto.ownerId ?? userId,
        status: 'ACTIVE',
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateReportDto) {
    await this.ensureReport(tenantId, id);

    return this.prisma.report.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.reportType !== undefined ? { reportType: dto.reportType } : {}),
        ...(dto.sourceQuery !== undefined ? { sourceQuery: dto.sourceQuery } : {}),
        ...(dto.parameters !== undefined ? { parameters: dto.parameters as Prisma.InputJsonValue } : {}),
        ...(dto.outputFormat !== undefined ? { outputFormat: dto.outputFormat } : {}),
        ...(dto.isScheduled !== undefined ? { isScheduled: dto.isScheduled } : {}),
        ...(dto.scheduleExpression !== undefined ? { scheduleExpression: dto.scheduleExpression } : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
        updatedById: userId,
      },
    });
  }

  async updateSchedule(tenantId: string, userId: string, id: string, dto: UpdateScheduleDto) {
    await this.ensureReport(tenantId, id);

    return this.prisma.report.update({
      where: { id },
      data: {
        isScheduled: dto.isScheduled,
        scheduleExpression: dto.scheduleExpression,
        updatedById: userId,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.ensureReport(tenantId, id);
    await this.prisma.report.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    return { success: true };
  }

  async execute(tenantId: string, userId: string, id: string, dto: ExecuteReportDto) {
    const report = await this.ensureReport(tenantId, id);

    const execution = await this.prisma.reportExecution.create({
      data: {
        tenantId,
        reportId: id,
        parametersUsed: (dto.parameters ?? {}) as Prisma.InputJsonValue,
        status: ExecutionStatus.RUNNING,
        createdById: userId,
        customFields: { outputFormat: dto.outputFormat ?? report.outputFormat },
      },
    });

    const rowCount = Math.floor(Math.random() * 200) + 25;
    const executionTimeMs = Math.floor(Math.random() * 200) + 50;

    await this.prisma.reportExecution.update({
      where: { id: execution.id },
      data: {
        status: ExecutionStatus.COMPLETED,
        outputFileUrl: `/reports/${execution.id}.${(dto.outputFormat ?? report.outputFormat).toLowerCase()}`,
        executionTimeMs,
        rowCount,
        updatedAt: new Date(),
      },
    });

    return this.prisma.reportExecution.findUnique({ where: { id: execution.id } });
  }

  async executions(tenantId: string, reportId: string, query: ExecutionQueryDto) {
    await this.ensureReport(tenantId, reportId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      tenantId,
      reportId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.reportExecution.findMany({
        where,
        orderBy: { executedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.reportExecution.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async execution(tenantId: string, reportId: string, executionId: string) {
    await this.ensureReport(tenantId, reportId);
    const exec = await this.prisma.reportExecution.findFirst({ where: { id: executionId, reportId, tenantId } });
    if (!exec) {
      throw new NotFoundException('Report execution not found');
    }
    return exec;
  }
}
