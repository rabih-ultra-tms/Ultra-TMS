import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedLoadBoardExternal(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const orders = await prisma.order.findMany({ where: { tenantId }, take: 20 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (orders.length === 0) continue;

    // Load Board Providers (reuse globally unique types)
    const providers = [];
    for (const providerType of ['DAT', 'TRUCKSTOP']) {
      let provider = await prisma.loadBoardProvider.findFirst({ where: { providerType } });
      if (!provider) {
        provider = await prisma.loadBoardProvider.create({
          data: {
            tenantId,
            providerType,
            apiEndpoint: faker.internet.url(),
            isActive: true,
            externalId: `SEED-LOADBOARDPROVIDER-${total + 1}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
        total++;
      }
      providers.push(provider);
    }

    // Create Load Board Accounts for each provider
    const accounts = [];
    for (const provider of providers) {
      const account = await prisma.loadBoardAccount.create({
        data: {
          tenantId,
          providerId: provider.id,
          accountName: `${provider.providerType} Account`,
          isActive: true,
          externalId: `SEED-LOADBOARDACCOUNT-${total}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      accounts.push(account);
      total++;
    }

    // Load Posts (18 per tenant = 90 total)
    for (let i = 0; i < 18; i++) {
      await prisma.loadPost.create({
        data: {
          tenantId,
          accountId: accounts[Math.floor(Math.random() * accounts.length)].id,
          orderId: orders[Math.floor(Math.random() * orders.length)]?.id,
          postNumber: `POST-${Date.now()}-${i}`,
          status: faker.helpers.arrayElement(['DRAFT', 'POSTED', 'RESPONDED', 'COVERED', 'EXPIRED', 'CANCELLED']),
          // Load details
          originCity: faker.location.city(),
          originState: faker.location.state({ abbreviated: true }),
          originZip: faker.location.zipCode(),
          destCity: faker.location.city(),
          destState: faker.location.state({ abbreviated: true }),
          destZip: faker.location.zipCode(),
          pickupDate: faker.date.recent(),
          deliveryDate: faker.helpers.maybe(() => faker.date.future(), { probability: 0.5 }),
          equipmentType: faker.helpers.arrayElement(['VAN', 'REEFER', 'FLATBED']),
          length: faker.number.int({ min: 10, max: 53 }),
          weight: faker.number.int({ min: 500, max: 45000 }),
          commodity: faker.commerce.productName(),
          // Rates
          postedRate: parseFloat(faker.commerce.price({ min: 800, max: 5000 })),
          currency: 'USD',
          // Dates
          postedAt: faker.date.recent(),
          expiresAt: faker.date.future(),
          // Audit
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-LOADPOST-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} load board external records`);
}
