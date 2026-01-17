import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesPerformanceService } from './sales-performance.service';
import { PrismaService } from '../../prisma.service';

describe('SalesPerformanceService', () => {
  let service: SalesPerformanceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      salesQuota: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      quote: {
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesPerformanceService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SalesPerformanceService);
  });

  it('lists quotas with pagination', async () => {
    prisma.salesQuota.findMany.mockResolvedValue([{ id: 'q1' }]);
    prisma.salesQuota.count.mockResolvedValue(1);

    const result = await service.findAllQuotas('t1', { page: 2, limit: 5 });

    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(prisma.salesQuota.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 5 }));
  });

  it('returns quota with progress', async () => {
    prisma.salesQuota.findFirst.mockResolvedValue({
      id: 'q1',
      revenueTarget: 1000,
      revenueActual: 500,
      loadsTarget: 10,
      loadsActual: 5,
      newCustomersTarget: 4,
      newCustomersActual: 2,
    });

    const result = await service.findOneQuota('t1', 'q1');

    expect(result.progress.overall).toBe(50);
  });

  it('throws when quota missing', async () => {
    prisma.salesQuota.findFirst.mockResolvedValue(null);

    await expect(service.findOneQuota('t1', 'q1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('prevents duplicate quota', async () => {
    prisma.salesQuota.findFirst.mockResolvedValue({ id: 'q1' });

    await expect(
      service.createQuota('t1', 'u1', { userId: 'u2', periodStart: '2024-01-01', periodEnd: '2024-01-31' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates quota', async () => {
    prisma.salesQuota.findFirst.mockResolvedValue(null);
    prisma.salesQuota.create.mockResolvedValue({ id: 'q1' });

    const result = await service.createQuota('t1', 'u1', {
      userId: 'u2',
      periodType: 'MONTHLY',
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
    } as any);

    expect(result.id).toBe('q1');
  });

  it('calculates performance metrics', async () => {
    prisma.quote.findMany.mockResolvedValue([
      { status: 'SENT', totalAmount: 100, createdAt: new Date('2024-01-01') },
      { status: 'CONVERTED', totalAmount: 200, createdAt: new Date('2024-01-01'), convertedAt: new Date('2024-01-03') },
    ]);

    const result = await service.getPerformance('t1', {} as any);

    expect(result.metrics.totalQuotes).toBe(2);
    expect(result.metrics.totalRevenue).toBe(200);
  });

  it('builds leaderboard sorted by revenue', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 'u1', firstName: 'A', lastName: 'A', email: 'a@a.com' },
      { id: 'u2', firstName: 'B', lastName: 'B', email: 'b@b.com' },
    ]);
    prisma.quote.findMany
      .mockResolvedValueOnce([{ status: 'CONVERTED', totalAmount: 100 }])
      .mockResolvedValueOnce([{ status: 'CONVERTED', totalAmount: 300 }]);

    const result = await service.getLeaderboard('t1', {} as any);

    expect(result.leaderboard[0]?.user?.id).toBe('u2');
  });

  it('computes conversion metrics', async () => {
    prisma.quote.findMany.mockResolvedValue([
      { status: 'SENT', createdAt: new Date('2024-01-01'), sentAt: new Date('2024-01-02') },
      { status: 'CONVERTED', createdAt: new Date('2024-01-01'), sentAt: new Date('2024-01-02'), convertedAt: new Date('2024-01-05') },
    ]);

    const result = await service.getConversionMetrics('t1', {} as any);

    expect(result.metrics.convertedQuotes).toBe(1);
    expect(result.byStatus.CONVERTED).toBe(1);
  });

  it('computes win/loss analysis', async () => {
    prisma.quote.findMany.mockResolvedValue([
      { status: 'CONVERTED', totalAmount: 100 },
      { status: 'REJECTED', totalAmount: 50, rejectionReason: 'Price' },
      { status: 'ACCEPTED', totalAmount: 80 },
    ]);

    const result = await service.getWinLossAnalysis('t1', {} as any);

    expect(result.summary.wins).toBe(2);
    expect(result.rejectionReasons.Price).toBe(1);
  });
});
