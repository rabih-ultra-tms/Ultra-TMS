import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoadPostStatus } from '@prisma/client';
import { PostingService } from './posting.service';
import { PrismaService } from '../../../prisma.service';

describe('PostingService', () => {
  let service: PostingService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      load: { findFirst: jest.fn() },
      loadBoardAccount: { findMany: jest.fn() },
      loadPost: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn(), create: jest.fn() },
      $transaction: jest.fn(),
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostingService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(PostingService);
  });

  it('lists posts', async () => {
    prisma.loadPost.findMany.mockResolvedValue([]);
    prisma.loadPost.count.mockResolvedValue(0);

    const result = await service.list('t1', {} as any);

    expect(result.total).toBe(0);
  });

  it('finds post by id', async () => {
    prisma.loadPost.findFirst.mockResolvedValue({ id: 'p1' });

    const result = await service.findOne('t1', 'p1');

    expect(result.id).toBe('p1');
  });

  it('throws when post missing', async () => {
    prisma.loadPost.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('throws when load missing', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.create('t1', 'u1', { loadId: 'l1', accountIds: [] } as any)).rejects.toThrow(NotFoundException);
  });

  it('throws when accounts missing', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1', order: { stops: [{ stopType: 'PICKUP' }, { stopType: 'DELIVERY' }] } });
    prisma.loadBoardAccount.findMany.mockResolvedValue([]);

    await expect(service.create('t1', 'u1', { loadId: 'l1', accountIds: ['a1'] } as any)).rejects.toThrow(BadRequestException);
  });

  it('creates posts and emits', async () => {
    prisma.load.findFirst.mockResolvedValue({
      id: 'l1',
      orderId: 'o1',
      order: { stops: [{ stopType: 'PICKUP', city: 'A', state: 'TX' }, { stopType: 'DELIVERY', city: 'B', state: 'CA' }] },
    });
    prisma.loadBoardAccount.findMany.mockResolvedValue([{ id: 'a1', customFields: {} }]);
    prisma.$transaction.mockResolvedValue([{ id: 'p1', loadId: 'l1' }]);

    const result = await service.create('t1', 'u1', { loadId: 'l1', accountIds: ['a1'] } as any);

    expect(result.length).toBe(1);
    expect(events.emit).toHaveBeenCalledWith('loadboard.post.created', expect.any(Object));
  });

  it('throws when load missing stops', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1', order: { stops: [] } });
    prisma.loadBoardAccount.findMany.mockResolvedValue([{ id: 'a1', customFields: {} }]);

    await expect(service.create('t1', 'u1', { loadId: 'l1', accountIds: ['a1'] } as any)).rejects.toThrow(BadRequestException);
  });

  it('updates post fields', async () => {
    prisma.loadPost.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.loadPost.update.mockResolvedValue({ id: 'p1', status: LoadPostStatus.POSTED });

    const result = await service.update('t1', 'p1', { status: 'POSTED', rateAmount: 1500 } as any);

    expect(result.status).toBe(LoadPostStatus.POSTED);
    expect(prisma.loadPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: LoadPostStatus.POSTED, postedRate: 1500 }),
      }),
    );
  });

  it('refreshes post and emits', async () => {
    prisma.loadPost.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.loadPost.update.mockResolvedValue({ id: 'p1', status: LoadPostStatus.POSTED });

    const result = await service.refresh('t1', 'p1');

    expect(result.status).toBe(LoadPostStatus.POSTED);
    expect(events.emit).toHaveBeenCalledWith('loadboard.post.refreshed', expect.any(Object));
  });

  it('removes post and emits', async () => {
    prisma.loadPost.findFirst.mockResolvedValue({ id: 'p1', loadId: 'l1' });
    prisma.loadPost.update.mockResolvedValue({ id: 'p1' });

    const result = await service.remove('t1', 'p1');

    expect(result).toEqual({ success: true });
    expect(events.emit).toHaveBeenCalledWith('loadboard.post.removed', expect.objectContaining({ postId: 'p1', loadId: 'l1' }));
  });

  it('bulk posts multiple loads', async () => {
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue([{ id: 'p1' }] as any);

    const result = await service.bulkPost('t1', 'u1', { loadIds: ['l1', 'l2'], accountIds: ['a1'] } as any);

    expect(result.count).toBe(2);
    expect(createSpy).toHaveBeenCalledTimes(2);
  });

  it('bulk remove returns zero when none', async () => {
    prisma.loadPost.findMany.mockResolvedValue([]);

    const result = await service.bulkRemove('t1', {} as any);

    expect(result.count).toBe(0);
  });

  it('bulk remove updates posts and emits', async () => {
    prisma.loadPost.findMany.mockResolvedValue([{ id: 'p1', loadId: 'l1' }]);
    prisma.loadPost.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.bulkRemove('t1', { postIds: ['p1'] } as any);

    expect(result.count).toBe(1);
    expect(events.emit).toHaveBeenCalledWith('loadboard.post.removed', expect.objectContaining({ postId: 'p1', loadId: 'l1' }));
  });

  it('returns posts for load', async () => {
    prisma.loadPost.findMany.mockResolvedValue([{ id: 'p1' }]);

    const result = await service.postsForLoad('t1', 'l1');

    expect(result).toEqual([{ id: 'p1' }]);
  });
});
