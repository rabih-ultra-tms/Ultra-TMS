import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedLoadBoardExternal(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const orders = await prisma.order.findMany({ where: { tenantId }, take: 20 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (orders.length === 0) continue;

    // Load Board Providers (2 per tenant = 10 total)
    const providers = [];
    for (let i = 0; i < 2; i++) {
      const providerType = faker.helpers.arrayElement(['DAT', 'TRUCKSTOP']);
      const provider = await prisma.loadBoardProvider.create({
        data: {
          tenantId,
          providerType,
          apiEndpoint: faker.internet.url(),
          isActive: true,
          externalId: `SEED-LOADBOARDPROVIDER-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      providers.push(provider);
      total++;
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
          status: faker.helpers.arrayElement(['POSTED', 'REMOVED', 'EXPIRED']),
          postedAt: faker.date.recent(),
          expiresAt: faker.date.future(),
          postedById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-LOADPOST-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} load board external records`);
}
