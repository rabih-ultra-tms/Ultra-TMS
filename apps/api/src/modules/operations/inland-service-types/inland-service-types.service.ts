import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class InlandServiceTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.inlandServiceType.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      defaultRateCents: row.defaultRateCents,
      billingUnit: row.billingUnit,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    }));
  }
}
