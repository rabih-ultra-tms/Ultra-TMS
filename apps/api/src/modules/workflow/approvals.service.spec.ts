import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApprovalsService } from './approvals.service';
import { PrismaService } from '../../prisma.service';

describe('ApprovalsService', () => {
  let service: ApprovalsService;
  let prisma: {
    approvalRequest: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    stepExecution: { update: jest.Mock };
    workflowExecution: { update: jest.Mock };
  };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      approvalRequest: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      stepExecution: { update: jest.fn() },
      workflowExecution: { update: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(ApprovalsService);
  });

  it('creates approval from step', async () => {
    prisma.approvalRequest.create.mockResolvedValue({ id: 'a1' });

    await service.createFromStep({
      tenantId: 'tenant-1',
      userId: 'user-1',
      executionId: 'exec-1',
      stepExecutionId: 'step-1',
      step: { id: 's1', stepName: 'Approve', conditionLogic: 'x' },
    });

    expect(prisma.approvalRequest.create).toHaveBeenCalled();
  });

  it('finds approvals with pagination', async () => {
    prisma.approvalRequest.findMany.mockResolvedValue([]);
    prisma.approvalRequest.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { page: 2, limit: 10 } as any);

    expect(prisma.approvalRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it('finds pending approvals for user', async () => {
    prisma.approvalRequest.findMany.mockResolvedValue([]);
    prisma.approvalRequest.count.mockResolvedValue(0);

    await service.findPending('tenant-1', 'u1', { page: 1, limit: 5 } as any);

    expect(prisma.approvalRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PENDING', approverIds: { has: 'u1' } }) }),
    );
  });

  it('throws when approval missing', async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'a1')).rejects.toThrow(NotFoundException);
  });

  it('returns approval by id', async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue({ id: 'a1', approverIds: [], status: 'PENDING' });

    const result = await service.findOne('tenant-1', 'a1');

    expect(result.id).toBe('a1');
  });

  it('prevents approval by non-approver', async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue({ id: 'a1', approverIds: ['u2'] });

    await expect(
      service.approve('tenant-1', 'a1', 'u1', { comments: 'ok' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws when approving missing approval', async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(null);

    await expect(service.approve('tenant-1', 'a1', 'u1', { comments: 'ok' } as any)).rejects.toThrow(NotFoundException);
  });

  it('approves request and resolves execution', async () => {
    const approval = {
      id: 'a1',
      approverIds: ['u1'],
      comments: 'prev',
      customFields: { stepExecutionId: 's1', workflowExecutionId: 'w1' },
    };
    prisma.approvalRequest.findFirst.mockResolvedValue(approval);
    prisma.approvalRequest.update.mockResolvedValue(approval);
    prisma.stepExecution.update.mockResolvedValue({ id: 's1' });
    prisma.workflowExecution.update.mockResolvedValue({ id: 'w1' });

    await service.approve('tenant-1', 'a1', 'u1', { comments: 'ok' } as any);

    expect(prisma.stepExecution.update).toHaveBeenCalled();
    expect(prisma.workflowExecution.update).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('approval.approved', { requestId: 'a1', approvedBy: 'u1' });
  });

  it('rejects request and resolves execution', async () => {
    const approval = {
      id: 'a1',
      approverIds: ['u1'],
      comments: 'prev',
      customFields: { stepExecutionId: 's1', workflowExecutionId: 'w1' },
    };
    prisma.approvalRequest.findFirst.mockResolvedValue(approval);
    prisma.approvalRequest.update.mockResolvedValue(approval);
    prisma.stepExecution.update.mockResolvedValue({ id: 's1' });
    prisma.workflowExecution.update.mockResolvedValue({ id: 'w1' });

    await service.reject('tenant-1', 'a1', 'u1', { reason: 'nope' } as any);

    expect(events.emit).toHaveBeenCalledWith('approval.rejected', { requestId: 'a1', rejectedBy: 'u1' });
  });

  it('delegates approval to another user', async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue({
      id: 'a1',
      approverIds: ['u1'],
      comments: 'prev',
    });
    prisma.approvalRequest.update.mockResolvedValue({ id: 'a1' });
    prisma.approvalRequest.findFirst.mockResolvedValueOnce({
      id: 'a1',
      approverIds: ['u1', 'u2'],
    });

    await service.delegate('tenant-1', 'a1', 'u1', { delegateToUserId: 'u2' } as any);

    expect(events.emit).toHaveBeenCalledWith('approval.requested', {
      requestId: 'a1',
      approvers: ['u1', 'u2'],
    });
  });

  it('prevents delegation by non-approver', async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue({ id: 'a1', approverIds: ['u2'] });

    await expect(service.delegate('tenant-1', 'a1', 'u1', { delegateToUserId: 'u3' } as any)).rejects.toThrow(ForbiddenException);
  });

  it('returns stats', async () => {
    prisma.approvalRequest.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3);

    const result = await service.stats('tenant-1');

    expect(result).toEqual({ total: 10, pending: 2, approved: 5, rejected: 3 });
  });
});