import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedSearch(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 10 });

    // Search history (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.searchHistory.create({
        data: {
          tenantId,
          userId: users[Math.floor(Math.random() * users.length)]?.id,
          entityType: faker.helpers.arrayElement(['ORDERS', 'LOADS', 'COMPANIES', 'CARRIERS', 'CONTACTS', 'INVOICES', 'DOCUMENTS']),
          searchTerm: faker.lorem.words(3),
          resultCount: faker.number.int({ min: 0, max: 250 }),
          externalId: `SEED-SEARCHHISTORY-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} search records`);
}
