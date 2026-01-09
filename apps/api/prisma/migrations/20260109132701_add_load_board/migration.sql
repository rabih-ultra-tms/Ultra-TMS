-- CreateTable
CREATE TABLE "LoadPosting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "postingType" VARCHAR(50) NOT NULL,
    "visibility" VARCHAR(50) NOT NULL DEFAULT 'ALL_CARRIERS',
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "showRate" BOOLEAN NOT NULL DEFAULT false,
    "rateType" VARCHAR(50),
    "postedRate" DECIMAL(12,2),
    "rateMin" DECIMAL(12,2),
    "rateMax" DECIMAL(12,2),
    "originCity" VARCHAR(100),
    "originState" VARCHAR(50),
    "originZip" VARCHAR(20),
    "originLat" DECIMAL(10,7),
    "originLng" DECIMAL(10,7),
    "destCity" VARCHAR(100),
    "destState" VARCHAR(50),
    "destZip" VARCHAR(20),
    "destLat" DECIMAL(10,7),
    "destLng" DECIMAL(10,7),
    "equipmentType" VARCHAR(50),
    "totalMiles" DECIMAL(10,2),
    "weightLbs" DECIMAL(10,2),
    "pickupDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "datPostingId" VARCHAR(100),
    "truckstopPostingId" VARCHAR(100),
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "autoRefresh" BOOLEAN NOT NULL DEFAULT true,
    "refreshInterval" INTEGER NOT NULL DEFAULT 4,
    "lastRefreshedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "inquiryCount" INTEGER NOT NULL DEFAULT 0,
    "carrierIds" TEXT[],
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoadPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierLoadView" (
    "id" TEXT NOT NULL,
    "postingId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(50),

    CONSTRAINT "CarrierLoadView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadBid" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "postingId" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "bidAmount" DECIMAL(12,2) NOT NULL,
    "rateType" VARCHAR(50),
    "notes" TEXT,
    "truckNumber" VARCHAR(50),
    "driverName" VARCHAR(255),
    "driverPhone" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "counterAmount" DECIMAL(12,2),
    "counterNotes" TEXT,
    "counterAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "source" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoadBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadTender" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "tenderType" VARCHAR(50) NOT NULL,
    "tenderRate" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "waterfallTimeoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "currentPosition" INTEGER NOT NULL DEFAULT 0,
    "acceptedByCarrierId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdById" TEXT,

    CONSTRAINT "LoadTender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderRecipient" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "offeredAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationMethod" VARCHAR(50),

    CONSTRAINT "TenderRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoadPosting_tenantId_idx" ON "LoadPosting"("tenantId");

-- CreateIndex
CREATE INDEX "LoadPosting_tenantId_status_idx" ON "LoadPosting"("tenantId", "status");

-- CreateIndex
CREATE INDEX "LoadPosting_loadId_idx" ON "LoadPosting"("loadId");

-- CreateIndex
CREATE INDEX "LoadPosting_originState_originCity_idx" ON "LoadPosting"("originState", "originCity");

-- CreateIndex
CREATE INDEX "LoadPosting_destState_destCity_idx" ON "LoadPosting"("destState", "destCity");

-- CreateIndex
CREATE INDEX "LoadPosting_pickupDate_idx" ON "LoadPosting"("pickupDate");

-- CreateIndex
CREATE INDEX "LoadPosting_equipmentType_idx" ON "LoadPosting"("equipmentType");

-- CreateIndex
CREATE INDEX "LoadPosting_status_idx" ON "LoadPosting"("status");

-- CreateIndex
CREATE INDEX "CarrierLoadView_postingId_idx" ON "CarrierLoadView"("postingId");

-- CreateIndex
CREATE INDEX "CarrierLoadView_carrierId_idx" ON "CarrierLoadView"("carrierId");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierLoadView_postingId_carrierId_key" ON "CarrierLoadView"("postingId", "carrierId");

-- CreateIndex
CREATE INDEX "LoadBid_tenantId_idx" ON "LoadBid"("tenantId");

-- CreateIndex
CREATE INDEX "LoadBid_postingId_idx" ON "LoadBid"("postingId");

-- CreateIndex
CREATE INDEX "LoadBid_carrierId_idx" ON "LoadBid"("carrierId");

-- CreateIndex
CREATE INDEX "LoadBid_tenantId_status_idx" ON "LoadBid"("tenantId", "status");

-- CreateIndex
CREATE INDEX "LoadBid_status_idx" ON "LoadBid"("status");

-- CreateIndex
CREATE INDEX "LoadTender_tenantId_idx" ON "LoadTender"("tenantId");

-- CreateIndex
CREATE INDEX "LoadTender_loadId_idx" ON "LoadTender"("loadId");

-- CreateIndex
CREATE INDEX "LoadTender_tenantId_status_idx" ON "LoadTender"("tenantId", "status");

-- CreateIndex
CREATE INDEX "LoadTender_status_idx" ON "LoadTender"("status");

-- CreateIndex
CREATE INDEX "TenderRecipient_tenderId_idx" ON "TenderRecipient"("tenderId");

-- CreateIndex
CREATE INDEX "TenderRecipient_carrierId_idx" ON "TenderRecipient"("carrierId");

-- CreateIndex
CREATE INDEX "TenderRecipient_status_idx" ON "TenderRecipient"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TenderRecipient_tenderId_position_key" ON "TenderRecipient"("tenderId", "position");

-- AddForeignKey
ALTER TABLE "LoadPosting" ADD CONSTRAINT "LoadPosting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPosting" ADD CONSTRAINT "LoadPosting_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierLoadView" ADD CONSTRAINT "CarrierLoadView_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "LoadPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierLoadView" ADD CONSTRAINT "CarrierLoadView_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadBid" ADD CONSTRAINT "LoadBid_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadBid" ADD CONSTRAINT "LoadBid_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "LoadPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadBid" ADD CONSTRAINT "LoadBid_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadBid" ADD CONSTRAINT "LoadBid_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadTender" ADD CONSTRAINT "LoadTender_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadTender" ADD CONSTRAINT "LoadTender_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadTender" ADD CONSTRAINT "LoadTender_acceptedByCarrierId_fkey" FOREIGN KEY ("acceptedByCarrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderRecipient" ADD CONSTRAINT "TenderRecipient_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "LoadTender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderRecipient" ADD CONSTRAINT "TenderRecipient_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
