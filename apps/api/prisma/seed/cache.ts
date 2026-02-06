import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCache(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;
  let tenantIndex = 0;

  for (const tenantId of tenantIds) {
    // Cache Configs (5 per tenant = 25 total)
    const cacheTypes = ['ENTITY', 'QUERY', 'SESSION', 'CONFIG'];
    for (let i = 0; i < 5; i++) {
      const cacheType = cacheTypes[i % cacheTypes.length];
      const key = `config:${tenantId.slice(0, 6)}:${cacheType.toLowerCase()}:${i + 1}`;
      const data = {
        tenantId,
        cacheType,
        key,
        ttlSeconds: faker.number.int({ min: 60, max: 3600 }),
        tags: [faker.lorem.word(), faker.lorem.word()],
        externalId: `SEED-CACHE-CONFIG-${total + i + 1}`,
        sourceSystem: 'FAKER_SEED',
      };

      await prisma.cacheConfig.upsert({
        where: { tenantId_cacheType_key: { tenantId, cacheType, key } },
        create: data,
        update: data,
      });
    }
    total += 5;

    // Cache Stats (4 hours x 4 cache types = 16 per tenant = 80 total)
    // Use different dates for each tenant to avoid unique constraint violations
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - tenantIndex);
    
    const cacheTypesForStats = ['ENTITY', 'QUERY', 'SESSION', 'CONFIG'];
    const hours = [0, 6, 12, 18];
    for (const hour of hours) {
      for (const cacheType of cacheTypesForStats) {
        const data = {
          tenantId,
          statDate: baseDate,
          statHour: hour,
          cacheType,
          hits: faker.number.int({ min: 100, max: 10000 }),
          misses: faker.number.int({ min: 10, max: 1000 }),
          sets: faker.number.int({ min: 50, max: 500 }),
          deletes: faker.number.int({ min: 0, max: 100 }),
          expirations: faker.number.int({ min: 0, max: 500 }),
          keysCount: faker.number.int({ min: 100, max: 10000 }),
          memoryBytes: BigInt(faker.number.int({ min: 1000000, max: 100000000 })),
          externalId: `SEED-CACHE-STATS-${total + 1}`,
          sourceSystem: 'FAKER_SEED',
        };

        await prisma.cacheStats.upsert({
          where: {
            tenantId_statDate_statHour_cacheType: {
              tenantId,
              statDate: baseDate,
              statHour: hour,
              cacheType,
            },
          },
          create: data,
          update: data,
        });
        total++;
      }
    }
    
    tenantIndex++;

    // Cache Invalidation Rules (5 per tenant = 25 total)
    const triggerEvents = ['order.updated', 'carrier.approved', 'load.dispatched', 'company.created', 'user.updated'];
    const invalidationTypes = ['DELETE', 'REFRESH'];
    for (let i = 0; i < 5; i++) {
      await prisma.cacheInvalidationRule.create({
        data: {
          tenantId,
          triggerEvent: triggerEvents[i],
          cachePattern: `${faker.helpers.arrayElement(['user', 'load', 'order', 'company', 'carrier'])}:*`,
          invalidationType: faker.helpers.arrayElement(invalidationTypes),
          isEnabled: faker.datatype.boolean(0.8),
          externalId: `SEED-CACHE-RULE-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 5;

    // Distributed Locks (3 per tenant = 15 total)
    for (let i = 0; i < 3; i++) {
      await prisma.distributedLock.create({
        data: {
          tenantId,
          lockKey: `lock:${faker.string.alphanumeric(16)}`,
          holderId: faker.string.uuid(),
          acquiredAt: faker.date.recent(),
          expiresAt: faker.date.soon(),
          purpose: `Lock for ${faker.lorem.words(3)}`,
          externalId: `SEED-LOCK-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 3;
  }

  console.log(`   ✓ Created ${total} cache records (configs, stats, rules, locks)`);
}
