import { Test, TestingModule } from '@nestjs/testing';
import { RetryService } from './retry.service';
import { PrismaService } from '../../../prisma.service';

describe('RetryService', () => {
  let service: RetryService;
  let prisma: {
    jobExecution: { create: jest.Mock; update: jest.Mock };
    scheduledJob: { update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      jobExecution: { create: jest.fn(), update: jest.fn() },
      scheduledJob: { update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RetryService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RetryService);
  });

  it('returns null when max attempts reached', async () => {
    const result = await service.scheduleRetry(
      { id: 'e1', attemptNumber: 3, executionNumber: 1 } as any,
      { id: 'j1', maxRetries: 3 } as any,
    );

    expect(result).toBeNull();
    expect(prisma.jobExecution.create).not.toHaveBeenCalled();
  });

  it('schedules retry and updates job', async () => {
    prisma.jobExecution.create.mockResolvedValue({ id: 'e2' });
    prisma.jobExecution.update.mockResolvedValue({ id: 'e1' });
    prisma.scheduledJob.update.mockResolvedValue({ id: 'j1' });

    const result = await service.scheduleRetry(
      { id: 'e1', attemptNumber: 1, executionNumber: 2, createdById: 'user-1' } as any,
      { id: 'j1', tenantId: 'tenant-1', retryDelaySeconds: 1, maxRetries: 3 } as any,
    );

    expect(result).toBeInstanceOf(Date);
    expect(prisma.jobExecution.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobId: 'j1',
          tenantId: 'tenant-1',
          retryOf: 'e1',
          attemptNumber: 2,
        }),
      }),
    );
    expect(prisma.scheduledJob.update).toHaveBeenCalled();
    expect(prisma.jobExecution.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'e1' },
        data: { willRetry: true },
      }),
    );
  });
});