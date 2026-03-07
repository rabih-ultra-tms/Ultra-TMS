# Toast / Sonner

**Files:**
- `apps/web/components/ui/sonner.tsx` (5 LOC) -- Provider
- `apps/web/components/ui/toast.tsx` (93 LOC) -- Custom toast components

## Usage

```typescript
import { toast } from "sonner";

toast.success("Load created successfully");
toast.error("Failed to update status");
toast.warning("This action cannot be undone");
toast("Neutral notification");
```

## Behavior

Uses the `sonner` library for toast notifications. The `Sonner` provider is mounted in the root layout (`apps/web/app/layout.tsx`).

- Auto-dismiss after configurable duration
- Stackable (multiple toasts)
- Supports success, error, warning, info, and custom variants
- Position: typically bottom-right
- Accessible: ARIA live region for screen reader announcements

## Used By

Every component that performs async operations:
- Form submissions (create/update/delete)
- Status transitions
- File uploads
- API errors
- Clipboard copy operations

## Dependencies

- `sonner` package
- Mounted globally in root layout
