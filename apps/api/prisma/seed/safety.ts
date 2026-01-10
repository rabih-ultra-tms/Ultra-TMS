import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedSafety(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const carriers = await prisma.carrier.findMany({ where: { tenantId }, take: 20 });
    if (carriers.length === 0) continue;

    // FMCSA Carrier Records (one per carrier)
    for (const carrier of carriers) {
      await prisma.fmcsaCarrierRecord.create({
        data: {
          tenantId,
          carrierId: carrier.id,
          dotNumber: faker.string.numeric(7),
          legalName: carrier.name || faker.company.name(),
          dbaName: faker.helpers.maybe(() => faker.company.name(), { probability: 0.5 }),
          operatingStatus: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'OUT_OF_SERVICE']),
          externalId: `SEED-FMCSARECORD-${total + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} safety records`);
}
