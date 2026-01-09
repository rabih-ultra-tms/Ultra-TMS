-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderNumber" VARCHAR(50) NOT NULL,
    "customerReference" VARCHAR(100),
    "poNumber" VARCHAR(100),
    "bolNumber" VARCHAR(100),
    "customerId" TEXT NOT NULL,
    "customerContactId" TEXT,
    "quoteId" TEXT,
    "salesRepId" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "customerRate" DECIMAL(10,2),
    "accessorialCharges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fuelSurcharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCharges" DECIMAL(10,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "commodity" VARCHAR(255),
    "commodityClass" VARCHAR(10),
    "weightLbs" DECIMAL(10,2),
    "pieceCount" INTEGER,
    "palletCount" INTEGER,
    "equipmentType" VARCHAR(30),
    "isHazmat" BOOLEAN NOT NULL DEFAULT false,
    "hazmatClass" VARCHAR(20),
    "temperatureMin" DECIMAL(5,2),
    "temperatureMax" DECIMAL(5,2),
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requiredDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "specialInstructions" TEXT,
    "internalNotes" TEXT,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "isExpedited" BOOLEAN NOT NULL DEFAULT false,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Load" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "loadNumber" VARCHAR(50) NOT NULL,
    "orderId" TEXT NOT NULL,
    "carrierId" TEXT,
    "driverName" VARCHAR(100),
    "driverPhone" VARCHAR(20),
    "truckNumber" VARCHAR(20),
    "trailerNumber" VARCHAR(20),
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "carrierRate" DECIMAL(10,2),
    "accessorialCosts" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fuelAdvance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(10,2),
    "currentLocationLat" DECIMAL(10,7),
    "currentLocationLng" DECIMAL(10,7),
    "currentCity" VARCHAR(100),
    "currentState" VARCHAR(50),
    "lastTrackingUpdate" TIMESTAMP(3),
    "eta" TIMESTAMP(3),
    "equipmentType" VARCHAR(30),
    "equipmentLength" INTEGER,
    "equipmentWeightLimit" INTEGER,
    "dispatchedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "rateConfirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "rateConfirmationSigned" BOOLEAN NOT NULL DEFAULT false,
    "dispatchNotes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Load_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "loadId" TEXT,
    "stopType" VARCHAR(20) NOT NULL,
    "stopSequence" INTEGER NOT NULL,
    "facilityName" VARCHAR(255),
    "addressLine1" VARCHAR(255) NOT NULL,
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "country" VARCHAR(50) NOT NULL DEFAULT 'USA',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "contactName" VARCHAR(100),
    "contactPhone" VARCHAR(20),
    "contactEmail" VARCHAR(255),
    "appointmentRequired" BOOLEAN NOT NULL DEFAULT false,
    "appointmentDate" TIMESTAMP(3),
    "appointmentTimeStart" VARCHAR(10),
    "appointmentTimeEnd" VARCHAR(10),
    "appointmentNumber" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "arrivedAt" TIMESTAMP(3),
    "departedAt" TIMESTAMP(3),
    "weightLbs" DECIMAL(10,2),
    "pieceCount" INTEGER,
    "palletCount" INTEGER,
    "specialInstructions" TEXT,
    "driverInstructions" TEXT,
    "accessorials" JSONB NOT NULL DEFAULT '[]',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "stopId" TEXT,
    "description" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "quantityType" VARCHAR(20),
    "weightLbs" DECIMAL(10,2),
    "dimensionsLength" INTEGER,
    "dimensionsWidth" INTEGER,
    "dimensionsHeight" INTEGER,
    "commodityClass" VARCHAR(10),
    "nmfcCode" VARCHAR(20),
    "isHazmat" BOOLEAN NOT NULL DEFAULT false,
    "hazmatClass" VARCHAR(20),
    "unNumber" VARCHAR(20),
    "sku" VARCHAR(100),
    "lotNumber" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckCall" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "city" VARCHAR(100),
    "state" VARCHAR(50),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "status" VARCHAR(30),
    "notes" TEXT,
    "contacted" VARCHAR(50),
    "contactMethod" VARCHAR(20),
    "eta" TIMESTAMP(3),
    "milesRemaining" INTEGER,
    "source" VARCHAR(30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "CheckCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" VARCHAR(20) NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldStatus" VARCHAR(30),
    "newStatus" VARCHAR(30) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_tenantId_idx" ON "Order"("tenantId");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_orderDate_idx" ON "Order"("orderDate");

-- CreateIndex
CREATE INDEX "Order_externalId_sourceSystem_idx" ON "Order"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tenantId_orderNumber_key" ON "Order"("tenantId", "orderNumber");

-- CreateIndex
CREATE INDEX "Load_tenantId_idx" ON "Load"("tenantId");

-- CreateIndex
CREATE INDEX "Load_orderId_idx" ON "Load"("orderId");

-- CreateIndex
CREATE INDEX "Load_carrierId_idx" ON "Load"("carrierId");

-- CreateIndex
CREATE INDEX "Load_status_idx" ON "Load"("status");

-- CreateIndex
CREATE INDEX "Load_externalId_sourceSystem_idx" ON "Load"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Load_tenantId_loadNumber_key" ON "Load"("tenantId", "loadNumber");

-- CreateIndex
CREATE INDEX "Stop_tenantId_idx" ON "Stop"("tenantId");

-- CreateIndex
CREATE INDEX "Stop_orderId_idx" ON "Stop"("orderId");

-- CreateIndex
CREATE INDEX "Stop_loadId_idx" ON "Stop"("loadId");

-- CreateIndex
CREATE INDEX "Stop_status_idx" ON "Stop"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Stop_orderId_stopSequence_key" ON "Stop"("orderId", "stopSequence");

-- CreateIndex
CREATE INDEX "OrderItem_tenantId_idx" ON "OrderItem"("tenantId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_stopId_idx" ON "OrderItem"("stopId");

-- CreateIndex
CREATE INDEX "CheckCall_tenantId_idx" ON "CheckCall"("tenantId");

-- CreateIndex
CREATE INDEX "CheckCall_loadId_idx" ON "CheckCall"("loadId");

-- CreateIndex
CREATE INDEX "CheckCall_createdAt_idx" ON "CheckCall"("createdAt");

-- CreateIndex
CREATE INDEX "StatusHistory_tenantId_idx" ON "StatusHistory"("tenantId");

-- CreateIndex
CREATE INDEX "StatusHistory_entityType_entityId_idx" ON "StatusHistory"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "StatusHistory_createdAt_idx" ON "StatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerContactId_fkey" FOREIGN KEY ("customerContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_salesRepId_fkey" FOREIGN KEY ("salesRepId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Load" ADD CONSTRAINT "Load_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Load" ADD CONSTRAINT "Load_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckCall" ADD CONSTRAINT "CheckCall_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckCall" ADD CONSTRAINT "CheckCall_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "status_history_order_fkey" FOREIGN KEY ("entityId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "status_history_load_fkey" FOREIGN KEY ("entityId") REFERENCES "Load"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "status_history_stop_fkey" FOREIGN KEY ("entityId") REFERENCES "Stop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
