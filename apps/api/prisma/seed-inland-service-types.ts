/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const prisma = new PrismaClient();

async function main() {
  const sqlPath = resolve(__dirname, '../../../dev_docs/inland_service_types_rows.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log('🧱 Ensuring inland_service_types table exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "public"."inland_service_types" (
      "id" UUID PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "default_rate_cents" INTEGER NOT NULL DEFAULT 0,
      "billing_unit" TEXT NOT NULL DEFAULT 'flat',
      "sort_order" INTEGER NOT NULL DEFAULT 0,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log('🧹 Clearing existing inland_service_types...');
  await prisma.$executeRawUnsafe('DELETE FROM "public"."inland_service_types"');

  console.log('🌱 Seeding inland_service_types from SQL...');
  await prisma.$executeRawUnsafe(sql);

  console.log('✅ inland_service_types reseeded successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
