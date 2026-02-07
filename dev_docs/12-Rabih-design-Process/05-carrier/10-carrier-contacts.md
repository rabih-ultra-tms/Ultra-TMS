# Carrier Contacts

> Service: Carrier Management | Wave: 3 | Priority: P1
> Route: /(dashboard)/carriers/[id]/contacts | Status: Not Started
> Primary Personas: Omar (Dispatcher/Operations), Sarah (Ops Manager)
> Roles with Access: dispatcher, operations_manager, admin

---

## 1. Purpose & Business Context

**What this screen does:**
Manages the contact directory for a specific carrier, allowing dispatchers and operations staff to view, add, edit, and organize contacts by role type (primary, dispatch, billing, after-hours). Each contact includes full communication details, language preferences, and configurable notification preferences for rate confirmations, POD requests, and payment notices.

**Business problem it solves:**
In freight brokerage, the wrong contact can cost hours. A dispatcher calls the carrier's main office to get a delivery status update, only to be told "you need to call our dispatch line." The billing department sends payment remittance to the dispatch email, and it gets ignored. After-hours emergencies go unanswered because nobody knows the after-hours number. This screen ensures that every carrier has clearly designated contacts for each operational function, with direct phone and email, so the right person is reached on the first attempt. Additionally, language preferences (English/Spanish are the dominant languages in US trucking) prevent communication breakdowns with Spanish-speaking drivers and dispatchers. Brokerages that maintain structured carrier contacts report 40% fewer missed calls and a 25% reduction in communication-related delays.

**Key business rules:**
- Every carrier must have at least one PRIMARY contact (enforced on carrier creation).
- A carrier can have at most one contact per role type (PRIMARY, DISPATCH, BILLING, AFTER_HOURS), but can have multiple general contacts.
- The DISPATCH contact receives rate confirmations and load tenders by default.
- The BILLING contact receives payment remittance and invoice-related communications by default.
- Communication preferences (receives_rate_confirms, receives_pod_requests, receives_payments) can be overridden per contact.
- Phone numbers must be validated as US format (10 digits) or international with country code.
- Email addresses must be valid and unique within the carrier's contact list.
- Contact deletion is a soft delete -- contacts are deactivated, not permanently removed, to preserve communication history.

**Success metric:**
First-contact resolution rate increases from 60% to 90% (dispatcher reaches the right person on the first try). Average time to reach a carrier contact for load-related communication drops from 8 minutes to under 2 minutes.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Click "Contacts" tab or "View Contacts" button | carrierId, carrier name |
| Dispatch Board | Click carrier name > "Call Dispatch" or "Email Dispatch" | carrierId, role: DISPATCH |
| Load Detail | Click "Contact Carrier" button on assigned carrier section | carrierId, loadId (for context) |
| Carrier Onboarding | Step: "Add Contacts" in onboarding wizard | carrierId (new carrier) |
| Direct URL | Bookmark / shared link | Route params |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Click breadcrumb or "Back to Carrier" | carrierId |
| Compose Email | Click email address on contact card | pre-filled to: email, carrier context |
| SMS Compose | Click mobile number "Send SMS" action | pre-filled to: mobile number |
| Communication Log | Click "View Communication History" on contact card | carrierId, contactId |

**Primary trigger:**
Omar the dispatcher has just booked a load with TransWest Logistics and needs to send the rate confirmation. He opens Carrier Contacts to verify the dispatch contact email and send the document. Alternatively, Sarah the Ops Manager is updating carrier contacts during a quarterly carrier review.

**Success criteria (user completes the screen when):**
- User has found the correct contact for their communication need (dispatch, billing, after-hours).
- User has initiated communication (clicked email, clicked phone number) with the right person.
- User has added or updated contact information as needed.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Carriers > TransWest Logistics > Contacts            |
+------------------------------------------------------------------+
|  Header: "Contacts - TransWest Logistics"                          |
|  4 contacts                                   [+ Add Contact]     |
+------------------------------------------------------------------+
|  Role Quick-Access Bar (4 colored cards, horizontal)               |
|  +----------+ +----------+ +----------+ +----------+              |
|  | PRIMARY  | | DISPATCH | | BILLING  | |AFTER-HRS |              |
|  | John S.  | | Maria G. | | Lisa T.  | | Dispatch |              |
|  | [Call]   | | [Call]   | | [Email]  | | Line     |              |
|  | [Email]  | | [Email]  | |          | | [Call]   |              |
|  +----------+ +----------+ +----------+ +----------+              |
+------------------------------------------------------------------+
|  Contact Cards Grid (2 columns, one card per contact)              |
|  +---------------------------+  +-------------------------------+ |
|  | [JS] John Smith           |  | [MG] Maria Garcia              ||
|  | Owner / PRIMARY           |  | Dispatch Manager / DISPATCH     ||
|  | +1 (214) 555-0101 [call]  |  | +1 (214) 555-0102 [call]       ||
|  | +1 (214) 555-0199 mobile  |  | +1 (214) 555-0198 mobile       ||
|  | john@transwest.com [mail] |  | maria@transwest.com [mail]      ||
|  | [EN flag] English         |  | [ES flag] Spanish / English     ||
|  | -------------------------  |  | -------------------------        ||
|  | Receives:                 |  | Receives:                        ||
|  | [x] Rate Confirmations    |  | [x] Rate Confirmations           ||
|  | [x] POD Requests          |  | [x] POD Requests                 ||
|  | [ ] Payment Notices       |  | [ ] Payment Notices              ||
|  | -------------------------  |  | -------------------------        ||
|  | Last contacted: 01/12/26  |  | Last contacted: 01/14/26         ||
|  | [Edit] [Remove]           |  | [Edit] [Remove]                  ||
|  +---------------------------+  +-------------------------------+ |
|                                                                    |
|  +---------------------------+  +-------------------------------+ |
|  | [LT] Lisa Tran            |  | [--] Dispatch Line (After Hrs)  ||
|  | Accounts Payable / BILLING|  | After Hours / AFTER_HOURS        ||
|  | +1 (214) 555-0103 [call]  |  | +1 (800) 555-0100 [call]        ||
|  | lisa@transwest.com [mail] |  | afterhours@transwest.com         ||
|  | [EN flag] English         |  | [EN flag] English                ||
|  | -------------------------  |  | -------------------------        ||
|  | Receives:                 |  | Receives:                        ||
|  | [ ] Rate Confirmations    |  | [ ] Rate Confirmations           ||
|  | [ ] POD Requests          |  | [ ] POD Requests                 ||
|  | [x] Payment Notices       |  | [x] Payment Notices              ||
|  | -------------------------  |  | -------------------------        ||
|  | Last contacted: 01/08/26  |  | Last contacted: 12/22/25         ||
|  | [Edit] [Remove]           |  | [Edit] [Remove]                  ||
|  +---------------------------+  +-------------------------------+ |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Contact name, role type badge (PRIMARY/DISPATCH/BILLING/AFTER_HOURS), phone number (clickable), email (clickable) | Dispatchers need to find the right person and initiate contact immediately |
| **Secondary** (visible on card) | Title/position, mobile number, language preference, communication preferences checkboxes | Important context for how to reach them and what they handle |
| **Tertiary** (bottom of card) | Last contacted date, contact activity log summary | Useful for knowing if this contact is still active/responsive |
| **Hidden** (behind click) | Full communication history, edit form, contact creation timestamp, audit log | Management and investigation actions |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Avatar | Generated from initials | 40px circle with carrier brand color background, white initials (e.g., "JS") | Card top-left |
| 2 | Full Name | CarrierContact.firstName + CarrierContact.lastName | Text, 16px medium weight | Card header |
| 3 | Title | CarrierContact.title | Text, 14px, gray-500 | Below name |
| 4 | Role Type | CarrierContact.roleType | Colored badge: PRIMARY (indigo), DISPATCH (blue), BILLING (green), AFTER_HOURS (amber) | Inline with title |
| 5 | Phone | CarrierContact.phone | "+1 (XXX) XXX-XXXX" formatted, clickable (tel: link), phone icon | Card body |
| 6 | Mobile | CarrierContact.mobile | "+1 (XXX) XXX-XXXX" formatted, clickable, mobile icon | Card body |
| 7 | Email | CarrierContact.email | Email address, clickable (mailto: link), mail icon | Card body |
| 8 | Preferred Language | CarrierContact.preferredLanguage | Small flag icon + language name: EN (US flag), ES (Mexico/Spain flag) | Card body |
| 9 | Receives Rate Confirms | CarrierContact.receivesRateConfirms | Checkbox indicator (read-only on card, editable in edit mode) | Preferences section |
| 10 | Receives POD Requests | CarrierContact.receivesPodRequests | Checkbox indicator | Preferences section |
| 11 | Receives Payments | CarrierContact.receivesPayments | Checkbox indicator | Preferences section |
| 12 | Last Contacted | CarrierContact.lastContactedAt | "MM/DD/YYYY" relative format; "Never" if null | Card footer |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Last Contacted | Most recent communication log entry (email sent, call logged) for this contact | Relative date ("2 days ago") or absolute date |
| 2 | Communication Count | COUNT of communication log entries for this contact in last 30 days | Integer, shown as "X interactions this month" on hover |
| 3 | Contact Completeness | Percentage of fields filled (name, phone, mobile, email, language) | Used to flag incomplete contacts (amber warning if <80%) |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Display all carrier contacts in card-based layout (2-column grid)
- [ ] Role quick-access bar showing one card per role type (PRIMARY, DISPATCH, BILLING, AFTER_HOURS) with direct call/email buttons
- [ ] Add new contact via modal form (name, title, role type, phone, mobile, email, language, communication preferences)
- [ ] Edit existing contact via modal form
- [ ] Remove (soft-delete) contact with confirmation
- [ ] Set primary contact designation
- [ ] Set dispatch contact (receives rate confirmations)
- [ ] Set billing contact (receives payments)
- [ ] Click-to-call phone numbers (tel: link)
- [ ] Click-to-email addresses (mailto: link)
- [ ] Language preference display with flag icon (EN/ES)
- [ ] Communication preference checkboxes (rate confirms, POD requests, payments)

### Advanced Features (Logistics Expert Recommendations)

- [ ] Contact activity log: click a contact to see timeline of all communications (emails sent, calls logged, SMS messages) with timestamps and content previews
- [ ] Quick SMS: click mobile number to open SMS compose pre-filled with contact number
- [ ] Contact import from carrier onboarding data or FMCSA lookup results
- [ ] Duplicate detection: warn if adding a contact with an email or phone already in the system (for another carrier)
- [ ] Contact completeness indicator: amber warning badge on contacts missing key fields (no email, no mobile)
- [ ] Preferred communication channel indicator: mark whether contact prefers phone, email, or SMS
- [ ] "Copy all contacts" action to quickly copy phone numbers and emails to clipboard for pasting into external tools
- [ ] Contact photo upload (optional, for recognition)
- [ ] VoIP integration: initiate calls directly from the TMS (if phone system is integrated)

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Add contact | dispatcher, admin | carrier_manage | "+ Add Contact" button hidden |
| Edit contact | dispatcher, admin | carrier_manage | "Edit" button hidden on cards |
| Remove contact | admin | carrier_manage | "Remove" button hidden |
| View phone numbers | any authenticated | carrier_view | Phone numbers visible to all with carrier access |
| View communication log | dispatcher, operations_manager, admin | communication_view | "Last contacted" link non-clickable |

---

## 6. Status & State Machine

### Status Transitions (Contact)

```
[No Contact] ---(Add Contact)---> [ACTIVE]

[ACTIVE] ---(Soft Delete / Remove)---> [INACTIVE]

[INACTIVE] ---(Reactivate)---> [ACTIVE]
```

Note: Contacts are simple entities with minimal status management. The focus is on role type assignment rather than status lifecycle.

### Actions Available Per Role Type

| Role Type | Special Behavior | Default Communication Preferences |
|---|---|---|
| PRIMARY | Cannot be deleted (must always exist); receives all communications by default | Rate Confirms: Yes, POD Requests: Yes, Payments: Yes |
| DISPATCH | Auto-populated as recipient on rate confirmations and load tenders | Rate Confirms: Yes, POD Requests: Yes, Payments: No |
| BILLING | Auto-populated as recipient on payment remittance and invoice communications | Rate Confirms: No, POD Requests: No, Payments: Yes |
| AFTER_HOURS | Shown prominently in dispatch after 6 PM local time | Rate Confirms: No, POD Requests: No, Payments: No |

### Role Badge Colors

| Role Type | Background | Text | Icon | Tailwind |
|---|---|---|---|---|
| PRIMARY | indigo-100 (#E0E7FF) | indigo-800 (#3730A3) | Star | `bg-indigo-100 text-indigo-800` |
| DISPATCH | blue-100 (#DBEAFE) | blue-800 (#1E40AF) | Phone | `bg-blue-100 text-blue-800` |
| BILLING | green-100 (#D1FAE5) | green-800 (#065F46) | Banknote | `bg-emerald-100 text-emerald-800` |
| AFTER_HOURS | amber-100 (#FEF3C7) | amber-800 (#92400E) | Moon | `bg-amber-100 text-amber-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + Add Contact | Plus | Primary / Blue | Opens add contact modal with form fields | No |

### Contact Card Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Call (phone) | Phone | Opens tel: link to initiate phone call | Phone number exists |
| Call (mobile) | Smartphone | Opens tel: link to mobile number | Mobile number exists |
| Send Email | Mail | Opens mailto: link with carrier context in subject | Email exists |
| Send SMS | MessageSquare | Opens SMS compose with mobile number pre-filled | Mobile number exists |
| Edit | Pencil | Opens edit modal with current contact data pre-filled | User has carrier_manage permission |
| Remove | Trash | Soft-deletes contact after confirmation | User has carrier_manage, not PRIMARY role |
| Set as Primary | Star | Changes this contact's role to PRIMARY (removes PRIMARY from previous) | User has carrier_manage, contact is not already PRIMARY |
| View Activity | History | Opens drawer showing communication history for this contact | User has communication_view |
| Copy Phone | Copy | Copies phone number to clipboard with toast confirmation | Phone exists |
| Copy Email | Copy | Copies email to clipboard with toast confirmation | Email exists |

### Quick-Access Bar Actions

| Action | Target | Behavior |
|---|---|---|
| Click "Call" in role card | Role-specific contact | Initiates tel: link to that contact's phone |
| Click "Email" in role card | Role-specific contact | Initiates mailto: link to that contact's email |
| Click role card name | Contact card below | Scrolls to and highlights the full contact card |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + N | Add new contact |
| Escape | Close modal |
| Tab | Navigate between contact cards |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| carrier.contact.added | { carrierId, contact } | Add new contact card with slide-in animation |
| carrier.contact.updated | { carrierId, contactId, changes } | Update contact card fields, flash highlight |
| carrier.contact.removed | { carrierId, contactId } | Fade out and remove contact card |
| communication.logged | { carrierId, contactId, type, timestamp } | Update "Last contacted" date on relevant contact card |

### Live Update Behavior

- **Update frequency:** WebSocket push for contact changes. Communication log updates on page visit (not real-time push for "last contacted" dates).
- **Visual indicator:** Updated cards flash with blue-100 border highlight for 2 seconds.
- **Conflict handling:** If user is editing a contact that another user updates, show banner: "This contact was updated by [user]. Refresh to see changes or save your version."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds
- **Endpoint:** GET /api/carriers/:id/contacts?updatedSince={lastPollTimestamp}
- **Visual indicator:** "Live updates paused" in page header

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Add contact | Immediately show new card with loading state | Remove card, show error toast |
| Edit contact | Immediately update card fields | Revert fields, show error toast |
| Remove contact | Immediately fade out card | Fade card back in, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| Avatar | src/components/ui/avatar.tsx | initials, size, color (use carrier brand color or role-type color) |
| Badge | src/components/ui/badge.tsx | For role type badges |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| Avatar | Basic letter avatar | Add flag overlay for language preference (small flag icon in bottom-right corner) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| ContactCard | Card component: avatar + name + title + role badge + phone (clickable) + mobile (clickable) + email (clickable) + language flag + communication preferences checkboxes (read-only) + last contacted + edit/remove actions. Supports hover state highlighting. | Medium |
| RoleQuickAccessBar | Horizontal row of 4 role summary cards (PRIMARY, DISPATCH, BILLING, AFTER_HOURS). Each shows contact name, one-click call and email buttons. Highlights the active/clicked role. Empty roles show "Not assigned" with add button. | Medium |
| ContactFormModal | Modal form for add/edit: first name, last name, title/position, role type dropdown, phone input (masked), mobile input (masked), email input (validated), preferred language select (EN/ES), communication preferences checkboxes. Validate on submit. | Medium |
| CommunicationPreferences | Small checkbox group (read-only in card, editable in form): "Receives Rate Confirmations", "Receives POD Requests", "Receives Payment Notices". With descriptive tooltips on each. | Small |
| ContactActivityDrawer | Right slide-out drawer showing communication timeline: date, type (email/call/SMS icon), direction (inbound/outbound), subject/note preview. Paginated, sorted newest first. | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Dialog | dialog | Add/edit contact modal |
| Sheet | sheet | Contact activity drawer |
| Checkbox | checkbox | Communication preferences |
| Input | input | Phone, email, name fields in form |
| Select | select | Role type, language dropdowns |
| Tooltip | tooltip | Hover info on communication preferences |
| Alert Dialog | alert-dialog | Remove contact confirmation |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/carriers/:id/contacts | Fetch all contacts for a carrier | useCarrierContacts(carrierId) |
| 2 | POST | /api/carriers/:id/contacts | Create a new contact | useCreateContact() |
| 3 | PATCH | /api/carriers/:id/contacts/:contactId | Update contact details | useUpdateContact() |
| 4 | DELETE | /api/carriers/:id/contacts/:contactId | Soft-delete a contact | useDeleteContact() |
| 5 | PATCH | /api/carriers/:id/contacts/:contactId/role | Change a contact's role type | useUpdateContactRole() |
| 6 | GET | /api/carriers/:id/contacts/:contactId/activity | Fetch communication history for a contact | useContactActivity(carrierId, contactId) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| carrier:{carrierId} | carrier.contact.added | useContactUpdates(carrierId) -- invalidates contacts query |
| carrier:{carrierId} | carrier.contact.updated | useContactUpdates(carrierId) -- invalidates contacts query |
| carrier:{carrierId} | carrier.contact.removed | useContactUpdates(carrierId) -- invalidates contacts query |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/carriers/:id/contacts | N/A | Redirect to login | Show "Access Denied" | Show "Carrier not found" | Error state with retry |
| POST /api/carriers/:id/contacts | Show validation errors in form (duplicate email, invalid phone) | Redirect to login | "Permission Denied" toast | "Carrier not found" | Error toast with retry |
| DELETE /api/carriers/:id/contacts/:contactId | Show "Cannot delete PRIMARY contact" toast | Redirect to login | "Permission Denied" toast | "Contact not found" toast | Error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 4 role quick-access skeleton cards (small rectangles). Show 4 contact card skeletons in 2x2 grid (each with avatar circle, text lines for name/title/phone/email).
- **Progressive loading:** Role quick-access bar renders first. Contact cards appear as data loads.
- **Duration threshold:** If loading exceeds 3 seconds, show "Loading contacts..." message.

### Empty States

**First-time empty (no contacts -- shouldn't happen if onboarding enforces PRIMARY):**
- **Headline:** "No contacts for [Carrier Name]"
- **Description:** "Add at least a primary contact to enable communication with this carrier."
- **CTA Button:** "Add Primary Contact" -- primary blue button

**Single contact (only PRIMARY, no others):**
- **Display:** Show the single PRIMARY contact card. Show callout banner: "This carrier only has a primary contact. Consider adding Dispatch and Billing contacts for faster communication."
- **Role quick-access bar:** PRIMARY card filled, DISPATCH/BILLING/AFTER_HOURS cards show "Not assigned -- [Add]"

### Error States

**Full page error:**
- Error icon + "Unable to load contacts" + Retry button

**Form validation errors:**
- Inline red text below each invalid field: "Invalid phone number format", "Email already in use for this carrier", "First name is required"

**Delete error:**
- Toast: "Cannot remove this contact. They are designated as the PRIMARY contact. Assign a new primary contact first."

### Permission Denied

- **Full page denied:** "You don't have permission to view carrier contacts" with link to Carrier Detail.
- **Partial denied:** Contact info visible but edit/add/remove buttons hidden for read-only users.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached contacts from [timestamp]. Click-to-call and click-to-email still work for locally cached data."
- **Tel/mailto links:** These work offline as they open the device's phone/email app.

---

## 12. Filters, Search & Sort

### Filters

This screen typically has 4-8 contacts per carrier, so full filtering is not necessary. Instead:

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Role Type | Chip toggle | ALL, PRIMARY, DISPATCH, BILLING, AFTER_HOURS | ALL | ?role= |

### Search Behavior

- **Search field:** Small search input above the card grid (only shown if carrier has 6+ contacts)
- **Searches across:** Contact name, email, phone number
- **Behavior:** Instant filter (no debounce needed for small datasets)
- **URL param:** ?search=

### Sort Options

| Sort | Direction | Description |
|---|---|---|
| Role Type | Custom (PRIMARY first, then DISPATCH, BILLING, AFTER_HOURS, then others) | Default sort |
| Name | Ascending (A-Z) | Alphabetical |
| Last Contacted | Descending (most recent first) | Activity-based |

**Default sort:** Role type priority order (PRIMARY first)

### Saved Filters / Presets

- Not applicable for this screen (too few contacts to warrant saved filters)

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Role quick-access bar: 4 cards remain in row but narrower (hide email buttons, keep call buttons)
- Contact cards: 2-column grid maintained, slightly narrower cards
- Contact form modal: full width of content area

### Mobile (< 768px)

- Role quick-access bar: horizontal scroll, 2 cards visible at a time, scroll indicator arrows
- Contact cards: single column stack (one card per row)
- Each card: full width, same content layout
- Phone and email: large tap targets (44px minimum) for click-to-call and click-to-email
- "Add Contact" button: moves to sticky bottom bar
- Contact form: full-screen modal with scrollable form
- Communication preferences: collapsed by default on mobile cards, tap "Preferences" to expand

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout: 4-card role bar + 2-column contact grid |
| Desktop | 1024px - 1439px | Same layout, slightly narrower |
| Tablet | 768px - 1023px | Narrower cards, see tablet notes |
| Mobile | < 768px | Single column, see mobile notes |

---

## 14. Stitch Prompt

```
Design a carrier contacts management page for a modern freight/logistics TMS called "Ultra TMS." This page manages contacts for a specific carrier.

Layout: Full-width page with dark slate-900 sidebar (240px) on left, white content area on right. Breadcrumb: "Carriers > TransWest Logistics > Contacts". Page title: "Contacts - TransWest Logistics" with subtitle "4 contacts". Top-right: primary blue "+ Add Contact" button with plus icon.

Role Quick-Access Bar: Below the header, show 4 compact horizontal cards (one per role type), each about 200px wide with colored left border. Each card shows: role label in bold with colored text, contact name, and two small action buttons (phone icon for call, mail icon for email):
1. PRIMARY (indigo left border, indigo text): "John Smith" [phone] [email]
2. DISPATCH (blue left border, blue text): "Maria Garcia" [phone] [email]
3. BILLING (green left border, green text): "Lisa Tran" [phone] [email]
4. AFTER HOURS (amber left border, amber text): "Dispatch Line" [phone] [email]

Contact Cards Grid (2 columns below the role bar): Show 4 contact cards in a 2x2 grid. Each card is white with rounded-lg border, subtle shadow-sm, and 20px padding.

Card 1 - John Smith (PRIMARY):
- Top-left: 40px circle avatar with "JS" initials on indigo background
- Name: "John Smith" (16px, semibold)
- Title: "Owner" in gray-500 text, with an indigo "PRIMARY" badge pill next to it
- Phone: phone icon + "+1 (214) 555-0101" in blue clickable text
- Mobile: smartphone icon + "+1 (214) 555-0199" in blue clickable text
- Email: mail icon + "john@transwest.com" in blue clickable text
- Language: small US flag icon + "English"
- Divider line
- "Communication Preferences:" label in small gray text
  - Green checkmark + "Rate Confirmations"
  - Green checkmark + "POD Requests"
  - Gray X + "Payment Notices"
- Divider line
- Footer: "Last contacted: Jan 12, 2026" in gray-400 text
- Bottom-right: ghost "Edit" button with pencil icon, ghost "Remove" button with trash icon

Card 2 - Maria Garcia (DISPATCH):
- Avatar: "MG" on blue background
- "Maria Garcia", "Dispatch Manager", blue "DISPATCH" badge
- Phone: +1 (214) 555-0102, Mobile: +1 (214) 555-0198
- Email: maria@transwest.com
- Language: Mexico flag icon + "Spanish / English" (both flags)
- Preferences: Rate Confirmations (check), POD Requests (check), Payments (X)
- Last contacted: Jan 14, 2026

Card 3 - Lisa Tran (BILLING):
- Avatar: "LT" on green background
- "Lisa Tran", "Accounts Payable", green "BILLING" badge
- Phone: +1 (214) 555-0103 (no mobile)
- Email: lisa@transwest.com
- Language: US flag + "English"
- Preferences: Rate Confirmations (X), POD Requests (X), Payments (check)
- Last contacted: Jan 8, 2026

Card 4 - After Hours Dispatch (AFTER_HOURS):
- Avatar: generic phone icon on amber background (no initials)
- "After Hours Dispatch Line", "Dispatch", amber "AFTER HOURS" badge
- Phone: +1 (800) 555-0100
- Email: afterhours@transwest.com
- Language: US flag + "English"
- Preferences: all unchecked
- Last contacted: Dec 22, 2025

Design Specifications:
- Font: Inter, 14px base, 16px card names
- Content background: gray-50 to give cards contrast
- Cards: white, rounded-lg, subtle border slate-200
- Role badges: pill-shaped, colored per role (indigo PRIMARY, blue DISPATCH, green BILLING, amber AFTER HOURS)
- Avatar circles: 40px diameter, colored background matching role, white text initials
- Phone/email: blue-600 clickable text with appropriate Lucide icons (16px)
- Language flags: tiny 16px flag icons (or emoji flags)
- Checkmark/X for preferences: green check circle, gray X circle
- Action buttons: ghost variant, appear on card hover (pencil, trash icons)
- Modern SaaS aesthetic, clean and functional for quick contact lookup
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing built yet -- screen is in design phase

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Contact card grid with all fields
- [ ] Role quick-access bar with call/email buttons
- [ ] Add/edit/remove contact modal forms
- [ ] Click-to-call (tel: links) and click-to-email (mailto: links)
- [ ] Language preference display
- [ ] Communication preference checkboxes
- [ ] Role type assignment and designation

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Contact card grid with click-to-call/email | High | Medium | P0 |
| Role quick-access bar | High | Low | P0 |
| Add/edit contact modal | High | Medium | P0 |
| Language preference display | Medium | Low | P0 |
| Communication preferences | Medium | Low | P0 |
| Contact activity log/drawer | Medium | Medium | P1 |
| Quick SMS from mobile number | Medium | Medium | P1 |
| Duplicate detection on add | Low | Medium | P1 |
| Contact completeness indicator | Low | Low | P2 |
| VoIP call integration | Medium | High | P2 |

### Future Wave Preview

- **Wave 4:** Integrated VoIP calling (click-to-call within the TMS, with call recording and auto-logging), SMS messaging directly from contact cards, and contact import from carrier onboarding documents (OCR extraction of contact info from W-9 or carrier packets).
- **Wave 5:** AI-powered contact recommendation ("Based on the load type and time of day, contact Maria Garcia -- she handles reefer dispatch and is available until 8 PM CST"), automated contact verification (periodic email/phone validation checks), and contact sync with CRM system.

---
