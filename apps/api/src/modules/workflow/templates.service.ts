import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CreateFromTemplateDto,
  CreateTemplateDto,
  TemplateListResponseDto,
  TemplateResponseDto,
  UpdateTemplateDto,
  WorkflowStatus,
} from './dto';
import { StepType, TriggerType } from './dto/workflow.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, category?: string): Promise<TemplateListResponseDto> {
    const where: Prisma.WorkflowTemplateWhereInput = {
      tenantId,
      deletedAt: null,
      ...(category ? { category } : {}),
    };

    const templates = await this.prisma.workflowTemplate.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }],
    });

    return { data: templates.map(t => this.mapTemplate(t)), total: templates.length };
  }

  async findOne(tenantId: string, id: string): Promise<TemplateResponseDto> {
    const template = await this.prisma.workflowTemplate.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return this.mapTemplate(template);
  }

  async create(tenantId: string, userId: string, dto: CreateTemplateDto): Promise<TemplateResponseDto> {
    const template = await this.prisma.workflowTemplate.create({
      data: {
        tenantId,
        templateName: dto.templateName,
        category: dto.category,
        description: dto.description,
        triggerConfig: dto.triggerConfig as Prisma.InputJsonValue,
        stepsJson: dto.stepsJson as Prisma.InputJsonValue,
        isSystem: dto.isSystem ?? false,
        isActive: dto.isActive ?? true,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.mapTemplate(template);
  }

  async update(tenantId: string, id: string, dto: UpdateTemplateDto): Promise<TemplateResponseDto> {
    await this.findOne(tenantId, id);

    const template = await this.prisma.workflowTemplate.update({
      where: { id },
      data: {
        ...(dto.templateName !== undefined ? { templateName: dto.templateName } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.triggerConfig !== undefined ? { triggerConfig: dto.triggerConfig as Prisma.InputJsonValue } : {}),
        ...(dto.stepsJson !== undefined ? { stepsJson: dto.stepsJson as Prisma.InputJsonValue } : {}),
        ...(dto.isSystem !== undefined ? { isSystem: dto.isSystem } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    return this.mapTemplate(template);
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.workflowTemplate.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true };
  }

  async createWorkflowFromTemplate(
    tenantId: string,
    userId: string,
    id: string,
    dto: CreateFromTemplateDto,
  ): Promise<{ workflowId: string }> {
    const template = await this.prisma.workflowTemplate.findFirst({ where: { id, tenantId, deletedAt: null, isActive: true } });
    if (!template) {
      throw new NotFoundException('Template not found or inactive');
    }

    const triggerConfig = this.applyParameters(template.triggerConfig ?? {}, dto.parameters);
    const stepsArray = this.applyParameters(template.stepsJson ?? [], dto.parameters) as any[];

    const workflow = await this.prisma.workflow.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description ?? template.description,
        triggerType: this.inferTriggerType(triggerConfig),
        triggerEvent: (triggerConfig as any).eventName,
        triggerConditions: triggerConfig as Prisma.InputJsonValue,
        status: dto.activate ? WorkflowStatus.ACTIVE : WorkflowStatus.INACTIVE,
        createdById: userId,
        updatedById: userId,
        workflowSteps: {
          create: (stepsArray ?? []).map(step => ({
            tenantId,
            stepNumber: step.stepNumber ?? step.stepOrder ?? 1,
            stepName: step.stepName ?? step.name ?? `Step ${step.stepNumber ?? 1}`,
            stepType: step.stepType ?? StepType.ACTION,
            actionConfig: (step.actionConfig ?? {}) as Prisma.InputJsonValue,
            conditionLogic: step.conditionLogic ?? step.conditionExpression,
            timeoutSeconds: step.timeoutSeconds ?? step.timeoutMins ?? 3600,
            retryConfig: (step.retryConfig ?? {}) as Prisma.InputJsonValue,
            createdById: userId,
            updatedById: userId,
          })),
        },
      },
    });

    await this.prisma.workflowTemplate.update({
      where: { id },
      data: { updatedById: userId },
    });

    return { workflowId: workflow.id };
  }

  private inferTriggerType(config: Record<string, unknown>): TriggerType {
    const typeFromConfig = (config as any).type as TriggerType | undefined;
    if (typeFromConfig && Object.values(TriggerType).includes(typeFromConfig)) {
      return typeFromConfig;
    }
    return TriggerType.MANUAL;
  }

  private applyParameters(value: any, parameters?: Record<string, unknown>) {
    if (!parameters) return value;
    try {
      const serialized = JSON.stringify(value);
      const replaced = Object.entries(parameters).reduce((acc, [key, val]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        return acc.replace(placeholder, String(val));
      }, serialized);
      return JSON.parse(replaced);
    } catch (_err) {
      return value;
    }
  }

  private mapTemplate(template: any): TemplateResponseDto {
    return {
      id: template.id,
      templateName: template.templateName,
      category: template.category ?? undefined,
      description: template.description ?? undefined,
      triggerConfig: template.triggerConfig ?? {},
      stepsJson: template.stepsJson ?? [],
      isSystem: template.isSystem,
      isActive: template.isActive,
      createdAt: template.createdAt,
    };
  }
}
