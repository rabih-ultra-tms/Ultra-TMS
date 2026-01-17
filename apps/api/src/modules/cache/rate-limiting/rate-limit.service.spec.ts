import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service';
import { PrismaService } from '../../../prisma.service';

describe('RateLimitService', () => {
  let service: RateLimitService;
  let prisma: {
    rateLimit: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      rateLimit: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RateLimitService);
  });

  it('lists rate limits with tenant filter', async () => {
    prisma.rateLimit.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.rateLimit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
  });

  it('returns usage defaults when missing', async () => {
    prisma.rateLimit.findFirst.mockResolvedValue(null);

    const result = await service.usage('key-1');

    expect(result).toEqual({ identifier: 'key-1', current: 0, limit: 0, windowSeconds: 0, resetAt: null });
  });

  it('updates existing rate limit', async () => {
    prisma.rateLimit.findFirst.mockResolvedValue({
      scope: 'GLOBAL',
      identifier: 'key-1',
      currentRequests: 5,
      windowStartsAt: new Date('2025-01-01T00:00:00.000Z'),
      windowSeconds: 60,
      maxRequests: 10,
    });
    prisma.rateLimit.update.mockResolvedValue({ identifier: 'key-1' });

    await service.update('key-1', { requestsPerMinute: 120 } as any);

    expect(prisma.rateLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { scope_identifier: { scope: 'GLOBAL', identifier: 'key-1' } },
        data: expect.objectContaining({ maxRequests: 120, windowSeconds: 60 }),
      }),
    );
  });

  it('creates new rate limit when missing', async () => {
    prisma.rateLimit.findFirst.mockResolvedValue(null);
    prisma.rateLimit.create.mockResolvedValue({ identifier: 'key-1' });

    await service.update('key-1', { requestsPerHour: 300 } as any, 'tenant-1');

    expect(prisma.rateLimit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          identifier: 'key-1',
          maxRequests: 300,
          windowSeconds: 3600,
        }),
      }),
    );
  });

  it('resets existing rate limit', async () => {
    prisma.rateLimit.findFirst.mockResolvedValue({ scope: 'GLOBAL', identifier: 'key-1' });
    prisma.rateLimit.update.mockResolvedValue({});

    const result = await service.reset('key-1');

    expect(result).toEqual({ reset: true });
    expect(prisma.rateLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { scope_identifier: { scope: 'GLOBAL', identifier: 'key-1' } },
        data: expect.objectContaining({ currentRequests: 0, windowStartsAt: expect.any(Date) }),
      }),
    );
  });

  it('increments usage and resets when window expired', async () => {
    prisma.rateLimit.update.mockResolvedValue({});

    await service.incrementUsage({
      scope: 'GLOBAL' as any,
      identifier: 'key-1',
      windowStartsAt: new Date('2000-01-01T00:00:00.000Z'),
      windowSeconds: 1,
    });

    expect(prisma.rateLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentRequests: 1, windowStartsAt: expect.any(Date) }),
      }),
    );
  });

  it('increments usage within window', async () => {
    prisma.rateLimit.update.mockResolvedValue({});

    await service.incrementUsage({
      scope: 'GLOBAL' as any,
      identifier: 'key-1',
      windowStartsAt: new Date(Date.now() - 1000),
      windowSeconds: 60,
    });

    expect(prisma.rateLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { currentRequests: { increment: 1 } },
      }),
    );
  });
});