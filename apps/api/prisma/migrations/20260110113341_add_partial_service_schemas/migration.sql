-- CreateEnum
CREATE TYPE "PortalNotificationType" AS ENUM ('QUOTE_READY', 'LOAD_UPDATE', 'INVOICE_AVAILABLE', 'PAYMENT_RECEIVED', 'DOCUMENT_UPLOADED', 'MESSAGE_RECEIVED', 'SHIPMENT_DELAYED', 'DELIVERY_CONFIRMED', 'GENERAL');

-- CreateEnum
CREATE TYPE "CarrierPortalNotificationType" AS ENUM ('LOAD_ASSIGNED', 'LOAD_CANCELLED', 'DOCUMENT_REQUEST', 'PAYMENT_PROCESSED', 'INVOICE_APPROVED', 'INVOICE_REJECTED', 'QUICK_PAY_APPROVED', 'QUICK_PAY_REJECTED', 'GENERAL');

-- CreateEnum
CREATE TYPE "ContractClauseType" AS ENUM ('PAYMENT_TERMS', 'LIABILITY', 'INSURANCE', 'TERMINATION', 'DISPUTE_RESOLUTION', 'CONFIDENTIALITY', 'COMPLIANCE', 'FORCE_MAJEURE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('ON_TIME_DELIVERY', 'LOAD_VOLUME', 'REVENUE', 'COST_PER_MILE', 'CLAIMS_RATIO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ACH', 'CHECK', 'WIRE', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('PHONE_CALL', 'EMAIL', 'FAX', 'ONLINE_PORTAL', 'MAIL');

-- CreateEnum
CREATE TYPE "ChangeReason" AS ENUM ('PROMOTION', 'TRANSFER', 'SALARY_ADJUSTMENT', 'DEMOTION', 'DEPARTMENT_RESTRUCTURE', 'OTHER');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('UP', 'DOWN', 'FLAT');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SyncDirection" AS ENUM ('INBOUND', 'OUTBOUND', 'BIDIRECTIONAL');

-- CreateEnum
CREATE TYPE "CircuitState" AS ENUM ('CLOSED', 'OPEN', 'HALF_OPEN');

-- CreateEnum
CREATE TYPE "IndexOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'REINDEX');

-- CreateEnum
CREATE TYPE "LoginMethod" AS ENUM ('PASSWORD', 'SSO', 'OAUTH', 'MFA', 'API_KEY');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'PENDING_VERIFICATION', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuditSeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ResetFrequency" AS ENUM ('NEVER', 'DAILY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "PortalSavedPaymentMethod" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "paymentMethodType" VARCHAR(50) NOT NULL,
    "lastFourDigits" VARCHAR(4),
    "cardBrand" VARCHAR(50),
    "expirationMonth" INTEGER,
    "expirationYear" INTEGER,
    "billingName" VARCHAR(255),
    "billingAddress" VARCHAR(255),
    "billingCity" VARCHAR(100),
    "billingState" VARCHAR(2),
    "billingZip" VARCHAR(10),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalToken" VARCHAR(255),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PortalSavedPaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalBranding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "logoUrl" VARCHAR(500),
    "faviconUrl" VARCHAR(500),
    "primaryColor" VARCHAR(7),
    "secondaryColor" VARCHAR(7),
    "accentColor" VARCHAR(7),
    "customCss" TEXT,
    "customJs" TEXT,
    "headerHtml" TEXT,
    "footerHtml" TEXT,
    "welcomeMessage" TEXT,
    "customDomain" VARCHAR(255),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PortalBranding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalNotification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "notificationType" "PortalNotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" VARCHAR(500),
    "relatedEntityType" VARCHAR(50),
    "relatedEntityId" VARCHAR(255),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PortalNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierSavedLoad" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierPortalUserId" TEXT NOT NULL,
    "loadId" TEXT,
    "postingId" TEXT,
    "notes" TEXT,
    "reminderDate" DATE,
    "savedFrom" VARCHAR(100),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierSavedLoad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierPortalNotification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierPortalUserId" TEXT NOT NULL,
    "notificationType" "CarrierPortalNotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" VARCHAR(500),
    "relatedEntityType" VARCHAR(50),
    "relatedEntityId" VARCHAR(255),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierPortalNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateName" VARCHAR(255) NOT NULL,
    "contractType" "ContractType" NOT NULL,
    "templateContent" TEXT NOT NULL,
    "defaultTerms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractClause" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clauseName" VARCHAR(255) NOT NULL,
    "clauseText" TEXT NOT NULL,
    "clauseType" "ContractClauseType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ContractClause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractRateTable" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "tableName" VARCHAR(255) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "expirationDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ContractRateTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractRateLane" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rateTableId" TEXT NOT NULL,
    "originCity" VARCHAR(100) NOT NULL,
    "originState" VARCHAR(2) NOT NULL,
    "originZip" VARCHAR(10),
    "destCity" VARCHAR(100) NOT NULL,
    "destState" VARCHAR(2) NOT NULL,
    "destZip" VARCHAR(10),
    "equipmentType" VARCHAR(50) NOT NULL,
    "rateType" "RateType" NOT NULL,
    "rateAmount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "fuelSurchargeTableId" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ContractRateLane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractAmendment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amendmentNumber" INTEGER NOT NULL DEFAULT 1,
    "effectiveDate" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "changedFields" JSONB NOT NULL DEFAULT '[]',
    "previousValues" JSONB NOT NULL DEFAULT '{}',
    "newValues" JSONB NOT NULL DEFAULT '{}',
    "changedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "documentId" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ContractAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractMetric" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "metricName" VARCHAR(255),
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "targetValue" DECIMAL(15,2) NOT NULL,
    "actualValue" DECIMAL(15,2),
    "unit" VARCHAR(50),
    "isMet" BOOLEAN,
    "variance" DECIMAL(15,2),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ContractMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentContact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "contactName" VARCHAR(255) NOT NULL,
    "title" VARCHAR(100),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AgentContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLead" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "leadCompanyName" VARCHAR(255) NOT NULL,
    "contactName" VARCHAR(255),
    "contactEmail" VARCHAR(255),
    "contactPhone" VARCHAR(20),
    "status" "LeadStatus" NOT NULL DEFAULT 'SUBMITTED',
    "qualificationNotes" TEXT,
    "convertedToCustomerId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "submittedDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastContactedAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AgentLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPayout" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "payoutNumber" VARCHAR(50) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "grossCommission" DECIMAL(12,2) NOT NULL,
    "deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netPayout" DECIMAL(12,2) NOT NULL,
    "paymentDate" DATE,
    "paymentMethod" "PaymentMethod",
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AgentPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDrawBalance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "currentBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDrawn" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalEarned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastReconciliationDate" DATE,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AgentDrawBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPortalUser" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "canViewCommissions" BOOLEAN NOT NULL DEFAULT true,
    "canSubmitLeads" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AgentPortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoringVerification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "noaRecordId" TEXT NOT NULL,
    "verificationDate" DATE NOT NULL,
    "verificationMethod" "VerificationMethod" NOT NULL,
    "contactedPerson" VARCHAR(255),
    "verificationStatus" "VerificationStatus" NOT NULL,
    "verificationDocumentId" TEXT,
    "notes" TEXT,
    "nextVerificationDate" DATE,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FactoringVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoredPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "factoringCompanyId" TEXT NOT NULL,
    "paymentAmount" DECIMAL(12,2) NOT NULL,
    "paymentDate" DATE NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "verificationCode" VARCHAR(100),
    "notes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FactoredPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationCode" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "zip" VARCHAR(10),
    "country" VARCHAR(2) DEFAULT 'US',
    "phone" VARCHAR(20),
    "isHeadquarters" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(50),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "changeReason" "ChangeReason",
    "salaryAtTime" DECIMAL(12,2),
    "notes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EmploymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOffBalance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "timeOffType" "TimeOffType" NOT NULL,
    "year" INTEGER NOT NULL,
    "balanceHours" DECIMAL(8,2) NOT NULL,
    "accrualRate" DECIMAL(8,2),
    "maxBalance" DECIMAL(8,2),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "TimeOffBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "locationId" TEXT,
    "clockIn" TIMESTAMP NOT NULL,
    "clockOut" TIMESTAMP,
    "durationHours" DECIMAL(8,2),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklist" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "positionId" TEXT,
    "checklistName" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "employeeId" TEXT,
    "taskName" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "dueDaysFromStart" INTEGER NOT NULL DEFAULT 7,
    "dueDate" DATE,
    "completedDate" DATE,
    "assignedTo" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "OnboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPISnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kpiDefinitionId" TEXT NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "comparisonValue" DECIMAL(15,2),
    "trendDirection" "TrendDirection",
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "KPISnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "kpiDefinitionId" TEXT,
    "widgetType" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255),
    "position" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 12,
    "height" INTEGER NOT NULL DEFAULT 4,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "refreshInterval" INTEGER,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateName" VARCHAR(255) NOT NULL,
    "reportType" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "queryTemplate" TEXT NOT NULL,
    "parameterDefinitions" JSONB NOT NULL DEFAULT '[]',
    "scheduleConfig" JSONB DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportExecution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reportId" TEXT,
    "templateId" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parametersUsed" JSONB NOT NULL DEFAULT '{}',
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "outputFileUrl" VARCHAR(500),
    "executionTimeMs" INTEGER,
    "rowCount" INTEGER,
    "errorMessage" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ReportExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedAnalyticsView" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewName" VARCHAR(255) NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "filters" JSONB NOT NULL DEFAULT '[]',
    "columns" JSONB NOT NULL DEFAULT '[]',
    "sortOrder" JSONB NOT NULL DEFAULT '[]',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SavedAnalyticsView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kpiDefinitionId" TEXT NOT NULL,
    "alertName" VARCHAR(255) NOT NULL,
    "alertCondition" "AlertCondition" NOT NULL,
    "thresholdValue" DECIMAL(15,2) NOT NULL,
    "notifyUsers" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "KPIAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsCache" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cacheKey" VARCHAR(255) NOT NULL,
    "queryHash" VARCHAR(64) NOT NULL,
    "resultData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStep" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepName" VARCHAR(255) NOT NULL,
    "stepType" "StepType" NOT NULL,
    "actionConfig" JSONB NOT NULL DEFAULT '{}',
    "conditionLogic" TEXT,
    "timeoutSeconds" INTEGER DEFAULT 3600,
    "retryConfig" JSONB DEFAULT '{}',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "WorkflowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepExecution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowExecutionId" TEXT NOT NULL,
    "workflowStepId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "inputData" JSONB NOT NULL DEFAULT '{}',
    "outputData" JSONB DEFAULT '{}',
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "StepExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateName" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "description" TEXT,
    "triggerConfig" JSONB NOT NULL DEFAULT '{}',
    "stepsJson" JSONB NOT NULL DEFAULT '[]',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledWorkflowRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "scheduleExpression" VARCHAR(255) NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ScheduledWorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationProviderConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerName" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "authType" VARCHAR(50) NOT NULL,
    "baseUrl" VARCHAR(500),
    "documentationUrl" VARCHAR(500),
    "logoUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "IntegrationProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "webhookEndpointId" TEXT NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "filterConditions" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "WebhookSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIRequestLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "endpoint" VARCHAR(500) NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "requestHeaders" JSONB NOT NULL DEFAULT '{}',
    "requestBody" JSONB DEFAULT '{}',
    "responseStatus" INTEGER NOT NULL,
    "responseBody" JSONB DEFAULT '{}',
    "durationMs" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransformationTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateName" VARCHAR(255) NOT NULL,
    "sourceFormat" VARCHAR(100) NOT NULL,
    "targetFormat" VARCHAR(100) NOT NULL,
    "transformationLogic" TEXT NOT NULL,
    "testCases" JSONB NOT NULL DEFAULT '[]',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "TransformationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "jobType" VARCHAR(100) NOT NULL,
    "direction" "SyncDirection" NOT NULL,
    "schedule" VARCHAR(255),
    "lastSyncAt" TIMESTAMP(3),
    "recordsProcessed" INTEGER DEFAULT 0,
    "recordsFailed" INTEGER DEFAULT 0,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircuitBreakerStateRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "state" "CircuitState" NOT NULL DEFAULT 'CLOSED',
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastFailureAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "halfOpenAttempts" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CircuitBreakerStateRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndex" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "indexName" VARCHAR(255) NOT NULL,
    "fieldsIndexed" JSONB NOT NULL DEFAULT '[]',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentCount" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SearchIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchSuggestion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "suggestionText" VARCHAR(255) NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SearchSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchSynonym" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "term" VARCHAR(255) NOT NULL,
    "synonymsArray" JSONB NOT NULL DEFAULT '[]',
    "entityType" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SearchSynonym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndexQueue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(255) NOT NULL,
    "operation" "IndexOperation" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "processedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SearchIndexQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "resourceType" VARCHAR(50) NOT NULL,
    "resourceId" VARCHAR(255) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "denialReason" TEXT,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAudit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "loginMethod" "LoginMethod" NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "mfaUsed" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" VARCHAR(255),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "apiKeyId" TEXT,
    "endpoint" VARCHAR(500) NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "requestParams" JSONB DEFAULT '{}',
    "responseStatus" INTEGER NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "ipAddress" VARCHAR(45),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCheckpoint" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "checkpointName" VARCHAR(255) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" VARCHAR(255) NOT NULL,
    "requirement" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "expiryDate" DATE,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ComplianceCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "alertName" VARCHAR(255) NOT NULL,
    "triggerConditions" JSONB NOT NULL DEFAULT '{}',
    "severity" "AuditSeverityLevel" NOT NULL,
    "notifyUsers" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AuditAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAlertIncident" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "auditAlertId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggerData" JSONB NOT NULL DEFAULT '{}',
    "severity" "AuditSeverityLevel" NOT NULL,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AuditAlertIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditRetentionPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "archiveAfterDays" INTEGER,
    "deleteAfterDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AuditRetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "configKey" VARCHAR(255) NOT NULL,
    "configValue" JSONB NOT NULL,
    "dataType" "DataType" NOT NULL DEFAULT 'STRING',
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "TenantConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferenceKey" VARCHAR(255) NOT NULL,
    "preferenceValue" JSONB NOT NULL,
    "dataType" "DataType" NOT NULL DEFAULT 'STRING',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlagOverride" (
    "id" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "overrideValue" BOOLEAN NOT NULL,
    "expiresAt" TIMESTAMP,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FeatureFlagOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateName" VARCHAR(255) NOT NULL,
    "templateType" VARCHAR(100) NOT NULL,
    "configSchema" JSONB NOT NULL DEFAULT '{}',
    "defaultValues" JSONB NOT NULL DEFAULT '{}',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ConfigTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "configKey" VARCHAR(255) NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB NOT NULL,
    "changedBy" TEXT,
    "changeReason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "ConfigHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessHours" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "openTime" VARCHAR(5) NOT NULL,
    "closeTime" VARCHAR(5) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(50) NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "BusinessHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "holidayName" VARCHAR(255) NOT NULL,
    "holidayDate" DATE NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "countryCode" VARCHAR(2),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NumberSequence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sequenceName" VARCHAR(255) NOT NULL,
    "prefix" VARCHAR(20),
    "currentNumber" INTEGER NOT NULL DEFAULT 1,
    "increment" INTEGER NOT NULL DEFAULT 1,
    "padding" INTEGER NOT NULL DEFAULT 4,
    "resetFrequency" "ResetFrequency" NOT NULL DEFAULT 'NEVER',
    "lastResetAt" DATE,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "NumberSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "taskName" VARCHAR(255) NOT NULL,
    "taskType" VARCHAR(100) NOT NULL,
    "scheduledFor" TIMESTAMP NOT NULL,
    "entityType" VARCHAR(50),
    "entityId" VARCHAR(255),
    "taskData" JSONB NOT NULL DEFAULT '{}',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ScheduledTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reminderType" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "remindAt" TIMESTAMP NOT NULL,
    "entityType" VARCHAR(50),
    "entityId" VARCHAR(255),
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "snoozedUntil" TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortalSavedPaymentMethod_tenantId_idx" ON "PortalSavedPaymentMethod"("tenantId");

-- CreateIndex
CREATE INDEX "PortalSavedPaymentMethod_portalUserId_idx" ON "PortalSavedPaymentMethod"("portalUserId");

-- CreateIndex
CREATE INDEX "PortalSavedPaymentMethod_isDefault_idx" ON "PortalSavedPaymentMethod"("isDefault");

-- CreateIndex
CREATE INDEX "PortalSavedPaymentMethod_externalId_sourceSystem_idx" ON "PortalSavedPaymentMethod"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "PortalBranding_companyId_key" ON "PortalBranding"("companyId");

-- CreateIndex
CREATE INDEX "PortalBranding_tenantId_idx" ON "PortalBranding"("tenantId");

-- CreateIndex
CREATE INDEX "PortalBranding_customDomain_idx" ON "PortalBranding"("customDomain");

-- CreateIndex
CREATE INDEX "PortalBranding_externalId_sourceSystem_idx" ON "PortalBranding"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "PortalNotification_tenantId_idx" ON "PortalNotification"("tenantId");

-- CreateIndex
CREATE INDEX "PortalNotification_portalUserId_idx" ON "PortalNotification"("portalUserId");

-- CreateIndex
CREATE INDEX "PortalNotification_isRead_idx" ON "PortalNotification"("isRead");

-- CreateIndex
CREATE INDEX "PortalNotification_notificationType_idx" ON "PortalNotification"("notificationType");

-- CreateIndex
CREATE INDEX "PortalNotification_createdAt_idx" ON "PortalNotification"("createdAt");

-- CreateIndex
CREATE INDEX "PortalNotification_relatedEntityType_relatedEntityId_idx" ON "PortalNotification"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "PortalNotification_externalId_sourceSystem_idx" ON "PortalNotification"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CarrierSavedLoad_tenantId_idx" ON "CarrierSavedLoad"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierSavedLoad_carrierPortalUserId_idx" ON "CarrierSavedLoad"("carrierPortalUserId");

-- CreateIndex
CREATE INDEX "CarrierSavedLoad_loadId_idx" ON "CarrierSavedLoad"("loadId");

-- CreateIndex
CREATE INDEX "CarrierSavedLoad_reminderDate_idx" ON "CarrierSavedLoad"("reminderDate");

-- CreateIndex
CREATE INDEX "CarrierSavedLoad_externalId_sourceSystem_idx" ON "CarrierSavedLoad"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CarrierPortalNotification_tenantId_idx" ON "CarrierPortalNotification"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierPortalNotification_carrierPortalUserId_idx" ON "CarrierPortalNotification"("carrierPortalUserId");

-- CreateIndex
CREATE INDEX "CarrierPortalNotification_isRead_idx" ON "CarrierPortalNotification"("isRead");

-- CreateIndex
CREATE INDEX "CarrierPortalNotification_notificationType_idx" ON "CarrierPortalNotification"("notificationType");

-- CreateIndex
CREATE INDEX "CarrierPortalNotification_createdAt_idx" ON "CarrierPortalNotification"("createdAt");

-- CreateIndex
CREATE INDEX "CarrierPortalNotification_relatedEntityType_relatedEntityId_idx" ON "CarrierPortalNotification"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "CarrierPortalNotification_externalId_sourceSystem_idx" ON "CarrierPortalNotification"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ContractTemplate_tenantId_idx" ON "ContractTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "ContractTemplate_contractType_idx" ON "ContractTemplate"("contractType");

-- CreateIndex
CREATE INDEX "ContractTemplate_isActive_idx" ON "ContractTemplate"("isActive");

-- CreateIndex
CREATE INDEX "ContractTemplate_externalId_sourceSystem_idx" ON "ContractTemplate"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ContractClause_tenantId_idx" ON "ContractClause"("tenantId");

-- CreateIndex
CREATE INDEX "ContractClause_clauseType_idx" ON "ContractClause"("clauseType");

-- CreateIndex
CREATE INDEX "ContractClause_isActive_idx" ON "ContractClause"("isActive");

-- CreateIndex
CREATE INDEX "ContractClause_displayOrder_idx" ON "ContractClause"("displayOrder");

-- CreateIndex
CREATE INDEX "ContractClause_externalId_sourceSystem_idx" ON "ContractClause"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ContractRateTable_tenantId_idx" ON "ContractRateTable"("tenantId");

-- CreateIndex
CREATE INDEX "ContractRateTable_contractId_idx" ON "ContractRateTable"("contractId");

-- CreateIndex
CREATE INDEX "ContractRateTable_effectiveDate_idx" ON "ContractRateTable"("effectiveDate");

-- CreateIndex
CREATE INDEX "ContractRateTable_isActive_idx" ON "ContractRateTable"("isActive");

-- CreateIndex
CREATE INDEX "ContractRateTable_externalId_sourceSystem_idx" ON "ContractRateTable"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ContractRateLane_tenantId_idx" ON "ContractRateLane"("tenantId");

-- CreateIndex
CREATE INDEX "ContractRateLane_rateTableId_idx" ON "ContractRateLane"("rateTableId");

-- CreateIndex
CREATE INDEX "ContractRateLane_originState_idx" ON "ContractRateLane"("originState");

-- CreateIndex
CREATE INDEX "ContractRateLane_destState_idx" ON "ContractRateLane"("destState");

-- CreateIndex
CREATE INDEX "ContractRateLane_equipmentType_idx" ON "ContractRateLane"("equipmentType");

-- CreateIndex
CREATE INDEX "ContractRateLane_externalId_sourceSystem_idx" ON "ContractRateLane"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ContractAmendment_tenantId_idx" ON "ContractAmendment"("tenantId");

-- CreateIndex
CREATE INDEX "ContractAmendment_contractId_idx" ON "ContractAmendment"("contractId");

-- CreateIndex
CREATE INDEX "ContractAmendment_effectiveDate_idx" ON "ContractAmendment"("effectiveDate");

-- CreateIndex
CREATE INDEX "ContractAmendment_amendmentNumber_idx" ON "ContractAmendment"("amendmentNumber");

-- CreateIndex
CREATE INDEX "ContractAmendment_externalId_sourceSystem_idx" ON "ContractAmendment"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ContractMetric_tenantId_idx" ON "ContractMetric"("tenantId");

-- CreateIndex
CREATE INDEX "ContractMetric_contractId_idx" ON "ContractMetric"("contractId");

-- CreateIndex
CREATE INDEX "ContractMetric_metricType_idx" ON "ContractMetric"("metricType");

-- CreateIndex
CREATE INDEX "ContractMetric_periodStart_idx" ON "ContractMetric"("periodStart");

-- CreateIndex
CREATE INDEX "ContractMetric_periodEnd_idx" ON "ContractMetric"("periodEnd");

-- CreateIndex
CREATE INDEX "ContractMetric_externalId_sourceSystem_idx" ON "ContractMetric"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AgentContact_tenantId_idx" ON "AgentContact"("tenantId");

-- CreateIndex
CREATE INDEX "AgentContact_agentId_idx" ON "AgentContact"("agentId");

-- CreateIndex
CREATE INDEX "AgentContact_isPrimary_idx" ON "AgentContact"("isPrimary");

-- CreateIndex
CREATE INDEX "AgentContact_externalId_sourceSystem_idx" ON "AgentContact"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AgentLead_tenantId_idx" ON "AgentLead"("tenantId");

-- CreateIndex
CREATE INDEX "AgentLead_agentId_idx" ON "AgentLead"("agentId");

-- CreateIndex
CREATE INDEX "AgentLead_status_idx" ON "AgentLead"("status");

-- CreateIndex
CREATE INDEX "AgentLead_convertedToCustomerId_idx" ON "AgentLead"("convertedToCustomerId");

-- CreateIndex
CREATE INDEX "AgentLead_submittedDate_idx" ON "AgentLead"("submittedDate");

-- CreateIndex
CREATE INDEX "AgentLead_externalId_sourceSystem_idx" ON "AgentLead"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPayout_payoutNumber_key" ON "AgentPayout"("payoutNumber");

-- CreateIndex
CREATE INDEX "AgentPayout_tenantId_idx" ON "AgentPayout"("tenantId");

-- CreateIndex
CREATE INDEX "AgentPayout_agentId_idx" ON "AgentPayout"("agentId");

-- CreateIndex
CREATE INDEX "AgentPayout_payoutNumber_idx" ON "AgentPayout"("payoutNumber");

-- CreateIndex
CREATE INDEX "AgentPayout_periodStart_idx" ON "AgentPayout"("periodStart");

-- CreateIndex
CREATE INDEX "AgentPayout_status_idx" ON "AgentPayout"("status");

-- CreateIndex
CREATE INDEX "AgentPayout_externalId_sourceSystem_idx" ON "AgentPayout"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "AgentDrawBalance_agentId_key" ON "AgentDrawBalance"("agentId");

-- CreateIndex
CREATE INDEX "AgentDrawBalance_tenantId_idx" ON "AgentDrawBalance"("tenantId");

-- CreateIndex
CREATE INDEX "AgentDrawBalance_externalId_sourceSystem_idx" ON "AgentDrawBalance"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AgentPortalUser_tenantId_idx" ON "AgentPortalUser"("tenantId");

-- CreateIndex
CREATE INDEX "AgentPortalUser_agentId_idx" ON "AgentPortalUser"("agentId");

-- CreateIndex
CREATE INDEX "AgentPortalUser_userId_idx" ON "AgentPortalUser"("userId");

-- CreateIndex
CREATE INDEX "AgentPortalUser_externalId_sourceSystem_idx" ON "AgentPortalUser"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPortalUser_agentId_userId_key" ON "AgentPortalUser"("agentId", "userId");

-- CreateIndex
CREATE INDEX "FactoringVerification_tenantId_idx" ON "FactoringVerification"("tenantId");

-- CreateIndex
CREATE INDEX "FactoringVerification_noaRecordId_idx" ON "FactoringVerification"("noaRecordId");

-- CreateIndex
CREATE INDEX "FactoringVerification_verificationDate_idx" ON "FactoringVerification"("verificationDate");

-- CreateIndex
CREATE INDEX "FactoringVerification_verificationStatus_idx" ON "FactoringVerification"("verificationStatus");

-- CreateIndex
CREATE INDEX "FactoringVerification_nextVerificationDate_idx" ON "FactoringVerification"("nextVerificationDate");

-- CreateIndex
CREATE INDEX "FactoringVerification_externalId_sourceSystem_idx" ON "FactoringVerification"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "FactoredPayment_tenantId_idx" ON "FactoredPayment"("tenantId");

-- CreateIndex
CREATE INDEX "FactoredPayment_settlementId_idx" ON "FactoredPayment"("settlementId");

-- CreateIndex
CREATE INDEX "FactoredPayment_factoringCompanyId_idx" ON "FactoredPayment"("factoringCompanyId");

-- CreateIndex
CREATE INDEX "FactoredPayment_paymentDate_idx" ON "FactoredPayment"("paymentDate");

-- CreateIndex
CREATE INDEX "FactoredPayment_externalId_sourceSystem_idx" ON "FactoredPayment"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Location_locationCode_key" ON "Location"("locationCode");

-- CreateIndex
CREATE INDEX "Location_tenantId_idx" ON "Location"("tenantId");

-- CreateIndex
CREATE INDEX "Location_locationCode_idx" ON "Location"("locationCode");

-- CreateIndex
CREATE INDEX "Location_isHeadquarters_idx" ON "Location"("isHeadquarters");

-- CreateIndex
CREATE INDEX "Location_externalId_sourceSystem_idx" ON "Location"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "EmploymentHistory_tenantId_idx" ON "EmploymentHistory"("tenantId");

-- CreateIndex
CREATE INDEX "EmploymentHistory_employeeId_idx" ON "EmploymentHistory"("employeeId");

-- CreateIndex
CREATE INDEX "EmploymentHistory_positionId_idx" ON "EmploymentHistory"("positionId");

-- CreateIndex
CREATE INDEX "EmploymentHistory_departmentId_idx" ON "EmploymentHistory"("departmentId");

-- CreateIndex
CREATE INDEX "EmploymentHistory_startDate_idx" ON "EmploymentHistory"("startDate");

-- CreateIndex
CREATE INDEX "EmploymentHistory_endDate_idx" ON "EmploymentHistory"("endDate");

-- CreateIndex
CREATE INDEX "EmploymentHistory_externalId_sourceSystem_idx" ON "EmploymentHistory"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "TimeOffBalance_tenantId_idx" ON "TimeOffBalance"("tenantId");

-- CreateIndex
CREATE INDEX "TimeOffBalance_employeeId_idx" ON "TimeOffBalance"("employeeId");

-- CreateIndex
CREATE INDEX "TimeOffBalance_year_idx" ON "TimeOffBalance"("year");

-- CreateIndex
CREATE INDEX "TimeOffBalance_externalId_sourceSystem_idx" ON "TimeOffBalance"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "TimeOffBalance_employeeId_timeOffType_year_key" ON "TimeOffBalance"("employeeId", "timeOffType", "year");

-- CreateIndex
CREATE INDEX "TimeEntry_tenantId_idx" ON "TimeEntry"("tenantId");

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_idx" ON "TimeEntry"("employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_locationId_idx" ON "TimeEntry"("locationId");

-- CreateIndex
CREATE INDEX "TimeEntry_clockIn_idx" ON "TimeEntry"("clockIn");

-- CreateIndex
CREATE INDEX "TimeEntry_externalId_sourceSystem_idx" ON "TimeEntry"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_tenantId_idx" ON "OnboardingChecklist"("tenantId");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_positionId_idx" ON "OnboardingChecklist"("positionId");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_isActive_idx" ON "OnboardingChecklist"("isActive");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_externalId_sourceSystem_idx" ON "OnboardingChecklist"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "OnboardingTask_tenantId_idx" ON "OnboardingTask"("tenantId");

-- CreateIndex
CREATE INDEX "OnboardingTask_checklistId_idx" ON "OnboardingTask"("checklistId");

-- CreateIndex
CREATE INDEX "OnboardingTask_employeeId_idx" ON "OnboardingTask"("employeeId");

-- CreateIndex
CREATE INDEX "OnboardingTask_dueDate_idx" ON "OnboardingTask"("dueDate");

-- CreateIndex
CREATE INDEX "OnboardingTask_completedDate_idx" ON "OnboardingTask"("completedDate");

-- CreateIndex
CREATE INDEX "OnboardingTask_externalId_sourceSystem_idx" ON "OnboardingTask"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "KPISnapshot_tenantId_idx" ON "KPISnapshot"("tenantId");

-- CreateIndex
CREATE INDEX "KPISnapshot_kpiDefinitionId_idx" ON "KPISnapshot"("kpiDefinitionId");

-- CreateIndex
CREATE INDEX "KPISnapshot_snapshotDate_idx" ON "KPISnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "KPISnapshot_externalId_sourceSystem_idx" ON "KPISnapshot"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "DashboardWidget_tenantId_idx" ON "DashboardWidget"("tenantId");

-- CreateIndex
CREATE INDEX "DashboardWidget_dashboardId_idx" ON "DashboardWidget"("dashboardId");

-- CreateIndex
CREATE INDEX "DashboardWidget_kpiDefinitionId_idx" ON "DashboardWidget"("kpiDefinitionId");

-- CreateIndex
CREATE INDEX "DashboardWidget_position_idx" ON "DashboardWidget"("position");

-- CreateIndex
CREATE INDEX "DashboardWidget_externalId_sourceSystem_idx" ON "DashboardWidget"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ReportTemplate_tenantId_idx" ON "ReportTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "ReportTemplate_reportType_idx" ON "ReportTemplate"("reportType");

-- CreateIndex
CREATE INDEX "ReportTemplate_isActive_idx" ON "ReportTemplate"("isActive");

-- CreateIndex
CREATE INDEX "ReportTemplate_externalId_sourceSystem_idx" ON "ReportTemplate"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ReportExecution_tenantId_idx" ON "ReportExecution"("tenantId");

-- CreateIndex
CREATE INDEX "ReportExecution_reportId_idx" ON "ReportExecution"("reportId");

-- CreateIndex
CREATE INDEX "ReportExecution_templateId_idx" ON "ReportExecution"("templateId");

-- CreateIndex
CREATE INDEX "ReportExecution_executedAt_idx" ON "ReportExecution"("executedAt");

-- CreateIndex
CREATE INDEX "ReportExecution_status_idx" ON "ReportExecution"("status");

-- CreateIndex
CREATE INDEX "ReportExecution_externalId_sourceSystem_idx" ON "ReportExecution"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SavedAnalyticsView_tenantId_idx" ON "SavedAnalyticsView"("tenantId");

-- CreateIndex
CREATE INDEX "SavedAnalyticsView_userId_idx" ON "SavedAnalyticsView"("userId");

-- CreateIndex
CREATE INDEX "SavedAnalyticsView_entityType_idx" ON "SavedAnalyticsView"("entityType");

-- CreateIndex
CREATE INDEX "SavedAnalyticsView_isPublic_idx" ON "SavedAnalyticsView"("isPublic");

-- CreateIndex
CREATE INDEX "SavedAnalyticsView_externalId_sourceSystem_idx" ON "SavedAnalyticsView"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "KPIAlert_tenantId_idx" ON "KPIAlert"("tenantId");

-- CreateIndex
CREATE INDEX "KPIAlert_kpiDefinitionId_idx" ON "KPIAlert"("kpiDefinitionId");

-- CreateIndex
CREATE INDEX "KPIAlert_isActive_idx" ON "KPIAlert"("isActive");

-- CreateIndex
CREATE INDEX "KPIAlert_lastTriggeredAt_idx" ON "KPIAlert"("lastTriggeredAt");

-- CreateIndex
CREATE INDEX "KPIAlert_externalId_sourceSystem_idx" ON "KPIAlert"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsCache_cacheKey_key" ON "AnalyticsCache"("cacheKey");

-- CreateIndex
CREATE INDEX "AnalyticsCache_tenantId_idx" ON "AnalyticsCache"("tenantId");

-- CreateIndex
CREATE INDEX "AnalyticsCache_queryHash_idx" ON "AnalyticsCache"("queryHash");

-- CreateIndex
CREATE INDEX "AnalyticsCache_expiresAt_idx" ON "AnalyticsCache"("expiresAt");

-- CreateIndex
CREATE INDEX "AnalyticsCache_hitCount_idx" ON "AnalyticsCache"("hitCount");

-- CreateIndex
CREATE INDEX "WorkflowStep_tenantId_idx" ON "WorkflowStep"("tenantId");

-- CreateIndex
CREATE INDEX "WorkflowStep_workflowId_idx" ON "WorkflowStep"("workflowId");

-- CreateIndex
CREATE INDEX "WorkflowStep_stepType_idx" ON "WorkflowStep"("stepType");

-- CreateIndex
CREATE INDEX "WorkflowStep_externalId_sourceSystem_idx" ON "WorkflowStep"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStep_workflowId_stepNumber_key" ON "WorkflowStep"("workflowId", "stepNumber");

-- CreateIndex
CREATE INDEX "StepExecution_tenantId_idx" ON "StepExecution"("tenantId");

-- CreateIndex
CREATE INDEX "StepExecution_workflowExecutionId_idx" ON "StepExecution"("workflowExecutionId");

-- CreateIndex
CREATE INDEX "StepExecution_workflowStepId_idx" ON "StepExecution"("workflowStepId");

-- CreateIndex
CREATE INDEX "StepExecution_status_idx" ON "StepExecution"("status");

-- CreateIndex
CREATE INDEX "StepExecution_startedAt_idx" ON "StepExecution"("startedAt");

-- CreateIndex
CREATE INDEX "StepExecution_externalId_sourceSystem_idx" ON "StepExecution"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_tenantId_idx" ON "WorkflowTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_category_idx" ON "WorkflowTemplate"("category");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_isActive_idx" ON "WorkflowTemplate"("isActive");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_isSystem_idx" ON "WorkflowTemplate"("isSystem");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_externalId_sourceSystem_idx" ON "WorkflowTemplate"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ScheduledWorkflowRun_tenantId_idx" ON "ScheduledWorkflowRun"("tenantId");

-- CreateIndex
CREATE INDEX "ScheduledWorkflowRun_workflowId_idx" ON "ScheduledWorkflowRun"("workflowId");

-- CreateIndex
CREATE INDEX "ScheduledWorkflowRun_nextRunAt_idx" ON "ScheduledWorkflowRun"("nextRunAt");

-- CreateIndex
CREATE INDEX "ScheduledWorkflowRun_isActive_idx" ON "ScheduledWorkflowRun"("isActive");

-- CreateIndex
CREATE INDEX "ScheduledWorkflowRun_externalId_sourceSystem_idx" ON "ScheduledWorkflowRun"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "IntegrationProviderConfig_tenantId_idx" ON "IntegrationProviderConfig"("tenantId");

-- CreateIndex
CREATE INDEX "IntegrationProviderConfig_category_idx" ON "IntegrationProviderConfig"("category");

-- CreateIndex
CREATE INDEX "IntegrationProviderConfig_isActive_idx" ON "IntegrationProviderConfig"("isActive");

-- CreateIndex
CREATE INDEX "IntegrationProviderConfig_externalId_sourceSystem_idx" ON "IntegrationProviderConfig"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "WebhookSubscription_tenantId_idx" ON "WebhookSubscription"("tenantId");

-- CreateIndex
CREATE INDEX "WebhookSubscription_webhookEndpointId_idx" ON "WebhookSubscription"("webhookEndpointId");

-- CreateIndex
CREATE INDEX "WebhookSubscription_eventType_idx" ON "WebhookSubscription"("eventType");

-- CreateIndex
CREATE INDEX "WebhookSubscription_isActive_idx" ON "WebhookSubscription"("isActive");

-- CreateIndex
CREATE INDEX "WebhookSubscription_externalId_sourceSystem_idx" ON "WebhookSubscription"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "APIRequestLog_tenantId_idx" ON "APIRequestLog"("tenantId");

-- CreateIndex
CREATE INDEX "APIRequestLog_integrationId_idx" ON "APIRequestLog"("integrationId");

-- CreateIndex
CREATE INDEX "APIRequestLog_timestamp_idx" ON "APIRequestLog"("timestamp");

-- CreateIndex
CREATE INDEX "APIRequestLog_endpoint_idx" ON "APIRequestLog"("endpoint");

-- CreateIndex
CREATE INDEX "TransformationTemplate_tenantId_idx" ON "TransformationTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "TransformationTemplate_sourceFormat_idx" ON "TransformationTemplate"("sourceFormat");

-- CreateIndex
CREATE INDEX "TransformationTemplate_targetFormat_idx" ON "TransformationTemplate"("targetFormat");

-- CreateIndex
CREATE INDEX "TransformationTemplate_externalId_sourceSystem_idx" ON "TransformationTemplate"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SyncJob_tenantId_idx" ON "SyncJob"("tenantId");

-- CreateIndex
CREATE INDEX "SyncJob_integrationId_idx" ON "SyncJob"("integrationId");

-- CreateIndex
CREATE INDEX "SyncJob_lastSyncAt_idx" ON "SyncJob"("lastSyncAt");

-- CreateIndex
CREATE INDEX "SyncJob_status_idx" ON "SyncJob"("status");

-- CreateIndex
CREATE INDEX "SyncJob_externalId_sourceSystem_idx" ON "SyncJob"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "CircuitBreakerStateRecord_integrationId_key" ON "CircuitBreakerStateRecord"("integrationId");

-- CreateIndex
CREATE INDEX "CircuitBreakerStateRecord_tenantId_idx" ON "CircuitBreakerStateRecord"("tenantId");

-- CreateIndex
CREATE INDEX "CircuitBreakerStateRecord_nextRetryAt_idx" ON "CircuitBreakerStateRecord"("nextRetryAt");

-- CreateIndex
CREATE INDEX "CircuitBreakerStateRecord_externalId_sourceSystem_idx" ON "CircuitBreakerStateRecord"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SearchIndex_tenantId_idx" ON "SearchIndex"("tenantId");

-- CreateIndex
CREATE INDEX "SearchIndex_entityType_idx" ON "SearchIndex"("entityType");

-- CreateIndex
CREATE INDEX "SearchIndex_status_idx" ON "SearchIndex"("status");

-- CreateIndex
CREATE INDEX "SearchIndex_externalId_sourceSystem_idx" ON "SearchIndex"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIndex_tenantId_entityType_key" ON "SearchIndex"("tenantId", "entityType");

-- CreateIndex
CREATE INDEX "SearchSuggestion_tenantId_idx" ON "SearchSuggestion"("tenantId");

-- CreateIndex
CREATE INDEX "SearchSuggestion_entityType_idx" ON "SearchSuggestion"("entityType");

-- CreateIndex
CREATE INDEX "SearchSuggestion_suggestionText_idx" ON "SearchSuggestion"("suggestionText");

-- CreateIndex
CREATE INDEX "SearchSuggestion_frequency_idx" ON "SearchSuggestion"("frequency");

-- CreateIndex
CREATE INDEX "SearchSuggestion_isActive_idx" ON "SearchSuggestion"("isActive");

-- CreateIndex
CREATE INDEX "SearchSuggestion_externalId_sourceSystem_idx" ON "SearchSuggestion"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SearchSynonym_tenantId_idx" ON "SearchSynonym"("tenantId");

-- CreateIndex
CREATE INDEX "SearchSynonym_term_idx" ON "SearchSynonym"("term");

-- CreateIndex
CREATE INDEX "SearchSynonym_entityType_idx" ON "SearchSynonym"("entityType");

-- CreateIndex
CREATE INDEX "SearchSynonym_isActive_idx" ON "SearchSynonym"("isActive");

-- CreateIndex
CREATE INDEX "SearchSynonym_externalId_sourceSystem_idx" ON "SearchSynonym"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SearchIndexQueue_tenantId_idx" ON "SearchIndexQueue"("tenantId");

-- CreateIndex
CREATE INDEX "SearchIndexQueue_entityType_entityId_idx" ON "SearchIndexQueue"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "SearchIndexQueue_operation_idx" ON "SearchIndexQueue"("operation");

-- CreateIndex
CREATE INDEX "SearchIndexQueue_priority_idx" ON "SearchIndexQueue"("priority");

-- CreateIndex
CREATE INDEX "SearchIndexQueue_processedAt_idx" ON "SearchIndexQueue"("processedAt");

-- CreateIndex
CREATE INDEX "SearchIndexQueue_externalId_sourceSystem_idx" ON "SearchIndexQueue"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AccessLog_tenantId_idx" ON "AccessLog"("tenantId");

-- CreateIndex
CREATE INDEX "AccessLog_userId_idx" ON "AccessLog"("userId");

-- CreateIndex
CREATE INDEX "AccessLog_resourceType_resourceId_idx" ON "AccessLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AccessLog_timestamp_idx" ON "AccessLog"("timestamp");

-- CreateIndex
CREATE INDEX "AccessLog_granted_idx" ON "AccessLog"("granted");

-- CreateIndex
CREATE INDEX "LoginAudit_tenantId_idx" ON "LoginAudit"("tenantId");

-- CreateIndex
CREATE INDEX "LoginAudit_userId_idx" ON "LoginAudit"("userId");

-- CreateIndex
CREATE INDEX "LoginAudit_email_idx" ON "LoginAudit"("email");

-- CreateIndex
CREATE INDEX "LoginAudit_timestamp_idx" ON "LoginAudit"("timestamp");

-- CreateIndex
CREATE INDEX "LoginAudit_success_idx" ON "LoginAudit"("success");

-- CreateIndex
CREATE INDEX "APIAuditLog_tenantId_idx" ON "APIAuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "APIAuditLog_userId_idx" ON "APIAuditLog"("userId");

-- CreateIndex
CREATE INDEX "APIAuditLog_apiKeyId_idx" ON "APIAuditLog"("apiKeyId");

-- CreateIndex
CREATE INDEX "APIAuditLog_endpoint_idx" ON "APIAuditLog"("endpoint");

-- CreateIndex
CREATE INDEX "APIAuditLog_timestamp_idx" ON "APIAuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "ComplianceCheckpoint_tenantId_idx" ON "ComplianceCheckpoint"("tenantId");

-- CreateIndex
CREATE INDEX "ComplianceCheckpoint_entityType_entityId_idx" ON "ComplianceCheckpoint"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ComplianceCheckpoint_status_idx" ON "ComplianceCheckpoint"("status");

-- CreateIndex
CREATE INDEX "ComplianceCheckpoint_expiryDate_idx" ON "ComplianceCheckpoint"("expiryDate");

-- CreateIndex
CREATE INDEX "ComplianceCheckpoint_externalId_sourceSystem_idx" ON "ComplianceCheckpoint"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AuditAlert_tenantId_idx" ON "AuditAlert"("tenantId");

-- CreateIndex
CREATE INDEX "AuditAlert_severity_idx" ON "AuditAlert"("severity");

-- CreateIndex
CREATE INDEX "AuditAlert_isActive_idx" ON "AuditAlert"("isActive");

-- CreateIndex
CREATE INDEX "AuditAlert_externalId_sourceSystem_idx" ON "AuditAlert"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AuditAlertIncident_tenantId_idx" ON "AuditAlertIncident"("tenantId");

-- CreateIndex
CREATE INDEX "AuditAlertIncident_auditAlertId_idx" ON "AuditAlertIncident"("auditAlertId");

-- CreateIndex
CREATE INDEX "AuditAlertIncident_triggeredAt_idx" ON "AuditAlertIncident"("triggeredAt");

-- CreateIndex
CREATE INDEX "AuditAlertIncident_severity_idx" ON "AuditAlertIncident"("severity");

-- CreateIndex
CREATE INDEX "AuditAlertIncident_resolvedAt_idx" ON "AuditAlertIncident"("resolvedAt");

-- CreateIndex
CREATE INDEX "AuditAlertIncident_externalId_sourceSystem_idx" ON "AuditAlertIncident"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AuditRetentionPolicy_tenantId_idx" ON "AuditRetentionPolicy"("tenantId");

-- CreateIndex
CREATE INDEX "AuditRetentionPolicy_entityType_idx" ON "AuditRetentionPolicy"("entityType");

-- CreateIndex
CREATE INDEX "AuditRetentionPolicy_isActive_idx" ON "AuditRetentionPolicy"("isActive");

-- CreateIndex
CREATE INDEX "AuditRetentionPolicy_externalId_sourceSystem_idx" ON "AuditRetentionPolicy"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "AuditRetentionPolicy_tenantId_entityType_key" ON "AuditRetentionPolicy"("tenantId", "entityType");

-- CreateIndex
CREATE INDEX "TenantConfig_tenantId_idx" ON "TenantConfig"("tenantId");

-- CreateIndex
CREATE INDEX "TenantConfig_configKey_idx" ON "TenantConfig"("configKey");

-- CreateIndex
CREATE INDEX "TenantConfig_externalId_sourceSystem_idx" ON "TenantConfig"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "TenantConfig_tenantId_configKey_key" ON "TenantConfig"("tenantId", "configKey");

-- CreateIndex
CREATE INDEX "UserPreference_tenantId_idx" ON "UserPreference"("tenantId");

-- CreateIndex
CREATE INDEX "UserPreference_userId_idx" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "UserPreference_preferenceKey_idx" ON "UserPreference"("preferenceKey");

-- CreateIndex
CREATE INDEX "UserPreference_externalId_sourceSystem_idx" ON "UserPreference"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_preferenceKey_key" ON "UserPreference"("userId", "preferenceKey");

-- CreateIndex
CREATE INDEX "FeatureFlagOverride_featureFlagId_idx" ON "FeatureFlagOverride"("featureFlagId");

-- CreateIndex
CREATE INDEX "FeatureFlagOverride_tenantId_idx" ON "FeatureFlagOverride"("tenantId");

-- CreateIndex
CREATE INDEX "FeatureFlagOverride_userId_idx" ON "FeatureFlagOverride"("userId");

-- CreateIndex
CREATE INDEX "FeatureFlagOverride_expiresAt_idx" ON "FeatureFlagOverride"("expiresAt");

-- CreateIndex
CREATE INDEX "FeatureFlagOverride_externalId_sourceSystem_idx" ON "FeatureFlagOverride"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ConfigTemplate_tenantId_idx" ON "ConfigTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "ConfigTemplate_templateType_idx" ON "ConfigTemplate"("templateType");

-- CreateIndex
CREATE INDEX "ConfigTemplate_isSystem_idx" ON "ConfigTemplate"("isSystem");

-- CreateIndex
CREATE INDEX "ConfigTemplate_externalId_sourceSystem_idx" ON "ConfigTemplate"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ConfigHistory_tenantId_idx" ON "ConfigHistory"("tenantId");

-- CreateIndex
CREATE INDEX "ConfigHistory_configKey_idx" ON "ConfigHistory"("configKey");

-- CreateIndex
CREATE INDEX "ConfigHistory_changedAt_idx" ON "ConfigHistory"("changedAt");

-- CreateIndex
CREATE INDEX "ConfigHistory_changedBy_idx" ON "ConfigHistory"("changedBy");

-- CreateIndex
CREATE INDEX "ConfigHistory_externalId_sourceSystem_idx" ON "ConfigHistory"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "BusinessHours_tenantId_idx" ON "BusinessHours"("tenantId");

-- CreateIndex
CREATE INDEX "BusinessHours_locationId_idx" ON "BusinessHours"("locationId");

-- CreateIndex
CREATE INDEX "BusinessHours_dayOfWeek_idx" ON "BusinessHours"("dayOfWeek");

-- CreateIndex
CREATE INDEX "BusinessHours_externalId_sourceSystem_idx" ON "BusinessHours"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Holiday_tenantId_idx" ON "Holiday"("tenantId");

-- CreateIndex
CREATE INDEX "Holiday_holidayDate_idx" ON "Holiday"("holidayDate");

-- CreateIndex
CREATE INDEX "Holiday_countryCode_idx" ON "Holiday"("countryCode");

-- CreateIndex
CREATE INDEX "Holiday_externalId_sourceSystem_idx" ON "Holiday"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "NumberSequence_tenantId_idx" ON "NumberSequence"("tenantId");

-- CreateIndex
CREATE INDEX "NumberSequence_sequenceName_idx" ON "NumberSequence"("sequenceName");

-- CreateIndex
CREATE INDEX "NumberSequence_externalId_sourceSystem_idx" ON "NumberSequence"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "NumberSequence_tenantId_sequenceName_key" ON "NumberSequence"("tenantId", "sequenceName");

-- CreateIndex
CREATE INDEX "ScheduledTask_tenantId_idx" ON "ScheduledTask"("tenantId");

-- CreateIndex
CREATE INDEX "ScheduledTask_taskType_idx" ON "ScheduledTask"("taskType");

-- CreateIndex
CREATE INDEX "ScheduledTask_scheduledFor_idx" ON "ScheduledTask"("scheduledFor");

-- CreateIndex
CREATE INDEX "ScheduledTask_status_idx" ON "ScheduledTask"("status");

-- CreateIndex
CREATE INDEX "ScheduledTask_entityType_entityId_idx" ON "ScheduledTask"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ScheduledTask_externalId_sourceSystem_idx" ON "ScheduledTask"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Reminder_tenantId_idx" ON "Reminder"("tenantId");

-- CreateIndex
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");

-- CreateIndex
CREATE INDEX "Reminder_reminderType_idx" ON "Reminder"("reminderType");

-- CreateIndex
CREATE INDEX "Reminder_remindAt_idx" ON "Reminder"("remindAt");

-- CreateIndex
CREATE INDEX "Reminder_status_idx" ON "Reminder"("status");

-- CreateIndex
CREATE INDEX "Reminder_entityType_entityId_idx" ON "Reminder"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Reminder_externalId_sourceSystem_idx" ON "Reminder"("externalId", "sourceSystem");

-- AddForeignKey
ALTER TABLE "PortalSavedPaymentMethod" ADD CONSTRAINT "PortalSavedPaymentMethod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSavedPaymentMethod" ADD CONSTRAINT "PortalSavedPaymentMethod_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalBranding" ADD CONSTRAINT "PortalBranding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalBranding" ADD CONSTRAINT "PortalBranding_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalNotification" ADD CONSTRAINT "PortalNotification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalNotification" ADD CONSTRAINT "PortalNotification_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierSavedLoad" ADD CONSTRAINT "CarrierSavedLoad_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierSavedLoad" ADD CONSTRAINT "CarrierSavedLoad_carrierPortalUserId_fkey" FOREIGN KEY ("carrierPortalUserId") REFERENCES "CarrierPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierSavedLoad" ADD CONSTRAINT "CarrierSavedLoad_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalNotification" ADD CONSTRAINT "CarrierPortalNotification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalNotification" ADD CONSTRAINT "CarrierPortalNotification_carrierPortalUserId_fkey" FOREIGN KEY ("carrierPortalUserId") REFERENCES "CarrierPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTemplate" ADD CONSTRAINT "ContractTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractClause" ADD CONSTRAINT "ContractClause_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRateTable" ADD CONSTRAINT "ContractRateTable_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRateTable" ADD CONSTRAINT "ContractRateTable_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRateLane" ADD CONSTRAINT "ContractRateLane_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRateLane" ADD CONSTRAINT "ContractRateLane_rateTableId_fkey" FOREIGN KEY ("rateTableId") REFERENCES "ContractRateTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRateLane" ADD CONSTRAINT "ContractRateLane_fuelSurchargeTableId_fkey" FOREIGN KEY ("fuelSurchargeTableId") REFERENCES "FuelSurchargeTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAmendment" ADD CONSTRAINT "ContractAmendment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAmendment" ADD CONSTRAINT "ContractAmendment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAmendment" ADD CONSTRAINT "ContractAmendment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractMetric" ADD CONSTRAINT "ContractMetric_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractMetric" ADD CONSTRAINT "ContractMetric_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentContact" ADD CONSTRAINT "AgentContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentContact" ADD CONSTRAINT "AgentContact_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLead" ADD CONSTRAINT "AgentLead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLead" ADD CONSTRAINT "AgentLead_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLead" ADD CONSTRAINT "AgentLead_convertedToCustomerId_fkey" FOREIGN KEY ("convertedToCustomerId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPayout" ADD CONSTRAINT "AgentPayout_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPayout" ADD CONSTRAINT "AgentPayout_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDrawBalance" ADD CONSTRAINT "AgentDrawBalance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDrawBalance" ADD CONSTRAINT "AgentDrawBalance_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPortalUser" ADD CONSTRAINT "AgentPortalUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPortalUser" ADD CONSTRAINT "AgentPortalUser_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPortalUser" ADD CONSTRAINT "AgentPortalUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoringVerification" ADD CONSTRAINT "FactoringVerification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoringVerification" ADD CONSTRAINT "FactoringVerification_noaRecordId_fkey" FOREIGN KEY ("noaRecordId") REFERENCES "NOARecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoringVerification" ADD CONSTRAINT "FactoringVerification_verificationDocumentId_fkey" FOREIGN KEY ("verificationDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoredPayment" ADD CONSTRAINT "FactoredPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoredPayment" ADD CONSTRAINT "FactoredPayment_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoredPayment" ADD CONSTRAINT "FactoredPayment_factoringCompanyId_fkey" FOREIGN KEY ("factoringCompanyId") REFERENCES "FactoringCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffBalance" ADD CONSTRAINT "TimeOffBalance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffBalance" ADD CONSTRAINT "TimeOffBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "OnboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPISnapshot" ADD CONSTRAINT "KPISnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPISnapshot" ADD CONSTRAINT "KPISnapshot_kpiDefinitionId_fkey" FOREIGN KEY ("kpiDefinitionId") REFERENCES "KPIDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_kpiDefinitionId_fkey" FOREIGN KEY ("kpiDefinitionId") REFERENCES "KPIDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTemplate" ADD CONSTRAINT "ReportTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportExecution" ADD CONSTRAINT "ReportExecution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportExecution" ADD CONSTRAINT "ReportExecution_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportExecution" ADD CONSTRAINT "ReportExecution_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ReportTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAnalyticsView" ADD CONSTRAINT "SavedAnalyticsView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAnalyticsView" ADD CONSTRAINT "SavedAnalyticsView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIAlert" ADD CONSTRAINT "KPIAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIAlert" ADD CONSTRAINT "KPIAlert_kpiDefinitionId_fkey" FOREIGN KEY ("kpiDefinitionId") REFERENCES "KPIDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsCache" ADD CONSTRAINT "AnalyticsCache_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStep" ADD CONSTRAINT "WorkflowStep_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStep" ADD CONSTRAINT "WorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepExecution" ADD CONSTRAINT "StepExecution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepExecution" ADD CONSTRAINT "StepExecution_workflowExecutionId_fkey" FOREIGN KEY ("workflowExecutionId") REFERENCES "WorkflowExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepExecution" ADD CONSTRAINT "StepExecution_workflowStepId_fkey" FOREIGN KEY ("workflowStepId") REFERENCES "WorkflowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTemplate" ADD CONSTRAINT "WorkflowTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledWorkflowRun" ADD CONSTRAINT "ScheduledWorkflowRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledWorkflowRun" ADD CONSTRAINT "ScheduledWorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationProviderConfig" ADD CONSTRAINT "IntegrationProviderConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_webhookEndpointId_fkey" FOREIGN KEY ("webhookEndpointId") REFERENCES "WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIRequestLog" ADD CONSTRAINT "APIRequestLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIRequestLog" ADD CONSTRAINT "APIRequestLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransformationTemplate" ADD CONSTRAINT "TransformationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircuitBreakerStateRecord" ADD CONSTRAINT "CircuitBreakerStateRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircuitBreakerStateRecord" ADD CONSTRAINT "CircuitBreakerStateRecord_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchIndex" ADD CONSTRAINT "SearchIndex_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchSuggestion" ADD CONSTRAINT "SearchSuggestion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchSynonym" ADD CONSTRAINT "SearchSynonym_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchIndexQueue" ADD CONSTRAINT "SearchIndexQueue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAudit" ADD CONSTRAINT "LoginAudit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAudit" ADD CONSTRAINT "LoginAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIAuditLog" ADD CONSTRAINT "APIAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIAuditLog" ADD CONSTRAINT "APIAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheckpoint" ADD CONSTRAINT "ComplianceCheckpoint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAlert" ADD CONSTRAINT "AuditAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAlertIncident" ADD CONSTRAINT "AuditAlertIncident_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAlertIncident" ADD CONSTRAINT "AuditAlertIncident_auditAlertId_fkey" FOREIGN KEY ("auditAlertId") REFERENCES "AuditAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRetentionPolicy" ADD CONSTRAINT "AuditRetentionPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantConfig" ADD CONSTRAINT "TenantConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlagOverride" ADD CONSTRAINT "FeatureFlagOverride_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "FeatureFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlagOverride" ADD CONSTRAINT "FeatureFlagOverride_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlagOverride" ADD CONSTRAINT "FeatureFlagOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigTemplate" ADD CONSTRAINT "ConfigTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigHistory" ADD CONSTRAINT "ConfigHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessHours" ADD CONSTRAINT "BusinessHours_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessHours" ADD CONSTRAINT "BusinessHours_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NumberSequence" ADD CONSTRAINT "NumberSequence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
