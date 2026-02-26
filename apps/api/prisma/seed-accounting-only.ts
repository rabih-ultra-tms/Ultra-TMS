/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { seedAccounting } from './seed/accounting';

const prisma = new PrismaClient() as any;

async function main() {
  console.log('💵 Re-seeding accounting data only...\n');

  // Get all tenant IDs
  const tenants = await prisma.tenant.findMany({ select: { id: true } });
  const tenantIds = tenants.map((t: any) => t.id);
  console.log(`Found ${tenantIds.length} tenants\n`);

  // Clean existing accounting data (in dependency order)
  console.log('🧹 Cleaning existing accounting data...');
  await prisma.paymentApplication.deleteMany({ where: { sourceSystem: 'FAKER_SEED' } });
  await prisma.paymentReceived.deleteMany({ where: { sourceSystem: 'FAKER_SEED' } });
  await prisma.paymentMade.deleteMany({ where: { sourceSystem: 'FAKER_SEED' } });
  await prisma.settlementLineItem.deleteMany({ where: { sourceSystem: 'FAKER_SEED' } });
  await prisma.settlement.deleteMany({ where: { sourceSystem: 'FAKER_SEED' } });
  await prisma.invoiceLineItem.deleteMany({ where: { sourceSystem: 'FAKER_SEED' } });
  await prisma.invoice.deleteMany({ where: { sourceSystem: 'FAKER_SEED' } });
  console.log('✅ Cleaned\n');

  // Re-seed
  await seedAccounting(prisma, tenantIds);
  console.log('\n✅ Accounting re-seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
