import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { PrismaService } from '../../prisma.service';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let prisma: {
    dashboard: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    dashboardWidget: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      dashboardWidget: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(DashboardsService);
  });

  it('lists dashboards by tenant and not deleted', async () => {
    prisma.dashboard.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('throws when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);

    await expect(service.get('tenant-1', 'dash-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates dashboard with defaults', async () => {
    prisma.dashboard.create.mockResolvedValue({ id: 'dash-1' });

    await service.create('tenant-1', 'user-1', {
      name: 'Main',
      description: 'Desc',
    } as any);

    expect(prisma.dashboard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          isPublic: false,
          ownerId: 'user-1',
          status: 'ACTIVE',
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('updates dashboard and sets updatedById', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
    prisma.dashboard.update.mockResolvedValue({ id: 'dash-1' });

    await service.update('tenant-1', 'user-1', 'dash-1', {
      name: 'Updated',
      isPublic: true,
    } as any);

    expect(prisma.dashboard.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'dash-1' },
        data: expect.objectContaining({ name: 'Updated', isPublic: true, updatedById: 'user-1' }),
      }),
    );
  });

  it('soft deletes dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
    prisma.dashboard.update.mockResolvedValue({ id: 'dash-1' });

    const result = await service.remove('tenant-1', 'dash-1');

    expect(result).toEqual({ success: true });
    expect(prisma.dashboard.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'dash-1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date), status: 'INACTIVE' }),
      }),
    );
  });

  it('adds widget with default position from dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({
      id: 'dash-1',
      dashboardWidgets: [{ id: 'w1' }, { id: 'w2' }],
    });
    prisma.dashboardWidget.create.mockResolvedValue({ id: 'w3' });

    await service.addWidget('tenant-1', 'dash-1', {
      widgetType: 'KPI',
      title: 'Widget',
    } as any);

    expect(prisma.dashboardWidget.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          dashboardId: 'dash-1',
          position: 2,
          width: 12,
          height: 4,
        }),
      }),
    );
  });

  it('throws when widget not found for update', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', dashboardWidgets: [] });
    prisma.dashboardWidget.findFirst.mockResolvedValue(null);

    await expect(
      service.updateWidget('tenant-1', 'dash-1', 'w1', { title: 'X' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('updates widget when found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', dashboardWidgets: [] });
    prisma.dashboardWidget.findFirst.mockResolvedValue({ id: 'w1' });
    prisma.dashboardWidget.update.mockResolvedValue({ id: 'w1' });

    await service.updateWidget('tenant-1', 'dash-1', 'w1', {
      title: 'Updated',
      position: 1,
    } as any);

    expect(prisma.dashboardWidget.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'w1' },
        data: expect.objectContaining({ title: 'Updated', position: 1 }),
      }),
    );
  });

  it('removes widget when found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', dashboardWidgets: [] });
    prisma.dashboardWidget.findFirst.mockResolvedValue({ id: 'w1' });
    prisma.dashboardWidget.delete.mockResolvedValue({ id: 'w1' });

    const result = await service.removeWidget('tenant-1', 'dash-1', 'w1');

    expect(result).toEqual({ success: true });
    expect(prisma.dashboardWidget.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
  });
});