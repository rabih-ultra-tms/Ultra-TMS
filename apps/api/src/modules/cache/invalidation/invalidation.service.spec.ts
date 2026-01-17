import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvalidationService } from './invalidation.service';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';

describe('InvalidationService', () => {
  let service: InvalidationService;
  let prisma: {
    cacheInvalidationRule: {
      findMany: jest.Mock;
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let redis: { deleteByPattern: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      cacheInvalidationRule: {
        findMany: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    redis = { deleteByPattern: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvalidationService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(InvalidationService);
  });

  it('invalidates by pattern and emits event', async () => {
    redis.deleteByPattern.mockResolvedValue(3);

    const result = await service.invalidate('tenant-1', { pattern: 'tenant-1:*' } as any);

    expect(result).toEqual({ pattern: 'tenant-1:*', deleted: 3 });
    expect(events.emit).toHaveBeenCalledWith('cache.invalidated', { pattern: 'tenant-1:*', count: 3 });
  });

  it('invalidates by tags and emits event', async () => {
    redis.deleteByPattern.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

    const result = await service.invalidate('tenant-1', { tags: ['a', 'b'] } as any);

    expect(result).toEqual({ tags: ['a', 'b'], deleted: 3 });
    expect(events.emit).toHaveBeenCalledWith('cache.invalidated', { tags: ['a', 'b'], count: 3 });
  });

  it('returns zero when no pattern or tags', async () => {
    const result = await service.invalidate('tenant-1', {} as any);

    expect(result).toEqual({ deleted: 0 });
    expect(events.emit).not.toHaveBeenCalled();
  });

  it('lists rules ordered by createdAt', async () => {
    prisma.cacheInvalidationRule.findMany.mockResolvedValue([]);

    await service.rules('tenant-1');

    expect(prisma.cacheInvalidationRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' }, orderBy: { createdAt: 'desc' } }),
    );
  });

  it('creates rule with user id', async () => {
    prisma.cacheInvalidationRule.create.mockResolvedValue({ id: 'r1' });

    await service.createRule('tenant-1', 'user-1', {
      triggerEvent: 'load.updated',
      cachePattern: 'loads:*',
      invalidationType: 'pattern',
    });

    expect(prisma.cacheInvalidationRule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', createdById: 'user-1' }),
      }),
    );
  });

  it('deletes rule by id and tenant', async () => {
    prisma.cacheInvalidationRule.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.deleteRule('tenant-1', 'rule-1');

    expect(result).toEqual({ deleted: true });
    expect(prisma.cacheInvalidationRule.deleteMany).toHaveBeenCalledWith({
      where: { id: 'rule-1', tenantId: 'tenant-1' },
    });
  });
});