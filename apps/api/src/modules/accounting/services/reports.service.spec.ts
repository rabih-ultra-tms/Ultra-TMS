import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../../prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    invoice: { findMany: jest.Mock };
    paymentMade: { aggregate: jest.Mock };
    paymentReceived: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      invoice: { findMany: jest.fn() },
      paymentMade: { aggregate: jest.fn() },
      paymentReceived: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ReportsService);
  });

  describe('getDashboard', () => {
    it('calculates totalAR as sum of (totalAmount - amountPaid) across invoices', async () => {
      prisma.invoice.findMany
        // First call: all invoices
        .mockResolvedValueOnce([
          {
            totalAmount: 1000,
            amountPaid: 300,
            status: 'SENT',
            invoiceDate: new Date(),
            dueDate: new Date(),
          },
          {
            totalAmount: 2000,
            amountPaid: 500,
            status: 'PARTIAL',
            invoiceDate: new Date(),
            dueDate: new Date(),
          },
        ])
        // Second call: overdue invoices
        .mockResolvedValueOnce([]);

      prisma.paymentMade.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
      prisma.paymentReceived.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('tenant-1');

      // totalAR = (1000 - 300) + (2000 - 500) = 700 + 1500 = 2200
      expect(result.data.totalAR).toBe(2200);
    });

    it('calculates totalAP as sum of pending/sent PaymentMade amounts', async () => {
      prisma.invoice.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      prisma.paymentMade.aggregate.mockResolvedValue({
        _sum: { amount: 5500 },
      });
      prisma.paymentReceived.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('tenant-1');

      expect(result.data.totalAP).toBe(5500);
    });

    it('calculates overdueInvoiceCount from OVERDUE invoices', async () => {
      prisma.invoice.findMany
        .mockResolvedValueOnce([
          {
            totalAmount: 1000,
            amountPaid: 0,
            status: 'SENT',
            invoiceDate: new Date(),
            dueDate: new Date(),
          },
        ])
        .mockResolvedValueOnce([
          { totalAmount: 500, amountPaid: 0 },
          { totalAmount: 300, amountPaid: 0 },
          { totalAmount: 200, amountPaid: 0 },
        ]);

      prisma.paymentMade.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      prisma.paymentReceived.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('tenant-1');

      expect(result.data.overdueInvoiceCount).toBe(3);
    });

    it('calculates DSO = Math.round((totalAR / totalRevenue) * 90)', async () => {
      // totalAmount sum = 10000 (revenue), totalAR = 10000 - 7000 = 3000
      // DSO = round((3000 / 10000) * 90) = round(27) = 27
      prisma.invoice.findMany
        .mockResolvedValueOnce([
          {
            totalAmount: 5000,
            amountPaid: 3000,
            status: 'PARTIAL',
            invoiceDate: new Date(),
            dueDate: new Date(),
          },
          {
            totalAmount: 5000,
            amountPaid: 4000,
            status: 'PARTIAL',
            invoiceDate: new Date(),
            dueDate: new Date(),
          },
        ])
        .mockResolvedValueOnce([]);

      prisma.paymentMade.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      prisma.paymentReceived.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('tenant-1');

      // totalAR = (5000-3000) + (5000-4000) = 2000 + 1000 = 3000
      // totalRevenue = 5000 + 5000 = 10000
      // DSO = round((3000 / 10000) * 90) = round(27) = 27
      expect(result.data.dso).toBe(27);
    });

    it('calculates revenueMTD from invoices dated in current month', async () => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

      prisma.invoice.findMany
        .mockResolvedValueOnce([
          {
            totalAmount: 3000,
            amountPaid: 0,
            status: 'SENT',
            invoiceDate: thisMonth,
            dueDate: thisMonth,
          },
          {
            totalAmount: 7000,
            amountPaid: 0,
            status: 'SENT',
            invoiceDate: lastMonth,
            dueDate: lastMonth,
          },
        ])
        .mockResolvedValueOnce([]);

      prisma.paymentMade.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      prisma.paymentReceived.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('tenant-1');

      // Only the invoice from this month counts toward revenueMTD
      expect(result.data.revenueMTD).toBe(3000);
    });

    it('calculates cashCollectedMTD from PaymentReceived amounts this month', async () => {
      prisma.invoice.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      prisma.paymentMade.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      prisma.paymentReceived.findMany.mockResolvedValue([
        { amount: 1200 },
        { amount: 800 },
        { amount: 500 },
      ]);

      const result = await service.getDashboard('tenant-1');

      expect(result.data.cashCollectedMTD).toBe(2500);
    });

    it('returns all zeros when database is empty', async () => {
      prisma.invoice.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      prisma.paymentMade.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      prisma.paymentReceived.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('tenant-1');

      expect(result.data).toEqual({
        totalAR: 0,
        totalAP: 0,
        overdueInvoiceCount: 0,
        dso: 0,
        revenueMTD: 0,
        cashCollectedMTD: 0,
      });
    });

    it('returns DSO of 0 when totalRevenue is zero (avoids NaN/Infinity)', async () => {
      // No invoices means totalRevenue = 0, so DSO formula would divide by zero
      prisma.invoice.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      prisma.paymentMade.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      prisma.paymentReceived.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('tenant-1');

      expect(result.data.dso).toBe(0);
      expect(Number.isFinite(result.data.dso)).toBe(true);
    });

    it('handles null amountPaid and totalAmount gracefully', async () => {
      prisma.invoice.findMany
        .mockResolvedValueOnce([
          {
            totalAmount: null,
            amountPaid: null,
            status: 'DRAFT',
            invoiceDate: new Date(),
            dueDate: new Date(),
          },
        ])
        .mockResolvedValueOnce([]);

      prisma.paymentMade.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      prisma.paymentReceived.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('tenant-1');

      // null values treated as 0
      expect(result.data.totalAR).toBe(0);
      expect(result.data.totalAP).toBe(0);
      expect(result.data.dso).toBe(0);
    });

    it('calculates all KPIs together in a realistic scenario', async () => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 10);

      prisma.invoice.findMany
        .mockResolvedValueOnce([
          // This month invoice, partially paid
          {
            totalAmount: 10000,
            amountPaid: 6000,
            status: 'PARTIAL',
            invoiceDate: thisMonth,
            dueDate: thisMonth,
          },
          // Older invoice, fully paid
          {
            totalAmount: 5000,
            amountPaid: 5000,
            status: 'PAID',
            invoiceDate: new Date(2025, 0, 15),
            dueDate: new Date(2025, 1, 15),
          },
          // This month invoice, unpaid
          {
            totalAmount: 3000,
            amountPaid: 0,
            status: 'SENT',
            invoiceDate: thisMonth,
            dueDate: thisMonth,
          },
        ])
        .mockResolvedValueOnce([
          // 2 overdue invoices
          { totalAmount: 1000, amountPaid: 0 },
          { totalAmount: 500, amountPaid: 200 },
        ]);

      prisma.paymentMade.aggregate.mockResolvedValue({
        _sum: { amount: 2200 },
      });
      prisma.paymentReceived.findMany.mockResolvedValue([
        { amount: 4000 },
        { amount: 2000 },
      ]);

      const result = await service.getDashboard('tenant-1');

      // totalAR = (10000-6000) + (5000-5000) + (3000-0) = 4000 + 0 + 3000 = 7000
      expect(result.data.totalAR).toBe(7000);

      // totalAP = 2200
      expect(result.data.totalAP).toBe(2200);

      // overdueInvoiceCount = 2
      expect(result.data.overdueInvoiceCount).toBe(2);

      // totalRevenue = 10000 + 5000 + 3000 = 18000
      // DSO = round((7000 / 18000) * 90) = round(35) = 35
      expect(result.data.dso).toBe(35);

      // revenueMTD = 10000 + 3000 = 13000 (only thisMonth invoices)
      expect(result.data.revenueMTD).toBe(13000);

      // cashCollectedMTD = 4000 + 2000 = 6000
      expect(result.data.cashCollectedMTD).toBe(6000);
    });
  });
});
