import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RateContractsService } from './rate-contracts.service';
import { PrismaService } from '../../prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('RateContractsService', () => {
  let service: RateContractsService;
  let prisma: {
    rateContract: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    contractLaneRate?: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      createMany: jest.Mock;
    };
  };
  const eventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    prisma = {
      rateContract: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      contractLaneRate: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateContractsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get(RateContractsService);
  });

  it('findAll filters by deletedAt', async () => {
    prisma.rateContract.findMany.mockResolvedValue([]);
    prisma.rateContract.count.mockResolvedValue(0);

    await service.findAll('tenant-1');

    expect(prisma.rateContract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', deletedAt: null },
      }),
    );
  });

  it('throws when contract not found', async () => {
    prisma.rateContract.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'rc-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws on duplicate contract number', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1' });

    await expect(
      service.create('tenant-1', 'user-1', {
        contractNumber: 'RC-1',
        companyId: 'cmp-1',
        effectiveDate: new Date().toISOString(),
        expirationDate: new Date().toISOString(),
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('soft deletes contract', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1' });
    prisma.rateContract.update.mockResolvedValue({ id: 'rc-1' });

    await service.delete('tenant-1', 'rc-1', 'user-1');

    expect(prisma.rateContract.update).toHaveBeenCalledWith({
      where: { id: 'rc-1' },
      data: { deletedAt: expect.any(Date), updatedById: 'user-1' },
    });
  });

  it('creates contract and emits event', async () => {
    prisma.rateContract.findFirst.mockResolvedValue(null);
    prisma.rateContract.create.mockResolvedValue({ id: 'rc-1', contractNumber: 'RC-1' });

    const result = await service.create('tenant-1', 'user-1', {
      contractNumber: 'RC-1',
      companyId: 'cmp-1',
      effectiveDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    expect(result.id).toBe('rc-1');
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'contract.created',
      expect.objectContaining({ tenantId: 'tenant-1', userId: 'user-1' }),
    );
  });

  it('activates contract when not active', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1', status: 'DRAFT' });
    prisma.rateContract.update.mockResolvedValue({ id: 'rc-1', status: 'ACTIVE' });

    const result = await service.activate('tenant-1', 'rc-1', 'user-1');

    expect(result.status).toBe('ACTIVE');
  });

  it('rejects activate when already active', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1', status: 'ACTIVE' });

    await expect(service.activate('tenant-1', 'rc-1', 'user-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('terminates contract', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1', status: 'ACTIVE' });
    prisma.rateContract.update.mockResolvedValue({ id: 'rc-1', status: 'TERMINATED' });

    const result = await service.terminate('tenant-1', 'rc-1', 'user-1');

    expect(result.status).toBe('TERMINATED');
  });

  it('finds best matching lane rate', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({
      id: 'rc-1',
      name: 'Contract',
      contractNumber: 'RC-1',
      laneRates: [
        { id: 'lane-1', originState: 'TX', destinationState: 'CA', originCity: 'Dallas', destinationCity: 'LA' },
      ],
    });

    const result = await service.findRateForLane(
      'tenant-1',
      'cmp-1',
      { state: 'TX', city: 'Dallas' },
      { state: 'CA', city: 'LA' },
    );

    expect(result?.contract.id).toBe('rc-1');
    expect(result?.laneRate.id).toBe('lane-1');
  });

  it('returns null when no lane rates found', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1', laneRates: [] });

    const result = await service.findRateForLane('tenant-1', 'cmp-1', { state: 'TX' }, { state: 'CA' });

    expect(result).toBeNull();
  });

  it('returns expiring contracts', async () => {
    prisma.rateContract.findMany.mockResolvedValue([{ id: 'rc-1' }]);

    const result = await service.getExpiringContracts('tenant-1', 30);

    expect(result).toEqual([{ id: 'rc-1' }]);
  });

  it('gets lane rates for contract', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1' });
    prisma.contractLaneRate?.findMany.mockResolvedValue([{ id: 'lane-1' }]);

    const result = await service.getLaneRates('tenant-1', 'rc-1');

    expect(result).toEqual([{ id: 'lane-1' }]);
  });

  it('adds lane rate', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1' });
    prisma.contractLaneRate?.create.mockResolvedValue({ id: 'lane-1' });

    const result = await service.addLaneRate('tenant-1', 'rc-1', 'user-1', { originState: 'TX' } as any);

    expect(result.id).toBe('lane-1');
  });

  it('updates lane rate', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1' });
    prisma.contractLaneRate?.findFirst.mockResolvedValue({ id: 'lane-1' });
    prisma.contractLaneRate?.update.mockResolvedValue({ id: 'lane-1', originState: 'CA' });

    const result = await service.updateLaneRate('tenant-1', 'rc-1', 'lane-1', 'user-1', { originState: 'CA' } as any);

    expect(result.originState).toBe('CA');
  });

  it('deletes lane rate', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ id: 'rc-1' });
    prisma.contractLaneRate?.findFirst.mockResolvedValue({ id: 'lane-1' });
    prisma.contractLaneRate?.delete.mockResolvedValue({ id: 'lane-1' });

    const result = await service.deleteLaneRate('tenant-1', 'rc-1', 'lane-1', 'user-1');

    expect(result.success).toBe(true);
  });

  it('renews contract and copies lanes', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({
      id: 'rc-1',
      contractNumber: 'RC-1',
      name: 'Contract',
      companyId: 'cmp-1',
      expirationDate: new Date('2026-01-01'),
      autoRenew: false,
    });
    prisma.rateContract.create.mockResolvedValue({ id: 'rc-2', contractNumber: 'RC-1-R' });
    prisma.contractLaneRate?.findMany.mockResolvedValue([{ id: 'lane-1' }]);
    prisma.contractLaneRate?.createMany.mockResolvedValue({ count: 1 });

    const result = await service.renewContract('tenant-1', 'rc-1', 'user-1');

    expect(result.id).toBe('rc-2');
    expect(prisma.contractLaneRate?.createMany).toHaveBeenCalled();
  });

  it('finds rate using contract lane rates', async () => {
    prisma.rateContract.findMany.mockResolvedValue([
      { id: 'rc-1', contractNumber: 'RC-1', name: 'Contract', laneRates: [{ id: 'lane-1', rateAmount: 100 }] },
    ]);

    const result = await service.findRate('tenant-1', 'TX', 'Dallas', 'CA', 'LA', 'cmp-1');

    expect(result?.laneRate.id).toBe('lane-1');
  });
});
