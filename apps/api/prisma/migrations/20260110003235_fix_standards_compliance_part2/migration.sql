/*
  Warnings:

  - You are about to drop the column `createdBy` on the `CommissionEntry` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `CommissionPayout` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `CommissionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `DocumentFolder` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `DocumentShare` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `DocumentTemplate` table. All the data in the column will be lost.
  - Added the required column `tenantId` to the `CarrierLoadView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CarrierLoadView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CommissionPlanTier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CommunicationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DocumentShare` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FolderDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `GeneratedDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InAppNotification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `JournalEntryLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `JournalEntryLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LoadTender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `QuickbooksSyncLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SmsMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `TenderRecipient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TenderRecipient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DocumentFolder" DROP CONSTRAINT "DocumentFolder_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "DocumentShare" DROP CONSTRAINT "DocumentShare_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "DocumentTemplate" DROP CONSTRAINT "DocumentTemplate_createdBy_fkey";

-- AlterTable
ALTER TABLE "CarrierLoadView" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CommissionEntry" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CommissionPayout" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CommissionPlan" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CommissionPlanTier" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CommunicationLog" ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CommunicationTemplate" ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "CustomerCommissionOverride" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "DocumentFolder" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "DocumentShare" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "DocumentTemplate" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "FolderDocument" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "GeneratedDocument" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "InAppNotification" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "JournalEntryLine" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "LoadBid" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "LoadPosting" ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "LoadTender" ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "NotificationPreference" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "QuickbooksSyncLog" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "SmsConversation" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "SmsMessage" ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "TenderRecipient" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "UserCommissionAssignment" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" VARCHAR(255),
ADD COLUMN     "sourceSystem" VARCHAR(100),
ADD COLUMN     "updatedById" TEXT;

-- CreateIndex
CREATE INDEX "CarrierLoadView_tenantId_idx" ON "CarrierLoadView"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierLoadView_externalId_sourceSystem_idx" ON "CarrierLoadView"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CommissionEntry_externalId_sourceSystem_idx" ON "CommissionEntry"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CommissionPayout_externalId_sourceSystem_idx" ON "CommissionPayout"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CommissionPlan_externalId_sourceSystem_idx" ON "CommissionPlan"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CommissionPlanTier_externalId_sourceSystem_idx" ON "CommissionPlanTier"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CommunicationLog_externalId_sourceSystem_idx" ON "CommunicationLog"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CommunicationTemplate_externalId_sourceSystem_idx" ON "CommunicationTemplate"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CustomerCommissionOverride_externalId_sourceSystem_idx" ON "CustomerCommissionOverride"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Document_externalId_sourceSystem_idx" ON "Document"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "DocumentFolder_externalId_sourceSystem_idx" ON "DocumentFolder"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "DocumentShare_externalId_sourceSystem_idx" ON "DocumentShare"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "DocumentTemplate_externalId_sourceSystem_idx" ON "DocumentTemplate"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "GeneratedDocument_externalId_sourceSystem_idx" ON "GeneratedDocument"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "InAppNotification_externalId_sourceSystem_idx" ON "InAppNotification"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "JournalEntryLine_tenantId_idx" ON "JournalEntryLine"("tenantId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_externalId_sourceSystem_idx" ON "JournalEntryLine"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "LoadBid_externalId_sourceSystem_idx" ON "LoadBid"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "LoadPosting_externalId_sourceSystem_idx" ON "LoadPosting"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "LoadTender_externalId_sourceSystem_idx" ON "LoadTender"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "NotificationPreference_externalId_sourceSystem_idx" ON "NotificationPreference"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "QuickbooksSyncLog_externalId_sourceSystem_idx" ON "QuickbooksSyncLog"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SmsConversation_externalId_sourceSystem_idx" ON "SmsConversation"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SmsMessage_externalId_sourceSystem_idx" ON "SmsMessage"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "TenderRecipient_tenantId_idx" ON "TenderRecipient"("tenantId");

-- CreateIndex
CREATE INDEX "TenderRecipient_externalId_sourceSystem_idx" ON "TenderRecipient"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "UserCommissionAssignment_externalId_sourceSystem_idx" ON "UserCommissionAssignment"("externalId", "sourceSystem");

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierLoadView" ADD CONSTRAINT "CarrierLoadView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderRecipient" ADD CONSTRAINT "TenderRecipient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
