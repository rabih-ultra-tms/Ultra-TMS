import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateTruckTypeDto, UpdateTruckTypeDto } from './truck-types.dto';

interface ListParams {
  category?: string;
  loadingMethod?: string;
  includeInactive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TruckTypesService {
  constructor(private prisma: PrismaService) {}

  private mapTruckType(record: any) {
    if (!record) return record;

    return {
      ...record,
      deckLengthFt: Number(record.deckLengthFt),
      deckWidthFt: Number(record.deckWidthFt),
      deckHeightFt: Number(record.deckHeightFt),
      wellLengthFt: record.wellLengthFt == null ? null : Number(record.wellLengthFt),
      wellHeightFt: record.wellHeightFt == null ? null : Number(record.wellHeightFt),
      maxLegalCargoHeightFt: record.maxLegalCargoHeightFt == null ? null : Number(record.maxLegalCargoHeightFt),
      maxLegalCargoWidthFt: record.maxLegalCargoWidthFt == null ? null : Number(record.maxLegalCargoWidthFt),
    };
  }

  async list(params?: ListParams) {
    const {
      category,
      loadingMethod,
      includeInactive = false,
      search,
      page = 1,
      limit = 100,
    } = params || {};

    const where: Prisma.TruckTypeWhereInput = {
      deletedAt: null,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    if (category) {
      where.category = category;
    }

    if (loadingMethod) {
      where.loadingMethod = loadingMethod;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.truckType.findMany({
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.truckType.count({ where }),
    ]);

    return {
      data: data.map((record) => this.mapTruckType(record)),
      total,
      page,
      limit,
    };
  }

  async getById(id: string) {
    const truckType = await this.prisma.truckType.findUnique({
      where: { id },
    });

    if (!truckType || truckType.deletedAt) {
      throw new NotFoundException('Truck type not found');
    }

    return this.mapTruckType(truckType);
  }

  async getCategories() {
    const types = await this.prisma.truckType.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return types.map((t: any) => t.category);
  }

  async getCategoryCounts() {
    const types = await this.prisma.truckType.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: { category: true },
    });

    const counts: Record<string, number> = {};
    for (const type of types) {
      counts[type.category] = (counts[type.category] || 0) + 1;
    }

    return counts;
  }

  async create(data: CreateTruckTypeDto) {
    const created = await this.prisma.truckType.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description || null,
        deckHeightFt: data.deckHeightFt,
        deckLengthFt: data.deckLengthFt,
        deckWidthFt: data.deckWidthFt || 8.5,
        wellLengthFt: data.wellLengthFt || 0,
        wellHeightFt: data.wellHeightFt || null,
        maxCargoWeightLbs: data.maxCargoWeightLbs,
        tareWeightLbs: data.tareWeightLbs || null,
        maxLegalCargoHeightFt: data.maxLegalCargoHeightFt || null,
        maxLegalCargoWidthFt: data.maxLegalCargoWidthFt || null,
        features: data.features || [],
        bestFor: data.bestFor || [],
        loadingMethod: data.loadingMethod || null,
        imageUrl: null,
        isActive: data.isActive ?? true,
        baseRateCents: data.baseRateCents || null,
        ratePerMileCents: data.ratePerMileCents || null,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return this.mapTruckType(created);
  }

  async update(id: string, data: UpdateTruckTypeDto) {
    const existing = await this.getById(id);

    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    
    // Handle Decimal fields - only update if provided and not null for required fields
    if (data.deckHeightFt !== undefined && data.deckHeightFt !== null) updateData.deckHeightFt = data.deckHeightFt;
    if (data.deckLengthFt !== undefined && data.deckLengthFt !== null) updateData.deckLengthFt = data.deckLengthFt;
    if (data.deckWidthFt !== undefined && data.deckWidthFt !== null) updateData.deckWidthFt = data.deckWidthFt;
    if (data.wellLengthFt !== undefined) updateData.wellLengthFt = data.wellLengthFt ?? 0;
    if (data.wellHeightFt !== undefined) updateData.wellHeightFt = data.wellHeightFt ?? null;
    if (data.maxLegalCargoHeightFt !== undefined) updateData.maxLegalCargoHeightFt = data.maxLegalCargoHeightFt ?? null;
    if (data.maxLegalCargoWidthFt !== undefined) updateData.maxLegalCargoWidthFt = data.maxLegalCargoWidthFt ?? null;
    
    // Handle integer fields
    if (data.maxCargoWeightLbs !== undefined) updateData.maxCargoWeightLbs = data.maxCargoWeightLbs;
    if (data.tareWeightLbs !== undefined) updateData.tareWeightLbs = data.tareWeightLbs ?? null;
    if (data.baseRateCents !== undefined) updateData.baseRateCents = data.baseRateCents ?? null;
    if (data.ratePerMileCents !== undefined) updateData.ratePerMileCents = data.ratePerMileCents ?? null;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    
    // Handle array fields
    if (data.features !== undefined) updateData.features = data.features || [];
    if (data.bestFor !== undefined) updateData.bestFor = data.bestFor || [];
    
    // Handle other fields
    if (data.loadingMethod !== undefined) updateData.loadingMethod = data.loadingMethod ?? null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await this.prisma.truckType.update({
      where: { id },
      data: updateData,
    });

    return this.mapTruckType(updated);
  }

  async delete(id: string) {
    const existing = await this.getById(id);

    // Soft delete
    return this.prisma.truckType.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    return this.prisma.truckType.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });
  }
}
