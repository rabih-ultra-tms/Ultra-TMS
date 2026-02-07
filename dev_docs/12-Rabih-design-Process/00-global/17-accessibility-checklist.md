# 17 - Accessibility Checklist

> WCAG 2.1 AA compliance requirements for Ultra TMS, organized by screen type.

---

## Universal Requirements (All Screens)

These requirements apply to every page and component in the application.

### Color Contrast

- **Normal text:** Minimum 4.5:1 contrast ratio against its background.
- **Large text** (18px+ bold or 24px+ regular): Minimum 3:1 contrast ratio.

### Focus Indicators

- All interactive elements must display a visible focus ring: **2px solid blue-500**.
- Focus ring must be visible in both light and dark contexts.

### Keyboard Navigation

- Tab order follows the visual reading order (left to right, top to bottom).
- All interactive elements must be reachable via keyboard (Tab, Shift+Tab).
- No keyboard traps; users can always navigate away from any element.

### Screen Reader Support

- All images have descriptive `alt` text.
- All icon-only buttons and links have `aria-label`.
- All status badges have a text equivalent accessible to screen readers.

### Skip Navigation

- A "Skip to main content" link must be present on every page.
- It must be the first focusable element and visible on focus.

### Language

- The `<html>` element must include `lang="en"`.

### Headings

- Proper `h1` through `h6` hierarchy with no skipped levels.
- Exactly one `h1` per page.

### Landmarks

- Use semantic landmark elements: `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`.
- Each landmark should have a unique `aria-label` when multiple of the same type exist.

### Error Messages

- Error messages must be associated with their form fields via `aria-describedby`.
- Error messages must be announced to screen readers when they appear.

### Required Fields

- Mark required fields with `aria-required="true"`.
- Include a visual indicator (asterisk) alongside the label.

---

## By Screen Type

### List Pages

| Requirement           | Implementation                                                       |
|-----------------------|----------------------------------------------------------------------|
| Table semantics       | `role="table"` with proper `<th scope="col">` and `<th scope="row">` |
| Sortable columns      | `aria-sort="ascending"`, `"descending"`, or `"none"` on sortable `<th>` elements |
| Pagination            | Wrap in `<nav aria-label="Pagination">` with current page indicated via `aria-current="page"` |
| Row selection         | `aria-selected="true"` on selected rows; announce selection count via live region |
| Empty state           | "No results" message wrapped in `role="status"` so screen readers announce it |
| Filters               | `aria-expanded` on collapsible filter panels; `aria-label` on all filter inputs |

---

### Detail Pages

| Requirement           | Implementation                                                       |
|-----------------------|----------------------------------------------------------------------|
| Tabs                  | `role="tablist"` on container, `role="tab"` on each tab, `role="tabpanel"` on each panel; active tab has `aria-selected="true"` |
| Status                | `role="status"` on status badge; `aria-live="polite"` for dynamic status changes |
| Timeline              | Render as an ordered list (`<ol>`) with proper semantic structure     |

---

### Forms

| Requirement           | Implementation                                                       |
|-----------------------|----------------------------------------------------------------------|
| Labels                | Every input has a visible `<label>` associated via matching `htmlFor`/`id` |
| Validation            | Error messages referenced by `aria-describedby`; invalid fields have `aria-invalid="true"` |
| Required fields       | Visual asterisk on label + `aria-required="true"` on input           |
| Field groups          | Related fields wrapped in `<fieldset>` with a descriptive `<legend>` |
| Submit feedback       | Success and failure messages announced via `aria-live` region        |

---

### Maps

| Requirement           | Implementation                                                       |
|-----------------------|----------------------------------------------------------------------|
| Alternative view      | A text-based list of locations must be available as an alternative to the map |
| Markers               | Markers must be keyboard navigable; announce location name on focus  |
| Controls              | Zoom and pan controls must be operable via keyboard                  |

---

### Dashboards

| Requirement           | Implementation                                                       |
|-----------------------|----------------------------------------------------------------------|
| Charts                | Provide a text summary via `aria-label` describing the data trend (e.g., "Revenue trending up 12% this month") |
| KPI cards             | Announce both the value and the trend direction to screen readers    |
| Auto-refresh          | Updated values announced via `aria-live="polite"` (not "assertive") |

---

### Modals and Dialogs

| Requirement           | Implementation                                                       |
|-----------------------|----------------------------------------------------------------------|
| Focus trap            | Focus must remain within the modal while it is open                  |
| Escape to close       | Pressing Escape must close the modal                                 |
| Return focus          | On close, focus returns to the element that triggered the modal      |
| ARIA roles            | `role="dialog"` with `aria-labelledby` pointing to the title and `aria-describedby` pointing to the description |

---

### Drag and Drop

| Requirement           | Implementation                                                       |
|-----------------------|----------------------------------------------------------------------|
| Keyboard alternative  | Arrow keys to reorder items; Enter to confirm the new position       |
| Announcements         | Screen reader announces position changes (e.g., "Item moved to position 3 of 5") |
| Button alternative    | Provide "Move up" and "Move down" buttons as a non-drag alternative  |
