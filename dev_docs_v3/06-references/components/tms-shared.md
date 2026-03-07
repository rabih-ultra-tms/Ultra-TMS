# TMS Shared Components

**Location:** `apps/web/components/tms/shared/`
**Component count:** 4

## Components

### FinancialSummaryCard
- **File:** `financial-summary-card.tsx`
- **Props:** Revenue, cost, margin, currency
- **Used by:** Load detail, order detail, customer detail
- **Description:** Card showing financial summary with revenue, carrier cost, gross margin, and margin percentage. Uses green/amber/red color coding based on margin health.

### MetadataCard
- **File:** `metadata-card.tsx`
- **Props:** Entity metadata (created, updated, created by, source system, external ID)
- **Used by:** Detail pages across all entities
- **Description:** Standard card showing entity metadata. Displays creation/update timestamps, user attribution, source system for migrated records, and external IDs.

### StatusBadge (TMS)
- **File:** `status-badge.tsx`
- **Props:** Status value, entity type
- **Used by:** Various TMS views
- **Description:** TMS-specific status badge component. Different from both the shared UnifiedStatusBadge and the primitives StatusBadge. Used for TMS-specific status rendering.

### TimelineFeed
- **File:** `timeline-feed.tsx`
- **Props:** Events array, entity type
- **Used by:** Timeline tabs across loads, orders, carriers
- **Description:** Generic timeline feed component. Renders chronological events with timestamps, icons, descriptions, and user attribution. Supports different event types (status change, note added, document uploaded, etc.).
