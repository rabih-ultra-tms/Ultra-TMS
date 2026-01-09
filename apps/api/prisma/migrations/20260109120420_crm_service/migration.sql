-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "legalName" VARCHAR(255),
    "dbaName" VARCHAR(255),
    "companyType" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "industry" VARCHAR(100),
    "segment" VARCHAR(50),
    "tier" VARCHAR(20),
    "website" VARCHAR(255),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "addressLine1" VARCHAR(255),
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(50),
    "postalCode" VARCHAR(20),
    "country" VARCHAR(3) NOT NULL DEFAULT 'USA',
    "creditLimit" DECIMAL(12,2),
    "paymentTerms" VARCHAR(50),
    "taxId" VARCHAR(50),
    "dunsNumber" VARCHAR(20),
    "defaultPickupInstructions" TEXT,
    "defaultDeliveryInstructions" TEXT,
    "requiresAppointment" BOOLEAN NOT NULL DEFAULT false,
    "requiresLumper" BOOLEAN NOT NULL DEFAULT false,
    "parentCompanyId" TEXT,
    "assignedUserId" TEXT,
    "hubspotId" VARCHAR(50),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "tags" VARCHAR(100)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "title" VARCHAR(100),
    "department" VARCHAR(100),
    "roleType" VARCHAR(50),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "mobile" VARCHAR(50),
    "fax" VARCHAR(50),
    "preferredContactMethod" VARCHAR(20),
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "timezone" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "receivesInvoices" BOOLEAN NOT NULL DEFAULT false,
    "receivesTracking" BOOLEAN NOT NULL DEFAULT false,
    "hubspotId" VARCHAR(50),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "tags" VARCHAR(100)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "stage" VARCHAR(50) NOT NULL,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "estimatedValue" DECIMAL(12,2),
    "estimatedLoadsPerMonth" INTEGER,
    "avgLoadValue" DECIMAL(10,2),
    "expectedCloseDate" TIMESTAMP(3),
    "actualCloseDate" TIMESTAMP(3),
    "serviceTypes" VARCHAR(50)[],
    "lanes" JSONB NOT NULL DEFAULT '[]',
    "competition" TEXT,
    "winReason" TEXT,
    "lossReason" TEXT,
    "primaryContactId" TEXT,
    "ownerId" TEXT NOT NULL,
    "hubspotDealId" VARCHAR(50),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "tags" VARCHAR(100)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "activityType" VARCHAR(50) NOT NULL,
    "subject" VARCHAR(255),
    "description" TEXT,
    "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMinutes" INTEGER,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "priority" VARCHAR(20),
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "ownerId" TEXT,
    "companyId" TEXT,
    "contactId" TEXT,
    "opportunityId" TEXT,
    "hubspotEngagementId" VARCHAR(50),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HubspotSyncLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "hubspotId" VARCHAR(50) NOT NULL,
    "syncDirection" VARCHAR(20) NOT NULL,
    "syncStatus" VARCHAR(20) NOT NULL,
    "payloadSent" JSONB,
    "payloadReceived" JSONB,
    "errorMessage" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HubspotSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Company_tenantId_idx" ON "Company"("tenantId");

-- CreateIndex
CREATE INDEX "Company_companyType_idx" ON "Company"("companyType");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE INDEX "Company_assignedUserId_idx" ON "Company"("assignedUserId");

-- CreateIndex
CREATE INDEX "Company_hubspotId_idx" ON "Company"("hubspotId");

-- CreateIndex
CREATE INDEX "Company_externalId_sourceSystem_idx" ON "Company"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Company_tenantId_name_key" ON "Company"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Contact_tenantId_idx" ON "Contact"("tenantId");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_isPrimary_idx" ON "Contact"("isPrimary");

-- CreateIndex
CREATE INDEX "Contact_hubspotId_idx" ON "Contact"("hubspotId");

-- CreateIndex
CREATE INDEX "Contact_externalId_sourceSystem_idx" ON "Contact"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Opportunity_tenantId_idx" ON "Opportunity"("tenantId");

-- CreateIndex
CREATE INDEX "Opportunity_companyId_idx" ON "Opportunity"("companyId");

-- CreateIndex
CREATE INDEX "Opportunity_stage_idx" ON "Opportunity"("stage");

-- CreateIndex
CREATE INDEX "Opportunity_ownerId_idx" ON "Opportunity"("ownerId");

-- CreateIndex
CREATE INDEX "Opportunity_expectedCloseDate_idx" ON "Opportunity"("expectedCloseDate");

-- CreateIndex
CREATE INDEX "Opportunity_hubspotDealId_idx" ON "Opportunity"("hubspotDealId");

-- CreateIndex
CREATE INDEX "Opportunity_externalId_sourceSystem_idx" ON "Opportunity"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Activity_tenantId_idx" ON "Activity"("tenantId");

-- CreateIndex
CREATE INDEX "Activity_entityType_entityId_idx" ON "Activity"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Activity_activityType_idx" ON "Activity"("activityType");

-- CreateIndex
CREATE INDEX "Activity_activityDate_idx" ON "Activity"("activityDate");

-- CreateIndex
CREATE INDEX "Activity_dueDate_idx" ON "Activity"("dueDate");

-- CreateIndex
CREATE INDEX "Activity_status_idx" ON "Activity"("status");

-- CreateIndex
CREATE INDEX "Activity_ownerId_idx" ON "Activity"("ownerId");

-- CreateIndex
CREATE INDEX "Activity_companyId_idx" ON "Activity"("companyId");

-- CreateIndex
CREATE INDEX "Activity_contactId_idx" ON "Activity"("contactId");

-- CreateIndex
CREATE INDEX "Activity_opportunityId_idx" ON "Activity"("opportunityId");

-- CreateIndex
CREATE INDEX "Activity_hubspotEngagementId_idx" ON "Activity"("hubspotEngagementId");

-- CreateIndex
CREATE INDEX "Activity_externalId_sourceSystem_idx" ON "Activity"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "HubspotSyncLog_tenantId_idx" ON "HubspotSyncLog"("tenantId");

-- CreateIndex
CREATE INDEX "HubspotSyncLog_entityType_entityId_idx" ON "HubspotSyncLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "HubspotSyncLog_hubspotId_idx" ON "HubspotSyncLog"("hubspotId");

-- CreateIndex
CREATE INDEX "HubspotSyncLog_syncStatus_idx" ON "HubspotSyncLog"("syncStatus");

-- CreateIndex
CREATE INDEX "HubspotSyncLog_syncedAt_idx" ON "HubspotSyncLog"("syncedAt");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubspotSyncLog" ADD CONSTRAINT "HubspotSyncLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
