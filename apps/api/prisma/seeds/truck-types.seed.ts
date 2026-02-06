import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const prisma = new PrismaClient();

type LegacyTruck = {
  name: string;
  category: string;
  description?: string;
  deckLength: number;
  deckWidth: number;
  deckHeight: number;
  wellLength?: number;
  wellHeight?: number;
  maxCargoWeight: number;
  maxLegalCargoHeight?: number;
  maxLegalCargoWidth?: number;
  features?: string[];
  bestFor?: string[];
  loadingMethod?: string;
  tareWeight?: number;
  imageUrl?: string;
};

const LEGAL_MAX_HEIGHT_FT = 13.5;
const LEGAL_MAX_WIDTH_FT = 8.5;

const normalizeSql = (raw: string) => raw
  .split('\n')
  .filter((line) => !line.trim().startsWith('```'))
  .join('\n')
  .trim();

const columnMap: Record<string, string> = {
  id: 'id',
  name: 'name',
  category: 'category',
  description: 'description',
  deck_height_ft: 'deckHeightFt',
  deck_length_ft: 'deckLengthFt',
  deck_width_ft: 'deckWidthFt',
  well_length_ft: 'wellLengthFt',
  well_height_ft: 'wellHeightFt',
  max_cargo_weight_lbs: 'maxCargoWeightLbs',
  tare_weight_lbs: 'tareWeightLbs',
  max_legal_cargo_height_ft: 'maxLegalCargoHeightFt',
  max_legal_cargo_width_ft: 'maxLegalCargoWidthFt',
  features: 'features',
  best_for: 'bestFor',
  loading_method: 'loadingMethod',
  is_active: 'isActive',
  base_rate_cents: 'baseRateCents',
  rate_per_mile_cents: 'ratePerMileCents',
  sort_order: 'sortOrder',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

const parseArrayValues = (raw: string): string[] => {
  const inner = raw.replace(/^ARRAY\[/i, '').replace(/\]$/i, '').trim();
  if (!inner) return [];

  const values: string[] = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    const next = inner[i + 1];

    if (inSingle) {
      if (char === "'" && next === "'") {
        current += "'";
        i++;
        continue;
      }
      if (char === "'") {
        inSingle = false;
        continue;
      }
      current += char;
      continue;
    }

    if (inDouble) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
        continue;
      }
      if (char === '"') {
        inDouble = false;
        continue;
      }
      current += char;
      continue;
    }

    if (char === "'") {
      inSingle = true;
      continue;
    }
    if (char === '"') {
      inDouble = true;
      continue;
    }
    if (char === ',') {
      const trimmed = current.trim();
      if (trimmed) values.push(trimmed);
      current = '';
      continue;
    }

    current += char;
  }

  const trimmed = current.trim();
  if (trimmed) values.push(trimmed);

  return values.map((value) => value.trim());
};

const parseValue = (raw: string): unknown => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^null$/i.test(trimmed)) return null;
  if (/^true$/i.test(trimmed)) return true;
  if (/^false$/i.test(trimmed)) return false;

  if (/^ARRAY\[/i.test(trimmed)) {
    return parseArrayValues(trimmed);
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    const inner = trimmed.slice(1, -1).replace(/''/g, "'");
    return inner;
  }

  const numberValue = Number(trimmed);
  if (!Number.isNaN(numberValue)) return numberValue;

  return trimmed;
};

const parseTruckTypesSql = (raw: string) => {
  const normalized = normalizeSql(raw);
  const columnMatch = normalized.match(/\(([^)]+)\)\s+VALUES\s*/i);
  if (!columnMatch) return { columns: [], rows: [] as string[][] };

  const columns = columnMatch[1]
    .split(',')
    .map((col) => col.trim().replace(/^"|"$/g, ''))
    .map((col) => columnMap[col] || col);

  const valuesStart = normalized.toUpperCase().indexOf('VALUES');
  let valuesPart = valuesStart >= 0 ? normalized.slice(valuesStart + 6).trim() : '';
  valuesPart = valuesPart.replace(/;\s*$/g, '');

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let inSingle = false;
  let inDouble = false;
  let parenDepth = 0;
  let bracketDepth = 0;

  for (let i = 0; i < valuesPart.length; i++) {
    const char = valuesPart[i];
    const next = valuesPart[i + 1];

    if (inSingle) {
      currentValue += char;
      if (char === "'" && next === "'") {
        currentValue += next;
        i++;
        continue;
      }
      if (char === "'") {
        inSingle = false;
      }
      continue;
    }

    if (inDouble) {
      currentValue += char;
      if (char === '"' && next === '"') {
        currentValue += next;
        i++;
        continue;
      }
      if (char === '"') {
        inDouble = false;
      }
      continue;
    }

    if (char === "'") {
      inSingle = true;
      currentValue += char;
      continue;
    }
    if (char === '"') {
      inDouble = true;
      currentValue += char;
      continue;
    }

    if (char === '[') {
      bracketDepth++;
      currentValue += char;
      continue;
    }
    if (char === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1);
      currentValue += char;
      continue;
    }

    if (char === '(') {
      if (parenDepth === 0) {
        currentRow = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
      parenDepth++;
      continue;
    }

    if (char === ')') {
      parenDepth--;
      if (parenDepth === 0) {
        currentRow.push(currentValue);
        rows.push(currentRow);
        currentRow = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
      continue;
    }

    if (char === ',' && parenDepth === 1 && bracketDepth === 0) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  return { columns, rows };
};

const intColumns = new Set([
  'maxCargoWeightLbs',
  'baseRateCents',
  'ratePerMileCents',
  'sortOrder',
  'tareWeightLbs',
]);

const decimalColumns = new Set([
  'deckLengthFt',
  'deckWidthFt',
  'deckHeightFt',
  'wellLengthFt',
  'wellHeightFt',
  'maxLegalCargoHeightFt',
  'maxLegalCargoWidthFt',
]);

const booleanColumns = new Set(['isActive']);
const omitColumns = new Set(['createdAt', 'updatedAt']);

const coerceValue = (column: string, value: unknown): unknown => {
  if (value === null || value === undefined) {
    if (column === 'wellLengthFt') return 0;
    return null;
  }

  if (intColumns.has(column)) {
    if (typeof value === 'number') return Math.trunc(value);
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.trim());
      return Number.isNaN(parsed) ? null : Math.trunc(parsed);
    }
    return null;
  }

  if (decimalColumns.has(column)) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.trim());
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  if (booleanColumns.has(column)) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (/^true$/i.test(value.trim())) return true;
      if (/^false$/i.test(value.trim())) return false;
    }
    return null;
  }

  return value;
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

const loadLegacyTrucks = async (): Promise<LegacyTruck[]> => {
  const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
  const trucksPath = path.join(
    repoRoot,
    'dev_docs',
    '11-ai-dev',
    'operations',
    'tmp_ops_src',
    'lib',
    'load-planner',
    'trucks.ts'
  );
  const moduleUrl = pathToFileURL(trucksPath).href;
  const module = await import(moduleUrl);
  return (module.trucks || []) as LegacyTruck[];
};

const mapTruckToSeed = (truck: LegacyTruck, sortOrder: number) => {
  const maxLegalCargoHeightFt = truck.maxLegalCargoHeight ?? Math.max(0, LEGAL_MAX_HEIGHT_FT - truck.deckHeight);
  const maxLegalCargoWidthFt = truck.maxLegalCargoWidth ?? LEGAL_MAX_WIDTH_FT;

  return {
    name: truck.name,
    category: truck.category,
    deckLengthFt: truck.deckLength,
    deckWidthFt: truck.deckWidth,
    deckHeightFt: truck.deckHeight,
    wellLengthFt: truck.wellLength ?? 0,
    wellHeightFt: truck.wellHeight ?? null,
    maxCargoWeightLbs: Math.round(truck.maxCargoWeight),
    description: truck.description ?? null,
    maxLegalCargoHeightFt,
    maxLegalCargoWidthFt,
    features: Array.isArray(truck.features) ? truck.features : [],
    bestFor: Array.isArray(truck.bestFor) ? truck.bestFor : [],
    loadingMethod: truck.loadingMethod ?? null,
    tareWeightLbs: truck.tareWeight ?? null,
    imageUrl: truck.imageUrl ?? null,
    baseRateCents: null,
    ratePerMileCents: null,
    isActive: true,
    sortOrder,
  };
};

async function seedTruckTypes() {
  console.log('🚚 Seeding truck types...');

  const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
  const sqlPath = path.join(repoRoot, 'dev_docs', 'truck_types_rows.sql');
  const truckTypesSqlRaw = await readSqlIfPresent(sqlPath);
  if (truckTypesSqlRaw) {
    const parsed = parseTruckTypesSql(truckTypesSqlRaw);
    if (parsed.rows.length > 0 && parsed.columns.length > 0) {
      await prisma.$executeRawUnsafe('TRUNCATE TABLE "TruckType" RESTART IDENTITY CASCADE;');

      const data = parsed.rows.map((row) => {
        const record: Record<string, unknown> = {};
        parsed.columns.forEach((col, idx) => {
          if (omitColumns.has(col)) return;
          const parsedValue = parseValue(row[idx] || '');
          record[col] = coerceValue(col, parsedValue);
        });
        return record;
      });

      await prisma.truckType.createMany({ data });
      const count = await prisma.truckType.count();
      console.log(`✅ Seeded ${count} truck types from SQL`);
      return;
    }
  }

  const legacyTrucks = await loadLegacyTrucks();
  if (legacyTrucks.length === 0) {
    console.warn('⚠️ No legacy truck types found. Skipping seed.');
    return;
  }

  await prisma.truckType.deleteMany({});

  const seedData = legacyTrucks.map((truck, index) => mapTruckToSeed(truck, index));
  await prisma.truckType.createMany({
    data: seedData,
  });

  const count = await prisma.truckType.count();
  console.log(`✅ Seeded ${count} truck types`);
}

export default seedTruckTypes;

// Run directly if this file is executed
if (require.main === module) {
  seedTruckTypes()
    .then(() => {
      console.log('✅ Truck types seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Truck types seed failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
