-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "quoteNumber" VARCHAR(50) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentQuoteId" TEXT,
    "companyId" TEXT,
    "contactId" TEXT,
    "customerName" VARCHAR(255),
    "customerEmail" VARCHAR(255),
    "customerPhone" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "serviceType" VARCHAR(50) NOT NULL,
    "equipmentType" VARCHAR(50),
    "pickupDate" TIMESTAMP(3),
    "pickupWindowStart" VARCHAR(10),
    "pickupWindowEnd" VARCHAR(10),
    "deliveryDate" TIMESTAMP(3),
    "deliveryWindowStart" VARCHAR(10),
    "deliveryWindowEnd" VARCHAR(10),
    "isFlexibleDates" BOOLEAN NOT NULL DEFAULT false,
    "commodity" VARCHAR(255),
    "weightLbs" DECIMAL(10,2),
    "pieces" INTEGER,
    "pallets" INTEGER,
    "dimensions" JSONB,
    "isHazmat" BOOLEAN NOT NULL DEFAULT false,
    "hazmatClass" VARCHAR(20),
    "temperatureMin" DECIMAL(5,2),
    "temperatureMax" DECIMAL(5,2),
    "totalMiles" DECIMAL(10,2),
    "linehaulRate" DECIMAL(12,2),
    "fuelSurcharge" DECIMAL(12,2),
    "accessorialsTotal" DECIMAL(12,2),
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "marginAmount" DECIMAL(12,2),
    "marginPercent" DECIMAL(5,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "rateSource" VARCHAR(50),
    "marketRateLow" DECIMAL(12,2),
    "marketRateAvg" DECIMAL(12,2),
    "marketRateHigh" DECIMAL(12,2),
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "convertedOrderId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "internalNotes" TEXT,
    "customerNotes" TEXT,
    "specialInstructions" TEXT,
    "salesRepId" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "tags" VARCHAR(100)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteStop" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "stopSequence" INTEGER NOT NULL,
    "stopType" VARCHAR(20) NOT NULL,
    "facilityName" VARCHAR(255),
    "addressLine1" VARCHAR(255) NOT NULL,
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "country" VARCHAR(3) NOT NULL DEFAULT 'USA',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "contactName" VARCHAR(255),
    "contactPhone" VARCHAR(50),
    "contactEmail" VARCHAR(255),
    "appointmentRequired" BOOLEAN NOT NULL DEFAULT false,
    "earliestTime" VARCHAR(10),
    "latestTime" VARCHAR(10),
    "instructions" TEXT,
    "milesToNext" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteAccessorial" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "accessorialType" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitRate" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteAccessorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateContract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractNumber" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "paymentTerms" VARCHAR(50),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "renewalNoticeDays" INTEGER NOT NULL DEFAULT 30,
    "defaultFuelSurchargeType" VARCHAR(50),
    "defaultFuelSurchargePercent" DECIMAL(5,2),
    "minimumMarginPercent" DECIMAL(5,2),
    "notes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "RateContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractLaneRate" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "originCity" VARCHAR(100),
    "originState" VARCHAR(50),
    "originZip" VARCHAR(20),
    "originZone" VARCHAR(50),
    "originRadiusMiles" INTEGER,
    "destinationCity" VARCHAR(100),
    "destinationState" VARCHAR(50),
    "destinationZip" VARCHAR(20),
    "destinationZone" VARCHAR(50),
    "destinationRadiusMiles" INTEGER,
    "serviceType" VARCHAR(50),
    "equipmentType" VARCHAR(50),
    "rateType" VARCHAR(50) NOT NULL,
    "rateAmount" DECIMAL(12,2) NOT NULL,
    "minimumCharge" DECIMAL(12,2),
    "fuelIncluded" BOOLEAN NOT NULL DEFAULT false,
    "fuelSurchargeType" VARCHAR(50),
    "fuelSurchargePercent" DECIMAL(5,2),
    "volumeMin" INTEGER,
    "volumeMax" INTEGER,
    "effectiveDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractLaneRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessorialRate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractId" TEXT,
    "accessorialType" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "rateType" VARCHAR(50) NOT NULL,
    "rateAmount" DECIMAL(10,2) NOT NULL,
    "minimumCharge" DECIMAL(10,2),
    "maximumCharge" DECIMAL(10,2),
    "appliesToServiceTypes" VARCHAR(50)[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessorialRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesQuota" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodType" VARCHAR(20) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "revenueTarget" DECIMAL(14,2),
    "loadsTarget" INTEGER,
    "newCustomersTarget" INTEGER,
    "revenueActual" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "loadsActual" INTEGER NOT NULL DEFAULT 0,
    "newCustomersActual" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quote_tenantId_idx" ON "Quote"("tenantId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_companyId_idx" ON "Quote"("companyId");

-- CreateIndex
CREATE INDEX "Quote_salesRepId_idx" ON "Quote"("salesRepId");

-- CreateIndex
CREATE INDEX "Quote_pickupDate_idx" ON "Quote"("pickupDate");

-- CreateIndex
CREATE INDEX "Quote_externalId_sourceSystem_idx" ON "Quote"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_tenantId_quoteNumber_version_key" ON "Quote"("tenantId", "quoteNumber", "version");

-- CreateIndex
CREATE INDEX "QuoteStop_quoteId_idx" ON "QuoteStop"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteStop_quoteId_stopSequence_key" ON "QuoteStop"("quoteId", "stopSequence");

-- CreateIndex
CREATE INDEX "QuoteAccessorial_quoteId_idx" ON "QuoteAccessorial"("quoteId");

-- CreateIndex
CREATE INDEX "RateContract_tenantId_idx" ON "RateContract"("tenantId");

-- CreateIndex
CREATE INDEX "RateContract_companyId_idx" ON "RateContract"("companyId");

-- CreateIndex
CREATE INDEX "RateContract_status_idx" ON "RateContract"("status");

-- CreateIndex
CREATE INDEX "RateContract_effectiveDate_idx" ON "RateContract"("effectiveDate");

-- CreateIndex
CREATE INDEX "RateContract_expirationDate_idx" ON "RateContract"("expirationDate");

-- CreateIndex
CREATE INDEX "RateContract_externalId_sourceSystem_idx" ON "RateContract"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "RateContract_tenantId_contractNumber_key" ON "RateContract"("tenantId", "contractNumber");

-- CreateIndex
CREATE INDEX "ContractLaneRate_contractId_idx" ON "ContractLaneRate"("contractId");

-- CreateIndex
CREATE INDEX "ContractLaneRate_originState_originCity_idx" ON "ContractLaneRate"("originState", "originCity");

-- CreateIndex
CREATE INDEX "ContractLaneRate_destinationState_destinationCity_idx" ON "ContractLaneRate"("destinationState", "destinationCity");

-- CreateIndex
CREATE INDEX "AccessorialRate_tenantId_idx" ON "AccessorialRate"("tenantId");

-- CreateIndex
CREATE INDEX "AccessorialRate_contractId_idx" ON "AccessorialRate"("contractId");

-- CreateIndex
CREATE INDEX "AccessorialRate_accessorialType_idx" ON "AccessorialRate"("accessorialType");

-- CreateIndex
CREATE INDEX "SalesQuota_tenantId_idx" ON "SalesQuota"("tenantId");

-- CreateIndex
CREATE INDEX "SalesQuota_userId_idx" ON "SalesQuota"("userId");

-- CreateIndex
CREATE INDEX "SalesQuota_periodStart_periodEnd_idx" ON "SalesQuota"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "SalesQuota_tenantId_userId_periodStart_key" ON "SalesQuota"("tenantId", "userId", "periodStart");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_parentQuoteId_fkey" FOREIGN KEY ("parentQuoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_salesRepId_fkey" FOREIGN KEY ("salesRepId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteStop" ADD CONSTRAINT "QuoteStop_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteAccessorial" ADD CONSTRAINT "QuoteAccessorial_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateContract" ADD CONSTRAINT "RateContract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateContract" ADD CONSTRAINT "RateContract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractLaneRate" ADD CONSTRAINT "ContractLaneRate_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RateContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessorialRate" ADD CONSTRAINT "AccessorialRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessorialRate" ADD CONSTRAINT "AccessorialRate_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RateContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesQuota" ADD CONSTRAINT "SalesQuota_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesQuota" ADD CONSTRAINT "SalesQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
