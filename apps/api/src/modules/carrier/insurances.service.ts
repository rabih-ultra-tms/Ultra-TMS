import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateInsuranceDto, UpdateInsuranceDto } from './dto';

@Injectable()
export class InsurancesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, carrierId: string, userId: string, dto: CreateInsuranceDto) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    const existing = await this.prisma.insuranceCertificate.findFirst({
      where: {
        carrierId,
        insuranceType: dto.insuranceType,
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
        insuranceType: dto.insuranceType,
        policyNumber: dto.policyNumber,
        insuranceCompany: dto.insurer || 'Unknown',
        coverageAmount: dto.coverageAmount || 0,
        deductible: dto.deductible,
        effectiveDate: new Date(dto.effectiveDate),
        expirationDate: new Date(dto.expirationDate),
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

    const updated = await this.prisma.insuranceCertificate.update({
      where: { id },
      data: {
        insuranceType: dto.insuranceType,
        policyNumber: dto.policyNumber,
        insuranceCompany: dto.insurer,
        coverageAmount: dto.coverageAmount,
        deductible: dto.deductible,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
        status: dto.status,
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
}
