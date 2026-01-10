import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCRM(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (users.length === 0) continue;

    // Companies (20 per tenant = 100 total)
    const companies = [];
    for (let i = 0; i < 20; i++) {
      const company = await prisma.company.create({
        data: {
          tenantId,
          name: `${faker.company.name()} ${i + 1}`,
          companyType: faker.helpers.arrayElement(['CUSTOMER', 'CARRIER', 'BOTH', 'PROSPECT']),
          status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE']),
          taxId: faker.helpers.maybe(() => faker.string.numeric(9), { probability: 0.7 }),
          phone: faker.phone.number('###-###-####'),
          email: faker.internet.email(),
          website: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.5 }),
          addressLine1: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          postalCode: faker.location.zipCode(),
          country: 'USA',
          assignedUserId: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-COMPANY-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
          customFields: {
            industry: faker.helpers.arrayElement(['Manufacturing', 'Retail', 'Technology', 'Healthcare', 'Logistics']),
            annualRevenue: faker.number.int({ min: 100000, max: 10000000 }),
          },
        },
      });
      companies.push(company);
    }
    total += 20;

    // Contacts (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.contact.create({
        data: {
          tenantId,
          companyId: companies[Math.floor(Math.random() * companies.length)].id,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          title: faker.person.jobTitle(),
          email: faker.internet.email(),
          phone: faker.phone.number('###-###-####'),
          mobile: faker.helpers.maybe(() => faker.phone.number('###-###-####'), { probability: 0.6 }),
          isPrimary: faker.datatype.boolean(),
          status: 'ACTIVE',
          externalId: `SEED-CONTACT-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 20;

    // Opportunities (10 per tenant = 50 total)
    for (let i = 0; i < 10; i++) {
      await prisma.opportunity.create({
        data: {
          tenantId,
          companyId: companies[Math.floor(Math.random() * companies.length)].id,
          name: faker.commerce.productName() + ' Deal',
          stage: faker.helpers.arrayElement(['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
          estimatedValue: parseFloat(faker.commerce.price({ min: 5000, max: 100000 })),
          probability: faker.number.int({ min: 10, max: 90 }),
          expectedCloseDate: faker.date.future(),
          ownerId: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-OPPORTUNITY-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 10;

    // Activities (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      const companyId = companies[Math.floor(Math.random() * companies.length)].id;
      await prisma.activity.create({
        data: {
          tenantId,
          entityType: 'COMPANY',
          entityId: companyId,
          companyId,
          activityType: faker.helpers.arrayElement(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']),
          subject: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(['SCHEDULED', 'COMPLETED', 'CANCELLED']),
          dueDate: faker.helpers.maybe(() => faker.date.future(), { probability: 0.7 }),
          completedAt: faker.helpers.maybe(() => faker.date.past(), { probability: 0.5 }),
          externalId: `SEED-ACTIVITY-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 20;
  }

  console.log(`   ✓ Created ${total} CRM records (companies, contacts, opportunities, activities)`);
}
