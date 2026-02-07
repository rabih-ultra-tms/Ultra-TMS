# Profile Settings

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /profile | Status: **Built** | Type: Form / Settings
> Primary Personas: All authenticated users managing their own account
> Roles with Access: All authenticated roles (Super Admin, Tenant Admin, Dispatcher, Broker, Carrier Manager, Finance, Read-Only)

---

## 1. Purpose & Business Context

**What this screen does:**
The profile settings page is the user's personal control center. It allows users to manage their account information (name, avatar, contact details), security settings (password, MFA, sessions), preferences (theme, language, date format, timezone), notification settings, connected accounts, and activity history. This is a daily touchpoint for users who want to customize their experience or manage security.

**Business problem it solves:**
Without self-service profile management, every user preference change, password update, or security configuration requires admin intervention. In a logistics company with 50-200 users, this creates significant admin overhead. Self-service profile management empowers users, reduces support tickets, and improves security posture (users can manage their own MFA and sessions). GDPR and privacy compliance also require users to have visibility into their data and the ability to export or delete it.

**Key business rules:**
- Users can only edit their own profile (no editing other users — that requires admin role and the /admin/users page)
- Email changes require verification of the new email address
- Password changes require the current password for verification
- MFA changes require current password or active MFA verification
- Avatar uploads are limited to 5MB, accepted formats: PNG, JPG, GIF, WebP
- Session revocation is immediate — the revoked device loses access on next API call
- Activity log shows last 90 days of actions by default
- "Delete my account" requires typing "DELETE" for confirmation and is irreversible
- Data export (GDPR) generates a downloadable ZIP file within 24 hours

**Success metric:**
80% of users have completed their profile (avatar, phone, timezone). MFA enrollment through profile settings increases by 50%. Support tickets for preference changes reduce by 90%. Average time to change password under 30 seconds.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Any page (via user avatar dropdown) | Click user avatar → "Profile Settings" | None |
| Sidebar navigation | Click "Settings" → "Profile" tab | None |
| Dashboard notification | "Complete your profile" nudge banner | `?section=profile` scroll target |
| MFA enforcement redirect | Tenant requires MFA, user directed to set it up | `?section=security&action=enable-mfa` |
| Login page | Post-login "Last login from new location" prompt | `?section=security&tab=sessions` |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| MFA Setup (/mfa) | "Enable MFA" or "Manage MFA" button | Current MFA status |
| Dashboard (/) | "Back to Dashboard" or sidebar navigation | None |
| Login (/login) | "Delete Account" completion or "Sign out everywhere" | Session terminated |
| Any page | Sidebar navigation | None |

**Primary trigger:**
User clicks their avatar in the top-right corner of any page and selects "Profile Settings" from the dropdown. Also accessed when the system nudges users to complete their profile or enable MFA.

**Success criteria (user completes the screen when):**
- User has updated their desired settings and saved changes
- Security settings are configured to their satisfaction (MFA enabled, sessions reviewed)
- Preferences match their working style (timezone, date format, notifications)

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Sidebar  |  Page Header: "Profile Settings"                     |
|           +-------------------------------------------------------+
|           |                                                        |
|           |  Tab Navigation:                                       |
|           |  [Profile] [Security] [Preferences] [Notifications]   |
|           |  [Connected Accounts] [Activity]                       |
|           |                                                        |
|           |  +------------------------------------------------+   |
|           |  |                                                 |   |
|           |  |  PROFILE TAB (active):                         |   |
|           |  |                                                 |   |
|           |  |  +------------------+  +---------------------+ |   |
|           |  |  | [Avatar Upload]  |  | Personal Info Form  | |   |
|           |  |  | Click to change  |  | First Name          | |   |
|           |  |  | Drag & drop      |  | Last Name           | |   |
|           |  |  | Crop/resize      |  | Email (verified)    | |   |
|           |  |  +------------------+  | Phone               | |   |
|           |  |                        | Job Title           | |   |
|           |  |                        | Department          | |   |
|           |  |                        | Timezone (auto)     | |   |
|           |  |                        +---------------------+ |   |
|           |  |                                                 |   |
|           |  |  [Cancel]  [Save Changes]                       |   |
|           |  |                                                 |   |
|           |  +------------------------------------------------+   |
|           |                                                        |
|           |  --- SECURITY TAB: ---                                 |
|           |  Password change form | MFA settings                  |
|           |  Active sessions table | Trusted devices               |
|           |                                                        |
|           |  --- PREFERENCES TAB: ---                              |
|           |  Theme (light/dark/system) | Language                  |
|           |  Date format | Time format | Number format             |
|           |                                                        |
|           |  --- NOTIFICATIONS TAB: ---                            |
|           |  Email notification toggles per category               |
|           |  Push notification toggles | In-app toggles            |
|           |                                                        |
|           |  --- CONNECTED ACCOUNTS TAB: ---                       |
|           |  Google | Microsoft | Connected apps                   |
|           |  API Keys / Personal tokens                            |
|           |                                                        |
|           |  --- ACTIVITY TAB: ---                                 |
|           |  Activity log table | Export data (GDPR)              |
|           |  Delete account                                        |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (Profile tab) | Name, email, avatar, phone, timezone | Most frequently updated, identity-defining |
| **Secondary** (Security tab) | Password, MFA, sessions | Critical but changed less frequently |
| **Secondary** (Preferences tab) | Theme, date format, language | Personalization — set once, adjusted occasionally |
| **Tertiary** (Notifications tab) | Notification preferences per type | Set once, rarely revisited |
| **Tertiary** (Connected Accounts tab) | Social logins, API keys | Power user features |
| **Hidden** (Activity tab) | Activity log, data export, account deletion | Reference and compliance features |

---

## 4. Data Fields & Display

### Profile Tab Fields

| # | Field Label | Source (Entity.field) | Format / Display | Editable |
|---|---|---|---|---|
| 1 | Avatar | User.avatar | 96px circle, image or initials fallback | Yes — upload, crop, resize |
| 2 | First Name | User.firstName | Text, max 50 chars | Yes |
| 3 | Last Name | User.lastName | Text, max 50 chars | Yes |
| 4 | Email | User.email | Email, with "Verified" green badge | Yes (requires re-verification) |
| 5 | Phone | User.phone | International phone format | Yes |
| 6 | Job Title | User.jobTitle | Text, max 100 chars | Yes |
| 7 | Department | User.department | Text or dropdown | Yes |
| 8 | Timezone | User.timezone | Dropdown with auto-detect option | Yes |
| 9 | Company | User.tenant.name | Text, read-only (set by tenant admin) | No |
| 10 | Role | User.role.name | Badge, read-only | No |
| 11 | Member Since | User.createdAt | "Feb 6, 2025" format | No |

### Security Tab Fields

| # | Field Label | Source | Format / Display | Editable |
|---|---|---|---|---|
| 1 | Current Password | User input | Password field (required for password change) | Input |
| 2 | New Password | User input | Password field + strength meter | Input |
| 3 | Confirm New Password | User input | Password field + match indicator | Input |
| 4 | MFA Status | User.mfaEnabled | "Enabled" green badge or "Disabled" gray badge | Toggle via setup wizard |
| 5 | MFA Methods | User.mfaMethods[] | List of configured methods with badges | Manage via MFA setup |
| 6 | Backup Codes Remaining | Calculated | "7 of 10 remaining" with warning if < 3 | Regenerate button |
| 7 | Active Sessions | User.sessions[] | Table: device, browser, IP, location, last active | Revoke individual |

### Preferences Tab Fields

| # | Field Label | Source | Format / Options | Default |
|---|---|---|---|---|
| 1 | Theme | User.preferences.theme | Radio: Light / Dark / System | System |
| 2 | Language | User.preferences.language | Dropdown: English, Spanish, French | English |
| 3 | Date Format | User.preferences.dateFormat | Radio: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD | MM/DD/YYYY |
| 4 | Time Format | User.preferences.timeFormat | Radio: 12-hour (AM/PM), 24-hour | 12-hour |
| 5 | Number Format | User.preferences.numberFormat | Radio: 1,000.00 / 1.000,00 | 1,000.00 |
| 6 | Week Starts On | User.preferences.weekStart | Dropdown: Sunday, Monday | Sunday |
| 7 | Compact Mode | User.preferences.compactMode | Toggle | Off |

### Notifications Tab Fields

| # | Category | Email | Push | In-App |
|---|---|---|---|---|
| 1 | Load status changes | Toggle | Toggle | Toggle (always on) |
| 2 | New load assignments | Toggle | Toggle | Toggle |
| 3 | Rate confirmations | Toggle | Toggle | Toggle |
| 4 | Document uploads | Toggle | Toggle | Toggle |
| 5 | Delivery confirmations | Toggle | Toggle | Toggle |
| 6 | Payment received | Toggle | Toggle | Toggle |
| 7 | System announcements | Toggle (always on) | Toggle | Toggle (always on) |
| 8 | Security alerts | Toggle (always on) | Toggle (always on) | Toggle (always on) |
| 9 | Team mentions (@you) | Toggle | Toggle | Toggle |
| 10 | Weekly summary digest | Toggle | N/A | N/A |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Profile Completion | Count filled fields / total fields * 100 | Percentage bar: "75% complete" with progress ring |
| 2 | Security Score | Based on: MFA enabled, strong password, sessions reviewed | Score 0-100 with color coding |
| 3 | Auto-detected Timezone | navigator.timezone from browser | "Detected: America/Chicago (CST)" with "Use this" button |

---

## 5. Features

### Core Features (Already Built)

- [x] Profile form: first name, last name, email, phone
- [x] Avatar upload (basic — click to upload, no crop)
- [x] Password change form (current + new + confirm)
- [x] MFA enable/disable toggle (links to mfa-setup-dialog)
- [x] Active sessions list (basic table)
- [x] Save profile changes via PATCH /api/users/me
- [x] Form validation for required fields
- [x] Success/error toasts on save

### Enhancement Features (Wave 1 — To Add)

- [ ] **Avatar crop/resize on upload** — After selecting an image, open a crop dialog with circular mask. Allow zoom, pan, and rotate. Preview the result before saving.
- [ ] **Timezone auto-detect** — On first visit or when timezone is empty, detect browser timezone and suggest it with a "Use detected timezone" button. Show current time in selected timezone as preview.
- [ ] **Email notification preferences (granular)** — Tab with toggle matrix: rows are notification categories (load updates, payments, documents, etc.), columns are channels (email, push, in-app). Category descriptions explain what each notification covers.
- [ ] **Connected accounts** — Tab showing linked social logins (Google, Microsoft). "Connect" / "Disconnect" buttons. Show connection status and linked email.
- [ ] **API key management (personal tokens)** — Generate personal API tokens with custom names, expiry dates, and scope selection. Table of existing tokens with created date, last used, and revoke button. Token shown only once on creation.
- [ ] **Activity log** — Scrollable table of user's recent actions: timestamp, action type, description, IP address. Filterable by action type and date range. Shows last 90 days.
- [ ] **Download my data (GDPR compliance)** — "Request Data Export" button that queues a data export job. User receives email with download link when ready (within 24 hours). Includes profile data, activity log, and any personal data.
- [ ] **Delete account option** — "Danger Zone" section with "Delete my account" button. Requires typing "DELETE" to confirm. Shows warning about data loss. Admin notification on deletion request.
- [ ] **Theme preference (light/dark/system)** — Visual radio cards with preview thumbnails showing how each theme looks. Live preview toggles the actual theme.
- [ ] **Language preference** — Dropdown with flag icons for supported languages. Changes take effect on save.
- [ ] **Date/time format preference** — Radio options with live preview showing today's date/time in each format.
- [ ] **Session management enhanced** — Table with: device name/type icon (desktop/mobile/tablet), browser name + icon, IP address, approximate location (city, country), last active timestamp, "Current session" badge on active row. "Revoke" button per session. "Sign out everywhere" button above table.
- [ ] **Profile completion indicator** — Circular progress ring showing percentage of profile filled. Nudge unfilled fields.
- [ ] **Security score** — Visual score (0-100) based on MFA status, password strength, session hygiene. Recommendations for improvement.

### Conditional / Role-Based Features

| Feature | Required Role / Condition | Behavior if No Access |
|---|---|---|
| API key management | Tenant has API access enabled | Tab hidden |
| Connected accounts | Tenant has OAuth configured | Tab hidden |
| Delete account | User is not tenant admin (last admin cannot delete) | Show message: "As the only admin, you cannot delete your account. Transfer admin rights first." |
| Activity log | All roles | Read-only for all |
| Data export (GDPR) | All roles | Available to all users |
| Notification preferences | All roles | Show only relevant categories per role (dispatchers see load notifications, finance sees payment notifications) |
| Compact mode toggle | All roles | Available to all |
| Language preference | Tenant has multi-language enabled | Dropdown shows only enabled languages |

---

## 6. Status & State Machine

### Profile Edit State Machine

```
[Viewing Profile] ---(Edit any field)---> [Unsaved Changes]
       |                                        |
       |                                   [Save Changes]
       |                                        |
       |                                   [Submitting...]
       |                                        |
       |                              +---------+---------+
       |                              |                   |
       |                       [Save Success]      [Save Failed]
       |                           |                      |
       |                           v                      v
       |                    [Toast: "Saved!"]     [Show errors,
       |                    [Back to Viewing]      stay in edit]
       |
       +---(Cancel)---> [Discard changes confirmation if dirty]
       |
       +---(Navigate away)---> [Unsaved changes warning modal]
```

### Session Management States

| State | Description | Available Actions |
|---|---|---|
| Active (current) | The session you're currently using | Cannot revoke (it's your active session) |
| Active (other device) | Session on another device/browser | Revoke individual session |
| Expired | Session that has naturally expired | Shown as "Expired" with gray text (auto-removed after 7 days) |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| Email Verified | green-100 | green-700 | `bg-green-100 text-green-700` |
| Email Unverified | yellow-100 | yellow-700 | `bg-yellow-100 text-yellow-700` |
| MFA Enabled | green-100 | green-700 | `bg-green-100 text-green-700` |
| MFA Disabled | gray-100 | gray-600 | `bg-gray-100 text-gray-600` |
| Current Session | blue-100 | blue-700 | `bg-blue-100 text-blue-700` |
| Active Session | green-100 | green-700 | `bg-green-100 text-green-700` |
| API Key Active | green-100 | green-700 | `bg-green-100 text-green-700` |
| API Key Expired | red-100 | red-700 | `bg-red-100 text-red-700` |
| Connected | green-100 | green-700 | `bg-green-100 text-green-700` |
| Disconnected | gray-100 | gray-600 | `bg-gray-100 text-gray-600` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Per Tab)

| Button Label | Icon | Variant | Tab | Action | Confirmation Required? |
|---|---|---|---|---|---|
| Save Changes | Checkmark | Primary / Blue-600 | Profile | PATCH /api/users/me | No |
| Change Password | Lock | Primary / Blue-600 | Security | PATCH /api/users/me/password | No (requires current password in form) |
| Enable 2FA | Shield | Primary / Blue-600 | Security | Navigate to MFA setup wizard | No |
| Sign Out Everywhere | LogOut | Destructive / Red-600 outline | Security | DELETE /api/auth/sessions | Yes — "Sign out of all N devices?" |
| Generate API Key | Key | Primary / Blue-600 | Connected | POST /api/users/me/api-keys | No |
| Request Data Export | Download | Secondary / Outline | Activity | POST /api/users/me/data-export | Yes — "This may take up to 24 hours" |
| Delete Account | Trash | Destructive / Red-600 | Activity | DELETE /api/users/me | Yes — type "DELETE" to confirm |

### Secondary Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Upload Avatar | Camera | Open file picker / crop dialog | Profile tab |
| Remove Avatar | X | Remove current avatar, revert to initials | Has avatar uploaded |
| Revoke Session | X | DELETE /api/auth/sessions/:id | Security tab, non-current session |
| Revoke API Key | Trash | DELETE /api/users/me/api-keys/:id | Connected tab |
| Connect Google | Google icon | Initiate Google OAuth linking | Connected tab, not yet linked |
| Disconnect Google | Unlink icon | Remove Google OAuth link | Connected tab, currently linked |
| Connect Microsoft | Microsoft icon | Initiate Microsoft OAuth linking | Connected tab, not yet linked |
| Copy API Key | Copy icon | Copy token to clipboard | Connected tab, on key creation |
| Use Detected Timezone | Globe icon | Set timezone to browser-detected value | Profile tab, timezone mismatch |
| Regenerate Backup Codes | Refresh | Generate new backup codes (invalidates old) | Security tab, MFA enabled |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + S | Save current tab's changes |
| Escape | Discard unsaved changes (with confirmation) |
| Tab | Navigate between form fields |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Image file | Avatar upload zone | Upload and open crop dialog |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| `session.revoked` | `{ sessionId, revokedBy }` | Remove session from active sessions table, show toast: "Session on [device] was signed out" |
| `user.updated` | `{ userId, fields }` | If another admin changed this user's profile, show banner: "Your profile was updated by an administrator. Refresh to see changes." |
| `mfa.status.changed` | `{ userId, mfaEnabled }` | Update MFA status badge |

### Live Update Behavior

- **Avatar upload:** Show upload progress bar inside the avatar circle. When complete, cross-fade to the new avatar.
- **Theme toggle:** Instantly preview the selected theme (light/dark/system) as the user selects it, before saving.
- **Date format preview:** When user selects a date format option, show today's date formatted in that style as a live preview.
- **Timezone preview:** When user selects a timezone, show the current time in that timezone as a live preview.
- **Unsaved changes indicator:** Show a subtle yellow dot on the tab name when changes are unsaved. Show "Unsaved changes" text near the save button.

### Polling Fallback

- **Data export status:** After requesting data export, poll /api/users/me/data-export/status every 30 seconds until ready. Show progress indicator.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Save profile | Immediately update UI with new values, show success toast | Revert to previous values, show error toast |
| Revoke session | Immediately remove row from table | Re-add row, show error toast |
| Theme change | Immediately apply theme | Revert theme, show error toast |
| Toggle notification | Immediately update toggle state | Revert toggle, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `user-form` (partial) | `src/components/admin/user-form.tsx` | Reuse field structure for profile fields (name, email, phone) |
| `Input` | `src/components/ui/input.tsx` | Standard text inputs |
| `Button` | `src/components/ui/button.tsx` | Various variants |
| `Avatar` | `src/components/ui/avatar.tsx` | User avatar display |
| `Tabs` | `src/components/ui/tabs.tsx` | Tab navigation |
| `Switch` | `src/components/ui/switch.tsx` | Notification toggles |
| `Select` | `src/components/ui/select.tsx` | Timezone, language dropdowns |
| `Table` | `src/components/ui/table.tsx` | Sessions table, activity log |
| `Label` | `src/components/ui/label.tsx` | Form labels |
| `Badge` | `src/components/ui/badge.tsx` | Status badges |
| `Alert` | `src/components/ui/alert.tsx` | Warning/info banners |
| `Toast` | `src/components/ui/toast.tsx` | Success/error notifications |
| `Dialog` | `src/components/ui/dialog.tsx` | Confirmation dialogs |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| Avatar | Basic display with image or initials | Add upload zone overlay, crop dialog integration, remove button |
| Tabs | Standard horizontal tabs | Add unsaved changes indicator (yellow dot), tab icons |
| Switch | Basic toggle | Add "saving..." micro-state when toggling notifications |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `AvatarUploadCrop` | File upload + crop dialog with circular mask, zoom, rotate, and preview | Medium — crop library integration, file handling |
| `ProfileCompletionRing` | Circular progress indicator showing profile completion percentage | Small — SVG ring + percentage calculation |
| `SecurityScoreCard` | Visual security score (0-100) with color coding and improvement suggestions | Medium — scoring logic + visual display |
| `SessionsTable` | Enhanced table showing device info, browser, location, last active, current badge, revoke | Medium — device detection, geolocation, revoke API |
| `NotificationPreferencesGrid` | Grid of notification categories x channels with toggles | Medium — many toggles, batch save logic |
| `ThemePreviewCards` | Visual radio cards showing light/dark/system theme previews | Small — screenshot thumbnails + radio group |
| `DateFormatPreview` | Radio options with live-formatted date previews | Small — date formatting + radio group |
| `TimezoneAutoDetect` | Timezone selector with browser auto-detection and current time preview | Small — Intl API + select |
| `ApiKeyManager` | Table of API keys with create dialog, show-once token display, revoke | Medium — CRUD operations, secure token display |
| `ConnectedAccountCard` | Card showing connected service (Google, Microsoft) with connect/disconnect | Small — OAuth status + toggle |
| `ActivityLogTable` | Paginated table of user actions with type filter and date range | Medium — data table with filters |
| `DataExportButton` | Button that triggers export, shows progress, and provides download link | Small — API call + polling + download |
| `DeleteAccountSection` | Danger zone card with confirmation dialog requiring "DELETE" text input | Medium — confirmation UX, safety checks |
| `UnsavedChangesGuard` | Route guard that warns when navigating away with unsaved changes | Small — beforeunload + router guard |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | `tabs` | Tab navigation (Profile, Security, Preferences, etc.) |
| Switch | `switch` | Notification toggles |
| RadioGroup | `radio-group` | Theme, date format, time format selection |
| Avatar | `avatar` | User avatar with image/initials |
| AlertDialog | `alert-dialog` | Delete account, sign out everywhere confirmations |
| Progress | `progress` | Profile completion bar, upload progress |
| Separator | `separator` | Section dividers within tabs |
| Tooltip | `tooltip` | Help text on fields and buttons |
| DropdownMenu | `dropdown-menu` | Avatar actions (upload, remove) |
| Sheet | `sheet` | Mobile-friendly settings panels |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | `/api/users/me` | Fetch current user profile | `useCurrentUser()` |
| 2 | PATCH | `/api/users/me` | Update profile fields | `useUpdateProfile()` |
| 3 | POST | `/api/users/me/avatar` | Upload avatar image | `useUploadAvatar()` |
| 4 | DELETE | `/api/users/me/avatar` | Remove avatar | `useRemoveAvatar()` |
| 5 | PATCH | `/api/users/me/password` | Change password | `useChangePassword()` |
| 6 | GET | `/api/users/me/preferences` | Fetch user preferences | `usePreferences()` |
| 7 | PATCH | `/api/users/me/preferences` | Update preferences | `useUpdatePreferences()` |
| 8 | GET | `/api/users/me/notifications` | Fetch notification settings | `useNotificationSettings()` |
| 9 | PATCH | `/api/users/me/notifications` | Update notification settings | `useUpdateNotifications()` |
| 10 | GET | `/api/auth/sessions` | List active sessions | `useSessions()` |
| 11 | DELETE | `/api/auth/sessions/:id` | Revoke specific session | `useRevokeSession()` |
| 12 | DELETE | `/api/auth/sessions` | Revoke all sessions (sign out everywhere) | `useRevokeAllSessions()` |
| 13 | GET | `/api/users/me/connected-accounts` | List connected OAuth accounts | `useConnectedAccounts()` |
| 14 | POST | `/api/users/me/connected-accounts/:provider` | Link a provider account | `useConnectAccount()` |
| 15 | DELETE | `/api/users/me/connected-accounts/:provider` | Unlink a provider account | `useDisconnectAccount()` |
| 16 | GET | `/api/users/me/api-keys` | List personal API keys | `useApiKeys()` |
| 17 | POST | `/api/users/me/api-keys` | Create new API key | `useCreateApiKey()` |
| 18 | DELETE | `/api/users/me/api-keys/:id` | Revoke an API key | `useRevokeApiKey()` |
| 19 | GET | `/api/users/me/activity` | Fetch activity log (paginated) | `useActivityLog(page, filters)` |
| 20 | POST | `/api/users/me/data-export` | Request GDPR data export | `useRequestDataExport()` |
| 21 | GET | `/api/users/me/data-export/status` | Check data export status | `useDataExportStatus()` |
| 22 | DELETE | `/api/users/me` | Delete own account | `useDeleteAccount()` |

### Request/Response Examples

**PATCH /api/users/me**
```json
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-312-555-0100",
  "jobTitle": "Senior Dispatcher",
  "department": "Operations",
  "timezone": "America/Chicago"
}

// Response
{
  "id": "usr_001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@ultralogistics.com",
  "emailVerified": true,
  "phone": "+1-312-555-0100",
  "jobTitle": "Senior Dispatcher",
  "department": "Operations",
  "timezone": "America/Chicago",
  "avatar": "https://cdn.ultratms.com/avatars/usr_001.jpg",
  "role": { "id": "role_003", "name": "Dispatcher" },
  "tenant": { "id": "tnt_001", "name": "Ultra Logistics LLC" },
  "mfaEnabled": true,
  "createdAt": "2024-06-15T10:00:00Z",
  "updatedAt": "2025-02-06T12:00:00Z"
}
```

**GET /api/auth/sessions**
```json
// Response
{
  "sessions": [
    {
      "id": "sess_001",
      "current": true,
      "device": "Windows Desktop",
      "browser": "Chrome 121",
      "ip": "192.168.1.100",
      "location": "Chicago, IL, US",
      "lastActive": "2025-02-06T12:30:00Z",
      "createdAt": "2025-02-06T08:00:00Z"
    },
    {
      "id": "sess_002",
      "current": false,
      "device": "iPhone 15",
      "browser": "Safari Mobile",
      "ip": "10.0.0.55",
      "location": "Chicago, IL, US",
      "lastActive": "2025-02-05T18:45:00Z",
      "createdAt": "2025-02-04T09:00:00Z"
    }
  ]
}
```

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 409 | 500 |
|---|---|---|---|---|---|
| PATCH /api/users/me | Validation errors (show inline) | Session expired → login | N/A | Email already in use (if changing email) | Generic error toast |
| PATCH /api/users/me/password | Validation errors | Session expired | Current password incorrect | N/A | Generic error toast |
| POST /api/users/me/avatar | File too large / wrong format | Session expired | N/A | N/A | Upload failed, retry |
| DELETE /api/users/me | N/A | Session expired | Last admin cannot delete | N/A | Deletion failed |
| DELETE /api/auth/sessions/:id | N/A | Session expired | Cannot revoke current session via this endpoint | N/A | Revocation failed |

---

## 11. States & Edge Cases

### Loading State

- **Initial page load:** Show skeleton for the profile form — avatar placeholder (gray circle shimmer), 6 input field skeletons, button skeletons. Tab navigation loads immediately.
- **Tab switching:** If tab data is not yet cached, show a brief skeleton within the tab content area. Cached tabs switch instantly.
- **Avatar upload:** Show progress bar overlay on the avatar circle during upload. Show a spinner during crop processing.
- **Save changes:** Show spinner inside the "Save Changes" button, replace text with "Saving..."

### Empty States

**No active sessions (unlikely but possible):**
- Show: "No active sessions found. This is unusual — you should be seeing your current session here." with a "Refresh" button.

**No activity log entries:**
- Show: "No recent activity. Actions you take in Ultra TMS will appear here." with a subtle activity icon.

**No API keys:**
- Show: "No API keys yet. Generate a personal API key to access Ultra TMS programmatically." with "Generate Key" button.

**No connected accounts:**
- Show two cards: Google (disconnected) and Microsoft (disconnected) with "Connect" buttons on each.

### Error States

**Profile save failure:**
- Display: Red toast: "Failed to save changes. Please try again."
- Behavior: Keep form in dirty state, re-enable Save button.

**Avatar upload failure:**
- Display: Toast: "Failed to upload avatar. Please try a smaller image (max 5MB)."
- Behavior: Keep current avatar, dismiss crop dialog.

**Password change — wrong current password:**
- Display: Inline error below current password field: "Current password is incorrect."
- Behavior: Clear current password field, refocus it.

**Email change — email already in use:**
- Display: Inline error below email field: "This email is already associated with another account."
- Behavior: Revert email field to previous value.

**Session revocation failure:**
- Display: Toast: "Failed to revoke session. Please try again."
- Behavior: Re-add session row to table.

**Account deletion failure (last admin):**
- Display: Alert: "You cannot delete your account because you are the last administrator. Please transfer admin rights to another user first."
- Behavior: Disable Delete button with this tooltip.

### Permission Denied

- All authenticated users can access /profile for their own account
- If a user tries to access another user's profile via URL manipulation, show: "You can only view and edit your own profile." Redirect to their own /profile.

### Offline / Degraded

- **Full offline:** Show banner: "You are offline. Changes cannot be saved until you reconnect." Allow form editing (changes cached locally). Sync when connection restored.
- **Partial offline (read-only):** Load cached profile data. Disable save buttons. Show "Read-only mode — reconnecting..." indicator.

---

## 12. Filters, Search & Sort

### Activity Log Table

| # | Filter Label | Type | Options | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Action Type | Multi-select | Login, Logout, Profile Update, Password Change, Settings Change, Load Action, etc. | All | `?actionType=` |
| 2 | Date Range | Date range picker | Preset: Last 7 days, Last 30 days, Last 90 days, Custom | Last 30 days | `?from=&to=` |
| 3 | Search | Text | Searches action descriptions | Empty | `?search=` |

### Activity Log Sort

| Column | Default Direction | Sort Type |
|---|---|---|
| Timestamp | Descending (newest first) | Date |
| Action Type | N/A | String |

### Sessions Table Sort

| Column | Default Direction | Sort Type |
|---|---|---|
| Last Active | Descending (most recent first) | Date |

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Tab navigation wraps if needed or becomes a scrollable horizontal strip
- Profile form: avatar and form fields stack vertically (avatar above, form below)
- Sessions table: hide IP address column, show in expandable row detail
- Notification grid: reduce to 2 columns (category + toggles stacked)
- Security section: single column layout

### Mobile (< 768px)

- **Tab navigation becomes a vertical list** or a dropdown selector at the top
- Profile form: single column, full width with 16px padding
- Avatar: centered above form, 80px circle, tap to upload (camera icon overlay)
- Sessions table: each session becomes a card with stacked info and swipe-to-revoke
- Notification preferences: each category becomes an expandable accordion with toggles inside
- API keys: card-based layout instead of table
- Activity log: card-based list with timestamp, action icon, and description
- "Danger Zone" (delete account) section: full-width card with prominent red button
- Save button: sticky at bottom of viewport
- All form inputs: min-height 48px for touch
- Cancel confirmation: bottom sheet instead of centered modal

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout with sidebar, horizontal tabs, 2-column profile form |
| Desktop | 1024px - 1439px | Same with tighter spacing |
| Tablet | 768px - 1023px | Single column profile, horizontal scrolling tabs |
| Mobile | < 768px | Vertical tabs/dropdown, card-based tables, sticky save |

---

## 14. Stitch Prompt

```
Design a Profile Settings page for a modern freight logistics TMS called "Ultra TMS." Show the PROFILE tab as the active tab with the user's personal information form. Use a clean, modern SaaS aesthetic similar to Vercel account settings or GitHub profile settings pages.

Layout: Standard app layout with dark slate-900 sidebar (240px) on the left with "Ultra TMS" logo in white at top, navigation links with icons. "Settings" is active with a blue-600 left border. Main content area on the right with white background.

Page Header: Breadcrumb "Home / Settings / Profile" in gray-500. Title "Profile Settings" in 24px semibold gray-900 on the left. On the right, a small profile completion indicator — a circular progress ring (32px diameter) showing "75%" in blue-600, with "Complete your profile" in 13px gray-500 next to it.

Tab Navigation: Below the header, horizontal underline-style tabs: "Profile" (active, blue-600 underline), "Security" (with a small green dot indicating MFA is enabled), "Preferences", "Notifications", "Connected Accounts", "Activity". Tabs in 14px medium gray-500, active tab in gray-900 with blue-600 underline.

Profile Tab Content — max-width 720px:

Section 1 — Avatar & Basic Info (flex row):
Left side (160px): A 96px circular avatar showing a professional headshot photo of a man. Below the avatar, a "Change Photo" blue-600 text link with a camera icon, and "Remove" in gray-400 text link. Below those links: "JPG, PNG or GIF. Max 5MB." in 11px gray-400.

Right side (remaining width): Form fields in a single column with 16px spacing:
- Row 1 (two fields side by side, 50/50): "First Name" label 14px medium gray-700, input value "John" with gray-200 border rounded-md. "Last Name" input value "Doe."
- Row 2: "Email Address" label, input value "john@ultralogistics.com" with a green "Verified" badge (bg-green-100 text-green-700) to the right of the input. A small lock icon inside the input indicating it requires re-verification to change.
- Row 3 (two fields, 50/50): "Phone Number" input value "+1 (312) 555-0100". "Job Title" input value "Senior Dispatcher."
- Row 4 (two fields, 50/50): "Department" dropdown value "Operations". "Timezone" dropdown value "America/Chicago (CST)" with a small globe icon and text "Detected from your browser" in 11px blue-600 below the dropdown.

A gray-200 horizontal separator line.

Section 2 — "Company Information" (read-only):
Section title "Company Information" in 16px semibold gray-900. Description "Managed by your organization administrator" in 13px gray-500.
- Row: "Company" shows "Ultra Logistics LLC" in 14px gray-900 (read-only text, not an input). "Role" shows a blue badge "Dispatcher" (bg-blue-100 text-blue-800). "Member Since" shows "June 15, 2024" in 14px gray-500.

A gray-200 horizontal separator line.

Bottom Action Bar: Right-aligned. "Cancel" secondary outline button and "Save Changes" primary blue-600 button. To the left of the buttons, subtle text "Unsaved changes" in 13px yellow-600 with a yellow dot indicator (shown because the user has edited something).

Below the action bar (32px spacing): A subtle info card with blue-50 background, blue-200 border, rounded-md, 16px padding. Icon: blue info circle. Text: "Need to change your password or enable two-factor authentication? Visit the Security tab." with "Security" as a blue-600 link.

Design specs: Font Inter, 14px base. Form inputs have gray-200 borders, rounded-md, 12px padding, white background, focus ring blue-600. Labels are 14px medium gray-700. Read-only values are 14px gray-900 without input borders. The page should feel organized, clean, and easy to navigate — like a premium SaaS settings experience. All form elements have generous spacing (16px between fields, 32px between sections) for a breathable layout.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Profile form: first name, last name, email, phone number
- [x] Avatar upload (basic click-to-upload, no crop/resize)
- [x] Password change form (current password + new password + confirm)
- [x] MFA enable/disable toggle (opens mfa-setup-dialog)
- [x] Active sessions list (basic table with device and last active)
- [x] PATCH /api/users/me profile update integration
- [x] Form validation for required fields
- [x] Success/error toast notifications
- [x] Tab navigation (Profile, Security tabs)

**What needs polish / bug fixes:**
- [ ] Avatar upload has no crop/resize — uploaded images display poorly if not square
- [ ] No loading state on "Save Changes" button
- [ ] Timezone field is manual selection only — no auto-detection from browser
- [ ] Sessions table lacks device type icons (all look the same)
- [ ] No "unsaved changes" warning when navigating away from dirty form
- [ ] Password change form does not show strength meter or requirements
- [ ] No profile completion indicator — users don't know they have empty fields
- [ ] Email change does not trigger re-verification flow
- [ ] No preferences tab (theme, language, date format)
- [ ] No notification preferences (users receive all notifications regardless)
- [ ] Tab navigation only has 2 tabs (Profile, Security) — missing Preferences, Notifications, Connected, Activity

**What to add this wave:**
- [ ] **Avatar crop/resize dialog** — After selecting image, open crop tool with circular mask, zoom/pan/rotate
- [ ] **Timezone auto-detect** — Detect from browser, show "Detected: America/Chicago" with one-click apply
- [ ] **Preferences tab** — Theme (light/dark/system), language, date format, time format, number format, compact mode
- [ ] **Notification preferences tab** — Granular toggles per notification category and channel (email/push/in-app)
- [ ] **Connected accounts tab** — Google and Microsoft OAuth linking with connect/disconnect
- [ ] **API key management** — Personal token generation with name, expiry, and scope
- [ ] **Activity log tab** — Scrollable, filterable table of user's recent actions (last 90 days)
- [ ] **Data export (GDPR)** — "Download my data" button queuing an export job
- [ ] **Delete account** — "Danger Zone" section with confirmation dialog requiring "DELETE" input
- [ ] **Enhanced sessions table** — Device type icons, browser icons, approximate location, "Current" badge
- [ ] **Sign out everywhere** — Button to revoke all other sessions at once
- [ ] **Profile completion ring** — Visual indicator nudging users to fill all fields
- [ ] **Security score** — Visual 0-100 score based on MFA, password, session hygiene
- [ ] **Unsaved changes guard** — Warn when navigating away from dirty form
- [ ] **Theme live preview** — Instantly toggle theme when selecting option (before save)
- [ ] **Date format live preview** — Show today's date in selected format as preview

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Unsaved changes guard | High | Low | **P0** |
| Loading state on save buttons | High | Low | **P0** |
| Password strength meter (security tab) | High | Low | **P0** |
| Avatar crop/resize dialog | Medium | Medium | **P0** |
| Timezone auto-detect | Medium | Low | **P0** |
| Preferences tab (theme, date format) | High | Medium | **P0** |
| Notification preferences tab | High | Medium | **P1** |
| Enhanced sessions table | Medium | Medium | **P1** |
| Sign out everywhere button | Medium | Low | **P1** |
| Profile completion indicator | Medium | Low | **P1** |
| Security score card | Medium | Medium | **P1** |
| Theme live preview | Low | Low | **P1** |
| Connected accounts tab | Medium | Medium | **P2** |
| API key management | Medium | High | **P2** |
| Activity log tab | Medium | Medium | **P2** |
| Data export (GDPR) | Medium | Medium | **P2** |
| Delete account | Low | Medium | **P2** |
| Date/time format preview | Low | Low | **P2** |

### Future Wave Preview

- **Wave 2:** Full OAuth account linking (Google, Microsoft), API key scoped permissions (read-only, full access, per-module), push notification setup (browser, mobile app), advanced session management (trust scoring, anomaly detection), profile activity feed visible to team members
- **Wave 3:** AI-powered notification preferences (learn from user behavior which notifications they act on), cross-device sync of preferences, custom dashboard widget preferences managed from profile, delegation settings (out-of-office auto-assignment), personal workspace customization (sidebar order, default views, pinned screens)

---

*This document was created as part of the Wave 1 Enhancement Focus design process for Ultra TMS Auth & Admin service.*
