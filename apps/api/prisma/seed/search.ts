import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedSearch(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    // Search Queries (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.searchQuery.create({
        data: {
          tenantId,
          query: faker.lorem.words(3),
          entityType: faker.helpers.arrayElement(['ORDER', 'COMPANY', 'CARRIER', 'LOAD', 'INVOICE']),
          resultCount: faker.number.int({ min: 0, max: 100 }),
          executionTime: faker.number.int({ min: 10, max: 500 }),
          externalId: `SEED-SEARCHQUERY-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} search records`);
}
