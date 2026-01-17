import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubrogationService } from './subrogation.service';
import { PrismaService } from '../../../prisma.service';

describe('SubrogationService', () => {
  let service: SubrogationService;
  let prisma: {
    claim: { count: jest.Mock };
    subrogationRecord: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    claimTimeline: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      claim: { count: jest.fn() },
      subrogationRecord: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      claimTimeline: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SubrogationService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SubrogationService);
  });

  it('lists subrogation records', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.subrogationRecord.findMany.mockResolvedValue([]);

    await service.list('tenant-1', 'claim-1');

    expect(prisma.subrogationRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', claimId: 'claim-1', deletedAt: null } }),
    );
  });

  it('throws when claim missing', async () => {
    prisma.claim.count.mockResolvedValue(0);

    await expect(service.list('tenant-1', 'claim-1')).rejects.toThrow(NotFoundException);
  });

  it('creates subrogation record with default status', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.subrogationRecord.create.mockResolvedValue({ id: 's1', status: 'PENDING', amountSought: 100 });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.create('tenant-1', 'user-1', 'claim-1', {
      targetParty: 'Carrier',
      targetPartyType: 'CARRIER',
      amountSought: 100,
    } as any);

    expect(prisma.subrogationRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PENDING', createdById: 'user-1' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('creates subrogation record with dates', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.subrogationRecord.create.mockResolvedValue({ id: 's1', status: 'PENDING', amountSought: 100 });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.create('tenant-1', 'user-1', 'claim-1', {
      targetParty: 'Carrier',
      targetPartyType: 'CARRIER',
      amountSought: 100,
      filingDate: '2025-01-01',
      settlementDate: '2025-02-01',
      closedDate: '2025-03-01',
    } as any);

    expect(prisma.subrogationRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          filingDate: new Date('2025-01-01'),
          settlementDate: new Date('2025-02-01'),
          closedDate: new Date('2025-03-01'),
        }),
      }),
    );
  });

  it('throws when subrogation record missing', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.subrogationRecord.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'claim-1', 's1')).rejects.toThrow(NotFoundException);
  });

  it('updates subrogation record and clears dates', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.subrogationRecord.findFirst.mockResolvedValue({ id: 's1' });
    prisma.subrogationRecord.update.mockResolvedValue({ id: 's1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.update('tenant-1', 'user-1', 'claim-1', 's1', {
      settlementDate: null,
      closedDate: null,
      closureReason: 'Withdrawn',
    } as any);

    expect(prisma.subrogationRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ settlementDate: null, closedDate: null, closureReason: 'Withdrawn' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('throws when recovering closed record', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.subrogationRecord.findFirst.mockResolvedValue({ id: 's1', status: 'CLOSED' });

    await expect(
      service.recover('tenant-1', 'user-1', 'claim-1', 's1', { amount: 10 } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('recovers and marks as recovered when fully paid', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.subrogationRecord.findFirst.mockResolvedValue({
      id: 's1',
      status: 'PENDING',
      amountSought: 100,
      amountRecovered: 90,
      settlementAmount: null,
      settlementDate: null,
    });
    prisma.subrogationRecord.update.mockResolvedValue({ id: 's1', status: 'RECOVERED' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.recover('tenant-1', 'user-1', 'claim-1', 's1', {
      amount: 10,
    } as any);

    expect(result.status).toBe('RECOVERED');
    expect(prisma.subrogationRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amountRecovered: 100, status: 'RECOVERED', updatedById: 'user-1' }),
      }),
    );
  });

  it('recovers partially without changing status', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.subrogationRecord.findFirst.mockResolvedValue({
      id: 's1',
      status: 'PENDING',
      amountSought: 100,
      amountRecovered: 20,
      settlementAmount: 5,
      settlementDate: new Date('2025-01-01'),
    });
    prisma.subrogationRecord.update.mockResolvedValue({ id: 's1', status: 'PENDING' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.recover('tenant-1', 'user-1', 'claim-1', 's1', {
      amount: 10,
    } as any);

    expect(result.status).toBe('PENDING');
    expect(prisma.subrogationRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amountRecovered: 30, status: 'PENDING' }),
      }),
    );
  });

  it('removes subrogation record with soft delete', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.subrogationRecord.findFirst.mockResolvedValue({ id: 's1' });
    prisma.subrogationRecord.update.mockResolvedValue({ id: 's1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.remove('tenant-1', 'user-1', 'claim-1', 's1');

    expect(result).toEqual({ success: true });
    expect(prisma.subrogationRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });
});