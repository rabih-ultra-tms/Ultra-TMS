import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateKpiDefinitionDto,
  UpdateKpiDefinitionDto,
  GetKpiValuesDto,
  KpiBreakdownDto,
  CalculateKpiDto,
} from './dto';

@Injectable()
export class KpisService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, category?: string, isActive?: boolean) {
    const where: Record<string, unknown> = { tenantId };
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;

    return this.prisma.kpiDefinition.findMany({
      where,
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    const kpi = await this.prisma.kpiDefinition.findFirst({
      where: { id, tenantId },
    });
    if (!kpi) {
      throw new NotFoundException('KPI definition not found');
    }
    return kpi;
  }

  async findByCategory(tenantId: string, category: string) {
    return this.prisma.kpiDefinition.findMany({
      where: { tenantId, category, isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async create(tenantId: string, userId: string, dto: CreateKpiDefinitionDto) {
    // Check for duplicate code
    const existing = await this.prisma.kpiDefinition.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException('KPI code already exists');
    }

    return this.prisma.kpiDefinition.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        formula: dto.formula,
        dataSource: dto.dataSource,
        aggregationType: dto.aggregationType,
        unit: dto.unit,
        formatPattern: dto.formatPattern,
        decimalPlaces: dto.decimalPlaces ?? 2,
        targetValue: dto.targetValue,
        warningThreshold: dto.warningThreshold,
        criticalThreshold: dto.criticalThreshold,
        thresholdDirection: dto.thresholdDirection,
        displayOrder: dto.displayOrder ?? 0,
        customFields: dto.customFields
          ? JSON.parse(JSON.stringify(dto.customFields))
          : {},
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateKpiDefinitionDto) {
    await this.findOne(tenantId, id);

    return this.prisma.kpiDefinition.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.formula !== undefined && { formula: dto.formula }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.formatPattern !== undefined && { formatPattern: dto.formatPattern }),
        ...(dto.decimalPlaces !== undefined && { decimalPlaces: dto.decimalPlaces }),
        ...(dto.targetValue !== undefined && { targetValue: dto.targetValue }),
        ...(dto.warningThreshold !== undefined && { warningThreshold: dto.warningThreshold }),
        ...(dto.criticalThreshold !== undefined && { criticalThreshold: dto.criticalThreshold }),
        ...(dto.thresholdDirection !== undefined && { thresholdDirection: dto.thresholdDirection }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
        ...(dto.customFields && {
          customFields: JSON.parse(JSON.stringify(dto.customFields)),
        }),
        updatedBy: userId,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    const kpi = await this.findOne(tenantId, id);
    if (kpi.isSystem) {
      throw new ConflictException('Cannot delete system KPI');
    }

    await this.prisma.kpiDefinition.delete({ where: { id } });
    return { success: true };
  }

  async getValues(tenantId: string, id: string, dto: GetKpiValuesDto) {
    await this.findOne(tenantId, id);

    return this.prisma.kpiSnapshot.findMany({
      where: {
        tenantId,
        kpiDefinitionId: id,
        periodType: dto.periodType,
        periodStart: {
          gte: new Date(dto.startDate),
          lte: new Date(dto.endDate),
        },
      },
      orderBy: { periodStart: 'asc' },
    });
  }

  async getCurrentValues(tenantId: string) {
    // Get latest snapshot for each active KPI
    const kpis = await this.prisma.kpiDefinition.findMany({
      where: { tenantId, isActive: true },
      include: {
        snapshots: {
          where: { periodType: 'DAY' },
          orderBy: { periodStart: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    return kpis.map((kpi) => ({
      id: kpi.id,
      code: kpi.code,
      name: kpi.name,
      category: kpi.category,
      unit: kpi.unit,
      formatPattern: kpi.formatPattern,
      targetValue: kpi.targetValue,
      warningThreshold: kpi.warningThreshold,
      criticalThreshold: kpi.criticalThreshold,
      currentValue: kpi.snapshots[0]?.currentValue ?? null,
      previousValue: kpi.snapshots[0]?.previousValue ?? null,
      changePercentage: kpi.snapshots[0]?.changePercentage ?? null,
      status: kpi.snapshots[0]?.status ?? 'NORMAL',
      calculatedAt: kpi.snapshots[0]?.calculatedAt ?? null,
    }));
  }

  async getBreakdown(tenantId: string, id: string, dto: KpiBreakdownDto) {
    const snapshot = await this.prisma.kpiSnapshot.findFirst({
      where: {
        tenantId,
        kpiDefinitionId: id,
        periodType: dto.periodType,
        periodStart: new Date(dto.startDate),
      },
    });

    if (!snapshot || !snapshot.breakdown) {
      return { breakdown: {}, groupBy: dto.groupBy };
    }

    const breakdown = snapshot.breakdown as Record<string, unknown>;
    if (dto.groupBy && breakdown[dto.groupBy]) {
      return { breakdown: breakdown[dto.groupBy], groupBy: dto.groupBy };
    }

    return { breakdown, groupBy: dto.groupBy };
  }

  async calculate(tenantId: string, id: string, dto: CalculateKpiDto) {
    const kpi = await this.findOne(tenantId, id);

    // In a real implementation, this would execute the formula
    // against the data source and calculate the actual value
    // For now, we'll create a mock snapshot
    const periodStart = dto.periodStart ? new Date(dto.periodStart) : new Date();
    const periodEnd = dto.periodEnd ? new Date(dto.periodEnd) : new Date();

    // Mock calculation - in production this would run actual queries
    const currentValue = Math.random() * 100;
    const previousValue = Math.random() * 100;
    const changeAmount = currentValue - previousValue;
    const changePercentage = previousValue !== 0 
      ? (changeAmount / previousValue) * 100 
      : 0;

    let status = 'NORMAL';
    if (kpi.criticalThreshold) {
      const critical = Number(kpi.criticalThreshold);
      if (kpi.thresholdDirection === 'ABOVE' && currentValue < critical) {
        status = 'CRITICAL';
      } else if (kpi.thresholdDirection === 'BELOW' && currentValue > critical) {
        status = 'CRITICAL';
      }
    }
    if (status === 'NORMAL' && kpi.warningThreshold) {
      const warning = Number(kpi.warningThreshold);
      if (kpi.thresholdDirection === 'ABOVE' && currentValue < warning) {
        status = 'WARNING';
      } else if (kpi.thresholdDirection === 'BELOW' && currentValue > warning) {
        status = 'WARNING';
      }
    }

    return this.prisma.kpiSnapshot.upsert({
      where: {
        tenantId_kpiDefinitionId_periodType_periodStart: {
          tenantId,
          kpiDefinitionId: id,
          periodType: dto.periodType,
          periodStart,
        },
      },
      create: {
        tenantId,
        kpiDefinitionId: id,
        periodType: dto.periodType,
        periodStart,
        periodEnd,
        currentValue,
        previousValue,
        targetValue: kpi.targetValue,
        changeAmount,
        changePercentage,
        status,
      },
      update: {
        currentValue,
        previousValue,
        changeAmount,
        changePercentage,
        status,
        calculatedAt: new Date(),
      },
    });
  }
}
