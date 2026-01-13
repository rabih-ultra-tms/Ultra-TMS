import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CancelExecutionDto,
  ExecutionListResponseDto,
  ExecutionQueryDto,
  ExecutionResponseDto,
  ExecutionStatus,
  ExecuteWorkflowDto,
  RetryExecutionDto,
  StepExecutionResponseDto,
  StepType,
  WorkflowExecutionStatus,
} from './dto';
import { ApprovalsService } from './approvals.service';

@Injectable()
export class ExecutionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvalsService: ApprovalsService,
    private readonly events: EventEmitter2,
  ) {}

  async startExecution(tenantId: string, userId: string, workflow: any, dto: ExecuteWorkflowDto) {
    const execution = await this.prisma.workflowExecution.create({
      data: {
        tenantId,
        workflowId: workflow.id,
        triggerData: {
          ...(dto.triggerData ?? {}),
          entityType: dto.entityType,
          entityId: dto.entityId,
          variables: dto.variables ?? {},
        } as Prisma.InputJsonValue,
        status: WorkflowExecutionStatus.RUNNING,
        startedAt: new Date(),
        createdById: userId,
        updatedById: userId,
      },
    });

    this.events.emit('workflow.started', { executionId: execution.id, workflowId: workflow.id });

    let waiting = false;

    for (const step of workflow.workflowSteps ?? []) {
      const stepExecution = await this.prisma.stepExecution.create({
        data: {
          tenantId,
          workflowExecutionId: execution.id,
          workflowStepId: step.id,
          status: ExecutionStatus.RUNNING,
          inputData: (dto.variables ?? {}) as Prisma.InputJsonValue,
          createdById: userId,
          updatedById: userId,
          startedAt: new Date(),
        },
        include: { workflowStep: true },
      });

      if (step.stepType === StepType.APPROVAL) {
        const approval = await this.approvalsService.createFromStep({
          tenantId,
          userId,
          executionId: execution.id,
          stepExecutionId: stepExecution.id,
          step,
          approverIds: dto.approverIds,
        });

        await this.prisma.stepExecution.update({
          where: { id: stepExecution.id },
          data: {
            status: ExecutionStatus.PENDING,
            outputData: { approvalRequestId: approval.id } as Prisma.InputJsonValue,
          },
        });

        await this.prisma.workflowExecution.update({
          where: { id: execution.id },
          data: { status: WorkflowExecutionStatus.WAITING },
        });

        waiting = true;
        break;
      }

      await this.prisma.stepExecution.update({
        where: { id: stepExecution.id },
        data: {
          status: ExecutionStatus.COMPLETED,
          completedAt: new Date(),
          outputData: { message: 'Step completed' } as Prisma.InputJsonValue,
        },
      });

      this.events.emit('workflow.step.completed', {
        stepId: stepExecution.id,
        executionId: execution.id,
      });
    }

    if (!waiting) {
      const completed = await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowExecutionStatus.COMPLETED,
          completedAt: new Date(),
          result: { message: 'Execution completed' } as Prisma.InputJsonValue,
        },
      });

      this.events.emit('workflow.completed', { executionId: execution.id, workflowId: workflow.id });
      return { executionId: completed.id, status: completed.status };
    }

    return { executionId: execution.id, status: WorkflowExecutionStatus.WAITING };
  }

  async findAll(tenantId: string, query: ExecutionQueryDto): Promise<ExecutionListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowExecutionWhereInput = {
      tenantId,
      ...(query.workflowId ? { workflowId: query.workflowId } : {}),
      ...(query.status ? { status: query.status as WorkflowExecutionStatus } : {}),
    };

    const [executions, total] = await Promise.all([
      this.prisma.workflowExecution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          stepExecutions: {
            orderBy: { startedAt: 'asc' },
            include: { workflowStep: true },
          },
        },
      }),
      this.prisma.workflowExecution.count({ where }),
    ]);

    return {
      data: executions.map(exec => this.mapExecution(exec)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByWorkflow(tenantId: string, workflowId: string, query: ExecutionQueryDto) {
    return this.findAll(tenantId, { ...query, workflowId });
  }

  async findOne(tenantId: string, id: string): Promise<ExecutionResponseDto> {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id, tenantId },
      include: {
        stepExecutions: {
          orderBy: { startedAt: 'asc' },
          include: { workflowStep: true },
        },
      },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    return this.mapExecution(execution);
  }

  async getSteps(tenantId: string, executionId: string): Promise<StepExecutionResponseDto[]> {
    const execution = await this.prisma.workflowExecution.findFirst({ where: { id: executionId, tenantId } });
    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    const steps = await this.prisma.stepExecution.findMany({
      where: { workflowExecutionId: executionId },
      orderBy: { startedAt: 'asc' },
      include: { workflowStep: true },
    });

    return steps.map(step => this.mapStepExecution(step));
  }

  async cancel(tenantId: string, id: string, _userId: string, dto: CancelExecutionDto) {
    const execution = await this.prisma.workflowExecution.findFirst({ where: { id, tenantId } });
    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    if (![WorkflowExecutionStatus.PENDING, WorkflowExecutionStatus.RUNNING, WorkflowExecutionStatus.WAITING].includes(execution.status as WorkflowExecutionStatus)) {
      throw new BadRequestException('Execution cannot be cancelled');
    }

    const updated = await this.prisma.workflowExecution.update({
      where: { id },
      data: {
        status: WorkflowExecutionStatus.CANCELLED,
        completedAt: new Date(),
        errorMessage: dto.reason ?? 'Cancelled',
      },
      include: {
        stepExecutions: { include: { workflowStep: true }, orderBy: { startedAt: 'asc' } },
      },
    });

    this.events.emit('workflow.failed', { executionId: id, error: dto.reason });
    return this.mapExecution(updated);
  }

  async retry(tenantId: string, id: string, _userId: string, dto: RetryExecutionDto) {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id, tenantId },
      include: { stepExecutions: true },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    if (execution.status !== WorkflowExecutionStatus.FAILED && execution.status !== WorkflowExecutionStatus.CANCELLED) {
      throw new BadRequestException('Only failed or cancelled executions can be retried');
    }

    await this.prisma.stepExecution.updateMany({
      where: { workflowExecutionId: id },
      data: {
        status: ExecutionStatus.PENDING,
        errorMessage: null,
        completedAt: null,
        outputData: {},
        retryCount: { increment: 1 },
      },
    });

    const reset = await this.prisma.workflowExecution.update({
      where: { id },
      data: {
        status: WorkflowExecutionStatus.PENDING,
        startedAt: new Date(),
        completedAt: null,
        errorMessage: null,
        result: {},
      },
    });

    // Simple resume logic: start again from first step or provided step
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: reset.workflowId, tenantId },
      include: { workflowSteps: { where: { deletedAt: null }, orderBy: { stepNumber: 'asc' } } },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow missing for execution');
    }

    const fromStepNumber = dto.fromStepNumber ?? 1;
    const stepsToRun = workflow.workflowSteps.filter((s: any) => s.stepNumber >= fromStepNumber);

    return this.startExecution(tenantId, _userId, { ...workflow, workflowSteps: stepsToRun }, { triggerData: execution.triggerData as Record<string, unknown> });
  }

  async getLogs(tenantId: string, id: string) {
    const steps = await this.getSteps(tenantId, id);
    return steps.map(step => ({
      stepNumber: step.stepNumber,
      stepName: step.stepName,
      status: step.status,
      startedAt: step.startedAt,
      completedAt: step.completedAt,
      errorMessage: step.errorMessage,
    }));
  }

  private mapExecution(execution: any): ExecutionResponseDto {
    return {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      triggerData: execution.triggerData ?? {},
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      result: execution.result ?? {},
      errorMessage: execution.errorMessage,
      createdAt: execution.createdAt,
      steps: execution.stepExecutions?.map((step: any) => this.mapStepExecution(step)),
    };
  }

  private mapStepExecution(step: any): StepExecutionResponseDto {
    return {
      id: step.id,
      workflowStepId: step.workflowStepId,
      stepNumber: step.workflowStep?.stepNumber ?? step.stepNumber ?? 0,
      stepType: step.workflowStep?.stepType ?? step.stepType,
      stepName: step.workflowStep?.stepName ?? step.stepName,
      status: step.status,
      inputData: step.inputData ?? {},
      outputData: step.outputData ?? {},
      errorMessage: step.errorMessage,
      retryCount: step.retryCount,
      startedAt: step.startedAt,
      completedAt: step.completedAt,
    };
  }
}
