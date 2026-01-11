import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { FactoringStatus, NoaStatus } from '../dto/enums';

export type PaymentRoute =
  | { type: 'CARRIER'; carrierId: string }
  | { type: 'FACTORING_COMPANY'; factoringCompanyId: string }
  | { type: 'OVERRIDE'; factoringCompanyId: string; reason?: string; overrideUntil?: Date }
  | { type: 'QUICK_PAY'; quickPayFeePercent?: number };

@Injectable()
export class PaymentRoutingService {
  constructor(private readonly prisma: PrismaService) {}

  async determineDestination(tenantId: string, carrierId: string): Promise<PaymentRoute> {
    const status = await this.prisma.carrierFactoringStatus.findFirst({
      where: { tenantId, carrierId, deletedAt: null },
    });

    if (!status) {
      return { type: 'CARRIER', carrierId };
    }

    const customFields = (status.customFields as Record<string, unknown>) || {};
    const overrideFactoringCompanyId = customFields.overrideFactoringCompanyId as string | undefined;
    const overrideReason = customFields.overrideReason as string | undefined;
    const overrideUntil = customFields.overrideUntil ? new Date(customFields.overrideUntil as string) : undefined;

    if (overrideFactoringCompanyId && (!overrideUntil || overrideUntil > new Date())) {
      return {
        type: 'OVERRIDE',
        factoringCompanyId: overrideFactoringCompanyId,
        reason: overrideReason,
        overrideUntil,
      };
    }

    if (status.factoringStatus === FactoringStatus.FACTORED && status.factoringCompanyId) {
      if (status.activeNoaId) {
        const noa = await this.prisma.nOARecord.findFirst({
          where: { id: status.activeNoaId, tenantId, deletedAt: null },
        });

        if (noa) {
          const now = new Date();
          const effectiveOk = !noa.effectiveDate || noa.effectiveDate <= now;
          const notExpired = !noa.expirationDate || noa.expirationDate >= now;
          const notReleased = noa.status !== NoaStatus.RELEASED;

          if (effectiveOk && notExpired && notReleased) {
            return { type: 'FACTORING_COMPANY', factoringCompanyId: status.factoringCompanyId };
          }
        }
      }

      return { type: 'FACTORING_COMPANY', factoringCompanyId: status.factoringCompanyId };
    }

    if (status.factoringStatus === FactoringStatus.QUICK_PAY_ONLY || status.quickPayEnabled) {
      return { type: 'QUICK_PAY', quickPayFeePercent: status.quickPayFeePercent ?? undefined };
    }

    return { type: 'CARRIER', carrierId };
  }
}
