# Document Service

## Overview

| Attribute             | Value                          |
| --------------------- | ------------------------------ |
| **Service ID**        | 10                             |
| **Category**          | Platform Services              |
| **Phase**             | A (Internal MVP)               |
| **Development Weeks** | 53-56                          |
| **Priority**          | P1 - High                      |
| **Dependencies**      | Auth/Admin (01), TMS Core (04) |

## Purpose

The Document Service provides centralized document management including upload, storage, retrieval, organization, and generation. It handles all document types across the platform including BOLs, PODs, rate confirmations, invoices, carrier documents, and customer contracts.

## Features

### Document Upload

- Multi-file upload support
- Drag-and-drop interface
- Mobile camera capture
- Email attachment extraction
- Automatic file type detection
- Virus scanning

### Document Storage

- Cloud storage (S3/MinIO)
- Organized folder structure
- Version control
- Retention policies
- Encryption at rest

### Document Retrieval

- Full-text search (OCR)
- Metadata filtering
- Quick preview
- Bulk download
- API access

### Document Generation

- Template-based generation
- PDF creation
- Dynamic data population
- Batch generation
- Custom branding

### Document Types

- Rate confirmations
- Bills of lading (BOL)
- Proof of delivery (POD)
- Carrier packets
- Insurance certificates
- Invoices and statements

## Database Schema

```sql
-- Document Storage
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Document info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL,
    -- BOL, POD, RATE_CONFIRM, INVOICE, INSURANCE, CONTRACT, W9,
    -- CARRIER_AGREEMENT, OTHER

    -- File details
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(20),

    -- Storage
    storage_provider VARCHAR(50) DEFAULT 'S3', -- S3, MINIO, LOCAL
    bucket_name VARCHAR(100),

    -- Entity association (polymorphic)
    entity_type VARCHAR(50), -- LOAD, ORDER, CARRIER, COMPANY, USER
    entity_id UUID,

    -- Additional associations
    load_id UUID REFERENCES loads(id),
    order_id UUID REFERENCES orders(id),
    carrier_id UUID REFERENCES carriers(id),
    company_id UUID REFERENCES companies(id),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- ACTIVE, ARCHIVED, DELETED, PROCESSING, FAILED

    -- Processing
    ocr_processed BOOLEAN DEFAULT false,
    ocr_text TEXT,
    ocr_processed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags VARCHAR(100)[],

    -- Versioning
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    is_latest_version BOOLEAN DEFAULT true,

    -- Security
    is_public BOOLEAN DEFAULT false,
    access_token VARCHAR(100), -- For public/temporary access
    access_expires_at TIMESTAMP WITH TIME ZONE,

    -- Retention
    retention_date DATE, -- Date after which can be deleted

    -- Audit
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_documents_type ON documents(tenant_id, document_type);
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_load ON documents(load_id);
CREATE INDEX idx_documents_carrier ON documents(carrier_id);
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_ocr ON documents USING GIN(to_tsvector('english', ocr_text));

-- Document Templates
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Template details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL,
    -- RATE_CONFIRM, BOL, INVOICE, CARRIER_PACKET, QUOTE, STATEMENT

    -- Template content
    template_format VARCHAR(50) NOT NULL, -- HTML, PDF, DOCX
    template_content TEXT, -- HTML/Handlebars template
    template_file_path VARCHAR(500), -- For file-based templates

    -- Settings
    paper_size VARCHAR(20) DEFAULT 'LETTER', -- LETTER, A4, LEGAL
    orientation VARCHAR(20) DEFAULT 'PORTRAIT', -- PORTRAIT, LANDSCAPE
    margins JSONB DEFAULT '{"top": 1, "bottom": 1, "left": 1, "right": 1}',

    -- Branding
    include_logo BOOLEAN DEFAULT true,
    logo_position VARCHAR(20) DEFAULT 'TOP_LEFT',
    header_content TEXT,
    footer_content TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_default BOOLEAN DEFAULT false,

    -- Language
    language VARCHAR(10) DEFAULT 'en', -- en, es for bilingual

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, name, template_type)
);

CREATE INDEX idx_doc_templates_tenant ON document_templates(tenant_id);
CREATE INDEX idx_doc_templates_type ON document_templates(tenant_id, template_type);

-- Generated Documents
CREATE TABLE generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Generation details
    template_id UUID NOT NULL REFERENCES document_templates(id),
    document_id UUID REFERENCES documents(id), -- Result

    -- Source data
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,

    -- Generation data
    data_snapshot JSONB NOT NULL, -- Data used for generation

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, GENERATING, COMPLETED, FAILED
    error_message TEXT,

    -- Timing
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    requested_by UUID REFERENCES users(id)
);

CREATE INDEX idx_gen_docs_tenant ON generated_documents(tenant_id);
CREATE INDEX idx_gen_docs_entity ON generated_documents(entity_type, entity_id);
CREATE INDEX idx_gen_docs_status ON generated_documents(status);

-- Document Shares
CREATE TABLE document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id),

    -- Share type
    share_type VARCHAR(50) NOT NULL, -- LINK, EMAIL, PORTAL

    -- Access
    access_token VARCHAR(100) UNIQUE NOT NULL,
    access_password VARCHAR(255), -- Optional password (hashed)

    -- Restrictions
    expires_at TIMESTAMP WITH TIME ZONE,
    max_views INTEGER,
    max_downloads INTEGER,
    allow_download BOOLEAN DEFAULT true,

    -- Tracking
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,

    -- Recipient (for email shares)
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, REVOKED

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_doc_shares_document ON document_shares(document_id);
CREATE INDEX idx_doc_shares_token ON document_shares(access_token);

-- Document Folders
CREATE TABLE document_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Hierarchy
    parent_folder_id UUID REFERENCES document_folders(id),
    path VARCHAR(1000), -- /root/subfolder/...

    -- Association
    entity_type VARCHAR(50),
    entity_id UUID,

    -- Settings
    is_system BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, parent_folder_id, name)
);

CREATE INDEX idx_doc_folders_tenant ON document_folders(tenant_id);
CREATE INDEX idx_doc_folders_parent ON document_folders(parent_folder_id);
CREATE INDEX idx_doc_folders_entity ON document_folders(entity_type, entity_id);

-- Folder-Document Association
CREATE TABLE folder_documents (
    folder_id UUID NOT NULL REFERENCES document_folders(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES users(id),

    PRIMARY KEY (folder_id, document_id)
);
```

## API Endpoints

### Documents

| Method | Endpoint                         | Description        |
| ------ | -------------------------------- | ------------------ |
| GET    | `/api/v1/documents`              | List documents     |
| POST   | `/api/v1/documents`              | Upload document    |
| GET    | `/api/v1/documents/:id`          | Get document       |
| PUT    | `/api/v1/documents/:id`          | Update metadata    |
| DELETE | `/api/v1/documents/:id`          | Delete document    |
| GET    | `/api/v1/documents/:id/download` | Download file      |
| GET    | `/api/v1/documents/:id/preview`  | Get preview URL    |
| POST   | `/api/v1/documents/:id/version`  | Upload new version |
| GET    | `/api/v1/documents/:id/versions` | List versions      |
| POST   | `/api/v1/documents/bulk`         | Bulk upload        |
| GET    | `/api/v1/documents/search`       | Search documents   |

### Entity Documents

| Method | Endpoint                          | Description       |
| ------ | --------------------------------- | ----------------- |
| GET    | `/api/v1/loads/:id/documents`     | Load documents    |
| POST   | `/api/v1/loads/:id/documents`     | Upload to load    |
| GET    | `/api/v1/carriers/:id/documents`  | Carrier documents |
| POST   | `/api/v1/carriers/:id/documents`  | Upload to carrier |
| GET    | `/api/v1/companies/:id/documents` | Company documents |

### Templates

| Method | Endpoint                                  | Description       |
| ------ | ----------------------------------------- | ----------------- |
| GET    | `/api/v1/documents/templates`             | List templates    |
| POST   | `/api/v1/documents/templates`             | Create template   |
| GET    | `/api/v1/documents/templates/:id`         | Get template      |
| PUT    | `/api/v1/documents/templates/:id`         | Update template   |
| DELETE | `/api/v1/documents/templates/:id`         | Delete template   |
| POST   | `/api/v1/documents/templates/:id/preview` | Preview with data |

### Generation

| Method | Endpoint                                | Description           |
| ------ | --------------------------------------- | --------------------- |
| POST   | `/api/v1/documents/generate`            | Generate document     |
| POST   | `/api/v1/documents/generate/batch`      | Batch generate        |
| GET    | `/api/v1/documents/generate/:id/status` | Generation status     |
| POST   | `/api/v1/loads/:id/rate-confirm`        | Generate rate confirm |
| POST   | `/api/v1/loads/:id/bol`                 | Generate BOL          |
| POST   | `/api/v1/invoices/:id/pdf`              | Generate invoice PDF  |

### Sharing

| Method | Endpoint                          | Description       |
| ------ | --------------------------------- | ----------------- |
| POST   | `/api/v1/documents/:id/share`     | Create share link |
| GET    | `/api/v1/documents/shared/:token` | Access shared doc |
| DELETE | `/api/v1/documents/shares/:id`    | Revoke share      |
| GET    | `/api/v1/documents/:id/shares`    | List shares       |

### Folders

| Method | Endpoint                                      | Description     |
| ------ | --------------------------------------------- | --------------- |
| GET    | `/api/v1/documents/folders`                   | List folders    |
| POST   | `/api/v1/documents/folders`                   | Create folder   |
| PUT    | `/api/v1/documents/folders/:id`               | Update folder   |
| DELETE | `/api/v1/documents/folders/:id`               | Delete folder   |
| POST   | `/api/v1/documents/folders/:id/add`           | Add document    |
| DELETE | `/api/v1/documents/folders/:id/remove/:docId` | Remove document |

## Events

### Published Events

| Event                | Trigger           | Payload         |
| -------------------- | ----------------- | --------------- |
| `document.uploaded`  | New upload        | Document data   |
| `document.updated`   | Metadata change   | Changes         |
| `document.deleted`   | Document removed  | Document ID     |
| `document.generated` | PDF generated     | Document data   |
| `document.shared`    | Share created     | Share details   |
| `document.accessed`  | Shared doc viewed | Access log      |
| `pod.uploaded`       | POD document      | Load + document |
| `bol.generated`      | BOL created       | Load + document |

### Subscribed Events

| Event             | Source        | Action                |
| ----------------- | ------------- | --------------------- |
| `load.created`    | TMS Core      | Create load folder    |
| `carrier.created` | Carrier       | Create carrier folder |
| `email.received`  | Communication | Extract attachments   |

## Business Rules

### Upload Rules

1. Maximum file size: 25MB
2. Allowed types: PDF, JPG, PNG, TIFF, DOC, DOCX, XLS, XLSX
3. Virus scan required before storage
4. Generate thumbnail for images/PDFs
5. Auto-detect document type when possible

### Document Types by Entity

| Entity  | Required Documents                  |
| ------- | ----------------------------------- |
| Load    | BOL, POD, Rate Confirm              |
| Carrier | W9, Insurance, Agreement, Authority |
| Company | Contract, Credit App                |

### Retention Policies

| Document Type     | Retention            |
| ----------------- | -------------------- |
| POD               | 7 years              |
| Invoice           | 7 years              |
| Rate Confirm      | 5 years              |
| Insurance         | 3 years after expiry |
| Carrier Agreement | 5 years              |

### OCR Processing

1. Auto-queue images/scanned PDFs
2. Extract text within 5 minutes
3. Index for full-text search
4. Detect document type from content

### Template Variables

```handlebars
{{! Rate Confirmation Template }}
<div class='rate-confirm'>
  <h1>Rate Confirmation</h1>
  <p>Load Number: {{load.load_number}}</p>
  <p>Carrier: {{carrier.name}}</p>

  <h2>Route</h2>
  {{#each stops}}
    <p>{{stop_type}}: {{city}}, {{state}}</p>
  {{/each}}

  <h2>Rate</h2>
  <p>Total: ${{rate.total}}</p>

  {{#if language.es}}
    <p class='spanish'>Tarifa Total: ${{rate.total}}</p>
  {{/if}}
</div>
```

## Screens

| Screen            | Description       | Features                  |
| ----------------- | ----------------- | ------------------------- |
| Document Library  | Browse all docs   | Filters, search, folders  |
| Document Viewer   | View/preview      | Zoom, download, share     |
| Document Upload   | Multi-file upload | Drag-drop, type selection |
| Template Manager  | Manage templates  | Editor, preview           |
| Template Editor   | Edit templates    | WYSIWYG, variables        |
| Load Documents    | Load doc list     | Upload, generate          |
| Carrier Documents | Carrier doc list  | Compliance status         |
| Share Manager     | Manage shares     | Links, analytics          |

## Storage Configuration

### S3 Structure

```
bucket/
â”œâ”€â”€ {tenant_id}/
â”‚   â”œâ”€â”€ loads/
â”‚   â”‚   â””â”€â”€ {load_id}/
â”‚   â”‚       â”œâ”€â”€ bol/
â”‚   â”‚       â”œâ”€â”€ pod/
â”‚   â”‚       â””â”€â”€ rate-confirm/
â”‚   â”œâ”€â”€ carriers/
â”‚   â”‚   â””â”€â”€ {carrier_id}/
â”‚   â”‚       â”œâ”€â”€ insurance/
â”‚   â”‚       â”œâ”€â”€ w9/
â”‚   â”‚       â””â”€â”€ agreement/
â”‚   â”œâ”€â”€ companies/
â”‚   â”‚   â””â”€â”€ {company_id}/
â”‚   â””â”€â”€ templates/
```

### Environment Variables

```bash
# Storage
STORAGE_PROVIDER=S3  # S3, MINIO, LOCAL
AWS_S3_BUCKET=3pl-documents
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Processing
MAX_UPLOAD_SIZE_MB=25
OCR_ENABLED=true
OCR_PROVIDER=TEXTRACT  # TEXTRACT, TESSERACT
VIRUS_SCAN_ENABLED=true

# Generation
PDF_GENERATOR=PUPPETEER  # PUPPETEER, WKHTMLTOPDF
```

## Testing Checklist

### Unit Tests

- [ ] Upload validation
- [ ] File type detection
- [ ] Template rendering
- [ ] Share token generation
- [ ] Folder operations

### Integration Tests

- [ ] S3 upload/download
- [ ] OCR processing
- [ ] PDF generation
- [ ] Email attachment extraction
- [ ] Event publishing

### E2E Tests

- [ ] Full upload flow
- [ ] Document search
- [ ] Share link access
- [ ] Template generation
- [ ] Bulk operations

---

**Navigation:** [â† Claims](../09-claims/README.md) | [Services Index](../README.md) | [Communication â†’](../11-communication/README.md)
