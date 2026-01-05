# Design System

Comprehensive design system for the 3PL Platform, providing consistent UI components, patterns, and guidelines for all applications.

---

## Overview

The 3PL Platform Design System is built on:

- **React** - Component framework
- **TailwindCSS** - Utility-first styling
- **Headless UI** - Accessible primitives
- **Lucide Icons** - Icon library
- **Framer Motion** - Animations

---

## Design Principles

### 1. Efficiency First

- Minimize clicks to complete tasks
- Surface critical information prominently
- Support keyboard navigation throughout
- Enable bulk operations where applicable

### 2. Clarity Over Cleverness

- Use industry-standard terminology
- Avoid ambiguous icons without labels
- Provide clear feedback for all actions
- Show loading and empty states explicitly

### 3. Flexibility

- Support user customization
- Allow field/column configuration
- Enable saved views and filters
- Respect user preferences

### 4. Accessibility

- WCAG 2.1 AA compliance
- Screen reader support
- Color-blind friendly palettes
- Keyboard-only navigation

### 5. Multi-Language Ready

- All text externalized
- RTL layout support
- Date/number formatting
- Spanish priority for drivers

---

## Color System

### Brand Colors

```css
/* Primary - Blue */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6; /* Main */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* Secondary - Slate */
--secondary-50: #f8fafc;
--secondary-100: #f1f5f9;
--secondary-200: #e2e8f0;
--secondary-300: #cbd5e1;
--secondary-400: #94a3b8;
--secondary-500: #64748b;
--secondary-600: #475569;
--secondary-700: #334155;
--secondary-800: #1e293b;
--secondary-900: #0f172a;
```

### Semantic Colors

```css
/* Success - Green */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-700: #15803d;

/* Warning - Amber */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-700: #b45309;

/* Error - Red */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-700: #b91c1c;

/* Info - Sky */
--info-50: #f0f9ff;
--info-500: #0ea5e9;
--info-700: #0369a1;
```

### Status Colors (Logistics Specific)

```css
/* Load Status */
--status-available: #22c55e; /* Green */
--status-booked: #3b82f6; /* Blue */
--status-dispatched: #8b5cf6; /* Purple */
--status-in-transit: #f59e0b; /* Amber */
--status-delivered: #10b981; /* Emerald */
--status-invoiced: #06b6d4; /* Cyan */
--status-paid: #84cc16; /* Lime */
--status-cancelled: #ef4444; /* Red */
--status-on-hold: #6b7280; /* Gray */
```

---

## Typography

### Font Stack

```css
--font-sans:
  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### Type Scale

| Name        | Size | Weight | Line Height | Usage                   |
| ----------- | ---- | ------ | ----------- | ----------------------- |
| `text-xs`   | 12px | 400    | 16px        | Labels, captions        |
| `text-sm`   | 14px | 400    | 20px        | Body small, table cells |
| `text-base` | 16px | 400    | 24px        | Body default            |
| `text-lg`   | 18px | 500    | 28px        | Subheadings             |
| `text-xl`   | 20px | 600    | 28px        | Card titles             |
| `text-2xl`  | 24px | 600    | 32px        | Page headings           |
| `text-3xl`  | 30px | 700    | 36px        | Dashboard metrics       |
| `text-4xl`  | 36px | 700    | 40px        | Hero numbers            |

---

## Spacing System

Based on 4px grid:

| Token       | Value | Usage              |
| ----------- | ----- | ------------------ |
| `space-0.5` | 2px   | Micro spacing      |
| `space-1`   | 4px   | Tight spacing      |
| `space-2`   | 8px   | Component internal |
| `space-3`   | 12px  | Related elements   |
| `space-4`   | 16px  | Standard gap       |
| `space-6`   | 24px  | Section spacing    |
| `space-8`   | 32px  | Card padding       |
| `space-12`  | 48px  | Page sections      |
| `space-16`  | 64px  | Major divisions    |

---

## Component Library

### 111 Components Organized by Category

#### Foundation (12)

1. Button
2. IconButton
3. ButtonGroup
4. Link
5. Badge
6. Tag
7. Avatar
8. AvatarGroup
9. Icon
10. Spinner
11. Skeleton
12. ProgressBar

#### Forms (18)

13. Input
14. Textarea
15. Select
16. MultiSelect
17. Combobox
18. Checkbox
19. CheckboxGroup
20. Radio
21. RadioGroup
22. Switch
23. Slider
24. DatePicker
25. DateRangePicker
26. TimePicker
27. FileUpload
28. PhoneInput
29. CurrencyInput
30. FormField

#### Layout (14)

31. Container
32. Grid
33. Stack
34. Flex
35. Divider
36. Card
37. Panel
38. Accordion
39. Tabs
40. VerticalTabs
41. Sidebar
42. Header
43. Footer
44. PageLayout

#### Navigation (10)

45. Navbar
46. Breadcrumb
47. Pagination
48. Stepper
49. Menu
50. DropdownMenu
51. ContextMenu
52. CommandPalette
53. SearchInput
54. QuickActions

#### Data Display (16)

55. Table
56. DataGrid
57. TreeView
58. List
59. DescriptionList
60. Timeline
61. Calendar
62. KPICard
63. Statistic
64. Chart
65. Map
66. StatusIndicator
67. ProgressTracker
68. LoadStatusBadge
69. CarrierCard
70. LoadCard

#### Feedback (10)

71. Alert
72. Toast
73. Banner
74. Modal
75. Drawer
76. Dialog
77. ConfirmDialog
78. Popover
79. Tooltip
80. EmptyState

#### Overlays (6)

81. Overlay
82. Sheet
83. Lightbox
84. ImagePreview
85. DocumentViewer
86. PDFViewer

#### Logistics-Specific (21)

87. LoadBoard
88. LoadMap
89. RouteDisplay
90. StopList
91. EquipmentSelector
92. CarrierSelector
93. CustomerSelector
94. LaneSearch
95. RateCalculator
96. QuoteBuilder
97. InvoicePreview
98. SettlementView
99. DocumentChecklist
100.  ComplianceStatus
101.  CSAScoreCard
102.  DriverSelector
103.  CheckCallLog
104.  PODCapture
105.  SignaturePad
106.  LoadTimeline
107.  DispatchBoard

#### Customization (14)

108. FieldEditor
109. LayoutEditor
110. ViewBuilder
111. FilterBuilder
112. ColumnChooser
113. ThemeSwitcher
114. LanguageSelector
115. NotificationCenter
116. UserPreferences
117. WorkspaceManager
118. DashboardBuilder
119. ReportBuilder
120. FormBuilder
121. WorkflowBuilder

---

## Component Specifications

### Button

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  leftIcon?: IconType;
  rightIcon?: IconType;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Variants:**

- `primary` - Blue filled, main CTAs
- `secondary` - Gray filled, secondary actions
- `outline` - Border only, tertiary actions
- `ghost` - No background, inline actions
- `danger` - Red, destructive actions

**Sizes:**

- `sm` - 32px height, 12px text
- `md` - 40px height, 14px text (default)
- `lg` - 48px height, 16px text

### DataGrid

```tsx
interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];

  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;

  // Sorting
  sortable?: boolean;
  defaultSort?: { column: string; direction: 'asc' | 'desc' };
  onSort?: (sort: SortState) => void;

  // Filtering
  filterable?: boolean;
  filters?: FilterState[];
  onFilterChange?: (filters: FilterState[]) => void;

  // Pagination
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;

  // Customization
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
  hiddenColumns?: string[];
  onColumnOrderChange?: (order: string[]) => void;

  // Row Actions
  rowActions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;

  // Loading & Empty
  loading?: boolean;
  emptyState?: React.ReactNode;

  // Export
  exportable?: boolean;
  exportFormats?: ('csv' | 'xlsx' | 'pdf')[];
}
```

### LoadCard

```tsx
interface LoadCardProps {
  load: {
    id: string;
    loadNumber: string;
    status: LoadStatus;
    origin: Location;
    destination: Location;
    pickupDate: Date;
    deliveryDate: Date;
    equipment: string;
    weight?: number;
    rate?: number;
    miles: number;
    customer?: string;
    carrier?: string;
  };

  variant: 'compact' | 'standard' | 'detailed';
  showRate?: boolean;
  showCustomer?: boolean;
  showCarrier?: boolean;

  actions?: {
    onView?: () => void;
    onEdit?: () => void;
    onAssign?: () => void;
    onTrack?: () => void;
  };
}
```

---

## Page Templates

### List Page Template

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Page Header                                          â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Title              [+ New] [Export] [â‹® More]    â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Filters & Search                                     â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ [ðŸ” Search...  ] [Status â–¼] [Date â–¼] [+ Filter] â”‚ â”‚
â”‚ â”‚ [Saved View â–¼]                     [Clear All]  â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Data Grid                                            â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ â˜ â”‚ Load #    â”‚ Origin   â”‚ Dest    â”‚ Status â”‚ â‹® â”‚ â”‚
â”‚ â”‚â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”‚ â”‚
â”‚ â”‚ â˜ â”‚ L-2025001 â”‚ Dallas   â”‚ Chicago â”‚ ðŸŸ¢     â”‚ â‹® â”‚ â”‚
â”‚ â”‚ â˜ â”‚ L-2025002 â”‚ Houston  â”‚ Miami   â”‚ ðŸŸ¡     â”‚ â‹® â”‚ â”‚
â”‚ â”‚ â˜ â”‚ L-2025003 â”‚ Phoenix  â”‚ LA      â”‚ ðŸ”µ     â”‚ â‹® â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Pagination                                           â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Showing 1-25 of 1,234    [â—€] 1 2 3 ... 50 [â–¶]  â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Detail Page Template

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Page Header                                          â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ [â† Back] Load #L-2025-00001   ðŸŸ¢ In Transit     â”‚ â”‚
â”‚ â”‚                                                  â”‚ â”‚
â”‚ â”‚ [Edit] [Duplicate] [Print] [â‹® More Actions]     â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Tabs                                                 â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ [Details] [Route] [Documents] [History] [Notes] â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Main Content              â”‚ Sidebar                  â”‚
â”‚                           â”‚                          â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Section 1             â”‚ â”‚ â”‚ Quick Info          â”‚ â”‚
â”‚ â”‚ ...                   â”‚ â”‚ â”‚ Rate: $2,500        â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚ Miles: 1,200        â”‚ â”‚
â”‚                           â”‚ â”‚ RPM: $2.08          â”‚ â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚ â”‚ Section 2             â”‚ â”‚                          â”‚
â”‚ â”‚ ...                   â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚ Related             â”‚ â”‚
â”‚                           â”‚ â”‚ â€¢ Invoice #INV-123  â”‚ â”‚
â”‚                           â”‚ â”‚ â€¢ BOL Document      â”‚ â”‚
â”‚                           â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Dashboard Template

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Dashboard Header                                     â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Good morning, Sarah    ðŸ“… Today: Jan 3, 2026    â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ KPI Cards Row                                        â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚ â”‚ Active   â”‚ â”‚ Pending  â”‚ â”‚ Revenue  â”‚ â”‚ Margin   â”‚â”‚
â”‚ â”‚ Loads    â”‚ â”‚ Invoices â”‚ â”‚ MTD      â”‚ â”‚ MTD      â”‚â”‚
â”‚ â”‚   47     â”‚ â”‚   12     â”‚ â”‚ $245K    â”‚ â”‚  18.5%   â”‚â”‚
â”‚ â”‚ +5 today â”‚ â”‚ -3 today â”‚ â”‚ +12%     â”‚ â”‚ +2.1%    â”‚â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Main Grid                                            â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Loads Needing Action  â”‚ â”‚ Today's Deliveries    â”‚ â”‚
â”‚ â”‚                       â”‚ â”‚                       â”‚ â”‚
â”‚ â”‚ â€¢ 3 awaiting carrier  â”‚ â”‚ ðŸŸ¢ L-001 - 10:30 AM  â”‚ â”‚
â”‚ â”‚ â€¢ 2 missing POD       â”‚ â”‚ ðŸŸ¡ L-002 - 2:00 PM   â”‚ â”‚
â”‚ â”‚ â€¢ 1 delayed           â”‚ â”‚ ðŸŸ¢ L-003 - 4:30 PM   â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Revenue Chart         â”‚ â”‚ Recent Activity       â”‚ â”‚
â”‚ â”‚                       â”‚ â”‚                       â”‚ â”‚
â”‚ â”‚   ðŸ“ˆ [Chart]          â”‚ â”‚ â€¢ Load L-005 created â”‚ â”‚
â”‚ â”‚                       â”‚ â”‚ â€¢ Invoice paid $3.2K â”‚ â”‚
â”‚ â”‚                       â”‚ â”‚ â€¢ New carrier added  â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Customization Engine

### User-Configurable Elements

#### Field Customization

```typescript
interface FieldCustomization {
  fieldId: string;
  label?: string; // Override default label
  visible: boolean; // Show/hide
  required?: boolean; // Override required
  order: number; // Position in form
  width?: 'full' | 'half' | 'third';
  section?: string; // Group into sections
}
```

#### Grid Column Customization

```typescript
interface ColumnCustomization {
  columnId: string;
  visible: boolean;
  width: number;
  order: number;
  frozen?: boolean; // Freeze left
  sortable?: boolean;
  filterable?: boolean;
}
```

#### Saved Views

```typescript
interface SavedView {
  id: string;
  name: string;
  entityType: string; // 'loads', 'carriers', etc.
  isDefault: boolean;
  isShared: boolean;

  // Grid State
  columns: ColumnCustomization[];
  sortBy?: { column: string; direction: 'asc' | 'desc' };
  filters: FilterState[];

  // Display Options
  pageSize: number;
  groupBy?: string;
}
```

### Theme Customization

```typescript
interface ThemeConfig {
  // Colors
  primaryColor: string; // Main brand color
  accentColor: string; // Secondary color

  // Mode
  mode: 'light' | 'dark' | 'system';

  // Density
  density: 'comfortable' | 'compact' | 'spacious';

  // Typography
  fontSize: 'small' | 'medium' | 'large';

  // Sidebar
  sidebarCollapsed: boolean;
  sidebarPosition: 'left' | 'right';
}
```

---

## Accessibility Guidelines

### Keyboard Navigation

| Key           | Action                             |
| ------------- | ---------------------------------- |
| `Tab`         | Move to next focusable element     |
| `Shift+Tab`   | Move to previous focusable element |
| `Enter/Space` | Activate button/link               |
| `Escape`      | Close modal/dropdown               |
| `Arrow Keys`  | Navigate within lists/menus        |
| `Home/End`    | Jump to first/last item            |

### ARIA Requirements

```tsx
// Button with loading state
<button
  aria-busy={loading}
  aria-disabled={disabled}
  aria-label="Save load details"
>
  {loading ? <Spinner aria-hidden="true" /> : null}
  Save
</button>

// Data table with sorting
<table role="grid" aria-label="Loads list">
  <thead>
    <tr>
      <th
        scope="col"
        aria-sort={sortDirection}
        aria-label="Sort by load number"
      >
        Load #
      </th>
    </tr>
  </thead>
</table>

// Status with color
<span
  className="status-delivered"
  role="status"
  aria-label="Load status: Delivered"
>
  <span aria-hidden="true">â—</span> Delivered
</span>
```

### Color Contrast

- Normal text (< 18px): minimum 4.5:1 contrast ratio
- Large text (â‰¥ 18px or 14px bold): minimum 3:1 contrast ratio
- UI components: minimum 3:1 contrast ratio
- Never use color as the only indicator

---

## Responsive Breakpoints

| Breakpoint | Width  | Target         |
| ---------- | ------ | -------------- |
| `sm`       | 640px  | Large phones   |
| `md`       | 768px  | Tablets        |
| `lg`       | 1024px | Small laptops  |
| `xl`       | 1280px | Desktops       |
| `2xl`      | 1536px | Large monitors |

### Mobile Considerations

- Touch targets minimum 44x44px
- Simplified navigation (hamburger menu)
- Stacked layouts for forms
- Bottom sheet instead of modals
- Swipe gestures for common actions
- Pull-to-refresh for lists

---

## Animation Guidelines

### Durations

| Type   | Duration | Usage                             |
| ------ | -------- | --------------------------------- |
| Micro  | 100ms    | Hover states, toggles             |
| Fast   | 200ms    | Buttons, small transitions        |
| Normal | 300ms    | Modals, drawers, page transitions |
| Slow   | 500ms    | Complex animations, charts        |

### Easing

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Icon Library

Using **Lucide Icons** (MIT Licensed, 1000+ icons)

### Common Logistics Icons

| Icon  | Name          | Usage            |
| ----- | ------------- | ---------------- |
| ðŸš›  | `truck`       | Loads, carriers  |
| ðŸ“¦  | `package`     | Shipments, cargo |
| ðŸ“   | `map-pin`     | Locations, stops |
| ðŸ“„  | `file-text`   | Documents        |
| ðŸ’°  | `dollar-sign` | Rates, payments  |
| ðŸ‘¤  | `user`        | Contacts, users  |
| ðŸ¢   | `building`    | Companies        |
| âš™ï¸ | `settings`    | Configuration    |
| ðŸ””  | `bell`        | Notifications    |
| ðŸ“Š  | `bar-chart`   | Analytics        |

---

## Navigation

- **Previous:** [Architecture](../01-architecture/README.md)
- **Next:** [Services](../02-services/README.md)
- **Appendix:** [Icon Reference](../10-appendix/ICONS.md)
