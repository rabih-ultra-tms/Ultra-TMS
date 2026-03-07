# TMS Documents Components

**Location:** `apps/web/components/tms/documents/`
**Component count:** 6 (5 components + 1 barrel)

## Components

### DocumentActions
- **File:** `document-actions.tsx`
- **Props:** Document ID, actions (download, preview, delete, share)
- **Used by:** Document list rows
- **Description:** Action menu/buttons for individual documents. Supports download, preview in new tab, delete with confirmation, and share link generation.

### DocumentList
- **File:** `document-list.tsx`
- **Props:** Documents array, entity type, entity ID
- **Used by:** Load documents tab, carrier documents tab, order documents tab
- **Description:** Tabular list of documents with columns for name, type, uploaded date, size, and actions. Supports filtering by document type.

### PermitList
- **File:** `permit-list.tsx`
- **Props:** Permits array
- **Used by:** Carrier detail pages
- **Description:** Specialized list for carrier permits and certifications. Shows permit type, number, issuing authority, expiration date, and status.

### RateConPreview
- **File:** `rate-con-preview.tsx`
- **Props:** Rate confirmation data
- **Used by:** Load detail, quote detail
- **Description:** Preview component for rate confirmation documents. Shows formatted rate con details before generating/sending the document.

### UploadZone
- **File:** `upload-zone.tsx`
- **Props:** Entity type, entity ID, onUpload callback
- **Used by:** Document tabs across entities
- **Description:** TMS-specific upload zone component. Wraps or extends the shared DocumentUpload with entity-aware document type defaults and categorization.

### index.ts
- **File:** `index.ts`
- **Description:** Barrel exports for all document components
