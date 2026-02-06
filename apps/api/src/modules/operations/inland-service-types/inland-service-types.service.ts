import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

interface InlandServiceTypeRow {
  id: string;
  name: string;
  description: string | null;
  default_rate_cents: number;
  billing_unit: string;
  sort_order: number;
  is_active: boolean;
}

@Injectable()
export class InlandServiceTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.$queryRaw<InlandServiceTypeRow[]>(Prisma.sql`
      SELECT
        id,
        name,
        description,
        default_rate_cents,
        billing_unit,
        sort_order,
        is_active
      FROM "public"."inland_service_types"
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `);

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      defaultRateCents: Number(row.default_rate_cents) || 0,
      billingUnit: row.billing_unit,
      sortOrder: Number(row.sort_order) || 0,
      isActive: row.is_active,
    }));
  }
}
