import { Prisma, PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type EquipmentMakeSeed = {
  name: string;
  popularityRank: number;
};

type EquipmentModelSeed = {
  name: string;
  makeName: string;
  dimensions?: {
    lengthInches: number;
    widthInches: number;
    heightInches: number;
    weightLbs: number;
    frontImageUrl?: string;
    sideImageUrl?: string;
  };
};

const makeSeeds: EquipmentMakeSeed[] = [
  { name: 'Caterpillar', popularityRank: 1 },
  { name: 'John Deere', popularityRank: 2 },
  { name: 'Komatsu', popularityRank: 3 },
];

const modelSeeds: EquipmentModelSeed[] = [
  {
    name: 'D6T',
    makeName: 'Caterpillar',
    dimensions: {
      lengthInches: 234,
      widthInches: 120,
      heightInches: 132,
      weightLbs: 48500,
    },
  },
  {
    name: '320 Excavator',
    makeName: 'Caterpillar',
    dimensions: {
      lengthInches: 279,
      widthInches: 119,
      heightInches: 120,
      weightLbs: 48700,
    },
  },
  {
    name: '310L',
    makeName: 'John Deere',
    dimensions: {
      lengthInches: 280,
      widthInches: 102,
      heightInches: 120,
      weightLbs: 39000,
    },
  },
  {
    name: 'D155AX',
    makeName: 'Komatsu',
    dimensions: {
      lengthInches: 273,
      widthInches: 124,
      heightInches: 132,
      weightLbs: 89700,
    },
  },
];

const rateLocations = ['Houston', 'New Jersey'] as const;

const normalizeSql = (raw: string) => raw
  .split('\n')
  .filter((line) => !line.trim().startsWith('```'))
  .join('\n')
  .trim();

const ensureOnConflictDoNothing = (sql: string, tableName: string) => {
  const insertPrefix = `INSERT INTO "public"."${tableName}"`;
  if (!sql.startsWith(insertPrefix) || /ON CONFLICT/i.test(sql)) return sql;
  const trimmed = sql.trim().replace(/;\s*$/g, '');
  return `${trimmed} ON CONFLICT DO NOTHING;`;
};

const readSqlIfPresent = async (filePath: string): Promise<string> => {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return normalizeSql(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('no such file or directory') || message.includes('ENOENT')) {
      return '';
    }
    throw error;
  }
};

export async function seedEquipment(prisma: PrismaClient): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
  const makesSqlPath = path.join(repoRoot, 'dev_docs', 'makes_rows.sql');
  const modelsSqlPath = path.join(repoRoot, 'dev_docs', 'models_rows.sql');

  const makesSqlRaw = await readSqlIfPresent(makesSqlPath);
  const modelsSqlRaw = await readSqlIfPresent(modelsSqlPath);

  if (makesSqlRaw && modelsSqlRaw) {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE rates, equipment_dimensions, models, makes RESTART IDENTITY CASCADE;'
    );
    await prisma.$executeRawUnsafe(makesSqlRaw);
    await prisma.$executeRawUnsafe(modelsSqlRaw);
  } else if (makesSqlRaw) {
    const makesSql = ensureOnConflictDoNothing(makesSqlRaw, 'makes');
    await prisma.$executeRawUnsafe(makesSql);
  } else if (modelsSqlRaw) {
    const modelsSql = ensureOnConflictDoNothing(modelsSqlRaw, 'models');
    await prisma.$executeRawUnsafe(modelsSql);
  }

  for (const make of makeSeeds) {
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO makes (name, popularity_rank)
        VALUES (${make.name}, ${make.popularityRank})
        ON CONFLICT (name)
        DO UPDATE SET popularity_rank = EXCLUDED.popularity_rank
      `
    );
  }

  const makeNames = makeSeeds.map((make) => make.name);
  const makes = await prisma.$queryRaw<Array<{ id: string; name: string }>>(
    Prisma.sql`
      SELECT id, name FROM makes WHERE name IN (${Prisma.join(makeNames)})
    `
  );

  for (const model of modelSeeds) {
    const make = makes.find((item) => item.name === model.makeName);
    if (!make) continue;

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO models (make_id, name)
        VALUES (CAST(${make.id} AS uuid), ${model.name})
        ON CONFLICT (make_id, name)
        DO NOTHING
      `
    );
  }

  const modelNames = modelSeeds.map((model) => model.name);
  const models = await prisma.$queryRaw<Array<{ id: string; name: string; make_id: string }>>(
    Prisma.sql`
      SELECT id, name, make_id FROM models WHERE name IN (${Prisma.join(modelNames)})
    `
  );

  for (const model of modelSeeds) {
    const dbModel = models.find((item) => item.name === model.name);
    if (!dbModel || !model.dimensions) continue;

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO equipment_dimensions (
          model_id,
          length_inches,
          width_inches,
          height_inches,
          weight_lbs,
          front_image_url,
          side_image_url
        )
        VALUES (
          CAST(${dbModel.id} AS uuid),
          ${model.dimensions.lengthInches},
          ${model.dimensions.widthInches},
          ${model.dimensions.heightInches},
          ${model.dimensions.weightLbs},
          ${model.dimensions.frontImageUrl || null},
          ${model.dimensions.sideImageUrl || null}
        )
        ON CONFLICT (model_id)
        DO UPDATE SET
          length_inches = EXCLUDED.length_inches,
          width_inches = EXCLUDED.width_inches,
          height_inches = EXCLUDED.height_inches,
          weight_lbs = EXCLUDED.weight_lbs,
          front_image_url = EXCLUDED.front_image_url,
          side_image_url = EXCLUDED.side_image_url
      `
    );

    for (const location of rateLocations) {
      await prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO rates (
            make_id,
            model_id,
            location,
            dismantling_loading_cost,
            loading_cost,
            blocking_bracing_cost,
            rigging_cost,
            storage_cost,
            transport_cost,
            equipment_cost,
            labor_cost,
            permit_cost,
            escort_cost,
            miscellaneous_cost
          )
          VALUES (
            CAST(${dbModel.make_id} AS uuid),
            CAST(${dbModel.id} AS uuid),
            ${location},
            25000,
            18000,
            12000,
            15000,
            8000,
            90000,
            20000,
            16000,
            10000,
            12000,
            7000
          )
          ON CONFLICT (model_id, location)
          DO UPDATE SET
            dismantling_loading_cost = EXCLUDED.dismantling_loading_cost,
            loading_cost = EXCLUDED.loading_cost,
            blocking_bracing_cost = EXCLUDED.blocking_bracing_cost,
            rigging_cost = EXCLUDED.rigging_cost,
            storage_cost = EXCLUDED.storage_cost,
            transport_cost = EXCLUDED.transport_cost,
            equipment_cost = EXCLUDED.equipment_cost,
            labor_cost = EXCLUDED.labor_cost,
            permit_cost = EXCLUDED.permit_cost,
            escort_cost = EXCLUDED.escort_cost,
            miscellaneous_cost = EXCLUDED.miscellaneous_cost
        `
      );
    }
  }
}