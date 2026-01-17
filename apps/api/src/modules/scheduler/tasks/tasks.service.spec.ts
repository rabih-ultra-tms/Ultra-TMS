import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../../prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    scheduledTask: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      scheduledTask: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TasksService);
  });

  it('lists tasks by tenant', async () => {
    prisma.scheduledTask.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.scheduledTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('throws when task not found', async () => {
    prisma.scheduledTask.findFirst.mockResolvedValue(null);

    await expect(service.get('task-1', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('schedules task with defaults', async () => {
    prisma.scheduledTask.create.mockResolvedValue({ id: 'task-1' });

    await service.schedule(
      {
        taskType: 'EMAIL',
        scheduledAt: '2025-01-01T00:00:00.000Z',
        handler: 'sendEmail',
      } as any,
      'tenant-1',
      'user-1',
    );

    expect(prisma.scheduledTask.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          priority: 5,
          timeoutSeconds: 60,
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('cancels task after ensure', async () => {
    prisma.scheduledTask.findFirst.mockResolvedValue({ id: 'task-1' });
    prisma.scheduledTask.update.mockResolvedValue({ id: 'task-1' });

    await service.cancel('task-1', 'tenant-1');

    expect(prisma.scheduledTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'task-1' },
        data: expect.objectContaining({ status: 'CANCELLED', processedAt: expect.any(Date) }),
      }),
    );
  });
});