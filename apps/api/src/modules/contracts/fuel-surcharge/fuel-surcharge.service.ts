import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateFuelTableDto } from './dto/create-fuel-table.dto';
import { UpdateFuelTableDto } from './dto/update-fuel-table.dto';
import { CreateFuelTierDto } from './dto/create-fuel-tier.dto';
import { UpdateFuelTierDto } from './dto/update-fuel-tier.dto';
import { CalculateFuelSurchargeDto } from './dto/calculate-fuel-surcharge.dto';

@Injectable()
export class FuelSurchargeService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.fuelSurchargeTable.findMany({ where: { tenantId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  create(tenantId: string, userId: string, dto: CreateFuelTableDto) {
    return this.prisma.fuelSurchargeTable.create({
      data: {
        tenantId,
        contractId: dto.contractId ?? null,
        name: dto.name,
        description: dto.description,
        basePrice: dto.basePrice,
        isDefault: dto.isDefault ?? false,
        effectiveDate: new Date(dto.effectiveDate),
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        status: dto.status ?? 'ACTIVE',
        createdById: userId,
      },
    });
  }

  async detail(tenantId: string, id: string) {
    const table = await this.prisma.fuelSurchargeTable.findFirst({ where: { id, tenantId, deletedAt: null }, include: { tiers: true } });
    if (!table) throw new NotFoundException('Fuel table not found');
    return table;
  }

  async update(tenantId: string, id: string, dto: UpdateFuelTableDto) {
    await this.detail(tenantId, id);
    return this.prisma.fuelSurchargeTable.update({ where: { id }, data: dto });
  }

  async delete(tenantId: string, id: string) {
    await this.detail(tenantId, id);
    await this.prisma.fuelSurchargeTable.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    return { success: true };
  }

  async listTiers(tenantId: string, tableId: string) {
    await this.detail(tenantId, tableId);
    return this.prisma.fuelSurchargeTier.findMany({ where: { tableId }, orderBy: { tierNumber: 'asc' } });
  }

  async addTier(tenantId: string, tableId: string, userId: string, dto: CreateFuelTierDto) {
    await this.detail(tenantId, tableId);
    return this.prisma.fuelSurchargeTier.create({
      data: {
        tableId,
        tierNumber: dto.tierNumber,
        priceMin: dto.priceMin,
        priceMax: dto.priceMax ?? null,
        surchargePercent: dto.surchargePercent,
        createdById: userId,
      },
    });
  }

  async updateTier(tenantId: string, tierId: string, dto: UpdateFuelTierDto) {
    const tier = await this.prisma.fuelSurchargeTier.findFirst({ where: { id: tierId, table: { tenantId }, deletedAt: null } });
    if (!tier) throw new NotFoundException('Tier not found');
    return this.prisma.fuelSurchargeTier.update({ where: { id: tierId }, data: dto });
  }

  async calculate(tenantId: string, dto: CalculateFuelSurchargeDto) {
    const table = await this.detail(tenantId, dto.fuelTableId);
    const tier = table.tiers.find((t) => {
      const withinMin = dto.currentFuelPrice >= Number(t.priceMin);
      const withinMax = t.priceMax ? dto.currentFuelPrice <= Number(t.priceMax) : true;
      return withinMin && withinMax;
    });
    if (!tier) throw new NotFoundException('No tier found for current fuel price');
    const surchargePercent = Number(tier.surchargePercent);
    const surchargeAmount = dto.lineHaulAmount * (surchargePercent / 100);
    return {
      tableId: table.id,
      surchargePercent,
      surchargeAmount,
      currency: 'USD',
    };
  }
}
