import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    const truckTypeCount = await prisma.truckType.count();
    console.log('✅ TruckType table exists with', truckTypeCount, 'records');

    const loadPlannerQuoteCount = await prisma.loadPlannerQuote.count();
    console.log('✅ LoadPlannerQuote table exists with', loadPlannerQuoteCount, 'records');

    const carrierCount = await prisma.operationsCarrier.count();
    console.log('✅ OperationsCarrier table exists with', carrierCount, 'records');

    const driverCount = await prisma.operationsCarrierDriver.count();
    console.log('✅ OperationsCarrierDriver table exists with', driverCount, 'records');

    const truckCount = await prisma.operationsCarrierTruck.count();
    console.log('✅ OperationsCarrierTruck table exists with', truckCount, 'records');

    const loadHistoryCount = await prisma.loadHistory.count();
    console.log('✅ LoadHistory table exists with', loadHistoryCount, 'records');

    console.log('\n🎉 All operations module tables are successfully migrated!');
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
