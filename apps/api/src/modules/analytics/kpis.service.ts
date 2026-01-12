import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { KPICategory, TrendDirection } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CalculateKpiDto, CreateKpiDto, KpiValuesQueryDto, UpdateKpiDto } from './dto';

@Injectable()
export class KpisService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, category?: KPICategory, status?: string) {
    return this.prisma.kPIDefinition.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(category ? { category } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async get(tenantId: string, id: string) {
    const kpi = await this.prisma.kPIDefinition.findFirst({ where: { id, tenantId, deletedAt: null } });
      if (!kpi) {
      throw new NotFoundException('KPI not found');
    }
    return kpi;
  }

  async getByCategory(tenantId: string, category: KPICategory) {
    return this.list(tenantId, category, 'ACTIVE');
  }

  async create(tenantId: string, userId: string, dto: CreateKpiDto) {
    const existing = await this.prisma.kPIDefinition.findFirst({ where: { tenantId, code: dto.code } });
      if (existing) {
      throw new ConflictException('KPI code already exists');
    }

    return this.prisma.kPIDefinition.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        aggregationType: dto.aggregationType,
        sourceQuery: dto.sourceQuery,
        unit: dto.unit,
        format: dto.format,
        targetValue: dto.targetValue ? dto.targetValue : undefined,
        warningValue: dto.warningValue ? dto.warningValue : undefined,
        criticalValue: dto.criticalValue ? dto.criticalValue : undefined,
        status: dto.status ?? 'ACTIVE',
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateKpiDto) {
    await this.get(tenantId, id);

    return this.prisma.kPIDefinition.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        aggregationType: dto.aggregationType,
        sourceQuery: dto.sourceQuery,
        unit: dto.unit,
        format: dto.format,
        targetValue: dto.targetValue,
        warningValue: dto.warningValue,
        criticalValue: dto.criticalValue,
        status: dto.status,
        updatedById: userId,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.get(tenantId, id);
    await this.prisma.kPIDefinition.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
      return { success: true };
  }

  async values(tenantId: string, id: string, query: KpiValuesQueryDto) {
    await this.get(tenantId, id);
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    const snapshots = await this.prisma.kPISnapshot.findMany({
      where: {
        tenantId,
        kpiDefinitionId: id,
        snapshotDate: { gte: start, lte: end },
        deletedAt: null,
      },
      orderBy: { snapshotDate: 'asc' },
    });

    return { count: snapshots.length, data: snapshots };
  }

  async currentValues(tenantId: string) {
    const kpis = await this.prisma.kPIDefinition.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const results = [] as any[];
    for (const kpi of kpis) {
      const latest = await this.prisma.kPISnapshot.findFirst({
        where: { tenantId, kpiDefinitionId: kpi.id, deletedAt: null },
        orderBy: { snapshotDate: 'desc' },
      });
      results.push({
        id: kpi.id,
        code: kpi.code,
        name: kpi.name,
        category: kpi.category,
        unit: kpi.unit,
        format: kpi.format,
        targetValue: kpi.targetValue,
        currentValue: latest?.value ?? null,
        comparisonValue: latest?.comparisonValue ?? null,
        trendDirection: latest?.trendDirection ?? null,
        snapshotDate: latest?.snapshotDate ?? null,
      });
    }
    return results;
  }

  async calculate(tenantId: string, id: string, dto: CalculateKpiDto) {
    await this.get(tenantId, id);
    const snapshotDate = dto.snapshotDate ? new Date(dto.snapshotDate) : new Date();

    const previous = await this.prisma.kPISnapshot.findFirst({
      where: { tenantId, kpiDefinitionId: id, snapshotDate: { lt: snapshotDate }, deletedAt: null },
      orderBy: { snapshotDate: 'desc' },
    });

    const currentValue = Math.round(Math.random() * 10000) / 100;
    const comparisonValue = previous?.value ?? null;
    let trendDirection: TrendDirection | null = null;
    if (comparisonValue !== null) {
      if (currentValue > Number(comparisonValue)) trendDirection = 'UP';
      else if (currentValue < Number(comparisonValue)) trendDirection = 'DOWN';
      else trendDirection = 'FLAT';
    }

    const snapshot = await this.prisma.kPISnapshot.create({
      data: {
        tenantId,
        kpiDefinitionId: id,
        snapshotDate,
        value: currentValue,
        comparisonValue,
        trendDirection,
        metadata: {},
      },
    });

    return snapshot;
  }
}
