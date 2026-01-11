import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InsuranceType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { InsuranceQueryDto } from './dto/insurance-query.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';

const MINIMUM_COVERAGE: Record<InsuranceType, number> = {
  [InsuranceType.AUTO_LIABILITY]: 1_000_000,
  [InsuranceType.CARGO]: 100_000,
  [InsuranceType.GENERAL_LIABILITY]: 1_000_000,
  [InsuranceType.WORKERS_COMP]: 500_000,
  [InsuranceType.UMBRELLA]: 500_000,
  [InsuranceType.BOND]: 75_000,
};

@Injectable()
export class InsuranceService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async list(tenantId: string, query: InsuranceQueryDto) {
    const where: Prisma.CarrierInsuranceWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.carrierId ? { carrierId: query.carrierId } : {}),
      ...(query.isExpired !== undefined ? { isExpired: query.isExpired } : {}),
      ...(query.isVerified !== undefined ? { isVerified: query.isVerified } : {}),
    };
    return this.prisma.carrierInsurance.findMany({ where, orderBy: { expirationDate: 'asc' } });
  }

  async create(tenantId: string, userId: string, dto: CreateInsuranceDto) {
    this.ensureCoverage(dto.insuranceType, dto.coverageAmount);
    const effectiveDate = new Date(dto.effectiveDate);
    const expirationDate = new Date(dto.expirationDate);
    const isExpired = this.isExpired(expirationDate);

    const record = await this.prisma.carrierInsurance.create({
      data: {
        tenantId,
        carrierId: dto.carrierId,
        insuranceType: dto.insuranceType,
        policyNumber: dto.policyNumber,
        carrierName: dto.carrierName,
        coverageAmount: dto.coverageAmount,
        effectiveDate,
        expirationDate,
        isExpired,
        agentName: dto.agentName,
        agentPhone: dto.agentPhone,
        agentEmail: dto.agentEmail,
        certificateUrl: dto.certificateUrl,
        isVerified: dto.isVerified ?? false,
        createdById: userId,
        updatedById: userId,
      },
    });

    this.emitExpiringIfNeeded(record);
    return record;
  }

  async get(tenantId: string, id: string) {
    const record = await this.prisma.carrierInsurance.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!record) {
      throw new NotFoundException('Insurance record not found');
    }
    return record;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateInsuranceDto) {
    const existing = await this.get(tenantId, id);
    const coverageAmount = dto.coverageAmount ?? existing.coverageAmount.toNumber();
    this.ensureCoverage(dto.insuranceType ?? existing.insuranceType, coverageAmount);

    const expirationDate = dto.expirationDate ? new Date(dto.expirationDate) : existing.expirationDate;
    const isExpired = this.isExpired(expirationDate);

    const updated = await this.prisma.carrierInsurance.update({
      where: { id: existing.id },
      data: {
        ...(dto.insuranceType !== undefined ? { insuranceType: dto.insuranceType } : {}),
        ...(dto.policyNumber !== undefined ? { policyNumber: dto.policyNumber } : {}),
        ...(dto.carrierName !== undefined ? { carrierName: dto.carrierName } : {}),
        ...(dto.coverageAmount !== undefined ? { coverageAmount: dto.coverageAmount } : {}),
        ...(dto.effectiveDate !== undefined ? { effectiveDate: new Date(dto.effectiveDate) } : {}),
        ...(dto.expirationDate !== undefined ? { expirationDate: expirationDate } : {}),
        ...(dto.agentName !== undefined ? { agentName: dto.agentName } : {}),
        ...(dto.agentPhone !== undefined ? { agentPhone: dto.agentPhone } : {}),
        ...(dto.agentEmail !== undefined ? { agentEmail: dto.agentEmail } : {}),
        ...(dto.certificateUrl !== undefined ? { certificateUrl: dto.certificateUrl } : {}),
        ...(dto.isVerified !== undefined ? { isVerified: dto.isVerified } : {}),
        isExpired,
        updatedById: userId,
      },
    });

    this.emitExpiringIfNeeded(updated);
    return updated;
  }

  async remove(tenantId: string, userId: string, id: string) {
    await this.get(tenantId, id);
    await this.prisma.carrierInsurance.update({
      where: { id },
      data: { deletedAt: new Date(), isExpired: true, updatedById: userId },
    });
    return { success: true };
  }

  async verify(tenantId: string, userId: string, id: string) {
    const record = await this.get(tenantId, id);
    return this.prisma.carrierInsurance.update({
      where: { id: record.id },
      data: { isVerified: true, verifiedAt: new Date(), verifiedById: userId, updatedById: userId },
    });
  }

  async expiring(tenantId: string, days = 30) {
    const target = new Date();
    target.setDate(target.getDate() + days);
    return this.prisma.carrierInsurance.findMany({
      where: {
        tenantId,
        deletedAt: null,
        isExpired: false,
        expirationDate: { lte: target },
      },
      orderBy: { expirationDate: 'asc' },
    });
  }

  private ensureCoverage(type: InsuranceType, amount: number) {
    const minimum = MINIMUM_COVERAGE[type];
    if (minimum && amount < minimum) {
      throw new BadRequestException(`Coverage amount for ${type} must be at least ${minimum}`);
    }
  }

  private isExpired(expirationDate?: Date | string | null) {
    if (!expirationDate) return false;
    const dateValue = expirationDate instanceof Date ? expirationDate : new Date(expirationDate);
    return dateValue.getTime() < Date.now();
  }

  private emitExpiringIfNeeded(record: { carrierId: string; expirationDate: Date }) {
    const diff = record.expirationDate.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 30 && days >= 0) {
      this.events.emit('safety.insurance.expiring', { carrierId: record.carrierId, days });
    }
    if (days < 0) {
      this.events.emit('safety.insurance.expired', { carrierId: record.carrierId, insuranceId: (record as any).id });
    }
  }
}
