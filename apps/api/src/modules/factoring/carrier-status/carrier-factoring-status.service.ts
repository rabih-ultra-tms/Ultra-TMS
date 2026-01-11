import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { FactoringStatus } from '../dto/enums';
import { PaymentRoutingService } from '../routing/payment-routing.service';
import { EnrollQuickPayDto } from './dto/enroll-quick-pay.dto';
import { OverrideFactoringDto } from './dto/override-factoring.dto';
import { UpdateCarrierFactoringStatusDto } from './dto/update-carrier-factoring-status.dto';

@Injectable()
export class CarrierFactoringStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly routing: PaymentRoutingService,
  ) {}

  async getStatus(tenantId: string, carrierId: string) {
    const status = await this.getOrCreateStatus(tenantId, carrierId);
    const paymentRoute = await this.routing.determineDestination(tenantId, carrierId);
    return { ...status, paymentRoute };
  }

  async updateStatus(tenantId: string, userId: string, carrierId: string, dto: UpdateCarrierFactoringStatusDto) {
    await this.requireCarrier(tenantId, carrierId);

    if (dto.factoringCompanyId) {
      await this.requireFactoringCompany(tenantId, dto.factoringCompanyId);
    }

    const current = await this.getOrCreateStatus(tenantId, carrierId);

    const updated = await this.prisma.carrierFactoringStatus.update({
      where: { id: current.id },
      data: {
        ...(dto.factoringStatus !== undefined ? { factoringStatus: dto.factoringStatus } : {}),
        ...(dto.factoringCompanyId !== undefined ? { factoringCompanyId: dto.factoringCompanyId } : {}),
        ...(dto.activeNoaId !== undefined ? { activeNoaId: dto.activeNoaId } : {}),
        ...(dto.notes !== undefined
          ? { customFields: this.mergeCustomFields(current.customFields, { notes: dto.notes }) as Prisma.InputJsonValue }
          : {}),
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('carrier.factoring.updated', {
      carrierId,
      status: updated.factoringStatus,
      tenantId,
    });

    const paymentRoute = await this.routing.determineDestination(tenantId, carrierId);
    return { ...updated, paymentRoute };
  }

  async enrollQuickPay(tenantId: string, userId: string, carrierId: string, dto: EnrollQuickPayDto) {
    await this.requireCarrier(tenantId, carrierId);
    const current = await this.getOrCreateStatus(tenantId, carrierId);

    const updated = await this.prisma.carrierFactoringStatus.update({
      where: { id: current.id },
      data: {
        quickPayEnabled: true,
        quickPayFeePercent: dto.quickPayFeePercent,
        factoringStatus: current.factoringStatus === FactoringStatus.NONE ? FactoringStatus.QUICK_PAY_ONLY : current.factoringStatus,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('carrier.quickpay.enrolled', { carrierId, rate: dto.quickPayFeePercent, tenantId });
    const paymentRoute = await this.routing.determineDestination(tenantId, carrierId);
    return { ...updated, paymentRoute };
  }

  async unenrollQuickPay(tenantId: string, userId: string, carrierId: string) {
    await this.requireCarrier(tenantId, carrierId);
    const current = await this.getOrCreateStatus(tenantId, carrierId);

    const updated = await this.prisma.carrierFactoringStatus.update({
      where: { id: current.id },
      data: { quickPayEnabled: false, quickPayFeePercent: null, updatedById: userId },
    });

    const paymentRoute = await this.routing.determineDestination(tenantId, carrierId);
    return { ...updated, paymentRoute };
  }

  async setOverride(tenantId: string, userId: string, carrierId: string, dto: OverrideFactoringDto) {
    await this.requireCarrier(tenantId, carrierId);
    await this.requireFactoringCompany(tenantId, dto.factoringCompanyId);

    const current = await this.getOrCreateStatus(tenantId, carrierId);
    const customFields = this.mergeCustomFields(current.customFields, {
      overrideFactoringCompanyId: dto.factoringCompanyId,
      overrideReason: dto.overrideReason,
      overrideUntil: dto.overrideUntil,
    });

    const updated = await this.prisma.carrierFactoringStatus.update({
      where: { id: current.id },
      data: { customFields: customFields as Prisma.InputJsonValue, updatedById: userId },
    });

    this.eventEmitter.emit('carrier.factoring.updated', { carrierId, status: updated.factoringStatus, tenantId });
    const paymentRoute = await this.routing.determineDestination(tenantId, carrierId);
    return { ...updated, paymentRoute };
  }

  private async getOrCreateStatus(tenantId: string, carrierId: string) {
    const existing = await this.prisma.carrierFactoringStatus.findFirst({ where: { tenantId, carrierId } });
    if (existing) {
      return existing;
    }

    return this.prisma.carrierFactoringStatus.create({
      data: {
        tenantId,
        carrierId,
        factoringStatus: FactoringStatus.NONE,
        quickPayEnabled: false,
      },
    });
  }

  private async requireCarrier(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id: carrierId, tenantId, deletedAt: null } });
    if (!carrier) {
      throw new NotFoundException('Carrier not found for tenant');
    }
    return carrier;
  }

  private async requireFactoringCompany(tenantId: string, factoringCompanyId: string) {
    const company = await this.prisma.factoringCompany.findFirst({ where: { id: factoringCompanyId, tenantId, deletedAt: null } });
    if (!company) {
      throw new NotFoundException('Factoring company not found');
    }
    return company;
  }

  private mergeCustomFields(current: Prisma.InputJsonValue | null, next: Record<string, unknown>) {
    const currentValue = (current as Record<string, unknown>) || {};
    return { ...currentValue, ...next };
  }
}
