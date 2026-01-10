import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedWorkflow(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });

    // Workflows (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.workflow.create({
        data: {
          tenantId,
          name: faker.helpers.arrayElement(['Order Approval', 'Invoice Processing', 'Credit Review', 'Carrier Onboarding', 'Document Upload']),
          description: faker.lorem.sentence(),
          triggerType: faker.helpers.arrayElement(['MANUAL', 'AUTOMATIC', 'SCHEDULED']),
          status: 'ACTIVE',
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-WORKFLOW-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} workflow records`);
}
