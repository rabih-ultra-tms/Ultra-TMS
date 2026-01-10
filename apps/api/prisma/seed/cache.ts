import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCache(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    // Cache Entries (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.cacheEntry.create({
        data: {
          tenantId,
          key: `cache:${faker.string.alphanumeric(16)}`,
          value: JSON.stringify({ data: faker.lorem.paragraph() }),
          expiresAt: faker.date.future(),
          externalId: `SEED-CACHE-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} cache records`);
}
