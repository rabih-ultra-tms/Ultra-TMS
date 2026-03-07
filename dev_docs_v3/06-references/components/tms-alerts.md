# TMS Alerts Components

**Location:** `apps/web/components/tms/alerts/`
**Component count:** 2 (1 component + 1 barrel)

## Components

### AlertBanner
- **File:** `alert-banner.tsx`
- **Lines:** ~40
- **Props:** Alert type, message, dismissible
- **Used by:** Dashboard pages, operations views
- **Description:** Dismissible alert banner for system-wide or context-specific notifications. Supports info, warning, error, and success variants using the TMS design token system.

### index.ts
- **File:** `index.ts`
- **Description:** Barrel exports for AlertBanner
