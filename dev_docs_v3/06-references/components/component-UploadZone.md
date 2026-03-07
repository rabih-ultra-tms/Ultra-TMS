# UploadZone

**File:** `apps/web/components/tms/documents/upload-zone.tsx`
**LOC:** 106

## Props Interface

```typescript
interface UploadZoneProps {
  variant?: "full" | "inline";
  text?: string;
  onClick?: () => void;
  onDrop?: (files: FileList) => void;
  className?: string;
}
```

## Behavior

Dashed-border drop zone for file uploads. Two variants:

### Full Variant (default)
- 36px Upload icon, 24px padding, 8px radius, mt-16px
- Default text: "Drop files here or click to upload"

### Inline Variant
- 24px Upload icon, 12px padding, 6px radius, 6px margin
- Default text: "Drop file or click"

### Drag-and-Drop

- `dragOver` state tracked via `onDragOver` / `onDragLeave` / `onDrop`
- Hover and drag-over: sapphire border, sapphire-light background, sapphire icon + text
- Drop handler: passes `FileList` to `onDrop` callback

## Used By

- Document management sections
- Carrier document uploads
- Load document uploads
- Order document uploads

## Accessibility

- `role="button"`, `tabIndex={0}` for keyboard access
- `aria-label` from `text` prop or default text
- Visual hover/focus indicators

## Known Issues

None.
