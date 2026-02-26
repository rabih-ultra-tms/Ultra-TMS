import { PrismaClient } from '@prisma/client';
import { seedLoadHistory } from './seed/load-history';

const prisma = new PrismaClient();

async function main() {
  const tenants = await (prisma as any).tenant.findMany({ select: { id: true }, take: 5 });
  const tenantIds = tenants.map((t: { id: string }) => t.id);
  console.log(`Found ${tenantIds.length} tenants`);
  if (tenantIds.length === 0) {
    console.log('No tenants found — run the main seed first');
    return;
  }
  await seedLoadHistory(prisma as any, tenantIds);
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
