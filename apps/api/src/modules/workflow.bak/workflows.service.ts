import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowQueryDto,
  ExecuteWorkflowDto,
  CloneWorkflowDto,
  WorkflowResponseDto,
  WorkflowListResponseDto,
  WorkflowCategory,
  TriggerType,
} from './dto';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  private generateExecutionNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WF-${dateStr}-${sequence}`;
  }

  async findAll(tenantId: string, query: WorkflowQueryDto): Promise<WorkflowListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.triggerType) {
      where.triggerType = query.triggerType;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [workflows, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return {
      data: workflows.map(w => this.toResponseDto(w)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string): Promise<WorkflowResponseDto> {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        workflowSteps: { orderBy: { stepOrder: 'asc' } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.toResponseDto(workflow);
  }

  async create(
    tenantId: string,
    userId: string,
    dto: CreateWorkflowDto,
  ): Promise<WorkflowResponseDto> {
    const workflow = await this.prisma.workflow.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        triggerType: dto.triggerType,
        triggerConfig: dto.triggerConfig as any,
        steps: (dto.steps || []) as any,
        isActive: dto.isActive ?? false,
        runAsUserId: dto.runAsUserId,
        maxRetries: dto.maxRetries ?? 3,
        retryDelayMins: dto.retryDelayMins ?? 5,
        timeoutMins: dto.timeoutMins ?? 60,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return this.findOne(tenantId, workflow.id);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateWorkflowDto,
  ): Promise<WorkflowResponseDto> {
    await this.findOne(tenantId, id);

    const updateData: any = { updatedBy: userId };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.triggerType !== undefined) updateData.triggerType = dto.triggerType;
    if (dto.triggerConfig !== undefined) updateData.triggerConfig = dto.triggerConfig;
    if (dto.steps !== undefined) updateData.steps = dto.steps;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.runAsUserId !== undefined) updateData.runAsUserId = dto.runAsUserId;
    if (dto.maxRetries !== undefined) updateData.maxRetries = dto.maxRetries;
    if (dto.retryDelayMins !== undefined) updateData.retryDelayMins = dto.retryDelayMins;
    if (dto.timeoutMins !== undefined) updateData.timeoutMins = dto.timeoutMins;
    if (dto.draftSteps !== undefined) updateData.draftSteps = dto.draftSteps;

    await this.prisma.workflow.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);

    await this.prisma.workflow.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async publish(tenantId: string, id: string, userId: string): Promise<WorkflowResponseDto> {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // Move draft steps to published steps
    const newSteps = workflow.draftSteps || workflow.steps;

    await this.prisma.workflow.update({
      where: { id },
      data: {
        steps: newSteps as any,
        draftSteps: Prisma.DbNull,
        version: { increment: 1 },
        publishedVersion: workflow.version + 1,
        updatedBy: userId,
      },
    });

    return this.findOne(tenantId, id);
  }

  async activate(tenantId: string, id: string, userId: string): Promise<WorkflowResponseDto> {
    await this.findOne(tenantId, id);

    await this.prisma.workflow.update({
      where: { id },
      data: { isActive: true, updatedBy: userId },
    });

    return this.findOne(tenantId, id);
  }

  async deactivate(tenantId: string, id: string, userId: string): Promise<WorkflowResponseDto> {
    await this.findOne(tenantId, id);

    await this.prisma.workflow.update({
      where: { id },
      data: { isActive: false, updatedBy: userId },
    });

    return this.findOne(tenantId, id);
  }

  async clone(
    tenantId: string,
    id: string,
    userId: string,
    dto: CloneWorkflowDto,
  ): Promise<WorkflowResponseDto> {
    const source = await this.prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!source) {
      throw new NotFoundException('Workflow not found');
    }

    const cloned = await this.prisma.workflow.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description || source.description,
        category: source.category,
        triggerType: source.triggerType,
        triggerConfig: source.triggerConfig as any,
        steps: source.steps as any,
        isActive: false,
        runAsUserId: source.runAsUserId,
        maxRetries: source.maxRetries,
        retryDelayMins: source.retryDelayMins,
        timeoutMins: source.timeoutMins,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return this.findOne(tenantId, cloned.id);
  }

  async getVersionHistory(tenantId: string, id: string): Promise<{ version: number; publishedAt: Date }[]> {
    const workflow = await this.findOne(tenantId, id);
    
    // In a production system, you'd have a version history table
    return [{
      version: workflow.publishedVersion,
      publishedAt: workflow.updatedAt,
    }];
  }

  async testRun(
    tenantId: string,
    id: string,
    userId: string,
    dto: ExecuteWorkflowDto,
  ): Promise<any> {
    const workflow = await this.findOne(tenantId, id);

    // Simulate execution without actually running
    return {
      workflowId: id,
      workflowName: workflow.name,
      testMode: true,
      triggerData: dto.triggerData || {},
      variables: dto.variables || {},
      steps: workflow.steps,
      simulatedResult: 'SUCCESS',
    };
  }

  async execute(
    tenantId: string,
    id: string,
    userId: string,
    dto: ExecuteWorkflowDto,
  ): Promise<any> {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (!workflow.isActive) {
      throw new BadRequestException('Workflow is not active');
    }

    const execution = await this.prisma.workflowExecution.create({
      data: {
        tenantId,
        workflowId: id,
        executionNumber: this.generateExecutionNumber(),
        triggerType: 'MANUAL',
        triggerData: (dto.triggerData || {}) as any,
        entityType: dto.entityType,
        entityId: dto.entityId,
        variables: (dto.variables || {}) as any,
        status: 'PENDING',
        triggeredBy: userId,
      },
    });

    // Update workflow stats
    await this.prisma.workflow.update({
      where: { id },
      data: {
        executionCount: { increment: 1 },
        lastExecutedAt: new Date(),
      },
    });

    // In production, you'd queue this for async processing
    // For now, simulate success
    await this.prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    return {
      executionId: execution.id,
      executionNumber: execution.executionNumber,
      status: 'RUNNING',
    };
  }

  private toResponseDto(workflow: any): WorkflowResponseDto {
    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      category: workflow.category,
      triggerType: workflow.triggerType,
      triggerConfig: JSON.parse(JSON.stringify(workflow.triggerConfig || {})),
      steps: JSON.parse(JSON.stringify(workflow.steps || [])),
      isActive: workflow.isActive,
      runAsUserId: workflow.runAsUserId,
      maxRetries: workflow.maxRetries,
      retryDelayMins: workflow.retryDelayMins,
      timeoutMins: workflow.timeoutMins,
      version: workflow.version,
      publishedVersion: workflow.publishedVersion,
      draftSteps: workflow.draftSteps ? JSON.parse(JSON.stringify(workflow.draftSteps)) : undefined,
      executionCount: workflow.executionCount,
      lastExecutedAt: workflow.lastExecutedAt,
      successCount: workflow.successCount,
      failureCount: workflow.failureCount,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
  }
}
