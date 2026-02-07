# 11 - Keyboard Shortcuts Map

> Complete reference of all keyboard shortcuts in the Ultra TMS application.
> Shortcuts are organized by scope: global, navigation, list pages, detail pages, and module-specific contexts.

---

## Implementation Notes

### Recommended Library

```bash
npm install react-hotkeys-hook
```

**Why react-hotkeys-hook:**
- Lightweight and React-native (hooks-based API)
- Supports key sequences (e.g., "g then d")
- Scoped shortcuts (bind to specific components)
- Automatic cleanup on unmount
- Handles key combinations (Ctrl+K, Cmd+K)
- Active maintenance and TypeScript support

### General Rules

1. **No browser conflicts:** Never override critical browser shortcuts (Ctrl+T, Ctrl+W, Ctrl+L, Ctrl+Tab, F5, F11, F12, Alt+F4)
2. **Input awareness:** Single-key shortcuts (letters, numbers) are automatically disabled when focus is inside an input, textarea, select, or contentEditable element
3. **Modifier shortcuts (Ctrl/Cmd + key):** Work regardless of focus context (even inside inputs)
4. **Platform detection:** Use `Cmd` on macOS, `Ctrl` on Windows/Linux; display the correct modifier based on detected OS
5. **Discoverability:** All shortcuts must be documented in the help overlay (accessible via `Ctrl/Cmd + /` or `?`)

### Shortcut Display Convention

In the UI, display shortcuts using the following format:
- macOS: Use symbols (e.g., `Cmd K`, `Shift N`)
- Windows/Linux: Use text (e.g., `Ctrl+K`, `Shift+N`)
- Show shortcut hints in tooltips on buttons/actions where applicable

---

## Global Shortcuts

These shortcuts work on every page of the application, regardless of context.

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl/Cmd + K` | Open Command Palette | Universal search and quick-action launcher. Type to search loads, orders, carriers, customers, or execute commands. |
| `Ctrl/Cmd + /` | Open Keyboard Shortcut Help | Displays the full keyboard shortcut reference overlay modal. |
| `Ctrl/Cmd + B` | Toggle Sidebar | Collapses or expands the main navigation sidebar. |
| `Ctrl/Cmd + N` | New Record | Context-aware new record creation. Creates a new entity based on current page (e.g., on Orders page creates new order, on Loads page creates new load). If on a non-entity page (e.g., Dashboard), opens a "New..." menu. |
| `Ctrl/Cmd + S` | Save | Saves the current form. Only active when a form is open and has unsaved changes. Shows "No changes to save" toast if no pending changes. |
| `Escape` | Close/Dismiss | Closes the top-most modal, drawer, dialog, dropdown, or popover. If nothing is open, deselects all selected rows (if on a list page). |
| `?` | Show Keyboard Shortcuts | Same as Ctrl/Cmd + / but only works when focus is NOT in an input field. Provides quick access without modifier keys. |

### Command Palette Details

The command palette (`Ctrl/Cmd + K`) supports:

| Input | Result |
|-------|--------|
| Type a load number (e.g., "LD-2024") | Jump directly to that load |
| Type an order number (e.g., "ORD-") | Jump directly to that order |
| Type a carrier name | Jump to carrier profile |
| Type a customer name | Jump to customer profile |
| Type a page name (e.g., "Settings") | Navigate to that page |
| Type an action (e.g., "New Order") | Execute the action |
| Type ">" prefix | Filter to commands only (no search results) |

---

## Navigation Shortcuts

Two-key sequences for navigating between major sections. Press the first key, release, then press the second key within 1 second.

| Shortcut | Action | Destination |
|----------|--------|-------------|
| `G` then `D` | Go to Dashboard | `/dashboard` |
| `G` then `O` | Go to Orders | `/orders` |
| `G` then `L` | Go to Loads | `/loads` |
| `G` then `C` | Go to Carriers | `/carriers` |
| `G` then `U` | Go to Customers | `/customers` |
| `G` then `T` | Go to Tracking | `/tracking` (map view) |
| `G` then `Q` | Go to Quotes | `/quotes` |
| `G` then `I` | Go to Invoices | `/invoices` |
| `G` then `R` | Go to Reports | `/reports` |
| `G` then `S` | Go to Settings | `/settings` |
| `G` then `P` | Go to Dispatch Board | `/dispatch` |
| `G` then `A` | Go to Accounting | `/accounting` |

### Implementation Detail
```tsx
// Key sequence implementation concept
// "G" starts a 1-second timer
// If a valid second key is pressed within the timer, navigate
// If timer expires or invalid key, cancel sequence
// Show visual indicator "G..." in bottom-right while waiting for second key
```

---

## List Page Shortcuts

Active on any page that displays a data table (Orders list, Loads list, Carriers list, etc.).

| Shortcut | Action | Description |
|----------|--------|-------------|
| `/` | Focus Search | Moves cursor focus to the search input field at the top of the list. Selects any existing search text. |
| `F` | Toggle Filters | Opens or closes the filter panel/drawer. |
| `R` | Refresh List | Reloads the current list data from the server. Shows brief loading indicator. |
| `Enter` | Open Selected Row | Opens the detail page/drawer for the currently focused/highlighted row. |
| `Up Arrow` | Navigate Up | Moves the row focus indicator to the previous row. At the first row, does nothing. |
| `Down Arrow` | Navigate Down | Moves the row focus indicator to the next row. At the last row, does nothing. |
| `Space` | Select/Deselect Row | Toggles the checkbox selection on the currently focused row. |
| `Ctrl/Cmd + A` | Select All on Page | Selects all rows on the current page. Shows "Select all across pages" banner. |
| `Shift + Click` | Range Select | Selects all rows between the last selected row and the clicked row. |
| `Ctrl/Cmd + Click` | Toggle Individual | Toggles selection on clicked row without affecting other selections. |
| `Escape` | Deselect All | Clears all row selections and dismisses the bulk action bar. |
| `Page Up` | Previous Page | Navigates to the previous page of results. |
| `Page Down` | Next Page | Navigates to the next page of results. |
| `Home` | First Page | Navigates to the first page of results. |
| `End` | Last Page | Navigates to the last page of results. |

### Row Focus Indicator
```
Visual: 2px blue-500 left border on the focused row
        Subtle blue-50 background tint
Behavior: Focus indicator is distinct from selection
          A row can be focused but not selected (and vice versa)
          Arrow keys move focus, Space toggles selection
```

---

## Detail Page Shortcuts

Active on any entity detail page (Order Detail, Load Detail, Carrier Detail, etc.).

| Shortcut | Action | Description |
|----------|--------|-------------|
| `E` | Edit | Enters edit mode for the current record. Equivalent to clicking the Edit button. |
| `Backspace` | Go Back | Returns to the parent list page. Equivalent to clicking the back arrow. If there are unsaved changes, shows "Unsaved changes" dialog first. |
| `1` through `9` | Switch Tab | Switches to the Nth tab on the detail page (e.g., `1` = first tab, `2` = second tab). |
| `Ctrl/Cmd + S` | Save | Saves changes when in edit mode. Disabled in view mode. |
| `Escape` | Cancel Edit | Exits edit mode without saving. If changes were made, shows "Discard changes?" dialog. |
| `Ctrl/Cmd + D` | Duplicate | Creates a copy of the current record (opens new form pre-filled with current data). |
| `Ctrl/Cmd + P` | Print | Opens print dialog for the current record. |
| `N` | Add Note | Opens the "Add Note" dialog on the activity feed/notes section. |
| `Ctrl/Cmd + Left Arrow` | Previous Record | Navigates to the previous record in the list (based on list order from parent page). |
| `Ctrl/Cmd + Right Arrow` | Next Record | Navigates to the next record in the list. |

---

## Dispatch Board Shortcuts

Active on the Dispatch Board screen, which has a unique layout for load assignment and management.

| Shortcut | Action | Description |
|----------|--------|-------------|
| `A` | Assign Carrier | Opens the carrier assignment dialog for the currently selected/focused load. |
| `D` | Dispatch | Dispatches the selected load (changes status to DISPATCHED). Shows confirmation if carrier is not yet confirmed. |
| `T` | Open Tracking | Opens the tracking view/panel for the selected load. Shows map with current position. |
| `C` | Add Check Call | Opens the "Add Check Call" dialog for the selected load. Pre-fills current timestamp. |
| `S` | Status Update | Opens the status update dropdown for the selected load. |
| `M` | Toggle Map | Shows or hides the map panel on the dispatch board. |
| `Tab` | Cycle Panels | Moves focus between dispatch board panels (unassigned loads, assigned loads, map). |
| `Ctrl/Cmd + F` | Find Load | Opens a quick-find dialog scoped to loads on the dispatch board. |
| `H` | Hold Load | Places the selected load on hold. Opens reason dialog. |
| `U` | Unassign Carrier | Removes the carrier assignment from the selected load. Requires confirmation. |

---

## Modal & Dialog Shortcuts

Active when any modal or dialog is open.

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Escape` | Close/Cancel | Closes the modal or dialog. For destructive confirmations, equivalent to clicking Cancel. |
| `Enter` | Confirm/Submit | Triggers the primary action button. Disabled for destructive confirmation dialogs (must click the button). |
| `Tab` | Next Field | Standard tab navigation between form fields. |
| `Shift + Tab` | Previous Field | Standard reverse-tab navigation. |

### Focus Trap
- When a modal is open, Tab/Shift+Tab cycles only within the modal
- Focus starts on the first interactive element in the modal
- Closing the modal returns focus to the element that triggered it

---

## Form Shortcuts

Active when filling out any form (create, edit, or filter forms).

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl/Cmd + S` | Save Form | Submits the form. Works from any field within the form. |
| `Escape` | Cancel/Close | Exits the form. If changes exist, shows "Discard changes?" dialog. |
| `Tab` | Next Field | Moves to the next form field in tab order. |
| `Shift + Tab` | Previous Field | Moves to the previous form field. |
| `Ctrl/Cmd + Z` | Undo | Standard undo within text inputs. |
| `Ctrl/Cmd + Shift + Z` | Redo | Standard redo within text inputs. |

---

## Keyboard Shortcut Help Overlay

Triggered by `Ctrl/Cmd + /` or `?` (outside of inputs).

### Layout

```
+------------------------------------------------------------+
|  Keyboard Shortcuts                              [X Close]  |
|                                                             |
|  [Global] [Navigation] [Lists] [Detail] [Dispatch]         |
|                                                             |
|  Global Shortcuts                                           |
|  -------------------------------------------------------   |
|  Ctrl+K     Open command palette                            |
|  Ctrl+/     Show this help                                  |
|  Ctrl+B     Toggle sidebar                                  |
|  Ctrl+N     Create new record                               |
|  Ctrl+S     Save                                            |
|  Esc        Close modal/drawer                              |
|                                                             |
|  Navigation                                                 |
|  -------------------------------------------------------   |
|  G then D   Go to Dashboard                                 |
|  G then O   Go to Orders                                    |
|  G then L   Go to Loads                                     |
|  ...                                                        |
|                                                             |
|  [Show all shortcuts]                                       |
+------------------------------------------------------------+
```

### Behavior
- Tabs at the top filter to shortcut category
- Search field to find specific shortcuts
- Close with Escape, X button, or clicking outside
- Remembers last viewed tab
- Dismissible "Tip: Press ? anytime to see shortcuts" tooltip shown to new users

---

## Shortcut Customization (Future Enhancement)

For future consideration:

- Allow users to remap shortcuts in Settings > Preferences > Keyboard Shortcuts
- Store custom mappings in user preferences (database)
- Provide "Reset to defaults" option
- Show conflicts when remapping (e.g., "This shortcut is already used for X")
- Export/import shortcut configurations

---

## Conflict Avoidance Reference

The following browser and OS shortcuts are intentionally avoided to prevent conflicts:

### Reserved - Do Not Override

| Shortcut | Browser/OS Function |
|----------|-------------------|
| `Ctrl/Cmd + T` | New tab |
| `Ctrl/Cmd + W` | Close tab |
| `Ctrl/Cmd + Q` | Quit browser (macOS) |
| `Ctrl/Cmd + L` | Focus address bar |
| `Ctrl/Cmd + R` | Reload page (we use `R` without modifier instead) |
| `Ctrl/Cmd + Tab` | Switch tabs |
| `Ctrl/Cmd + Shift + T` | Reopen closed tab |
| `F1` | Browser help |
| `F3` | Browser find |
| `F5` | Browser refresh |
| `F7` | Caret browsing |
| `F11` | Full screen |
| `F12` | DevTools |
| `Alt + F4` | Close window |
| `Alt + Left/Right` | Browser back/forward |
| `Ctrl/Cmd + F` | Browser find (we use `Ctrl/Cmd + F` only within dispatch board context) |

### Safe to Use

| Key Type | Notes |
|----------|-------|
| Single letters (when not in input) | Safe because they are disabled in input contexts |
| `Ctrl/Cmd + B` | Browser uses for bookmarks bar but this is rarely used; acceptable override |
| `Ctrl/Cmd + K` | Some browsers use for address bar search; widely accepted as command palette shortcut |
| `Ctrl/Cmd + S` | Browser save page; acceptable override in web apps |
| `Ctrl/Cmd + N` | Browser new window; acceptable override within the app context |

---

## Accessibility Considerations

- All actions accessible via keyboard shortcuts must also be accessible via mouse/touch
- Shortcuts are an enhancement, never the only way to perform an action
- Screen readers must announce available shortcuts in context (e.g., "Press E to edit")
- The shortcut help overlay must be fully accessible (proper heading structure, keyboard navigable)
- Users who rely on assistive technology may have conflicting shortcuts; the customization feature (future) will address this
- Visual shortcut hints on buttons (shown in tooltips) help with discoverability

---

## Quick Reference Card (Printable)

For users who want a physical reference:

```
ULTRA TMS - KEYBOARD SHORTCUTS QUICK REFERENCE
================================================

GLOBAL                     NAVIGATION (G + key)
------                     ----------
Ctrl+K  Command palette    G D  Dashboard
Ctrl+/  Shortcut help      G O  Orders
Ctrl+B  Toggle sidebar     G L  Loads
Ctrl+N  New record         G C  Carriers
Ctrl+S  Save               G T  Tracking
Esc     Close/dismiss      G S  Settings

LIST PAGES                 DETAIL PAGES
----------                 ------------
/       Search             E       Edit
F       Filters            Bksp    Go back
R       Refresh            1-9     Switch tab
Enter   Open row           Ctrl+P  Print
Space   Select row         N       Add note
Arrows  Navigate rows

DISPATCH BOARD
--------------
A  Assign carrier     T  Open tracking
D  Dispatch           C  Add check call
S  Status update      M  Toggle map
```
