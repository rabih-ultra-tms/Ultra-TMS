import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LoadTendersService } from './load-tenders.service';
import { PrismaService } from '../../../prisma.service';
import { TenderType } from '../dto';

describe('LoadTendersService', () => {
  let service: LoadTendersService;
  let prisma: {
    load: { findFirst: jest.Mock };
    carrier: { findMany: jest.Mock };
    loadTender: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    tenderRecipient: { findMany: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      load: { findFirst: jest.fn() },
      carrier: { findMany: jest.fn() },
      loadTender: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      tenderRecipient: { findMany: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadTendersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(LoadTendersService);
  });

  it('throws when load not found', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', { loadId: 'load-1', recipients: [] } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when carrier inactive or missing', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.carrier.findMany.mockResolvedValue([]);

    await expect(
      service.create('tenant-1', {
        loadId: 'load-1',
        recipients: [{ carrierId: 'car-1', position: 1 }],
        tenderType: TenderType.BROADCAST,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates waterfall tender with first recipient offered', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.carrier.findMany.mockResolvedValue([{ id: 'car-1' }, { id: 'car-2' }]);
    prisma.loadTender.create.mockResolvedValue({ id: 'tender-1' });

    const dto = {
      loadId: 'load-1',
      tenderType: TenderType.WATERFALL,
      tenderRate: 1200,
      waterfallTimeoutMinutes: 45,
      recipients: [
        { carrierId: 'car-1', position: 1 },
        { carrierId: 'car-2', position: 2 },
      ],
    } as any;

    await service.create('tenant-1', dto, 'user-1');

    const createArg = prisma.loadTender.create.mock.calls[0][0];
    const recipients = createArg.data.recipients.create;

    expect(recipients[0].status).toBe('OFFERED');
    expect(recipients[1].status).toBe('PENDING');
    expect(createArg.data.createdById).toBe('user-1');
  });

  it('finds tenders excluding deleted', async () => {
    prisma.loadTender.findMany.mockResolvedValue([]);

    await service.findAll('tenant-1');

    expect(prisma.loadTender.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', deletedAt: null },
      }),
    );
  });

  it('throws when tender not found on update', async () => {
    prisma.loadTender.findFirst.mockResolvedValue(null);

    await expect(service.update('tenant-1', 'tender-1', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updates tender when found', async () => {
    prisma.loadTender.findFirst.mockResolvedValue({ id: 'tender-1' });
    prisma.loadTender.update.mockResolvedValue({ id: 'tender-1', status: 'CANCELLED' });

    const result = await service.update('tenant-1', 'tender-1', { status: 'CANCELLED' } as any);

    expect(result).toEqual({ id: 'tender-1', status: 'CANCELLED' });
  });

  it('throws when tender not found on findOne', async () => {
    prisma.loadTender.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'tender-1')).rejects.toThrow(NotFoundException);
  });

  it('responds with accept', async () => {
    prisma.loadTender.findFirst.mockResolvedValue({
      id: 'tender-1',
      status: 'ACTIVE',
      loadId: 'load-1',
      tenderRate: 100,
      recipients: [{ id: 'rec-1', carrierId: 'car-1', status: 'OFFERED', position: 1 }],
      load: { id: 'load-1' },
    });
    prisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        tenderRecipient: { update: jest.fn(), updateMany: jest.fn() },
        loadTender: { update: jest.fn() },
        load: { update: jest.fn() },
      }),
    );

    const result = await service.respond('tenant-1', { tenderId: 'tender-1', carrierId: 'car-1', response: 'ACCEPTED' } as any);

    expect(result.success).toBe(true);
  });

  it('rejects respond when tender inactive', async () => {
    prisma.loadTender.findFirst.mockResolvedValue({ id: 'tender-1', status: 'EXPIRED', recipients: [], load: {} });

    await expect(
      service.respond('tenant-1', { tenderId: 'tender-1', carrierId: 'car-1', response: 'ACCEPTED' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects respond when carrier not recipient', async () => {
    prisma.loadTender.findFirst.mockResolvedValue({
      id: 'tender-1',
      status: 'ACTIVE',
      recipients: [{ id: 'rec-1', carrierId: 'car-2', status: 'OFFERED', position: 1 }],
      load: {},
    });

    await expect(
      service.respond('tenant-1', { tenderId: 'tender-1', carrierId: 'car-1', response: 'DECLINED' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('declines tender and offers next carrier in waterfall', async () => {
    prisma.loadTender.findFirst.mockResolvedValue({
      id: 'tender-1',
      status: 'ACTIVE',
      tenderType: TenderType.WATERFALL,
      waterfallTimeoutMinutes: 30,
      recipients: [
        { id: 'rec-1', carrierId: 'car-1', status: 'OFFERED', position: 1 },
        { id: 'rec-2', carrierId: 'car-2', status: 'PENDING', position: 2 },
      ],
      load: { id: 'load-1' },
    });
    prisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        tenderRecipient: { update: jest.fn(), updateMany: jest.fn() },
        loadTender: { update: jest.fn() },
        load: { update: jest.fn() },
      }),
    );

    const result = await service.respond('tenant-1', { tenderId: 'tender-1', carrierId: 'car-1', response: 'DECLINED' } as any);

    expect(result.message).toContain('offered to next carrier');
  });

  it('declines tender with no next carrier', async () => {
    prisma.loadTender.findFirst.mockResolvedValue({
      id: 'tender-1',
      status: 'ACTIVE',
      tenderType: TenderType.WATERFALL,
      waterfallTimeoutMinutes: 30,
      recipients: [{ id: 'rec-1', carrierId: 'car-1', status: 'OFFERED', position: 1 }],
      load: { id: 'load-1' },
    });
    prisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        tenderRecipient: { update: jest.fn(), updateMany: jest.fn() },
        loadTender: { update: jest.fn() },
        load: { update: jest.fn() },
      }),
    );

    const result = await service.respond('tenant-1', { tenderId: 'tender-1', carrierId: 'car-1', response: 'DECLINED' } as any);

    expect(result.message).toContain('no more carriers');
  });

  it('cancels active tender', async () => {
    prisma.loadTender.findFirst.mockResolvedValue({ id: 'tender-1', status: 'ACTIVE' });
    prisma.loadTender.update.mockResolvedValue({ id: 'tender-1', status: 'CANCELLED' });

    const result = await service.cancel('tenant-1', 'tender-1');

    expect(result).toEqual({ id: 'tender-1', status: 'CANCELLED' });
  });

  it('rejects cancel when tender not active', async () => {
    prisma.loadTender.findFirst.mockResolvedValue({ id: 'tender-1', status: 'EXPIRED' });

    await expect(service.cancel('tenant-1', 'tender-1')).rejects.toThrow(BadRequestException);
  });

  it('returns active tenders for carrier', async () => {
    prisma.tenderRecipient.findMany.mockResolvedValue([
      { tender: { id: 't1', tenantId: 'tenant-1', status: 'ACTIVE' } },
      { tender: { id: 't2', tenantId: 'tenant-2', status: 'ACTIVE' } },
      { tender: { id: 't3', tenantId: 'tenant-1', status: 'EXPIRED' } },
    ]);

    const result = await service.getActiveForCarrier('tenant-1', 'car-1');

    expect(result).toEqual([{ id: 't1', tenantId: 'tenant-1', status: 'ACTIVE' }]);
  });

  it('processes waterfall timeouts', async () => {
    prisma.tenderRecipient.findMany.mockResolvedValue([
      { id: 'rec-1', tender: { tenantId: 'tenant-1', tenderType: 'WATERFALL', status: 'ACTIVE', recipients: [] } },
      { id: 'rec-2', tender: { tenantId: 'tenant-2', tenderType: 'WATERFALL', status: 'ACTIVE', recipients: [] } },
    ]);
    jest.spyOn(service as any, 'declineTender').mockResolvedValue({ success: true });

    const result = await service.processWaterfallTimeouts('tenant-1');

    expect(result).toEqual({ processedCount: 1 });
    expect((service as any).declineTender).toHaveBeenCalledTimes(1);
  });

  it('expires old tenders', async () => {
    prisma.loadTender.updateMany.mockResolvedValue({ count: 4 });

    const result = await service.expireOldTenders('tenant-1');

    expect(result.expiredCount).toBe(4);
  });
});
