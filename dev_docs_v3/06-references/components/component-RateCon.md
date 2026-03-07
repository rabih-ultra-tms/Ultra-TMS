# RateConPreview

**File:** `apps/web/components/tms/documents/rate-con-preview.tsx`
**LOC:** 86

## Props Interface

```typescript
interface RateConPreviewProps {
  /** Blob URL of the generated PDF */
  pdfUrl: string | null;
  /** Whether the PDF is currently being generated */
  isLoading: boolean;
  /** Error message if generation failed */
  error?: Error | null;
  /** Additional class names */
  className?: string;
}
```

## Behavior

PDF preview component for rate confirmations. Three states:

### Loading

Centered `Loader2` spinner with "Generating rate confirmation..." text. Min height 600px.

### Error

Red-themed error display with FileText icon, error title, and error message. Uses `border-danger/30` and `bg-danger-bg`.

### Empty (no URL)

Centered FileText icon with instruction text: 'Click "Generate PDF" to create the rate confirmation'. Min height 600px.

### Preview

Full-width `<iframe>` rendering the PDF blob URL. Min height 700px. White background with border and rounded corners.

## Used By

- Load detail document tab
- Rate confirmation management pages

## Dependencies

- `@/components/ui/` (none -- pure Tailwind)
- Lucide icons (FileText, Loader2)
- Expects a blob URL from PDF generation (typically via `LoadPlanPDFRenderer` or backend API)

## Accessibility

- `<iframe>` has `title="Rate Confirmation Preview"` for screen readers
- Loading and error states provide text descriptions

## Known Issues

None. Simple, focused component.
