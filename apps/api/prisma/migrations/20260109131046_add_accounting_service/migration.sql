-- CreateTable
CREATE TABLE "ChartOfAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountNumber" VARCHAR(20) NOT NULL,
    "accountName" VARCHAR(255) NOT NULL,
    "accountType" VARCHAR(50) NOT NULL,
    "accountSubType" VARCHAR(50),
    "parentAccountId" TEXT,
    "description" TEXT,
    "normalBalance" VARCHAR(10) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystemAccount" BOOLEAN NOT NULL DEFAULT false,
    "balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "quickbooksId" VARCHAR(50),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartOfAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceNumber" VARCHAR(50) NOT NULL,
    "companyId" TEXT NOT NULL,
    "orderId" TEXT,
    "loadId" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "quickbooksId" VARCHAR(50),
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "paymentTerms" VARCHAR(50),
    "notes" TEXT,
    "internalNotes" TEXT,
    "daysOutstanding" INTEGER,
    "agingBucket" VARCHAR(20),
    "lastReminderDate" TIMESTAMP(3),
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "collectionStatus" VARCHAR(50),
    "revenueAccountId" TEXT,
    "arAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidedById" TEXT,
    "voidReason" TEXT,
    "customFields" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "loadId" TEXT,
    "orderId" TEXT,
    "lineNumber" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "itemType" VARCHAR(50),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "revenueAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "settlementNumber" VARCHAR(50) NOT NULL,
    "carrierId" TEXT NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "quickbooksId" VARCHAR(50),
    "settlementDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentType" VARCHAR(50),
    "quickPayFeePercent" DECIMAL(5,2),
    "quickPayFeeAmount" DECIMAL(12,2),
    "grossAmount" DECIMAL(12,2) NOT NULL,
    "deductionsTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "quickPayFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "paymentMethod" VARCHAR(50),
    "payToName" VARCHAR(255),
    "payToFactoring" BOOLEAN NOT NULL DEFAULT false,
    "factoringCompanyId" TEXT,
    "factoringAccount" VARCHAR(100),
    "expenseAccountId" TEXT,
    "apAccountId" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "customFields" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementLineItem" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "loadId" TEXT,
    "lineNumber" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "itemType" VARCHAR(50),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitRate" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "expenseAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceived" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "paymentNumber" VARCHAR(50) NOT NULL,
    "companyId" TEXT NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "quickbooksId" VARCHAR(50),
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "unappliedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "referenceNumber" VARCHAR(100),
    "bankAccountId" TEXT,
    "depositDate" TIMESTAMP(3),
    "status" VARCHAR(50) NOT NULL DEFAULT 'RECEIVED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "PaymentReceived_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentApplication" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "PaymentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMade" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "paymentNumber" VARCHAR(50) NOT NULL,
    "carrierId" TEXT NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "quickbooksId" VARCHAR(50),
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "referenceNumber" VARCHAR(100),
    "bankAccountId" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "achBatchId" VARCHAR(100),
    "achTraceNumber" VARCHAR(100),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "PaymentMade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entryNumber" VARCHAR(50) NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "quickbooksId" VARCHAR(50),
    "entryDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "referenceType" VARCHAR(50),
    "referenceId" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "totalDebit" DECIMAL(14,2) NOT NULL,
    "totalCredit" DECIMAL(14,2) NOT NULL,
    "postedById" TEXT,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntryLine" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "description" VARCHAR(255),
    "debitAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "customerId" TEXT,
    "carrierId" TEXT,
    "loadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickbooksSyncLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "quickbooksId" VARCHAR(50),
    "syncDirection" VARCHAR(20) NOT NULL,
    "syncStatus" VARCHAR(20) NOT NULL,
    "payloadSent" JSONB,
    "payloadReceived" JSONB,
    "errorMessage" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuickbooksSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChartOfAccount_tenantId_idx" ON "ChartOfAccount"("tenantId");

-- CreateIndex
CREATE INDEX "ChartOfAccount_accountType_idx" ON "ChartOfAccount"("accountType");

-- CreateIndex
CREATE INDEX "ChartOfAccount_isActive_idx" ON "ChartOfAccount"("isActive");

-- CreateIndex
CREATE INDEX "ChartOfAccount_parentAccountId_idx" ON "ChartOfAccount"("parentAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccount_tenantId_accountNumber_key" ON "ChartOfAccount"("tenantId", "accountNumber");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_idx" ON "Invoice"("tenantId");

-- CreateIndex
CREATE INDEX "Invoice_companyId_idx" ON "Invoice"("companyId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_orderId_idx" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_loadId_idx" ON "Invoice"("loadId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_tenantId_invoiceNumber_key" ON "Invoice"("tenantId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_loadId_idx" ON "InvoiceLineItem"("loadId");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_orderId_idx" ON "InvoiceLineItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceLineItem_invoiceId_lineNumber_key" ON "InvoiceLineItem"("invoiceId", "lineNumber");

-- CreateIndex
CREATE INDEX "Settlement_tenantId_idx" ON "Settlement"("tenantId");

-- CreateIndex
CREATE INDEX "Settlement_carrierId_idx" ON "Settlement"("carrierId");

-- CreateIndex
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status");

-- CreateIndex
CREATE INDEX "Settlement_dueDate_idx" ON "Settlement"("dueDate");

-- CreateIndex
CREATE INDEX "Settlement_settlementDate_idx" ON "Settlement"("settlementDate");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_tenantId_settlementNumber_key" ON "Settlement"("tenantId", "settlementNumber");

-- CreateIndex
CREATE INDEX "SettlementLineItem_settlementId_idx" ON "SettlementLineItem"("settlementId");

-- CreateIndex
CREATE INDEX "SettlementLineItem_loadId_idx" ON "SettlementLineItem"("loadId");

-- CreateIndex
CREATE UNIQUE INDEX "SettlementLineItem_settlementId_lineNumber_key" ON "SettlementLineItem"("settlementId", "lineNumber");

-- CreateIndex
CREATE INDEX "PaymentReceived_tenantId_idx" ON "PaymentReceived"("tenantId");

-- CreateIndex
CREATE INDEX "PaymentReceived_companyId_idx" ON "PaymentReceived"("companyId");

-- CreateIndex
CREATE INDEX "PaymentReceived_paymentDate_idx" ON "PaymentReceived"("paymentDate");

-- CreateIndex
CREATE INDEX "PaymentReceived_status_idx" ON "PaymentReceived"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceived_tenantId_paymentNumber_key" ON "PaymentReceived"("tenantId", "paymentNumber");

-- CreateIndex
CREATE INDEX "PaymentApplication_paymentId_idx" ON "PaymentApplication"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentApplication_invoiceId_idx" ON "PaymentApplication"("invoiceId");

-- CreateIndex
CREATE INDEX "PaymentMade_tenantId_idx" ON "PaymentMade"("tenantId");

-- CreateIndex
CREATE INDEX "PaymentMade_carrierId_idx" ON "PaymentMade"("carrierId");

-- CreateIndex
CREATE INDEX "PaymentMade_paymentDate_idx" ON "PaymentMade"("paymentDate");

-- CreateIndex
CREATE INDEX "PaymentMade_status_idx" ON "PaymentMade"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMade_tenantId_paymentNumber_key" ON "PaymentMade"("tenantId", "paymentNumber");

-- CreateIndex
CREATE INDEX "JournalEntry_tenantId_idx" ON "JournalEntry"("tenantId");

-- CreateIndex
CREATE INDEX "JournalEntry_entryDate_idx" ON "JournalEntry"("entryDate");

-- CreateIndex
CREATE INDEX "JournalEntry_referenceType_referenceId_idx" ON "JournalEntry"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "JournalEntry_status_idx" ON "JournalEntry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_tenantId_entryNumber_key" ON "JournalEntry"("tenantId", "entryNumber");

-- CreateIndex
CREATE INDEX "JournalEntryLine_journalEntryId_idx" ON "JournalEntryLine"("journalEntryId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_accountId_idx" ON "JournalEntryLine"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntryLine_journalEntryId_lineNumber_key" ON "JournalEntryLine"("journalEntryId", "lineNumber");

-- CreateIndex
CREATE INDEX "QuickbooksSyncLog_tenantId_idx" ON "QuickbooksSyncLog"("tenantId");

-- CreateIndex
CREATE INDEX "QuickbooksSyncLog_entityType_entityId_idx" ON "QuickbooksSyncLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "QuickbooksSyncLog_syncStatus_idx" ON "QuickbooksSyncLog"("syncStatus");

-- AddForeignKey
ALTER TABLE "ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_revenueAccountId_fkey" FOREIGN KEY ("revenueAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_arAccountId_fkey" FOREIGN KEY ("arAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_revenueAccountId_fkey" FOREIGN KEY ("revenueAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_expenseAccountId_fkey" FOREIGN KEY ("expenseAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_apAccountId_fkey" FOREIGN KEY ("apAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLineItem" ADD CONSTRAINT "SettlementLineItem_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLineItem" ADD CONSTRAINT "SettlementLineItem_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLineItem" ADD CONSTRAINT "SettlementLineItem_expenseAccountId_fkey" FOREIGN KEY ("expenseAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceived" ADD CONSTRAINT "PaymentReceived_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentApplication" ADD CONSTRAINT "PaymentApplication_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentReceived"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentApplication" ADD CONSTRAINT "PaymentApplication_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMade" ADD CONSTRAINT "PaymentMade_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMade" ADD CONSTRAINT "PaymentMade_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMade" ADD CONSTRAINT "PaymentMade_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ChartOfAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickbooksSyncLog" ADD CONSTRAINT "QuickbooksSyncLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
