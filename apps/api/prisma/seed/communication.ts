import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCommunication(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const companies = await prisma.company.findMany({ where: { tenantId }, take: 10 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (companies.length === 0) continue;

    // Communication Logs (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.communicationLog.create({
        data: {
          tenantId,
          entityType: 'COMPANY',
          entityId: companies[Math.floor(Math.random() * companies.length)]?.id,
          channel: faker.helpers.arrayElement(['EMAIL', 'SMS', 'IN_APP']),
          recipientEmail: faker.internet.email(),
          subject: faker.lorem.sentence(),
          body: faker.lorem.paragraphs(2),
          status: faker.helpers.arrayElement(['SENT', 'DELIVERED', 'FAILED', 'BOUNCED']),
          sentAt: faker.date.past(),
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-COMMLOG-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} communication records`);
}
