import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { PrismaService } from '../../prisma.service';
import { ExecutionsService } from './executions.service';

describe('WorkflowsService', () => {
  let service: WorkflowsService;
  let prisma: {
    workflow: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    workflowStep: {
      deleteMany: jest.Mock;
      create: jest.Mock;
    };
    workflowExecution: { groupBy: jest.Mock; findFirst: jest.Mock };
    $transaction: jest.Mock;
  };
  let executions: { startExecution: jest.Mock };

  beforeEach(async () => {
    prisma = {
      workflow: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      workflowStep: {
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
      workflowExecution: { groupBy: jest.fn(), findFirst: jest.fn() },
      $transaction: jest.fn(),
    };
    executions = { startExecution: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExecutionsService, useValue: executions },
      ],
    }).compile();

    service = module.get(WorkflowsService);
  });

  it('finds workflows with search', async () => {
    prisma.workflow.findMany.mockResolvedValue([]);
    prisma.workflow.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { search: 'load' } as any);

    expect(prisma.workflow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) }),
    );
  });

  it('throws when workflow not found', async () => {
    prisma.workflow.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'w1')).rejects.toThrow(NotFoundException);
  });

  it('returns workflow by id', async () => {
    prisma.workflow.findFirst.mockResolvedValue({ id: 'w1', workflowSteps: [] });

    const result = await service.findOne('tenant-1', 'w1');

    expect(result.id).toBe('w1');
  });

  it('creates workflow with steps', async () => {
    prisma.workflow.create.mockResolvedValue({ id: 'w1', workflowSteps: [] });

    await service.create('tenant-1', 'user-1', {
      name: 'WF',
      triggerType: 'MANUAL',
      steps: [{ stepNumber: 1, stepType: 'ACTION' }],
    } as any);

    expect(prisma.workflow.create).toHaveBeenCalled();
  });

  it('updates workflow using transaction', async () => {
    prisma.workflow.findFirst.mockResolvedValueOnce({ id: 'w1', workflowSteps: [] });
    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        workflow: prisma.workflow,
        workflowStep: prisma.workflowStep,
      };
      prisma.workflow.findFirst.mockResolvedValueOnce({ id: 'w1', workflowSteps: [] });
      return cb(tx);
    });

    await service.update('tenant-1', 'w1', 'user-1', { name: 'Updated', steps: [] } as any);

    expect(prisma.workflow.update).toHaveBeenCalled();
  });

  it('updates workflow steps when provided', async () => {
    prisma.workflow.findFirst.mockResolvedValueOnce({ id: 'w1', workflowSteps: [] });
    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        workflow: prisma.workflow,
        workflowStep: prisma.workflowStep,
      };
      prisma.workflow.findFirst.mockResolvedValueOnce({ id: 'w1', workflowSteps: [] });
      return cb(tx);
    });

    await service.update('tenant-1', 'w1', 'user-1', {
      steps: [{ stepNumber: 1, stepType: 'ACTION' }],
    } as any);

    expect(prisma.workflowStep.deleteMany).toHaveBeenCalled();
    expect(prisma.workflowStep.create).toHaveBeenCalled();
  });

  it('removes workflow (soft delete)', async () => {
    prisma.workflow.findFirst.mockResolvedValue({ id: 'w1', workflowSteps: [] });
    prisma.workflow.update.mockResolvedValue({ id: 'w1' });

    const result = await service.remove('tenant-1', 'w1');

    expect(result).toEqual({ success: true });
  });

  it('publishes workflow and increments version', async () => {
    prisma.workflow.findFirst.mockResolvedValue({ id: 'w1', workflowSteps: [] });
    prisma.workflow.update.mockResolvedValue({ id: 'w1', workflowSteps: [] });

    const result = await service.publish('tenant-1', 'w1', 'user-1');

    expect(result.id).toBe('w1');
    expect(prisma.workflow.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ version: { increment: 1 }, updatedById: 'user-1' }) }),
    );
  });

  it('activates workflow', async () => {
    prisma.workflow.findFirst.mockResolvedValue({ id: 'w1', workflowSteps: [] });
    prisma.workflow.update.mockResolvedValue({ id: 'w1', workflowSteps: [] });

    const result = await service.activate('tenant-1', 'w1', 'user-1');

    expect(result.id).toBe('w1');
  });

  it('deactivates workflow', async () => {
    prisma.workflow.findFirst.mockResolvedValue({ id: 'w1', workflowSteps: [] });
    prisma.workflow.update.mockResolvedValue({ id: 'w1', workflowSteps: [] });

    const result = await service.deactivate('tenant-1', 'w1', 'user-1');

    expect(result.id).toBe('w1');
  });

  it('throws when executing inactive workflow', async () => {
    prisma.workflow.findFirst.mockResolvedValue({ id: 'w1', status: 'INACTIVE', workflowSteps: [] });

    await expect(
      service.execute('tenant-1', 'w1', 'user-1', { entityId: 'e1' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('executes active workflow', async () => {
    prisma.workflow.findFirst.mockResolvedValue({ id: 'w1', status: 'ACTIVE', workflowSteps: [] });
    executions.startExecution.mockResolvedValue({ id: 'exec-1' });

    const result = await service.execute('tenant-1', 'w1', 'user-1', { entityId: 'e1' } as any);

    expect(result).toEqual({ id: 'exec-1' });
  });

  it('returns stats with totals', async () => {
    prisma.workflow.findFirst.mockResolvedValue({ id: 'w1', workflowSteps: [] });
    prisma.workflowExecution.groupBy.mockResolvedValue([{ status: 'COMPLETED', _count: { _all: 3 } }]);
    prisma.workflowExecution.findFirst.mockResolvedValue({ completedAt: new Date('2025-01-01') });

    const result = await service.stats('tenant-1', 'w1');

    expect(result.totals).toEqual({ COMPLETED: 3 });
  });

  it('validates workflow definition', () => {
    const result = service.validateDefinition({ name: '', triggerType: null, steps: [] } as any);
    expect(result.valid).toBe(false);
  });

  it('validates workflow definition success', () => {
    const result = service.validateDefinition({ name: 'WF', triggerType: 'MANUAL', steps: [{ stepNumber: 1, stepType: 'ACTION' }] } as any);
    expect(result.valid).toBe(true);
  });
});