import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  AcknowledgeAlertDto,
  ResolveAlertDto,
  CreateSavedViewDto,
  UpdateSavedViewDto,
  QueryDataDto,
  ExportDataDto,
  ComparePeriodDto,
  TrendQueryDto,
} from './dto';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, acknowledged?: boolean, alertType?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (acknowledged !== undefined) where.isAcknowledged = acknowledged;
    if (alertType) where.alertType = alertType;

    return this.prisma.kpiAlert.findMany({
      where,
      include: {
        kpiDefinition: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findActive(tenantId: string) {
    return this.prisma.kpiAlert.findMany({
      where: {
        tenantId,
        isAcknowledged: false,
      },
      include: {
        kpiDefinition: true,
      },
      orderBy: [
        { alertType: 'asc' }, // CRITICAL first
        { createdAt: 'desc' },
      ],
    });
  }

  async acknowledge(tenantId: string, userId: string, id: string, dto: AcknowledgeAlertDto) {
    const alert = await this.prisma.kpiAlert.findFirst({
      where: { id, tenantId },
    });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return this.prisma.kpiAlert.update({
      where: { id },
      data: {
        isAcknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
        resolutionNotes: dto.notes,
      },
    });
  }

  async resolve(tenantId: string, userId: string, id: string, dto: ResolveAlertDto) {
    const alert = await this.prisma.kpiAlert.findFirst({
      where: { id, tenantId },
    });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return this.prisma.kpiAlert.update({
      where: { id },
      data: {
        isAcknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
        resolutionNotes: dto.resolutionNotes,
      },
    });
  }
}

@Injectable()
export class SavedViewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, userId: string, viewType?: string) {
    const where: Record<string, unknown> = { tenantId, userId };
    if (viewType) where.viewType = viewType;

    return this.prisma.savedAnalyticsView.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(tenantId: string, userId: string, id: string) {
    const view = await this.prisma.savedAnalyticsView.findFirst({
      where: { id, tenantId, userId },
    });
    if (!view) {
      throw new NotFoundException('Saved view not found');
    }
    return view;
  }

  async create(tenantId: string, userId: string, dto: CreateSavedViewDto) {
    // If setting as default, clear other defaults of same type
    if (dto.isDefault) {
      await this.prisma.savedAnalyticsView.updateMany({
        where: { tenantId, userId, viewType: dto.viewType },
        data: { isDefault: false },
      });
    }

    return this.prisma.savedAnalyticsView.create({
      data: {
        tenantId,
        userId,
        name: dto.name,
        viewType: dto.viewType,
        filters: dto.filters
          ? JSON.parse(JSON.stringify(dto.filters))
          : {},
        columns: dto.columns
          ? JSON.parse(JSON.stringify(dto.columns))
          : [],
        sortConfig: dto.sortConfig
          ? JSON.parse(JSON.stringify(dto.sortConfig))
          : {},
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateSavedViewDto) {
    await this.findOne(tenantId, userId, id);

    // If setting as default, clear other defaults
    if (dto.isDefault) {
      const view = await this.findOne(tenantId, userId, id);
      await this.prisma.savedAnalyticsView.updateMany({
        where: { tenantId, userId, viewType: view.viewType, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.savedAnalyticsView.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.filters && {
          filters: JSON.parse(JSON.stringify(dto.filters)),
        }),
        ...(dto.columns && {
          columns: JSON.parse(JSON.stringify(dto.columns)),
        }),
        ...(dto.sortConfig && {
          sortConfig: JSON.parse(JSON.stringify(dto.sortConfig)),
        }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
  }

  async delete(tenantId: string, userId: string, id: string) {
    await this.findOne(tenantId, userId, id);
    await this.prisma.savedAnalyticsView.delete({ where: { id } });
    return { success: true };
  }
}

@Injectable()
export class DataQueryService {
  constructor(private prisma: PrismaService) {}

  async query(tenantId: string, dto: QueryDataDto) {
    // In a real implementation, this would be a flexible query builder
    // For now, return mock data based on data source
    const mockData = this.generateMockData(dto);
    return {
      data: mockData,
      total: mockData.length,
      query: dto,
      executedAt: new Date(),
    };
  }

  async getDimensions(tenantId: string) {
    return {
      dimensions: [
        { code: 'customer', label: 'Customer', table: 'companies' },
        { code: 'carrier', label: 'Carrier', table: 'carriers' },
        { code: 'sales_rep', label: 'Sales Rep', table: 'users' },
        { code: 'mode', label: 'Mode', values: ['TL', 'LTL', 'INTERMODAL', 'AIR', 'OCEAN'] },
        { code: 'equipment', label: 'Equipment', values: ['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK'] },
        { code: 'origin_state', label: 'Origin State', table: 'stops' },
        { code: 'dest_state', label: 'Destination State', table: 'stops' },
        { code: 'date', label: 'Date', type: 'date' },
        { code: 'week', label: 'Week', type: 'date' },
        { code: 'month', label: 'Month', type: 'date' },
        { code: 'quarter', label: 'Quarter', type: 'date' },
        { code: 'year', label: 'Year', type: 'date' },
      ],
    };
  }

  async getMeasures(tenantId: string) {
    return {
      measures: [
        { code: 'load_count', label: 'Load Count', aggregation: 'COUNT' },
        { code: 'revenue', label: 'Revenue', aggregation: 'SUM', format: 'currency' },
        { code: 'margin', label: 'Margin', aggregation: 'SUM', format: 'currency' },
        { code: 'margin_percent', label: 'Margin %', aggregation: 'AVG', format: 'percentage' },
        { code: 'carrier_cost', label: 'Carrier Cost', aggregation: 'SUM', format: 'currency' },
        { code: 'revenue_per_load', label: 'Revenue/Load', aggregation: 'AVG', format: 'currency' },
        { code: 'on_time_percent', label: 'On-Time %', aggregation: 'AVG', format: 'percentage' },
        { code: 'claim_ratio', label: 'Claim Ratio', aggregation: 'AVG', format: 'percentage' },
        { code: 'miles', label: 'Miles', aggregation: 'SUM', format: 'number' },
        { code: 'weight', label: 'Weight', aggregation: 'SUM', format: 'number' },
      ],
    };
  }

  async export(tenantId: string, dto: ExportDataDto) {
    // Generate export file (mock implementation)
    const data = this.generateMockData({
      dataSource: dto.dataSource,
      filters: dto.filters,
    } as QueryDataDto);

    return {
      format: dto.format,
      fileName: `export_${Date.now()}.${dto.format.toLowerCase()}`,
      rowCount: data.length,
      downloadUrl: `/exports/export_${Date.now()}.${dto.format.toLowerCase()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  async getTrends(tenantId: string, kpiCode: string, dto: TrendQueryDto) {
    // Get KPI snapshots for trend
    const kpi = await this.prisma.kpiDefinition.findFirst({
      where: { tenantId, code: kpiCode },
    });
    if (!kpi) {
      throw new NotFoundException('KPI not found');
    }

    const snapshots = await this.prisma.kpiSnapshot.findMany({
      where: {
        tenantId,
        kpiDefinitionId: kpi.id,
        periodType: dto.periodType,
        periodStart: {
          gte: new Date(dto.startDate),
          lte: new Date(dto.endDate),
        },
      },
      orderBy: { periodStart: 'asc' },
    });

    return {
      kpi: {
        code: kpi.code,
        name: kpi.name,
        unit: kpi.unit,
      },
      data: snapshots.map((s) => ({
        period: s.periodStart,
        value: s.currentValue,
        target: s.targetValue,
        status: s.status,
      })),
      summary: {
        min: snapshots.length > 0 ? Math.min(...snapshots.map((s) => Number(s.currentValue))) : null,
        max: snapshots.length > 0 ? Math.max(...snapshots.map((s) => Number(s.currentValue))) : null,
        avg: snapshots.length > 0 
          ? snapshots.reduce((sum, s) => sum + Number(s.currentValue), 0) / snapshots.length 
          : null,
        trend: snapshots.length >= 2 
          ? Number(snapshots[snapshots.length - 1]!.currentValue) - Number(snapshots[0]!.currentValue)
          : null,
      },
    };
  }

  async compare(tenantId: string, dto: ComparePeriodDto) {
    const kpi = await this.prisma.kpiDefinition.findFirst({
      where: { tenantId, code: dto.kpiCode },
    });
    if (!kpi) {
      throw new NotFoundException('KPI not found');
    }

    const [period1Data, period2Data] = await Promise.all([
      this.prisma.kpiSnapshot.findFirst({
        where: {
          tenantId,
          kpiDefinitionId: kpi.id,
          periodType: dto.periodType,
          periodStart: new Date(dto.period1Start),
        },
      }),
      this.prisma.kpiSnapshot.findFirst({
        where: {
          tenantId,
          kpiDefinitionId: kpi.id,
          periodType: dto.periodType,
          periodStart: new Date(dto.period2Start),
        },
      }),
    ]);

    const value1 = period1Data ? Number(period1Data.currentValue) : 0;
    const value2 = period2Data ? Number(period2Data.currentValue) : 0;
    const change = value2 - value1;
    const changePercent = value1 !== 0 ? (change / value1) * 100 : 0;

    return {
      kpi: {
        code: kpi.code,
        name: kpi.name,
        unit: kpi.unit,
      },
      period1: {
        start: dto.period1Start,
        end: dto.period1End,
        value: value1,
      },
      period2: {
        start: dto.period2Start,
        end: dto.period2End,
        value: value2,
      },
      comparison: {
        change,
        changePercent,
        direction: change > 0 ? 'UP' : change < 0 ? 'DOWN' : 'FLAT',
      },
    };
  }

  private generateMockData(dto: QueryDataDto): Record<string, unknown>[] {
    // Generate mock data for demonstration
    const rows = [];
    const count = dto.limit ?? 10;

    for (let i = 0; i < count; i++) {
      rows.push({
        id: `row_${i + 1}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        value: Math.random() * 10000,
        count: Math.floor(Math.random() * 100),
        percentage: Math.random() * 100,
      });
    }

    return rows;
  }
}
