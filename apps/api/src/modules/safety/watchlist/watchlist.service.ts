import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { ResolveWatchlistDto } from './dto/resolve-watchlist.dto';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.carrierWatchlist.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, userId: string, dto: CreateWatchlistDto) {
    await this.requireCarrier(tenantId, dto.carrierId);
    return this.prisma.carrierWatchlist.create({
      data: {
        tenantId,
        carrierId: dto.carrierId,
        reason: dto.reason,
        riskLevel: dto.riskLevel,
        isRestricted: dto.isRestricted ?? false,
        restrictions: dto.restrictions,
        nextReviewDate: dto.nextReviewDate,
        reviewFrequencyDays: dto.reviewFrequencyDays,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateWatchlistDto) {
    const record = await this.get(tenantId, id);
    return this.prisma.carrierWatchlist.update({
      where: { id: record.id },
      data: {
        ...(dto.reason !== undefined ? { reason: dto.reason } : {}),
        ...(dto.riskLevel !== undefined ? { riskLevel: dto.riskLevel } : {}),
        ...(dto.isRestricted !== undefined ? { isRestricted: dto.isRestricted } : {}),
        ...(dto.restrictions !== undefined ? { restrictions: dto.restrictions } : {}),
        ...(dto.nextReviewDate !== undefined ? { nextReviewDate: dto.nextReviewDate } : {}),
        ...(dto.reviewFrequencyDays !== undefined ? { reviewFrequencyDays: dto.reviewFrequencyDays } : {}),
        updatedById: userId,
      },
    });
  }

  async resolve(tenantId: string, userId: string, id: string, dto: ResolveWatchlistDto) {
    const record = await this.get(tenantId, id);
    return this.prisma.carrierWatchlist.update({
      where: { id: record.id },
      data: {
        isActive: false,
        resolvedAt: new Date(),
        resolvedById: userId,
        resolutionNotes: dto.resolutionNotes,
        updatedById: userId,
      },
    });
  }

  async get(tenantId: string, id: string) {
    const record = await this.prisma.carrierWatchlist.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!record) {
      throw new NotFoundException('Watchlist entry not found');
    }
    return record;
  }

  private async requireCarrier(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id: carrierId, tenantId, deletedAt: null } });
    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }
    return carrier;
  }
}
