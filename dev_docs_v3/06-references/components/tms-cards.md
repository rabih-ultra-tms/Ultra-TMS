# TMS Cards Components

**Location:** `apps/web/components/tms/cards/`
**Component count:** 4 (3 components + 1 barrel)

## Components

### FieldList
- **File:** `field-list.tsx`
- **Props:** Fields array with label/value pairs
- **Used by:** Detail pages (loads, orders, carriers)
- **Description:** Renders a vertical list of label-value pairs in a consistent layout. Used in detail page info sections.

### InfoGrid
- **File:** `info-grid.tsx`
- **Props:** Items array, columns configuration
- **Used by:** Detail pages, summary cards
- **Description:** Responsive grid of info fields. Supports configurable column counts for different breakpoints.

### RouteCard
- **File:** `route-card.tsx`
- **Props:** Origin, destination, stops, distance
- **Used by:** Load detail pages, dispatch board
- **Description:** Displays a route summary with origin/destination points, stop count, and estimated distance. Visual route line connecting the points.

### index.ts
- **File:** `index.ts`
- **Description:** Barrel exports for all card components
