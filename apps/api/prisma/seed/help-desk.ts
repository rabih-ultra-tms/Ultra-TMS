import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedHelpDesk(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 10 });
    if (users.length === 0) continue;

    // Support Tickets (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.supportTicket.create({
        data: {
          tenantId,
          ticketNumber: `TKT-${Date.now()}-${i}`,
          subject: faker.lorem.sentence(),
          description: faker.lorem.paragraphs(2),
          source: faker.helpers.arrayElement(['EMAIL', 'PORTAL', 'PHONE', 'INTERNAL']),
          type: faker.helpers.arrayElement(['QUESTION', 'PROBLEM', 'INCIDENT', 'REQUEST']),
          status: faker.helpers.arrayElement(['NEW', 'OPEN', 'PENDING', 'RESOLVED', 'CLOSED']),
          priority: faker.helpers.arrayElement(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
          createdById: users[Math.floor(Math.random() * users.length)].id,
          assignedToId: faker.helpers.maybe(() => users[Math.floor(Math.random() * users.length)].id, { probability: 0.7 }),
          externalId: `SEED-TICKET-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} help desk records`);
}
