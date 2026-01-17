import { Test, TestingModule } from '@nestjs/testing';
import { LockService } from './lock.service';
import { PrismaService } from '../../../prisma.service';

describe('LockService', () => {
  let service: LockService;
  let prisma: {
    jobLock: {
      findUnique: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
      deleteMany: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      jobLock: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LockService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(LockService);
  });

  it('acquires lock when none exists', async () => {
    prisma.jobLock.findUnique.mockResolvedValue(null);
    prisma.jobLock.create.mockResolvedValue({ jobId: 'job-1' });

    const result = await service.acquire('job-1', 'worker-1', 'tenant-1');

    expect(result).toBe(true);
    expect(prisma.jobLock.create).toHaveBeenCalled();
  });

  it('returns false when lock held by other worker', async () => {
    prisma.jobLock.findUnique.mockResolvedValue({
      jobId: 'job-1',
      workerId: 'worker-2',
      expiresAt: new Date(Date.now() + 60000),
    });

    const result = await service.acquire('job-1', 'worker-1', 'tenant-1');

    expect(result).toBe(false);
  });

  it('updates existing lock when expired', async () => {
    prisma.jobLock.findUnique.mockResolvedValue({
      jobId: 'job-1',
      workerId: 'worker-2',
      tenantId: 'tenant-1',
      expiresAt: new Date(Date.now() - 1000),
    });
    prisma.jobLock.update.mockResolvedValue({ jobId: 'job-1' });

    const result = await service.acquire('job-1', 'worker-1', 'tenant-1');

    expect(result).toBe(true);
    expect(prisma.jobLock.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { jobId: 'job-1' } }),
    );
  });

  it('releases lock by job and worker', async () => {
    prisma.jobLock.deleteMany.mockResolvedValue({ count: 1 });

    await service.release('job-1', 'worker-1');

    expect(prisma.jobLock.deleteMany).toHaveBeenCalledWith({
      where: { jobId: 'job-1', workerId: 'worker-1' },
    });
  });

  it('updates heartbeat and expiry', async () => {
    prisma.jobLock.updateMany.mockResolvedValue({ count: 1 });

    await service.heartbeat('job-1', 'worker-1');

    expect(prisma.jobLock.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobId: 'job-1', workerId: 'worker-1' },
        data: expect.objectContaining({ lastHeartbeat: expect.any(Date), expiresAt: expect.any(Date) }),
      }),
    );
  });
});