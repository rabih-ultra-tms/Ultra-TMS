import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { CalculateSafetyScoreDto } from './dto/calculate-score.dto';
import { calculateSafetyScore } from './scoring.engine';

@Injectable()
export class SafetyScoresService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async getScore(tenantId: string, carrierId: string) {
    const latestAudit = await this.prisma.safetyAuditTrail.findFirst({
      where: { tenantId, carrierId, eventType: 'SAFETY_SCORE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (latestAudit?.eventData) {
      return latestAudit.eventData as Record<string, unknown>;
    }

    return this.calculate({ tenantId, carrierId });
  }

  async history(tenantId: string, carrierId: string) {
    const audits = await this.prisma.safetyAuditTrail.findMany({
      where: { tenantId, carrierId, eventType: 'SAFETY_SCORE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return audits.map((a) => a.eventData ?? {});
  }

  async calculate(params: CalculateSafetyScoreDto & { tenantId: string; userId?: string }) {
    await this.requireCarrier(params.tenantId, params.carrierId);
    const components = await this.buildComponents(params.tenantId, params.carrierId);
    const result = { ...components, ...calculateSafetyScore(components), carrierId: params.carrierId, calculatedAt: new Date() };

    await this.prisma.safetyAuditTrail.create({
      data: {
        tenantId: params.tenantId,
        carrierId: params.carrierId,
        eventType: 'SAFETY_SCORE',
        eventDescription: 'Carrier safety score calculated',
        eventData: result,
        performedById: params.userId,
      },
    });

    this.events.emit('safety.score.updated', { carrierId: params.carrierId, score: result.overallScore });
    return result;
  }

  private async buildComponents(tenantId: string, carrierId: string) {
    const [record, insurance, csa, incidents, dqf] = await Promise.all([
      this.prisma.fmcsaCarrierRecord.findFirst({ where: { tenantId, carrierId, deletedAt: null } }),
      this.prisma.carrierInsurance.findMany({ where: { tenantId, carrierId, deletedAt: null } }),
      this.prisma.csaScore.findMany({ where: { tenantId, carrierId, deletedAt: null }, orderBy: { asOfDate: 'desc' } }),
      this.prisma.safetyIncident.findMany({ where: { tenantId, carrierId, deletedAt: null } }),
      this.prisma.driverQualificationFile.findMany({ where: { tenantId, deletedAt: null } }),
    ]);

    const authorityScore = this.calculateAuthority(record);
    const insuranceScore = this.calculateInsurance(insurance);
    const csaScore = this.calculateCsa(csa);
    const incidentScore = this.calculateIncidents(incidents);
    const complianceScore = this.calculateCompliance(dqf);
    const performanceScore = 80;

    return { authorityScore, insuranceScore, csaScore, incidentScore, complianceScore, performanceScore };
  }

  private calculateAuthority(record: { operatingStatus?: string | null } | null) {
    if (!record || !record.operatingStatus) return 70;
    if (record.operatingStatus === 'ACTIVE') return 100;
    if (record.operatingStatus === 'OUT_OF_SERVICE') return 40;
    return 60;
  }

  private calculateInsurance(records: Array<{ isExpired: boolean; isVerified: boolean; coverageAmount: any; expirationDate: Date }>) {
    if (!records.length) return 60;
    const active = records.filter((r) => !r.isExpired && r.expirationDate.getTime() >= Date.now());
    const verified = active.filter((r) => r.isVerified);
    if (verified.length) return 100;
    if (active.length) return 85;
    return 60;
  }

  private calculateCsa(records: Array<{ percentile: number | null; isAlert: boolean }>) {
    if (!records.length) return 80;
    const percentiles = records.map((r) => r.percentile ?? 0);
    const avg = percentiles.reduce((a, b) => a + b, 0) / percentiles.length;
    const inverted = Math.max(0, Math.min(100, 100 - avg));
    const hasAlert = records.some((r) => r.isAlert);
    return hasAlert ? Math.max(50, inverted - 10) : inverted;
  }

  private calculateIncidents(records: Array<{ incidentDate: Date }>) {
    if (!records.length) return 95;
    const windowStart = new Date();
    windowStart.setFullYear(windowStart.getFullYear() - 1);
    const recentCount = records.filter((r) => r.incidentDate >= windowStart).length;
    return Math.max(40, 100 - recentCount * 10);
  }

  private calculateCompliance(records: Array<{ isExpired: boolean; isVerified: boolean }>) {
    if (!records.length) return 70;
    const expired = records.filter((r) => r.isExpired).length;
    const verified = records.filter((r) => r.isVerified).length;
    if (expired > 0) return 60;
    if (verified === records.length) return 100;
    return 85;
  }

  private async requireCarrier(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id: carrierId, tenantId, deletedAt: null } });
    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }
    return carrier;
  }
}
