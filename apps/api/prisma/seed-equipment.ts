import { PrismaClient } from '@prisma/client';
import { seedEquipment } from './seed/equipment';

const prisma = new PrismaClient();

async function main() {
  await seedEquipment(prisma);
  console.log('✅ Equipment seeded');
}

main()
  .catch((error) => {
    console.error('❌ Equipment seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });