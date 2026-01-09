import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  ApprovalQueryDto,
  ApproveRequestDto,
  RejectRequestDto,
  DelegateRequestDto,
  AddApprovalCommentDto,
  ApprovalResponseDto,
  ApprovalListResponseDto,
} from './dto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: ApprovalQueryDto): Promise<ApprovalListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.requestedAction) {
      where.requestedAction = query.requestedAction;
    }

    const [approvals, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          workflowExecution: {
            select: { id: true, executionNumber: true, workflow: { select: { name: true } } },
          },
          requestedByUser: { select: { id: true, firstName: true, lastName: true } },
          resolvedByUser: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);

    return {
      data: approvals.map(a => this.toResponseDto(a)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMyApprovals(
    tenantId: string,
    userId: string,
    query: ApprovalQueryDto,
  ): Promise<ApprovalListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Find approvals where user is an approver
    const where: any = {
      tenantId,
      status: 'PENDING',
      approvers: {
        path: ['$[*].userId'],
        array_contains: userId,
      },
    };

    // For simplicity, fetch all pending and filter in code
    const allPending = await this.prisma.approvalRequest.findMany({
      where: { tenantId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        workflowExecution: {
          select: { id: true, executionNumber: true, workflow: { select: { name: true } } },
        },
        requestedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Filter for user's approvals
    const myApprovals = allPending.filter(a => {
      const approvers = JSON.parse(JSON.stringify(a.approvers)) as any[];
      return approvers.some((ap: any) => ap.userId === userId && !ap.respondedAt);
    });

    const paged = myApprovals.slice(skip, skip + limit);

    return {
      data: paged.map(a => this.toResponseDto(a)),
      total: myApprovals.length,
      page,
      limit,
      totalPages: Math.ceil(myApprovals.length / limit),
    };
  }

  async findOne(tenantId: string, id: string): Promise<ApprovalResponseDto> {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id, tenantId },
      include: {
        workflowExecution: {
          select: { id: true, executionNumber: true, workflow: { select: { name: true } } },
        },
        requestedByUser: { select: { id: true, firstName: true, lastName: true } },
        resolvedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    return this.toResponseDto(approval);
  }

  async approve(
    tenantId: string,
    id: string,
    userId: string,
    dto: ApproveRequestDto,
  ): Promise<ApprovalResponseDto> {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id, tenantId },
    });

    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    if (approval.status !== 'PENDING') {
      throw new BadRequestException('Approval request is not pending');
    }

    // Update approver status
    const approvers = JSON.parse(JSON.stringify(approval.approvers)) as any[];
    const approverIndex = approvers.findIndex((a: any) => a.userId === userId);

    if (approverIndex === -1) {
      throw new ForbiddenException('You are not an approver for this request');
    }

    approvers[approverIndex].status = 'APPROVED';
    approvers[approverIndex].respondedAt = new Date().toISOString();
    approvers[approverIndex].notes = dto.notes;

    // Check if approval requirements are met
    const approvedCount = approvers.filter((a: any) => a.status === 'APPROVED').length;
    let newStatus = 'PENDING';

    if (approval.approvalType === 'SINGLE' || approval.approvalType === 'ANY') {
      newStatus = 'APPROVED';
    } else if (approval.approvalType === 'ALL' && approvedCount >= approval.requiredApprovals) {
      newStatus = 'APPROVED';
    } else if (approval.approvalType === 'SEQUENTIAL') {
      // Check if all previous approvers have approved
      const allApproved = approvers.every((a: any) => a.status === 'APPROVED');
      if (allApproved) {
        newStatus = 'APPROVED';
      }
    }

    await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        approvers: approvers as any,
        status: newStatus,
        resolvedAt: newStatus !== 'PENDING' ? new Date() : null,
        resolvedBy: newStatus !== 'PENDING' ? userId : null,
        resolutionNotes: dto.notes,
      },
    });

    // If approved, continue workflow execution
    if (newStatus === 'APPROVED') {
      await this.continueWorkflowExecution(approval.workflowExecutionId);
    }

    return this.findOne(tenantId, id);
  }

  async reject(
    tenantId: string,
    id: string,
    userId: string,
    dto: RejectRequestDto,
  ): Promise<ApprovalResponseDto> {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id, tenantId },
    });

    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    if (approval.status !== 'PENDING') {
      throw new BadRequestException('Approval request is not pending');
    }

    // Update approver status
    const approvers = JSON.parse(JSON.stringify(approval.approvers)) as any[];
    const approverIndex = approvers.findIndex((a: any) => a.userId === userId);

    if (approverIndex === -1) {
      throw new ForbiddenException('You are not an approver for this request');
    }

    approvers[approverIndex].status = 'REJECTED';
    approvers[approverIndex].respondedAt = new Date().toISOString();
    approvers[approverIndex].notes = dto.notes;

    await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        approvers: approvers as any,
        status: 'REJECTED',
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolutionNotes: `${dto.reason}${dto.notes ? `\n${dto.notes}` : ''}`,
      },
    });

    // Fail the workflow execution
    await this.prisma.workflowExecution.update({
      where: { id: approval.workflowExecutionId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: `Approval rejected: ${dto.reason}`,
      },
    });

    return this.findOne(tenantId, id);
  }

  async delegate(
    tenantId: string,
    id: string,
    userId: string,
    dto: DelegateRequestDto,
  ): Promise<ApprovalResponseDto> {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id, tenantId },
    });

    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    if (approval.status !== 'PENDING') {
      throw new BadRequestException('Approval request is not pending');
    }

    // Verify delegate user exists
    const delegateUser = await this.prisma.user.findFirst({
      where: { id: dto.delegateToUserId, tenantId },
    });

    if (!delegateUser) {
      throw new NotFoundException('Delegate user not found');
    }

    // Update approvers list
    const approvers = JSON.parse(JSON.stringify(approval.approvers)) as any[];
    const approverIndex = approvers.findIndex((a: any) => a.userId === userId);

    if (approverIndex === -1) {
      throw new ForbiddenException('You are not an approver for this request');
    }

    approvers[approverIndex].status = 'DELEGATED';
    approvers[approverIndex].respondedAt = new Date().toISOString();
    approvers[approverIndex].delegatedTo = dto.delegateToUserId;
    approvers[approverIndex].notes = dto.reason;

    // Add new approver
    approvers.push({
      userId: dto.delegateToUserId,
      status: 'PENDING',
      delegatedFrom: userId,
    });

    await this.prisma.approvalRequest.update({
      where: { id },
      data: { approvers: approvers as any },
    });

    return this.findOne(tenantId, id);
  }

  async addComment(
    tenantId: string,
    id: string,
    userId: string,
    dto: AddApprovalCommentDto,
  ): Promise<ApprovalResponseDto> {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id, tenantId },
    });

    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    // For simplicity, add comment to request data
    const requestData = JSON.parse(JSON.stringify(approval.requestData)) as any;
    requestData.comments = requestData.comments || [];
    requestData.comments.push({
      userId,
      comment: dto.comment,
      createdAt: new Date().toISOString(),
    });

    await this.prisma.approvalRequest.update({
      where: { id },
      data: { requestData: requestData as any },
    });

    return this.findOne(tenantId, id);
  }

  private async continueWorkflowExecution(executionId: string): Promise<void> {
    // In production, you'd queue this for async processing
    // For now, mark as completed
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  private toResponseDto(approval: any): ApprovalResponseDto {
    return {
      id: approval.id,
      requestNumber: approval.requestNumber,
      approvalType: approval.approvalType,
      entityType: approval.entityType,
      entityId: approval.entityId,
      entitySummary: approval.entitySummary,
      requestedAction: approval.requestedAction,
      requestData: JSON.parse(JSON.stringify(approval.requestData || {})),
      approvers: JSON.parse(JSON.stringify(approval.approvers || [])),
      requiredApprovals: approval.requiredApprovals,
      status: approval.status,
      dueAt: approval.dueAt,
      reminderSent: approval.reminderSent,
      resolvedAt: approval.resolvedAt,
      resolvedBy: approval.resolvedBy,
      resolutionNotes: approval.resolutionNotes,
      requestedBy: approval.requestedBy,
      createdAt: approval.createdAt,
      workflowExecutionId: approval.workflowExecutionId,
      stepExecutionId: approval.stepExecutionId,
    };
  }
}
