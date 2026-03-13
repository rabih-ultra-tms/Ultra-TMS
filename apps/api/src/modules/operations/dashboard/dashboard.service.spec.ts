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
