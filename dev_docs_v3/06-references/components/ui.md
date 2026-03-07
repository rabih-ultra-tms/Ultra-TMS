# UI Components (shadcn/ui)

**Path:** `apps/web/components/ui/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| AddressAutocomplete | `address-autocomplete.tsx` | 269 | Google Places address autocomplete with structured output |
| AlertDialog | `alert-dialog.tsx` | 102 | Modal confirmation dialog (Radix) |
| Alert | `alert.tsx` | 59 | Inline alert banner |
| Avatar | `avatar.tsx` | 37 | User avatar with image/fallback |
| Badge | `badge.tsx` | 39 | Small status/label badge |
| Breadcrumb | `breadcrumb.tsx` | 115 | Breadcrumb navigation |
| Button | `button.tsx` | 55 | Button with variants (default, destructive, outline, secondary, ghost, link) |
| Calendar | `calendar.tsx` | 49 | Date picker calendar (react-day-picker) |
| Card | `card.tsx` | 56 | Content card container (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter) |
| Checkbox | `checkbox.tsx` | 26 | Checkbox input (Radix) |
| Collapsible | `collapsible.tsx` | 11 | Collapsible content section (Radix) |
| Combobox | `combobox.tsx` | 107 | Searchable select with autocomplete |
| Command | `command.tsx` | 127 | Command palette / command menu (cmdk) |
| DatePicker | `date-picker.tsx` | 69 | Single date picker with popover calendar |
| Dialog | `dialog.tsx` | 86 | Modal dialog (Radix) |
| DropdownMenu | `dropdown-menu.tsx` | 179 | Dropdown menu (Radix) |
| Form | `form.tsx` | 126 | Form primitives for React Hook Form (FormField, FormItem, FormLabel, FormControl, FormMessage) |
| Input | `input.tsx` | 33 | Text input |
| Label | `label.tsx` | 19 | Form label |
| PageHeader | `PageHeader.tsx` | 42 | Simple page header (older version, see tms/layout/page-header for v5) |
| PageHeader (test) | `PageHeader.test.tsx` | 17 | Unit tests for PageHeader |
| Pagination | `pagination.tsx` | 83 | Pagination controls |
| Popover | `popover.tsx` | 27 | Popover container (Radix) |
| Progress | `progress.tsx` | 24 | Progress bar |
| ScrollArea | `scroll-area.tsx` | 39 | Scrollable area with custom scrollbar (Radix) |
| SearchableSelect | `searchable-select.tsx` | 255 | Advanced searchable select with async loading |
| Select | `select.tsx` | 118 | Native-style select (Radix) |
| Separator | `separator.tsx` | 22 | Horizontal/vertical separator line |
| Sheet | `sheet.tsx` | 103 | Slide-out side panel (Radix) |
| Skeleton | `skeleton.tsx` | 8 | Loading skeleton placeholder |
| Sonner | `sonner.tsx` | 5 | Toast notification provider (sonner) |
| Switch | `switch.tsx` | 26 | Toggle switch (Radix) |
| Table | `table.tsx` | 94 | HTML table primitives (Table, TableHeader, TableBody, TableRow, TableHead, TableCell) |
| Tabs | `tabs.tsx` | 52 | Tab navigation (Radix) |
| Textarea | `textarea.tsx` | 22 | Multi-line text input |
| Toast | `toast.tsx` | 93 | Toast notification components |
| Tooltip | `tooltip.tsx` | 25 | Hover tooltip (Radix) |

**Total:** 37 files (~35 components + 1 test + 1 provider), ~2,667 LOC

## Architecture

These are **shadcn/ui components** -- copy-pasted from the shadcn/ui registry and customized for this project. They wrap Radix UI primitives with Tailwind styling using `class-variance-authority` (CVA) for variants.

Key custom components (not from shadcn registry):
- `AddressAutocomplete` (269 LOC) - Google Places integration with structured address parsing
- `SearchableSelect` (255 LOC) - Async searchable select for large datasets
- `Combobox` (107 LOC) - Lightweight searchable select

## Usage Patterns

Used by every component in the app. These are the foundation layer.

## Dependencies

- `@radix-ui/*` (Dialog, Popover, Select, Tabs, etc.)
- `class-variance-authority` (variant management)
- `cmdk` (Command component)
- `react-day-picker` (Calendar)
- `sonner` (Toast notifications)
- `@/lib/utils` (cn utility for class merging)
- `@react-google-maps/api` (AddressAutocomplete)
