import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedSales(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const companies = await prisma.company.findMany({ where: { tenantId, companyType: { in: ['CUSTOMER', 'PROSPECT', 'BOTH'] } }, take: 10 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (companies.length === 0) continue;

    // Quotes (15 per tenant = 75 total)
    const quotes = [];
    for (let i = 0; i < 15; i++) {
      const quote = await prisma.quote.create({
        data: {
          tenantId,
          companyId: companies[Math.floor(Math.random() * companies.length)].id,
          quoteNumber: `QT-${Date.now()}-${i}`,
          status: faker.helpers.arrayElement(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']),
          serviceType: faker.helpers.arrayElement(['FTL', 'LTL', 'PARTIAL', 'DRAYAGE']),
          validUntil: faker.date.future(),
          totalAmount: parseFloat(faker.commerce.price({ min: 500, max: 5000 })),
          currency: 'USD',
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-QUOTE-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      quotes.push(quote);
      total++;

      // Quote Stops (2-4 per quote)
      const stopCount = faker.number.int({ min: 2, max: 4 });
      for (let j = 0; j < stopCount; j++) {
        await prisma.quoteStop.create({
          data: {
            tenantId,
            quoteId: quote.id,
            stopType: j === 0 ? 'PICKUP' : j === stopCount - 1 ? 'DELIVERY' : faker.helpers.arrayElement(['PICKUP', 'DELIVERY']),
            stopSequence: j + 1,
            facilityName: faker.company.name(),
            addressLine1: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state({ abbreviated: true }),
            postalCode: faker.location.zipCode(),
            country: 'USA',
            externalId: `SEED-QUOTESTOP-${total}-${j}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
    }

    // Rate Contracts (5 per tenant = 25 total)
    for (let i = 0; i < 5; i++) {
      const contract = await prisma.rateContract.create({
        data: {
          tenantId,
          companyId: companies[Math.floor(Math.random() * companies.length)].id,
          contractNumber: `RC-${Date.now()}-${i}`,
          name: `${companies[0].name} Contract`,
          status: faker.helpers.arrayElement(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']),
          effectiveDate: faker.date.past(),
          expirationDate: faker.date.future(),
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-CONTRACT-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;

      // Contract Lane Rates (3-5 per contract)
      for (let j = 0; j < faker.number.int({ min: 3, max: 5 }); j++) {
        await prisma.contractLaneRate.create({
          data: {
            tenantId,
            contractId: contract.id,
            originCity: faker.location.city(),
            originState: faker.location.state({ abbreviated: true }),
            destinationCity: faker.location.city(),
            destinationState: faker.location.state({ abbreviated: true }),
            equipmentType: faker.helpers.arrayElement(['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK']),
            rateType: faker.helpers.arrayElement(['PER_MILE', 'FLAT', 'PER_CWT']),
            rateAmount: parseFloat(faker.commerce.price({ min: 1000, max: 4000 })),
            externalId: `SEED-LANERATE-${total}-${j}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
    }

    // Accessorial Rates (5 per tenant = 25 total)
    for (let i = 0; i < 5; i++) {
      const accessorialName = faker.helpers.arrayElement(['Detention', 'Layover', 'Driver Assist', 'Liftgate', 'Pallet Exchange']);
      await prisma.accessorialRate.create({
        data: {
          tenantId,
          accessorialType: accessorialName.toUpperCase().replace(/ /g, '_'),
          name: accessorialName,
          rateType: faker.helpers.arrayElement(['FLAT', 'PER_HOUR', 'PER_MILE', 'PERCENT']),
          rateAmount: parseFloat(faker.commerce.price({ min: 25, max: 200 })),
          appliesToServiceTypes: faker.helpers.arrayElements(['FTL', 'LTL', 'INTERMODAL'], { min: 1, max: 3 }),
          externalId: `SEED-ACCESSORIAL-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} sales records (quotes, contracts, rates)`);
}
