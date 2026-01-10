import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedScheduler(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    // Scheduled Jobs (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      const scheduleType = faker.helpers.arrayElement(['CRON', 'INTERVAL', 'ONCE', 'MANUAL']);
      const cronExpression = scheduleType === 'CRON' ? faker.helpers.arrayElement(['0 0 * * *', '0 */4 * * *', '0 9 * * 1']) : null;
      const intervalMinutes = scheduleType === 'INTERVAL' ? faker.helpers.arrayElement([15, 30, 60, 240]) : null;
      const scheduledAt = scheduleType === 'ONCE' ? faker.date.soon() : null;

      await prisma.scheduledJob.create({
        data: {
          tenantId,
          name: faker.helpers.arrayElement(['Daily Report', 'Invoice Generation', 'Data Sync', 'Backup', 'Cleanup']),
          description: faker.lorem.sentence(),
          jobType: faker.helpers.arrayElement(['SYSTEM', 'TENANT', 'USER']),
          scheduleType,
          cronExpression,
          intervalMinutes,
          scheduledAt,
          handlerName: faker.helpers.arrayElement([
            'jobs.generateDailyReport',
            'jobs.generateInvoices',
            'jobs.syncIntegrations',
            'jobs.runBackup',
            'jobs.cleanupOldData',
          ]),
          status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'PAUSED']),
          lastRunAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.7 }),
          nextRunAt: faker.date.soon(),
          externalId: `SEED-SCHEDULEDJOB-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} scheduler records`);
}
