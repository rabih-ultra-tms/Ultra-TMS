# TMS Timeline Components

**Location:** `apps/web/components/tms/timeline/`
**Component count:** 2 (1 component + 1 barrel)

## Components

### Timeline
- **File:** `timeline.tsx`
- **Props:** Events array, variant (compact/full)
- **Used by:** Load timeline tab, order timeline tab, carrier activity
- **Description:** Vertical timeline component rendering chronological events. Each event shows a timestamp, icon (based on event type), description, and optional user attribution. Supports compact mode for sidebar/drawer use and full mode for tab content. Events are connected by a vertical line with colored dots at each node.

### index.ts
- **File:** `index.ts`
- **Description:** Barrel exports for Timeline
