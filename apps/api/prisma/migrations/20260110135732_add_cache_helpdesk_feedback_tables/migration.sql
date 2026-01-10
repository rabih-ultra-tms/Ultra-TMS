-- CreateTable
CREATE TABLE "CacheStats" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "statDate" DATE NOT NULL,
    "statHour" INTEGER NOT NULL,
    "cacheType" VARCHAR(50) NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "misses" INTEGER NOT NULL DEFAULT 0,
    "sets" INTEGER NOT NULL DEFAULT 0,
    "deletes" INTEGER NOT NULL DEFAULT 0,
    "expirations" INTEGER NOT NULL DEFAULT 0,
    "keysCount" INTEGER,
    "memoryBytes" BIGINT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CacheStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CacheInvalidationRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "triggerEvent" VARCHAR(100) NOT NULL,
    "cachePattern" VARCHAR(200) NOT NULL,
    "invalidationType" VARCHAR(20) NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CacheInvalidationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributedLock" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "lockKey" VARCHAR(200) NOT NULL,
    "holderId" VARCHAR(100) NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "purpose" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "DistributedLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTeam" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "email" VARCHAR(255),
    "autoAssign" BOOLEAN NOT NULL DEFAULT false,
    "assignmentMethod" VARCHAR(20) NOT NULL DEFAULT 'ROUND_ROBIN',
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SupportTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    "maxOpenTickets" INTEGER NOT NULL DEFAULT 20,
    "currentTicketCount" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SupportTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlaPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "conditions" JSONB NOT NULL,
    "firstResponseTarget" INTEGER NOT NULL,
    "resolutionTarget" INTEGER NOT NULL,
    "useBusinessHours" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SlaPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "triggerType" VARCHAR(30) NOT NULL,
    "triggerMinutes" INTEGER,
    "conditions" JSONB,
    "actionType" VARCHAR(30) NOT NULL,
    "actionConfig" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EscalationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CannedResponse" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(100),
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CannedResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureRequestVote" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT,
    "voterEmail" VARCHAR(255),
    "voteWeight" INTEGER NOT NULL DEFAULT 1,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FeatureRequestVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureRequestComment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "authorType" VARCHAR(20) NOT NULL,
    "authorUserId" TEXT,
    "authorName" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FeatureRequestComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "surveyType" VARCHAR(30) NOT NULL,
    "questions" JSONB NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "requireAllQuestions" BOOLEAN NOT NULL DEFAULT false,
    "showProgress" BOOLEAN NOT NULL DEFAULT true,
    "thankYouMessage" TEXT,
    "redirectUrl" VARCHAR(500),
    "triggerEvent" VARCHAR(100),
    "targetSegment" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "respondentEmail" VARCHAR(255),
    "answers" JSONB NOT NULL,
    "completionPercentage" INTEGER NOT NULL DEFAULT 100,
    "timeToCompleteSeconds" INTEGER,
    "responseChannel" VARCHAR(30),
    "userAgent" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackWidget" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "placement" VARCHAR(50) NOT NULL,
    "pages" JSONB,
    "widgetType" VARCHAR(30) NOT NULL,
    "config" JSONB NOT NULL,
    "triggerRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "impressionCount" INTEGER NOT NULL DEFAULT 0,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FeedbackWidget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CacheStats_tenantId_idx" ON "CacheStats"("tenantId");

-- CreateIndex
CREATE INDEX "CacheStats_statDate_statHour_idx" ON "CacheStats"("statDate", "statHour");

-- CreateIndex
CREATE INDEX "CacheStats_externalId_sourceSystem_idx" ON "CacheStats"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "CacheStats_tenantId_statDate_statHour_cacheType_key" ON "CacheStats"("tenantId", "statDate", "statHour", "cacheType");

-- CreateIndex
CREATE INDEX "CacheInvalidationRule_tenantId_idx" ON "CacheInvalidationRule"("tenantId");

-- CreateIndex
CREATE INDEX "CacheInvalidationRule_triggerEvent_idx" ON "CacheInvalidationRule"("triggerEvent");

-- CreateIndex
CREATE INDEX "CacheInvalidationRule_isEnabled_idx" ON "CacheInvalidationRule"("isEnabled");

-- CreateIndex
CREATE INDEX "CacheInvalidationRule_externalId_sourceSystem_idx" ON "CacheInvalidationRule"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "DistributedLock_tenantId_idx" ON "DistributedLock"("tenantId");

-- CreateIndex
CREATE INDEX "DistributedLock_lockKey_acquiredAt_idx" ON "DistributedLock"("lockKey", "acquiredAt");

-- CreateIndex
CREATE INDEX "DistributedLock_externalId_sourceSystem_idx" ON "DistributedLock"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SupportTeam_tenantId_idx" ON "SupportTeam"("tenantId");

-- CreateIndex
CREATE INDEX "SupportTeam_isActive_idx" ON "SupportTeam"("isActive");

-- CreateIndex
CREATE INDEX "SupportTeam_externalId_sourceSystem_idx" ON "SupportTeam"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SupportTeamMember_teamId_idx" ON "SupportTeamMember"("teamId");

-- CreateIndex
CREATE INDEX "SupportTeamMember_userId_idx" ON "SupportTeamMember"("userId");

-- CreateIndex
CREATE INDEX "SupportTeamMember_isAvailable_idx" ON "SupportTeamMember"("isAvailable");

-- CreateIndex
CREATE INDEX "SupportTeamMember_externalId_sourceSystem_idx" ON "SupportTeamMember"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTeamMember_teamId_userId_key" ON "SupportTeamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "SlaPolicy_tenantId_idx" ON "SlaPolicy"("tenantId");

-- CreateIndex
CREATE INDEX "SlaPolicy_isActive_idx" ON "SlaPolicy"("isActive");

-- CreateIndex
CREATE INDEX "SlaPolicy_priority_idx" ON "SlaPolicy"("priority");

-- CreateIndex
CREATE INDEX "SlaPolicy_externalId_sourceSystem_idx" ON "SlaPolicy"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "EscalationRule_tenantId_idx" ON "EscalationRule"("tenantId");

-- CreateIndex
CREATE INDEX "EscalationRule_isActive_idx" ON "EscalationRule"("isActive");

-- CreateIndex
CREATE INDEX "EscalationRule_triggerType_idx" ON "EscalationRule"("triggerType");

-- CreateIndex
CREATE INDEX "EscalationRule_externalId_sourceSystem_idx" ON "EscalationRule"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CannedResponse_tenantId_idx" ON "CannedResponse"("tenantId");

-- CreateIndex
CREATE INDEX "CannedResponse_isActive_idx" ON "CannedResponse"("isActive");

-- CreateIndex
CREATE INDEX "CannedResponse_category_idx" ON "CannedResponse"("category");

-- CreateIndex
CREATE INDEX "CannedResponse_ownerId_idx" ON "CannedResponse"("ownerId");

-- CreateIndex
CREATE INDEX "CannedResponse_externalId_sourceSystem_idx" ON "CannedResponse"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "FeatureRequestVote_requestId_idx" ON "FeatureRequestVote"("requestId");

-- CreateIndex
CREATE INDEX "FeatureRequestVote_userId_idx" ON "FeatureRequestVote"("userId");

-- CreateIndex
CREATE INDEX "FeatureRequestVote_externalId_sourceSystem_idx" ON "FeatureRequestVote"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureRequestVote_requestId_userId_key" ON "FeatureRequestVote"("requestId", "userId");

-- CreateIndex
CREATE INDEX "FeatureRequestComment_requestId_idx" ON "FeatureRequestComment"("requestId");

-- CreateIndex
CREATE INDEX "FeatureRequestComment_authorUserId_idx" ON "FeatureRequestComment"("authorUserId");

-- CreateIndex
CREATE INDEX "FeatureRequestComment_createdAt_idx" ON "FeatureRequestComment"("createdAt");

-- CreateIndex
CREATE INDEX "FeatureRequestComment_externalId_sourceSystem_idx" ON "FeatureRequestComment"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Survey_tenantId_idx" ON "Survey"("tenantId");

-- CreateIndex
CREATE INDEX "Survey_status_idx" ON "Survey"("status");

-- CreateIndex
CREATE INDEX "Survey_surveyType_idx" ON "Survey"("surveyType");

-- CreateIndex
CREATE INDEX "Survey_externalId_sourceSystem_idx" ON "Survey"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SurveyResponse_tenantId_idx" ON "SurveyResponse"("tenantId");

-- CreateIndex
CREATE INDEX "SurveyResponse_surveyId_idx" ON "SurveyResponse"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_userId_idx" ON "SurveyResponse"("userId");

-- CreateIndex
CREATE INDEX "SurveyResponse_createdAt_idx" ON "SurveyResponse"("createdAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_externalId_sourceSystem_idx" ON "SurveyResponse"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "FeedbackWidget_tenantId_idx" ON "FeedbackWidget"("tenantId");

-- CreateIndex
CREATE INDEX "FeedbackWidget_isActive_idx" ON "FeedbackWidget"("isActive");

-- CreateIndex
CREATE INDEX "FeedbackWidget_externalId_sourceSystem_idx" ON "FeedbackWidget"("externalId", "sourceSystem");

-- AddForeignKey
ALTER TABLE "CacheStats" ADD CONSTRAINT "CacheStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CacheInvalidationRule" ADD CONSTRAINT "CacheInvalidationRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributedLock" ADD CONSTRAINT "DistributedLock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTeam" ADD CONSTRAINT "SupportTeam_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTeamMember" ADD CONSTRAINT "SupportTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "SupportTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlaPolicy" ADD CONSTRAINT "SlaPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationRule" ADD CONSTRAINT "EscalationRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CannedResponse" ADD CONSTRAINT "CannedResponse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequestVote" ADD CONSTRAINT "FeatureRequestVote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequestComment" ADD CONSTRAINT "FeatureRequestComment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackWidget" ADD CONSTRAINT "FeedbackWidget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
