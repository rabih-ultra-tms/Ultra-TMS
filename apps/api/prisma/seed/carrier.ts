import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCarrier(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });

    // Carriers (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      const carrier = await prisma.carrier.create({
        data: {
          tenantId,
          legalName: faker.company.name() + ' Transport LLC',
          dbaName: faker.company.name() + ' Transport',
          mcNumber: `MC${faker.string.numeric(6)}-${total + i}`,
          dotNumber: `${faker.string.numeric(7)}-${total + i}`,
          scacCode: faker.string.alpha({ length: 4, casing: 'upper' }),
          companyType: faker.helpers.arrayElement(['CARRIER', 'OWNER_OPERATOR', 'BROKER', 'ASSET_BASED']),
          primaryContactPhone: faker.phone.number('###-###-####'),
          primaryContactEmail: faker.internet.email(),
          addressLine1: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          postalCode: faker.location.zipCode(),
          country: 'USA',
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-CARRIER-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
          customFields: {
            preferredLanes: [
              `${faker.location.state({ abbreviated: true })} - ${faker.location.state({ abbreviated: true })}`,
            ],
            equipmentCount: faker.number.int({ min: 5, max: 100 }),
          },
        },
      });
      total++;

      // Carrier Contacts (1-3 per carrier)
      for (let j = 0; j < faker.number.int({ min: 1, max: 3 }); j++) {
        await prisma.carrierContact.create({
          data: {
            tenantId,
            carrierId: carrier.id,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            title: faker.person.jobTitle(),
            email: faker.internet.email(),
            phone: faker.phone.number('###-###-####'),
            isPrimary: j === 0,
            externalId: `SEED-CARRIERCONTACT-${total}-${j}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
    }
  }

  console.log(`   ✓ Created ${total} carrier records`);
}
