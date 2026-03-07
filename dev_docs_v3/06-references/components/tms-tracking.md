# TMS Tracking Components

**Location:** `apps/web/components/tms/tracking/`
**Component count:** 3

## Components

### TrackingMap
- **File:** `tracking-map.tsx`
- **Props:** Loads with positions, selected load ID, onSelect
- **Used by:** Tracking page, load detail
- **Description:** Map component for visualizing load positions and routes. Renders markers for active loads with status-colored pins. Supports click-to-select and route polyline display. Uses a map provider (Google Maps or Mapbox).

### TrackingPinPopup
- **File:** `tracking-pin-popup.tsx`
- **Props:** Load data, position data
- **Used by:** TrackingMap
- **Description:** Popup/tooltip displayed when hovering or clicking a load pin on the tracking map. Shows load reference number, status badge, carrier name, current location, speed, and last update time.

### TrackingSidebar
- **File:** `tracking-sidebar.tsx`
- **Props:** Loads list, selected ID, onSelect, filters
- **Used by:** Tracking page
- **Description:** Sidebar panel listing all tracked loads with search and filter capabilities. Each item shows load reference, status, carrier, and last position update. Clicking an item selects it on the map.
