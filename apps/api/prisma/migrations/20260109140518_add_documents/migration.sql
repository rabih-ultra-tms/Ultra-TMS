-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "externalId" VARCHAR(100),
    "sourceSystem" VARCHAR(50),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "documentType" VARCHAR(50) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "fileExtension" VARCHAR(20),
    "storageProvider" VARCHAR(50) NOT NULL DEFAULT 'S3',
    "bucketName" VARCHAR(100),
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "loadId" TEXT,
    "orderId" TEXT,
    "carrierId" TEXT,
    "companyId" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "ocrProcessed" BOOLEAN NOT NULL DEFAULT false,
    "ocrText" TEXT,
    "ocrProcessedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tags" VARCHAR(100)[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentDocumentId" TEXT,
    "isLatestVersion" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" VARCHAR(100),
    "accessExpiresAt" TIMESTAMP(3),
    "retentionDate" DATE,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "templateType" VARCHAR(50) NOT NULL,
    "templateFormat" VARCHAR(50) NOT NULL,
    "templateContent" TEXT,
    "templateFilePath" VARCHAR(500),
    "paperSize" VARCHAR(20) NOT NULL DEFAULT 'LETTER',
    "orientation" VARCHAR(20) NOT NULL DEFAULT 'PORTRAIT',
    "margins" JSONB NOT NULL DEFAULT '{"top": 1, "bottom": 1, "left": 1, "right": 1}',
    "includeLogo" BOOLEAN NOT NULL DEFAULT true,
    "logoPosition" VARCHAR(20) NOT NULL DEFAULT 'TOP_LEFT',
    "headerContent" TEXT,
    "footerContent" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "documentId" TEXT,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "dataSnapshot" JSONB NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "requestedBy" TEXT,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentShare" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "shareType" VARCHAR(50) NOT NULL,
    "accessToken" VARCHAR(100) NOT NULL,
    "accessPassword" VARCHAR(255),
    "expiresAt" TIMESTAMP(3),
    "maxViews" INTEGER,
    "maxDownloads" INTEGER,
    "allowDownload" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "recipientEmail" VARCHAR(255),
    "recipientName" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "DocumentShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentFolder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "parentFolderId" TEXT,
    "path" VARCHAR(1000),
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "DocumentFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderDocument" (
    "folderId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,

    CONSTRAINT "FolderDocument_pkey" PRIMARY KEY ("folderId","documentId")
);

-- CreateIndex
CREATE INDEX "Document_tenantId_idx" ON "Document"("tenantId");

-- CreateIndex
CREATE INDEX "Document_tenantId_documentType_idx" ON "Document"("tenantId", "documentType");

-- CreateIndex
CREATE INDEX "Document_entityType_entityId_idx" ON "Document"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Document_loadId_idx" ON "Document"("loadId");

-- CreateIndex
CREATE INDEX "Document_carrierId_idx" ON "Document"("carrierId");

-- CreateIndex
CREATE INDEX "Document_companyId_idx" ON "Document"("companyId");

-- CreateIndex
CREATE INDEX "DocumentTemplate_tenantId_idx" ON "DocumentTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentTemplate_tenantId_templateType_idx" ON "DocumentTemplate"("tenantId", "templateType");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_tenantId_name_templateType_key" ON "DocumentTemplate"("tenantId", "name", "templateType");

-- CreateIndex
CREATE INDEX "GeneratedDocument_tenantId_idx" ON "GeneratedDocument"("tenantId");

-- CreateIndex
CREATE INDEX "GeneratedDocument_entityType_entityId_idx" ON "GeneratedDocument"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "GeneratedDocument_status_idx" ON "GeneratedDocument"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShare_accessToken_key" ON "DocumentShare"("accessToken");

-- CreateIndex
CREATE INDEX "DocumentShare_documentId_idx" ON "DocumentShare"("documentId");

-- CreateIndex
CREATE INDEX "DocumentShare_accessToken_idx" ON "DocumentShare"("accessToken");

-- CreateIndex
CREATE INDEX "DocumentFolder_tenantId_idx" ON "DocumentFolder"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentFolder_parentFolderId_idx" ON "DocumentFolder"("parentFolderId");

-- CreateIndex
CREATE INDEX "DocumentFolder_entityType_entityId_idx" ON "DocumentFolder"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentFolder_tenantId_parentFolderId_name_key" ON "DocumentFolder"("tenantId", "parentFolderId", "name");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "DocumentFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderDocument" ADD CONSTRAINT "FolderDocument_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "DocumentFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderDocument" ADD CONSTRAINT "FolderDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderDocument" ADD CONSTRAINT "FolderDocument_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
