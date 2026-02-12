import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  private isMissingTableError(error: unknown): boolean {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const meta = error.meta as { code?: string; message?: string } | undefined;
      if (meta?.code === '42P01') return true;
      if (typeof meta?.message === 'string' && meta.message.includes('does not exist')) return true;
    }
    if (error instanceof Error && error.message.includes('does not exist')) return true;
    return false;
  }

  private async queryWithTableFallback<T>(
    tables: string[],
    build: (table: Prisma.Sql) => Prisma.Sql
  ): Promise<T> {
    let lastError: unknown;
    for (const tableName of tables) {
      try {
        const sql = build(Prisma.raw(tableName));
        return await this.prisma.$queryRaw<T>(sql);
      } catch (error) {
        lastError = error;
        if (!this.isMissingTableError(error)) {
          break;
        }
      }
    }
    throw lastError;
  }

  async getMakes() {
    try {
      const rows = await this.queryWithTableFallback<unknown[]>(
        ['makes', 'equipment_makes'],
        (table) => Prisma.sql`
          SELECT *
          FROM ${table}
          ORDER BY popularity_rank ASC NULLS LAST, name ASC
        `
      );
      return (rows || []).map((row: any) => ({
        ...row,
        popularity_rank: row.popularity_rank != null ? Number(row.popularity_rank) : null,
      }));
    } catch (error) {
      if (this.isMissingTableError(error)) return [];
      throw new InternalServerErrorException('Failed to load equipment makes');
    }
  }

  async getModels(makeId: string) {
    try {
      const rows = await this.queryWithTableFallback<unknown[]>(
        ['models', 'equipment_models'],
        (table) => Prisma.sql`
          SELECT *
          FROM ${table}
          WHERE make_id::text = ${makeId}
          ORDER BY name ASC
        `
      );
      return rows;
    } catch (error) {
      if (this.isMissingTableError(error)) return [];
      throw new InternalServerErrorException('Failed to load equipment models');
    }
  }

  async getModelsWithAvailability(makeId: string, location?: string) {
    try {
      const models = await this.queryWithTableFallback<Array<{ id: string; name: string; make_id: string }>>(
        ['models', 'equipment_models'],
        (table) => Prisma.sql`
          SELECT id, name, make_id
          FROM ${table}
          WHERE make_id::text = ${makeId}
          ORDER BY name ASC
        `
      );

      if (!models || models.length === 0) return [];

      const modelIds = models.map((m) => m.id);

      const dimensions = await this.prisma.$queryRaw<Array<{ model_id: string }>>(Prisma.sql`
        SELECT model_id
        FROM equipment_dimensions
        WHERE model_id IN (${Prisma.join(modelIds)})
      `);
      const dimensionModelIds = new Set((dimensions || []).map((d) => d.model_id));

      const rates = location
        ? await this.prisma.$queryRaw<Array<{ model_id: string }>>(Prisma.sql`
            SELECT model_id
            FROM rates
            WHERE model_id IN (${Prisma.join(modelIds)}) AND location = ${location}
          `)
        : await this.prisma.$queryRaw<Array<{ model_id: string }>>(Prisma.sql`
            SELECT model_id
            FROM rates
            WHERE model_id IN (${Prisma.join(modelIds)})
          `);

      const rateModelIds = new Set((rates || []).map((r) => r.model_id));

      return models.map((model) => ({
        ...model,
        has_dimensions: dimensionModelIds.has(model.id),
        has_rates: rateModelIds.has(model.id),
      }));
    } catch (error) {
      if (this.isMissingTableError(error)) return [];
      throw new InternalServerErrorException('Failed to load equipment models availability');
    }
  }

  private toNumber(val: unknown): number | null {
    if (val === null || val === undefined) return null;
    return Number(val);
  }

  async getDimensions(modelId: string) {
    try {
      const rows = await this.prisma.$queryRaw<unknown[]>(Prisma.sql`
        SELECT
          id,
          model_id,
          length_inches AS length,
          width_inches AS width,
          height_inches AS height,
          weight_lbs AS weight,
          front_image_url,
          side_image_url
        FROM equipment_dimensions
        WHERE model_id::text = ${modelId}
        LIMIT 1
      `);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      return {
        ...row,
        length: this.toNumber(row.length),
        width: this.toNumber(row.width),
        height: this.toNumber(row.height),
        weight: this.toNumber(row.weight),
      };
    } catch (error) {
      if (this.isMissingTableError(error)) return null;
      throw new InternalServerErrorException('Failed to load equipment dimensions');
    }
  }

  async getRates(modelId: string, location: string) {
    try {
      const rows = await this.prisma.$queryRaw<unknown[]>(Prisma.sql`
        SELECT *
        FROM rates
        WHERE model_id::text = ${modelId} AND location = ${location}
        LIMIT 1
      `);
      return rows[0] ?? null;
    } catch (error) {
      if (this.isMissingTableError(error)) return null;
      throw new InternalServerErrorException('Failed to load equipment rates');
    }
  }

  async getAllRatesForModel(modelId: string) {
    try {
      return await this.prisma.$queryRaw<unknown[]>(Prisma.sql`
        SELECT *
        FROM rates
        WHERE model_id::text = ${modelId}
      `);
    } catch (error) {
      if (this.isMissingTableError(error)) return [];
      throw new InternalServerErrorException('Failed to load equipment rates');
    }
  }

  async search(query: string) {
    try {
      const attempts: Array<{ makeTable: string; modelTable: string }> = [
        { makeTable: 'makes', modelTable: 'models' },
        { makeTable: 'equipment_makes', modelTable: 'equipment_models' },
      ];

      let lastError: unknown;

      for (const attempt of attempts) {
        try {
          const makes = await this.prisma.$queryRaw<unknown[]>(Prisma.sql`
            SELECT id, name
            FROM ${Prisma.raw(attempt.makeTable)}
            WHERE name ILIKE ${'%' + query + '%'}
            LIMIT 5
          `);

          const models = await this.prisma.$queryRaw<unknown[]>(Prisma.sql`
            SELECT m.id, m.name, m.make_id, mk.name as make_name
            FROM ${Prisma.raw(attempt.modelTable)} m
            LEFT JOIN ${Prisma.raw(attempt.makeTable)} mk ON mk.id = m.make_id
            WHERE m.name ILIKE ${'%' + query + '%'}
            LIMIT 10
          `);

          return { makes: makes || [], models: models || [] };
        } catch (error) {
          lastError = error;
          if (!this.isMissingTableError(error)) {
            break;
          }
        }
      }

      if (this.isMissingTableError(lastError)) return { makes: [], models: [] };
      throw lastError;
    } catch (error) {
      if (this.isMissingTableError(error)) return { makes: [], models: [] };
      throw new InternalServerErrorException('Failed to search equipment');
    }
  }

  async updateImages(modelId: string, frontImageUrl?: string | null, sideImageUrl?: string | null) {
    try {
      let updateSet: Prisma.Sql | null = null;

      if (frontImageUrl !== undefined && sideImageUrl !== undefined) {
        updateSet = Prisma.sql`front_image_url = ${frontImageUrl}, side_image_url = ${sideImageUrl}`;
      } else if (frontImageUrl !== undefined) {
        updateSet = Prisma.sql`front_image_url = ${frontImageUrl}`;
      } else if (sideImageUrl !== undefined) {
        updateSet = Prisma.sql`side_image_url = ${sideImageUrl}`;
      }

      if (!updateSet) {
        return { success: true };
      }

      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE equipment_dimensions
        SET ${updateSet}
        WHERE model_id::text = ${modelId}
      `);

      return { success: true };
    } catch (_error) {
      throw new InternalServerErrorException('Failed to update equipment images');
    }
  }
}
