# TMS Stops Components

**Location:** `apps/web/components/tms/stops/`
**Component count:** 3

## Components

### StopCard
- **File:** `stop-card.tsx`
- **Props:** Stop data (type, address, appointment window, status, contact)
- **Used by:** Load route tab, order stops tab
- **Description:** Card displaying a single stop with pickup/delivery indicator, full address, appointment date/time window, contact name and phone, and arrival/departure status.

### StopActions
- **File:** `stop-actions.tsx`
- **Props:** Stop ID, available actions
- **Used by:** StopCard, stops table
- **Description:** Action menu for a stop. Includes actions like: mark arrived, mark departed, update appointment, add note, report exception.

### StopsTable
- **File:** `stops-table.tsx`
- **Props:** Stops array
- **Used by:** Load detail, order detail
- **Description:** Tabular view of stops showing sequence number, type (P/D), location, appointment window, actual times, and status. Alternative to the card-based route view.
