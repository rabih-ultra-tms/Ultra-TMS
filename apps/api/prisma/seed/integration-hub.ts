import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedIntegrationHub(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });

    // Integrations (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.integration.create({
        data: {
          tenantId,
          name: faker.helpers.arrayElement(['QuickBooks', 'HubSpot', 'Salesforce', 'DAT', 'Truckstop']),
          provider: faker.helpers.arrayElement(['QuickBooks', 'HubSpot', 'Salesforce', 'DAT', 'Truckstop']),
          category: faker.helpers.arrayElement(['ACCOUNTING', 'CRM', 'LOAD_BOARD', 'TRACKING']),
          authType: faker.helpers.arrayElement(['API_KEY', 'OAUTH2', 'BASIC']),
          syncFrequency: faker.helpers.arrayElement(['REALTIME', 'HOURLY', 'DAILY', 'MANUAL']),
          status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'INACTIVE']),
          config: {
            apiKey: faker.string.alphanumeric(32),
            endpoint: faker.internet.url(),
          },
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-INTEGRATION-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} integration hub records`);
}
