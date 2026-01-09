-- CreateTable
CREATE TABLE "CommunicationTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50),
    "channel" VARCHAR(50) NOT NULL,
    "subjectEn" VARCHAR(500),
    "subjectEs" VARCHAR(500),
    "bodyEn" TEXT NOT NULL,
    "bodyEs" TEXT,
    "fromName" VARCHAR(255),
    "fromEmail" VARCHAR(255),
    "replyTo" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "CommunicationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "templateId" TEXT,
    "templateCode" VARCHAR(100),
    "recipientType" VARCHAR(50),
    "recipientId" TEXT,
    "recipientEmail" VARCHAR(255),
    "recipientPhone" VARCHAR(50),
    "recipientName" VARCHAR(255),
    "subject" VARCHAR(500),
    "body" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "attachments" JSONB,
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "provider" VARCHAR(50),
    "providerMessageId" VARCHAR(255),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastRetryAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "CommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsConversation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "phoneNumber" VARCHAR(50) NOT NULL,
    "participantType" VARCHAR(50),
    "participantId" TEXT,
    "participantName" VARCHAR(255),
    "loadId" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMP(3),
    "lastMessagePreview" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" VARCHAR(20) NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrls" JSONB,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "providerMessageId" VARCHAR(255),
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "SmsMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loadAssigned" BOOLEAN NOT NULL DEFAULT true,
    "loadStatusChange" BOOLEAN NOT NULL DEFAULT true,
    "documentReceived" BOOLEAN NOT NULL DEFAULT true,
    "invoiceCreated" BOOLEAN NOT NULL DEFAULT true,
    "paymentReceived" BOOLEAN NOT NULL DEFAULT true,
    "claimFiled" BOOLEAN NOT NULL DEFAULT true,
    "carrierExpiring" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" VARCHAR(5),
    "quietHoursEnd" VARCHAR(5),
    "quietHoursTimezone" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InAppNotification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "icon" VARCHAR(50),
    "actionUrl" VARCHAR(500),
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InAppNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunicationTemplate_tenantId_idx" ON "CommunicationTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "CommunicationTemplate_code_idx" ON "CommunicationTemplate"("code");

-- CreateIndex
CREATE INDEX "CommunicationTemplate_channel_idx" ON "CommunicationTemplate"("channel");

-- CreateIndex
CREATE INDEX "CommunicationTemplate_category_idx" ON "CommunicationTemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationTemplate_tenantId_code_channel_key" ON "CommunicationTemplate"("tenantId", "code", "channel");

-- CreateIndex
CREATE INDEX "CommunicationLog_tenantId_idx" ON "CommunicationLog"("tenantId");

-- CreateIndex
CREATE INDEX "CommunicationLog_recipientType_recipientId_idx" ON "CommunicationLog"("recipientType", "recipientId");

-- CreateIndex
CREATE INDEX "CommunicationLog_entityType_entityId_idx" ON "CommunicationLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CommunicationLog_status_idx" ON "CommunicationLog"("status");

-- CreateIndex
CREATE INDEX "CommunicationLog_channel_idx" ON "CommunicationLog"("channel");

-- CreateIndex
CREATE INDEX "CommunicationLog_createdAt_idx" ON "CommunicationLog"("createdAt");

-- CreateIndex
CREATE INDEX "CommunicationLog_templateCode_idx" ON "CommunicationLog"("templateCode");

-- CreateIndex
CREATE INDEX "SmsConversation_tenantId_idx" ON "SmsConversation"("tenantId");

-- CreateIndex
CREATE INDEX "SmsConversation_phoneNumber_idx" ON "SmsConversation"("phoneNumber");

-- CreateIndex
CREATE INDEX "SmsConversation_participantType_participantId_idx" ON "SmsConversation"("participantType", "participantId");

-- CreateIndex
CREATE INDEX "SmsConversation_loadId_idx" ON "SmsConversation"("loadId");

-- CreateIndex
CREATE UNIQUE INDEX "SmsConversation_tenantId_phoneNumber_loadId_key" ON "SmsConversation"("tenantId", "phoneNumber", "loadId");

-- CreateIndex
CREATE INDEX "SmsMessage_conversationId_idx" ON "SmsMessage"("conversationId");

-- CreateIndex
CREATE INDEX "SmsMessage_direction_idx" ON "SmsMessage"("direction");

-- CreateIndex
CREATE INDEX "SmsMessage_status_idx" ON "SmsMessage"("status");

-- CreateIndex
CREATE INDEX "SmsMessage_createdAt_idx" ON "SmsMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_tenantId_idx" ON "NotificationPreference"("tenantId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_tenantId_userId_key" ON "NotificationPreference"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "InAppNotification_tenantId_idx" ON "InAppNotification"("tenantId");

-- CreateIndex
CREATE INDEX "InAppNotification_userId_idx" ON "InAppNotification"("userId");

-- CreateIndex
CREATE INDEX "InAppNotification_isRead_idx" ON "InAppNotification"("isRead");

-- CreateIndex
CREATE INDEX "InAppNotification_type_idx" ON "InAppNotification"("type");

-- CreateIndex
CREATE INDEX "InAppNotification_createdAt_idx" ON "InAppNotification"("createdAt");

-- AddForeignKey
ALTER TABLE "CommunicationTemplate" ADD CONSTRAINT "CommunicationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLog" ADD CONSTRAINT "CommunicationLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLog" ADD CONSTRAINT "CommunicationLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CommunicationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsConversation" ADD CONSTRAINT "SmsConversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SmsConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
