# TMS Panels Components

**Location:** `apps/web/components/tms/panels/`
**Component count:** 4 (3 components + 1 barrel)

## Components

### SlidePanel
- **File:** `slide-panel.tsx`
- **Props:** Open state, onClose, title, width, children
- **Used by:** Dispatch detail, load drawer, various detail views
- **Description:** Generic slide-out panel component. Animates in from the right side of the screen. Supports configurable width, title bar with close button, and scrollable content area.

### PanelTabs
- **File:** `panel-tabs.tsx`
- **Props:** Tabs configuration, active tab, onChange
- **Used by:** SlidePanel content
- **Description:** Tab navigation component designed for use inside slide panels. Compact tab design that fits the constrained panel width.

### QuickActions
- **File:** `quick-actions.tsx`
- **Props:** Entity type, entity ID, available actions
- **Used by:** Detail panels, detail pages
- **Description:** Grid of quick action buttons (assign carrier, update status, add document, send email, etc.) displayed in slide panels or detail page sidebars.

### index.ts
- **File:** `index.ts`
- **Description:** Barrel exports
