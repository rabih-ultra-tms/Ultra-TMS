import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedConfig(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  // Create global feature flags targeted to current tenants (only once)
  const keys = ['edi_enabled', 'advanced_analytics', 'mobile_app', 'api_access', 'white_label'];
  for (const key of keys) {
    await prisma.featureFlag.create({
      data: {
        key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        description: faker.lorem.sentence(),
        enabled: faker.datatype.boolean(),
        rolloutPercent: faker.number.int({ min: 0, max: 100 }),
        tenantIds: tenantIds,
        userIds: [],
        externalId: `SEED-FEATUREFLAG-${total + 1}`,
        sourceSystem: 'FAKER_SEED',
      },
    });
    total++;
  }

  console.log(`   ✓ Created ${total} config records`);
}
