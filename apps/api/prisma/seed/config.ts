import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedConfig(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    // Feature Flags (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.featureFlag.create({
        data: {
          tenantId,
          name: faker.helpers.arrayElement(['edi_enabled', 'advanced_analytics', 'mobile_app', 'api_access', 'white_label']),
          description: faker.lorem.sentence(),
          isEnabled: faker.datatype.boolean(),
          externalId: `SEED-FEATUREFLAG-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} config records`);
}
