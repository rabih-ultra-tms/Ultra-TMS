# Documents Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Document | Universal document storage | Load, Order, Carrier, Company |
| DocumentFolder | Folder hierarchy | Self-referential, FolderDocument |
| DocumentShare | External sharing with access control | Document |
| DocumentTemplate | PDF/document generation templates | GeneratedDocument |
| GeneratedDocument | Auto-generated documents | Document, DocumentTemplate |
| FolderDocument | Many-to-many folder-document link | DocumentFolder, Document |

## Document

Universal document entity supporting S3 storage, OCR, versioning.

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(255) |
| description | String? | |
| documentType | String | VarChar(50) — BOL, POD, RATE_CONFIRM, INVOICE, W9, etc. |
| fileName | String | VarChar(255) |
| filePath | String | VarChar(500) — S3 key |
| fileSize | Int | Bytes |
| mimeType | String | VarChar(100) |
| fileExtension | String? | VarChar(20) |
| storageProvider | String | @default("S3") |
| bucketName | String? | VarChar(100) |
| entityType | String? | VarChar(50) — polymorphic |
| entityId | String? | |
| loadId | String? | FK to Load |
| orderId | String? | FK to Order |
| carrierId | String? | FK to Carrier |
| companyId | String? | FK to Company |
| status | String | @default("ACTIVE") |
| ocrProcessed | Boolean | @default(false) |
| ocrText | String? | Extracted text |
| tags | String[] | VarChar(100) |
| version | Int | @default(1) |
| parentDocumentId | String? | Previous version |
| isLatestVersion | Boolean | @default(true) |
| isPublic | Boolean | @default(false) |
| accessToken | String? | VarChar(100) — temporary access |
| retentionDate | DateTime? | Auto-delete date |
| uploadedBy | String? | FK to User |

**Self-relation:** parentDocument / childDocuments (versioning)

## DocumentTemplate

Templates for generating PDFs (rate confirmations, BOLs, invoices).

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(255) |
| templateType | String | VarChar(50) — RATE_CONFIRMATION, BOL, INVOICE |
| templateFormat | String | VarChar(50) — HTML, HANDLEBARS |
| templateContent | String? | Template body |
| templateFilePath | String? | VarChar(500) |
| paperSize | String | @default("LETTER") |
| orientation | String | @default("PORTRAIT") |
| margins | Json | Default 1-inch |
| includeLogo | Boolean | @default(true) |
| headerContent/footerContent | String? | |
| isDefault | Boolean | @default(false) |
| language | String | @default("en") |

## DocumentShare

External document sharing with expiry and access tracking.

| Field | Type | Notes |
|-------|------|-------|
| documentId | String | FK to Document |
| shareType | String | VarChar(50) — LINK, EMAIL |
| accessToken | String | @unique — shareable token |
| accessPassword | String? | Optional password |
| expiresAt | DateTime? | |
| maxViews/maxDownloads | Int? | Limits |
| allowDownload | Boolean | @default(true) |
| viewCount/downloadCount | Int | Usage tracking |
| recipientEmail/recipientName | String? | |
| status | String | @default("ACTIVE") |
