-- AlterTable: Add migration-first fields to OperationsCarrierDocument
ALTER TABLE "OperationsCarrierDocument"
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- CreateIndex
CREATE INDEX "OperationsCarrierDocument_tenantId_idx" ON "OperationsCarrierDocument"("tenantId");

-- CreateIndex
CREATE INDEX "OperationsCarrierDocument_externalId_sourceSystem_idx" ON "OperationsCarrierDocument"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "OperationsCarrier_tier_idx" ON "OperationsCarrier"("tier");
