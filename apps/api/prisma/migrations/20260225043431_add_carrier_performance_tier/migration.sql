/*
  Warnings:

  - You are about to drop the `equipment_dimensions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `makes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `models` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "equipment_dimensions" DROP CONSTRAINT "equipment_dimensions_model_id_fkey";

-- DropForeignKey
ALTER TABLE "models" DROP CONSTRAINT "models_make_id_fkey";

-- DropForeignKey
ALTER TABLE "rates" DROP CONSTRAINT "rates_make_id_fkey";

-- DropForeignKey
ALTER TABLE "rates" DROP CONSTRAINT "rates_model_id_fkey";

-- AlterTable
ALTER TABLE "Load" ALTER COLUMN "orderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LoadPlannerCargoItem" ADD COLUMN     "loadType" VARCHAR(100),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "parentCargoId" TEXT,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "imageUrl1" SET DATA TYPE VARCHAR(2000),
ALTER COLUMN "imageUrl2" SET DATA TYPE VARCHAR(2000),
ALTER COLUMN "imageUrl3" SET DATA TYPE VARCHAR(2000),
ALTER COLUMN "imageUrl4" SET DATA TYPE VARCHAR(2000);

-- AlterTable
ALTER TABLE "LoadPlannerQuote" ALTER COLUMN "customerPhone" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "OperationsCarrier" ADD COLUMN     "acceptanceRate" DECIMAL(5,2),
ADD COLUMN     "avgRating" DECIMAL(3,2),
ADD COLUMN     "claimsRate" DECIMAL(5,2),
ADD COLUMN     "equipmentTypes" TEXT[],
ADD COLUMN     "onTimeDeliveryRate" DECIMAL(5,2),
ADD COLUMN     "onTimePickupRate" DECIMAL(5,2),
ADD COLUMN     "performanceScore" DECIMAL(5,2),
ADD COLUMN     "qualificationTier" VARCHAR(50),
ADD COLUMN     "tier" VARCHAR(20),
ADD COLUMN     "totalLoadsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trailerCount" INTEGER,
ADD COLUMN     "truckCount" INTEGER;

-- DropTable
DROP TABLE "equipment_dimensions";

-- DropTable
DROP TABLE "makes";

-- DropTable
DROP TABLE "models";

-- DropTable
DROP TABLE "rates";

-- CreateTable
CREATE TABLE "OperationsCarrierDocument" (
    "id" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "documentType" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "expiryDate" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OperationsCarrierDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantService" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serviceKey" VARCHAR(50) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "TenantService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationsCarrierDocument_carrierId_idx" ON "OperationsCarrierDocument"("carrierId");

-- CreateIndex
CREATE INDEX "OperationsCarrierDocument_status_idx" ON "OperationsCarrierDocument"("status");

-- CreateIndex
CREATE INDEX "TenantService_tenantId_idx" ON "TenantService"("tenantId");

-- CreateIndex
CREATE INDEX "TenantService_serviceKey_idx" ON "TenantService"("serviceKey");

-- CreateIndex
CREATE UNIQUE INDEX "TenantService_tenantId_serviceKey_key" ON "TenantService"("tenantId", "serviceKey");

-- CreateIndex
CREATE INDEX "LoadPlannerCargoItem_parentCargoId_idx" ON "LoadPlannerCargoItem"("parentCargoId");

-- AddForeignKey
ALTER TABLE "OperationsCarrierDocument" ADD CONSTRAINT "OperationsCarrierDocument_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "OperationsCarrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantService" ADD CONSTRAINT "TenantService_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
