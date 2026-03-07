# BACK-014: Document Upload/Storage

**Priority:** P1
**Module:** `apps/api/src/modules/documents/`
**Endpoint(s):** `POST /documents/upload`, `GET /documents`, `GET /documents/:id`, `DELETE /documents/:id`

## Current State
Documents module exists with services (documents, document-folders, document-templates), controllers, DTOs, and guards. Frontend load detail page has a `LoadDocumentsTab` and order detail has a documents tab (currently placeholder "coming soon"). Need to verify upload and storage pipeline.

## Requirements
- File upload with multipart/form-data
- Support document types: BOL, POD, rate confirmation, insurance COI, carrier packet
- Link documents to entities (load, order, carrier, customer)
- Document folder organization
- Template system for recurring document types
- File storage (local in dev, S3/cloud in production)
- File size limits and type validation
- Thumbnail generation for images

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Files upload and download correctly
- [ ] Documents linked to correct entities

## Dependencies
- Prisma model: Document, DocumentFolder, DocumentTemplate
- Related modules: storage, tms, carrier, crm

## Estimated Effort
L
