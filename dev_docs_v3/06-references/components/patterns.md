# Patterns Components

**Path:** `apps/web/components/patterns/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| DetailPage | `detail-page.tsx` | 203 | Standardized layout for entity detail views with tabs |
| FormPage | `form-page.tsx` | 270 | Standardized layout for create/edit forms with validation |
| ListPage | `list-page.tsx` | 241 | Standardized layout for list/table views with filtering |

**Total:** 3 files, ~714 LOC

## Architecture

These are **layout pattern components** that enforce consistent page structure across the app. Every CRUD screen should use one of these three patterns.

### ListPage

Composes: `PageHeader` + filter slot + `DataTable` + `TablePagination` + Loading/Error/Empty states.

```typescript
interface ListPageProps<TData> {
  title: string;
  description?: string;
  headerActions?: React.ReactNode;
  filters?: React.ReactNode;
  stats?: React.ReactNode;
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  error?: Error | null;
  // ... pagination, sorting, selection props
}
```

### FormPage

Composes: `PageHeader` + React Hook Form + Zod + `FormSection` cards + sticky action bar + dirty-state confirmation.

```typescript
interface FormPageProps<T extends FieldValues> {
  title: string;
  schema: ZodSchema<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: (values: T) => Promise<void>;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  isLoading?: boolean;
  isSubmitting?: boolean;
}
```

### DetailPage

Composes: back navigation + header (title, subtitle, tags, actions) + `Tabs` with tab content slots.

```typescript
interface DetailPageProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tags?: React.ReactNode;
  actions?: React.ReactNode;
  tabs: DetailTab[];
  isLoading?: boolean;
  error?: Error | null;
}
```

## Usage Patterns

These patterns are used by most CRUD pages in the app:
- `ListPage` - carriers, customers, loads, orders, users, invoices, etc.
- `FormPage` - carrier form, customer form, user form, invoice form, etc.
- `DetailPage` - carrier detail, customer detail, load detail, order detail

## Dependencies

- `@/components/tms/layout/page-header` (PageHeader)
- `@/components/tms/tables/` (DataTable, TablePagination)
- `@/components/shared/` (loading/error/empty skeletons)
- `@/components/ui/` (Card, Tabs, Button, Form)
- `@tanstack/react-table` (column defs, table instance)
- `react-hook-form` + `zod` (FormPage)
- `next/navigation` (back navigation)
