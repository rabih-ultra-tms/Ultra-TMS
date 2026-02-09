# Visual Consistency Playbook

> Practical, copy-paste reference for developers. No theory -- just the exact classes, tokens, and patterns to use.

---

## 1. Color Palette

### Primary Colors

| Token | Hex | Tailwind Class | CSS Variable | Usage |
|-------|-----|---------------|--------------|-------|
| Primary | `#2563EB` | `text-primary` / `bg-primary` | `var(--primary)` | Buttons, links, focus rings |
| Primary Hover | `#1D4ED8` | `bg-primary/90` | -- | Button hover state |
| Primary Light | `#DBEAFE` | `bg-blue-100` | -- | Selected row background, info badges |
| Accent | `#6366F1` | `text-indigo-500` / `bg-indigo-500` | `var(--accent)` | Active/in-progress states |

### Background Colors

| Token | Hex | Tailwind Class | CSS Variable | Usage |
|-------|-----|---------------|--------------|-------|
| Page Background | `#FFFFFF` | `bg-background` | `var(--background)` | Main content area |
| Page Background Muted | `#F9FAFB` | `bg-gray-50` or `bg-muted` | `var(--muted)` | Behind cards on dashboards |
| Card Background | `#FFFFFF` | `bg-card` | `var(--card)` | Cards, panels |
| Sidebar Background | `#0F172A` | `bg-sidebar` | `var(--sidebar)` | Always dark, both modes |

### Border Colors

| Token | Hex | Tailwind Class | CSS Variable | Usage |
|-------|-----|---------------|--------------|-------|
| Default Border | `#E5E7EB` | `border-border` | `var(--border)` | Cards, inputs, dividers |
| Input Border | `#E5E7EB` | `border-input` | `var(--input)` | Form field borders |
| Focus Ring | `#2563EB` | `ring-ring` | `var(--ring)` | Keyboard focus indicator |

### Text Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| Primary Text | `#0F172A` | `text-foreground` | Headings, body text |
| Secondary Text | `#64748B` | `text-muted-foreground` | Descriptions, labels, captions |
| Placeholder Text | `#94A3B8` | `text-muted-foreground/70` | Input placeholders |
| Inverse Text | `#FFFFFF` | `text-primary-foreground` | Text on colored backgrounds |

### Semantic / Status Colors

| Semantic Role | Primary | Background | Text | Tailwind Background | Tailwind Text |
|---------------|---------|-----------|------|---------------------|---------------|
| Success | `#10B981` | `#D1FAE5` | `#065F46` | `bg-emerald-100` | `text-emerald-800` |
| Warning | `#F59E0B` | `#FEF3C7` | `#92400E` | `bg-amber-100` | `text-amber-800` |
| Danger | `#EF4444` | `#FEE2E2` | `#991B1B` | `bg-red-100` | `text-red-800` |
| Info | `#3B82F6` | `#DBEAFE` | `#1E40AF` | `bg-blue-100` | `text-blue-800` |
| Neutral | `#6B7280` | `#F3F4F6` | `#374151` | `bg-gray-100` | `text-gray-700` |
| In-Progress | `#6366F1` | `#E0E7FF` | `#3730A3` | `bg-indigo-100` | `text-indigo-800` |
| Pending | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `bg-violet-100` | `text-violet-800` |
| Special | `#06B6D4` | `#CFFAFE` | `#155E75` | `bg-cyan-100` | `text-cyan-800` |

**RULE: Never type these classes directly in page files. Use `<StatusBadge>` or import from `status-colors.ts`.**

---

## 2. Typography Scale

### The Complete Scale

| Role | Tailwind Classes | Font Size | Example Usage |
|------|-----------------|-----------|---------------|
| Page Title | `text-2xl font-semibold text-foreground` | 24px / 600 | "Carriers", "Dashboard" |
| Section Title | `text-lg font-semibold text-foreground` | 18px / 600 | "Route & Stops", "Financial Summary" |
| Card Title | `text-base font-medium text-foreground` | 16px / 500 | Card headers, stat labels |
| Body Text | `text-sm text-foreground` | 14px / 400 | Table cells, form content, paragraphs |
| Small/Caption | `text-xs text-muted-foreground` | 12px / 400 | Timestamps, helper text, secondary info |
| Table Header | `text-xs font-medium uppercase tracking-wider text-muted-foreground` | 12px / 500 | Column headers |
| ID/Reference | `text-sm font-mono` | 14px / mono | Load numbers, MC numbers, order IDs |
| KPI Value | `text-3xl font-bold text-foreground` | 30px / 700 | Stat card main number |
| KPI Trend | `text-xs font-medium` | 12px / 500 | "+12 this month" with color |

### Copy-Paste Snippets

**Page title:**
```tsx
<h1 className="text-2xl font-semibold text-foreground">Carriers</h1>
```

**Section title:**
```tsx
<h2 className="text-lg font-semibold text-foreground">Financial Summary</h2>
```

**Description text below title:**
```tsx
<p className="text-sm text-muted-foreground">Manage trucking companies and owner-operators</p>
```

**Table header cell:**
```tsx
<TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
  Status
</TableHead>
```

**Monospace IDs:**
```tsx
<span className="text-sm font-mono">FM-2025-0847</span>
```

**Timestamp / secondary info:**
```tsx
<span className="text-xs text-muted-foreground">Feb 6, 2025 at 2:30 PM</span>
```

---

## 3. Spacing System

### Page-Level Spacing

```tsx
// Page wrapper -- consistent across all pages
<div className="space-y-6">                    {/* 24px between sections */}
  <PageHeader ... />                           {/* Page header section */}
  <div className="grid grid-cols-4 gap-4">     {/* 16px between stat cards */}
    <KPICard ... />
  </div>
  <Card>                                        {/* Main content card */}
    <CardContent className="p-6">               {/* 24px card padding */}
      ...
    </CardContent>
  </Card>
</div>
```

### Spacing Quick Reference

| Context | Class | Value |
|---------|-------|-------|
| Page sections vertical gap | `space-y-6` | 24px |
| Card grid gap | `gap-4` | 16px |
| Card padding (standard) | `p-6` | 24px |
| Card padding (compact/list) | `p-4` | 16px |
| Card padding (tight) | `p-3` | 12px |
| Form fields vertical gap | `space-y-4` | 16px |
| Form groups vertical gap | `space-y-6` | 24px |
| Button icon gap | `mr-2` for icon before text | 8px |
| Badge icon gap | `mr-1` for icon in badge | 4px |
| Inline items gap | `gap-2` | 8px |
| Filter bar items gap | `gap-3` | 12px |
| Table cell padding | `px-4 py-3` | 16px x 12px |

### Do Not Use These Spacings

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `p-5` | Not on 4px grid | `p-4` or `p-6` |
| `p-7` | Not on 4px grid | `p-6` or `p-8` |
| `gap-5` | Not on 4px grid | `gap-4` or `gap-6` |
| `space-y-5` | Not on 4px grid | `space-y-4` or `space-y-6` |
| `m-1.5` | Too small, inconsistent | `m-1` or `m-2` |
| `gap-7` | Not standard | `gap-6` or `gap-8` |

---

## 4. Component Spacing Rules

### Page Header

```tsx
// CORRECT: Using PageHeader component
<PageHeader
  title="Carriers"
  description="Manage trucking companies and owner-operators"
  breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Carriers' }]}
  actions={<Button><Plus className="h-4 w-4 mr-2" />Add Carrier</Button>}
/>

// INCORRECT: Raw elements
<h1 className="text-3xl font-bold">Carriers</h1>
<p>Manage carriers</p>
```

### Stats Cards Row

```tsx
// CORRECT: KPI cards in responsive grid
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
  <KPICard icon={Truck} iconColor="text-primary" label="Total" value={234} />
  <KPICard icon={CircleCheckBig} iconColor="text-emerald-600" label="Active" value={189}
    trend={{ value: 12, direction: 'up', label: 'this month' }} />
  ...
</div>
```

### Filter Bar

```tsx
// CORRECT: Consistent filter layout
<div className="flex flex-col gap-3 mb-6">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input placeholder="Search..." className="pl-10" />
  </div>
  <div className="flex flex-wrap gap-3">
    <Select ...>...</Select>
    <Select ...>...</Select>
    {hasFilters && <Button variant="ghost" size="sm"><X className="h-4 w-4 mr-1" />Clear</Button>}
  </div>
</div>
```

---

## 5. Icon Usage

### Library: Lucide React

All icons come from `lucide-react`. Do not use any other icon library.

### Sizing Rules

| Context | Size Class | Pixel Size | Example |
|---------|-----------|------------|---------|
| Inside buttons | `h-4 w-4` | 16px | `<Plus className="h-4 w-4 mr-2" />` |
| Inside badges | `h-3 w-3` | 12px | `<Icon className="mr-1 h-3 w-3" />` |
| In navigation sidebar | `h-5 w-5` | 20px | `<Truck className="h-5 w-5" />` |
| Standalone (page) | `h-6 w-6` | 24px | `<Building2 className="h-6 w-6" />` |
| Empty state illustration | `h-12 w-12` | 48px | `<Package className="h-12 w-12 text-muted-foreground" />` |
| In stat cards (accent) | `h-5 w-5` | 20px | `<Truck className="h-5 w-5 text-primary" />` |
| Table cell inline | `h-4 w-4` | 16px | `<MapPin className="h-4 w-4 text-muted-foreground" />` |

### Icon Color Rules

| Context | Color Class |
|---------|------------|
| In primary buttons | Inherits white from button text |
| In outline/ghost buttons | Inherits from button text color |
| Standalone decorative | `text-muted-foreground` |
| Status-related | Matches status semantic color |
| In stat cards | Matches the metric's semantic color |
| Disabled | `text-muted-foreground/50` |

### Common Icon + Text Pattern

```tsx
// Button with icon
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Carrier
</Button>

// Icon-only button (MUST have aria-label)
<Button variant="ghost" size="icon" aria-label="More options">
  <MoreHorizontal className="h-4 w-4" />
</Button>

// Inline data with icon
<div className="flex items-center gap-1 text-sm text-muted-foreground">
  <MapPin className="h-4 w-4" />
  Chicago, IL
</div>
```

---

## 6. Status Indicator Standards

### When to Use Each Format

| Format | When to Use | Example |
|--------|-------------|---------|
| Pill badge | Entity status in tables/lists | `<StatusBadge entity={CARRIER_STATUS} status="ACTIVE" />` |
| Dot + text | Compact inline status | `<span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Active</span>` |
| Left border | Mobile cards, list items | `<div className="border-l-4 border-emerald-500 pl-4">...` |
| Background tint | Selected rows, active states | `className="bg-primary/5"` |
| Icon only | Very compact spaces | `<CircleCheckBig className="h-4 w-4 text-emerald-600" />` |

### Status Badge (Standard -- Use This)

```tsx
import { StatusBadge } from '@/components/shared/status-badge';
import { CARRIER_STATUS } from '@/lib/constants/status-colors';

<StatusBadge entity={CARRIER_STATUS} status={carrier.status} />
// Renders: pill with icon, correct background/text colors from status system
```

### Status Dot (Compact Alternative)

```tsx
// For tight spaces like sidebars or compact lists
function StatusDot({ color }: { color: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

// Usage:
<StatusDot color="bg-emerald-500" /> // Active
<StatusDot color="bg-red-500" />     // Cancelled
<StatusDot color="bg-amber-500" />   // On Hold
```

### Left Border (Mobile Cards)

```tsx
// Mobile card with status-colored left border
<div className={cn(
  "rounded-lg border p-4 border-l-4",
  carrier.status === 'ACTIVE' && "border-l-emerald-500",
  carrier.status === 'BLACKLISTED' && "border-l-red-500",
  carrier.status === 'ON_HOLD' && "border-l-amber-500",
  carrier.status === 'INACTIVE' && "border-l-slate-400",
)}>
  ...
</div>
```

---

## 7. Table Styling Standard

### Table Header

```tsx
<TableHeader>
  <TableRow className="bg-muted/50 hover:bg-muted/50">
    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      Carrier
    </TableHead>
    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      Status
    </TableHead>
    {/* ... */}
  </TableRow>
</TableHeader>
```

### Table Row

```tsx
<TableRow className="hover:bg-muted/30 transition-colors h-11">
  <TableCell className="text-sm">
    <Link href={`/carriers/${id}`} className="font-medium hover:underline text-primary">
      {name}
    </Link>
  </TableCell>
  <TableCell>
    <StatusBadge entity={CARRIER_STATUS} status={status} />
  </TableCell>
  <TableCell className="text-sm font-mono text-muted-foreground">
    MC# {mcNumber}
  </TableCell>
  <TableCell className="text-right">
    <DropdownMenu>...</DropdownMenu>
  </TableCell>
</TableRow>
```

### Table with Checkbox Selection

```tsx
<TableHead className="w-12">
  <Checkbox
    checked={allSelected}
    onCheckedChange={toggleSelectAll}
    aria-label="Select all rows"
  />
</TableHead>
```

### Table Empty State

```tsx
{data.length === 0 && (
  <TableRow>
    <TableCell colSpan={columns.length} className="h-60">
      <EmptyState
        icon={Package}
        title="No carriers found"
        description="Adjust your filters or add a new carrier."
        actionLabel="Add Carrier"
        onAction={() => setShowCreateDialog(true)}
      />
    </TableCell>
  </TableRow>
)}
```

### Pagination Below Table

```tsx
<div className="flex items-center justify-between mt-4">
  <p className="text-sm text-muted-foreground">
    Showing {start} to {end} of {total} carriers
  </p>
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" disabled={page === 1} onClick={prevPage}>
      <ChevronLeft className="h-4 w-4" />
      Previous
    </Button>
    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={nextPage}>
      Next
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

## 8. Form Styling Standard

### Label + Field Pattern

```tsx
<div className="space-y-2">
  <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
    Company Name
  </Label>
  <Input
    id="companyName"
    placeholder="ABC Trucking Inc."
    className="h-9"                          {/* 36px height */}
    {...register('companyName')}
  />
  {errors.companyName && (
    <p className="text-xs text-destructive">{errors.companyName.message}</p>
  )}
</div>
```

### Form Section with Title

```tsx
<div className="space-y-4">
  <div>
    <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
    <p className="text-sm text-muted-foreground">Basic details about the carrier</p>
  </div>
  <Separator />
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* form fields */}
  </div>
</div>
```

### Form Grid Layouts

```tsx
// Two-column form (most common)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField .../>  {/* Left column */}
  <FormField .../>  {/* Right column */}
</div>

// Three-column form (for compact data like city/state/zip)
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <FormField .../> {/* City */}
  <FormField .../> {/* State */}
  <FormField .../> {/* ZIP */}
</div>

// Full-width field (address, notes)
<FormField className="col-span-full" .../>
```

### Form Footer (Sticky)

```tsx
<div className="flex items-center justify-end gap-3 pt-6 border-t">
  <Button variant="outline" onClick={onCancel}>Cancel</Button>
  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save Changes'}
  </Button>
</div>
```

### Validation Message Styling

```tsx
// Error state on field
<Input
  className={cn("h-9", errors.field && "border-destructive focus-visible:ring-destructive")}
/>

// Error message below field
<p className="text-xs text-destructive mt-1">{errors.field.message}</p>

// Helper text (non-error)
<p className="text-xs text-muted-foreground mt-1">Must be a valid MC number (MC-XXXXXX)</p>
```

---

## 9. Card Styling Standard

### Standard Card

```tsx
<Card className="rounded-lg border bg-card">
  <CardHeader className="p-6 pb-4">
    <CardTitle className="text-base font-medium">Card Title</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">Description text</CardDescription>
  </CardHeader>
  <CardContent className="p-6 pt-0">
    {/* Content */}
  </CardContent>
</Card>
```

### Interactive Card (Clickable)

```tsx
<Card className="rounded-lg border bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Stat/KPI Card

```tsx
<Card className="rounded-lg border bg-card">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-emerald-100 p-2">
        <CircleCheckBig className="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">Active Carriers</p>
        <p className="text-2xl font-bold text-foreground">189</p>
        <p className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
          <ArrowUp className="h-3 w-3" /> +12 this month
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

### Alert/Highlight Card

```tsx
// Danger zone
<Card className="rounded-lg border-red-200 bg-red-50">
  <CardContent className="p-4">
    <h3 className="text-base font-medium text-red-900">Danger Zone</h3>
    <p className="text-sm text-red-700 mt-1">This action cannot be undone.</p>
  </CardContent>
</Card>

// Info/tip card
<Card className="rounded-lg border-blue-200 bg-blue-50">
  <CardContent className="p-4 flex items-start gap-3">
    <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
    <p className="text-sm text-blue-800">Tip: You can filter carriers by state.</p>
  </CardContent>
</Card>
```

---

## 10. Dark Mode Token Mapping

### Background Tokens

| Light Mode | Dark Mode | CSS Variable |
|-----------|-----------|-------------|
| White `#FFFFFF` | Slate-950 `oklch(0.18 0.015 264)` | `var(--background)` |
| White (card) | Slate-900 `oklch(0.22 0.015 264)` | `var(--card)` |
| Gray-50 `#F9FAFB` (muted) | Slate-800 `oklch(0.3 0.02 264)` | `var(--muted)` |
| Sidebar (always) | Slate-900 `#0F172A` | `var(--sidebar)` |

### Text Tokens

| Light Mode | Dark Mode | CSS Variable |
|-----------|-----------|-------------|
| Slate-900 (primary) | Slate-50 `oklch(0.98 0 0)` | `var(--foreground)` |
| Slate-500 (secondary) | Slate-400 `oklch(0.72 0.015 264)` | `var(--muted-foreground)` |

### Border Tokens

| Light Mode | Dark Mode | CSS Variable |
|-----------|-----------|-------------|
| Gray-200 `#E5E7EB` | White 10% `oklch(1 0 0 / 10%)` | `var(--border)` |

### Status Colors in Dark Mode

Status colors remain the same semantic colors in dark mode. The background becomes darker/more saturated, text becomes lighter:

```tsx
// Badge dark mode adjustment (already in badge.tsx variants)
success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
info:    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
```

### How to Test Dark Mode

```tsx
// Add .dark class to html element
document.documentElement.classList.add('dark');

// Or use Tailwind dark mode toggle in Storybook
// Or use system preference: @media (prefers-color-scheme: dark)
```

---

## 11. Common Copy-Paste Patterns

### Complete List Page Structure

```tsx
export default function EntityListPage() {
  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Entities"
        description="Description here"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Entities' }]}
        actions={<Button><Plus className="h-4 w-4 mr-2" />Add Entity</Button>}
      />

      {/* 2. KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KPICard ... />
      </div>

      {/* 3. Bulk Actions (conditional) */}
      {selectedCount > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-3 flex items-center justify-between">
            <span>{selectedCount} selected</span>
            <Button variant="destructive" size="sm">Delete Selected</Button>
          </CardContent>
        </Card>
      )}

      {/* 4. Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Entities</CardTitle>
          <CardDescription>{total} entities total</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 5. Filter Bar */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="relative"><Search .../><Input className="pl-10" .../></div>
            <div className="flex flex-wrap gap-3"><Select .../></div>
          </div>

          {/* 6. Data States */}
          {isLoading ? (
            <DataTableSkeleton columns={8} rows={8} />
          ) : error ? (
            <ErrorState title="Failed to load" onRetry={refetch} />
          ) : data.length === 0 ? (
            <EmptyState icon={Package} title="No entities" actionLabel="Add" onAction={...} />
          ) : (
            <>
              {/* 7. Table */}
              <Table>...</Table>
              {/* 8. Pagination */}
              <div className="flex items-center justify-between mt-4">...</div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Complete Detail Page Structure

```tsx
export default function EntityDetailPage() {
  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb + Header */}
      <PageHeader
        title={entity.name}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Entities', href: '/entities' },
          { label: entity.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline"><Pencil className="h-4 w-4 mr-2" />Edit</Button>
            <Button>Update Status</Button>
          </div>
        }
        badge={<StatusBadge entity={ENTITY_STATUS} status={entity.status} />}
      />

      {/* 2. Key Info Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard label="Origin" value="Chicago, IL" />
        <KPICard label="Destination" value="Dallas, TX" />
        ...
      </div>

      {/* 3. Tabbed Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Tab content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Complete Form Page Structure

```tsx
export default function EntityFormPage() {
  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Create Entity"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Entities', href: '/entities' },
          { label: 'Create' },
        ]}
      />

      {/* 2. Stepper (if multi-step) */}
      <Stepper steps={['Basic Info', 'Details', 'Review']} current={step} />

      {/* 3. Form Sections */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the required details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fields */}
            </div>
          </CardContent>
        </Card>

        {/* 4. Sticky Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Entity'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## 12. Quick Reference Card (Print This)

```
TYPOGRAPHY
  Page title:    text-2xl font-semibold
  Section title: text-lg font-semibold
  Card title:    text-base font-medium
  Body:          text-sm
  Caption:       text-xs text-muted-foreground
  Table header:  text-xs font-medium uppercase tracking-wider text-muted-foreground
  ID/Reference:  text-sm font-mono

SPACING
  Page sections: space-y-6
  Card grid:     gap-4
  Card padding:  p-6 (standard), p-4 (compact)
  Form fields:   space-y-4
  Form groups:   space-y-6

ICONS (Lucide)
  In buttons:    h-4 w-4 mr-2
  In badges:     h-3 w-3 mr-1
  In nav:        h-5 w-5
  Standalone:    h-6 w-6
  Empty state:   h-12 w-12

RADIUS
  Cards:         rounded-lg
  Buttons:       rounded-md
  Inputs:        rounded-md
  Badges:        rounded-full
  Modals:        rounded-xl

COMPONENTS TO USE
  Status:        <StatusBadge entity={X_STATUS} status="..." />
  Page header:   <PageHeader title="..." breadcrumbs={...} />
  Loading:       <DataTableSkeleton columns={N} rows={N} />
  Error:         <ErrorState title="..." onRetry={...} />
  Empty:         <EmptyState icon={...} title="..." />
  Confirm:       <ConfirmDialog ... />  (NEVER browser confirm())

NEVER DO
  - Hardcode color classes (bg-green-100)
  - Use browser confirm()
  - Show "Loading..." text
  - Show raw error.message
  - Use text-3xl font-bold for page titles (it's text-2xl font-semibold)
  - Use p-5 or gap-5 (not on 4px grid)
```

---

*This is the final document in the design strategy series. Use it as a daily reference alongside the design principles document.*
