-- DropIndex
DROP INDEX "FuelSurchargeTier_tableId_tierNumber_key";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Carrier_tenantId_deletedAt_status_idx" ON "Carrier"("tenantId", "deletedAt", "status");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_deletedAt_createdAt_idx" ON "Invoice"("tenantId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Load_tenantId_deletedAt_status_idx" ON "Load"("tenantId", "deletedAt", "status");
