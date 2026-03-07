# TMS Components (Design System)

**Path:** `apps/web/components/tms/`

**31 approved components. DO NOT MODIFY (design-system approved as-is).**

## Subdirectory Structure

| Subdirectory | Files | Total LOC | Description |
|-------------|-------|-----------|-------------|
| `alerts/` | 1 | 79 | Alert banners |
| `cards/` | 3 + index | 232 | Data display cards (InfoGrid, FieldList, RouteCard) |
| `checkcalls/` | 3 | 599 | Check call forms and timeline |
| `dashboard/` | 5 | 974 | Operations dashboard widgets |
| `dispatch/` | 12 | 4,174 | Dispatch board, kanban, load cards, detail drawer |
| `documents/` | 5 + index | 520 | Document management, upload, rate con preview |
| `emails/` | 1 | 233 | Email preview dialog |
| `filters/` | 3 + index | 408 | Filter bar, filter chips, status dropdown |
| `finance/` | 1 + index | 150 | Finance breakdown |
| `layout/` | 2 + index | 208 | PageHeader, AppSidebar (v5) |
| `loads/` | 16 | 4,586 | Load form, data table, detail tabs, status badges |
| `orders/` | 15 | 3,611 | Order form (multi-step), columns, detail tabs |
| `panels/` | 3 + index | 346 | SlidePanel, PanelTabs, QuickActions |
| `primitives/` | 5 + index | 411 | StatusBadge, StatusDot, CustomCheckbox, SearchInput, UserAvatar |
| `shared/` | 4 + index | 253 | FinancialSummaryCard, MetadataCard, StatusBadge, TimelineFeed |
| `stats/` | 3 + index | 210 | KpiCard, StatItem, StatsBar |
| `stops/` | 5 | 933 | Stop cards, stop lists, stop actions, stops table |
| `tables/` | 5 + index | 692 | DataTable, TablePagination, DensityToggle, GroupHeader, BulkActionBar |
| `timeline/` | 1 + index | 116 | Vertical timeline component |
| `tracking/` | 3 | 1,139 | TrackingMap, TrackingPinPopup, TrackingSidebar |

**Grand Total:** ~100+ files, ~19,874 LOC

## Key Design Principles

1. **3-layer token system**: brand tokens -> semantic tokens -> Tailwind classes (via `globals.css`)
2. **v5 design spec compliance**: All measurements match the dispatch v5 Figma spec
3. **Composable**: Components are small, single-purpose, and compose into larger views
4. **TanStack Table**: DataTable is a pure presentation component; parent owns `useReactTable()`
5. **Status colors**: 6 status tokens (transit, unassigned, tendered, dispatched, delivered, atrisk)
6. **Intent colors**: 4 semantic intents (success, warning, danger, info)

## Usage Patterns

The TMS components form the visual language for all dispatch/operations screens:
- `/dispatch` - Full dispatch board using dispatch/, kanban, filters, tables
- `/loads` - Load management using loads/, tables, filters
- `/orders` - Order management using orders/ (multi-step form)
- `/tracking` - Real-time tracking using tracking/
- All list pages use `patterns/list-page` which composes TMS tables + filters

## Dependencies

- `@/lib/design-tokens` (StatusColorToken, Intent type definitions)
- `@/lib/utils` (cn utility)
- `@tanstack/react-table` (DataTable)
- `@dnd-kit/sortable` (Kanban drag-and-drop)
- `@react-google-maps/api` (TrackingMap)
- `class-variance-authority` (CVA for variant styling)
- `lucide-react` (icons)
- `date-fns` (date formatting)
- `sonner` (toast notifications)
