import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateReportDto,
  UpdateReportDto,
  UpdateScheduleDto,
  ExecuteReportDto,
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
} from './dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private async generateReportNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const lastReport = await this.prisma.report.findFirst({
      where: {
        tenantId,
        reportNumber: { startsWith: `RPT-${yearMonth}` },
      },
      orderBy: { reportNumber: 'desc' },
    });

    let sequence = 1;
    if (lastReport?.reportNumber) {
      const parts = lastReport.reportNumber.split('-');
      if (parts[2]) {
        const lastSeq = parseInt(parts[2], 10);
        sequence = lastSeq + 1;
      }
    }

    return `RPT-${yearMonth}-${String(sequence).padStart(4, '0')}`;
  }

  async findAll(tenantId: string, category?: string, isScheduled?: boolean) {
    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    };
    if (category) where.category = category;
    if (isScheduled !== undefined) where.isScheduled = isScheduled;

    return this.prisma.report.findMany({
      where,
      include: {
        template: true,
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        template: true,
      },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async create(tenantId: string, userId: string, dto: CreateReportDto) {
    const reportNumber = await this.generateReportNumber(tenantId);

    return this.prisma.report.create({
      data: {
        tenantId,
        reportNumber,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        reportType: dto.reportType,
        templateId: dto.templateId,
        dataSource: dto.dataSource,
        queryDefinition: dto.queryDefinition
          ? JSON.parse(JSON.stringify(dto.queryDefinition))
          : null,
        filters: dto.filters
          ? JSON.parse(JSON.stringify(dto.filters))
          : {},
        parameters: dto.parameters
          ? JSON.parse(JSON.stringify(dto.parameters))
          : {},
        outputFormat: dto.outputFormat ?? 'PDF',
        isScheduled: dto.isScheduled ?? false,
        scheduleCron: dto.scheduleCron,
        recipients: dto.recipients
          ? JSON.parse(JSON.stringify(dto.recipients))
          : [],
        customFields: dto.customFields
          ? JSON.parse(JSON.stringify(dto.customFields))
          : {},
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateReportDto) {
    await this.findOne(tenantId, id);

    return this.prisma.report.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.queryDefinition && {
          queryDefinition: JSON.parse(JSON.stringify(dto.queryDefinition)),
        }),
        ...(dto.filters && {
          filters: JSON.parse(JSON.stringify(dto.filters)),
        }),
        ...(dto.parameters && {
          parameters: JSON.parse(JSON.stringify(dto.parameters)),
        }),
        ...(dto.outputFormat && { outputFormat: dto.outputFormat }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.recipients && {
          recipients: JSON.parse(JSON.stringify(dto.recipients)),
        }),
        ...(dto.customFields && {
          customFields: JSON.parse(JSON.stringify(dto.customFields)),
        }),
        updatedBy: userId,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.report.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async updateSchedule(tenantId: string, userId: string, id: string, dto: UpdateScheduleDto) {
    await this.findOne(tenantId, id);

    return this.prisma.report.update({
      where: { id },
      data: {
        isScheduled: dto.isScheduled,
        scheduleCron: dto.scheduleCron,
        nextRunAt: dto.nextRunAt ? new Date(dto.nextRunAt) : null,
        ...(dto.recipients && {
          recipients: JSON.parse(JSON.stringify(dto.recipients)),
        }),
        updatedBy: userId,
      },
    });
  }

  async execute(tenantId: string, userId: string, id: string, dto: ExecuteReportDto) {
    const report = await this.findOne(tenantId, id);

    // Create execution record
    const execution = await this.prisma.reportExecution.create({
      data: {
        tenantId,
        reportId: id,
        executionType: 'MANUAL',
        triggeredBy: userId,
        parametersUsed: dto.parameters
          ? JSON.parse(JSON.stringify(dto.parameters))
          : {},
        filtersUsed: dto.filters
          ? JSON.parse(JSON.stringify(dto.filters))
          : {},
        dateRangeStart: dto.dateRangeStart ? new Date(dto.dateRangeStart) : null,
        dateRangeEnd: dto.dateRangeEnd ? new Date(dto.dateRangeEnd) : null,
        outputFormat: dto.outputFormat ?? report.outputFormat,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // In a real implementation, this would queue the report for async processing
    // For now, simulate completion
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const rowCount = Math.floor(Math.random() * 1000) + 100;
      const fileSize = rowCount * 150; // Approximate bytes per row

      await this.prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          rowCount,
          outputFileSize: fileSize,
          outputFilePath: `/reports/${execution.id}.${(dto.outputFormat ?? report.outputFormat).toLowerCase()}`,
        },
      });

      // Update report lastRunAt
      await this.prisma.report.update({
        where: { id },
        data: { lastRunAt: new Date() },
      });

      return this.prisma.reportExecution.findUnique({
        where: { id: execution.id },
      });
    } catch (error) {
      await this.prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getExecutions(tenantId: string, reportId: string, page = 1, limit = 20) {
    await this.findOne(tenantId, reportId);

    const [executions, total] = await Promise.all([
      this.prisma.reportExecution.findMany({
        where: { tenantId, reportId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.reportExecution.count({
        where: { tenantId, reportId },
      }),
    ]);

    return {
      data: executions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExecution(tenantId: string, reportId: string, executionId: string) {
    await this.findOne(tenantId, reportId);

    const execution = await this.prisma.reportExecution.findFirst({
      where: { id: executionId, reportId, tenantId },
    });
    if (!execution) {
      throw new NotFoundException('Report execution not found');
    }
    return execution;
  }

  // Template operations
  async findAllTemplates(tenantId?: string, category?: string) {
    const where: Record<string, unknown> = {
      isActive: true,
      OR: [
        { tenantId: null, isSystem: true },
        ...(tenantId ? [{ tenantId }] : []),
      ],
    };
    if (category) where.category = category;

    return this.prisma.reportTemplate.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    });
  }

  async findTemplate(tenantId: string, id: string) {
    const template = await this.prisma.reportTemplate.findFirst({
      where: {
        id,
        OR: [
          { tenantId: null, isSystem: true },
          { tenantId },
        ],
      },
    });
    if (!template) {
      throw new NotFoundException('Report template not found');
    }
    return template;
  }

  async createTemplate(tenantId: string, userId: string, dto: CreateReportTemplateDto) {
    return this.prisma.reportTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        templateType: dto.templateType,
        templateContent: dto.templateContent,
        parametersSchema: dto.parametersSchema
          ? JSON.parse(JSON.stringify(dto.parametersSchema))
          : {},
        defaultFilters: dto.defaultFilters
          ? JSON.parse(JSON.stringify(dto.defaultFilters))
          : {},
        defaultOutputFormat: dto.defaultOutputFormat ?? 'PDF',
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async updateTemplate(tenantId: string, userId: string, id: string, dto: UpdateReportTemplateDto) {
    await this.findTemplate(tenantId, id);

    return this.prisma.reportTemplate.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.templateContent !== undefined && { templateContent: dto.templateContent }),
        ...(dto.parametersSchema && {
          parametersSchema: JSON.parse(JSON.stringify(dto.parametersSchema)),
        }),
        ...(dto.defaultFilters && {
          defaultFilters: JSON.parse(JSON.stringify(dto.defaultFilters)),
        }),
        ...(dto.defaultOutputFormat && { defaultOutputFormat: dto.defaultOutputFormat }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        updatedBy: userId,
      },
    });
  }

  async deleteTemplate(tenantId: string, id: string) {
    const template = await this.findTemplate(tenantId, id);
    if (template.isSystem) {
      throw new NotFoundException('Cannot delete system template');
    }

    await this.prisma.reportTemplate.delete({ where: { id } });
    return { success: true };
  }
}
