import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { PrismaService } from '../../../prisma.service';

describe('SettlementsService', () => {
  let service: SettlementsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      settlement: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      load: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SettlementsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SettlementsService);
  });

  it('creates settlement with initial number', async () => {
    prisma.settlement.findFirst.mockResolvedValue(null);
    prisma.settlement.create.mockResolvedValue({ id: 's1' });

    await service.create('tenant-1', 'user-1', {
      carrierId: 'c1',
      settlementDate: '2025-01-01',
      dueDate: '2025-01-05',
      grossAmount: 100,
      netAmount: 100,
      balanceDue: 100,
    } as any);

    expect(prisma.settlement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ settlementNumber: 'SET-000001' }) }),
    );
  });

  it('throws when settlement missing on findOne', async () => {
    prisma.settlement.findFirst.mockResolvedValue(null);

    await expect(service.findOne('s1', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('prevents update for paid settlement', async () => {
    prisma.settlement.findFirst.mockResolvedValue({ id: 's1', status: 'PAID' });

    await expect(service.update('s1', 'tenant-1', 'user-1', {})).rejects.toThrow(BadRequestException);
  });

  it('prevents approval when not pending', async () => {
    prisma.settlement.findFirst.mockResolvedValue({ id: 's1', status: 'DRAFT' });

    await expect(service.approve('s1', 'tenant-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('prevents voiding when payments applied', async () => {
    prisma.settlement.findFirst.mockResolvedValue({ id: 's1', amountPaid: 10 });

    await expect(service.voidSettlement('s1', 'tenant-1')).rejects.toThrow(BadRequestException);
  });

  it('summarizes payables by due bucket', async () => {
    const now = new Date();
    prisma.settlement.findMany.mockResolvedValue([
      { id: 'a', dueDate: new Date(now.getTime() - 86400000), balanceDue: 100, carrier: {} },
      { id: 'b', dueDate: new Date(now.getTime() + 1000), balanceDue: 50, carrier: {} },
      { id: 'c', dueDate: new Date(now.getTime() + 86400000 + 1000), balanceDue: 25, carrier: {} },
    ]);

    const result = await service.getPayablesSummary('tenant-1');

    expect(result.totals.total).toBe(175);
    expect(result.overdue).toHaveLength(1);
    expect(result.dueToday).toHaveLength(1);
    expect(result.upcoming).toHaveLength(1);
  });

  it('generates settlement from load and throws when missing', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.generateFromLoad('tenant-1', 'user-1', 'load-1')).rejects.toThrow(NotFoundException);
  });
});
