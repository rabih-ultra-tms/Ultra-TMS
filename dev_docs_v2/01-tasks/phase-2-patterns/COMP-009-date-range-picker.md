# COMP-009: DateRangePicker Component

> **Phase:** 2 | **Priority:** P2 | **Status:** NOT STARTED
> **Effort:** M (2-3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/components.md` — Missing components list

## Objective

Build a DateRangePicker component for filtering data by date ranges. Used in: load history filters, accounting reports, commission period selection, dashboard date range. Wraps the shadcn Calendar component with start/end date selection.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/shared/date-range-picker.tsx` | DateRangePicker with presets (Today, Last 7 days, Last 30 days, Custom) |

## Acceptance Criteria

- [ ] Select start and end dates with calendar popover
- [ ] Preset buttons: Today, Last 7 days, Last 30 days, This month, Last month, Custom range
- [ ] Display format: "Feb 1 - Feb 8, 2026"
- [ ] Clear button resets range
- [ ] onChange callback returns { from: Date, to: Date }
- [ ] Uses shadcn Calendar and Popover components
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: COMP-008 (shadcn DatePicker install)
- Blocks: None (nice-to-have for Phase 3+)

## Reference

- shadcn date picker: https://ui.shadcn.com/docs/components/date-picker
