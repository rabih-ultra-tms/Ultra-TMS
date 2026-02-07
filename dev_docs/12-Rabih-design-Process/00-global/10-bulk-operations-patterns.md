# 10 - Bulk Operations Patterns

> Multi-select and bulk operation patterns used across all data table screens in Ultra TMS.
> Ensures consistent user experience for selecting, acting on, and confirming operations on multiple records.

---

## Selection Patterns

### Row-Level Checkbox

Every data table that supports bulk operations includes a checkbox as the **first column** (left-most) of each row.

| Element | Behavior |
|---------|----------|
| Row checkbox | Toggles selection of that individual row |
| Header checkbox | Toggles "select all on current page" |
| Indeterminate state | Header checkbox shows indeterminate (dash) when some but not all rows are selected |
| "Select all X items" link | Appears above table when all rows on current page are selected; clicking selects all records across all pages matching current filters |
| Deselect link | "Clear selection" link to deselect all |

### Visual Feedback on Selected Rows

```
Selected row styling:
  - Background: bg-blue-50 (light blue highlight)
  - Left border: 3px solid blue-500
  - Checkbox: filled/checked state
  - Transition: 150ms ease background-color

Hover on unselected row:
  - Background: bg-gray-50

Hover on selected row:
  - Background: bg-blue-100 (slightly darker blue)
```

### Keyboard Selection

| Shortcut | Action |
|----------|--------|
| Space | Toggle selection on focused row |
| Shift + Click | Select range of rows from last selected to clicked row |
| Ctrl/Cmd + Click | Toggle individual row without affecting other selections |
| Ctrl/Cmd + A | Select all rows on current page |
| Escape | Deselect all rows |
| Up/Down arrows | Navigate between rows (moves focus indicator) |

### Selection Persistence

- Selections are maintained when:
  - Sorting the table
  - Navigating between pages (page-level selections persist)
  - Resizing the browser window
- Selections are cleared when:
  - Applying new filters
  - Navigating away from the page
  - Performing a bulk action (after completion)
  - Refreshing the page

### Select All Across Pages

When the header checkbox is checked (selecting all on current page), a banner appears:

```
+-----------------------------------------------------------------------+
|  All 25 items on this page are selected.                              |
|  [Select all 1,247 items matching current filters]                    |
+-----------------------------------------------------------------------+
```

After clicking "Select all 1,247 items":

```
+-----------------------------------------------------------------------+
|  All 1,247 items matching current filters are selected.               |
|  [Clear selection]                                                     |
+-----------------------------------------------------------------------+
```

---

## Bulk Action Bar

### Appearance & Position

The bulk action bar appears as a **fixed bar at the bottom of the viewport** when one or more items are selected. It overlays the page content and is always visible regardless of scroll position.

```
+-----------------------------------------------------------------------+
| [X]  3 items selected    [Action 1] [Action 2] [Action 3]  [Deselect All] |
+-----------------------------------------------------------------------+

Where:
  [X] = Close/deselect button
  "3 items selected" = Dynamic count
  [Action N] = Contextual action buttons
  [Deselect All] = Text link to clear selection
```

### Animation

```css
/* Slide-up entrance */
.bulk-action-bar-enter {
  transform: translateY(100%);
  opacity: 0;
}
.bulk-action-bar-enter-active {
  transform: translateY(0);
  opacity: 1;
  transition: transform 200ms ease-out, opacity 200ms ease-out;
}

/* Slide-down exit */
.bulk-action-bar-exit {
  transform: translateY(0);
  opacity: 1;
}
.bulk-action-bar-exit-active {
  transform: translateY(100%);
  opacity: 0;
  transition: transform 200ms ease-in, opacity 150ms ease-in;
}
```

### Bar Styling

```
Background: bg-gray-900 (dark background for contrast)
Text color: text-white
Height: 64px
Padding: px-6
Border-top: 1px solid gray-700
Shadow: shadow-lg (elevation above page content)
Z-index: 50 (above table, below modals)
Border-radius: rounded-t-lg (top corners only)
```

### Action Button Styling

```
Primary action (most common): bg-blue-500, text-white, rounded-md, px-4 py-2
Destructive action: bg-red-500, text-white, rounded-md, px-4 py-2
Secondary actions: bg-gray-700, text-white, rounded-md, px-4 py-2
Disabled state: opacity-50, cursor-not-allowed
```

---

## Bulk Actions by Entity

### Orders

| Action | Type | Confirmation | Notes |
|--------|------|-------------|-------|
| Update Status | Non-destructive | Dialog with status dropdown | Shows count of orders to update |
| Assign to Rep | Non-destructive | Dialog with rep selector | "Assign 5 orders to [rep name]?" |
| Export CSV | Non-destructive | Immediate | Downloads CSV with selected order data |
| Export XLSX | Non-destructive | Immediate | Downloads Excel file |
| Print | Non-destructive | Print preview | Opens print dialog with selected orders |
| Delete | Destructive | Confirmation dialog | "Permanently delete 5 orders? This cannot be undone." |

### Loads

| Action | Type | Confirmation | Notes |
|--------|------|-------------|-------|
| Assign Carrier | Non-destructive | Dialog with carrier search | Only for loads in PENDING or CONFIRMED status |
| Update Status | Non-destructive | Dialog with status dropdown and optional reason | Validates status transitions |
| Export CSV | Non-destructive | Immediate | Downloads load data |
| Print Rate Confirmations | Non-destructive | Print preview | Generates PDF for each selected load |
| Print BOLs | Non-destructive | Print preview | Generates BOL for each selected load |
| Send to Load Board | Non-destructive | Confirmation toast | Posts selected loads to integrated load boards |
| Cancel Loads | Destructive | Confirmation dialog with reason field | "Cancel 3 loads? Please provide a reason." |

### Carriers

| Action | Type | Confirmation | Notes |
|--------|------|-------------|-------|
| Update Status | Non-destructive | Dialog with status dropdown | Active, Inactive, Suspended, etc. |
| Send Notification | Non-destructive | Dialog with message template | Email/SMS to selected carriers |
| Export CSV | Non-destructive | Immediate | Downloads carrier data |
| Update Tier | Non-destructive | Dialog with tier selector | "Update 10 carriers to Gold tier?" |
| Send Carrier Packet | Non-destructive | Confirmation toast | Sends onboarding packet to selected carriers |
| Deactivate | Destructive | Confirmation dialog | "Deactivate 5 carriers? They will not appear in carrier search." |

### Invoices

| Action | Type | Confirmation | Notes |
|--------|------|-------------|-------|
| Send | Non-destructive | Confirmation toast | Emails invoices to respective customers |
| Mark Paid | Non-destructive | Dialog with payment date and reference | "Mark 8 invoices as paid?" |
| Export CSV | Non-destructive | Immediate | Downloads invoice data |
| Export PDF | Non-destructive | Immediate | Generates combined PDF or individual PDFs (zip) |
| Print | Non-destructive | Print preview | Batch print selected invoices |
| Void | Destructive | Confirmation dialog with reason | "Void 3 invoices? This will reverse the AR entries." |
| Apply Payment | Non-destructive | Dialog with payment details | Bulk apply payment to multiple invoices |

### Quotes

| Action | Type | Confirmation | Notes |
|--------|------|-------------|-------|
| Send | Non-destructive | Confirmation toast | Emails quotes to respective customers |
| Clone | Non-destructive | Confirmation toast | Creates copies of selected quotes |
| Delete | Destructive | Confirmation dialog | "Delete 4 quotes?" |
| Export CSV | Non-destructive | Immediate | Downloads quote data |
| Mark Expired | Non-destructive | Confirmation toast | Sets status to EXPIRED |

### Users

| Action | Type | Confirmation | Notes |
|--------|------|-------------|-------|
| Activate | Non-destructive | Confirmation toast | Enables user accounts |
| Deactivate | Destructive | Confirmation dialog | "Deactivate 3 users? They will lose access immediately." |
| Change Role | Non-destructive | Dialog with role selector | "Change role for 5 users to [role]?" |
| Send Password Reset | Non-destructive | Confirmation toast | Sends password reset email to each user |
| Export CSV | Non-destructive | Immediate | Downloads user list |

### Documents

| Action | Type | Confirmation | Notes |
|--------|------|-------------|-------|
| Approve | Non-destructive | Confirmation toast | Marks documents as approved |
| Reject | Non-destructive | Dialog with reason field | Requires rejection reason |
| Download | Non-destructive | Immediate | Downloads as ZIP if multiple files |
| Delete | Destructive | Confirmation dialog | "Delete 6 documents? This cannot be undone." |
| Move to Folder | Non-destructive | Dialog with folder selector | Organize documents into folders |

---

## Confirmation Patterns

### Non-Destructive Actions

For actions that can be easily reversed or have no permanent impact:

```
Behavior: Execute immediately upon button click
Feedback: Toast notification at bottom-right

Toast format:
  +----------------------------------------+
  |  [Check icon]  5 orders exported       |
  |                           [Undo] [X]   |
  +----------------------------------------+

Toast duration: 5 seconds (with undo available)
Toast type: Success (green accent)
```

### Destructive Actions

For actions that permanently modify or remove data:

```
Confirmation Dialog:
  +------------------------------------------+
  |  [Warning icon] Delete 5 Orders?         |
  |                                          |
  |  This action cannot be undone.           |
  |  The following orders will be            |
  |  permanently deleted:                    |
  |                                          |
  |  - ORD-2024-00142                        |
  |  - ORD-2024-00143                        |
  |  - ORD-2024-00144                        |
  |  - ORD-2024-00145                        |
  |  - ORD-2024-00146                        |
  |  (showing first 5 of 5)                  |
  |                                          |
  |  Type "DELETE" to confirm:               |
  |  [_______________]                       |
  |                                          |
  |        [Cancel]  [Delete 5 Orders]       |
  +------------------------------------------+

Rules:
  - Show list of affected items (max 5 shown, "and X more" for larger sets)
  - Destructive button is red
  - For bulk deletes of 10+: require typing "DELETE" to confirm
  - Cancel button is always on the left
  - Dialog cannot be dismissed by clicking outside (only Cancel or X)
```

### Status Change Actions

For actions that change the status of records:

```
Status Change Dialog:
  +------------------------------------------+
  |  Update Status for 8 Loads               |
  |                                          |
  |  New Status: [DELIVERED        v]        |
  |                                          |
  |  Reason (optional):                      |
  |  [________________________________]      |
  |  [________________________________]      |
  |                                          |
  |  Note: 2 of 8 loads cannot transition    |
  |  to DELIVERED from their current status. |
  |  These will be skipped.                  |
  |                                          |
  |        [Cancel]  [Update 6 Loads]        |
  +------------------------------------------+

Rules:
  - Validate status transitions for each item
  - Show count of items that will be skipped with reason
  - Update button reflects actual count that will be affected
  - Optional reason field for audit trail
```

---

## Progress Pattern

### When to Show Progress

- Show progress indicator for bulk operations affecting **10 or more items**
- For fewer than 10 items, show immediate result (operations are fast enough)

### Progress UI

```
Progress Dialog (modal, not dismissible during operation):
  +------------------------------------------+
  |  Updating 47 Loads...                    |
  |                                          |
  |  [==============--------]  30/47         |
  |                                          |
  |  Current: LD-2024-00234                  |
  |  Succeeded: 29                           |
  |  Failed: 1                               |
  |                                          |
  |                          [Cancel]        |
  +------------------------------------------+

Rules:
  - Progress bar updates in real-time
  - Show current item being processed
  - Show running success/failure counts
  - Cancel button stops remaining operations (already-processed items are not rolled back)
```

### Completion Summary

```
Completion Dialog:
  +------------------------------------------+
  |  [Check icon] Bulk Update Complete        |
  |                                          |
  |  Successfully updated: 46                |
  |  Failed: 1                               |
  |                                          |
  |  Failed items:                           |
  |  - LD-2024-00267: Invalid status         |
  |    transition (CANCELLED → DELIVERED)    |
  |                                          |
  |  [View Failed Items]        [Done]       |
  +------------------------------------------+

Rules:
  - Always show success and failure counts
  - List failed items with specific error reasons
  - "View Failed Items" opens filtered list showing only failed records
  - "Done" closes dialog and refreshes the table
```

---

## Undo Pattern

### When Undo is Available

- **Available for:** Non-destructive bulk actions (status updates, assignments, tier changes)
- **Not available for:** Destructive actions (deletes, voids), external actions (emails sent, exports downloaded)

### Undo Implementation

```
Toast with Undo:
  +--------------------------------------------------+
  |  [Check icon]  8 loads updated to IN_TRANSIT      |
  |                                      [Undo] [X]   |
  +--------------------------------------------------+

Undo window: 5 seconds
  - Clicking "Undo" reverts all changes in the bulk operation
  - After 5 seconds, undo is no longer available
  - Undo toast appears: "8 loads reverted to previous status"
  - Timer pauses while user hovers over toast
```

### Undo Technical Notes

- Store previous state of all affected records before bulk operation
- Undo triggers a reverse bulk operation using stored states
- Clear stored undo state after 5-second window or page navigation
- Only one undo operation stored at a time (new bulk action replaces previous undo)

---

## Performance Considerations

### Large Selection Handling

| Selection Size | Approach |
|---------------|----------|
| 1-100 items | Process client-side with individual API calls or single batch endpoint |
| 100-1,000 items | Use batch API endpoint, process server-side |
| 1,000+ items | Use "select all matching filters" approach; send filter criteria to server, not individual IDs |

### API Design for Bulk Operations

```
// Small batch (send IDs)
POST /api/loads/bulk-update
{
  "ids": ["load-1", "load-2", "load-3"],
  "action": "update_status",
  "payload": { "status": "IN_TRANSIT" }
}

// Large batch (send filters)
POST /api/loads/bulk-update
{
  "filter": {
    "status": "DISPATCHED",
    "carrier_id": "carrier-123",
    "date_range": { "from": "2024-01-01", "to": "2024-01-31" }
  },
  "action": "update_status",
  "payload": { "status": "IN_TRANSIT" }
}

// Response (with progress tracking)
{
  "job_id": "bulk-op-12345",
  "status": "processing",
  "total": 47,
  "completed": 0,
  "poll_url": "/api/jobs/bulk-op-12345"
}
```

### Optimistic UI Updates

- For small batches (< 10 items), update the UI optimistically before server confirms
- For larger batches, wait for server confirmation before updating UI
- On failure, revert optimistic updates and show error toast

---

## Accessibility

- Bulk action bar must be announced to screen readers when it appears
- Selected count must be announced as a live region update
- All bulk action buttons must have descriptive aria-labels (e.g., "Delete 5 selected orders")
- Keyboard navigation must work for all selection patterns
- Confirmation dialogs must trap focus
- Progress updates must be announced via aria-live regions
- Undo toast must be reachable via keyboard (auto-focus undo button)
