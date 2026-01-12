import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { AcknowledgeAlertDto, ComparePeriodDto, ExportDataDto, QueryDataDto, ResolveAlertDto, SavedViewDto, TrendQueryDto } from './dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, isActive?: boolean) {
    return this.prisma.kPIAlert.findMany({
      where: { tenantId, ...(isActive !== undefined ? { isActive } : {}) },
      include: { kpiDefinition: true },
      orderBy: [{ alertName: 'asc' }],
      take: 100,
    });
  }

  private async ensure(tenantId: string, id: string) {
    const alert = await this.prisma.kPIAlert.findFirst({ where: { id, tenantId } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    return alert;
  }

  async acknowledge(tenantId: string, userId: string, id: string, dto: AcknowledgeAlertDto) {
    await this.ensure(tenantId, id);
    return this.prisma.kPIAlert.update({
      where: { id },
      data: {
        lastTriggeredAt: new Date(),
        customFields: { acknowledgedBy: userId, notes: dto.notes ?? null },
        updatedById: userId,
      },
    });
  }

  async resolve(tenantId: string, userId: string, id: string, dto: ResolveAlertDto) {
    await this.ensure(tenantId, id);
    return this.prisma.kPIAlert.update({
      where: { id },
      data: {
        isActive: false,
        lastTriggeredAt: new Date(),
        customFields: { resolvedBy: userId, resolutionNotes: dto.resolutionNotes ?? null },
        updatedById: userId,
      },
    });
  }
}

@Injectable()
export class SavedViewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, userId: string, entityType?: string) {
    return this.prisma.savedAnalyticsView.findMany({
      where: {
        tenantId,
        OR: [{ userId }, { isPublic: true }],
        ...(entityType ? { entityType } : {}),
      },
      orderBy: [{ isPublic: 'desc' }, { viewName: 'asc' }],
    });
  }

  private async ensureOwnership(tenantId: string, userId: string, id: string) {
    const view = await this.prisma.savedAnalyticsView.findFirst({
      where: { id, tenantId, userId },
    });
    if (!view) {
      throw new NotFoundException('Saved view not found');
    }
    return view;
  }

  async get(tenantId: string, userId: string, id: string) {
    const view = await this.prisma.savedAnalyticsView.findFirst({
      where: { id, tenantId, OR: [{ userId }, { isPublic: true }] },
    });
    if (!view) {
      throw new NotFoundException('Saved view not found');
    }
    return view;
  }

  async create(tenantId: string, userId: string, dto: SavedViewDto) {
    return this.prisma.savedAnalyticsView.create({
      data: {
        tenantId,
        userId,
        viewName: dto.viewName,
        entityType: dto.entityType,
        filters: (dto.filters ?? []) as Prisma.InputJsonValue,
        columns: (dto.columns ?? []) as Prisma.InputJsonValue,
        sortOrder: (dto.sortOrder ?? []) as Prisma.InputJsonValue,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: SavedViewDto) {
    await this.ensureOwnership(tenantId, userId, id);
    return this.prisma.savedAnalyticsView.update({
      where: { id },
      data: {
        ...(dto.viewName !== undefined ? { viewName: dto.viewName } : {}),
        ...(dto.entityType !== undefined ? { entityType: dto.entityType } : {}),
        ...(dto.filters !== undefined ? { filters: dto.filters as Prisma.InputJsonValue } : {}),
        ...(dto.columns !== undefined ? { columns: dto.columns as Prisma.InputJsonValue } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder as Prisma.InputJsonValue } : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
      },
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    await this.ensureOwnership(tenantId, userId, id);
    await this.prisma.savedAnalyticsView.delete({ where: { id } });
    return { success: true };
  }
}

@Injectable()
export class DataQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async dimensions() {
    return {
      dimensions: [
        { code: 'customer', label: 'Customer' },
        { code: 'carrier', label: 'Carrier' },
        { code: 'mode', label: 'Mode' },
        { code: 'equipment', label: 'Equipment' },
        { code: 'origin_state', label: 'Origin State' },
        { code: 'dest_state', label: 'Destination State' },
        { code: 'month', label: 'Month' },
        { code: 'year', label: 'Year' },
      ],
    };
  }

  async measures() {
    return {
      measures: [
        { code: 'load_count', label: 'Load Count', aggregation: 'COUNT' },
        { code: 'revenue', label: 'Revenue', aggregation: 'SUM', format: 'currency' },
        { code: 'margin_percent', label: 'Margin %', aggregation: 'AVG', format: 'percentage' },
        { code: 'on_time_percent', label: 'On-Time %', aggregation: 'AVG', format: 'percentage' },
        { code: 'claims', label: 'Claims', aggregation: 'COUNT' },
      ],
    };
  }

  async query(_tenantId: string, dto: QueryDataDto) {
    const rows = Array.from({ length: 5 }, (_, idx) => ({
      id: idx + 1,
      ...(dto.dimensions ?? []).reduce<Record<string, unknown>>((acc, dim, i) => {
        acc[dim] = `${dim}_${i + 1}`;
        return acc;
      }, {}),
      ...(dto.measures ?? []).reduce<Record<string, unknown>>((acc, measure) => {
        acc[measure] = Math.round(Math.random() * 10000) / 100;
        return acc;
      }, {}),
    }));

    return {
      data: rows,
      total: rows.length,
      executedAt: new Date(),
      source: dto.dataSource,
    };
  }

  async export(_tenantId: string, dto: ExportDataDto) {
    const format = dto.format?.toLowerCase() ?? 'csv';
    return {
      downloadUrl: `/exports/analytics_${Date.now()}.${format}`,
      format,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }

  async trends(tenantId: string, kpiCode: string, dto: TrendQueryDto) {
    const kpi = await this.prisma.kPIDefinition.findFirst({ where: { tenantId, code: kpiCode, deletedAt: null } });
    if (!kpi) {
      throw new NotFoundException('KPI not found');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    const snapshots = await this.prisma.kPISnapshot.findMany({
      where: {
        tenantId,
        kpiDefinitionId: kpi.id,
        snapshotDate: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      orderBy: { snapshotDate: 'asc' },
    });

    const data = snapshots.length
      ? snapshots.map((s) => ({ date: s.snapshotDate, value: Number(s.value) }))
      : Array.from({ length: 5 }, (_, idx) => {
          const date = new Date(startDate.getTime() + idx * ((endDate.getTime() - startDate.getTime()) / 4));
          return { date, value: Math.round(Math.random() * 10000) / 100 };
        });

    return {
      kpi: { id: kpi.id, code: kpi.code, name: kpi.name },
      data,
      startDate,
      endDate,
    };
  }

  async compare(_tenantId: string, dto: ComparePeriodDto) {
    const current = Math.round(Math.random() * 10000) / 100;
    const previous = Math.round(Math.random() * 10000) / 100;
    const change = current - previous;
    const changePct = previous !== 0 ? (change / previous) * 100 : null;

    return {
      current: { start: dto.currentStart, end: dto.currentEnd, value: current },
      previous: { start: dto.previousStart, end: dto.previousEnd, value: previous },
      change,
      changePct,
    };
  }
}
