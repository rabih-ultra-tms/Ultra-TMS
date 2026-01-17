import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VolumeCommitmentsService } from './volume-commitments.service';
import { PrismaService } from '../../../prisma.service';

describe('VolumeCommitmentsService', () => {
  let service: VolumeCommitmentsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = { volumeCommitment: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() } };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [VolumeCommitmentsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(VolumeCommitmentsService);
  });

  it('lists commitments', async () => {
    prisma.volumeCommitment.findMany.mockResolvedValue([]);

    const result = await service.list('tenant-1', 'c1');

    expect(result).toEqual([]);
  });

  it('creates commitment with defaults', async () => {
    prisma.volumeCommitment.create.mockResolvedValue({ id: 'v1' });

    await service.create('tenant-1', 'c1', 'u1', {
      periodStart: '2025-01-01',
      periodEnd: '2025-02-01',
    } as any);

    expect(prisma.volumeCommitment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 'tenant-1',
        contractId: 'c1',
        minimumLoads: null,
        minimumRevenue: null,
        minimumWeight: null,
        shortfallFee: null,
        shortfallPercent: null,
        status: 'ACTIVE',
        createdById: 'u1',
      }),
    });
  });

  it('throws when commitment missing', async () => {
    prisma.volumeCommitment.findFirst.mockResolvedValue(null);

    await expect(service.detail('v1', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('returns commitment details', async () => {
    prisma.volumeCommitment.findFirst.mockResolvedValue({ id: 'v1' });

    const result = await service.detail('v1', 'tenant-1');

    expect(result).toEqual({ id: 'v1' });
  });

  it('updates commitment after detail', async () => {
    prisma.volumeCommitment.findFirst.mockResolvedValue({ id: 'v1' });
    prisma.volumeCommitment.update.mockResolvedValue({ id: 'v1', status: 'INACTIVE' });

    const result = await service.update('v1', 'tenant-1', { status: 'INACTIVE' } as any);

    expect(prisma.volumeCommitment.update).toHaveBeenCalledWith({ where: { id: 'v1' }, data: { status: 'INACTIVE' } });
    expect(result.status).toBe('INACTIVE');
  });

  it('soft deletes commitment', async () => {
    prisma.volumeCommitment.findFirst.mockResolvedValue({ id: 'v1' });
    prisma.volumeCommitment.update.mockResolvedValue({ id: 'v1' });

    const result = await service.delete('v1', 'tenant-1');

    expect(prisma.volumeCommitment.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { deletedAt: expect.any(Date), status: 'INACTIVE' },
    });
    expect(result).toEqual({ success: true });
  });

  it('emits shortfall event', async () => {
    prisma.volumeCommitment.findFirst.mockResolvedValue({ id: 'v1', contractId: 'c1', minimumLoads: 10, actualLoads: 5, status: 'ACTIVE' });

    await service.performance('v1', 'tenant-1');

    expect(events.emit).toHaveBeenCalledWith('volume.shortfall', expect.any(Object));
  });

  it('does not emit when no shortfall', async () => {
    prisma.volumeCommitment.findFirst.mockResolvedValue({
      id: 'v1',
      contractId: 'c1',
      minimumLoads: null,
      minimumRevenue: 1000,
      actualRevenue: 1500,
      minimumWeight: 200,
      actualWeight: 250,
      status: 'ACTIVE',
    });

    const result = await service.performance('v1', 'tenant-1');

    expect(events.emit).not.toHaveBeenCalled();
    expect(result.loadsGap).toBeNull();
    expect(result.revenueGap).toBeLessThanOrEqual(0);
    expect(result.weightGap).toBeLessThanOrEqual(0);
  });
});
