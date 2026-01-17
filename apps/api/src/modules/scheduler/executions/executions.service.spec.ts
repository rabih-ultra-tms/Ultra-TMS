import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { PrismaService } from '../../../prisma.service';
import { RetryService } from '../retry/retry.service';

describe('ExecutionsService', () => {
  let service: ExecutionsService;
  let prisma: {
    scheduledJob: { findUnique: jest.Mock };
    jobExecution: { findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  };
  let retry: { scheduleRetry: jest.Mock };

  beforeEach(async () => {
    prisma = {
      scheduledJob: { findUnique: jest.fn() },
      jobExecution: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    };
    retry = { scheduleRetry: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RetryService, useValue: retry },
      ],
    }).compile();

    service = module.get(ExecutionsService);
  });

  it('throws when job not found', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue(null);

    await expect(service.list('job-1', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('lists executions after ensure', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue({ id: 'job-1', tenantId: 'tenant-1' });
    prisma.jobExecution.findMany.mockResolvedValue([]);

    await service.list('job-1', 'tenant-1');

    expect(prisma.jobExecution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { jobId: 'job-1' } }),
    );
  });

  it('throws when execution not found', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue({ id: 'job-1', tenantId: 'tenant-1' });
    prisma.jobExecution.findFirst.mockResolvedValue(null);

    await expect(service.get('job-1', 'exec-1', 'tenant-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('prevents cancel when not pending or running', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue({ id: 'job-1', tenantId: 'tenant-1' });
    prisma.jobExecution.findFirst.mockResolvedValue({ id: 'exec-1', status: 'COMPLETED' });

    await expect(service.cancel('job-1', 'exec-1', 'tenant-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('cancels execution when pending', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue({ id: 'job-1', tenantId: 'tenant-1' });
    prisma.jobExecution.findFirst.mockResolvedValue({ id: 'exec-1', status: 'PENDING' });
    prisma.jobExecution.update.mockResolvedValue({ id: 'exec-1' });

    await service.cancel('job-1', 'exec-1', 'tenant-1');

    expect(prisma.jobExecution.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'exec-1' },
        data: expect.objectContaining({ status: 'CANCELLED', completedAt: expect.any(Date) }),
      }),
    );
  });

  it('retries execution via retry service', async () => {
    prisma.scheduledJob.findUnique.mockResolvedValue({ id: 'job-1', tenantId: 'tenant-1' });
    prisma.jobExecution.findFirst.mockResolvedValue({ id: 'exec-1', status: 'FAILED' });
    retry.scheduleRetry.mockResolvedValue('2025-01-10T00:00:00.000Z');

    await service.retry('job-1', 'exec-1', 'tenant-1');

    expect(retry.scheduleRetry).toHaveBeenCalled();
  });
});