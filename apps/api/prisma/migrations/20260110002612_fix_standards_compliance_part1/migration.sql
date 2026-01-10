/*
  Warnings:

  - Added the required column `tenantId` to the `CarrierContact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CarrierPerformanceHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CheckCall` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `ContractLaneRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FmcsaComplianceLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HubspotSyncLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `InvoiceLineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InvoiceLineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `PaymentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PaymentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `QuoteAccessorial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `QuoteAccessorial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `QuoteStop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `SettlementLineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SettlementLineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StatusHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccessorialRate" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CarrierContact" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CarrierDocument" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CarrierPerformanceHistory" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CheckCall" ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "ContractLaneRate" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "FmcsaComplianceLog" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "HubspotSyncLog" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "InsuranceCertificate" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "InvoiceLineItem" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Load" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "PasswordResetToken" ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PaymentApplication" ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "PaymentMade" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "PaymentReceived" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "QuoteAccessorial" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "QuoteStop" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "SalesQuota" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Settlement" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SettlementLineItem" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "StatusHistory" ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Stop" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- CreateIndex
CREATE INDEX "CarrierDocument_externalId_sourceSystem_idx" ON "CarrierDocument"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ChartOfAccount_externalId_sourceSystem_idx" ON "ChartOfAccount"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CheckCall_externalId_sourceSystem_idx" ON "CheckCall"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Driver_externalId_sourceSystem_idx" ON "Driver"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "FmcsaComplianceLog_externalId_sourceSystem_idx" ON "FmcsaComplianceLog"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "InsuranceCertificate_externalId_sourceSystem_idx" ON "InsuranceCertificate"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Invoice_externalId_sourceSystem_idx" ON "Invoice"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_tenantId_idx" ON "InvoiceLineItem"("tenantId");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_externalId_sourceSystem_idx" ON "InvoiceLineItem"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "OrderItem_externalId_sourceSystem_idx" ON "OrderItem"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "PaymentApplication_tenantId_idx" ON "PaymentApplication"("tenantId");

-- CreateIndex
CREATE INDEX "PaymentApplication_externalId_sourceSystem_idx" ON "PaymentApplication"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "PaymentMade_externalId_sourceSystem_idx" ON "PaymentMade"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "PaymentReceived_externalId_sourceSystem_idx" ON "PaymentReceived"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Settlement_externalId_sourceSystem_idx" ON "Settlement"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SettlementLineItem_tenantId_idx" ON "SettlementLineItem"("tenantId");

-- CreateIndex
CREATE INDEX "SettlementLineItem_externalId_sourceSystem_idx" ON "SettlementLineItem"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "StatusHistory_externalId_sourceSystem_idx" ON "StatusHistory"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Stop_externalId_sourceSystem_idx" ON "Stop"("externalId", "sourceSystem");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteStop" ADD CONSTRAINT "QuoteStop_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteAccessorial" ADD CONSTRAINT "QuoteAccessorial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractLaneRate" ADD CONSTRAINT "ContractLaneRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierContact" ADD CONSTRAINT "CarrierContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLineItem" ADD CONSTRAINT "SettlementLineItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentApplication" ADD CONSTRAINT "PaymentApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
