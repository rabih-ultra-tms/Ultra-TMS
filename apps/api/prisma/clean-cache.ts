/* eslint-disable @typescript-eslint/no-explicit-any, no-undef */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

async function main() {
  console.log('🗑️ Cleaning cache tables...\n');

  try {
    // Delete all cache-related data
    const deleteStats = await prisma.cacheStats.deleteMany({});
    console.log(`   ✓ Deleted ${deleteStats.count} cache stats`);

    const deleteRules = await prisma.cacheInvalidationRule.deleteMany({});
    console.log(`   ✓ Deleted ${deleteRules.count} cache invalidation rules`);

    const deleteLocks = await prisma.distributedLock.deleteMany({});
    console.log(`   ✓ Deleted ${deleteLocks.count} distributed locks`);

    const deleteConfigs = await prisma.cacheConfig.deleteMany({});
    console.log(`   ✓ Deleted ${deleteConfigs.count} cache configs`);

    console.log('\n✅ Cache tables cleaned successfully!');
  } catch (error) {
    console.error('❌ Cleaning failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
