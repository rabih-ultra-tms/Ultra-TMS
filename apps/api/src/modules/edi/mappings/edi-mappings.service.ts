import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateEdiMappingDto } from './dto/create-edi-mapping.dto';
import { UpdateEdiMappingDto } from './dto/update-edi-mapping.dto';

@Injectable()
export class EdiMappingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, filters?: { tradingPartnerId?: string; transactionType?: string }) {
    const where: Prisma.EdiTransactionMappingWhereInput = {
      tenantId,
      deletedAt: null,
      ...(filters?.tradingPartnerId ? { tradingPartnerId: filters.tradingPartnerId } : {}),
      ...(filters?.transactionType ? { transactionType: filters.transactionType as any } : {}),
    };

    return this.prisma.ediTransactionMapping.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(tenantId: string, userId: string, dto: CreateEdiMappingDto) {
    const conflict = await this.prisma.ediTransactionMapping.findFirst({
      where: {
        tenantId,
        tradingPartnerId: dto.tradingPartnerId,
        transactionType: dto.transactionType,
        deletedAt: null,
      },
    });

    if (conflict) {
      throw new BadRequestException('Mapping already exists for this partner and transaction type');
    }

    return this.prisma.ediTransactionMapping.create({
      data: {
        tenantId,
        tradingPartnerId: dto.tradingPartnerId,
        transactionType: dto.transactionType,
        fieldMappings: dto.fieldMappings as Prisma.JsonValue,
        defaultValues: dto.defaultValues ?? null,
        transformRules: dto.transformRules ?? null,
        validationRules: dto.validationRules ?? null,
        isActive: dto.isActive ?? true,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.requireMapping(tenantId, id);
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateEdiMappingDto) {
    await this.requireMapping(tenantId, id);

    return this.prisma.ediTransactionMapping.update({
      where: { id },
      data: {
        ...(dto.fieldMappings !== undefined ? { fieldMappings: dto.fieldMappings as Prisma.JsonValue } : {}),
        ...(dto.defaultValues !== undefined ? { defaultValues: dto.defaultValues as Prisma.JsonValue } : {}),
        ...(dto.transformRules !== undefined ? { transformRules: dto.transformRules as Prisma.JsonValue } : {}),
        ...(dto.validationRules !== undefined ? { validationRules: dto.validationRules as Prisma.JsonValue } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        updatedById: userId,
      },
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    await this.requireMapping(tenantId, id);
    await this.prisma.ediTransactionMapping.update({ where: { id }, data: { deletedAt: new Date(), updatedById: userId, isActive: false } });
    return { success: true };
  }

  private async requireMapping(tenantId: string, id: string) {
    const mapping = await this.prisma.ediTransactionMapping.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!mapping) {
      throw new NotFoundException('EDI mapping not found');
    }
    return mapping;
  }
}
