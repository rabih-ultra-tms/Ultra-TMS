/* eslint-disable @typescript-eslint/no-explicit-any, no-undef */
import { PrismaClient } from '@prisma/client';
import { seedCache } from './seed/cache';
import { seedHelpDesk } from './seed/help-desk';
import { seedFeedback } from './seed/feedback';

const prisma = new PrismaClient() as any;

async function main() {
  console.log('🌱 Seeding new services: Cache, Help Desk, Feedback...\n');

  try {
    // Get existing tenant IDs
    const tenants = await prisma.tenant.findMany({ select: { id: true } });
    const tenantIds = tenants.map((t: any) => t.id);
    
    if (tenantIds.length === 0) {
      console.error('❌ No tenants found. Please run full seed first.');
      process.exit(1);
    }

    console.log(`✓ Found ${tenantIds.length} tenants\n`);

    // Seed Cache Service
    console.log('💾 Seeding Cache...');
    await seedCache(prisma, tenantIds);
    console.log('✅ Cache seeded\n');

    // Seed Help Desk Service
    console.log('🎫 Seeding Help Desk...');
    await seedHelpDesk(prisma, tenantIds);
    console.log('✅ Help Desk seeded\n');

    // Seed Feedback Service
    console.log('💬 Seeding Feedback...');
    await seedFeedback(prisma, tenantIds);
    console.log('✅ Feedback seeded\n');

    console.log('✅ ✅ ✅ All new services seeded successfully! ✅ ✅ ✅');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
