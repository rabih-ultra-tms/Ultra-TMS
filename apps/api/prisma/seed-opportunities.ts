import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

/**
 * Seed opportunities (leads) for a given tenant.
 * Requires: SEED_TENANT_ID environment variable
 * Optional: SEED_USER_ID (for owner assignment)
 * 
 * Usage:
 *   SEED_TENANT_ID=<tenant-id> SEED_USER_ID=<user-id> pnpm ts-node prisma/seed-opportunities.ts
 */
const prisma = new PrismaClient();

const stages = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
const serviceTypes = ['FTL', 'LTL', 'DRAYAGE', 'INTERMODAL', 'SPECIALIZED'];

function generateOpportunity(companyId: string, ownerId: string, index: number) {
  const stage = stages[Math.floor(Math.random() * stages.length)] as typeof stages[number];
  const stageProbabilities: Record<string, number> = {
    LEAD: 10,
    QUALIFIED: 25,
    PROPOSAL: 50,
    NEGOTIATION: 75,
    WON: 100,
    LOST: 0,
  };

  return {
    companyId,
    name: `${faker.company.catchPhrase()} - Opportunity #${index}`,
    description: faker.lorem.paragraph(),
    stage,
    probability: stageProbabilities[stage],
    estimatedValue: stage === 'WON' || stage === 'LOST' ? undefined : faker.number.int({ min: 5000, max: 100000 }),
    estimatedLoadsPerMonth: faker.number.int({ min: 5, max: 100 }),
    avgLoadValue: faker.number.int({ min: 500, max: 5000 }),
    expectedCloseDate: stage === 'WON' || stage === 'LOST' ? new Date() : new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
    actualCloseDate: stage === 'WON' || stage === 'LOST' ? new Date() : undefined,
    serviceTypes: [serviceTypes[Math.floor(Math.random() * serviceTypes.length)]!],
    lanes: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      origin: faker.location.state(),
      destination: faker.location.state(),
      volume: faker.number.int({ min: 1, max: 50 }),
    })),
    competition: faker.company.name(),
    ownerId,
    tags: [faker.commerce.department(), faker.commerce.department()],
  };
}

async function main() {
  const tenantId = process.env.SEED_TENANT_ID;
  const userId = process.env.SEED_USER_ID;

  if (!tenantId) {
    throw new Error('Please set SEED_TENANT_ID to the tenant you want to seed.');
  }

  console.log(`Seeding opportunities for tenant ${tenantId}...`);

  // Get companies for this tenant
  const companies = await prisma.company.findMany({
    where: { tenantId },
    take: 50,
  });

  if (companies.length === 0) {
    throw new Error(`No companies found for tenant ${tenantId}. Please seed companies first.`);
  }

  // Get a user to assign as owner (required field)
  let ownerId = userId;
  if (!ownerId) {
    const user = await prisma.user.findFirst({
      where: { tenantId },
    });
    if (!user) {
      throw new Error(`No users found for tenant ${tenantId}. Please create a user first.`);
    }
    ownerId = user.id;
  }

  console.log(`Found ${companies.length} companies and using owner ${ownerId.substring(0, 8)}...`);

  let createdCount = 0;
  // Create 3-5 opportunities per company
  for (const company of companies) {
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 opportunities
    for (let i = 0; i < count; i++) {
      const opp = generateOpportunity(company.id, ownerId, i + 1);
      await prisma.opportunity.create({
        data: {
          tenantId,
          ...opp,
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Created ${createdCount} opportunities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
