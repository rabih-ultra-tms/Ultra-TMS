import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EdiQueueService } from './edi-queue.service';
import { PrismaService } from '../../../prisma.service';
import { EdiMessageStatus } from '@prisma/client';

describe('EdiQueueService', () => {
  let service: EdiQueueService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      ediMessage: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EdiQueueService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(EdiQueueService);
  });

  it('lists queued messages', async () => {
    prisma.ediMessage.findMany.mockResolvedValue([{ id: 'm1' }]);

    const result = await service.list('t1');

    expect(result).toEqual([{ id: 'm1' }]);
  });

  it('retries message and increments count', async () => {
    prisma.ediMessage.findFirst.mockResolvedValue({ id: 'm1', retryCount: 2 });
    prisma.ediMessage.update.mockResolvedValue({ id: 'm1', retryCount: 3 });

    const result = await service.retry('t1', 'm1');

    expect(result.retryCount).toBe(3);
    expect(prisma.ediMessage.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: expect.objectContaining({ status: EdiMessageStatus.QUEUED, retryCount: 3 }),
    });
  });

  it('cancels message', async () => {
    prisma.ediMessage.findFirst.mockResolvedValue({ id: 'm1' });
    prisma.ediMessage.update.mockResolvedValue({ id: 'm1', status: EdiMessageStatus.REJECTED });

    const result = await service.cancel('t1', 'm1');

    expect(result.status).toBe(EdiMessageStatus.REJECTED);
  });

  it('processes queue when empty', async () => {
    prisma.ediMessage.findMany.mockResolvedValue([]);

    const result = await service.process('t1');

    expect(result).toEqual({ processed: 0 });
    expect(prisma.ediMessage.updateMany).not.toHaveBeenCalled();
  });

  it('processes queue and updates statuses', async () => {
    prisma.ediMessage.findMany.mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);

    const result = await service.process('t1');

    expect(result).toEqual({ processed: 2 });
    expect(prisma.ediMessage.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['m1', 'm2'] } },
      data: { status: EdiMessageStatus.SENT, processedAt: expect.any(Date) },
    });
  });

  it('returns stats by status', async () => {
    prisma.ediMessage.groupBy.mockResolvedValue([
      { status: 'SENT', _count: { _all: 2 } },
      { status: 'QUEUED', _count: { _all: 1 } },
    ]);

    const result = await service.stats('t1');

    expect(result).toEqual({ SENT: 2, QUEUED: 1 });
  });

  it('throws when message missing', async () => {
    prisma.ediMessage.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'm1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
