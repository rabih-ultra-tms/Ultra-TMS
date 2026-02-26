/* eslint-disable @typescript-eslint/no-explicit-any, no-undef */
import { PrismaClient } from '@prisma/client';
import { seedTenants } from './seed/tenants';
import { seedAuth } from './seed/auth';
import { seedCRM } from './seed/crm';
import { seedSales } from './seed/sales';
import { seedTMSCore } from './seed/tms-core';
import { seedCarrier } from './seed/carrier';
import { seedAccounting } from './seed/accounting';
import { seedDocuments } from './seed/documents';
import { seedCommunication } from './seed/communication';
import { seedCommission } from './seed/commission';
import { seedCustomerPortal } from './seed/customer-portal';
import { seedCarrierPortal } from './seed/carrier-portal';
import { seedContracts } from './seed/contracts';
import { seedAgent } from './seed/agent';
import { seedCredit } from './seed/credit';
import { seedFactoring } from './seed/factoring';
import { seedHR } from './seed/hr';
import { seedAnalytics } from './seed/analytics';
import { seedWorkflow } from './seed/workflow';
import { seedIntegrationHub } from './seed/integration-hub';
import { seedSearch } from './seed/search';
import { seedAudit } from './seed/audit';
import { seedConfig } from './seed/config';
import { seedScheduler } from './seed/scheduler';
import { seedCache } from './seed/cache';
import { seedHelpDesk } from './seed/help-desk';
import { seedFeedback } from './seed/feedback';
import { seedEDI } from './seed/edi';
import { seedSafety } from './seed/safety';
import { seedLoadBoardExternal } from './seed/load-board-external';
import { seedRateIntelligence } from './seed/rate-intelligence';
import { seedClaims } from './seed/claims';
import { seedEquipment } from './seed/equipment';
import { seedTenantServices } from './seed/tenant-services';
import { seedLoads } from './seed/loads';
import { seedLoadHistory } from './seed/load-history';
import { seedLoadBoard } from './seed/load-board';
import seedTruckTypes from './seeds/truck-types.seed';

const prisma = new PrismaClient() as any;

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  try {
    // 0. Cleanup seed data from previous runs
    console.log('🗑️  Cleaning up previous seed data...');
    const seedWhere = { where: { sourceSystem: 'FAKER_SEED' } };
    // Delete in reverse dependency order
    await prisma.paymentApplication.deleteMany(seedWhere).catch(() => {});
    await prisma.paymentReceived.deleteMany(seedWhere).catch(() => {});
    await prisma.paymentMade.deleteMany(seedWhere).catch(() => {});
    await prisma.settlementLineItem.deleteMany({ where: { settlement: { sourceSystem: 'FAKER_SEED' } } }).catch(() => {});
    await prisma.settlement.deleteMany(seedWhere).catch(() => {});
    await prisma.invoiceLineItem.deleteMany({ where: { invoice: { sourceSystem: 'FAKER_SEED' } } }).catch(() => {});
    await prisma.invoice.deleteMany(seedWhere).catch(() => {});
    await prisma.commissionEntry.deleteMany(seedWhere).catch(() => {});
    await prisma.commissionPayout.deleteMany(seedWhere).catch(() => {});
    await prisma.userCommissionAssignment.deleteMany(seedWhere).catch(() => {});
    await prisma.commissionPlan.deleteMany(seedWhere).catch(() => {});
    await prisma.checkCall.deleteMany(seedWhere).catch(() => {});
    await prisma.stop.deleteMany(seedWhere).catch(() => {});
    await prisma.load.deleteMany(seedWhere).catch(() => {});
    await prisma.order.deleteMany(seedWhere).catch(() => {});
    await prisma.quote.deleteMany(seedWhere).catch(() => {});
    await prisma.contact.deleteMany(seedWhere).catch(() => {});
    await prisma.company.deleteMany(seedWhere).catch(() => {});
    console.log('✅ Cleanup complete\n');

    // 1. Foundation: Tenants first
    console.log('📦 Seeding Tenants...');
    const tenantIds = await seedTenants(prisma);
    console.log(`✅ Created ${tenantIds.length} tenants\n`);

    // 2. Auth & Admin (dependency: tenants)
    console.log('🔐 Seeding Auth & Admin...');
    await seedAuth(prisma, tenantIds);
    console.log('✅ Auth & Admin seeded\n');

    // 3. CRM (dependency: auth)
    console.log('👥 Seeding CRM...');
    await seedCRM(prisma, tenantIds);
    console.log('✅ CRM seeded\n');

    // 4. Sales (dependency: crm)
    console.log('💰 Seeding Sales...');
    await seedSales(prisma, tenantIds);
    console.log('✅ Sales seeded\n');

    // 5. TMS Core (dependency: crm, sales)
    console.log('🚚 Seeding TMS Core...');
    await seedTMSCore(prisma, tenantIds);
    console.log('✅ TMS Core seeded\n');

    // 6. Carrier (dependency: tms)
    console.log('🚛 Seeding Carrier...');
    await seedCarrier(prisma, tenantIds);
    console.log('✅ Carrier seeded\n');

    // 6a. Loads (dependency: tms-core orders, carriers)
    console.log('📦 Seeding Loads...');
    await seedLoads(prisma, tenantIds);
    console.log('✅ Loads seeded\n');

    // 6b. Load History (dependency: tenants)
    console.log('📋 Seeding Load History...');
    await seedLoadHistory(prisma, tenantIds);
    console.log('✅ Load History seeded\n');

    // 7. Accounting (dependency: tms, carrier)
    console.log('💵 Seeding Accounting...');
    await seedAccounting(prisma, tenantIds);
    console.log('✅ Accounting seeded\n');

    // 8. Documents (dependency: all core services)
    console.log('📄 Seeding Documents...');
    await seedDocuments(prisma, tenantIds);
    console.log('✅ Documents seeded\n');

    // 9. Communication (dependency: crm)
    console.log('📧 Seeding Communication...');
    await seedCommunication(prisma, tenantIds);
    console.log('✅ Communication seeded\n');

    // 10. Commission (dependency: sales, accounting)
    console.log('💸 Seeding Commission...');
    await seedCommission(prisma, tenantIds);
    console.log('✅ Commission seeded\n');

    // 11. Customer Portal (dependency: crm, tms, accounting)
    console.log('🌐 Seeding Customer Portal...');
    await seedCustomerPortal(prisma, tenantIds);
    console.log('✅ Customer Portal seeded\n');

    // 12. Carrier Portal (dependency: carrier, tms)
    console.log('🚚 Seeding Carrier Portal...');
    await seedCarrierPortal(prisma, tenantIds);
    console.log('✅ Carrier Portal seeded\n');

    // 13. Contracts (dependency: crm, sales)
    console.log('📝 Seeding Contracts...');
    await seedContracts(prisma, tenantIds);
    console.log('✅ Contracts seeded\n');

    // 14. Agent (dependency: crm, sales)
    console.log('🤝 Seeding Agent...');
    await seedAgent(prisma, tenantIds);
    console.log('✅ Agent seeded\n');

    // 15. Credit (dependency: crm)
    console.log('💳 Seeding Credit...');
    await seedCredit(prisma, tenantIds);
    console.log('✅ Credit seeded\n');

    // 16. Factoring (dependency: accounting, carrier)
    console.log('🏦 Seeding Factoring...');
    await seedFactoring(prisma, tenantIds);
    console.log('✅ Factoring seeded\n');

    // 17. HR (dependency: auth)
    console.log('👔 Seeding HR...');
    await seedHR(prisma, tenantIds);
    console.log('✅ HR seeded\n');

    // 18. Analytics (dependency: all services)
    console.log('📊 Seeding Analytics...');
    await seedAnalytics(prisma, tenantIds);
    console.log('✅ Analytics seeded\n');

    // 19. Workflow (dependency: all services)
    console.log('⚙️ Seeding Workflow...');
    await seedWorkflow(prisma, tenantIds);
    console.log('✅ Workflow seeded\n');

    // 20. Integration Hub (dependency: all services)
    console.log('🔌 Seeding Integration Hub...');
    await seedIntegrationHub(prisma, tenantIds);
    console.log('✅ Integration Hub seeded\n');

    // 21. Search (dependency: all services)
    console.log('🔍 Seeding Search...');
    await seedSearch(prisma, tenantIds);
    console.log('✅ Search seeded\n');

    // 22. Audit (dependency: all services)
    console.log('📋 Seeding Audit...');
    await seedAudit(prisma, tenantIds);
    console.log('✅ Audit seeded\n');

    // 23. Config (dependency: auth)
    console.log('⚙️ Seeding Config...');
    await seedConfig(prisma, tenantIds);
    console.log('✅ Config seeded\n');

    // 23b. Tenant Services (dependency: tenants)
    console.log('⚙️ Seeding Tenant Services...');
    await seedTenantServices(prisma, tenantIds);
    console.log('✅ Tenant Services seeded\n');

    // 24. Scheduler (dependency: all services)
    console.log('⏰ Seeding Scheduler...');
    await seedScheduler(prisma, tenantIds);
    console.log('✅ Scheduler seeded\n');

    // 25. Cache (dependency: all services)
    console.log('💾 Seeding Cache...');
    await seedCache(prisma, tenantIds);
    console.log('✅ Cache seeded\n');

    // 26. Help Desk (dependency: auth, communication)
    console.log('🎫 Seeding Help Desk...');
    await seedHelpDesk(prisma, tenantIds);
    console.log('✅ Help Desk seeded\n');

    // 27. Feedback (dependency: all services)
    console.log('⭐ Seeding Feedback...');
    await seedFeedback(prisma, tenantIds);
    console.log('✅ Feedback seeded\n');

    // 28. EDI (dependency: tms, carrier)
    console.log('📡 Seeding EDI...');
    await seedEDI(prisma, tenantIds);
    console.log('✅ EDI seeded\n');

    // 29. Safety (dependency: carrier)
    console.log('🦺 Seeding Safety...');
    await seedSafety(prisma, tenantIds);
    console.log('✅ Safety seeded\n');

    // 30. Load Board External (dependency: tms, carrier)
    console.log('📢 Seeding Load Board External...');
    await seedLoadBoardExternal(prisma, tenantIds);
    console.log('✅ Load Board External seeded\n');

    // 30a. Load Board Internal (dependency: loads, load-board-external accounts)
    console.log('📋 Seeding Load Board (Internal)...');
    await seedLoadBoard(prisma, tenantIds);
    console.log('✅ Load Board (Internal) seeded\n');

    // 31. Rate Intelligence (dependency: sales, tms)
    console.log('💹 Seeding Rate Intelligence...');
    await seedRateIntelligence(prisma, tenantIds);
    console.log('✅ Rate Intelligence seeded\n');

    // 32. Claims (dependency: tms, carrier, accounting)
    console.log('📋 Seeding Claims...');
    await seedClaims(prisma, tenantIds);
    console.log('✅ Claims seeded\n');

    // 33. Truck Types (Operations Module - no dependencies)
    console.log('🚛 Seeding Truck Types...');
    await seedTruckTypes();
    console.log('✅ Truck Types seeded\n');

    // 34. Equipment (Operations Module - uses raw tables)
    console.log('🛠️ Seeding Equipment...');
    await seedEquipment(prisma);
    console.log('✅ Equipment seeded\n');

    console.log('\n✨ Database seeding completed successfully!');
    console.log('📊 Total records created: Check individual service logs above');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

