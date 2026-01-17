import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExecutionsService } from './executions.service';
import { PrismaService } from '../../prisma.service';
import { ApprovalsService } from './approvals.service';

describe('ExecutionsService', () => {
  let service: ExecutionsService;
  let prisma: {
    workflowExecution: {
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
    };
    stepExecution: {
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      updateMany: jest.Mock;
    };
    workflow: { findFirst: jest.Mock };
  };
  let approvals: { createFromStep: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      workflowExecution: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
      },
      stepExecution: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      workflow: { findFirst: jest.fn() },
    };
    approvals = { createFromStep: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ApprovalsService, useValue: approvals },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(ExecutionsService);
  });

  it('starts execution and completes workflow with action steps', async () => {
    prisma.workflowExecution.create.mockResolvedValue({ id: 'exec-1', workflowId: 'w1' });
    prisma.stepExecution.create.mockResolvedValue({ id: 'step-1', workflowStep: { stepNumber: 1 } });
    prisma.stepExecution.update.mockResolvedValue({ id: 'step-1' });
    prisma.workflowExecution.update.mockResolvedValue({ id: 'exec-1', status: 'COMPLETED' });

    const result = await service.startExecution(
      'tenant-1',
      'user-1',
      { id: 'w1', workflowSteps: [{ id: 's1', stepType: 'ACTION' }] },
      { entityId: 'e1', entityType: 'LOAD' } as any,
    );

    expect(result.status).toBe('COMPLETED');
    expect(prisma.stepExecution.update).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('workflow.completed', { executionId: 'exec-1', workflowId: 'w1' });
  });

  it('finds executions with pagination', async () => {
    prisma.workflowExecution.findMany.mockResolvedValue([]);
    prisma.workflowExecution.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { page: 2, limit: 10 } as any);

    expect(prisma.workflowExecution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it('throws when execution not found', async () => {
    prisma.workflowExecution.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'exec-1')).rejects.toThrow(NotFoundException);
  });

  it('returns steps for execution', async () => {
    prisma.workflowExecution.findFirst.mockResolvedValue({ id: 'exec-1' });
    prisma.stepExecution.findMany.mockResolvedValue([{ id: 's1', workflowStep: { stepNumber: 1 } }]);

    const result = await service.getSteps('tenant-1', 'exec-1');

    expect(result[0]?.stepNumber).toBe(1);
  });

  it('prevents cancel when status is terminal', async () => {
    prisma.workflowExecution.findFirst.mockResolvedValue({ id: 'exec-1', status: 'COMPLETED' });

    await expect(
      service.cancel('tenant-1', 'exec-1', 'user-1', { reason: 'x' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('cancels execution when running', async () => {
    prisma.workflowExecution.findFirst.mockResolvedValue({ id: 'exec-1', status: 'RUNNING' });
    prisma.workflowExecution.update.mockResolvedValue({ id: 'exec-1', status: 'CANCELLED', stepExecutions: [] });

    const result = await service.cancel('tenant-1', 'exec-1', 'user-1', { reason: 'x' } as any);

    expect(result.status).toBe('CANCELLED');
  });

  it('retries failed execution', async () => {
    prisma.workflowExecution.findFirst.mockResolvedValue({
      id: 'exec-1',
      status: 'FAILED',
      workflowId: 'w1',
      triggerData: {},
    });
    prisma.stepExecution.updateMany.mockResolvedValue({ count: 1 });
    prisma.workflowExecution.update.mockResolvedValue({ id: 'exec-1', status: 'PENDING' });
    prisma.workflow.findFirst.mockResolvedValue({ id: 'w1', workflowSteps: [{ stepNumber: 1 }] });
    prisma.workflowExecution.create.mockResolvedValue({ id: 'exec-2', workflowId: 'w1' });
    prisma.stepExecution.create.mockResolvedValue({ id: 'step-1', workflowStep: { stepNumber: 1 } });
    prisma.stepExecution.update.mockResolvedValue({ id: 'step-1' });
    prisma.workflowExecution.update.mockResolvedValueOnce({ id: 'exec-1', status: 'PENDING' });
    prisma.workflowExecution.update.mockResolvedValueOnce({ id: 'exec-2', status: 'COMPLETED' });

    const result = await service.retry('tenant-1', 'exec-1', 'user-1', { fromStepNumber: 1 } as any);

    expect(result).toHaveProperty('executionId');
  });
});