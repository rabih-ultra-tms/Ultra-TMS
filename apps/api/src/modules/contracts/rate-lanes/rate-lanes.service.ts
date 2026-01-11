import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateRateLaneDto } from './dto/create-rate-lane.dto';
import { UpdateRateLaneDto } from './dto/update-rate-lane.dto';

@Injectable()
export class RateLanesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, rateTableId: string) {
    await this.ensureRateTable(rateTableId, tenantId);
    return this.prisma.contractRateLane.findMany({ where: { tenantId, rateTableId }, orderBy: { origin: 'asc' } });
  }

  async create(tenantId: string, rateTableId: string, userId: string, dto: CreateRateLaneDto) {
    await this.ensureRateTable(rateTableId, tenantId);
    return this.prisma.contractRateLane.create({
      data: {
        tenantId,
        rateTableId,
        originCity: dto.originCity,
        originState: dto.originState,
        originZip: dto.originZip,
        destCity: dto.destCity,
        destState: dto.destState,
        destZip: dto.destZip,
        equipmentType: dto.equipmentType,
        rateAmount: dto.rateAmount,
        rateType: dto.rateType,
        currency: dto.currency ?? 'USD',
        fuelSurchargeTableId: dto.fuelSurchargeTableId,
        createdById: userId,
      },
    });
  }

  async detail(id: string, tenantId: string) {
    const lane = await this.prisma.contractRateLane.findFirst({ where: { id, tenantId } });
    if (!lane) throw new NotFoundException('Rate lane not found');
    return lane;
  }

  async update(id: string, tenantId: string, dto: UpdateRateLaneDto) {
    await this.detail(id, tenantId);
    return this.prisma.contractRateLane.update({ where: { id }, data: dto });
  }

  async delete(id: string, tenantId: string) {
    await this.detail(id, tenantId);
    await this.prisma.contractRateLane.delete({ where: { id } });
    return { success: true };
  }

  private async ensureRateTable(rateTableId: string, tenantId: string) {
    const rt = await this.prisma.contractRateTable.findFirst({ where: { id: rateTableId, tenantId, deletedAt: null } });
    if (!rt) throw new NotFoundException('Rate table not found');
    return rt;
  }
}
