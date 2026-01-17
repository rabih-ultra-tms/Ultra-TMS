-- CreateIndex
CREATE INDEX "AuditLog_tenantId_userId_idx" ON "AuditLog"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_action_idx" ON "AuditLog"("tenantId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_entityType_idx" ON "AuditLog"("tenantId", "entityType");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "Carrier_tenantId_status_idx" ON "Carrier"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Carrier_tenantId_deletedAt_idx" ON "Carrier"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "CommissionEntry_tenantId_deletedAt_idx" ON "CommissionEntry"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "CommissionPayout_tenantId_status_idx" ON "CommissionPayout"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CommissionPayout_tenantId_paidAt_idx" ON "CommissionPayout"("tenantId", "paidAt");

-- CreateIndex
CREATE INDEX "CommissionPayout_tenantId_deletedAt_idx" ON "CommissionPayout"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Company_tenantId_status_idx" ON "Company"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Company_tenantId_companyType_idx" ON "Company"("tenantId", "companyType");

-- CreateIndex
CREATE INDEX "Company_tenantId_deletedAt_idx" ON "Company"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");

-- CreateIndex
CREATE INDEX "Contact_tenantId_email_idx" ON "Contact"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Contact_tenantId_deletedAt_idx" ON "Contact"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Contact_companyId_isPrimary_idx" ON "Contact"("companyId", "isPrimary");

-- CreateIndex
CREATE INDEX "Document_tenantId_deletedAt_idx" ON "Document"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- CreateIndex
CREATE INDEX "Driver_tenantId_status_idx" ON "Driver"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Driver_tenantId_deletedAt_idx" ON "Driver"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Integration_tenantId_status_idx" ON "Integration"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Integration_tenantId_category_idx" ON "Integration"("tenantId", "category");

-- CreateIndex
CREATE INDEX "Integration_tenantId_deletedAt_idx" ON "Integration"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_status_idx" ON "Invoice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_companyId_idx" ON "Invoice"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_dueDate_idx" ON "Invoice"("tenantId", "dueDate");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_status_dueDate_idx" ON "Invoice"("tenantId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Invoice_createdAt_idx" ON "Invoice"("createdAt");

-- CreateIndex
CREATE INDEX "Load_tenantId_status_idx" ON "Load"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Load_tenantId_carrierId_idx" ON "Load"("tenantId", "carrierId");

-- CreateIndex
CREATE INDEX "Load_tenantId_deletedAt_idx" ON "Load"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Load_createdAt_idx" ON "Load"("createdAt");

-- CreateIndex
CREATE INDEX "LoadBid_tenantId_deletedAt_idx" ON "LoadBid"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "LoadBid_postingId_status_idx" ON "LoadBid"("postingId", "status");

-- CreateIndex
CREATE INDEX "LoadBid_carrierId_status_idx" ON "LoadBid"("carrierId", "status");

-- CreateIndex
CREATE INDEX "LoadPosting_tenantId_deletedAt_idx" ON "LoadPosting"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "LoadPosting_originState_destState_idx" ON "LoadPosting"("originState", "destState");

-- CreateIndex
CREATE INDEX "LoadPosting_status_expiresAt_idx" ON "LoadPosting"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "LoadPosting_status_originState_expiresAt_idx" ON "LoadPosting"("status", "originState", "expiresAt");

-- CreateIndex
CREATE INDEX "LoadPosting_createdAt_idx" ON "LoadPosting"("createdAt");

-- CreateIndex
CREATE INDEX "Location_tenantId_city_state_idx" ON "Location"("tenantId", "city", "state");

-- CreateIndex
CREATE INDEX "Location_tenantId_zip_idx" ON "Location"("tenantId", "zip");

-- CreateIndex
CREATE INDEX "Location_tenantId_deletedAt_idx" ON "Location"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_tenantId_status_idx" ON "WebhookEndpoint"("tenantId", "status");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_tenantId_deletedAt_idx" ON "WebhookEndpoint"("tenantId", "deletedAt");
