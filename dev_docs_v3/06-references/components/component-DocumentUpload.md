# DocumentUpload

**File:** `apps/web/components/shared/document-upload.tsx`
**LOC:** 307

## Props Interface

```typescript
interface DocumentUploadProps {
  onUpload: (file: File, documentType: DocumentType, name: string) => Promise<void>;
  isUploading?: boolean;
}
```

## Behavior

Full file upload component with comprehensive validation and UX:

### File Validation

- **Accepted types**: PDF, JPEG, PNG, TIFF
- **Max size**: 25MB
- **Extensions**: `.pdf, .jpg, .jpeg, .png, .tiff, .tif`

### Document Type Selection

```typescript
const UNIQUE_DOC_TYPES = [
  { value: "POD", label: "Proof of Delivery (POD)" },
  { value: "BOL", label: "Bill of Lading (BOL)" },
  { value: "RATE_CONFIRM", label: "Rate Confirmation" },
  { value: "INVOICE", label: "Invoice" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "OTHER", label: "Other" },
];
```

### Upload Flow

1. User drops file or clicks to browse
2. File is validated (type + size)
3. Preview shows (image preview or file icon)
4. User selects document type from dropdown
5. Click upload triggers `onUpload` callback
6. Progress bar shows during upload

### States

- **Idle**: Dashed border drop zone with Upload icon
- **Dragging**: Visual highlight on the drop zone
- **File selected**: Preview + type selector + upload button
- **Uploading**: Progress bar + disabled controls
- **Error**: Error message display with validation details

## Used By

- Carrier documents (`carrier-documents-manager.tsx`)
- Load documents (`load-documents-tab.tsx`)
- Order documents (`order-documents-tab.tsx`)

## Dependencies

- `@/components/ui/` (Button, Select, Progress)
- `@/lib/hooks/documents/use-documents` (DocumentType type)
- Lucide icons (Upload, FileText, ImageIcon, X)

## Accessibility

- File input is hidden; click handler on the drop zone triggers it
- Error messages are displayed inline
- Progress bar provides visual upload feedback

## Known Issues

None. Robust implementation with proper validation.
