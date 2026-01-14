/*
  Warnings:

  - You are about to drop the column `attempt` on the `JobExecution` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `JobExecution` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId,code]` on the table `ScheduledJob` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `handler` to the `ScheduledTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledAt` to the `ScheduledTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "JobExecution_jobId_idx";

-- DropIndex
DROP INDEX "JobExecution_startedAt_idx";

-- DropIndex
DROP INDEX "JobExecution_status_idx";

-- DropIndex
DROP INDEX "Reminder_entityType_entityId_idx";

-- DropIndex
DROP INDEX "Reminder_reminderType_idx";

-- DropIndex
DROP INDEX "ScheduledTask_entityType_entityId_idx";

-- DropIndex
DROP INDEX "ScheduledTask_scheduledFor_idx";

-- AlterTable
ALTER TABLE "JobExecution" DROP COLUMN "attempt",
DROP COLUMN "duration",
ADD COLUMN     "attemptNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "executionNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "parameters" JSONB,
ADD COLUMN     "progressMessage" TEXT,
ADD COLUMN     "progressPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "retryOf" TEXT,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "willRetry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workerHostname" VARCHAR(255),
ADD COLUMN     "workerId" VARCHAR(100);

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dismissedAt" TIMESTAMP(3),
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationChannels" JSONB NOT NULL DEFAULT '["in_app"]',
ADD COLUMN     "recurrenceEndDate" TIMESTAMP(3),
ADD COLUMN     "recurrenceRule" VARCHAR(255),
ADD COLUMN     "referenceId" VARCHAR(255),
ADD COLUMN     "referenceType" VARCHAR(50),
ADD COLUMN     "referenceUrl" VARCHAR(500),
ADD COLUMN     "snoozeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timezone" VARCHAR(100),
ALTER COLUMN "reminderType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ScheduledJob" ADD COLUMN     "allowConcurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "code" VARCHAR(100),
ADD COLUMN     "failureCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "handler" VARCHAR(255) NOT NULL DEFAULT 'noop',
ADD COLUMN     "intervalSeconds" INTEGER,
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastRunDurationMs" INTEGER,
ADD COLUMN     "maxInstances" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxRetries" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "queue" VARCHAR(100) NOT NULL DEFAULT 'default',
ADD COLUMN     "retryDelaySeconds" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "runAt" TIMESTAMP(3),
ADD COLUMN     "runCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timeoutSeconds" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN     "timezone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
ALTER COLUMN "handlerName" DROP NOT NULL,
ALTER COLUMN "timeoutMinutes" DROP NOT NULL,
ALTER COLUMN "timeoutMinutes" DROP DEFAULT,
ALTER COLUMN "retryAttempts" DROP NOT NULL,
ALTER COLUMN "retryAttempts" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ScheduledTask" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "handler" VARCHAR(255) NOT NULL,
ADD COLUMN     "payload" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "referenceId" VARCHAR(255),
ADD COLUMN     "referenceType" VARCHAR(50),
ADD COLUMN     "scheduledAt" TIMESTAMP NOT NULL,
ADD COLUMN     "timeoutSeconds" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "timezone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
ALTER COLUMN "taskName" DROP NOT NULL,
ALTER COLUMN "scheduledFor" DROP NOT NULL,
ALTER COLUMN "taskData" DROP NOT NULL,
ALTER COLUMN "taskData" DROP DEFAULT;

-- CreateTable
CREATE TABLE "JobDependency" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "dependsOnJobId" TEXT NOT NULL,
    "dependencyType" VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobLock" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "tenantId" TEXT,
    "workerId" VARCHAR(100) NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastHeartbeat" TIMESTAMP(3),

    CONSTRAINT "JobLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTemplate" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "handler" TEXT NOT NULL,
    "defaultSchedule" TEXT,
    "defaultParameters" JSONB NOT NULL DEFAULT '{}',
    "isSystemRequired" BOOLEAN NOT NULL DEFAULT false,
    "isTenantConfigurable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAlert" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "alertType" VARCHAR(50) NOT NULL,
    "thresholdValue" INTEGER,
    "notificationChannels" JSONB NOT NULL,
    "recipients" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobDependency_jobId_dependsOnJobId_key" ON "JobDependency"("jobId", "dependsOnJobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobLock_jobId_key" ON "JobLock"("jobId");

-- CreateIndex
CREATE INDEX "JobLock_expiresAt_idx" ON "JobLock"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobTemplate_code_key" ON "JobTemplate"("code");

-- CreateIndex
CREATE INDEX "JobExecution_jobId_createdAt_idx" ON "JobExecution"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "JobExecution_status_scheduledAt_idx" ON "JobExecution"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "JobExecution_tenantId_createdAt_idx" ON "JobExecution"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "JobExecution_retryOf_idx" ON "JobExecution"("retryOf");

-- CreateIndex
CREATE INDEX "Reminder_referenceType_referenceId_idx" ON "Reminder"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "ScheduledJob_queue_priority_idx" ON "ScheduledJob"("queue", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledJob_tenantId_code_key" ON "ScheduledJob"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ScheduledTask_scheduledAt_status_idx" ON "ScheduledTask"("scheduledAt", "status");

-- CreateIndex
CREATE INDEX "ScheduledTask_referenceType_referenceId_idx" ON "ScheduledTask"("referenceType", "referenceId");

-- AddForeignKey
ALTER TABLE "JobDependency" ADD CONSTRAINT "JobDependency_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScheduledJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDependency" ADD CONSTRAINT "JobDependency_dependsOnJobId_fkey" FOREIGN KEY ("dependsOnJobId") REFERENCES "ScheduledJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLock" ADD CONSTRAINT "JobLock_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScheduledJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAlert" ADD CONSTRAINT "JobAlert_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScheduledJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
