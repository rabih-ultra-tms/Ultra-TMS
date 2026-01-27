import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class TruckTypesService {
  constructor(private prisma: PrismaService) {}

  async list(category?: string) {
    const where: Prisma.TruckTypeWhereInput = {};

    if (category) {
      where.category = category;
    }

    return this.prisma.truckType.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    return this.prisma.truckType.findUnique({
      where: { id },
    });
  }

  async getCategories() {
    const types = await this.prisma.truckType.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return types.map((t: any) => t.category);
  }
}
