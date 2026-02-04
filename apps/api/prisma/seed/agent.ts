import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAgent(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });

    // Agents (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      await prisma.agent.create({
        data: {
          tenantId,
          companyName: faker.company.name(),
          contactFirstName: firstName,
          contactLastName: lastName,
          contactEmail: faker.internet.email({ firstName, lastName }),
          contactPhone: faker.string.numeric(10),
          agentCode: `AGT-${total + i + 1}`,
          agentType: faker.helpers.arrayElement(['REFERRING', 'SELLING', 'HYBRID']),
          status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED']),
          addressLine1: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          zip: faker.location.zipCode(),
          country: 'USA',
          createdById: users[Math.floor(Math.random() * users.length)]?.id,
          externalId: `SEED-AGENT-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 20;
  }

  console.log(`   ✓ Created ${total} agent records`);
}
