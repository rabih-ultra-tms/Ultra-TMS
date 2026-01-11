import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateClaimItemDto } from './dto/create-claim-item.dto';
import { UpdateClaimItemDto } from './dto/update-claim-item.dto';

@Injectable()
export class ClaimItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, claimId: string) {
    await this.ensureClaim(tenantId, claimId);

    return this.prisma.claimItem.findMany({
      where: { tenantId, claimId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, claimId: string, itemId: string) {
    await this.ensureClaim(tenantId, claimId);

    const item = await this.prisma.claimItem.findFirst({
      where: { id: itemId, claimId, tenantId, deletedAt: null },
    });

    if (!item) {
      throw new NotFoundException('Claim item not found');
    }

    return item;
  }

  async create(tenantId: string, userId: string, claimId: string, dto: CreateClaimItemDto) {
    await this.ensureClaim(tenantId, claimId);

    const item = await this.prisma.claimItem.create({
      data: {
        tenantId,
        claimId,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        totalValue: dto.totalValue ?? dto.quantity * dto.unitPrice,
        damageType: dto.damageType,
        damageExtent: dto.damageExtent,
        createdById: userId,
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'ITEM_ADDED',
      `Item added: ${dto.description}`,
      {
        itemId: item.id,
        description: item.description,
        totalValue: Number(item.totalValue),
      },
      userId,
    );

    return item;
  }

  async update(
    tenantId: string,
    userId: string,
    claimId: string,
    itemId: string,
    dto: UpdateClaimItemDto,
  ) {
    const item = await this.findOne(tenantId, claimId, itemId);

    const data: Prisma.ClaimItemUpdateInput = {
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
      ...(dto.unitPrice !== undefined ? { unitPrice: dto.unitPrice } : {}),
      ...(dto.totalValue !== undefined
        ? { totalValue: dto.totalValue }
        : dto.quantity !== undefined || dto.unitPrice !== undefined
          ? { totalValue: (dto.quantity ?? item.quantity) * (dto.unitPrice ?? Number(item.unitPrice)) }
          : {}),
      ...(dto.damageType !== undefined ? { damageType: dto.damageType } : {}),
      ...(dto.damageExtent !== undefined ? { damageExtent: dto.damageExtent } : {}),
      updatedById: userId,
    };

    const updated = await this.prisma.claimItem.update({
      where: { id: item.id },
      data,
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'ITEM_UPDATED',
      `Item updated: ${item.description}`,
      {
        itemId: item.id,
        updatedFields: Object.keys(data),
      },
      userId,
    );

    return updated;
  }

  async remove(tenantId: string, userId: string, claimId: string, itemId: string) {
    await this.findOne(tenantId, claimId, itemId);

    await this.prisma.claimItem.update({
      where: { id: itemId },
      data: {
        deletedAt: new Date(),
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'ITEM_REMOVED',
      `Item removed: ${itemId}`,
      { itemId },
      userId,
    );

    return { success: true };
  }

  private async ensureClaim(tenantId: string, claimId: string) {
    const exists = await this.prisma.claim.count({
      where: { id: claimId, tenantId, deletedAt: null },
    });

    if (exists === 0) {
      throw new NotFoundException('Claim not found');
    }
  }

  private async recordTimeline(
    tenantId: string,
    claimId: string,
    eventType: string,
    description?: string,
    eventData?: Prisma.InputJsonValue,
    userId?: string,
  ) {
    await this.prisma.claimTimeline.create({
      data: {
        tenantId,
        claimId,
        eventType,
        description,
        eventData,
        createdById: userId,
        updatedById: userId,
      },
    });
  }
}
