-- DropForeignKey
ALTER TABLE "StatusHistory" DROP CONSTRAINT "status_history_load_fkey";

-- DropForeignKey
ALTER TABLE "StatusHistory" DROP CONSTRAINT "status_history_order_fkey";

-- DropForeignKey
ALTER TABLE "StatusHistory" DROP CONSTRAINT "status_history_stop_fkey";

-- AlterTable
ALTER TABLE "StatusHistory" ADD COLUMN     "loadId" TEXT,
ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "stopId" TEXT;

-- CreateTable
CREATE TABLE "Carrier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "mcNumber" VARCHAR(20),
    "dotNumber" VARCHAR(20),
    "scacCode" VARCHAR(10),
    "carrierCode" VARCHAR(50),
    "legalName" VARCHAR(255) NOT NULL,
    "dbaName" VARCHAR(255),
    "companyType" VARCHAR(50),
    "primaryContactName" VARCHAR(255),
    "primaryContactEmail" VARCHAR(255),
    "primaryContactPhone" VARCHAR(50),
    "dispatchEmail" VARCHAR(255),
    "dispatchPhone" VARCHAR(50),
    "afterHoursPhone" VARCHAR(50),
    "addressLine1" VARCHAR(255),
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(50),
    "postalCode" VARCHAR(20),
    "country" VARCHAR(3) NOT NULL DEFAULT 'USA',
    "taxId" VARCHAR(50),
    "w9OnFile" BOOLEAN NOT NULL DEFAULT false,
    "taxClassification" VARCHAR(50),
    "paymentTerms" VARCHAR(50),
    "quickPayFeePercent" DECIMAL(5,2),
    "factoringCompany" VARCHAR(255),
    "factoringAccount" VARCHAR(100),
    "bankName" VARCHAR(255),
    "bankRoutingNumber" VARCHAR(50),
    "bankAccountNumberEnc" VARCHAR(255),
    "bankAccountType" VARCHAR(20),
    "equipmentTypes" VARCHAR(50)[],
    "truckCount" INTEGER,
    "trailerCount" INTEGER,
    "serviceStates" VARCHAR(3)[],
    "preferredLanes" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "qualificationTier" VARCHAR(20),
    "qualificationDate" TIMESTAMP(3),
    "fmcsaAuthorityStatus" VARCHAR(50),
    "fmcsaCommonAuthority" BOOLEAN,
    "fmcsaContractAuthority" BOOLEAN,
    "fmcsaBrokerAuthority" BOOLEAN,
    "fmcsaSafetyRating" VARCHAR(50),
    "fmcsaOutOfService" BOOLEAN NOT NULL DEFAULT false,
    "fmcsaLastChecked" TIMESTAMP(3),
    "complianceScore" INTEGER,
    "safetyScore" INTEGER,
    "totalLoads" INTEGER NOT NULL DEFAULT 0,
    "onTimePickupRate" DECIMAL(5,2),
    "onTimeDeliveryRate" DECIMAL(5,2),
    "claimsRate" DECIMAL(5,2),
    "avgRating" DECIMAL(3,2),
    "preferredLanguage" VARCHAR(10) NOT NULL DEFAULT 'en',
    "communicationPreference" VARCHAR(20),
    "internalNotes" TEXT,
    "onboardingNotes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "tags" VARCHAR(100)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierContact" (
    "id" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "title" VARCHAR(100),
    "role" VARCHAR(50),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "mobile" VARCHAR(50),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "receivesRateConfirms" BOOLEAN NOT NULL DEFAULT false,
    "receivesPodRequests" BOOLEAN NOT NULL DEFAULT false,
    "receivesPayments" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" VARCHAR(10) NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarrierContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "cdlNumber" VARCHAR(50),
    "cdlState" VARCHAR(3),
    "cdlExpiration" TIMESTAMP(3),
    "cdlClass" VARCHAR(5),
    "endorsements" VARCHAR(20)[],
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "currentLocationLat" DECIMAL(10,7),
    "currentLocationLng" DECIMAL(10,7),
    "locationUpdatedAt" TIMESTAMP(3),
    "totalLoads" INTEGER NOT NULL DEFAULT 0,
    "onTimeRate" DECIMAL(5,2),
    "avgRating" DECIMAL(3,2),
    "preferredLanguage" VARCHAR(10) NOT NULL DEFAULT 'en',
    "appUserId" TEXT,
    "eldProvider" VARCHAR(50),
    "eldDriverId" VARCHAR(100),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCertificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "insuranceType" VARCHAR(50) NOT NULL,
    "policyNumber" VARCHAR(100),
    "insuranceCompany" VARCHAR(255) NOT NULL,
    "coverageAmount" DECIMAL(14,2) NOT NULL,
    "deductible" DECIMAL(12,2),
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "certificateHolderName" VARCHAR(255),
    "additionalInsured" BOOLEAN NOT NULL DEFAULT false,
    "documentUrl" VARCHAR(500),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "expirationNotified30" BOOLEAN NOT NULL DEFAULT false,
    "expirationNotified14" BOOLEAN NOT NULL DEFAULT false,
    "expirationNotified7" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "documentType" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "filePath" VARCHAR(500),
    "fileSize" INTEGER,
    "mimeType" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "expirationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarrierDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierPerformanceHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "periodType" VARCHAR(20) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "loadsCompleted" INTEGER NOT NULL DEFAULT 0,
    "loadsCancelled" INTEGER NOT NULL DEFAULT 0,
    "onTimePickups" INTEGER NOT NULL DEFAULT 0,
    "onTimeDeliveries" INTEGER NOT NULL DEFAULT 0,
    "latePickups" INTEGER NOT NULL DEFAULT 0,
    "lateDeliveries" INTEGER NOT NULL DEFAULT 0,
    "claimsCount" INTEGER NOT NULL DEFAULT 0,
    "claimsAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "onTimePickupRate" DECIMAL(5,2),
    "onTimeDeliveryRate" DECIMAL(5,2),
    "claimsRate" DECIMAL(5,2),
    "totalPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "avgRatePerMile" DECIMAL(8,2),
    "avgDispatcherRating" DECIMAL(3,2),
    "avgCustomerRating" DECIMAL(3,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarrierPerformanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FmcsaComplianceLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dotNumber" VARCHAR(20),
    "mcNumber" VARCHAR(20),
    "authorityStatus" VARCHAR(50),
    "commonAuthority" BOOLEAN,
    "contractAuthority" BOOLEAN,
    "brokerAuthority" BOOLEAN,
    "safetyRating" VARCHAR(50),
    "outOfService" BOOLEAN,
    "driverInspections" INTEGER,
    "driverOosRate" DECIMAL(5,2),
    "vehicleInspections" INTEGER,
    "vehicleOosRate" DECIMAL(5,2),
    "fmcsaInsuranceOnFile" BOOLEAN,
    "fmcsaInsuranceAmount" DECIMAL(14,2),
    "changesDetected" JSONB NOT NULL DEFAULT '[]',
    "rawResponse" JSONB,

    CONSTRAINT "FmcsaComplianceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Carrier_tenantId_idx" ON "Carrier"("tenantId");

-- CreateIndex
CREATE INDEX "Carrier_mcNumber_idx" ON "Carrier"("mcNumber");

-- CreateIndex
CREATE INDEX "Carrier_dotNumber_idx" ON "Carrier"("dotNumber");

-- CreateIndex
CREATE INDEX "Carrier_scacCode_idx" ON "Carrier"("scacCode");

-- CreateIndex
CREATE INDEX "Carrier_status_idx" ON "Carrier"("status");

-- CreateIndex
CREATE INDEX "Carrier_qualificationTier_idx" ON "Carrier"("qualificationTier");

-- CreateIndex
CREATE INDEX "Carrier_equipmentTypes_idx" ON "Carrier"("equipmentTypes");

-- CreateIndex
CREATE INDEX "Carrier_serviceStates_idx" ON "Carrier"("serviceStates");

-- CreateIndex
CREATE INDEX "Carrier_externalId_sourceSystem_idx" ON "Carrier"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_tenantId_mcNumber_key" ON "Carrier"("tenantId", "mcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_tenantId_dotNumber_key" ON "Carrier"("tenantId", "dotNumber");

-- CreateIndex
CREATE INDEX "CarrierContact_carrierId_idx" ON "CarrierContact"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierContact_isPrimary_idx" ON "CarrierContact"("isPrimary");

-- CreateIndex
CREATE INDEX "CarrierContact_role_idx" ON "CarrierContact"("role");

-- CreateIndex
CREATE INDEX "CarrierContact_isActive_idx" ON "CarrierContact"("isActive");

-- CreateIndex
CREATE INDEX "Driver_tenantId_idx" ON "Driver"("tenantId");

-- CreateIndex
CREATE INDEX "Driver_carrierId_idx" ON "Driver"("carrierId");

-- CreateIndex
CREATE INDEX "Driver_status_idx" ON "Driver"("status");

-- CreateIndex
CREATE INDEX "Driver_cdlExpiration_idx" ON "Driver"("cdlExpiration");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_tenantId_carrierId_cdlNumber_key" ON "Driver"("tenantId", "carrierId", "cdlNumber");

-- CreateIndex
CREATE INDEX "InsuranceCertificate_tenantId_idx" ON "InsuranceCertificate"("tenantId");

-- CreateIndex
CREATE INDEX "InsuranceCertificate_carrierId_idx" ON "InsuranceCertificate"("carrierId");

-- CreateIndex
CREATE INDEX "InsuranceCertificate_insuranceType_idx" ON "InsuranceCertificate"("insuranceType");

-- CreateIndex
CREATE INDEX "InsuranceCertificate_expirationDate_idx" ON "InsuranceCertificate"("expirationDate");

-- CreateIndex
CREATE INDEX "InsuranceCertificate_status_idx" ON "InsuranceCertificate"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCertificate_carrierId_insuranceType_policyNumber_key" ON "InsuranceCertificate"("carrierId", "insuranceType", "policyNumber");

-- CreateIndex
CREATE INDEX "CarrierDocument_tenantId_idx" ON "CarrierDocument"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierDocument_carrierId_idx" ON "CarrierDocument"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierDocument_documentType_idx" ON "CarrierDocument"("documentType");

-- CreateIndex
CREATE INDEX "CarrierDocument_status_idx" ON "CarrierDocument"("status");

-- CreateIndex
CREATE INDEX "CarrierDocument_expirationDate_idx" ON "CarrierDocument"("expirationDate");

-- CreateIndex
CREATE INDEX "CarrierPerformanceHistory_tenantId_idx" ON "CarrierPerformanceHistory"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierPerformanceHistory_carrierId_idx" ON "CarrierPerformanceHistory"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierPerformanceHistory_periodType_idx" ON "CarrierPerformanceHistory"("periodType");

-- CreateIndex
CREATE INDEX "CarrierPerformanceHistory_periodStart_idx" ON "CarrierPerformanceHistory"("periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierPerformanceHistory_carrierId_periodType_periodStart_key" ON "CarrierPerformanceHistory"("carrierId", "periodType", "periodStart");

-- CreateIndex
CREATE INDEX "FmcsaComplianceLog_tenantId_idx" ON "FmcsaComplianceLog"("tenantId");

-- CreateIndex
CREATE INDEX "FmcsaComplianceLog_carrierId_idx" ON "FmcsaComplianceLog"("carrierId");

-- CreateIndex
CREATE INDEX "FmcsaComplianceLog_checkedAt_idx" ON "FmcsaComplianceLog"("checkedAt");

-- CreateIndex
CREATE INDEX "FmcsaComplianceLog_dotNumber_idx" ON "FmcsaComplianceLog"("dotNumber");

-- CreateIndex
CREATE INDEX "FmcsaComplianceLog_mcNumber_idx" ON "FmcsaComplianceLog"("mcNumber");

-- AddForeignKey
ALTER TABLE "Load" ADD CONSTRAINT "Load_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrier" ADD CONSTRAINT "Carrier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierContact" ADD CONSTRAINT "CarrierContact_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCertificate" ADD CONSTRAINT "InsuranceCertificate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCertificate" ADD CONSTRAINT "InsuranceCertificate_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierDocument" ADD CONSTRAINT "CarrierDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierDocument" ADD CONSTRAINT "CarrierDocument_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPerformanceHistory" ADD CONSTRAINT "CarrierPerformanceHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPerformanceHistory" ADD CONSTRAINT "CarrierPerformanceHistory_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FmcsaComplianceLog" ADD CONSTRAINT "FmcsaComplianceLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FmcsaComplianceLog" ADD CONSTRAINT "FmcsaComplianceLog_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
