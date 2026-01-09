-- CreateTable
CREATE TABLE "CommissionPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "planType" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "effectiveDate" DATE NOT NULL,
    "endDate" DATE,
    "flatAmount" DECIMAL(10,2),
    "percentRate" DECIMAL(5,2),
    "calculationBasis" VARCHAR(50),
    "minimumMarginPercent" DECIMAL(5,2),
    "rules" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "CommissionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionPlanTier" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "tierNumber" INTEGER NOT NULL,
    "tierName" VARCHAR(100),
    "thresholdType" VARCHAR(50) NOT NULL,
    "thresholdMin" DECIMAL(14,2) NOT NULL,
    "thresholdMax" DECIMAL(14,2),
    "rateType" VARCHAR(50) NOT NULL,
    "rateAmount" DECIMAL(10,2) NOT NULL,
    "periodType" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionPlanTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCommissionAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "overrideRate" DECIMAL(5,2),
    "overrideFlat" DECIMAL(10,2),
    "effectiveDate" DATE NOT NULL,
    "endDate" DATE,
    "drawAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "drawRecoverable" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCommissionAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCommissionOverride" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rateType" VARCHAR(50) NOT NULL,
    "rateAmount" DECIMAL(10,2) NOT NULL,
    "calculationBasis" VARCHAR(50),
    "effectiveDate" DATE NOT NULL,
    "endDate" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerCommissionOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loadId" TEXT,
    "orderId" TEXT,
    "entryType" VARCHAR(50) NOT NULL,
    "planId" TEXT,
    "calculationBasis" VARCHAR(50),
    "basisAmount" DECIMAL(12,2),
    "rateApplied" DECIMAL(5,2),
    "commissionAmount" DECIMAL(12,2) NOT NULL,
    "isSplit" BOOLEAN NOT NULL DEFAULT false,
    "splitPercent" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "parentEntryId" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "commissionPeriod" DATE NOT NULL,
    "notes" TEXT,
    "reversedAt" TIMESTAMP(3),
    "reversedBy" TEXT,
    "reversalReason" TEXT,
    "payoutId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "CommissionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionPayout" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "payoutNumber" VARCHAR(50) NOT NULL,
    "payoutDate" DATE NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "userId" TEXT NOT NULL,
    "grossCommission" DECIMAL(12,2) NOT NULL,
    "drawRecovery" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "adjustments" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netPayout" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paymentMethod" VARCHAR(50),
    "paymentReference" VARCHAR(100),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "CommissionPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommissionPlan_tenantId_idx" ON "CommissionPlan"("tenantId");

-- CreateIndex
CREATE INDEX "CommissionPlan_tenantId_status_idx" ON "CommissionPlan"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionPlan_tenantId_name_effectiveDate_key" ON "CommissionPlan"("tenantId", "name", "effectiveDate");

-- CreateIndex
CREATE INDEX "CommissionPlanTier_planId_idx" ON "CommissionPlanTier"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionPlanTier_planId_tierNumber_key" ON "CommissionPlanTier"("planId", "tierNumber");

-- CreateIndex
CREATE INDEX "UserCommissionAssignment_tenantId_idx" ON "UserCommissionAssignment"("tenantId");

-- CreateIndex
CREATE INDEX "UserCommissionAssignment_userId_idx" ON "UserCommissionAssignment"("userId");

-- CreateIndex
CREATE INDEX "UserCommissionAssignment_planId_idx" ON "UserCommissionAssignment"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCommissionAssignment_tenantId_userId_effectiveDate_key" ON "UserCommissionAssignment"("tenantId", "userId", "effectiveDate");

-- CreateIndex
CREATE INDEX "CustomerCommissionOverride_tenantId_idx" ON "CustomerCommissionOverride"("tenantId");

-- CreateIndex
CREATE INDEX "CustomerCommissionOverride_companyId_idx" ON "CustomerCommissionOverride"("companyId");

-- CreateIndex
CREATE INDEX "CustomerCommissionOverride_userId_idx" ON "CustomerCommissionOverride"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCommissionOverride_tenantId_companyId_userId_effect_key" ON "CustomerCommissionOverride"("tenantId", "companyId", "userId", "effectiveDate");

-- CreateIndex
CREATE INDEX "CommissionEntry_tenantId_idx" ON "CommissionEntry"("tenantId");

-- CreateIndex
CREATE INDEX "CommissionEntry_userId_idx" ON "CommissionEntry"("userId");

-- CreateIndex
CREATE INDEX "CommissionEntry_loadId_idx" ON "CommissionEntry"("loadId");

-- CreateIndex
CREATE INDEX "CommissionEntry_tenantId_commissionPeriod_idx" ON "CommissionEntry"("tenantId", "commissionPeriod");

-- CreateIndex
CREATE INDEX "CommissionEntry_tenantId_status_idx" ON "CommissionEntry"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CommissionPayout_tenantId_idx" ON "CommissionPayout"("tenantId");

-- CreateIndex
CREATE INDEX "CommissionPayout_userId_idx" ON "CommissionPayout"("userId");

-- CreateIndex
CREATE INDEX "CommissionPayout_tenantId_periodStart_idx" ON "CommissionPayout"("tenantId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionPayout_tenantId_payoutNumber_key" ON "CommissionPayout"("tenantId", "payoutNumber");

-- AddForeignKey
ALTER TABLE "CommissionPlan" ADD CONSTRAINT "CommissionPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionPlanTier" ADD CONSTRAINT "CommissionPlanTier_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CommissionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCommissionAssignment" ADD CONSTRAINT "UserCommissionAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCommissionAssignment" ADD CONSTRAINT "UserCommissionAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCommissionAssignment" ADD CONSTRAINT "UserCommissionAssignment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CommissionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCommissionOverride" ADD CONSTRAINT "CustomerCommissionOverride_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCommissionOverride" ADD CONSTRAINT "CustomerCommissionOverride_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCommissionOverride" ADD CONSTRAINT "CustomerCommissionOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CommissionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_parentEntryId_fkey" FOREIGN KEY ("parentEntryId") REFERENCES "CommissionEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "CommissionPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionPayout" ADD CONSTRAINT "CommissionPayout_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionPayout" ADD CONSTRAINT "CommissionPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionPayout" ADD CONSTRAINT "CommissionPayout_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
