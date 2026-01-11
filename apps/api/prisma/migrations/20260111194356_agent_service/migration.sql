/*
  Warnings:

  - You are about to drop the column `agreementSignedAt` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `agreementVersion` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `AgentLead` table. All the data in the column will be lost.
  - Made the column `country` on table `Agent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `territories` on table `Agent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industryFocus` on table `Agent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trainingCompleted` on table `Agent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tier` on table `Agent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hasPortalAccess` on table `AgentContact` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `AgentContact` required. This step will fail if there are existing NULL values in that column.
  - Made the column `equipmentNeeds` on table `AgentLead` required. This step will fail if there are existing NULL values in that column.
  - Made the column `primaryLanes` on table `AgentLead` required. This step will fail if there are existing NULL values in that column.
  - Made the column `submittedAt` on table `AgentLead` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "agreementSignedAt",
DROP COLUMN "agreementVersion",
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "territories" SET NOT NULL,
ALTER COLUMN "industryFocus" SET NOT NULL,
ALTER COLUMN "trainingCompleted" SET NOT NULL,
ALTER COLUMN "tier" SET NOT NULL;

-- AlterTable
ALTER TABLE "AgentAgreement" ALTER COLUMN "splitType" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AgentCommission" ALTER COLUMN "commissionBase" DROP DEFAULT,
ALTER COLUMN "grossCommission" DROP DEFAULT,
ALTER COLUMN "netCommission" DROP DEFAULT,
ALTER COLUMN "splitRate" DROP DEFAULT,
ALTER COLUMN "splitType" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AgentContact" ALTER COLUMN "hasPortalAccess" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- AlterTable
ALTER TABLE "AgentCustomerAssignment" ALTER COLUMN "protectionStart" DROP DEFAULT,
ALTER COLUMN "assignmentType" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AgentDrawBalance" ALTER COLUMN "drawAmount" DROP DEFAULT,
ALTER COLUMN "period" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AgentLead" DROP COLUMN "customerId",
ALTER COLUMN "equipmentNeeds" SET NOT NULL,
ALTER COLUMN "primaryLanes" SET NOT NULL,
ALTER COLUMN "submittedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "AgentPayout" ALTER COLUMN "grossCommissions" DROP DEFAULT,
ALTER COLUMN "netAmount" DROP DEFAULT;
