import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommissionPayoutsService } from './commission-payouts.service';
import { PrismaService } from '../../../prisma.service';

describe('CommissionPayoutsService', () => {
  let service: CommissionPayoutsService;
  let prisma: {
    commissionEntry: { findMany: jest.Mock; updateMany: jest.Mock };
    commissionPayout: {
      count: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      commissionEntry: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      commissionPayout: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionPayoutsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CommissionPayoutsService);
  });

  it('throws when no approved entries for payout', async () => {
    prisma.commissionEntry.findMany.mockResolvedValue([]);

    await expect(
      service.create('tenant-1', {
        userId: 'user-1',
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString(),
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('calculates draw recovery and links entries', async () => {
    prisma.commissionEntry.findMany.mockResolvedValue([
      { id: 'entry-1', entryType: 'NORMAL', commissionAmount: 100 },
      { id: 'entry-2', entryType: 'DRAW_RECOVERY', commissionAmount: -40 },
    ]);
    prisma.commissionPayout.count.mockResolvedValue(1);
    prisma.commissionPayout.create.mockResolvedValue({ id: 'pay-2', netPayout: 60 });

    await service.create('tenant-1', {
      userId: 'user-1',
      periodStart: new Date('2026-02-01').toISOString(),
      periodEnd: new Date('2026-02-28').toISOString(),
    } as any, 'user-2');

    expect(prisma.commissionPayout.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ grossCommission: 100, drawRecovery: 40, netPayout: 60 }),
      }),
    );
    expect(prisma.commissionEntry.updateMany).toHaveBeenCalled();
  });

  it('throws when payout not found', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'pay-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns payout when found', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue({ id: 'pay-1' });

    const result = await service.findOne('tenant-1', 'pay-1');

    expect(result.id).toBe('pay-1');
  });

  it('finds payouts with filters', async () => {
    prisma.commissionPayout.findMany.mockResolvedValue([{ id: 'pay-1' }]);
    prisma.commissionPayout.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', {
      page: 1,
      limit: 20,
      userId: 'user-1',
      status: 'APPROVED',
    });

    expect(result.data[0]?.id).toBe('pay-1');
    expect(prisma.commissionPayout.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'user-1', status: 'APPROVED' }) }),
    );
  });

  it('rejects approval when payout missing', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue(null);

    await expect(service.approve('tenant-1', 'pay-1', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects approval when status not pending', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue({ id: 'pay-1', status: 'PAID' });

    await expect(
      service.approve('tenant-1', 'pay-1', {} as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates payout when entries exist', async () => {
    prisma.commissionEntry.findMany.mockResolvedValue([
      { id: 'entry-1', commissionAmount: 100 },
    ]);
    prisma.commissionPayout.count.mockResolvedValue(0);
    prisma.commissionPayout.create.mockResolvedValue({ id: 'pay-1', totalAmount: 100 });

    const result = await service.create('tenant-1', {
      userId: 'user-1',
      periodStart: new Date('2026-01-01').toISOString(),
      periodEnd: new Date('2026-01-31').toISOString(),
    } as any, 'user-2');

    expect(result.id).toBe('pay-1');
  });

  it('approves pending payout', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue({ id: 'pay-1', status: 'PENDING' });
    prisma.commissionPayout.update.mockResolvedValue({ id: 'pay-1', status: 'APPROVED' });

    const result = await service.approve('tenant-1', 'pay-1', {} as any, 'user-1');

    expect(result.status).toBe('APPROVED');
  });

  it('processes approved payout and marks entries paid', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue({ id: 'pay-1', status: 'APPROVED', entries: [] });
    prisma.commissionPayout.update.mockResolvedValue({ id: 'pay-1', status: 'PAID' });
    prisma.commissionEntry.updateMany.mockResolvedValue({ count: 2 });

    const result = await service.process('tenant-1', 'pay-1', { paymentMethod: 'ACH' } as any, 'user-1');

    expect(result.status).toBe('PAID');
    expect(prisma.commissionEntry.updateMany).toHaveBeenCalled();
  });

  it('rejects processing when not approved', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue({ id: 'pay-1', status: 'PENDING', entries: [] });

    await expect(
      service.process('tenant-1', 'pay-1', { paymentMethod: 'ACH' } as any, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('voids payout when not paid', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue({ id: 'pay-1', status: 'PENDING' });
    prisma.commissionPayout.update.mockResolvedValue({ id: 'pay-1', status: 'VOID' });

    const result = await service.void('tenant-1', 'pay-1', 'user-1');

    expect(result.status).toBe('VOID');
    expect(prisma.commissionEntry.updateMany).toHaveBeenCalled();
  });

  it('rejects void when payout missing', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue(null);

    await expect(service.void('tenant-1', 'pay-1')).rejects.toThrow(NotFoundException);
  });

  it('rejects void when payout already paid', async () => {
    prisma.commissionPayout.findFirst.mockResolvedValue({ id: 'pay-1', status: 'PAID' });

    await expect(service.void('tenant-1', 'pay-1')).rejects.toThrow(BadRequestException);
  });
});
