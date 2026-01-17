import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../../../prisma.service';
import { JobSchedulerService } from './job-scheduler.service';
import { JobExecutorService } from '../executions/job-executor.service';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: {
    scheduledJob: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let scheduler: { nextRunAt: jest.Mock };
  let executor: { execute: jest.Mock };

  beforeEach(async () => {
    prisma = {
      scheduledJob: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    scheduler = { nextRunAt: jest.fn() };
    executor = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: prisma },
        { provide: JobSchedulerService, useValue: scheduler },
        { provide: JobExecutorService, useValue: executor },
      ],
    }).compile();

    service = module.get(JobsService);
  });

  it('lists system jobs by default', async () => {
    prisma.scheduledJob.findMany.mockResolvedValue([]);

    await service.list();

    expect(prisma.scheduledJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null, OR: [{ tenantId: null }] } }),
    );
  });

  it('lists tenant jobs including system', async () => {
    prisma.scheduledJob.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.scheduledJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, OR: [{ tenantId: 'tenant-1' }, { tenantId: null }] },
      }),
    );
  });

  it('throws when job not found', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue(null);

    await expect(service.get('job-1', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('creates job with computed nextRunAt', async () => {
    scheduler.nextRunAt.mockReturnValue(new Date('2025-01-02T00:00:00.000Z'));
    prisma.scheduledJob.create.mockResolvedValue({ id: 'job-1' });

    await service.create(
      {
        code: 'JOB1',
        name: 'Job',
        scheduleType: 'INTERVAL',
        intervalSeconds: 60,
        handler: 'doWork',
      } as any,
      'tenant-1',
      'user-1',
    );

    expect(prisma.scheduledJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          queue: 'default',
          nextRunAt: new Date('2025-01-02T00:00:00.000Z'),
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('updates job after ensure', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue({
      id: 'job-1',
      scheduleType: 'INTERVAL',
      intervalSeconds: 60,
      intervalMinutes: null,
      timezone: 'UTC',
      handler: 'doWork',
      handlerName: 'doWork',
      parameters: {},
      timeoutSeconds: 300,
      timeoutMinutes: null,
      maxRetries: 3,
      retryAttempts: 3,
      retryDelaySeconds: 60,
      status: 'ACTIVE',
      priority: 5,
      queue: 'default',
      allowConcurrent: false,
      maxInstances: 1,
      isEnabled: true,
    });
    scheduler.nextRunAt.mockReturnValue(new Date('2025-01-03T00:00:00.000Z'));
    prisma.scheduledJob.update.mockResolvedValue({ id: 'job-1' });

    await service.update('job-1', { name: 'Updated' } as any, 'tenant-1');

    expect(prisma.scheduledJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1' },
        data: expect.objectContaining({ name: 'Updated', nextRunAt: new Date('2025-01-03T00:00:00.000Z') }),
      }),
    );
  });

  it('removes job (soft delete)', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue({ id: 'job-1', tenantId: 'tenant-1' });
    prisma.scheduledJob.update.mockResolvedValue({ id: 'job-1' });

    await service.remove('job-1', 'tenant-1');

    expect(prisma.scheduledJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date), isEnabled: false, status: 'DISABLED' }),
      }),
    );
  });

  it('runs job now via executor', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue({ id: 'job-1', tenantId: 'tenant-1' });
    executor.execute.mockResolvedValue({ id: 'exec-1' });

    await service.runNow('job-1', 'tenant-1', 'user-1');

    expect(executor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'job-1' }),
      'user-1',
    );
  });

  it('pauses and resumes job', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue({ id: 'job-1', tenantId: 'tenant-1' });
    prisma.scheduledJob.update.mockResolvedValue({ id: 'job-1' });

    await service.pause('job-1', 'tenant-1');
    await service.resume('job-1', 'tenant-1');

    expect(prisma.scheduledJob.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'PAUSED', isEnabled: false }) }),
    );
    expect(prisma.scheduledJob.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACTIVE', isEnabled: true }) }),
    );
  });
});