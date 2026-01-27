-- CreateTable
CREATE TABLE "TruckType" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "deckLengthFt" DECIMAL(5,2) NOT NULL,
    "deckWidthFt" DECIMAL(5,2) NOT NULL,
    "deckHeightFt" DECIMAL(5,2) NOT NULL,
    "wellLengthFt" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "maxCargoWeightLbs" INTEGER NOT NULL,
    "imageUrl" VARCHAR(500),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TruckType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadPlannerQuote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "quoteNumber" VARCHAR(50) NOT NULL,
    "publicToken" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "customerName" VARCHAR(255) NOT NULL,
    "customerEmail" VARCHAR(255),
    "customerPhone" VARCHAR(20),
    "customerCompany" VARCHAR(255),
    "pickupAddress" VARCHAR(500) NOT NULL,
    "pickupCity" VARCHAR(100) NOT NULL,
    "pickupState" VARCHAR(2) NOT NULL,
    "pickupZip" VARCHAR(10) NOT NULL,
    "pickupLat" DECIMAL(10,8) NOT NULL,
    "pickupLng" DECIMAL(11,8) NOT NULL,
    "dropoffAddress" VARCHAR(500) NOT NULL,
    "dropoffCity" VARCHAR(100) NOT NULL,
    "dropoffState" VARCHAR(2) NOT NULL,
    "dropoffZip" VARCHAR(10) NOT NULL,
    "dropoffLat" DECIMAL(10,8) NOT NULL,
    "dropoffLng" DECIMAL(11,8) NOT NULL,
    "distanceMiles" DECIMAL(8,2) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "routePolyline" TEXT,
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "LoadPlannerQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadPlannerCargoItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "sku" VARCHAR(100),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "lengthIn" DECIMAL(8,2) NOT NULL,
    "widthIn" DECIMAL(8,2) NOT NULL,
    "heightIn" DECIMAL(8,2) NOT NULL,
    "weightLbs" DECIMAL(10,2) NOT NULL,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "bottomOnly" BOOLEAN NOT NULL DEFAULT false,
    "maxLayers" INTEGER,
    "fragile" BOOLEAN NOT NULL DEFAULT false,
    "hazmat" BOOLEAN NOT NULL DEFAULT false,
    "orientation" VARCHAR(20),
    "geometryType" VARCHAR(50),
    "geometryData" JSONB,
    "equipmentMakeId" VARCHAR(100),
    "equipmentModelId" VARCHAR(100),
    "dimensionsSource" VARCHAR(50),
    "imageUrl1" VARCHAR(500),
    "imageUrl2" VARCHAR(500),
    "imageUrl3" VARCHAR(500),
    "imageUrl4" VARCHAR(500),
    "assignedTruckIndex" INTEGER,
    "placementX" DECIMAL(8,2),
    "placementY" DECIMAL(8,2),
    "placementZ" DECIMAL(8,2),
    "rotation" DECIMAL(5,2),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LoadPlannerCargoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadPlannerTruck" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "truckIndex" INTEGER NOT NULL DEFAULT 0,
    "truckTypeId" TEXT,
    "truckName" VARCHAR(100) NOT NULL,
    "truckCategory" VARCHAR(50) NOT NULL,
    "deckLengthFt" DECIMAL(5,2) NOT NULL,
    "deckWidthFt" DECIMAL(5,2) NOT NULL,
    "deckHeightFt" DECIMAL(5,2) NOT NULL,
    "wellLengthFt" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "maxCargoWeightLbs" INTEGER NOT NULL,
    "totalWeightLbs" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "isLegal" BOOLEAN NOT NULL DEFAULT true,
    "permitsRequired" JSONB NOT NULL DEFAULT '[]',
    "warnings" JSONB NOT NULL DEFAULT '[]',
    "truckScore" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LoadPlannerTruck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadPlannerServiceItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "serviceTypeId" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "rateCents" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "totalCents" INTEGER NOT NULL,
    "truckIndex" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LoadPlannerServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadPlannerAccessorial" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "accessorialTypeId" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "billingUnit" VARCHAR(50) NOT NULL,
    "rateCents" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "totalCents" INTEGER NOT NULL,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LoadPlannerAccessorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadPlannerPermit" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "stateCode" VARCHAR(2) NOT NULL,
    "stateName" VARCHAR(100) NOT NULL,
    "calculatedPermitFeeCents" INTEGER NOT NULL,
    "calculatedEscortFeeCents" INTEGER NOT NULL,
    "calculatedPoleCarFeeCents" INTEGER NOT NULL,
    "calculatedSuperLoadFeeCents" INTEGER NOT NULL,
    "calculatedTotalCents" INTEGER NOT NULL,
    "permitFeeCents" INTEGER,
    "escortFeeCents" INTEGER,
    "poleCarFeeCents" INTEGER,
    "superLoadFeeCents" INTEGER,
    "totalCents" INTEGER,
    "distanceMiles" DECIMAL(8,2) NOT NULL,
    "escortCount" INTEGER NOT NULL DEFAULT 0,
    "poleCarRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LoadPlannerPermit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationsCarrier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierType" VARCHAR(50) NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "mcNumber" VARCHAR(20),
    "dotNumber" VARCHAR(20),
    "einTaxId" VARCHAR(20),
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "zip" VARCHAR(10),
    "phone" VARCHAR(20),
    "phoneSecondary" VARCHAR(20),
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "billingEmail" VARCHAR(255),
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "preferredPaymentMethod" VARCHAR(50),
    "factoringCompanyName" VARCHAR(255),
    "factoringCompanyPhone" VARCHAR(20),
    "factoringCompanyEmail" VARCHAR(255),
    "insuranceCompany" VARCHAR(255),
    "insurancePolicyNumber" VARCHAR(100),
    "insuranceExpiryDate" DATE,
    "cargoInsuranceLimitCents" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "OperationsCarrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationsCarrierDriver" (
    "id" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "nickname" VARCHAR(100),
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "phone" VARCHAR(20),
    "phoneSecondary" VARCHAR(20),
    "email" VARCHAR(255),
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "zip" VARCHAR(10),
    "cdlNumber" VARCHAR(50),
    "cdlState" VARCHAR(2),
    "cdlClass" VARCHAR(10),
    "cdlExpiry" DATE,
    "cdlEndorsements" VARCHAR(100),
    "medicalCardExpiry" DATE,
    "emergencyContactName" VARCHAR(255),
    "emergencyContactPhone" VARCHAR(20),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OperationsCarrierDriver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationsCarrierTruck" (
    "id" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "unitNumber" VARCHAR(50) NOT NULL,
    "vin" VARCHAR(17),
    "licensePlate" VARCHAR(20),
    "licensePlateState" VARCHAR(2),
    "year" INTEGER,
    "make" VARCHAR(100),
    "model" VARCHAR(100),
    "truckTypeId" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "customTypeDescription" VARCHAR(255),
    "deckLengthFt" DECIMAL(5,2),
    "deckWidthFt" DECIMAL(5,2),
    "deckHeightFt" DECIMAL(5,2),
    "maxCargoWeightLbs" INTEGER,
    "axleCount" INTEGER,
    "hasTarps" BOOLEAN NOT NULL DEFAULT false,
    "hasChains" BOOLEAN NOT NULL DEFAULT false,
    "hasStraps" BOOLEAN NOT NULL DEFAULT false,
    "coilRacks" BOOLEAN NOT NULL DEFAULT false,
    "loadBars" BOOLEAN NOT NULL DEFAULT false,
    "ramps" BOOLEAN NOT NULL DEFAULT false,
    "registrationExpiry" DATE,
    "annualInspectionDate" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "assignedDriverId" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OperationsCarrierTruck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "loadPlannerQuoteId" TEXT,
    "inlandQuoteId" TEXT,
    "quoteNumber" VARCHAR(50),
    "customerName" VARCHAR(255),
    "customerCompany" VARCHAR(255),
    "carrierId" TEXT,
    "driverId" TEXT,
    "truckId" TEXT,
    "originCity" VARCHAR(100),
    "originState" VARCHAR(2),
    "originZip" VARCHAR(10),
    "destinationCity" VARCHAR(100),
    "destinationState" VARCHAR(2),
    "destinationZip" VARCHAR(10),
    "totalMiles" DECIMAL(8,2),
    "cargoDescription" TEXT,
    "pieces" INTEGER,
    "totalLengthIn" DECIMAL(8,2),
    "totalWidthIn" DECIMAL(8,2),
    "totalHeightIn" DECIMAL(8,2),
    "totalWeightLbs" DECIMAL(10,2),
    "isOversize" BOOLEAN NOT NULL DEFAULT false,
    "isOverweight" BOOLEAN NOT NULL DEFAULT false,
    "equipmentTypeUsed" VARCHAR(100),
    "customerRateCents" INTEGER NOT NULL,
    "carrierRateCents" INTEGER NOT NULL,
    "marginCents" INTEGER NOT NULL DEFAULT 0,
    "marginPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "ratePerMileCustomerCents" INTEGER NOT NULL DEFAULT 0,
    "ratePerMileCarrierCents" INTEGER NOT NULL DEFAULT 0,
    "quoteDate" DATE,
    "bookedDate" DATE,
    "pickupDate" DATE,
    "deliveryDate" DATE,
    "invoiceDate" DATE,
    "paidDate" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "LoadHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TruckType_category_idx" ON "TruckType"("category");

-- CreateIndex
CREATE UNIQUE INDEX "LoadPlannerQuote_quoteNumber_key" ON "LoadPlannerQuote"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LoadPlannerQuote_publicToken_key" ON "LoadPlannerQuote"("publicToken");

-- CreateIndex
CREATE INDEX "LoadPlannerQuote_tenantId_idx" ON "LoadPlannerQuote"("tenantId");

-- CreateIndex
CREATE INDEX "LoadPlannerQuote_quoteNumber_idx" ON "LoadPlannerQuote"("quoteNumber");

-- CreateIndex
CREATE INDEX "LoadPlannerQuote_publicToken_idx" ON "LoadPlannerQuote"("publicToken");

-- CreateIndex
CREATE INDEX "LoadPlannerQuote_status_idx" ON "LoadPlannerQuote"("status");

-- CreateIndex
CREATE INDEX "LoadPlannerQuote_pickupState_idx" ON "LoadPlannerQuote"("pickupState");

-- CreateIndex
CREATE INDEX "LoadPlannerQuote_dropoffState_idx" ON "LoadPlannerQuote"("dropoffState");

-- CreateIndex
CREATE INDEX "LoadPlannerQuote_createdAt_idx" ON "LoadPlannerQuote"("createdAt");

-- CreateIndex
CREATE INDEX "LoadPlannerQuote_isActive_idx" ON "LoadPlannerQuote"("isActive");

-- CreateIndex
CREATE INDEX "LoadPlannerCargoItem_quoteId_idx" ON "LoadPlannerCargoItem"("quoteId");

-- CreateIndex
CREATE INDEX "LoadPlannerCargoItem_assignedTruckIndex_idx" ON "LoadPlannerCargoItem"("assignedTruckIndex");

-- CreateIndex
CREATE UNIQUE INDEX "LoadPlannerCargoItem_quoteId_sortOrder_key" ON "LoadPlannerCargoItem"("quoteId", "sortOrder");

-- CreateIndex
CREATE INDEX "LoadPlannerTruck_quoteId_idx" ON "LoadPlannerTruck"("quoteId");

-- CreateIndex
CREATE INDEX "LoadPlannerTruck_truckTypeId_idx" ON "LoadPlannerTruck"("truckTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "LoadPlannerTruck_quoteId_truckIndex_key" ON "LoadPlannerTruck"("quoteId", "truckIndex");

-- CreateIndex
CREATE INDEX "LoadPlannerServiceItem_quoteId_idx" ON "LoadPlannerServiceItem"("quoteId");

-- CreateIndex
CREATE INDEX "LoadPlannerServiceItem_serviceTypeId_idx" ON "LoadPlannerServiceItem"("serviceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "LoadPlannerServiceItem_quoteId_sortOrder_key" ON "LoadPlannerServiceItem"("quoteId", "sortOrder");

-- CreateIndex
CREATE INDEX "LoadPlannerAccessorial_quoteId_idx" ON "LoadPlannerAccessorial"("quoteId");

-- CreateIndex
CREATE INDEX "LoadPlannerAccessorial_accessorialTypeId_idx" ON "LoadPlannerAccessorial"("accessorialTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "LoadPlannerAccessorial_quoteId_sortOrder_key" ON "LoadPlannerAccessorial"("quoteId", "sortOrder");

-- CreateIndex
CREATE INDEX "LoadPlannerPermit_quoteId_idx" ON "LoadPlannerPermit"("quoteId");

-- CreateIndex
CREATE INDEX "LoadPlannerPermit_stateCode_idx" ON "LoadPlannerPermit"("stateCode");

-- CreateIndex
CREATE UNIQUE INDEX "LoadPlannerPermit_quoteId_stateCode_key" ON "LoadPlannerPermit"("quoteId", "stateCode");

-- CreateIndex
CREATE INDEX "OperationsCarrier_tenantId_idx" ON "OperationsCarrier"("tenantId");

-- CreateIndex
CREATE INDEX "OperationsCarrier_mcNumber_idx" ON "OperationsCarrier"("mcNumber");

-- CreateIndex
CREATE INDEX "OperationsCarrier_dotNumber_idx" ON "OperationsCarrier"("dotNumber");

-- CreateIndex
CREATE INDEX "OperationsCarrier_status_idx" ON "OperationsCarrier"("status");

-- CreateIndex
CREATE INDEX "OperationsCarrier_isActive_idx" ON "OperationsCarrier"("isActive");

-- CreateIndex
CREATE INDEX "OperationsCarrierDriver_carrierId_idx" ON "OperationsCarrierDriver"("carrierId");

-- CreateIndex
CREATE INDEX "OperationsCarrierDriver_cdlNumber_idx" ON "OperationsCarrierDriver"("cdlNumber");

-- CreateIndex
CREATE INDEX "OperationsCarrierDriver_status_idx" ON "OperationsCarrierDriver"("status");

-- CreateIndex
CREATE INDEX "OperationsCarrierDriver_isActive_idx" ON "OperationsCarrierDriver"("isActive");

-- CreateIndex
CREATE INDEX "OperationsCarrierTruck_carrierId_idx" ON "OperationsCarrierTruck"("carrierId");

-- CreateIndex
CREATE INDEX "OperationsCarrierTruck_truckTypeId_idx" ON "OperationsCarrierTruck"("truckTypeId");

-- CreateIndex
CREATE INDEX "OperationsCarrierTruck_assignedDriverId_idx" ON "OperationsCarrierTruck"("assignedDriverId");

-- CreateIndex
CREATE INDEX "OperationsCarrierTruck_unitNumber_idx" ON "OperationsCarrierTruck"("unitNumber");

-- CreateIndex
CREATE INDEX "OperationsCarrierTruck_vin_idx" ON "OperationsCarrierTruck"("vin");

-- CreateIndex
CREATE INDEX "OperationsCarrierTruck_status_idx" ON "OperationsCarrierTruck"("status");

-- CreateIndex
CREATE INDEX "OperationsCarrierTruck_isActive_idx" ON "OperationsCarrierTruck"("isActive");

-- CreateIndex
CREATE INDEX "LoadHistory_tenantId_idx" ON "LoadHistory"("tenantId");

-- CreateIndex
CREATE INDEX "LoadHistory_loadPlannerQuoteId_idx" ON "LoadHistory"("loadPlannerQuoteId");

-- CreateIndex
CREATE INDEX "LoadHistory_carrierId_idx" ON "LoadHistory"("carrierId");

-- CreateIndex
CREATE INDEX "LoadHistory_driverId_idx" ON "LoadHistory"("driverId");

-- CreateIndex
CREATE INDEX "LoadHistory_truckId_idx" ON "LoadHistory"("truckId");

-- CreateIndex
CREATE INDEX "LoadHistory_quoteNumber_idx" ON "LoadHistory"("quoteNumber");

-- CreateIndex
CREATE INDEX "LoadHistory_originState_destinationState_idx" ON "LoadHistory"("originState", "destinationState");

-- CreateIndex
CREATE INDEX "LoadHistory_pickupDate_idx" ON "LoadHistory"("pickupDate");

-- CreateIndex
CREATE INDEX "LoadHistory_deliveryDate_idx" ON "LoadHistory"("deliveryDate");

-- CreateIndex
CREATE INDEX "LoadHistory_status_idx" ON "LoadHistory"("status");

-- CreateIndex
CREATE INDEX "LoadHistory_isActive_idx" ON "LoadHistory"("isActive");

-- AddForeignKey
ALTER TABLE "LoadPlannerQuote" ADD CONSTRAINT "LoadPlannerQuote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPlannerCargoItem" ADD CONSTRAINT "LoadPlannerCargoItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "LoadPlannerQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPlannerTruck" ADD CONSTRAINT "LoadPlannerTruck_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "LoadPlannerQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPlannerTruck" ADD CONSTRAINT "LoadPlannerTruck_truckTypeId_fkey" FOREIGN KEY ("truckTypeId") REFERENCES "TruckType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPlannerServiceItem" ADD CONSTRAINT "LoadPlannerServiceItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "LoadPlannerQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPlannerAccessorial" ADD CONSTRAINT "LoadPlannerAccessorial_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "LoadPlannerQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPlannerPermit" ADD CONSTRAINT "LoadPlannerPermit_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "LoadPlannerQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsCarrier" ADD CONSTRAINT "OperationsCarrier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsCarrierDriver" ADD CONSTRAINT "OperationsCarrierDriver_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "OperationsCarrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsCarrierTruck" ADD CONSTRAINT "OperationsCarrierTruck_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "OperationsCarrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsCarrierTruck" ADD CONSTRAINT "OperationsCarrierTruck_truckTypeId_fkey" FOREIGN KEY ("truckTypeId") REFERENCES "TruckType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsCarrierTruck" ADD CONSTRAINT "OperationsCarrierTruck_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "OperationsCarrierDriver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadHistory" ADD CONSTRAINT "LoadHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadHistory" ADD CONSTRAINT "LoadHistory_loadPlannerQuoteId_fkey" FOREIGN KEY ("loadPlannerQuoteId") REFERENCES "LoadPlannerQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadHistory" ADD CONSTRAINT "LoadHistory_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "OperationsCarrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadHistory" ADD CONSTRAINT "LoadHistory_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "OperationsCarrierDriver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadHistory" ADD CONSTRAINT "LoadHistory_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "OperationsCarrierTruck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create function to calculate margin for LoadHistory
CREATE OR REPLACE FUNCTION calculate_load_history_margin()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate margin in cents
  NEW."marginCents" = NEW."customerRateCents" - NEW."carrierRateCents";
  
  -- Calculate margin percentage (avoid division by zero)
  IF NEW."customerRateCents" > 0 THEN
    NEW."marginPercentage" = (NEW."marginCents"::DECIMAL / NEW."customerRateCents"::DECIMAL) * 100;
  ELSE
    NEW."marginPercentage" = 0;
  END IF;
  
  -- Calculate rate per mile for customer (avoid division by zero)
  IF NEW."totalMiles" IS NOT NULL AND NEW."totalMiles" > 0 THEN
    NEW."ratePerMileCustomerCents" = (NEW."customerRateCents"::DECIMAL / NEW."totalMiles"::DECIMAL)::INTEGER;
    NEW."ratePerMileCarrierCents" = (NEW."carrierRateCents"::DECIMAL / NEW."totalMiles"::DECIMAL)::INTEGER;
  ELSE
    NEW."ratePerMileCustomerCents" = 0;
    NEW."ratePerMileCarrierCents" = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate margin on insert/update
CREATE TRIGGER load_history_margin_trigger
  BEFORE INSERT OR UPDATE OF "customerRateCents", "carrierRateCents", "totalMiles"
  ON "LoadHistory"
  FOR EACH ROW
  EXECUTE FUNCTION calculate_load_history_margin();
