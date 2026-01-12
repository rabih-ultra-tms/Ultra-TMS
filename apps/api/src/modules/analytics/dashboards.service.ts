import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CreateDashboardDto, CreateWidgetDto, UpdateDashboardDto, UpdateWidgetDto } from './dto';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId, deletedAt: null },
      include: { dashboardWidgets: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] } },
      orderBy: [{ isPublic: 'desc' }, { name: 'asc' }],
    });
  }

  async get(tenantId: string, id: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { dashboardWidgets: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async create(tenantId: string, userId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        layout: (dto.layout ?? {}) as Prisma.InputJsonValue,
        isPublic: dto.isPublic ?? false,
        ownerId: dto.ownerId ?? userId,
        status: 'ACTIVE',
        createdById: userId,
        updatedById: userId,
      },
      include: { dashboardWidgets: true },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateDashboardDto) {
    await this.get(tenantId, id);

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.layout !== undefined ? { layout: dto.layout as Prisma.InputJsonValue } : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
        updatedById: userId,
      },
      include: { dashboardWidgets: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.get(tenantId, id);
    await this.prisma.dashboard.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
    return { success: true };
  }

  async addWidget(tenantId: string, dashboardId: string, dto: CreateWidgetDto) {
    const dashboard = await this.get(tenantId, dashboardId);

    const position = dto.position ?? dashboard.dashboardWidgets.length;

    return this.prisma.dashboardWidget.create({
      data: {
        tenantId,
        dashboardId,
        widgetType: dto.widgetType,
        title: dto.title,
        position,
        width: dto.width ?? 12,
        height: dto.height ?? 4,
        configuration: (dto.configuration ?? {}) as Prisma.InputJsonValue,
        refreshInterval: dto.refreshInterval,
        kpiDefinitionId: dto.kpiDefinitionId,
      },
    });
  }

  async updateWidget(tenantId: string, dashboardId: string, widgetId: string, dto: UpdateWidgetDto) {
    await this.get(tenantId, dashboardId);
    const widget = await this.prisma.dashboardWidget.findFirst({ where: { id: widgetId, dashboardId, tenantId } });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return this.prisma.dashboardWidget.update({
      where: { id: widgetId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
        ...(dto.width !== undefined ? { width: dto.width } : {}),
        ...(dto.height !== undefined ? { height: dto.height } : {}),
        ...(dto.configuration !== undefined ? { configuration: dto.configuration as Prisma.InputJsonValue } : {}),
        ...(dto.refreshInterval !== undefined ? { refreshInterval: dto.refreshInterval } : {}),
        ...(dto.kpiDefinitionId !== undefined ? { kpiDefinitionId: dto.kpiDefinitionId ?? null } : {}),
      },
    });
  }

  async removeWidget(tenantId: string, dashboardId: string, widgetId: string) {
    await this.get(tenantId, dashboardId);
    const widget = await this.prisma.dashboardWidget.findFirst({ where: { id: widgetId, dashboardId, tenantId } });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }
    await this.prisma.dashboardWidget.delete({ where: { id: widgetId } });
    return { success: true };
  }
}
