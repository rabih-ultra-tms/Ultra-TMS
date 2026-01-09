import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateInsuranceDto,
  UpdateInsuranceDto,
  VerifyInsuranceDto,
  InsuranceListQueryDto,
  InsuranceStatus,
} from './dto/insurance.dto';

@Injectable()
export class InsuranceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, carrierId: string) {
    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId, deletedAt: null },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${carrierId} not found`);
    }

    const insurances = await this.prisma.insuranceCertificate.findMany({
      where: { carrierId, tenantId },
      orderBy: { expirationDate: 'asc' },
    });

    return insurances;
  }

  async findOne(tenantId: string, carrierId: string, id: string) {
    const insurance = await this.prisma.insuranceCertificate.findFirst({
      where: { id, carrierId, tenantId },
    });

    if (!insurance) {
      throw new NotFoundException(
        `Insurance certificate with ID ${id} not found`
      );
    }

    return insurance;
  }

  async create(tenantId: string, carrierId: string, dto: CreateInsuranceDto) {
    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId, deletedAt: null },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${carrierId} not found`);
    }

    const insurance = await this.prisma.insuranceCertificate.create({
      data: {
        ...dto,
        tenantId,
        carrierId,
        effectiveDate: new Date(dto.effectiveDate),
        expirationDate: new Date(dto.expirationDate),
        status: InsuranceStatus.PENDING,
      },
    });

    return insurance;
  }

  async update(
    tenantId: string,
    carrierId: string,
    id: string,
    dto: UpdateInsuranceDto
  ) {
    const insurance = await this.findOne(tenantId, carrierId, id);

    const { effectiveDate, expirationDate, ...updateData } = dto;

    const updated = await this.prisma.insuranceCertificate.update({
      where: { id: insurance.id },
      data: {
        ...updateData,
        ...(effectiveDate && { effectiveDate: new Date(effectiveDate) }),
        ...(expirationDate && { expirationDate: new Date(expirationDate) }),
      },
    });

    return updated;
  }

  async verify(
    tenantId: string,
    carrierId: string,
    id: string,
    userId: string,
    dto: VerifyInsuranceDto
  ) {
    const insurance = await this.findOne(tenantId, carrierId, id);

    const updated = await this.prisma.insuranceCertificate.update({
      where: { id: insurance.id },
      data: {
        isVerified: dto.isVerified,
        verifiedAt: dto.isVerified ? new Date() : null,
        verifiedBy: dto.isVerified ? userId : null,
        verificationNotes: dto.verificationNotes,
        status: dto.isVerified ? InsuranceStatus.ACTIVE : insurance.status,
      },
    });

    return updated;
  }

  async delete(tenantId: string, carrierId: string, id: string) {
    const insurance = await this.findOne(tenantId, carrierId, id);

    await this.prisma.insuranceCertificate.delete({
      where: { id: insurance.id },
    });

    return {
      success: true,
      message: 'Insurance certificate deleted successfully',
    };
  }

  async getExpiring(tenantId: string, query: InsuranceListQueryDto) {
    const { page = 1, limit = 20, daysUntilExpiration = 30 } = query;
    const skip = (page - 1) * limit;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysUntilExpiration);

    const where: Record<string, unknown> = {
      tenantId,
      expirationDate: { lte: expirationDate },
      status: { not: InsuranceStatus.CANCELLED },
    };

    const [data, total] = await Promise.all([
      this.prisma.insuranceCertificate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expirationDate: 'asc' },
        include: {
          carrier: {
            select: {
              id: true,
              legalName: true,
              mcNumber: true,
              email: true,
              dispatchEmail: true,
            },
          },
        },
      }),
      this.prisma.insuranceCertificate.count({ where }),
    ]);

    // Categorize by status
    const now = new Date();
    const categorized = data.map((ins) => ({
      ...ins,
      expirationCategory:
        new Date(ins.expirationDate) < now ? 'EXPIRED' : 'EXPIRING_SOON',
      daysUntilExpiration: Math.ceil(
        (new Date(ins.expirationDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    }));

    return {
      data: categorized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        expired: categorized.filter((i) => i.expirationCategory === 'EXPIRED')
          .length,
        expiringSoon: categorized.filter(
          (i) => i.expirationCategory === 'EXPIRING_SOON'
        ).length,
      },
    };
  }
}
