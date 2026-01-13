import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CreateWorkflowDto,
  ExecuteWorkflowDto,
  StepType,
  TriggerType,
  UpdateWorkflowDto,
  WorkflowQueryDto,
  WorkflowStatsResponseDto,
  WorkflowStatus,
} from './dto';
import { ExecutionsService } from './executions.service';

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly executionsService: ExecutionsService,
  ) {}

  async findAll(tenantId: string, query: WorkflowQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.triggerType ? { triggerType: query.triggerType as TriggerType } : {}),
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [workflows, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ updatedAt: 'desc' }],
        include: {
          workflowSteps: { where: { deletedAt: null }, orderBy: { stepNumber: 'asc' } },
        },
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return {
      data: workflows.map(workflow => this.mapWorkflow(workflow)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { workflowSteps: { where: { deletedAt: null }, orderBy: { stepNumber: 'asc' } } },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.mapWorkflow(workflow);
  }

  async create(tenantId: string, userId: string, dto: CreateWorkflowDto) {
    const data: Prisma.WorkflowCreateInput = {
      tenant: { connect: { id: tenantId } },
      name: dto.name,
      description: dto.description,
      triggerType: dto.triggerType as TriggerType,
      triggerEvent: dto.triggerEvent,
      triggerConditions: (dto.triggerConditions ?? {}) as Prisma.InputJsonValue,
      status: dto.status ?? WorkflowStatus.ACTIVE,
      version: 1,
      createdById: userId,
      updatedById: userId,
      workflowSteps: {
        create: (dto.steps ?? []).map(step => ({
          tenantId,
          stepNumber: step.stepNumber,
          stepName: step.stepName ?? `Step ${step.stepNumber}`,
          stepType: step.stepType as StepType,
          actionConfig: (step.actionConfig ?? {}) as Prisma.InputJsonValue,
          conditionLogic: step.conditionLogic,
          timeoutSeconds: step.timeoutSeconds ?? 3600,
          retryConfig: (step.retryConfig ?? {}) as Prisma.InputJsonValue,
          createdById: userId,
          updatedById: userId,
        })),
      },
    };

    const workflow = await this.prisma.workflow.create({
      data,
      include: { workflowSteps: { orderBy: { stepNumber: 'asc' } } },
    });

    return this.mapWorkflow(workflow);
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateWorkflowDto) {
    await this.findOne(tenantId, id);

    return this.prisma.$transaction(async tx => {
      await tx.workflow.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.triggerType !== undefined ? { triggerType: dto.triggerType as TriggerType } : {}),
          ...(dto.triggerEvent !== undefined ? { triggerEvent: dto.triggerEvent } : {}),
          ...(dto.triggerConditions !== undefined
            ? { triggerConditions: dto.triggerConditions as Prisma.InputJsonValue }
            : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          updatedById: userId,
        },
      });

      if (dto.steps !== undefined) {
        await tx.workflowStep.deleteMany({ where: { workflowId: id } });
        if (dto.steps.length) {
          for (const step of dto.steps) {
            await tx.workflowStep.create({
              data: {
                tenantId,
                workflowId: id,
                stepNumber: step.stepNumber,
                stepName: step.stepName ?? `Step ${step.stepNumber}`,
                stepType: step.stepType as StepType,
                actionConfig: (step.actionConfig ?? {}) as Prisma.InputJsonValue,
                conditionLogic: step.conditionLogic,
                timeoutSeconds: step.timeoutSeconds ?? 3600,
                retryConfig: (step.retryConfig ?? {}) as Prisma.InputJsonValue,
                createdById: userId,
                updatedById: userId,
              },
            });
          }
        }
      }

      const updated = await tx.workflow.findFirst({
        where: { id, tenantId, deletedAt: null },
        include: { workflowSteps: { where: { deletedAt: null }, orderBy: { stepNumber: 'asc' } } },
      });

      if (!updated) {
        throw new NotFoundException('Workflow not found after update');
      }

      return this.mapWorkflow(updated);
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.workflow.update({
      where: { id },
      data: { deletedAt: new Date(), status: WorkflowStatus.INACTIVE },
    });
    return { success: true };
  }

  async publish(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    const workflow = await this.prisma.workflow.update({
      where: { id },
      data: { version: { increment: 1 }, updatedById: userId, status: WorkflowStatus.ACTIVE },
      include: { workflowSteps: { where: { deletedAt: null }, orderBy: { stepNumber: 'asc' } } },
    });

    return this.mapWorkflow(workflow);
  }

  async activate(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);
    const workflow = await this.prisma.workflow.update({
      where: { id },
      data: { status: WorkflowStatus.ACTIVE, updatedById: userId },
      include: { workflowSteps: { where: { deletedAt: null }, orderBy: { stepNumber: 'asc' } } },
    });
    return this.mapWorkflow(workflow);
  }

  async deactivate(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);
    const workflow = await this.prisma.workflow.update({
      where: { id },
      data: { status: WorkflowStatus.INACTIVE, updatedById: userId },
      include: { workflowSteps: { where: { deletedAt: null }, orderBy: { stepNumber: 'asc' } } },
    });
    return this.mapWorkflow(workflow);
  }

  async execute(tenantId: string, id: string, userId: string, dto: ExecuteWorkflowDto) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { workflowSteps: { where: { deletedAt: null }, orderBy: { stepNumber: 'asc' } } },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (workflow.status === WorkflowStatus.INACTIVE) {
      throw new BadRequestException('Workflow is inactive');
    }

    return this.executionsService.startExecution(tenantId, userId, workflow, dto);
  }

  async stats(tenantId: string, id: string): Promise<WorkflowStatsResponseDto> {
    await this.findOne(tenantId, id);

    const grouped = await this.prisma.workflowExecution.groupBy({
      where: { tenantId, workflowId: id },
      by: ['status'],
      _count: { _all: true },
    });

    const totals: Record<string, number> = {};
    for (const row of grouped) {
      totals[row.status] = row._count._all;
    }

    const lastRun = await this.prisma.workflowExecution.findFirst({
      where: { tenantId, workflowId: id },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });

    return { workflowId: id, totals, lastExecutedAt: lastRun?.completedAt ?? null };
  }

  validateDefinition(dto: CreateWorkflowDto | UpdateWorkflowDto) {
    const issues: string[] = [];
    const steps = dto.steps ?? [];

    if (!dto.name || !dto.triggerType) {
      issues.push('Name and trigger type are required');
    }

    if (!steps.length) {
      issues.push('At least one step is required');
    }

    const seenNumbers = new Set<number>();
    for (const step of steps) {
      if (seenNumbers.has(step.stepNumber)) {
        issues.push(`Duplicate step number ${step.stepNumber}`);
      }
      seenNumbers.add(step.stepNumber);
    }

    if (dto.triggerType === TriggerType.EVENT && !dto.triggerEvent) {
      issues.push('Event triggers require triggerEvent');
    }

    return { valid: issues.length === 0, issues };
  }

  private mapWorkflow(workflow: any) {
    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      triggerType: workflow.triggerType,
      triggerEvent: workflow.triggerEvent,
      triggerConditions: workflow.triggerConditions ?? {},
      status: workflow.status,
      version: workflow.version,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      steps:
        workflow.workflowSteps?.map((step: any) => ({
          id: step.id,
          stepNumber: step.stepNumber,
          stepName: step.stepName,
          stepType: step.stepType,
          actionConfig: step.actionConfig ?? {},
          conditionLogic: step.conditionLogic,
          timeoutSeconds: step.timeoutSeconds,
          retryConfig: step.retryConfig ?? {},
        })) ?? [],
    };
  }
}
