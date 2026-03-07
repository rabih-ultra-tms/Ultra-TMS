# Shared Components

**Path:** `apps/web/components/shared/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| ConfirmDialog | `confirm-dialog.tsx` | 110 | Accessible confirmation dialog with default/destructive/warning variants |
| DataTableSkeleton | `data-table-skeleton.tsx` | 36 | Loading skeleton for data tables |
| DateRangePicker | `date-range-picker.tsx` | 165 | Date range picker with presets (Today, Last 7 days, etc.) |
| DetailPageSkeleton | `detail-page-skeleton.tsx` | 73 | Loading skeleton for detail pages |
| DocumentUpload | `document-upload.tsx` | 307 | Full file upload component with drag-drop, type selection, preview, validation |
| EmptyState | `empty-state.tsx` | 23 | Empty state placeholder with icon, title, description, action |
| ErrorState | `error-state.tsx` | 41 | Error state with icon, message, retry button |
| ErrorState (test) | `error-state.test.tsx` | 20 | Unit tests for ErrorState |
| FormPageSkeleton | `form-page-skeleton.tsx` | 74 | Loading skeleton for form pages |
| ListPageSkeleton | `list-page-skeleton.tsx` | 72 | Loading skeleton for list pages |
| LoadingState | `loading-state.tsx` | 14 | Loading spinner with message |
| UnifiedStatusBadge | `status-badge.tsx` | 209 | Entity-aware status badge mapping entity+status to design tokens |
| index | `index.ts` | 7 | Barrel exports |

**Total:** 13 files, ~1,151 LOC

## Key Components

### ConfirmDialog

Replaces all `window.confirm()` calls. Three variants:
- `default` - Blue confirm button
- `destructive` - Red confirm button for delete actions
- `warning` - Amber confirm button for risky but reversible actions

Supports `isLoading` state with spinner and disabled buttons during async operations.

### UnifiedStatusBadge

Entity-aware badge that maps `entity + status` pairs to the correct colors from the design token system. Supports 14 entity types: user, customer, lead, order, load, carrier, document, insurance, quote, invoice, payment, payable, settlement, priority.

### DocumentUpload

Full upload component with: drag-and-drop zone, file type validation (PDF, JPG, PNG, TIFF), 25MB limit, document type selector (POD, BOL, Rate Confirm, Invoice, Insurance, Other), upload progress bar, preview.

## Usage Patterns

These are used everywhere across the app:
- `ConfirmDialog` - All delete/destructive actions
- `EmptyState` / `ErrorState` / `LoadingState` - All async data display pages
- Skeleton components - All pages with async data loading
- `UnifiedStatusBadge` - All entity status displays
- `DocumentUpload` - Carrier docs, load docs, order docs
- `DateRangePicker` - All filter bars with date ranges

## Dependencies

- `@/components/ui/` (AlertDialog, Button, Badge, Calendar, Popover, Select, Progress)
- `@/components/tms/primitives/status-badge` (UnifiedStatusBadge wraps this)
- `@/lib/design-tokens` (status color mappings for all entities)
- `@/lib/hooks/documents/` (DocumentUpload)
- Lucide React icons
