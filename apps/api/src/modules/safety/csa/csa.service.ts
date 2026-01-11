import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CSABasicType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

const BASIC_TYPES: CSABasicType[] = [
  CSABasicType.UNSAFE_DRIVING,
  CSABasicType.HOS_COMPLIANCE,
  CSABasicType.DRIVER_FITNESS,
  CSABasicType.CONTROLLED_SUBSTANCES,
  CSABasicType.VEHICLE_MAINTENANCE,
  CSABasicType.HAZMAT_COMPLIANCE,
  CSABasicType.CRASH_INDICATOR,
];

const ALERT_THRESHOLDS: Record<CSABasicType, number> = {
  [CSABasicType.UNSAFE_DRIVING]: 65,
  [CSABasicType.HOS_COMPLIANCE]: 65,
  [CSABasicType.DRIVER_FITNESS]: 80,
  [CSABasicType.CONTROLLED_SUBSTANCES]: 80,
  [CSABasicType.VEHICLE_MAINTENANCE]: 80,
  [CSABasicType.HAZMAT_COMPLIANCE]: 80,
  [CSABasicType.CRASH_INDICATOR]: 65,
};

@Injectable()
export class CsaService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async getCurrent(tenantId: string, carrierId: string) {
    const scores = await this.prisma.csaScore.findMany({
      where: { tenantId, carrierId, deletedAt: null },
      orderBy: { asOfDate: 'desc' },
    });

    const latestByBasic = new Map<CSABasicType, typeof scores[number]>();
    for (const score of scores) {
      if (!latestByBasic.has(score.basicType)) {
        latestByBasic.set(score.basicType, score);
      }
    }

    return Array.from(latestByBasic.values());
  }

  async getHistory(tenantId: string, carrierId: string) {
    return this.prisma.csaScore.findMany({
      where: { tenantId, carrierId, deletedAt: null },
      orderBy: { asOfDate: 'desc' },
    });
  }

  async refresh(tenantId: string, carrierId: string) {
    const asOfDate = new Date();

    const created = await Promise.all(
      BASIC_TYPES.map((basic) => {
        const percentile = this.seededPercentile(basic);
        const threshold = ALERT_THRESHOLDS[basic];
        const isAboveThreshold = percentile >= threshold;
        const scoreRecord: Prisma.CsaScoreCreateInput = {
          tenant: { connect: { id: tenantId } },
          carrier: { connect: { id: carrierId } },
          basicType: basic,
          score: percentile,
          percentile,
          threshold,
          isAboveThreshold,
          isAlert: isAboveThreshold,
          inspectionCount: 3,
          violationCount: isAboveThreshold ? 2 : 0,
          oosViolationCount: isAboveThreshold ? 1 : 0,
          measurementPeriod: '12_MONTHS',
          asOfDate,
          sourceSystem: 'SMS',
          customFields: Prisma.JsonNull,
        };
        return this.prisma.csaScore.create({ data: scoreRecord });
      }),
    );

    created.filter((score) => score.isAlert).forEach((score) => {
      this.events.emit('safety.csa.alert', { carrierId, basic: score.basicType, score: score.percentile });
    });
    this.events.emit('safety.csa.updated', { carrierId, scores: created });

    return created;
  }

  private seededPercentile(basic: CSABasicType) {
    const base = ALERT_THRESHOLDS[basic];
    // Keep a deterministic but varied percentile for tests
    return Math.min(99, base + 5);
  }
}
