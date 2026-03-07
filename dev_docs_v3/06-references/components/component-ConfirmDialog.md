# ConfirmDialog

**File:** `apps/web/components/shared/confirm-dialog.tsx`
**LOC:** 110

## Props Interface

```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;        // Default: "Confirm"
  cancelLabel?: string;         // Default: "Cancel"
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  /** @deprecated Use variant="destructive" instead */
  destructive?: boolean;
  variant?: "default" | "destructive" | "warning";
}
```

## Behavior

- **default**: Blue confirm button (standard actions)
- **destructive**: Red confirm button (delete, remove, revoke)
- **warning**: Amber confirm button (`bg-amber-500`, risky but reversible)
- Loading state: disables both buttons, shows `Loader2` spinner on confirm
- Prevents closing during loading (`onOpenChange` checks `isLoading`)
- Backwards compatible: `destructive` boolean prop maps to `variant="destructive"`
- Variant resolution: explicit `variant` wins over legacy `destructive` prop

### Internal Variant Resolution

```typescript
const resolvedVariant: ConfirmVariant =
  variant ?? (destructive ? "destructive" : "default");
```

## Used By

- All delete actions across the app
- `FormPage` pattern (dirty state confirmation before leaving)
- Carrier management (delete driver, delete truck, remove document)
- Order/load status changes
- Admin actions (deactivate user, remove role)

## Accessibility

Built on Radix `AlertDialog`:
- Focus trap within dialog
- ESC to close (when not loading)
- Focus returns to trigger on close
- `AlertDialogTitle` + `AlertDialogDescription` for screen readers
- Cancel and Confirm buttons use shadcn `Button` with proper ARIA

## Known Issues

None. This component was specifically created to replace all `window.confirm()` calls (7 instances identified in the codebase audit).
