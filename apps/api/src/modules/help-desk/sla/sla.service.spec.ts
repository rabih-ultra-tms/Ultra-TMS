import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SlaService } from './sla.service';
import { PrismaService } from '../../../prisma.service';

describe('SlaService', () => {
  let service: SlaService;
  let prisma: {
    slaPolicy: { findMany: jest.Mock; create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      slaPolicy: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SlaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SlaService);
  });

  it('lists policies', async () => {
    prisma.slaPolicy.findMany.mockResolvedValue([]);

    await service.listPolicies('tenant-1');

    expect(prisma.slaPolicy.findMany).toHaveBeenCalled();
  });

  it('creates policy', async () => {
    prisma.slaPolicy.create.mockResolvedValue({ id: 'p1' });

    await service.createPolicy('tenant-1', 'user-1', { name: 'Default' } as any);

    expect(prisma.slaPolicy.create).toHaveBeenCalled();
  });

  it('throws when policy missing', async () => {
    prisma.slaPolicy.findFirst.mockResolvedValue(null);

    await expect(service.findPolicy('tenant-1', 'p1')).rejects.toThrow(NotFoundException);
  });

  it('updates policy', async () => {
    prisma.slaPolicy.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.slaPolicy.update.mockResolvedValue({ id: 'p1' });

    await service.updatePolicy('tenant-1', 'user-1', 'p1', { name: 'Updated' } as any);

    expect(prisma.slaPolicy.update).toHaveBeenCalled();
  });

  it('deletes policy', async () => {
    prisma.slaPolicy.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.slaPolicy.update.mockResolvedValue({ id: 'p1' });

    const result = await service.deletePolicy('tenant-1', 'p1');

    expect(result).toEqual({ deleted: true });
  });

  it('applies matching policy', async () => {
    prisma.slaPolicy.findMany.mockResolvedValue([
      { priority: 1, createdAt: new Date(), firstResponseTarget: 60, resolutionTarget: 120, conditions: { priority: ['HIGH'] } },
    ]);

    const result = await service.applyPolicy('tenant-1', {
      priority: 'HIGH',
      customFields: {},
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    } as any);

    expect(result?.firstResponseDue).toBeInstanceOf(Date);
  });
});