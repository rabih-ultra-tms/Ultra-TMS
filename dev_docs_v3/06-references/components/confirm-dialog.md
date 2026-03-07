# ConfirmDialog

**File:** `apps/web/components/shared/confirm-dialog.tsx`
**Lines:** 110
**Exports:** `ConfirmDialog`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| open | `boolean` | Yes | - | Controls dialog visibility |
| title | `string` | Yes | - | Dialog title |
| description | `string` | No | - | Optional description text |
| confirmLabel | `string` | No | `"Confirm"` | Confirm button text |
| cancelLabel | `string` | No | `"Cancel"` | Cancel button text |
| onConfirm | `() => Promise<void> \| void` | Yes | - | Called when confirm is clicked (supports async) |
| onCancel | `() => void` | Yes | - | Called when cancel is clicked or dialog dismissed |
| isLoading | `boolean` | No | `false` | Shows spinner and disables buttons during async |
| destructive | `boolean` | No | `false` | **Deprecated.** Use `variant="destructive"` |
| variant | `"default" \| "destructive" \| "warning"` | No | - | Dialog variant controlling confirm button color |

## Variants

| Variant | Button Style | Use Case |
|---------|-------------|----------|
| `default` | Blue (primary) | Standard confirmations |
| `destructive` | Red (destructive) | Delete actions, irreversible operations |
| `warning` | Amber (`bg-amber-500`) | Risky but reversible actions |

## Usage Example

```tsx
import { ConfirmDialog } from "@/components/shared";

<ConfirmDialog
  open={showDelete}
  title="Delete carrier?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  variant="destructive"
  onConfirm={async () => {
    await deleteCarrier(id);
    setShowDelete(false);
  }}
  onCancel={() => setShowDelete(false)}
  isLoading={isDeleting}
/>
```

## Used By (24 files)

- `carriers/page.tsx`, `carriers/[id]/page.tsx`, `carrier-actions-menu.tsx`
- `truck-types/page.tsx`
- `load-history/page.tsx`, `quote-history/page.tsx`
- `leads/[id]/page.tsx`, `contacts/[id]/page.tsx`
- `commissions/plans/[id]/page.tsx`
- `quotes/page.tsx`
- `load-board/postings/[id]/page.tsx`
- `components/patterns/form-page.tsx` (generic form pattern)
- `components/tms/orders/order-form.tsx`
- `components/tms/loads/loads-data-table.tsx`, `load-documents-tab.tsx`
- `components/sales/quotes/quote-form-v2.tsx`, `quote-actions-bar.tsx`
- `components/carriers/carrier-trucks-manager.tsx`, `carrier-drivers-manager.tsx`, `carrier-documents-manager.tsx`
- `components/load-board/bids-list.tsx`
- `components/crm/leads/leads-pipeline.tsx`, `leads-table.tsx`
- `components/crm/contacts/contacts-table.tsx`

## Implementation Notes

- Wraps Radix UI `AlertDialog` from shadcn/ui
- Backwards compatible: old `destructive` boolean prop still works (mapped to variant internally)
- Variant resolution: explicit `variant` prop wins, then legacy `destructive` boolean, then defaults to `"default"`
- Loading state: shows `Loader2` spinner with `animate-spin` class, disables both buttons
- Closing: `onOpenChange` handler prevents closing while `isLoading` is true
- Warning button uses custom Tailwind class string (not a shadcn Button variant)

## Quality Assessment

**Rating: 9/10**
- TypeScript: Clean interface with proper optional types
- Accessibility: Built on Radix AlertDialog (proper focus trap, screen reader support)
- Error handling: Prevents close during async operations
- Backwards compatibility: Deprecated prop handled gracefully
- Design system: Uses semantic button variants, proper loading UX
