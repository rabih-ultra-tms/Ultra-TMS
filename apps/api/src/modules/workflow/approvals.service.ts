import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  ApprovalDecisionDto,
  ApprovalListResponseDto,
  ApprovalQueryDto,
  ApprovalResponseDto,
  ApprovalStatsResponseDto,
  ApprovalStatus,
  ApprovalType,
  DelegateApprovalDto,
  RejectApprovalDto,
  ExecutionStatus,
  WorkflowExecutionStatus,
} from './dto';

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async createFromStep(params: {
    tenantId: string;
    userId: string;
    executionId: string;
    stepExecutionId: string;
    step: any;
    approverIds?: string[];
  }) {
    const approvers = params.approverIds?.length ? params.approverIds : [params.userId];

    return this.prisma.approvalRequest.create({
      data: {
        tenantId: params.tenantId,
        requestNumber: this.generateRequestNumber(),
        title: params.step.stepName ?? 'Approval Required',
        description: params.step.conditionLogic,
        approvalType: ApprovalType.SINGLE,
        entityType: 'workflow-execution',
        entityId: params.executionId,
        approverIds: approvers,
        status: ApprovalStatus.PENDING,
        customFields: {
          workflowExecutionId: params.executionId,
          workflowStepId: params.step.id,
          stepExecutionId: params.stepExecutionId,
        } as Prisma.InputJsonValue,
        createdById: params.userId,
      },
    });
  }

  async findAll(tenantId: string, query: ApprovalQueryDto): Promise<ApprovalListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ApprovalRequestWhereInput = {
      tenantId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
    };

    const [approvals, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);

    return {
      data: approvals.map(a => this.mapApproval(a)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPending(tenantId: string, userId: string, query: ApprovalQueryDto): Promise<ApprovalListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ApprovalRequestWhereInput = {
      tenantId,
      status: ApprovalStatus.PENDING,
      approverIds: { has: userId },
    };

    const [approvals, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);

    return {
      data: approvals.map(a => this.mapApproval(a)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string): Promise<ApprovalResponseDto> {
    const approval = await this.prisma.approvalRequest.findFirst({ where: { id, tenantId } });
    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }
    return this.mapApproval(approval);
  }

  async approve(tenantId: string, id: string, userId: string, dto: ApprovalDecisionDto): Promise<ApprovalResponseDto> {
    const approval = await this.prisma.approvalRequest.findFirst({ where: { id, tenantId } });
    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    if (!approval.approverIds.includes(userId)) {
      throw new ForbiddenException('User is not an approver');
    }

    const updated = await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: ApprovalStatus.APPROVED,
        decidedBy: userId,
        decidedAt: new Date(),
        decision: 'APPROVED',
        comments: this.combineComments(approval.comments, dto.comments),
      },
    });

    await this.resolveExecutionFromApproval(updated, ApprovalStatus.APPROVED, dto.comments, userId);
    this.events.emit('approval.approved', { requestId: id, approvedBy: userId });
    return this.findOne(tenantId, id);
  }

  async reject(tenantId: string, id: string, userId: string, dto: RejectApprovalDto): Promise<ApprovalResponseDto> {
    const approval = await this.prisma.approvalRequest.findFirst({ where: { id, tenantId } });
    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    if (!approval.approverIds.includes(userId)) {
      throw new ForbiddenException('User is not an approver');
    }

    const updated = await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: ApprovalStatus.REJECTED,
        decidedBy: userId,
        decidedAt: new Date(),
        decision: 'REJECTED',
        comments: this.combineComments(approval.comments, `${dto.reason}${dto.comments ? ` - ${dto.comments}` : ''}`),
      },
    });

    await this.resolveExecutionFromApproval(updated, ApprovalStatus.REJECTED, dto.reason, userId);
    this.events.emit('approval.rejected', { requestId: id, rejectedBy: userId });
    return this.findOne(tenantId, id);
  }

  async delegate(tenantId: string, id: string, userId: string, dto: DelegateApprovalDto): Promise<ApprovalResponseDto> {
    const approval = await this.prisma.approvalRequest.findFirst({ where: { id, tenantId } });
    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    if (!approval.approverIds.includes(userId)) {
      throw new ForbiddenException('User is not an approver');
    }

    const newApprovers = Array.from(new Set([...approval.approverIds, dto.delegateToUserId]));

    await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        approverIds: newApprovers,
        comments: this.combineComments(approval.comments, `Delegated to ${dto.delegateToUserId}${dto.reason ? `: ${dto.reason}` : ''}`),
      },
    });

    this.events.emit('approval.requested', { requestId: id, approvers: newApprovers });
    return this.findOne(tenantId, id);
  }

  async stats(tenantId: string): Promise<ApprovalStatsResponseDto> {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.approvalRequest.count({ where: { tenantId } }),
      this.prisma.approvalRequest.count({ where: { tenantId, status: ApprovalStatus.PENDING } }),
      this.prisma.approvalRequest.count({ where: { tenantId, status: ApprovalStatus.APPROVED } }),
      this.prisma.approvalRequest.count({ where: { tenantId, status: ApprovalStatus.REJECTED } }),
    ]);

    return { total, pending, approved, rejected };
  }

  private async resolveExecutionFromApproval(
    approval: any,
    status: ApprovalStatus.APPROVED | ApprovalStatus.REJECTED,
    notes: string | undefined,
    userId: string,
  ) {
    const fields = (approval.customFields ?? {}) as Record<string, any>;
    const stepExecutionId = fields.stepExecutionId as string | undefined;
    const workflowExecutionId = fields.workflowExecutionId as string | undefined;

    if (stepExecutionId) {
      await this.prisma.stepExecution.update({
        where: { id: stepExecutionId },
        data: {
          status: status === ApprovalStatus.APPROVED ? ExecutionStatus.COMPLETED : ExecutionStatus.FAILED,
          completedAt: new Date(),
          outputData: { decisionBy: userId, notes } as Prisma.InputJsonValue,
          errorMessage: status === ApprovalStatus.REJECTED ? notes : null,
        },
      });
    }

    if (workflowExecutionId) {
      await this.prisma.workflowExecution.update({
        where: { id: workflowExecutionId },
        data: {
          status: status === ApprovalStatus.APPROVED ? WorkflowExecutionStatus.COMPLETED : WorkflowExecutionStatus.FAILED,
          completedAt: new Date(),
          errorMessage: status === ApprovalStatus.REJECTED ? notes : null,
        },
      });
    }
  }

  private mapApproval(approval: any): ApprovalResponseDto {
    return {
      id: approval.id,
      requestNumber: approval.requestNumber,
      title: approval.title,
      description: approval.description,
      approvalType: approval.approvalType,
      entityType: approval.entityType,
      entityId: approval.entityId,
      approverIds: approval.approverIds ?? [],
      status: approval.status,
      dueDate: approval.dueDate,
      decidedBy: approval.decidedBy,
      decidedAt: approval.decidedAt,
      decision: approval.decision,
      comments: approval.comments,
      createdAt: approval.createdAt,
      customFields: approval.customFields ?? {},
    };
  }

  private generateRequestNumber() {
    const sequence = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `APR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${sequence}`;
  }

  private combineComments(existing: string | null, next?: string | null) {
    if (!next) return existing ?? null;
    if (!existing) return next;
    return `${existing}\n${next}`;
  }
}
