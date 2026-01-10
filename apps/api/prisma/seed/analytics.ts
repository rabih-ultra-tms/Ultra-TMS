import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAnalytics(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });

    // Dashboards (5 per tenant = 25 total)
    const dashboards = [];
    for (let i = 0; i < 5; i++) {
      const dashboard = await prisma.dashboard.create({
        data: {
          tenantId,
          name: faker.helpers.arrayElement(['Operations', 'Sales', 'Financial', 'Executive', 'Custom']) + ' Dashboard',
          description: faker.lorem.sentence(),
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-DASHBOARD-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      dashboards.push(dashboard);
      total++;
    }

    // Reports (15 per tenant = 75 total)
    for (let i = 0; i < 15; i++) {
      await prisma.report.create({
        data: {
          tenantId,
          name: faker.lorem.words(3),
          type: faker.helpers.arrayElement(['OPERATIONAL', 'FINANCIAL', 'SALES', 'CUSTOM']),
          description: faker.lorem.sentence(),
          schedule: faker.helpers.maybe(() => 'DAILY', { probability: 0.5 }),
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-REPORT-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} analytics records`);
}
