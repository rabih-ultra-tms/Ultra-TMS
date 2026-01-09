import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateDashboardDto,
  UpdateDashboardDto,
  CreateWidgetDto,
  UpdateWidgetDto,
  UpdateLayoutDto,
  ShareDashboardDto,
  CloneDashboardDto,
} from './dto';

@Injectable()
export class DashboardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, userId?: string, ownerType?: string) {
    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    };

    // Filter by owner or public
    if (userId) {
      where.OR = [
        { isPublic: true },
        { ownerType: 'SYSTEM' },
        { ownerId: userId },
      ];
    }
    if (ownerType) {
      where.ownerType = ownerType;
    }

    return this.prisma.dashboard.findMany({
      where,
      include: {
        widgets: {
          orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
        },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        widgets: {
          orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
        },
      },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async findBySlug(tenantId: string, slug: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { tenantId, slug, deletedAt: null },
      include: {
        widgets: {
          orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
        },
      },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async create(tenantId: string, userId: string, dto: CreateDashboardDto) {
    // Check for duplicate slug
    const existing = await this.prisma.dashboard.findFirst({
      where: { tenantId, slug: dto.slug, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Dashboard slug already exists');
    }

    return this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        slug: dto.slug,
        ownerType: dto.ownerType,
        ownerId: dto.ownerId ?? userId,
        layout: dto.layout
          ? JSON.parse(JSON.stringify(dto.layout))
          : [],
        theme: dto.theme ?? 'LIGHT',
        refreshInterval: dto.refreshInterval ?? 300,
        isPublic: dto.isPublic ?? false,
        isDefault: dto.isDefault ?? false,
        customFields: dto.customFields
          ? JSON.parse(JSON.stringify(dto.customFields))
          : {},
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        widgets: true,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateDashboardDto) {
    await this.findOne(tenantId, id);

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.layout && {
          layout: JSON.parse(JSON.stringify(dto.layout)),
        }),
        ...(dto.theme && { theme: dto.theme }),
        ...(dto.refreshInterval !== undefined && { refreshInterval: dto.refreshInterval }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.customFields && {
          customFields: JSON.parse(JSON.stringify(dto.customFields)),
        }),
        updatedBy: userId,
      },
      include: {
        widgets: true,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.dashboard.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async clone(tenantId: string, userId: string, id: string, dto: CloneDashboardDto) {
    const source = await this.findOne(tenantId, id);

    // Check for duplicate slug
    const existing = await this.prisma.dashboard.findFirst({
      where: { tenantId, slug: dto.slug, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Dashboard slug already exists');
    }

    // Create the new dashboard
    const newDashboard = await this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        description: source.description,
        slug: dto.slug,
        ownerType: 'USER',
        ownerId: userId,
        layout: source.layout ? JSON.parse(JSON.stringify(source.layout)) : [],
        theme: source.theme,
        refreshInterval: source.refreshInterval,
        isPublic: false,
        isDefault: false,
        customFields: source.customFields ? JSON.parse(JSON.stringify(source.customFields)) : {},
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Clone all widgets
    if (source.widgets.length > 0) {
      await this.prisma.dashboardWidget.createMany({
        data: source.widgets.map((widget: { widgetType: string; title: string | null; positionX: number; positionY: number; width: number; height: number; dataConfig: unknown; displayConfig: unknown }) => ({
          dashboardId: newDashboard.id,
          widgetType: widget.widgetType,
          title: widget.title,
          positionX: widget.positionX,
          positionY: widget.positionY,
          width: widget.width,
          height: widget.height,
          dataConfig: widget.dataConfig ? JSON.parse(JSON.stringify(widget.dataConfig)) : {},
          displayConfig: widget.displayConfig ? JSON.parse(JSON.stringify(widget.displayConfig)) : {},
        })),
      });
    }

    return this.findOne(tenantId, newDashboard.id);
  }

  async share(tenantId: string, userId: string, id: string, _dto: ShareDashboardDto) {
    await this.findOne(tenantId, id);

    // For now, just make the dashboard public
    // In a real implementation, you'd have a separate shares table
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        isPublic: true,
        updatedBy: userId,
      },
    });
  }

  async getData(tenantId: string, id: string) {
    const dashboard = await this.findOne(tenantId, id);
    
    // Fetch data for each widget
    const widgetData: Record<string, unknown> = {};
    
    for (const widget of dashboard.widgets) {
      const config = widget.dataConfig as Record<string, unknown>;
      
      // Fetch data based on widget type and config
      // This is a simplified implementation
      if (config.kpiId) {
        const snapshot = await this.prisma.kpiSnapshot.findFirst({
          where: {
            tenantId,
            kpiDefinitionId: config.kpiId as string,
          },
          orderBy: { periodStart: 'desc' },
        });
        widgetData[widget.id] = snapshot;
      } else {
        // Return mock data for other widget types
        widgetData[widget.id] = { value: Math.random() * 100 };
      }
    }

    return {
      dashboard,
      data: widgetData,
      fetchedAt: new Date(),
    };
  }

  // Widget operations
  async addWidget(tenantId: string, dashboardId: string, dto: CreateWidgetDto) {
    await this.findOne(tenantId, dashboardId);

    return this.prisma.dashboardWidget.create({
      data: {
        dashboardId,
        widgetType: dto.widgetType,
        title: dto.title,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 4,
        height: dto.height ?? 2,
        dataConfig: JSON.parse(JSON.stringify(dto.dataConfig)),
        displayConfig: dto.displayConfig
          ? JSON.parse(JSON.stringify(dto.displayConfig))
          : {},
      },
    });
  }

  async updateWidget(tenantId: string, dashboardId: string, widgetId: string, dto: UpdateWidgetDto) {
    await this.findOne(tenantId, dashboardId);

    const widget = await this.prisma.dashboardWidget.findFirst({
      where: { id: widgetId, dashboardId },
    });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return this.prisma.dashboardWidget.update({
      where: { id: widgetId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.positionX !== undefined && { positionX: dto.positionX }),
        ...(dto.positionY !== undefined && { positionY: dto.positionY }),
        ...(dto.width !== undefined && { width: dto.width }),
        ...(dto.height !== undefined && { height: dto.height }),
        ...(dto.dataConfig && {
          dataConfig: JSON.parse(JSON.stringify(dto.dataConfig)),
        }),
        ...(dto.displayConfig && {
          displayConfig: JSON.parse(JSON.stringify(dto.displayConfig)),
        }),
      },
    });
  }

  async removeWidget(tenantId: string, dashboardId: string, widgetId: string) {
    await this.findOne(tenantId, dashboardId);

    const widget = await this.prisma.dashboardWidget.findFirst({
      where: { id: widgetId, dashboardId },
    });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    await this.prisma.dashboardWidget.delete({ where: { id: widgetId } });
    return { success: true };
  }

  async updateLayout(tenantId: string, userId: string, dashboardId: string, dto: UpdateLayoutDto) {
    await this.findOne(tenantId, dashboardId);

    // Update each widget's position
    for (const item of dto.layout) {
      await this.prisma.dashboardWidget.update({
        where: { id: item.widgetId },
        data: {
          positionX: item.positionX,
          positionY: item.positionY,
          width: item.width,
          height: item.height,
        },
      });
    }

    // Update dashboard layout array
    await this.prisma.dashboard.update({
      where: { id: dashboardId },
      data: {
        layout: JSON.parse(JSON.stringify(dto.layout)),
        updatedBy: userId,
      },
    });

    return this.findOne(tenantId, dashboardId);
  }
}
