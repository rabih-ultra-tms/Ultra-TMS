import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertsService, DataQueryService, SavedViewsService } from './alerts.service';
import { PrismaService } from '../../prisma.service';

describe('Analytics Alerts & Saved Views Services', () => {
  let alertsService: AlertsService;
  let savedViewsService: SavedViewsService;
  let dataQueryService: DataQueryService;
  let prisma: {
    kPIAlert: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    savedAnalyticsView: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    kPIDefinition: { findFirst: jest.Mock };
    kPISnapshot: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      kPIAlert: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      savedAnalyticsView: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      kPIDefinition: { findFirst: jest.fn() },
      kPISnapshot: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        SavedViewsService,
        DataQueryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    alertsService = module.get(AlertsService);
    savedViewsService = module.get(SavedViewsService);
    dataQueryService = module.get(DataQueryService);
  });

  it('lists alerts with optional active filter', async () => {
    prisma.kPIAlert.findMany.mockResolvedValue([]);

    await alertsService.list('tenant-1', true);

    expect(prisma.kPIAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', isActive: true },
        include: { kpiDefinition: true },
      }),
    );
  });

  it('throws when acknowledging missing alert', async () => {
    prisma.kPIAlert.findFirst.mockResolvedValue(null);

    await expect(
      alertsService.acknowledge('tenant-1', 'user-1', 'alert-1', {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('acknowledges alert with audit fields', async () => {
    prisma.kPIAlert.findFirst.mockResolvedValue({ id: 'alert-1' });
    prisma.kPIAlert.update.mockResolvedValue({ id: 'alert-1' });

    await alertsService.acknowledge('tenant-1', 'user-1', 'alert-1', {
      notes: 'ok',
    });

    expect(prisma.kPIAlert.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'alert-1' },
        data: expect.objectContaining({
          updatedById: 'user-1',
          customFields: { acknowledgedBy: 'user-1', notes: 'ok' },
        }),
      }),
    );
  });

  it('resolves alert and deactivates', async () => {
    prisma.kPIAlert.findFirst.mockResolvedValue({ id: 'alert-1' });
    prisma.kPIAlert.update.mockResolvedValue({ id: 'alert-1' });

    await alertsService.resolve('tenant-1', 'user-1', 'alert-1', {
      resolutionNotes: 'done',
    });

    expect(prisma.kPIAlert.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isActive: false,
          updatedById: 'user-1',
          customFields: { resolvedBy: 'user-1', resolutionNotes: 'done' },
        }),
      }),
    );
  });

  it('lists saved views with public and user filters', async () => {
    prisma.savedAnalyticsView.findMany.mockResolvedValue([]);

    await savedViewsService.list('tenant-1', 'user-1', 'loads');

    expect(prisma.savedAnalyticsView.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          OR: [{ userId: 'user-1' }, { isPublic: true }],
          entityType: 'loads',
        }),
      }),
    );
  });

  it('throws when saved view not found', async () => {
    prisma.savedAnalyticsView.findFirst.mockResolvedValue(null);

    await expect(savedViewsService.get('tenant-1', 'user-1', 'view-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates saved view', async () => {
    prisma.savedAnalyticsView.create.mockResolvedValue({ id: 'view-1' });

    await savedViewsService.create('tenant-1', 'user-1', {
      viewName: 'My View',
      entityType: 'loads',
      filters: {},
      columns: {},
      sortOrder: {},
    });

    expect(prisma.savedAnalyticsView.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          isPublic: false,
        }),
      }),
    );
  });

  it('updates saved view after ownership check', async () => {
    prisma.savedAnalyticsView.findFirst.mockResolvedValue({ id: 'view-1' });
    prisma.savedAnalyticsView.update.mockResolvedValue({ id: 'view-1' });

    await savedViewsService.update('tenant-1', 'user-1', 'view-1', {
      viewName: 'Updated',
      entityType: 'loads',
      isPublic: true,
    });

    expect(prisma.savedAnalyticsView.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'view-1' },
        data: expect.objectContaining({ viewName: 'Updated', isPublic: true }),
      }),
    );
  });

  it('removes saved view after ownership check', async () => {
    prisma.savedAnalyticsView.findFirst.mockResolvedValue({ id: 'view-1' });
    prisma.savedAnalyticsView.delete.mockResolvedValue({ id: 'view-1' });

    const result = await savedViewsService.remove('tenant-1', 'user-1', 'view-1');

    expect(result).toEqual({ success: true });
    expect(prisma.savedAnalyticsView.delete).toHaveBeenCalledWith({ where: { id: 'view-1' } });
  });

  it('returns dimensions and measures lists', async () => {
    const dims = await dataQueryService.dimensions();
    const measures = await dataQueryService.measures();

    expect(dims.dimensions.length).toBeGreaterThan(0);
    expect(measures.measures.length).toBeGreaterThan(0);
  });

  it('queries data with dimensions and measures', async () => {
    const result = await dataQueryService.query('tenant-1', {
      dimensions: ['customer', 'month'],
      measures: ['revenue'],
      dataSource: 'LOADS',
    } as any);

    expect(result.data.length).toBe(5);
    expect(result.source).toBe('LOADS');
  });

  it('exports data with format', async () => {
    const result = await dataQueryService.export('tenant-1', { format: 'XLSX' } as any);

    expect(result.format).toBe('xlsx');
    expect(result.downloadUrl).toContain('.xlsx');
  });

  it('throws when trend KPI not found', async () => {
    prisma.kPIDefinition.findFirst.mockResolvedValue(null);

    await expect(
      dataQueryService.trends('tenant-1', 'KPI1', {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns trend data from snapshots', async () => {
    prisma.kPIDefinition.findFirst.mockResolvedValue({ id: 'k1', code: 'K1', name: 'KPI' });
    prisma.kPISnapshot.findMany.mockResolvedValue([
      { snapshotDate: new Date('2025-01-01'), value: 12.5 },
    ]);

    const result = await dataQueryService.trends('tenant-1', 'K1', {
      startDate: '2025-01-01',
      endDate: '2025-01-05',
    } as any);

    expect(result.kpi.code).toBe('K1');
    expect(result.data.length).toBe(1);
  });

  it('compares periods with changePct', async () => {
    const result = await dataQueryService.compare('tenant-1', {
      currentStart: '2025-01-01',
      currentEnd: '2025-01-05',
      previousStart: '2024-12-01',
      previousEnd: '2024-12-05',
    } as any);

    expect(result).toHaveProperty('change');
    expect(result).toHaveProperty('changePct');
  });
});