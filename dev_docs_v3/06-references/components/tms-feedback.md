# TMS Feedback Components

Components for user feedback: confirmations, alerts, loading states, and error handling.

---

## ConfirmDialog

**File:** `apps/web/components/shared/confirm-dialog.tsx`
**LOC:** 110

### Props

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

### Behavior

- Built on Radix AlertDialog for accessibility (focus trap, ESC to close, ARIA)
- Three variants:
  - `default` -- Blue confirm button
  - `destructive` -- Red confirm button (for delete actions)
  - `warning` -- Amber confirm button (for risky but reversible actions)
- `isLoading` state disables buttons and shows spinner on confirm
- Backwards compatible: `destructive` boolean prop still works
- Prevent close while loading (`onOpenChange` checks `isLoading`)

### Usage

```tsx
<ConfirmDialog
  open={showDelete}
  title="Delete Load"
  description="This action cannot be undone."
  variant="destructive"
  confirmLabel="Delete"
  onConfirm={handleDelete}
  onCancel={() => setShowDelete(false)}
  isLoading={isDeleting}
/>
```

---

## AlertBanner

**File:** `apps/web/components/tms/alerts/alert-banner.tsx`
**LOC:** 79

### Props

```typescript
interface AlertBannerProps {
  intent: "danger" | "warning" | "info" | "success";
  children: React.ReactNode;
  className?: string;
}
```

### Design Tokens

Each intent maps to:
- `danger`: AlertCircle icon, `bg-danger-bg`, `border-danger`, `text-danger`
- `warning`: AlertTriangle icon, `bg-warning-bg`, `border-warning`, `text-warning`
- `info`: Info icon, `bg-info-bg`, `border-info`, `text-info`
- `success`: CheckCircle icon, `bg-success-bg`, `border-success`, `text-success`

Layout: flex row, items-start, gap 8px. Icon: 16px, shrink-0. Text: 11px, leading 1.4.

### Accessibility

`role="alert"` for screen reader announcement.

---

## ErrorState

**File:** `apps/web/components/shared/error-state.tsx`
**LOC:** 41

### Props

```typescript
interface ErrorStateProps {
  title?: string;       // Default: "Something went wrong"
  message?: string;     // Default: "Please try again or contact support..."
  retry?: () => void;   // Shows Retry button with RefreshCw icon
  action?: React.ReactNode;
  backButton?: React.ReactNode;
}
```

Centered error display with destructive icon circle, title, message, and optional action buttons. Used as the error state in all async data pages.

---

## EmptyState

**File:** `apps/web/components/shared/empty-state.tsx`
**LOC:** 23

### Props

```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;    // e.g. "Create New" button
}
```

Centered empty display with Inbox icon, title, description, and optional CTA button. Used when API returns zero results.

---

## LoadingState

**File:** `apps/web/components/shared/loading-state.tsx`
**LOC:** 14

### Props

```typescript
interface LoadingStateProps {
  message?: string;     // Default: "Loading"
}
```

Centered spinner (Loader2 with animate-spin) and message text. Minimal implementation.

---

## Skeleton Components

**Files:**
- `apps/web/components/shared/data-table-skeleton.tsx` (36 LOC)
- `apps/web/components/shared/detail-page-skeleton.tsx` (73 LOC)
- `apps/web/components/shared/form-page-skeleton.tsx` (74 LOC)
- `apps/web/components/shared/list-page-skeleton.tsx` (72 LOC)

Shimmer loading placeholders matching the layout of their respective page patterns. Each renders realistic skeleton shapes (header bars, table rows, card outlines, form fields) using the `Skeleton` UI component.

---

## Toast (Sonner)

**File:** `apps/web/components/ui/sonner.tsx` (5 LOC) + `apps/web/components/ui/toast.tsx` (93 LOC)

Toast notifications via the `sonner` library. Used throughout the app via:

```typescript
import { toast } from "sonner";
toast.success("Load created successfully");
toast.error("Failed to update status");
```

The `Sonner` provider is mounted in the root layout. The `toast.tsx` file provides additional custom toast components for complex notifications.
