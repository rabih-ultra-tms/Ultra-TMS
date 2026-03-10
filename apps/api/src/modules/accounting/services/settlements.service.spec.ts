// @ts-nocheck
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

  // ── QS-015: Financial Calculation Tests ──────────────────────────────

  describe('Financial Calculations', () => {
    it('generates settlement with carrier rate minus fuel advance deduction', async () => {
      // Realistic: carrier rate $3,200, fuel advance $500 → net $2,700
      const load = {
        id: 'load-1',
        loadNumber: 'LD2026030042',
        orderId: 'order-1',
        carrierId: 'carrier-1',
        carrierRate: 3200,
        fuelAdvance: 500,
        carrier: {
          legalName: 'Swift Logistics LLC',
          paymentTerms: 'NET30',
          factoringCompany: null,
        },
      };
      prisma.load.findFirst.mockResolvedValue(load);

      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue({ id: 'set-1' } as any);

      await service.generateFromLoad('tenant-1', 'user-1', 'load-1');

      const createArg = createSpy.mock.calls[0]![2]!;
      expect(createArg.grossAmount).toBe(3200);
      expect(createArg.deductionsTotal).toBe(500);
      expect(createArg.netAmount).toBe(2700); // 3200 - 500
      expect(createArg.balanceDue).toBe(2700);
      // Verify freight line item + deduction line item
      expect(createArg.lineItems).toHaveLength(2);
      expect(createArg.lineItems[0].amount).toBe(3200);
      expect(createArg.lineItems[1].amount).toBe(-500);
      expect(createArg.lineItems[1].itemType).toBe('DEDUCTION');
    });

    it('creates settlement with quick-pay fee correctly deducted', async () => {
      // Quick pay scenario: $5,000 gross, 3% quick-pay fee ($150), net = $4,850
      prisma.settlement.findFirst.mockResolvedValue(null);
      prisma.settlement.create.mockImplementation(({ data }) => Promise.resolve(data));

      const grossAmount = 5000;
      const quickPayFeePercent = 3;
      const quickPayFee = grossAmount * (quickPayFeePercent / 100); // $150
      const netAmount = grossAmount - quickPayFee;

      await service.create('tenant-1', 'user-1', {
        carrierId: 'carrier-1',
        settlementDate: '2026-03-01',
        dueDate: '2026-03-03', // Quick pay = fast turnaround
        grossAmount,
        quickPayFeePercent,
        quickPayFeeAmount: quickPayFee,
        quickPayFee,
        deductionsTotal: 0,
        netAmount,
        balanceDue: netAmount,
        paymentType: 'QUICK_PAY',
        payToName: 'Express Freight Inc.',
      } as any);

      const createCall = prisma.settlement.create.mock.calls[0]![0]!;
      expect(createCall.data.grossAmount).toBe(5000);
      expect(createCall.data.quickPayFee).toBe(150);
      expect(createCall.data.netAmount).toBe(4850);
      // Verify: net = gross - quickPayFee - deductions
      expect(createCall.data.netAmount).toBe(
        createCall.data.grossAmount - createCall.data.quickPayFee - createCall.data.deductionsTotal,
      );
    });

    it('computes payables summary totals with decimal precision', async () => {
      const now = new Date();
      prisma.settlement.findMany.mockResolvedValue([
        { id: 's1', dueDate: new Date(now.getTime() - 86400000), balanceDue: 1575.33, carrier: {} }, // overdue
        { id: 's2', dueDate: new Date(now.getTime() - 86400000), balanceDue: 2424.67, carrier: {} }, // overdue
        { id: 's3', dueDate: new Date(now.getTime() + 3 * 86400000), balanceDue: 8999.99, carrier: {} }, // upcoming
        { id: 's4', dueDate: new Date(now.getTime() + 7 * 86400000), balanceDue: 0.01, carrier: {} }, // upcoming (1 cent)
      ]);

      const result = await service.getPayablesSummary('tenant-1');

      // 1575.33 + 2424.67 = 4000.00 exactly
      expect(result.totals.overdue).toBe(4000);
      // 8999.99 + 0.01 = 9000.00 exactly
      expect(result.totals.upcoming).toBe(9000);
      expect(result.totals.dueToday).toBe(0);
      expect(result.totals.total).toBe(13000);
    });
  });
});
