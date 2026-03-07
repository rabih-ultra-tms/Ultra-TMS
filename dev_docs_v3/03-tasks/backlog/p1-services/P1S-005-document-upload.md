# P1S-005: Document Upload and Categorization

**Priority:** P1
**Service:** Documents
**Scope:** Document upload flow with automatic categorization and metadata extraction

## Current State
Carrier documents can be created via API but no file upload UI exists. The `useCreateCarrierDocument` hook sends metadata only (type, name, description, expiry date).

## Requirements
- Drag-and-drop file upload zone
- File type validation (PDF, images, Word docs)
- File size limits (configurable per document type)
- Automatic categorization based on file name patterns
- Metadata form (document type, expiry date, notes)
- Progress indicator during upload
- Multi-file upload support

## Acceptance Criteria
- [ ] Drag-and-drop upload works
- [ ] File type and size validation
- [ ] Upload progress indicator
- [ ] Metadata form with document type selection
- [ ] Multi-file upload
- [ ] Uploaded documents appear in document list
- [ ] Error handling for failed uploads

## Dependencies
- File storage backend (S3 or equivalent)

## Estimated Effort
M
