# Command Palette

> Service: Dashboard Shell (01.1) | Wave: 1 | Priority: P1
> Route: /(dashboard)/_command (modal overlay, not a page route) | Status: **Not Started** | Type: Search / Modal
> Primary Personas: Maria (Dispatcher), James (Sales), Sarah (Ops Manager), Emily (AR Specialist)
> Roles with Access: All authenticated internal roles

---

## 1. Purpose & Business Context

**What this screen does:**
The Command Palette is a modal overlay triggered by Ctrl/Cmd + K (or clicking the search trigger in the header) that provides universal search and quick-action execution. Users can type to search across all entities (loads, orders, carriers, customers, quotes, invoices), navigate to any page, or execute commands (create new load, run report, toggle theme). It is modeled after the command palettes in Linear.app, VS Code, and Notion -- a power-user feature that dramatically accelerates daily workflows.

**Business problem it solves:**
Maria (Dispatcher) manages 50+ loads per day and needs to jump between loads, carriers, and orders rapidly. Without the command palette, she navigates via sidebar click > list page > filter/search > click result -- a 4-step process taking 10-15 seconds. With the command palette, she presses Cmd+K, types "L-4521", and lands on the load detail in under 3 seconds. James (Sales) uses it to find customers by name, jump to quotes, and execute "Create Quote" without navigating through the sidebar. For power users who interact with the system 50+ times per day, the command palette can save 30+ minutes daily.

**Key business rules:**
- Cmd/Ctrl + K opens the palette from any page (global keyboard shortcut)
- Search is debounced at 200ms with a minimum of 2 characters
- Results are categorized by entity type: Loads, Orders, Carriers, Customers, Quotes, Invoices, Pages, Commands
- Result ordering: exact matches first, then fuzzy matches, then pages/commands
- Search scope is limited to entities the user has permission to view (role-filtered server-side)
- Recent searches and recent items are persisted per user (last 10 of each)
- The palette must respond within 300ms (perceived) -- show cached/recent results immediately, then update with server results
- Pressing Escape or clicking outside closes the palette
- Selecting a result navigates to that entity and closes the palette
- The ">" prefix switches to command-only mode (filters out search results, shows only actions)
- Maximum 8 results shown per category; "Show all X results" link at bottom of each category

**Success metric:**
Power users (20+ daily interactions) adopt the command palette for 60% of their navigation within 30 days. Average search-to-navigation time under 3 seconds. Command palette usage becomes the #2 navigation method after sidebar clicks.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Any page | Press Ctrl/Cmd + K | None (palette opens as centered modal) |
| Any page (header) | Click search trigger in header bar | None |
| Any page | Press "/" when not in an input field (optional shortcut) | None |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Select load result (e.g., "L-2025-4521") | `loadId` via route navigation |
| Order Detail | Select order result | `orderId` |
| Carrier Detail | Select carrier result | `carrierId` |
| Customer Detail | Select customer result | `customerId` |
| Quote Detail | Select quote result | `quoteId` |
| Invoice Detail | Select invoice result | `invoiceId` |
| Any page | Select page result (e.g., "Dispatch Board") | Route navigation |
| Load Builder | Select "Create Load" command | None |
| Quote Builder | Select "Create Quote" command | None |
| Settings page | Select "Settings" or "Profile" command | None |
| Closed (no action) | Press Escape, click outside, or click X | None |

**Primary trigger:**
Maria presses Cmd+K, types "4521", sees "Load L-2025-4521 - In Transit - Acme Mfg to Dallas" as the top result, presses Enter, and lands on the load detail page. Total time: under 3 seconds.

**Success criteria (user completes the screen when):**
- User has found and selected the entity or command they were looking for
- Or user has dismissed the palette (Escape) and returned to their current page

---

## 3. Layout Blueprint

### Desktop Layout (Centered Modal)

```
+----------------------------------------------------------------------+
|  OVERLAY (semi-transparent dark backdrop)                             |
|                                                                       |
|         +--------------------------------------------------+         |
|         |  COMMAND PALETTE (640px wide, max 480px tall)     |         |
|         |                                                    |         |
|         |  [Q] Search loads, orders, carriers...   [Esc]    |         |
|         |  ================================================ |         |
|         |                                                    |         |
|         |  RECENT ITEMS (shown when input is empty)          |         |
|         |  ------------------------------------------------ |         |
|         |  [clock] L-2025-4521 - In Transit - Acme Mfg      |         |
|         |  [clock] Carrier: Swift Transport                  |         |
|         |  [clock] Quote Q-891 - Acme Manufacturing          |         |
|         |  [clock] Customer: Global Foods Inc                |         |
|         |  [clock] Dispatch Board (page)                     |         |
|         |                                                    |         |
|         |  QUICK ACTIONS                                     |         |
|         |  ------------------------------------------------ |         |
|         |  [+] Create Load                         Ctrl+N   |         |
|         |  [+] Create Quote                                  |         |
|         |  [+] Create Order                                  |         |
|         |  [gear] Settings                                   |         |
|         |  [moon] Toggle Dark Mode                           |         |
|         |                                                    |         |
|         +--------------------------------------------------+         |
|                                                                       |
+----------------------------------------------------------------------+
```

### Search Results Mode (after typing)

```
+--------------------------------------------------+
|  [Q] 4521                                  [Esc] |
|  ================================================|
|                                                   |
|  LOADS (3 results)                               |
|  -----------------------------------------------  |
|  [truck] L-2025-4521                             |
|          In Transit | Acme Mfg > Dallas, TX      |
|          Carrier: Swift Transport     [>>]       |
|  -----------------------------------------------  |
|  [truck] L-2025-3452                             |
|          Delivered | Global Foods > Phoenix, AZ   |
|          Carrier: Knight Logistics    [>>]       |
|  -----------------------------------------------  |
|  Show all 3 load results...                      |
|                                                   |
|  ORDERS (1 result)                               |
|  -----------------------------------------------  |
|  [clipboard] ORD-2025-4521                       |
|              Ready | Acme Manufacturing          |
|              2 stops, $3,200           [>>]       |
|  -----------------------------------------------  |
|                                                   |
|  PAGES (1 result)                                |
|  -----------------------------------------------  |
|  [layout] Loads List                             |
|           /(dashboard)/loads           [>>]       |
|  -----------------------------------------------  |
|                                                   |
+--------------------------------------------------+
```

### Command Mode (typing ">" prefix)

```
+--------------------------------------------------+
|  [>] create                                [Esc] |
|  ================================================|
|                                                   |
|  COMMANDS                                         |
|  -----------------------------------------------  |
|  [+] Create Load              /loads/new          |
|  [+] Create Order             /orders/new         |
|  [+] Create Quote             /quotes/new         |
|  [+] Create Invoice           /accounting/inv/new |
|  -----------------------------------------------  |
|                                                   |
+--------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Search input field, top result (highlighted for Enter) | User needs to type and see the best match instantly |
| **Secondary** (visible in results) | Entity type groupings, result metadata (status, customer, route) | Context helps user confirm they found the right entity |
| **Tertiary** (available but subtle) | Keyboard hints (Enter to select, Arrow keys to navigate, Esc to close) | Discoverability for power users |
| **Hidden** (behind interaction) | "Show all results" links, command mode (">" prefix) | Advanced features for power users |

---

## 4. Data Fields & Display

### Visible Fields -- Search Results

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Entity Icon | Derived from entity type | Lucide icon: Truck (load), ClipboardList (order), Building (carrier), Users (customer), FileText (quote), Receipt (invoice), Layout (page), Zap (command) | Left side of result row |
| 2 | Primary Label | Entity.displayId or name | "L-2025-4521" for loads, "Swift Transport" for carriers, "Acme Manufacturing" for customers | Top line of result |
| 3 | Secondary Info | Varies by entity type | Load: "In Transit | Acme Mfg > Dallas, TX". Carrier: "MC-123456 | 4.8 rating". Customer: "$125K revenue YTD" | Second line, gray-500 |
| 4 | Tertiary Info | Varies | Load: "Carrier: Swift Transport". Order: "2 stops, $3,200". Quote: "Pending | $2,450" | Third line or inline, gray-400 |
| 5 | Category Header | Derived from result type | "LOADS (3 results)", "CARRIERS (1 result)" | Section header |
| 6 | Keyboard Hint | Static | Up/Down arrow indicators on focused row | Right side of focused result |
| 7 | Shortcut Badge | Static for commands | "Ctrl+N" for Create, etc. | Right side of command items |

### Visible Fields -- Recent Items

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Clock Icon | Static | Small clock icon in gray-400 | Left side |
| 2 | Item Label | Cached from previous visits | "L-2025-4521 - In Transit - Acme Mfg" | Main text |
| 3 | Item Type | Cached | Subtle badge or icon indicating entity type | Right or inline |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Search Match Highlighting | Bold the portion of text that matches the search query | `<mark>` or bold span on matching characters |
| 2 | Result Ranking | Exact ID match (highest) > starts-with match > contains match > fuzzy match | Ordered list |
| 3 | Filtered Commands | Only show commands the user has permission to execute | Filtered command list |
| 4 | Recent Items | Last 10 unique entity detail pages visited by the user (stored in localStorage + Zustand) | Ordered by recency |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Modal overlay triggered by Ctrl/Cmd + K from any page
- [ ] Search input with auto-focus and placeholder text
- [ ] Debounced search (200ms) with minimum 2-character threshold
- [ ] Multi-entity search: loads, orders, carriers, customers, quotes, invoices
- [ ] Results grouped by entity type with category headers
- [ ] Keyboard navigation: Arrow Up/Down to move between results, Enter to select
- [ ] Click result to navigate to entity detail page
- [ ] Escape to close, click outside to close
- [ ] Recent items shown when input is empty (last 10 visited entities)
- [ ] Quick actions/commands shown when input is empty (Create Load, Create Quote, etc.)
- [ ] Command mode with ">" prefix (filters to commands only)
- [ ] Role-based result filtering (only show entities user can access)
- [ ] Search result highlighting (bold matching text)

### Advanced Features (Enhancement Recommendations)

- [ ] **Fuzzy search** -- Tolerate typos: "swif transport" matches "Swift Transport"
- [ ] **Entity-prefixed search** -- "load:" prefix to search only loads, "carrier:" for carriers
- [ ] **Recent searches** -- Show last 10 search queries (persisted in localStorage)
- [ ] **Search analytics** -- Track what users search for most to improve result ranking
- [ ] **Inline preview** -- Show a mini-preview card when hovering over a result (load status, carrier rating, etc.)
- [ ] **Page navigation shortcuts** -- Type page names ("dispatch board", "tracking map") to navigate directly
- [ ] **Multi-select** -- Select multiple results to open in tabs (future)
- [ ] **Voice search** -- Microphone icon for voice input (future accessibility enhancement)
- [ ] **Search suggestions** -- "Did you mean..." for common misspellings
- [ ] **Bookmarkable searches** -- Save a search as a favorite for one-click repeat
- [ ] **Tab to complete** -- Tab key auto-completes the top suggestion

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Load search results | dispatcher, ops_manager, admin, super_admin | `load_view` | Load results not returned from API |
| Order search results | dispatcher, ops_manager, admin, sales_agent, super_admin | `order_view` | Order results not returned |
| Carrier search results | dispatcher, ops_manager, carrier_manager, admin, super_admin | `carrier_view` | Carrier results not returned |
| Customer search results | sales_agent, sales_manager, ops_manager, admin, super_admin | `customer_view` | Customer results not returned |
| Quote search results | sales_agent, sales_manager, admin, super_admin | `quote_view` | Quote results not returned |
| Invoice search results | accounting_clerk, accounting_manager, admin, super_admin | `invoice_view` | Invoice results not returned |
| "Create Load" command | dispatcher, ops_manager, admin | `load_create` | Command not shown |
| "Create Quote" command | sales_agent, sales_manager, admin | `quote_create` | Command not shown |
| "Create Invoice" command | accounting_clerk, accounting_manager, admin | `invoice_create` | Command not shown |
| "Settings" command | admin, super_admin | `admin_access` | Command not shown |

---

## 6. Status & State Machine

### Command Palette States

```
[Closed] ---(Ctrl+K or click search)---> [Open / Empty]
                                               |
                                    (user starts typing)
                                               |
                                               v
                                         [Searching...]
                                               |
                                    +----------+----------+
                                    |                     |
                              (results found)      (no results)
                                    |                     |
                                    v                     v
                              [Results Shown]      [Empty Results]
                                    |                     |
                              (select result)      (modify query)
                                    |                     |
                                    v                     |
                              [Navigate +          (back to Searching)
                               Close Palette]

                              At any point:
                              [Escape / Click Outside] ---> [Closed]
```

### Search Input States

| State | Visual | Behavior |
|---|---|---|
| Empty (just opened) | Placeholder: "Search loads, orders, carriers..." | Show recent items + quick actions |
| Typing (< 2 chars) | User input visible, no search triggered | Still show recent items (search needs 2+ chars) |
| Searching (2+ chars) | User input + loading spinner in search icon | Debounce 200ms, then fire API call |
| Results loaded | User input + results list below | Navigate with arrows, Enter to select |
| No results | User input + "No results for [query]" message | Suggest checking spelling or trying different terms |
| Command mode | ">" prefix + command filter | Only show commands matching text after ">" |

### Result Item States

| State | Background | Text | Border |
|---|---|---|---|
| Default | transparent | gray-900 title, gray-500 subtitle | none |
| Focused (keyboard) | blue-50 | gray-900 title, gray-500 subtitle | 2px blue-500 left border |
| Hover (mouse) | gray-50 | gray-900 title, gray-500 subtitle | none |
| Selected (Enter/click) | blue-100 (brief flash before navigation) | -- | -- |

---

## 7. Actions & Interactions

### Primary Actions

| Action | Trigger | Result |
|---|---|---|
| Open palette | Ctrl/Cmd + K, or click header search | Modal opens, input focused |
| Search | Type 2+ characters | Debounced API search, results populate |
| Select result | Arrow Down/Up to focus, then Enter; or click | Navigate to entity/page, close palette |
| Enter command mode | Type ">" as first character | Filter to commands only |
| Close palette | Escape, click outside, or click X | Modal closes, return to previous page |
| Clear input | Click X in input, or select all + delete | Return to recent items view |

### Keyboard Shortcuts (within palette)

| Shortcut | Action |
|---|---|
| `Arrow Down` | Move focus to next result |
| `Arrow Up` | Move focus to previous result |
| `Enter` | Select/activate focused result (navigate or execute command) |
| `Escape` | Close palette |
| `Ctrl/Cmd + K` (while open) | Close palette (toggle behavior) |
| `Tab` | Move focus to next result (same as Arrow Down) |
| `Ctrl/Cmd + Backspace` | Clear search input |

### Mouse Interactions

| Element | Click Behavior | Hover Behavior |
|---|---|---|
| Search input | Focus cursor | N/A |
| Clear (X) button in input | Clear search text | Cursor pointer |
| Result item | Navigate to entity, close palette | Background highlight (gray-50) |
| "Show all X results" link | Navigate to full search page with query pre-filled | Text underline |
| Category header | No action (decorative) | No change |
| Backdrop overlay | Close palette | No change |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop in command palette |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| N/A | -- | Command palette does not subscribe to WebSocket events directly. Search results are always fresh API calls. |

### Live Update Behavior

- **Update frequency:** Each search query triggers a fresh API call. No live updates while viewing results.
- **Visual indicator:** Small loading spinner replaces the search icon while API is in-flight.
- **Conflict handling:** If user types faster than the API responds, only the most recent query's results are displayed (stale responses are discarded via AbortController).

### Polling Fallback

- Not applicable. Command palette uses on-demand search requests, not polling.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Select result (navigate) | Immediately close palette and start navigation | If navigation fails, show toast "Unable to navigate to [destination]" |
| Add to recent items | Immediately prepend to recent items list (localStorage) | N/A (local-only operation) |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `Command` | `src/components/ui/command.tsx` | shadcn/cmdk command component (built on cmdk library) |
| `Dialog` | `src/components/ui/dialog.tsx` | shadcn dialog for modal overlay |
| `Input` | `src/components/ui/input.tsx` | Search input styling |
| `Badge` | `src/components/ui/badge.tsx` | Keyboard shortcut badges |
| `ScrollArea` | `src/components/ui/scroll-area.tsx` | Results list scroll |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `Command` (shadcn) | Basic cmdk wrapper | Needs custom styling, multi-category support, recent items, command mode |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `CommandPalette` | Main container managing open/close state and API integration | Large |
| `CommandPaletteInput` | Search input with icon, clear button, and loading spinner | Small |
| `CommandPaletteResults` | Categorized result list with keyboard navigation | Large |
| `CommandPaletteGroup` | Category group header with result count | Small |
| `CommandPaletteItem` | Individual result item with icon, text, metadata, and highlight | Medium |
| `CommandPaletteRecent` | Recent items section shown when input is empty | Small |
| `CommandPaletteActions` | Quick actions/commands section | Small |
| `CommandPaletteEmpty` | Empty state when no results match | Small |
| `CommandPaletteFooter` | Footer with keyboard hints (arrows, enter, esc) | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Command | `command` | Core command palette (cmdk-based) |
| Dialog | `dialog` | Modal overlay container |
| Scroll Area | `scroll-area` | Scrollable results area |
| Badge | `badge` | Keyboard shortcut hints |
| Separator | `separator` | Category dividers |

### External Library

| Library | Version | Purpose |
|---|---|---|
| `cmdk` | 1.0+ | Underlying command menu primitives (fast, accessible, composable) |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | `/api/search` | Global search across all entities | `useGlobalSearch(query)` |
| 2 | GET | `/api/search/recent` | Get user's recent search items | `useRecentSearches()` |
| 3 | POST | `/api/search/recent` | Save a recent search item | `useSaveRecentSearch()` |
| 4 | GET | `/api/commands` | Get available commands for current user's role | `useAvailableCommands()` |

### Request/Response Examples

**GET /api/search?q=4521&limit=5**
```json
{
  "query": "4521",
  "results": {
    "loads": [
      {
        "id": "load-abc-123",
        "displayId": "L-2025-4521",
        "title": "L-2025-4521",
        "subtitle": "In Transit | Acme Manufacturing > Dallas, TX",
        "metadata": "Carrier: Swift Transport | ETA: Today 5:00 PM",
        "url": "/loads/load-abc-123",
        "icon": "truck",
        "matchScore": 100
      }
    ],
    "orders": [
      {
        "id": "order-xyz-789",
        "displayId": "ORD-2025-4521",
        "title": "ORD-2025-4521",
        "subtitle": "Ready | Acme Manufacturing",
        "metadata": "2 stops | $3,200",
        "url": "/orders/order-xyz-789",
        "icon": "clipboard-list",
        "matchScore": 100
      }
    ],
    "carriers": [],
    "customers": [],
    "quotes": [],
    "invoices": [],
    "pages": [
      {
        "id": "page-loads",
        "title": "Loads List",
        "subtitle": "/(dashboard)/loads",
        "url": "/loads",
        "icon": "layout",
        "matchScore": 40
      }
    ]
  },
  "totalResults": 3,
  "searchTimeMs": 45
}
```

**GET /api/commands**
```json
{
  "commands": [
    { "id": "create-load", "label": "Create Load", "icon": "plus", "url": "/loads/new", "shortcut": "Ctrl+N", "category": "create" },
    { "id": "create-order", "label": "Create Order", "icon": "plus", "url": "/orders/new", "category": "create" },
    { "id": "create-quote", "label": "Create Quote", "icon": "plus", "url": "/quotes/new", "category": "create" },
    { "id": "go-dispatch", "label": "Go to Dispatch Board", "icon": "layout-grid", "url": "/dispatch", "shortcut": "G P", "category": "navigate" },
    { "id": "go-tracking", "label": "Go to Tracking Map", "icon": "map-pin", "url": "/tracking", "shortcut": "G T", "category": "navigate" },
    { "id": "toggle-theme", "label": "Toggle Dark Mode", "icon": "moon", "action": "toggleTheme", "category": "settings" },
    { "id": "open-settings", "label": "Settings", "icon": "settings", "url": "/admin/settings", "shortcut": "G S", "category": "settings" },
    { "id": "open-shortcuts", "label": "Keyboard Shortcuts", "icon": "keyboard", "action": "openShortcuts", "shortcut": "Ctrl+/", "category": "help" }
  ]
}
```

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| N/A | N/A | Command palette does not use WebSocket. All data is fetched on-demand via REST. |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/search | Show "Invalid search query" | Close palette, redirect to login | Show only permitted results (server handles) | Show no results | Show "Search unavailable. Try again." with retry icon |
| GET /api/commands | Show default commands from local config | Close palette, redirect to login | Show filtered commands | Show default commands | Show default commands from local config |
| GET /api/search/recent | Show empty recent list | Close palette | Show empty list | Show empty list | Show empty list (silent fail) |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Not applicable -- the palette opens instantly from client-side state. Search results area shows a subtle loading spinner (replaces search icon) while API is in-flight.
- **Progressive loading:** Recent items show immediately from localStorage cache. Commands load from cache or API. Search results load after debounce + API response.
- **Duration threshold:** If search takes > 1 second, show "Searching..." text below the input.

### Empty States

**No input (palette just opened):**
- Show "Recent Items" section (if any) with clock icons
- Show "Quick Actions" section below recent items
- Footer: "Type to search... | Use > for commands | Esc to close"

**No recent items (first-time user):**
- Hide "Recent Items" section entirely
- Show "Quick Actions" section only
- Show tip: "Start typing to search across loads, orders, carriers, and more"

**No results for search query:**
- **Illustration:** Small magnifying glass icon with "?"
- **Headline:** "No results for '[query]'"
- **Description:** "Try a different search term or check the spelling."
- **Suggestions:** "Search tips: Use load numbers (L-2025-), carrier names, or customer names"

**No commands matching ">" query:**
- **Headline:** "No commands matching '[query]'"
- **Description:** "Try a different command name."

### Error States

**Search API error:**
- **Display:** Show "Search is temporarily unavailable" with a small retry icon button in the results area. Recent items and commands still work (local/cached).

**Network error (offline):**
- **Display:** Show "You're offline. Showing recent items only." Recent items from localStorage are available. Search API calls fail silently.

### Permission Denied

- Not applicable at the palette level. Permission filtering happens server-side -- the API only returns entities the user can access. Commands are filtered by role before rendering.

### Offline / Degraded

- **Full offline:** Palette opens. Recent items shown from localStorage. Commands shown from cached config. Search input shows "Search unavailable offline" as placeholder. No API calls made.
- **Degraded:** Palette works normally. Slower API responses are handled by the debounce + loading spinner.

---

## 12. Filters, Search & Sort

### Search Behavior

- **Search field:** Single input at the top of the palette (auto-focused on open)
- **Searches across:** Load numbers, order numbers, carrier names, carrier MC numbers, customer names, contact names, quote numbers, invoice numbers, page names, command labels
- **Behavior:** Debounced at 200ms. Minimum 2 characters. Bold/highlight matching text in results. AbortController cancels stale requests.
- **Server-side search:** Full-text search with relevance scoring. Exact ID matches ranked highest.

### Search Prefixes (Power User Feature)

| Prefix | Searches Only | Example |
|---|---|---|
| (no prefix) | All entity types + pages + commands | "swift" searches everywhere |
| `load:` or `l:` | Loads only | "l:4521" |
| `order:` or `o:` | Orders only | "o:acme" |
| `carrier:` or `c:` | Carriers only | "c:swift" |
| `customer:` or `cu:` | Customers only | "cu:global foods" |
| `quote:` or `q:` | Quotes only | "q:891" |
| `invoice:` or `i:` | Invoices only | "i:0412" |
| `>` | Commands only | ">create" |
| `@` | Pages / navigation only | "@dispatch" |

### Sort Options

- Results are sorted by relevance score (exact match > starts-with > contains > fuzzy)
- Within the same relevance tier, sort by recency (most recently updated first)
- Categories are displayed in fixed order: Loads, Orders, Carriers, Customers, Quotes, Invoices, Pages, Commands

### Saved Filters / Presets

- Not applicable for the command palette in MVP
- Recent searches serve as implicit "saved searches"

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Palette width reduces to 560px (from 640px)
- Same functionality as desktop
- Results may show slightly less metadata (truncate subtitle)

### Mobile (< 768px)

- Palette opens as a **full-screen overlay** (not a centered modal)
- Search input at the top with close (X) button
- Results list takes full screen width
- Larger touch targets (56px per result item minimum)
- Virtual keyboard appears when palette opens (input auto-focused)
- Results scroll within the full-screen container
- Footer keyboard hints hidden (not relevant on touch devices)

### Breakpoint Reference

| Breakpoint | Width | Palette Behavior |
|---|---|---|
| Desktop XL | 1440px+ | Centered modal, 640px wide, max 480px tall |
| Desktop | 1024px - 1439px | Centered modal, 640px wide |
| Tablet | 768px - 1023px | Centered modal, 560px wide |
| Mobile | < 768px | Full-screen overlay |

---

## 14. Stitch Prompt

```
Design a command palette / search modal for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." Show it as a centered modal overlay on top of a dimmed application background.

Modal Container:
- Centered on screen, 640px wide, max-height 480px with scrollable results area.
- White background, rounded-xl, shadow-2xl, border gray-200.
- Semi-transparent dark overlay (rgba(0,0,0,0.4)) behind the modal on the rest of the screen.

Search Input (top of modal):
- Full-width input inside the modal, 48px tall.
- Left side: magnifying glass icon (gray-400, 20px).
- Input text: "4521" typed by the user in 16px gray-900 Inter font.
- Right side: "ESC" keyboard badge (gray-200 background, gray-500 text, rounded, 11px) and a small X clear button.
- Bottom border: 1px gray-200 separating input from results.

Results Area (scrollable):

Category 1: "LOADS" header in 11px uppercase bold gray-400 tracking-wide, with "(2 results)" count.

Result 1 (focused/selected state):
- Background: blue-50, 2px blue-500 left border.
- Left: truck icon (blue-600, 20px).
- Title: "L-2025-**4521**" with "4521" in bold (search match highlighting) in 14px gray-900.
- Subtitle: "In Transit | Acme Manufacturing > Dallas, TX" in 13px gray-500.
- Metadata: "Carrier: Swift Transport | ETA: Today 5:00 PM" in 12px gray-400.
- Right: small right-arrow icon (gray-300) indicating this is navigable.

Result 2 (default state):
- Background: transparent.
- Truck icon (gray-400).
- "L-2025-3**452**1" with "4521" highlighted.
- "Delivered | Global Foods > Phoenix, AZ" in gray-500.
- "Carrier: Knight Logistics" in gray-400.

Category 2: "ORDERS" header.

Result 3:
- Clipboard-list icon (gray-400).
- "ORD-2025-**4521**" with match highlighting.
- "Ready | Acme Manufacturing" in gray-500.
- "2 stops | $3,200.00" in gray-400.

Category 3: "PAGES" header.

Result 4:
- Layout icon (gray-400).
- "Loads List" in 14px gray-900.
- "/(dashboard)/loads" in 12px gray-400.

Footer (fixed at bottom of modal):
- Light gray-50 background, 40px tall.
- Left: "Enter to select" with small Enter key icon. "Arrow keys to navigate" with up/down arrow icons.
- Right: "Esc to close" with Esc key badge.
- All footer text in 12px gray-400 with gray-200 key badges.

Design Specifications:
- Modal: white background, rounded-xl, shadow-2xl, max-width 640px, max-height 480px
- Overlay: rgba(0,0,0,0.4) backdrop
- Font: Inter, 16px input, 14px result titles, 13px subtitles, 12px metadata, 11px category headers
- Search match highlighting: bold text on matching characters (not background highlight)
- Focused result: bg-blue-50 with 2px blue-500 left border
- Hover result: bg-gray-50
- Icons: gray-400 default, blue-600 for focused result icon
- Category headers: uppercase, tracking-wide, gray-400, 11px
- Keyboard badges: gray-200 bg, gray-500 text, rounded-md, 11px, px-1.5 py-0.5
- Transition: 150ms ease-out for focus changes
- Scrollbar: thin 6px custom scrollbar, gray-200, rounded
- Modern SaaS aesthetic matching Linear.app or Raycast command palette

Include: Dimmed background overlay, modal with search input showing "4521" typed, 4 results across 3 categories (Loads, Orders, Pages), first result focused/highlighted, footer with keyboard hints.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] shadcn/ui `command` component is installed (cmdk-based)
- [x] Ctrl/Cmd + K keyboard shortcut is defined in keyboard shortcuts map

**What needs polish / bug fixes:**
- [ ] Command palette has no implementation -- the shortcut is defined but nothing renders
- [ ] No search API endpoint exists
- [ ] No recent items tracking
- [ ] No command registry

**What to add this wave:**
- [ ] Build CommandPalette component using shadcn command + dialog
- [ ] Implement Ctrl/Cmd + K global keyboard shortcut to open/close
- [ ] Build global search API endpoint (`/api/search`) searching across all entity types
- [ ] Implement debounced search with AbortController for stale request cancellation
- [ ] Build categorized result list with entity type groupings
- [ ] Add keyboard navigation (arrow keys, Enter, Escape)
- [ ] Track and display recent items from localStorage (last 10 visited entities)
- [ ] Build quick actions/commands list filtered by user role
- [ ] Implement ">" command mode prefix
- [ ] Add search result highlighting (bold matching text)
- [ ] Add footer with keyboard navigation hints
- [ ] Build mobile full-screen variant

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Command palette modal with search input | High | Medium | P0 |
| Global search API endpoint | High | High | P0 |
| Categorized search results | High | Medium | P0 |
| Keyboard navigation (arrows, Enter, Esc) | High | Low | P0 |
| Ctrl/Cmd + K global shortcut | High | Low | P0 |
| Recent items from localStorage | Medium | Low | P0 |
| Quick actions / commands list | Medium | Medium | P1 |
| Search match highlighting | Medium | Low | P1 |
| ">" command mode prefix | Medium | Low | P1 |
| Entity-prefixed search (load:, carrier:) | Medium | Medium | P1 |
| Footer keyboard hints | Low | Low | P1 |
| Fuzzy search tolerance | Medium | Medium | P2 |
| Inline preview on hover | Low | High | P2 |
| Search analytics tracking | Low | Medium | P2 |
| Voice search | Low | High | P2 (future) |

### Future Wave Preview

- **Wave 2:** Fuzzy search, entity-prefixed search (load:, carrier:), search suggestions and autocomplete
- **Wave 3:** Inline entity previews (hover card with status, details), saved/bookmarked searches, search history
- **Wave 4:** AI-powered search ("show me all late loads for Acme"), natural language queries, contextual command suggestions based on current page
- **Wave 5:** Cross-tenant search (super_admin), federated search across external systems (DAT, FMCSA), voice input

---

## Search Entity Configuration Reference

### Searchable Fields by Entity Type

| Entity Type | Searchable Fields | Display Format |
|---|---|---|
| **Loads** | loadNumber, customerName, carrierName, originCity, destCity, referenceNumbers | "L-2025-4521 | In Transit | Acme > Dallas" |
| **Orders** | orderNumber, customerName, originCity, destCity, poNumber | "ORD-2025-1234 | Ready | Acme Manufacturing" |
| **Carriers** | companyName, mcNumber, dotNumber, contactName, city | "Swift Transport | MC-123456 | Dallas, TX" |
| **Customers** | companyName, contactName, email, phone, accountNumber | "Acme Manufacturing | Account #A-1001" |
| **Quotes** | quoteNumber, customerName, originCity, destCity | "Q-891 | Pending | Acme | CHI > DAL" |
| **Invoices** | invoiceNumber, customerName, loadNumber, amount | "INV-2025-0412 | $4,200 | Global Foods" |
| **Pages** | pageTitle, pageRoute | "Dispatch Board | /dispatch" |
| **Commands** | commandLabel, commandDescription | "Create Load | /loads/new" |

---

*This document was created as part of the Wave 1 design process for Ultra TMS Dashboard Shell service (01.1).*
