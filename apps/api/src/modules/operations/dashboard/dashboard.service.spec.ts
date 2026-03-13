import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../../prisma.service';

/**
 * MP-03-005: Unit Tests for DashboardService
 */

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      load: {
        count: jest.fn(),
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
      },
      quote: {
        findMany: jest.fn(),
      },
      statusHistory: {
        findMany: jest.fn(),
      },
      stop: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getKPIs', () => {
    it('returns KPI data structure', async () => {
      prisma.load.count.mockResolvedValue(5);
      prisma.load.findMany.mockResolvedValue([]);

      const result = await service.getKPIs(
        't1',
        'week',
        'all',
        'previous-week'
      );

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('activeLoads');
      expect(result.data).toHaveProperty('revenueMTD');
      expect(result.data).toHaveProperty('sparklines');
    });

    it('applies personal scope filter when userId provided', async () => {
      prisma.load.count.mockResolvedValue(2);
      prisma.load.findMany.mockResolvedValue([]);

      await service.getKPIs('t1', 'day', 'personal', 'previous-day', 'user1');

      const countCalls = prisma.load.count.mock.calls;
      expect(countCalls[0][0].where).toHaveProperty('createdById', 'user1');
    });

    it('filters deleted loads (deletedAt: null)', async () => {
      prisma.load.count.mockResolvedValue(1);
      prisma.load.findMany.mockResolvedValue([]);

      await service.getKPIs('t1', 'week', 'all', 'previous-week');

      const countCalls = prisma.load.count.mock.calls;
      countCalls.forEach((call: any[]) => {
        expect(call[0].where.deletedAt).toBe(null);
      });
    });

    it('filters by tenantId', async () => {
      prisma.load.count.mockResolvedValue(1);
      prisma.load.findMany.mockResolvedValue([]);

      await service.getKPIs('tenant-1', 'week', 'all', 'previous-week');

      const countCalls = prisma.load.count.mock.calls;
      countCalls.forEach((call: any[]) => {
        expect(call[0].where.tenantId).toBe('tenant-1');
      });
    });

    it('batches all KPI queries into Promise.all (no sequential calls)', async () => {
      prisma.load.count.mockResolvedValue(5);
      prisma.load.findMany.mockResolvedValue([]);

      await service.getKPIs('t1', 'week', 'all', 'previous-week');

      // Verify load.count called 6 times (3 current period + 3 comparison period counts)
      expect(prisma.load.count).toHaveBeenCalledTimes(6);
      // Verify load.findMany called 3 times (1 current period + 1 comparison period + 1 on-time)
      expect(prisma.load.findMany).toHaveBeenCalledTimes(3);
    });

    it('includes on-time calculation in batch queries (no +1 extra query)', async () => {
      prisma.load.count.mockResolvedValue(5);
      prisma.load.findMany.mockResolvedValue([
        {
          deliveredAt: new Date('2026-03-01'),
          order: { requiredDeliveryDate: new Date('2026-03-05') },
        },
      ]);

      const result = await service.getKPIs(
        't1',
        'week',
        'all',
        'previous-week'
      );

      // Should have on-time percentage calculated
      expect(result.data.onTimePercentage).toBeDefined();
      // Total Prisma calls: 6 counts + 3 findManys = 9 calls, all batched in Promise.all
      expect(prisma.load.count).toHaveBeenCalledTimes(6);
      expect(prisma.load.findMany).toHaveBeenCalledTimes(3);
    });

    it('calculates correct on-time percentage from batched query', async () => {
      prisma.load.count.mockResolvedValue(0);
      prisma.load.findMany.mockResolvedValueOnce([]); // periodLoads
      prisma.load.findMany.mockResolvedValueOnce([]); // compPeriodLoads
      prisma.load.findMany.mockResolvedValueOnce([
        // deliveredLoads - on-time
        {
          deliveredAt: new Date('2026-03-01'),
          order: { requiredDeliveryDate: new Date('2026-03-05') },
        },
        // deliveredLoads - late
        {
          deliveredAt: new Date('2026-03-10'),
          order: { requiredDeliveryDate: new Date('2026-03-05') },
        },
      ]);

      const result = await service.getKPIs(
        't1',
        'week',
        'all',
        'previous-week'
      );

      // 1 out of 2 loads on-time = 50%
      expect(result.data.onTimePercentage).toBe(50);
    });
  });

  describe('getCharts', () => {
    it('returns chart data structure with loadsByStatus', async () => {
      prisma.load.groupBy.mockResolvedValue([
        { status: 'DELIVERED', _count: { id: 10 } },
      ]);
      prisma.order.findMany.mockResolvedValue([]);

      const result = await service.getCharts('t1', 'week');

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('loadsByStatus');
      expect(Array.isArray(result.data.loadsByStatus)).toBe(true);
    });

    it('filters deleted loads in groupBy query', async () => {
      prisma.load.groupBy.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([]);

      await service.getCharts('t1', 'week');

      const groupByCalls = prisma.load.groupBy.mock.calls;
      expect(groupByCalls[0][0].where.deletedAt).toBe(null);
    });

    it('batches groupBy and findMany into single parallel queries (no N+1)', async () => {
      prisma.load.groupBy.mockResolvedValue([
        { status: 'PENDING', _count: { id: 3 } },
        { status: 'DELIVERED', _count: { id: 10 } },
      ]);
      prisma.order.findMany.mockResolvedValue([
        {
          orderDate: new Date('2026-03-01'),
          totalCharges: 5000,
        },
      ]);

      await service.getCharts('t1', 'week');

      // Each call happens exactly once - no looping per status/order
      expect(prisma.load.groupBy).toHaveBeenCalledTimes(1);
      expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
    });

    it('applies tenantId filter in both groupBy and findMany', async () => {
      prisma.load.groupBy.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([]);

      await service.getCharts('tenant-abc', 'week');

      // Check groupBy call
      expect(prisma.load.groupBy.mock.calls[0][0].where.tenantId).toBe(
        'tenant-abc'
      );
      // Check findMany call
      expect(prisma.order.findMany.mock.calls[0][0].where.tenantId).toBe(
        'tenant-abc'
      );
    });

    it('correctly groups revenue by date in application layer', async () => {
      prisma.load.groupBy.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([
        { orderDate: new Date('2026-03-01'), totalCharges: 1000 },
        { orderDate: new Date('2026-03-01'), totalCharges: 2000 },
        { orderDate: new Date('2026-03-02'), totalCharges: 3000 },
      ]);

      const result = await service.getCharts('t1', 'week');

      const revenueTrend = result.data.revenueTrend;
      expect(revenueTrend).toHaveLength(2);
      expect(revenueTrend[0]).toEqual({
        date: '2026-03-01',
        revenue: 3000,
      });
      expect(revenueTrend[1]).toEqual({
        date: '2026-03-02',
        revenue: 3000,
      });
    });
  });

  describe('getAlerts', () => {
    it('returns data wrapper with alerts array', async () => {
      prisma.load.findMany.mockResolvedValue([]);

      const result = await service.getAlerts('t1');

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('filters by tenantId and deletedAt', async () => {
      prisma.load.findMany.mockResolvedValue([]);

      await service.getAlerts('t1');

      const findManyCalls = prisma.load.findMany.mock.calls;
      findManyCalls.forEach((call: any[]) => {
        expect(call[0].where.tenantId).toBe('t1');
        expect(call[0].where.deletedAt).toBe(null);
      });
    });
  });

  describe('getActivity', () => {
    it('returns data wrapper with activity array', async () => {
      prisma.statusHistory.findMany.mockResolvedValue([]);

      const result = await service.getActivity('t1', 'week');

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('filters by tenantId and deletedAt', async () => {
      prisma.statusHistory.findMany.mockResolvedValue([]);

      await service.getActivity('t1', 'week');

      const statusHistoryCalls = prisma.statusHistory.findMany.mock.calls;
      expect(statusHistoryCalls[0][0].where.tenantId).toBe('t1');
      expect(statusHistoryCalls[0][0].where.deletedAt).toBe(null);
    });
  });

  describe('getNeedsAttention', () => {
    it('returns data wrapper with items array', async () => {
      prisma.load.findMany.mockResolvedValue([]);

      const result = await service.getNeedsAttention('t1');

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('filters by tenantId and deletedAt for loads', async () => {
      prisma.load.findMany.mockResolvedValue([]);

      await service.getNeedsAttention('tenant-1');

      const findManyCalls = prisma.load.findMany.mock.calls;
      expect(findManyCalls[0][0].where.tenantId).toBe('tenant-1');
      expect(findManyCalls[0][0].where.deletedAt).toBe(null);
    });
  });
});
