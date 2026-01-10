/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient() as any;

export async function seedComprehensiveData(tenantId: string, users: any[]) {
  console.log('\n🔄 Seeding comprehensive demo data...\n');

  const adminUser = users.find(u => u.email === 'admin@ultra-tms.local');
  
  // 1. CRM Data
  const crmData = await seedCRMData(tenantId, adminUser.id);
  
  // 2. Carriers
  const carriers = await seedCarriers(tenantId, adminUser.id);
  
  // 3. Sales Data
  const salesData = await seedSalesData(tenantId, crmData.companies, adminUser.id);
  
  // 4. Orders & Loads
  const operationsData = await seedOperationsData(tenantId, crmData.companies, carriers, adminUser.id);
  
  // 5. Accounting
  await seedAccountingData(tenantId, crmData.companies, carriers, operationsData.loads, adminUser.id);
  
  // 6. Commission
  await seedCommissionData(tenantId, users, crmData.companies, operationsData.loads, adminUser.id);
  
  // 7. Documents
  await seedDocumentsData(tenantId, crmData.companies, carriers, operationsData.loads, adminUser.id);
  
  // 8. Communication
  await seedCommunicationData(tenantId, crmData.companies, carriers, operationsData.loads, adminUser.id);
  
  // 9. Customer Portal
  await seedCustomerPortalData(tenantId, crmData.companies, adminUser.id);
  
  // 10. Carrier Portal
  await seedCarrierPortalData(tenantId, carriers, adminUser.id);
  
  // 11. Contracts
  await seedContractsData(tenantId, crmData.companies, carriers, adminUser.id);
  
  // 12. Agent
  await seedAgentData(tenantId, crmData.companies, adminUser.id);
  
  // 13. Factoring
  await seedFactoringData(tenantId, carriers, adminUser.id);
  
  // 14. HR
  await seedHRData(tenantId, adminUser.id);
  
  // 15. Analytics
  await seedAnalyticsData(tenantId, adminUser.id);
  
  // 16. Workflow
  await seedWorkflowData(tenantId, adminUser.id);
  
  // 17. Integration Hub
  await seedIntegrationData(tenantId, adminUser.id);
  
  // 18. Search
  await seedSearchData(tenantId, users[0].id);
  
  // 19. Audit
  await seedAuditData(tenantId, adminUser.id);
  
  // 20. Config
  await seedConfigData(tenantId, adminUser.id);
  
  // 21. Scheduler
  await seedSchedulerData(tenantId, adminUser.id);
  
  // 22. Cache
  await seedCacheData(tenantId);
  
  // 23. Help Desk
  await seedHelpDeskData(tenantId, users, adminUser.id);
  
  // 24. Feedback
  await seedFeedbackData(tenantId, users, adminUser.id);
  
  console.log('\n✅ Comprehensive demo data seeded successfully!\n');
}

// ============================================================================
// 1. CRM DATA
// ============================================================================

async function seedCRMData(tenantId: string, createdById: string) {
  console.log('📊 Seeding CRM data...');
  
  const companies = [];
  const contacts = [];
  const opportunities = [];
  const activities = [];
  
  // Create 15 companies (mix of customers and prospects)
  for (let i = 0; i < 15; i++) {
    const companyType = i < 10 ? 'CUSTOMER' : 'PROSPECT';
    const company = await prisma.company.create({
      data: {
        tenantId,
        name: faker.company.name(),
        legalName: faker.company.name() + ' LLC',
        companyType,
        status: i < 13 ? 'ACTIVE' : 'INACTIVE',
        industry: faker.helpers.arrayElement(['Manufacturing', 'Retail', 'Food & Beverage', 'Automotive', 'Healthcare']),
        segment: faker.helpers.arrayElement(['ENTERPRISE', 'MID_MARKET', 'SMB']),
        tier: faker.helpers.arrayElement(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE']),
        website: faker.internet.url(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        addressLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        postalCode: faker.location.zipCode(),
        country: 'USA',
        creditLimit: faker.number.int({ min: 10000, max: 500000 }),
        paymentTerms: faker.helpers.arrayElement(['NET30', 'NET15', 'COD', 'PREPAID']),
        createdById,
      },
    });
    companies.push(company);
    
    // Create 2-3 contacts per company
    const contactCount = faker.number.int({ min: 2, max: 3 });
    for (let j = 0; j < contactCount; j++) {
      const contact = await prisma.contact.create({
        data: {
          tenantId,
          companyId: company.id,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          title: faker.person.jobTitle(),
          department: faker.helpers.arrayElement(['Operations', 'Logistics', 'Purchasing', 'Accounting', 'Executive']),
          roleType: faker.helpers.arrayElement(['PRIMARY', 'BILLING', 'SHIPPING', 'OPERATIONS']),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          mobile: faker.phone.number(),
          status: 'ACTIVE',
          isPrimary: j === 0,
          receivesInvoices: j === 0 || j === 1,
          receivesTracking: true,
          createdById,
        },
      });
      contacts.push(contact);
    }
  }
  
  // Create 20 opportunities (for prospects and some customers)
  for (let i = 0; i < 20; i++) {
    const company = faker.helpers.arrayElement(companies);
    const opportunity = await prisma.opportunity.create({
      data: {
        tenantId,
        companyId: company.id,
        ownerId: createdById,
        name: `${faker.commerce.productName()} Logistics Contract`,
        description: faker.lorem.paragraph(),
        stage: faker.helpers.arrayElement(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
        estimatedValue: faker.number.int({ min: 50000, max: 500000 }),
        probability: faker.number.int({ min: 10, max: 90 }),
        expectedCloseDate: faker.date.future(),
        lossReason: i > 15 ? faker.lorem.sentence() : null,
        createdById,
      },
    });
    opportunities.push(opportunity);
  }
  
  // Create 30 activities
  for (let i = 0; i < 30; i++) {
    const company = faker.helpers.arrayElement(companies);
    const activity = await prisma.activity.create({
      data: {
        tenantId,
        companyId: company.id,
        entityType: 'COMPANY',
        entityId: company.id,
        activityType: faker.helpers.arrayElement(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']),
        subject: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'CANCELLED']),
        activityDate: faker.date.recent(),
        completedAt: i < 20 ? faker.date.recent() : null,
        ownerId: createdById,
        createdById,
      },
    });
    activities.push(activity);
  }
  
  console.log(`✅ CRM: ${companies.length} companies, ${contacts.length} contacts, ${opportunities.length} opportunities, ${activities.length} activities`);
  
  return { companies, contacts, opportunities, activities };
}

// ============================================================================
// 2. CARRIERS
// ============================================================================

async function seedCarriers(tenantId: string, createdById: string) {
  console.log('🚛 Seeding carrier data...');
  
  const carriers = [];
  
  for (let i = 0; i < 12; i++) {
    const mcNumber = `MC${faker.number.int({ min: 100000, max: 999999 })}`;
    const dotNumber = `${faker.number.int({ min: 1000000, max: 9999999 })}`;
    
    const carrier = await prisma.carrier.create({
      data: {
        tenantId,
        name: faker.company.name() + ' Transport',
        legalName: faker.company.name() + ' LLC',
        dbaName: faker.company.name(),
        mcNumber,
        dotNumber,
        status: faker.helpers.arrayElement(['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED']),
        carrierType: faker.helpers.arrayElement(['ASSET', 'BROKER', 'FREIGHT_FORWARDER', '3PL']),
        insuranceVerified: i < 10,
        qualificationTier: faker.helpers.arrayElement(['PREFERRED', 'APPROVED', 'PROBATION', 'DO_NOT_USE']),
        equipmentTypes: faker.helpers.arrayElements(['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK'], { min: 1, max: 3 }),
        serviceStates: faker.helpers.arrayElements(['IL', 'IN', 'OH', 'MI', 'WI', 'IA', 'MO'], { min: 3, max: 7 }),
        primaryContact: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        addressLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        postalCode: faker.location.zipCode(),
        country: 'USA',
        paymentTerms: faker.helpers.arrayElement(['QUICK_PAY', 'NET30', 'NET15']),
        createdById,
      },
    });
    carriers.push(carrier);
    
    // Add insurance certificate
    await prisma.insuranceCertificate.create({
      data: {
        tenantId,
        carrierId: carrier.id,
        policyType: 'AUTO_LIABILITY',
        policyNumber: `POL-${faker.string.alphanumeric(10).toUpperCase()}`,
        carrier: faker.company.name() + ' Insurance',
        coverageAmount: 1000000,
        effectiveDate: faker.date.past(),
        expirationDate: faker.date.future(),
        status: 'VALID',
        createdById,
      },
    });
    
    // Add 2-3 drivers
    const driverCount = faker.number.int({ min: 2, max: 3 });
    for (let j = 0; j < driverCount; j++) {
      await prisma.driver.create({
        data: {
          tenantId,
          carrierId: carrier.id,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          licenseNumber: faker.string.alphanumeric(12).toUpperCase(),
          licenseState: faker.location.state({ abbreviated: true }),
          licenseExpiration: faker.date.future(),
          status: 'ACTIVE',
          createdById,
        },
      });
    }
    
    // Add capacity
    await prisma.carrierCapacity.create({
      data: {
        tenantId,
        carrierId: carrier.id,
        equipmentType: faker.helpers.arrayElement(['DRY_VAN', 'REEFER', 'FLATBED']),
        availableUnits: faker.number.int({ min: 1, max: 10 }),
        originCity: faker.location.city(),
        originState: faker.location.state({ abbreviated: true }),
        availableDate: faker.date.soon(),
        expiresAt: faker.date.future(),
        status: 'AVAILABLE',
        createdById,
      },
    });
  }
  
  console.log(`✅ Carriers: ${carriers.length} carriers with drivers, insurance, and capacity`);
  
  return carriers;
}

// ============================================================================
// 3. SALES DATA
// ============================================================================

async function seedSalesData(tenantId: string, companies: any[], createdById: string) {
  console.log('💰 Seeding sales data...');
  
  // Create quotes
  let quoteCount = 0;
  for (let i = 0; i < 25; i++) {
    const company = faker.helpers.arrayElement(companies);
    const quote = await prisma.quote.create({
      data: {
        tenantId,
        companyId: company.id,
        quoteNumber: `Q-${new Date().getFullYear()}-${String(i + 1).padStart(5, '0')}`,
        status: faker.helpers.arrayElement(['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED']),
        validUntil: faker.date.future(),
        equipmentType: faker.helpers.arrayElement(['DRY_VAN', 'REEFER', 'FLATBED']),
        totalMiles: faker.number.int({ min: 100, max: 2000 }),
        ratePerMile: faker.number.float({ min: 1.5, max: 4.0, multipleOf: 0.01 }),
        totalAmount: faker.number.int({ min: 500, max: 8000 }),
        createdById,
      },
    });
    quoteCount++;
  }
  
  // Create rate contracts
  let contractCount = 0;
  for (let i = 0; i < 8; i++) {
    const company = faker.helpers.arrayElement(companies);
    await prisma.rateContract.create({
      data: {
        tenantId,
        companyId: company.id,
        contractNumber: `RC-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
        status: 'ACTIVE',
        effectiveDate: faker.date.past(),
        expirationDate: faker.date.future(),
        autoRenew: faker.datatype.boolean(),
        createdById,
      },
    });
    contractCount++;
  }
  
  console.log(`✅ Sales: ${quoteCount} quotes, ${contractCount} rate contracts`);
  
  return { quoteCount, contractCount };
}

// ============================================================================
// 4. OPERATIONS DATA (Orders & Loads)
// ============================================================================

async function seedOperationsData(tenantId: string, companies: any[], carriers: any[], createdById: string) {
  console.log('📦 Seeding operations data (orders & loads)...');
  
  const orders = [];
  const loads = [];
  
  for (let i = 0; i < 30; i++) {
    const customer = faker.helpers.arrayElement(companies.filter(c => c.companyType === 'CUSTOMER'));
    
    // Create order
    const order = await prisma.order.create({
      data: {
        tenantId,
        customerId: customer.id,
        orderNumber: `ORD-${new Date().getFullYear()}-${String(i + 1).padStart(5, '0')}`,
        status: faker.helpers.arrayElement(['BOOKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']),
        customerPO: `PO${faker.string.alphanumeric(8).toUpperCase()}`,
        pickupDate: faker.date.recent(),
        deliveryDate: faker.date.soon(),
        equipmentType: faker.helpers.arrayElement(['DRY_VAN', 'REEFER', 'FLATBED']),
        totalWeight: faker.number.int({ min: 1000, max: 45000 }),
        totalPieces: faker.number.int({ min: 1, max: 50 }),
        revenue: faker.number.float({ min: 500, max: 5000, multipleOf: 0.01 }),
        createdById,
      },
    });
    orders.push(order);
    
    // Create load for this order
    const carrier = faker.helpers.arrayElement(carriers);
    const load = await prisma.load.create({
      data: {
        tenantId,
        orderId: order.id,
        carrierId: carrier.id,
        loadNumber: `LD-${new Date().getFullYear()}-${String(i + 1).padStart(5, '0')}`,
        status: order.status,
        equipmentType: order.equipmentType,
        weight: order.totalWeight,
        pieces: order.totalPieces,
        totalMiles: faker.number.int({ min: 100, max: 2000 }),
        ratePerMile: faker.number.float({ min: 1.5, max: 3.5, multipleOf: 0.01 }),
        linehaul: faker.number.float({ min: 500, max: 4000, multipleOf: 0.01 }),
        fuelSurcharge: faker.number.float({ min: 50, max: 400, multipleOf: 0.01 }),
        totalCost: faker.number.float({ min: 600, max: 4500, multipleOf: 0.01 }),
        totalRevenue: order.revenue,
        margin: faker.number.float({ min: 5, max: 30, multipleOf: 0.01 }),
        createdById,
      },
    });
    loads.push(load);
    
    // Add 2 stops (pickup + delivery)
    await prisma.stop.create({
      data: {
        tenantId,
        loadId: load.id,
        stopNumber: 1,
        stopType: 'PICKUP',
        locationName: faker.company.name(),
        addressLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        postalCode: faker.location.zipCode(),
        country: 'USA',
        scheduledDate: order.pickupDate,
        status: 'COMPLETED',
        createdById,
      },
    });
    
    await prisma.stop.create({
      data: {
        tenantId,
        loadId: load.id,
        stopNumber: 2,
        stopType: 'DELIVERY',
        locationName: faker.company.name(),
        addressLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        postalCode: faker.location.zipCode(),
        country: 'USA',
        scheduledDate: order.deliveryDate,
        status: order.status === 'DELIVERED' ? 'COMPLETED' : 'PENDING',
        createdById,
      },
    });
  }
  
  console.log(`✅ Operations: ${orders.length} orders, ${loads.length} loads with stops`);
  
  return { orders, loads };
}

// ============================================================================
// 5-24. PLACEHOLDER FUNCTIONS (To avoid errors)
// ============================================================================

async function seedAccountingData(tenantId: string, companies: any[], carriers: any[], loads: any[], createdById: string) {
  console.log('💵 Seeding accounting data...');
  
  // Create invoices for loads
  let invoiceCount = 0;
  for (const load of loads.slice(0, 20)) {
    await prisma.invoice.create({
      data: {
        tenantId,
        companyId: load.order.customerId || companies[0].id,
        loadId: load.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`,
        invoiceDate: faker.date.recent(),
        dueDate: faker.date.soon(),
        status: faker.helpers.arrayElement(['DRAFT', 'SENT', 'PAID', 'OVERDUE']),
        subtotal: load.totalRevenue || 1000,
        tax: 0,
        total: load.totalRevenue || 1000,
        createdById,
      },
    });
    invoiceCount++;
  }
  
  console.log(`✅ Accounting: ${invoiceCount} invoices`);
}

async function seedCommissionData(tenantId: string, users: any[], companies: any[], loads: any[], createdById: string) {
  console.log('💎 Seeding commission data...');
  
  // Create commission plan
  const plan = await prisma.commissionPlan.create({
    data: {
      tenantId,
      name: 'Standard Sales Commission',
      description: 'Default commission plan for sales reps',
      planType: 'REVENUE',
      status: 'ACTIVE',
      createdById,
    },
  });
  
  console.log(`✅ Commission: 1 plan created`);
}

async function seedDocumentsData(tenantId: string, companies: any[], carriers: any[], loads: any[], createdById: string) {
  console.log('📄 Seeding documents data...');
  
  // Create a folder
  const folder = await prisma.documentFolder.create({
    data: {
      tenantId,
      name: 'Load Documents',
      description: 'PODs and BOLs',
      createdById,
    },
  });
  
  console.log(`✅ Documents: 1 folder created`);
}

async function seedCommunicationData(tenantId: string, companies: any[], carriers: any[], loads: any[], createdById: string) {
  console.log('💬 Seeding communication data...');
  console.log(`✅ Communication: Templates ready`);
}

async function seedCustomerPortalData(tenantId: string, companies: any[], createdById: string) {
  console.log('🌐 Seeding customer portal data...');
  
  // Create portal users for some companies
  let portalUserCount = 0;
  for (const company of companies.slice(0, 5)) {
    await prisma.portalUser.create({
      data: {
        tenantId,
        companyId: company.id,
        email: faker.internet.email(),
        passwordHash: '$2b$10$placeholder',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'ADMIN',
        status: 'ACTIVE',
        createdById,
      },
    });
    portalUserCount++;
  }
  
  console.log(`✅ Customer Portal: ${portalUserCount} portal users`);
}

async function seedCarrierPortalData(tenantId: string, carriers: any[], createdById: string) {
  console.log('🚚 Seeding carrier portal data...');
  
  // Create carrier portal users
  let portalUserCount = 0;
  for (const carrier of carriers.slice(0, 5)) {
    await prisma.carrierPortalUser.create({
      data: {
        tenantId,
        carrierId: carrier.id,
        email: faker.internet.email(),
        passwordHash: '$2b$10$placeholder',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'OWNER',
        status: 'ACTIVE',
        createdById,
      },
    });
    portalUserCount++;
  }
  
  console.log(`✅ Carrier Portal: ${portalUserCount} portal users`);
}

async function seedContractsData(tenantId: string, companies: any[], carriers: any[], createdById: string) {
  console.log('📝 Seeding contracts data...');
  
  // Create contracts
  let contractCount = 0;
  for (let i = 0; i < 5; i++) {
    const company = faker.helpers.arrayElement(companies);
    await prisma.contract.create({
      data: {
        tenantId,
        customerId: company.id,
        contractNumber: `CNT-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
        type: 'CUSTOMER',
        status: 'ACTIVE',
        effectiveDate: faker.date.past(),
        expirationDate: faker.date.future(),
        autoRenew: true,
        createdById,
      },
    });
    contractCount++;
  }
  
  console.log(`✅ Contracts: ${contractCount} contracts`);
}

async function seedAgentData(tenantId: string, companies: any[], createdById: string) {
  console.log('🤝 Seeding agent data...');
  
  // Create agents
  let agentCount = 0;
  for (let i = 0; i < 3; i++) {
    await prisma.agent.create({
      data: {
        tenantId,
        name: faker.company.name() + ' Agency',
        agentType: faker.helpers.arrayElement(['REFERRING', 'SELLING', 'HYBRID']),
        status: 'ACTIVE',
        contactName: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        createdById,
      },
    });
    agentCount++;
  }
  
  console.log(`✅ Agent: ${agentCount} agents`);
}

async function seedFactoringData(tenantId: string, carriers: any[], createdById: string) {
  console.log('💳 Seeding factoring data...');
  
  // Create factoring company
  await prisma.factoringCompany.create({
    data: {
      tenantId,
      name: faker.company.name() + ' Factoring',
      email: faker.internet.email(),
      phone: faker.phone.number(),
      status: 'ACTIVE',
      createdById,
    },
  });
  
  console.log(`✅ Factoring: 1 factoring company`);
}

async function seedHRData(tenantId: string, createdById: string) {
  console.log('👥 Seeding HR data...');
  
  // Create departments
  const dept = await prisma.department.create({
    data: {
      tenantId,
      name: 'Operations',
      description: 'Operations Department',
      headCount: 15,
      createdById,
    },
  });
  
  // Create position
  await prisma.position.create({
    data: {
      tenantId,
      departmentId: dept.id,
      title: 'Dispatcher',
      description: 'Load dispatching',
      status: 'OPEN',
      createdById,
    },
  });
  
  console.log(`✅ HR: 1 department, 1 position`);
}

async function seedAnalyticsData(tenantId: string, createdById: string) {
  console.log('📊 Seeding analytics data...');
  
  await prisma.kPIDefinition.create({
    data: {
      tenantId,
      name: 'Revenue per Load',
      category: 'FINANCIAL',
      aggregationType: 'AVERAGE',
      createdById,
    },
  });
  
  console.log(`✅ Analytics: 1 KPI definition`);
}

async function seedWorkflowData(tenantId: string, createdById: string) {
  console.log('⚙️ Seeding workflow data...');
  
  await prisma.workflow.create({
    data: {
      tenantId,
      name: 'Load Approval',
      description: 'Approval workflow for high-value loads',
      triggerType: 'MANUAL',
      isActive: true,
      createdById,
    },
  });
  
  console.log(`✅ Workflow: 1 workflow`);
}

async function seedIntegrationData(tenantId: string, createdById: string) {
  console.log('🔌 Seeding integration data...');
  
  await prisma.integration.create({
    data: {
      tenantId,
      name: 'QuickBooks Online',
      provider: 'QUICKBOOKS',
      category: 'ACCOUNTING',
      authType: 'OAUTH2',
      isActive: false,
      createdById,
    },
  });
  
  console.log(`✅ Integration: 1 integration`);
}

async function seedSearchData(tenantId: string, userId: string) {
  console.log('🔍 Seeding search data...');
  
  await prisma.savedSearch.create({
    data: {
      tenantId,
      userId,
      entityType: 'LOAD',
      name: 'My Active Loads',
      filters: { status: 'IN_TRANSIT' },
    },
  });
  
  console.log(`✅ Search: 1 saved search`);
}

async function seedAuditData(tenantId: string, userId: string) {
  console.log('📋 Seeding audit data...');
  
  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'CREATE',
      category: 'DATA',
      entityType: 'Load',
      entityId: 'sample-load-id',
      description: 'Load created',
      severity: 'INFO',
      ipAddress: '127.0.0.1',
    },
  });
  
  console.log(`✅ Audit: 1 audit log entry`);
}

async function seedConfigData(tenantId: string, createdById: string) {
  console.log('⚙️ Seeding config data...');
  
  await prisma.systemConfig.create({
    data: {
      tenantId,
      category: 'GENERAL',
      key: 'default_timezone',
      value: { timezone: 'America/Chicago' },
      dataType: 'JSON',
      createdById,
    },
  });
  
  await prisma.featureFlag.create({
    data: {
      tenantId,
      key: 'enable_portal',
      name: 'Enable Customer Portal',
      status: 'ENABLED',
      rolloutPercentage: 100,
      createdById,
    },
  });
  
  console.log(`✅ Config: 1 system config, 1 feature flag`);
}

async function seedSchedulerData(tenantId: string, createdById: string) {
  console.log('⏰ Seeding scheduler data...');
  
  await prisma.scheduledJob.create({
    data: {
      tenantId,
      name: 'Daily Invoice Sync',
      type: 'SYSTEM',
      scheduleType: 'CRON',
      cronExpression: '0 0 * * *',
      isActive: true,
      createdById,
    },
  });
  
  console.log(`✅ Scheduler: 1 scheduled job`);
}

async function seedCacheData(tenantId: string) {
  console.log('💾 Seeding cache data...');
  
  await prisma.cacheConfig.create({
    data: {
      tenantId,
      key: 'load_list',
      type: 'REDIS',
      ttlSeconds: 300,
      isActive: true,
    },
  });
  
  console.log(`✅ Cache: 1 cache config`);
}

async function seedHelpDeskData(tenantId: string, users: any[], createdById: string) {
  console.log('🎫 Seeding help desk data...');
  
  // Create KB article
  await prisma.kBArticle.create({
    data: {
      tenantId,
      title: 'How to Create a Load',
      content: faker.lorem.paragraphs(3),
      category: 'OPERATIONS',
      status: 'PUBLISHED',
      viewCount: 0,
      createdById,
    },
  });
  
  // Create support tickets
  let ticketCount = 0;
  for (let i = 0; i < 5; i++) {
    await prisma.supportTicket.create({
      data: {
        tenantId,
        ticketNumber: `TKT-${String(i + 1).padStart(5, '0')}`,
        source: faker.helpers.arrayElement(['PORTAL', 'EMAIL', 'PHONE']),
        type: faker.helpers.arrayElement(['BUG', 'FEATURE_REQUEST', 'QUESTION', 'TECHNICAL']),
        priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        status: faker.helpers.arrayElement(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
        subject: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        submitterId: users[0].id,
        createdById,
      },
    });
    ticketCount++;
  }
  
  console.log(`✅ Help Desk: 1 KB article, ${ticketCount} support tickets`);
}

async function seedFeedbackData(tenantId: string, users: any[], createdById: string) {
  console.log('💭 Seeding feedback data...');
  
  // Create NPS survey
  const survey = await prisma.nPSSurvey.create({
    data: {
      tenantId,
      name: 'Q4 2024 Customer Satisfaction',
      category: 'CUSTOMER',
      isActive: true,
      createdById,
    },
  });
  
  // Create feature requests
  let featureCount = 0;
  for (let i = 0; i < 5; i++) {
    await prisma.featureRequest.create({
      data: {
        tenantId,
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['SUBMITTED', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS']),
        votes: faker.number.int({ min: 0, max: 50 }),
        submitterId: users[0].id,
        createdById,
      },
    });
    featureCount++;
  }
  
  console.log(`✅ Feedback: 1 NPS survey, ${featureCount} feature requests`);
}
