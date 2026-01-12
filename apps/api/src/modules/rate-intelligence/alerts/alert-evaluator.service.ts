import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class AlertEvaluatorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Placeholder for scheduled alert evaluation; can be wired to scheduler events later.
   */
  async evaluate(tenantId: string) {
    const alerts = await this.prisma.rateAlert.findMany({ where: { tenantId, isActive: true, deletedAt: null } });
    return { evaluated: alerts.length };
  }
}
