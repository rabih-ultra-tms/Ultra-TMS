import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateInsuranceDto, InsuranceType, UpdateInsuranceDto } from './dto';

const COVERAGE_MINIMUMS: Record<InsuranceType, number> = {
  [InsuranceType.AUTO_LIABILITY]: 1_000_000,
  [InsuranceType.CARGO]: 100_000,
  [InsuranceType.GENERAL_LIABILITY]: 500_000,
  [InsuranceType.WORKERS_COMP]: 0,
};

@Injectable()
export class InsurancesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, carrierId: string, userId: string, dto: CreateInsuranceDto) {
    this.validateCoverage(dto.type, dto.coverageAmount);
    this.ensureDates(dto.effectiveDate, dto.expirationDate);

    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    const existing = await this.prisma.insuranceCertificate.findFirst({
      where: {
        tenantId,
        carrierId,
        insuranceType: dto.type,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      await this.prisma.insuranceCertificate.update({
        where: { id: existing.id },
        data: { status: 'EXPIRED' },
      });
    }

    const insurance = await this.prisma.insuranceCertificate.create({
      data: {
        tenantId,
        carrierId,
        insuranceType: dto.type,
        policyNumber: dto.policyNumber,
        insuranceCompany: dto.insuranceCompany,
        coverageAmount: dto.coverageAmount || 0,
        deductible: dto.deductible,
        effectiveDate: new Date(dto.effectiveDate),
        expirationDate: new Date(dto.expirationDate),
        certificateHolderName: dto.certificateHolder,
        additionalInsured: dto.additionalInsured ?? false,
        documentUrl: dto.documentUrl,
        verified: dto.verified || false,
        verifiedAt: dto.verified ? new Date() : null,
        verifiedById: dto.verified ? userId : null,
        status: 'ACTIVE',
      },
    });

    return insurance;
  }

  async findAllForCarrier(tenantId: string, carrierId: string, options: {
    status?: string;
    includeExpired?: boolean;
  }) {
    const { status, includeExpired = false } = options;

    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    const where: any = { tenantId, carrierId };

    if (status) {
      where.status = status;
    } else if (!includeExpired) {
      where.status = 'ACTIVE';
    }

    const insurances = await this.prisma.insuranceCertificate.findMany({
      where,
      orderBy: [{ insuranceType: 'asc' }, { expirationDate: 'desc' }],
    });

    return insurances;
  }

  async findOne(tenantId: string, id: string) {
    const insurance = await this.prisma.insuranceCertificate.findFirst({
      where: { id, tenantId },
      include: {
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance not found');
    }

    return insurance;
  }

  async update(tenantId: string, id: string, dto: UpdateInsuranceDto) {
    const insurance = await this.prisma.insuranceCertificate.findFirst({
      where: { id, tenantId },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance not found');
    }

    const typeToUse = dto.type ?? (insurance.insuranceType as InsuranceType);
    const coverageToUse = dto.coverageAmount ?? Number((insurance.coverageAmount as any)?.toNumber?.() ?? insurance.coverageAmount);
    this.validateCoverage(typeToUse, coverageToUse);
    this.ensureDates(dto.effectiveDate ?? insurance.effectiveDate?.toISOString?.(), dto.expirationDate ?? insurance.expirationDate?.toISOString?.());

    const updated = await this.prisma.insuranceCertificate.update({
      where: { id },
      data: {
        insuranceType: dto.type ?? insurance.insuranceType,
        policyNumber: dto.policyNumber ?? insurance.policyNumber,
        insuranceCompany: dto.insuranceCompany ?? insurance.insuranceCompany,
        coverageAmount: dto.coverageAmount ?? insurance.coverageAmount,
        deductible: dto.deductible,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
        certificateHolderName: dto.certificateHolder ?? insurance.certificateHolderName,
        additionalInsured: dto.additionalInsured ?? insurance.additionalInsured,
        documentUrl: dto.documentUrl ?? insurance.documentUrl,
        status: dto.status ?? insurance.status,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  async verify(tenantId: string, id: string, userId: string) {
    const insurance = await this.prisma.insuranceCertificate.findFirst({
      where: { id, tenantId },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance not found');
    }

    if (insurance.verified) {
      throw new BadRequestException('Insurance already verified');
    }

    const updated = await this.prisma.insuranceCertificate.update({
      where: { id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        verifiedById: userId,
      },
    });

    return updated;
  }

  async delete(tenantId: string, id: string) {
    const insurance = await this.prisma.insuranceCertificate.findFirst({
      where: { id, tenantId },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance not found');
    }

    await this.prisma.insuranceCertificate.delete({ where: { id } });

    return { success: true, message: 'Insurance deleted successfully' };
  }

  async checkExpiredInsurance(tenantId: string) {
    const now = new Date();

    const expired = await this.prisma.insuranceCertificate.updateMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        expirationDate: { lt: now },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    return { expiredCount: expired.count };
  }

  private validateCoverage(type: InsuranceType, coverageAmount: number) {
    const minimum = COVERAGE_MINIMUMS[type] ?? 0;
    if (coverageAmount < minimum) {
      throw new BadRequestException(`Coverage for ${type} must be at least ${minimum.toLocaleString()}`);
    }
  }

  private ensureDates(effectiveDate?: string | Date, expirationDate?: string | Date) {
    if (!effectiveDate || !expirationDate) return;
    const effective = new Date(effectiveDate);
    const expiration = new Date(expirationDate);
    if (expiration <= effective) {
      throw new BadRequestException('Expiration date must be after effective date');
    }
  }
}
