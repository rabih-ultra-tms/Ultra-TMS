/*
  Warnings:

  - The values [REVIEWING] on the enum `LeadStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `activeFrom` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `activeTo` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Agent` table. All the data in the column will be lost.
  - You are about to alter the column `agentCode` on the `Agent` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - You are about to alter the column `externalId` on the `Agent` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `sourceSystem` on the `Agent` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to drop the column `calculationBasis` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `commissionRate` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `commissionType` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `flatAmount` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `hasSunset` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSystem` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `sunsetReductionPercent` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `sunsetStartMonth` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `AgentAgreement` table. All the data in the column will be lost.
  - You are about to alter the column `agreementNumber` on the `AgentAgreement` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.
  - The `status` column on the `AgentAgreement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `basisAmount` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `calculationBasis` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `commissionAmount` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `commissionRate` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `isSplit` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSystem` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `splitPercent` on the `AgentCommission` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `AgentCommission` table. All the data in the column will be lost.
  - The `commissionPeriod` column on the `AgentCommission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `contactName` on the `AgentContact` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `AgentContact` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `AgentContact` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `AgentContact` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `AgentContact` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSystem` on the `AgentContact` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `AgentContact` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `AgentContact` table. All the data in the column will be lost.
  - You are about to drop the column `assignedDate` on the `AgentCustomerAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `AgentCustomerAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `AgentCustomerAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `AgentCustomerAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `protectionEndsAt` on the `AgentCustomerAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `AgentCustomerAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSystem` on the `AgentCustomerAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `AgentCustomerAssignment` table. All the data in the column will be lost.
  - You are about to alter the column `splitPercent` on the `AgentCustomerAssignment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Decimal(5,4)`.
  - The `status` column on the `AgentCustomerAssignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdById` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `currentBalance` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `lastReconciliationDate` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSystem` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `totalDrawn` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `totalEarned` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `AgentDrawBalance` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `convertedToCustomerId` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `lastContactedAt` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `leadCompanyName` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `qualificationNotes` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSystem` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `submittedDate` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `AgentLead` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `AgentPayout` table. All the data in the column will be lost.
  - You are about to drop the column `deductions` on the `AgentPayout` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `AgentPayout` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `AgentPayout` table. All the data in the column will be lost.
  - You are about to drop the column `grossCommission` on the `AgentPayout` table. All the data in the column will be lost.
  - You are about to drop the column `netPayout` on the `AgentPayout` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSystem` on the `AgentPayout` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `AgentPayout` table. All the data in the column will be lost.
  - You are about to alter the column `payoutNumber` on the `AgentPayout` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.
  - The `status` column on the `AgentPayout` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `canSubmitLeads` on the `AgentPortalUser` table. All the data in the column will be lost.
  - You are about to drop the column `canViewCommissions` on the `AgentPortalUser` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `AgentPortalUser` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `AgentPortalUser` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `AgentPortalUser` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `AgentPortalUser` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSystem` on the `AgentPortalUser` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `AgentPortalUser` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `AgentPortalUser` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - A unique constraint covering the columns `[tenantId,agentCode]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agentId,customerId]` on the table `AgentCustomerAssignment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,leadNumber]` on the table `AgentLead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `AgentPortalUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyName` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactEmail` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactFirstName` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactLastName` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `splitType` to the `AgentAgreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commissionBase` to the `AgentCommission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grossCommission` to the `AgentCommission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netCommission` to the `AgentCommission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `splitRate` to the `AgentCommission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `splitType` to the `AgentCommission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `AgentContact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `AgentContact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `protectionStart` to the `AgentCustomerAssignment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `assignmentType` on the `AgentCustomerAssignment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `drawAmount` to the `AgentDrawBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `AgentDrawBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `AgentLead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactFirstName` to the `AgentLead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactLastName` to the `AgentLead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leadNumber` to the `AgentLead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grossCommissions` to the `AgentPayout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netAmount` to the `AgentPayout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `AgentPortalUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `AgentPortalUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `AgentPortalUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `AgentPortalUser` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AgentTier" AS ENUM ('STANDARD', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('PRIMARY', 'SECONDARY', 'SPLIT');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'SUNSET', 'TRANSFERRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "CommissionSplitType" AS ENUM ('PERCENT_OF_REP', 'PERCENT_OF_MARGIN', 'FLAT_PER_LOAD', 'TIERED');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AgentPayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "LeadStatus_new" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'QUALIFIED', 'WORKING', 'CONVERTED', 'REJECTED', 'EXPIRED');
ALTER TABLE "public"."AgentLead" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AgentLead" ALTER COLUMN "status" TYPE "LeadStatus_new" USING ("status"::text::"LeadStatus_new");
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";
DROP TYPE "public"."LeadStatus_old";
ALTER TABLE "AgentLead" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- DropForeignKey
ALTER TABLE "AgentLead" DROP CONSTRAINT "AgentLead_convertedToCustomerId_fkey";

-- DropForeignKey
ALTER TABLE "AgentPortalUser" DROP CONSTRAINT "AgentPortalUser_userId_fkey";

-- DropIndex
DROP INDEX "Agent_agentCode_idx";

-- DropIndex
DROP INDEX "Agent_agentCode_key";

-- DropIndex
DROP INDEX "Agent_externalId_sourceSystem_idx";

-- DropIndex
DROP INDEX "AgentAgreement_agreementNumber_key";

-- DropIndex
DROP INDEX "AgentAgreement_externalId_sourceSystem_idx";

-- DropIndex
DROP INDEX "AgentAgreement_tenantId_idx";

-- DropIndex
DROP INDEX "AgentCommission_externalId_sourceSystem_idx";

-- DropIndex
DROP INDEX "AgentContact_externalId_sourceSystem_idx";

-- DropIndex
DROP INDEX "AgentCustomerAssignment_agentId_idx";

-- DropIndex
DROP INDEX "AgentCustomerAssignment_externalId_sourceSystem_idx";

-- DropIndex
DROP INDEX "AgentDrawBalance_agentId_key";

-- DropIndex
DROP INDEX "AgentDrawBalance_externalId_sourceSystem_idx";

-- DropIndex
DROP INDEX "AgentLead_convertedToCustomerId_idx";

-- DropIndex
DROP INDEX "AgentLead_externalId_sourceSystem_idx";

-- DropIndex
DROP INDEX "AgentLead_submittedDate_idx";

-- DropIndex
DROP INDEX "AgentLead_tenantId_idx";

-- DropIndex
DROP INDEX "AgentPayout_externalId_sourceSystem_idx";

-- DropIndex
DROP INDEX "AgentPayout_payoutNumber_idx";

-- DropIndex
DROP INDEX "AgentPayout_payoutNumber_key";

-- DropIndex
DROP INDEX "AgentPayout_periodStart_idx";

-- DropIndex
DROP INDEX "AgentPortalUser_agentId_userId_key";

-- DropIndex
DROP INDEX "AgentPortalUser_externalId_sourceSystem_idx";

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "companyName" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "contactEmail" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "contactFirstName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "contactLastName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "contactPhone" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "addressLine1" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "addressLine2" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "city" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "state" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "zip" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "country" VARCHAR(3) DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS "dbaName" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "legalEntityType" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "taxId" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "territories" JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "industryFocus" JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "agentType" "AgentType", -- noop placeholder when recreating model
ADD COLUMN IF NOT EXISTS "status" "AgentStatus" DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "applicationDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "backgroundCheckStatus" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "backgroundCheckDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trainingCompleted" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "trainingCompletedDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "agreementSignedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "agreementVersion" INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS "activatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "activatedBy" TEXT,
ADD COLUMN IF NOT EXISTS "tier" "AgentTier" DEFAULT 'STANDARD',
ADD COLUMN IF NOT EXISTS "paymentMethod" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "bankName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "bankRouting" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "bankAccount" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "bankAccountType" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "terminatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "terminatedBy" TEXT,
ADD COLUMN IF NOT EXISTS "terminationReason" TEXT;

-- Backfill Agent new columns from legacy fields
UPDATE "Agent"
SET "companyName" = COALESCE("companyName", "name", 'Unknown Agent'),
    "contactEmail" = COALESCE("contactEmail", "email", CONCAT('agent+', id, '@placeholder.local')),
    "contactFirstName" = COALESCE("contactFirstName", SPLIT_PART(COALESCE("name", 'Unknown Agent'), ' ', 1)),
    "contactLastName" = COALESCE(
      "contactLastName",
      NULLIF(REGEXP_REPLACE(COALESCE("name", 'Unknown Agent'), '^[^ ]+\\s*', ''), ''),
      'Agent'
    ),
    "contactPhone" = COALESCE("contactPhone", "phone");

-- Finalize Agent column shapes and drop legacy fields
ALTER TABLE "Agent" DROP COLUMN "activeFrom",
DROP COLUMN "activeTo",
DROP COLUMN "address",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "updatedById",
ALTER COLUMN "companyName" SET NOT NULL,
ALTER COLUMN "contactEmail" SET NOT NULL,
ALTER COLUMN "contactFirstName" SET NOT NULL,
ALTER COLUMN "contactLastName" SET NOT NULL,
ALTER COLUMN "country" SET DEFAULT 'USA',
ALTER COLUMN "territories" SET DEFAULT '[]',
ALTER COLUMN "industryFocus" SET DEFAULT '[]',
ALTER COLUMN "tier" SET DEFAULT 'STANDARD',
ALTER COLUMN "trainingCompleted" SET DEFAULT false,
ALTER COLUMN "agentCode" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "externalId" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "sourceSystem" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "AgentAgreement" DROP COLUMN "calculationBasis",
DROP COLUMN "commissionRate",
DROP COLUMN "commissionType",
DROP COLUMN "createdById",
DROP COLUMN "customFields",
DROP COLUMN "deletedAt",
DROP COLUMN "description",
DROP COLUMN "externalId",
DROP COLUMN "flatAmount",
DROP COLUMN "hasSunset",
DROP COLUMN "sourceSystem",
DROP COLUMN "sunsetReductionPercent",
DROP COLUMN "sunsetStartMonth",
DROP COLUMN "updatedById",
ADD COLUMN     "drawAmount" DECIMAL(10,2),
ADD COLUMN     "drawFrequency" VARCHAR(20),
ADD COLUMN     "drawRecoverable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minimumPayout" DECIMAL(10,2) NOT NULL DEFAULT 100,
ADD COLUMN     "minimumPerLoad" DECIMAL(10,2),
ADD COLUMN     "name" VARCHAR(200),
ADD COLUMN     "paymentDay" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "previousAgreementId" TEXT,
ADD COLUMN     "splitRate" DECIMAL(5,4),
ADD COLUMN     "splitType" "CommissionSplitType" NOT NULL DEFAULT 'PERCENT_OF_MARGIN',
ADD COLUMN     "sunsetEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sunsetPeriodMonths" INTEGER DEFAULT 12,
ADD COLUMN     "sunsetSchedule" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "tiers" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "agreementNumber" SET DATA TYPE VARCHAR(30),
DROP COLUMN "status",
ADD COLUMN     "status" "AgreementStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "AgentCommission" DROP COLUMN "basisAmount",
DROP COLUMN "calculationBasis",
DROP COLUMN "commissionAmount",
DROP COLUMN "commissionRate",
DROP COLUMN "createdById",
DROP COLUMN "customFields",
DROP COLUMN "deletedAt",
DROP COLUMN "externalId",
DROP COLUMN "isSplit",
DROP COLUMN "sourceSystem",
DROP COLUMN "splitPercent",
DROP COLUMN "updatedById",
ADD COLUMN     "adjustments" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "assignmentId" TEXT,
ADD COLUMN     "commissionBase" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "grossCommission" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "loadMargin" DECIMAL(12,2),
ADD COLUMN     "loadRevenue" DECIMAL(12,2),
ADD COLUMN     "netCommission" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "payoutId" TEXT,
ADD COLUMN     "salesRepCommission" DECIMAL(10,2),
ADD COLUMN     "splitRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
ADD COLUMN     "splitType" "CommissionSplitType" NOT NULL DEFAULT 'PERCENT_OF_MARGIN',
DROP COLUMN "commissionPeriod",
ADD COLUMN     "commissionPeriod" VARCHAR(7);

-- AlterTable
ALTER TABLE "AgentContact" ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "mobile" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "role" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "hasPortalAccess" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

UPDATE "AgentContact"
SET "firstName" = COALESCE("firstName", SPLIT_PART(COALESCE("contactName", 'Unknown Contact'), ' ', 1)),
    "lastName"  = COALESCE(
      "lastName",
      NULLIF(REGEXP_REPLACE(COALESCE("contactName", 'Unknown Contact'), '^[^ ]+\\s*', ''), ''),
      'Contact'
    );

ALTER TABLE "AgentContact" DROP COLUMN "contactName",
DROP COLUMN "createdById",
DROP COLUMN "customFields",
DROP COLUMN "deletedAt",
DROP COLUMN "externalId",
DROP COLUMN "sourceSystem",
DROP COLUMN "title",
DROP COLUMN "updatedById",
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "hasPortalAccess" SET DEFAULT false,
ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "AgentCustomerAssignment" DROP COLUMN "assignedDate",
DROP COLUMN "customFields",
DROP COLUMN "deletedAt",
DROP COLUMN "externalId",
DROP COLUMN "protectionEndsAt",
DROP COLUMN "releaseDate",
DROP COLUMN "sourceSystem",
DROP COLUMN "updatedById",
ADD COLUMN     "currentSunsetRate" DECIMAL(5,4),
ADD COLUMN     "inSunset" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isProtected" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leadId" TEXT,
ADD COLUMN     "overrideReason" TEXT,
ADD COLUMN     "overrideSplitRate" DECIMAL(5,4),
ADD COLUMN     "protectionEnd" TIMESTAMP(3),
ADD COLUMN     "protectionStart" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
ADD COLUMN     "source" VARCHAR(50),
ADD COLUMN     "sunsetStartDate" TIMESTAMP(3),
ADD COLUMN     "terminatedAt" TIMESTAMP(3),
ADD COLUMN     "terminatedReason" TEXT,
ADD COLUMN     "transferredToAgentId" TEXT,
DROP COLUMN "assignmentType",
ADD COLUMN     "assignmentType" "AssignmentType" NOT NULL DEFAULT 'PRIMARY',
ALTER COLUMN "splitPercent" DROP NOT NULL,
ALTER COLUMN "splitPercent" DROP DEFAULT,
ALTER COLUMN "splitPercent" SET DATA TYPE DECIMAL(5,4),
DROP COLUMN "status",
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "AgentDrawBalance" DROP COLUMN "createdById",
DROP COLUMN "currentBalance",
DROP COLUMN "customFields",
DROP COLUMN "deletedAt",
DROP COLUMN "externalId",
DROP COLUMN "lastReconciliationDate",
DROP COLUMN "sourceSystem",
DROP COLUMN "totalDrawn",
DROP COLUMN "totalEarned",
DROP COLUMN "updatedById",
ADD COLUMN     "amountRecovered" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "carryoverBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "commissionsEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "drawAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "drawPaidAt" TIMESTAMP(3),
ADD COLUMN     "period" VARCHAR(7) NOT NULL DEFAULT '1970-01',
ADD COLUMN     "shortfall" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AgentLead" ADD COLUMN IF NOT EXISTS "leadNumber" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "companyName" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "contactFirstName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "contactLastName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "contactTitle" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "conversionDeadline" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "convertedCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "customerId" TEXT,
ADD COLUMN IF NOT EXISTS "equipmentNeeds" JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "estimatedMonthlyRevenue" DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS "estimatedMonthlyVolume" INTEGER,
ADD COLUMN IF NOT EXISTS "industry" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "leadSource" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "primaryLanes" JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "qualifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "qualifiedBy" TEXT,
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "state" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "website" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "assignedTo" TEXT,
ADD COLUMN IF NOT EXISTS "city" VARCHAR(100);

UPDATE "AgentLead"
SET "leadNumber" = COALESCE("leadNumber", CONCAT('LN-', id)),
    "companyName" = COALESCE("companyName", "leadCompanyName", 'Unknown Company'),
    "contactFirstName" = COALESCE("contactFirstName", SPLIT_PART(COALESCE("contactName", 'Unknown Lead'), ' ', 1)),
    "contactLastName" = COALESCE(
      "contactLastName",
      NULLIF(REGEXP_REPLACE(COALESCE("contactName", 'Unknown Lead'), '^[^ ]+\\s*', ''), ''),
      'Contact'
    );

ALTER TABLE "AgentLead" DROP COLUMN "contactName",
DROP COLUMN "convertedToCustomerId",
DROP COLUMN "createdAt",
DROP COLUMN "createdById",
DROP COLUMN "customFields",
DROP COLUMN "deletedAt",
DROP COLUMN "externalId",
DROP COLUMN "lastContactedAt",
DROP COLUMN "leadCompanyName",
DROP COLUMN "qualificationNotes",
DROP COLUMN "sourceSystem",
DROP COLUMN "submittedDate",
DROP COLUMN "updatedById",
ALTER COLUMN "leadNumber" SET NOT NULL,
ALTER COLUMN "companyName" SET NOT NULL,
ALTER COLUMN "contactFirstName" SET NOT NULL,
ALTER COLUMN "contactLastName" SET NOT NULL,
ALTER COLUMN "equipmentNeeds" SET DEFAULT '[]',
ALTER COLUMN "primaryLanes" SET DEFAULT '[]',
ALTER COLUMN "submittedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "AgentPayout" DROP COLUMN "customFields",
DROP COLUMN "deductions",
DROP COLUMN "deletedAt",
DROP COLUMN "externalId",
DROP COLUMN "grossCommission",
DROP COLUMN "netPayout",
DROP COLUMN "sourceSystem",
DROP COLUMN "updatedById",
ADD COLUMN     "adjustments" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "drawRecovery" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "grossCommissions" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "netAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentReference" VARCHAR(100),
ADD COLUMN     "statementDocumentId" TEXT,
ALTER COLUMN "payoutNumber" SET DATA TYPE VARCHAR(30),
DROP COLUMN "status",
ADD COLUMN     "status" "AgentPayoutStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "AgentPortalUser" ADD COLUMN IF NOT EXISTS "agentContactId" TEXT,
ADD COLUMN IF NOT EXISTS "email" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "passwordHash" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT 'ACTIVE';

UPDATE "AgentPortalUser"
SET "email" = COALESCE("email", CONCAT('agent-portal-', id, '@placeholder.local')),
    "firstName" = COALESCE("firstName", 'Portal'),
    "lastName" = COALESCE("lastName", 'User'),
    "passwordHash" = COALESCE("passwordHash", 'TEMP_HASH');

ALTER TABLE "AgentPortalUser" DROP COLUMN "canSubmitLeads",
DROP COLUMN "canViewCommissions",
DROP COLUMN "createdById",
DROP COLUMN "customFields",
DROP COLUMN "deletedAt",
DROP COLUMN "externalId",
DROP COLUMN "sourceSystem",
DROP COLUMN "updatedById",
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "passwordHash" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'USER',
ALTER COLUMN "role" SET DATA TYPE VARCHAR(20);

-- DropEnum
DROP TYPE "AgentAssignmentType";

-- CreateIndex
CREATE INDEX "Agent_contactEmail_idx" ON "Agent"("contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_tenantId_agentCode_key" ON "Agent"("tenantId", "agentCode");

-- CreateIndex
CREATE INDEX "AgentAgreement_status_idx" ON "AgentAgreement"("status");

-- CreateIndex
CREATE INDEX "AgentCommission_customerId_idx" ON "AgentCommission"("customerId");

-- CreateIndex
CREATE INDEX "AgentCommission_invoiceId_idx" ON "AgentCommission"("invoiceId");

-- CreateIndex
CREATE INDEX "AgentCommission_commissionPeriod_idx" ON "AgentCommission"("commissionPeriod");

-- CreateIndex
CREATE INDEX "AgentCustomerAssignment_status_idx" ON "AgentCustomerAssignment"("status");

-- CreateIndex
CREATE INDEX "AgentCustomerAssignment_assignmentType_idx" ON "AgentCustomerAssignment"("assignmentType");

-- CreateIndex
CREATE UNIQUE INDEX "AgentCustomerAssignment_agentId_customerId_key" ON "AgentCustomerAssignment"("agentId", "customerId");

-- CreateIndex
CREATE INDEX "AgentDrawBalance_agentId_idx" ON "AgentDrawBalance"("agentId");

-- CreateIndex
CREATE INDEX "AgentDrawBalance_period_idx" ON "AgentDrawBalance"("period");

-- CreateIndex
CREATE INDEX "AgentLead_conversionDeadline_idx" ON "AgentLead"("conversionDeadline");

-- CreateIndex
CREATE UNIQUE INDEX "AgentLead_tenantId_leadNumber_key" ON "AgentLead"("tenantId", "leadNumber");

-- CreateIndex
CREATE INDEX "AgentPayout_status_idx" ON "AgentPayout"("status");

-- CreateIndex
CREATE INDEX "AgentPayout_periodStart_periodEnd_idx" ON "AgentPayout"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPortalUser_tenantId_email_key" ON "AgentPortalUser"("tenantId", "email");

-- AddForeignKey
ALTER TABLE "AgentAgreement" ADD CONSTRAINT "AgentAgreement_previousAgreementId_fkey" FOREIGN KEY ("previousAgreementId") REFERENCES "AgentAgreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCustomerAssignment" ADD CONSTRAINT "AgentCustomerAssignment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "AgentLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "AgentCustomerAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "AgentPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLead" ADD CONSTRAINT "AgentLead_convertedCustomerId_fkey" FOREIGN KEY ("convertedCustomerId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPayout" ADD CONSTRAINT "AgentPayout_statementDocumentId_fkey" FOREIGN KEY ("statementDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPortalUser" ADD CONSTRAINT "AgentPortalUser_agentContactId_fkey" FOREIGN KEY ("agentContactId") REFERENCES "AgentContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPortalUser" ADD CONSTRAINT "AgentPortalUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
