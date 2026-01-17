import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { JobExecutorService } from './job-executor.service';
import { PrismaService } from '../../../prisma.service';
import { LockService } from '../locking/lock.service';
import { JobSchedulerService } from '../jobs/job-scheduler.service';
import { HandlerRegistry } from '../handlers/handler-registry';
import { RetryService } from '../retry/retry.service';

describe('JobExecutorService', () => {
  let service: JobExecutorService;
  let prisma: {
    jobExecution: { create: jest.Mock; update: jest.Mock; findUnique: jest.Mock };
    scheduledJob: { update: jest.Mock };
  };
  let lockService: { acquire: jest.Mock; release: jest.Mock };
  let scheduler: { nextRunAt: jest.Mock };
  let handlers: { execute: jest.Mock };
  let retry: { scheduleRetry: jest.Mock };

  beforeEach(async () => {
    prisma = {
      jobExecution: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
      scheduledJob: { update: jest.fn() },
    };
    lockService = { acquire: jest.fn(), release: jest.fn() };
    scheduler = { nextRunAt: jest.fn() };
    handlers = { execute: jest.fn() };
    retry = { scheduleRetry: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobExecutorService,
        { provide: PrismaService, useValue: prisma },
        { provide: LockService, useValue: lockService },
        { provide: JobSchedulerService, useValue: scheduler },
        { provide: HandlerRegistry, useValue: handlers },
        { provide: RetryService, useValue: retry },
      ],
    }).compile();

    service = module.get(JobExecutorService);
  });

  it('throws when lock not acquired', async () => {
    lockService.acquire.mockResolvedValue(false);

    await expect(
      service.execute({ id: 'job-1', handler: 'h1', parameters: {} } as any, 'user-1'),
    ).rejects.toThrow(ConflictException);
  });

  it('executes job successfully and updates run metadata', async () => {
    lockService.acquire.mockResolvedValue(true);
    prisma.jobExecution.create.mockResolvedValue({ id: 'exec-1' });
    prisma.jobExecution.update.mockResolvedValue({ id: 'exec-1' });
    prisma.jobExecution.findUnique.mockResolvedValue({ id: 'exec-1', status: 'COMPLETED' });
    handlers.execute.mockResolvedValue({ ok: true });
    scheduler.nextRunAt.mockReturnValue(new Date('2025-01-02T00:00:00.000Z'));
    prisma.scheduledJob.update.mockResolvedValue({ id: 'job-1' });
    lockService.release.mockResolvedValue(true);

    const result = await service.execute(
      {
        id: 'job-1',
        tenantId: 'tenant-1',
        handler: 'h1',
        parameters: {},
        scheduleType: 'INTERVAL',
      } as any,
      'user-1',
    );

    expect(result).toEqual({ id: 'exec-1', status: 'COMPLETED' });
    expect(handlers.execute).toHaveBeenCalledWith('h1', {});
    expect(prisma.scheduledJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1' },
        data: expect.objectContaining({
          lastRunStatus: 'COMPLETED',
          nextRunAt: new Date('2025-01-02T00:00:00.000Z'),
        }),
      }),
    );
    expect(lockService.release).toHaveBeenCalledWith('job-1', 'user-1');
  });

  it('handles failures and schedules retry', async () => {
    lockService.acquire.mockResolvedValue(true);
    prisma.jobExecution.create.mockResolvedValue({ id: 'exec-1' });
    prisma.jobExecution.update.mockResolvedValue({ id: 'exec-1' });
    prisma.jobExecution.findUnique.mockResolvedValue({ id: 'exec-1', status: 'FAILED' });
    handlers.execute.mockRejectedValue(new Error('boom'));
    retry.scheduleRetry.mockResolvedValue(new Date('2025-01-03T00:00:00.000Z'));
    prisma.scheduledJob.update.mockResolvedValue({ id: 'job-1' });
    lockService.release.mockResolvedValue(true);

    const result = await service.execute(
      {
        id: 'job-1',
        tenantId: 'tenant-1',
        handler: 'h1',
        parameters: {},
        scheduleType: 'INTERVAL',
      } as any,
      'user-1',
    );

    expect(result).toEqual({ id: 'exec-1', status: 'FAILED' });
    expect(retry.scheduleRetry).toHaveBeenCalled();
    expect(prisma.scheduledJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lastRunStatus: 'FAILED',
          failureCount: expect.any(Number),
        }),
      }),
    );
    expect(lockService.release).toHaveBeenCalledWith('job-1', 'user-1');
  });
});