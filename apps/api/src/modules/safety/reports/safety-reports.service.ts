import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class SafetyReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async complianceReport(tenantId: string) {
    const [dqf, insurance, watchlist] = await Promise.all([
      this.prisma.driverQualificationFile.findMany({ where: { tenantId, deletedAt: null } }),
      this.prisma.carrierInsurance.findMany({ where: { tenantId, deletedAt: null } }),
      this.prisma.carrierWatchlist.findMany({ where: { tenantId, deletedAt: null, isActive: true } }),
    ]);

    const dqfExpired = dqf.filter((d) => d.isExpired || (d.expirationDate && d.expirationDate.getTime() < Date.now())).length;
    const dqfVerified = dqf.filter((d) => d.isVerified).length;
    const insuranceExpiring = insurance.filter((i) => this.isExpiring(i.expirationDate, 30) && !i.isExpired).length;

    return {
      dqfTotal: dqf.length,
      dqfExpired,
      dqfVerified,
      insuranceTotal: insurance.length,
      insuranceExpiring,
      watchlistActive: watchlist.length,
    };
  }

  async incidentReport(tenantId: string) {
    const incidents = await this.prisma.safetyIncident.findMany({ where: { tenantId, deletedAt: null } });
    const byType = incidents.reduce<Record<string, number>>((acc, incident) => {
      acc[incident.incidentType] = (acc[incident.incidentType] ?? 0) + 1;
      return acc;
    }, {});
    const bySeverity = incidents.reduce<Record<string, number>>((acc, incident) => {
      const key = incident.severity ?? 'UNSPECIFIED';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return { total: incidents.length, byType, bySeverity };
  }

  async expiringReport(tenantId: string) {
    const target = new Date();
    target.setDate(target.getDate() + 30);

    const [insurance, dqf] = await Promise.all([
      this.prisma.carrierInsurance.findMany({
        where: { tenantId, deletedAt: null, isExpired: false, expirationDate: { lte: target } },
        orderBy: { expirationDate: 'asc' },
      }),
      this.prisma.driverQualificationFile.findMany({
        where: { tenantId, deletedAt: null, isExpired: false, expirationDate: { lte: target } },
        orderBy: { expirationDate: 'asc' },
      }),
    ]);

    return { insurance, dqf };
  }

  private isExpiring(date: Date, days: number) {
    const target = new Date();
    target.setDate(target.getDate() + days);
    return date <= target;
  }
}
