# DocumentUpload (File Upload)

**File:** `apps/web/components/shared/document-upload.tsx`
**Lines:** 307
**Exports:** `DocumentUpload`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onUpload | `(file: File, documentType: DocumentType, name: string) => Promise<void>` | Yes | - | Upload handler called with file, selected type, and filename |
| isUploading | `boolean` | No | - | External uploading state to disable controls |

## Document Types

| Value | Label |
|-------|-------|
| `POD` | Proof of Delivery (POD) |
| `BOL` | Bill of Lading (BOL) |
| `RATE_CONFIRM` | Rate Confirmation |
| `INVOICE` | Invoice |
| `INSURANCE` | Insurance |
| `OTHER` | Other |

## File Validation

- **Accepted types:** PDF, JPEG, PNG, TIFF
- **Extensions:** `.pdf, .jpg, .jpeg, .png, .tiff, .tif`
- **Max size:** 25MB
- Validates both MIME type and file extension as fallback

## Component States

### 1. Dropzone (initial)
- Dashed border container with Upload icon
- Drag-and-drop support with visual feedback (border color + background change)
- Click-to-browse via hidden file input
- Shows accepted file type icons (PDF, JPG/PNG, TIFF)
- "Max 25MB" text

### 2. File Review (after selection)
- Image preview (for image files) or FileText icon (for PDFs)
- Filename and file size display
- Document type selector (dropdown with 6 types, defaults to POD)
- Upload button with Upload icon
- Cancel button to return to dropzone
- X button to dismiss

### 3. Uploading
- Progress bar with simulated progress (increments by 15% every 200ms up to 85%)
- Jumps to 100% on completion
- All controls disabled during upload
- Brief 500ms success display before resetting

## Usage Example

```tsx
import { DocumentUpload } from "@/components/shared";

<DocumentUpload
  onUpload={async (file, docType, name) => {
    await uploadDocument({ file, type: docType, name, loadId });
  }}
  isUploading={mutation.isPending}
/>
```

## Used By

- `components/tms/loads/load-documents-tab.tsx` -- Load document management

## Implementation Notes

- Uses `useState` for all local state (no form library)
- Image previews created with `URL.createObjectURL()` and properly cleaned up with `URL.revokeObjectURL()`
- File input ref used for programmatic click (hidden input pattern)
- Error display below dropzone or below preview section
- Progress is simulated, not real upload progress (no XMLHttpRequest progress events)
- `handleFiles` only processes the first file (single file upload)

## Dependencies

- `@/components/ui/button`
- `@/components/ui/select` (SelectTrigger, SelectContent, SelectItem)
- `@/components/ui/progress` (upload progress bar)
- `@/lib/utils` (cn utility)
- `@/lib/hooks/documents/use-documents` (DocumentType type)
- `lucide-react` (Upload, FileText, ImageIcon, X)

## Quality Assessment

**Rating: 7/10**
- TypeScript: Clean interface, proper typing for DocumentType
- UX: Good drag-and-drop with visual feedback, proper loading states
- Error handling: Validation errors shown, upload errors caught and displayed
- Memory: Properly revokes object URLs to prevent leaks
- Weaknesses: Simulated progress (not real), single file only, no retry mechanism
- Accessibility: Hidden input pattern works but dropzone could use more ARIA attributes
