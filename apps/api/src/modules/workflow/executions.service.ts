import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  ExecutionQueryDto,
  ExecutionResponseDto,
  ExecutionListResponseDto,
  StepExecutionResponseDto,
  CancelExecutionDto,
  RetryExecutionDto,
} from './dto';

@Injectable()
export class ExecutionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: ExecutionQueryDto): Promise<ExecutionListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (query.workflowId) {
      where.workflowId = query.workflowId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.triggeredBy) {
      where.triggeredBy = query.triggeredBy;
    }

    const [executions, total] = await Promise.all([
      this.prisma.workflowExecution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          workflow: { select: { id: true, name: true } },
          triggeredByUser: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.workflowExecution.count({ where }),
    ]);

    return {
      data: executions.map(e => this.toResponseDto(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByWorkflow(
    tenantId: string,
    workflowId: string,
    query: ExecutionQueryDto,
  ): Promise<ExecutionListResponseDto> {
    return this.findAll(tenantId, { ...query, workflowId });
  }

  async findOne(tenantId: string, id: string): Promise<ExecutionResponseDto> {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id, tenantId },
      include: {
        workflow: { select: { id: true, name: true } },
        triggeredByUser: { select: { id: true, firstName: true, lastName: true } },
        stepExecutions: { orderBy: { stepOrder: 'asc' } },
      },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    return this.toResponseDto(execution);
  }

  async getSteps(tenantId: string, executionId: string): Promise<StepExecutionResponseDto[]> {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id: executionId, tenantId },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    const steps = await this.prisma.stepExecution.findMany({
      where: { workflowExecutionId: executionId },
      orderBy: { stepOrder: 'asc' },
    });

    return steps.map(s => this.toStepResponseDto(s));
  }

  async cancel(
    tenantId: string,
    id: string,
    userId: string,
    dto: CancelExecutionDto,
  ): Promise<ExecutionResponseDto> {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id, tenantId },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    if (!['PENDING', 'RUNNING', 'WAITING'].includes(execution.status)) {
      throw new BadRequestException('Execution cannot be cancelled in current status');
    }

    await this.prisma.workflowExecution.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
        errorMessage: dto.reason || 'Cancelled by user',
      },
    });

    return this.findOne(tenantId, id);
  }

  async retry(
    tenantId: string,
    id: string,
    userId: string,
    dto: RetryExecutionDto,
  ): Promise<ExecutionResponseDto> {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id, tenantId },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    if (execution.status !== 'FAILED') {
      throw new BadRequestException('Only failed executions can be retried');
    }

    await this.prisma.workflowExecution.update({
      where: { id },
      data: {
        status: 'PENDING',
        attemptNumber: { increment: 1 },
        completedAt: null,
        errorMessage: null,
        result: {},
      },
    });

    // In production, queue for processing
    await this.prisma.workflowExecution.update({
      where: { id },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    return this.findOne(tenantId, id);
  }

  private toResponseDto(execution: any): ExecutionResponseDto {
    return {
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: execution.workflow?.name,
      executionNumber: execution.executionNumber,
      triggerType: execution.triggerType,
      triggerEvent: execution.triggerEvent ? JSON.parse(JSON.stringify(execution.triggerEvent)) : undefined,
      triggerData: JSON.parse(JSON.stringify(execution.triggerData || {})),
      entityType: execution.entityType,
      entityId: execution.entityId,
      status: execution.status,
      currentStepId: execution.currentStepId,
      variables: JSON.parse(JSON.stringify(execution.variables || {})),
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      result: JSON.parse(JSON.stringify(execution.result || {})),
      errorMessage: execution.errorMessage,
      attemptNumber: execution.attemptNumber,
      triggeredBy: execution.triggeredBy,
      createdAt: execution.createdAt,
      stepExecutions: execution.stepExecutions?.map((s: any) => this.toStepResponseDto(s)),
    };
  }

  private toStepResponseDto(step: any): StepExecutionResponseDto {
    return {
      id: step.id,
      stepId: step.stepId,
      stepOrder: step.stepOrder,
      stepType: step.stepType,
      stepName: step.stepName,
      status: step.status,
      inputData: JSON.parse(JSON.stringify(step.inputData || {})),
      outputData: JSON.parse(JSON.stringify(step.outputData || {})),
      startedAt: step.startedAt,
      completedAt: step.completedAt,
      errorMessage: step.errorMessage,
      retryCount: step.retryCount,
      createdAt: step.createdAt,
    };
  }
}
