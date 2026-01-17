import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../prisma.service';
import { ReportGroupBy } from './dto/reports.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    invoice: { findMany: jest.Mock };
    paymentMade: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      invoice: { findMany: jest.fn() },
      paymentMade: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ReportsService);
  });

  it('builds revenue report grouped by month', async () => {
    prisma.invoice.findMany.mockResolvedValue([
      {
        invoiceDate: new Date('2024-01-05T00:00:00.000Z'),
        totalAmount: 100,
        amountPaid: 40,
        company: { id: 'c1', name: 'Acme' },
      },
      {
        invoiceDate: new Date('2024-02-10T00:00:00.000Z'),
        totalAmount: 50,
        amountPaid: 20,
        company: { id: 'c1', name: 'Acme' },
      },
    ]);

    const result = await service.getRevenueReport('tenant-1', { groupBy: ReportGroupBy.MONTH } as any);

    expect(result.summary).toEqual(
      expect.objectContaining({ totalRevenue: 150, totalCollected: 60, totalOutstanding: 90, invoiceCount: 2 }),
    );
    expect(result.periods.map(p => p.period)).toEqual(['2024-01', '2024-02']);
    expect(result.byCompany[0]).toEqual(expect.objectContaining({ companyId: 'c1', amount: 150, count: 2 }));
  });

  it('builds aging report buckets', async () => {
    prisma.invoice.findMany.mockResolvedValue([
      {
        invoiceNumber: 'INV-1',
        companyId: 'c1',
        company: { id: 'c1', name: 'Acme' },
        totalAmount: 100,
        amountPaid: 0,
        dueDate: new Date('2024-01-25T00:00:00.000Z'),
      },
      {
        invoiceNumber: 'INV-2',
        companyId: 'c2',
        company: { id: 'c2', name: 'Beta' },
        totalAmount: 200,
        amountPaid: 50,
        dueDate: new Date('2023-12-15T00:00:00.000Z'),
      },
      {
        invoiceNumber: 'INV-3',
        companyId: 'c3',
        company: { id: 'c3', name: 'Gamma' },
        totalAmount: 300,
        amountPaid: 0,
        dueDate: new Date('2023-10-01T00:00:00.000Z'),
      },
      {
        invoiceNumber: 'INV-4',
        companyId: 'c4',
        company: { id: 'c4', name: 'Paid' },
        totalAmount: 50,
        amountPaid: 50,
        dueDate: new Date('2024-01-01T00:00:00.000Z'),
      },
    ]);

    const result = await service.getAgingReport('tenant-1', { asOfDate: '2024-02-01T00:00:00.000Z' } as any);

    expect(result.buckets.current.amount).toBe(100);
    expect(result.buckets['31-60'].amount).toBe(150);
    expect(result.buckets['120+'].amount).toBe(300);
    expect(result.totalOutstanding).toBe(550);
  });

  it('builds payables report buckets', async () => {
    prisma.paymentMade.findMany.mockResolvedValue([
      {
        carrierId: 'c1',
        carrier: { legalName: 'Carrier 1' },
        amount: 100,
        paymentDate: new Date('2024-01-25T00:00:00.000Z'),
      },
      {
        carrierId: 'c2',
        carrier: { legalName: 'Carrier 2' },
        amount: 200,
        paymentDate: new Date('2023-12-15T00:00:00.000Z'),
      },
      {
        carrierId: 'c3',
        carrier: { legalName: 'Carrier 3' },
        amount: 300,
        paymentDate: new Date('2023-11-15T00:00:00.000Z'),
      },
      {
        carrierId: 'c4',
        carrier: { legalName: 'Carrier 4' },
        amount: 400,
        paymentDate: new Date('2023-09-01T00:00:00.000Z'),
      },
    ]);

    const result = await service.getPayablesReport('tenant-1', { asOfDate: '2024-02-01T00:00:00.000Z' } as any);

    expect(result.buckets.current.amount).toBe(100);
    expect(result.buckets['31-60'].amount).toBe(200);
    expect(result.buckets['61-90'].amount).toBe(300);
    expect(result.buckets['91+'].amount).toBe(400);
    expect(result.totalPayables).toBe(1000);
  });
});
