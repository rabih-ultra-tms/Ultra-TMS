# ErrorState (Error Boundary / Error Display)

**File:** `apps/web/components/shared/error-state.tsx`
**Lines:** 41
**Exports:** `ErrorState`

**Note:** There is no React Error Boundary class component in this codebase. Error handling is done via the `ErrorState` presentational component combined with React Query error states and Next.js `error.tsx` files.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | `string` | No | `"Something went wrong"` | Error title text |
| message | `string` | No | `"Please try again or contact support if the issue persists."` | Error description |
| retry | `() => void` | No | - | If provided, shows a Retry button with RefreshCw icon |
| action | `ReactNode` | No | - | Custom action element (e.g., a navigation button) |
| backButton | `ReactNode` | No | - | Custom back navigation element |

## Visual Design

- Centered flex column layout with rounded border and padding
- Destructive-colored circle (48px) with AlertCircle icon
- Title in `text-lg font-semibold`
- Message in `text-sm text-muted-foreground`
- Action buttons in a flex-wrap row

## Usage Example

```tsx
import { ErrorState } from "@/components/shared";

// Basic with retry
<ErrorState
  title="Failed to load carriers"
  message="Network error. Please check your connection."
  retry={() => refetch()}
/>

// With custom action
<ErrorState
  title="Not found"
  message="The load you're looking for doesn't exist."
  action={<Button onClick={() => router.push('/loads')}>Back to Loads</Button>}
/>
```

## Used By

Used across the application wherever async data loading can fail. Typically paired with React Query's `isError` state:

```tsx
if (isError) {
  return <ErrorState title="Failed to load data" retry={refetch} />;
}
```

## Related Components

- `LoadingState` (`components/shared/loading-state.tsx`, 14 LOC) -- Loading spinner with message
- `EmptyState` (`components/shared/empty-state.tsx`, 23 LOC) -- Empty data placeholder with icon/title/action

## Error Handling Pattern in Ultra TMS

```
Page/Component
  |-- isLoading? --> <LoadingState /> or Skeleton
  |-- isError?   --> <ErrorState retry={refetch} />
  |-- data empty? --> <EmptyState />
  |-- data exists --> Render content
```

## Dependencies

- `@/components/ui/button` (Retry button)
- `lucide-react` (AlertCircle, RefreshCw icons)

## Quality Assessment

**Rating: 8/10**
- TypeScript: Clean, simple interface with good defaults
- Accessibility: Uses `aria-hidden` on decorative icons
- Flexibility: Supports retry, custom actions, and back button simultaneously
- Composable: Works well with React Query error states
- Tested: Has companion test file `error-state.test.tsx`
- Minor: Could add role="alert" for screen reader announcement
