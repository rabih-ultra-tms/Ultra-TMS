# SlidePanel

**File:** `apps/web/components/tms/panels/slide-panel.tsx`
**LOC:** 179

## Props Interface

```typescript
interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  badge?: React.ReactNode;
  headerActions?: React.ReactNode;
  resizable?: boolean;          // Default: true
  defaultWidth?: number;        // Default: 420px
  minWidth?: number;            // Default: 380px
  maxWidth?: number;            // Default: 560px
  children: React.ReactNode;
  className?: string;
}
```

## Behavior

Full-height slide-in drawer from the right edge of the viewport.

### Animation

- Slide: `translateX(100%)` -> `translateX(0)` on open
- Timing: `cubic-bezier(0.4, 0, 0.2, 1)`, 300ms duration
- Backdrop: `bg-black/30`, click to close

### Resize

When `resizable=true` (default), a 4px drag handle on the left edge allows resizing:
- Drag handle: invisible by default, shows sapphire on hover/active
- Cursor changes to `col-resize` during drag
- Width constrained between `minWidth` and `maxWidth`
- Width resets to `defaultWidth` on each open

### Keyboard

- **Escape** key closes the panel (event listener added when open)

### Header

Rendered when any of `title`, `badge`, or `headerActions` is provided:
- Title: 15px/700 bold
- Badge: rendered next to title
- Actions: right-aligned before close button
- Close button: 28px, X icon, hover background

## Used By

- Dispatch board (load detail drawer wraps this)
- Load detail pages (side panels)
- Various detail views that need inline editing

## Accessibility

- `role="dialog"`, `aria-modal="true"`
- Close button: `aria-label="Close panel"`
- Backdrop: `aria-hidden="true"`
- Escape key handler

## Known Issues

None. Well-structured panel matching v5 design spec.
