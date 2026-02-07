# Tenant Settings

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/admin/settings | Status: Built
> Primary Personas: Admin
> Roles with Access: Super Admin, Admin

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a centralized configuration hub for tenant-wide settings organized into tabbed sections: General (company info), Notifications, Security, Branding, Business Defaults, Integrations, and Data Management. This is the single place where admins configure the operational behavior and appearance of their Ultra TMS instance.

**Business problem it solves:**
Every freight brokerage operates differently -- different business hours, different default payment terms, different branding, different security requirements, different integration partners. Without tenant-level configuration, the system is either too rigid (one-size-fits-all) or requires developer intervention for every customization. This screen empowers admins to self-serve all configuration needs.

**Key business rules:**
- Only Admin and Super Admin can access tenant settings
- Certain settings (company name, tax ID) require Super Admin to change after initial setup
- Security settings changes (password policy, MFA requirements) take effect on next login for all users
- Branding changes (logo, colors) take effect immediately across the entire application
- Integration connection changes may require re-authentication with third-party services
- All setting changes are logged in the audit trail
- Some settings have validation constraints (e.g., password minimum length cannot be less than 8)
- Feature flags can be toggled but some are tied to subscription tier

**Success metric:**
Admin can fully configure a new tenant (company info, branding, security, defaults) within 15 minutes of first login. Settings changes apply immediately without requiring support tickets.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Admin sidebar navigation | Click "Settings" menu item | None |
| Dashboard | First-time setup prompt "Complete your settings" | ?tab=general |
| Integration failure alert | Click "Configure" link | ?tab=integrations |
| Security alert notification | Click "Review security settings" | ?tab=security |
| Direct URL | Bookmark / shared link | ?tab= query param |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Dashboard | Click sidebar navigation or breadcrumb | None |
| Integration detail/setup | Click "Configure" on an integration card | integrationId |
| Custom Fields manager | Click "Manage Custom Fields" link | None |
| Webhook configuration | Click "Configure Webhooks" link | None |

**Primary trigger:**
Admin navigates to Settings from the Admin sidebar section to configure tenant behavior, appearance, integrations, or security policies.

**Success criteria (user completes the screen when):**
- Admin has configured the desired settings and saved changes
- Admin has verified integrations are connected and working
- Admin has set up branding to match company identity

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Admin > Settings                         [Save All]  |
+------------------------------------------------------------------+
|                                                                    |
|  [General] [Notifications] [Security] [Branding] [Defaults]      |
|  [Integrations] [Data] [Custom Fields] [Webhooks]                |
|                                                                    |
|  +----TAB CONTENT (General tab shown)-------------------------+  |
|  |                                                             |  |
|  |  COMPANY INFORMATION                                        |  |
|  |  +---------+  Company Name: [Ultra Logistics Inc.     ]    |  |
|  |  | LOGO    |  Tax ID / EIN:  [XX-XXXXXXX              ]    |  |
|  |  | Upload  |  MC Number:     [MC-123456               ]    |  |
|  |  +---------+  DOT Number:    [1234567                 ]    |  |
|  |               Phone:         [+1 (555) 987-6543      ]    |  |
|  |               Website:       [https://ultralogistics.com]  |  |
|  |                                                             |  |
|  |  ADDRESS                                                    |  |
|  |  Street:     [123 Freight Boulevard              ]         |  |
|  |  City:       [Chicago        ] State: [IL] Zip: [60601]   |  |
|  |  Country:    [United States ▼]                             |  |
|  |                                                             |  |
|  |  BUSINESS HOURS                                             |  |
|  |  Mon-Fri:    [06:00 AM] to [06:00 PM]                     |  |
|  |  Saturday:   [Closed ▼] / [08:00 AM] to [12:00 PM]       |  |
|  |  Sunday:     [Closed ▼]                                    |  |
|  |  Timezone:   [America/Chicago (CST) ▼]                     |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (General tab) | Company name, logo, contact info, address | Core identity information needed first |
| **Secondary** (Security, Notifications) | Password policy, MFA settings, notification channels | Security and communication configuration |
| **Tertiary** (Branding, Defaults, Integrations) | Visual customization, business defaults, third-party connections | Refinement and optimization settings |
| **Hidden** (Data, Custom Fields, Webhooks) | Data retention, field configuration, webhook endpoints | Advanced administration tasks |

---

## 4. Data Fields & Display

### Visible Fields (General Tab)

| # | Field Label | Source (Entity.field) | Format / Display | Validation |
|---|---|---|---|---|
| 1 | Company Name | Tenant.name | Text input, required | Min 2 chars, max 100 |
| 2 | Logo | Tenant.logoUrl | Image upload (drag-drop zone), 200x200px display | PNG/JPG/SVG, max 2MB |
| 3 | Tax ID / EIN | Tenant.taxId | Text input with mask (XX-XXXXXXX) | Format validation |
| 4 | MC Number | Tenant.mcNumber | Text input with "MC-" prefix | Format: MC-XXXXXX |
| 5 | DOT Number | Tenant.dotNumber | Numeric input | 5-8 digits |
| 6 | Phone | Tenant.phone | Phone input with country code | Valid phone format |
| 7 | Website | Tenant.website | URL input | Valid URL format |
| 8 | Street Address | Tenant.address.street | Text input | Required |
| 9 | City | Tenant.address.city | Text input | Required |
| 10 | State | Tenant.address.state | Dropdown (US states) | Required |
| 11 | Zip Code | Tenant.address.zip | Text input with mask | 5 or 9 digits |
| 12 | Country | Tenant.address.country | Dropdown | Required |
| 13 | Business Hours | Tenant.businessHours | Day-by-day time pickers | Valid time ranges |
| 14 | Timezone | Tenant.timezone | Searchable dropdown (IANA timezones) | Required |

### Security Tab Fields

| # | Field Label | Source | Format | Default |
|---|---|---|---|---|
| 1 | Min Password Length | Tenant.security.minPasswordLength | Number input (8-32) | 12 |
| 2 | Require Uppercase | Tenant.security.requireUppercase | Toggle switch | On |
| 3 | Require Numbers | Tenant.security.requireNumbers | Toggle switch | On |
| 4 | Require Special Characters | Tenant.security.requireSpecial | Toggle switch | On |
| 5 | MFA Required | Tenant.security.mfaRequired | Toggle switch | Off |
| 6 | Session Timeout | Tenant.security.sessionTimeoutMinutes | Dropdown (15, 30, 60, 120, 480 min) | 60 min |
| 7 | Max Failed Login Attempts | Tenant.security.maxFailedAttempts | Number input (3-10) | 5 |
| 8 | Lockout Duration | Tenant.security.lockoutMinutes | Dropdown (5, 15, 30, 60 min) | 15 min |
| 9 | Password Expiry | Tenant.security.passwordExpiryDays | Dropdown (30, 60, 90, Never) | 90 days |
| 10 | IP Allowlist | Tenant.security.ipAllowlist | Textarea (one IP per line) | Empty (all allowed) |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] General settings tab with company information form
- [x] Notification settings tab with email notification toggles
- [x] Security settings tab with password policy configuration
- [x] Tabbed navigation between settings sections
- [x] Save settings per tab
- [x] Form validation with inline error messages

### Enhancement Features (Wave 1 Additions)

- [ ] **Company branding** -- Logo upload with drag-drop zone and preview; primary color picker with live preview across sidebar/buttons; email template customization with WYSIWYG editor
- [ ] **Business hours configuration** -- Day-by-day schedule with open/close times, timezone selector, holiday calendar, after-hours auto-responder message
- [ ] **Default values** -- Configure default payment terms (Net 30/60/90), default credit limit for new customers, default equipment types, default accessorial charges, default document templates
- [ ] **Feature flags** -- Toggle list of features that can be enabled/disabled per tenant (load board posting, customer portal, carrier portal, API access, mobile app, etc.) with subscription tier indicators
- [ ] **Integration connections** -- Card grid showing third-party integrations (HubSpot, QuickBooks, Google Maps, Twilio, SendGrid) with connection status indicators (connected/disconnected/error), last sync time, and "Configure" button
- [ ] **Email domain verification** -- Verify company email domain for trusted sender status; DNS record instructions; verification status indicator
- [ ] **Custom fields manager** -- Interface to create/edit/delete custom fields for entities (Users, Customers, Carriers, Loads, Orders) with field type selector (text, number, dropdown, date, checkbox)
- [ ] **Webhook configuration** -- Manage outbound webhook endpoints for events (order.created, load.status.changed, invoice.paid); URL, events selector, secret key, test button, delivery log
- [ ] **Data retention policies** -- Configure how long to retain audit logs, completed orders, archived contacts; compliance-aware defaults with warnings
- [ ] **Backup/export tenant data** -- Full data export in JSON/CSV format for backup or migration; scheduled export option; download history
- [ ] **Subscription/billing info (Phase C)** -- Current plan display, usage meters, upgrade prompts, billing history, payment method
- [ ] **White-label settings (Phase C)** -- Custom domain, custom login page, remove Ultra TMS branding, custom favicon

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View settings | admin, super_admin | settings_view | Redirect to dashboard |
| Edit general settings | admin, super_admin | settings_edit | Fields read-only |
| Edit security settings | admin, super_admin | security_manage | Security tab read-only |
| Change company name / tax ID | super_admin | settings_admin | Fields read-only with tooltip "Contact support to change" |
| Manage integrations | admin, super_admin | integration_manage | Integration cards show status only, no configure |
| Feature flags | super_admin | feature_manage | Feature flags tab hidden |
| Data export/backup | admin, super_admin | data_export | Export button hidden |
| White-label settings | super_admin | platform_manage | Tab hidden entirely |

---

## 6. Status & State Machine

### Settings Form States

```
[Clean] ---(User edits field)--> [Dirty (Unsaved Changes)]
                                        |
                            +-----------+-----------+
                            |                       |
                            v                       v
                    [Saving...]              [Discard Changes]
                        |                       |
                        v                       v
                    [Saved] ------>         [Clean]
                        |
                        v
                    [Clean]
```

### Integration Connection States

| State | Visual | Actions Available |
|---|---|---|
| Not Connected | Gray card, "Not Connected" badge | "Connect" button |
| Connected | Green border, green "Connected" badge, last sync time | "Configure", "Disconnect", "Test Connection", "Sync Now" |
| Error | Red border, red "Error" badge, error message | "Reconnect", "View Logs", "Disconnect" |
| Syncing | Blue border, spinning indicator | "Cancel Sync" |

### Feature Flag States

| State | Visual | Description |
|---|---|---|
| Enabled | Green toggle ON | Feature active for this tenant |
| Disabled | Gray toggle OFF | Feature hidden for this tenant |
| Locked (subscription) | Gray toggle with lock icon | Feature requires higher subscription tier |
| Beta | Blue toggle with "Beta" badge | Feature in beta, may have issues |

---

## 7. Actions & Interactions

### Primary Action Buttons

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Save Changes | Check | Primary / Blue (disabled if no changes) | Saves all settings on current tab | No |
| Reset to Defaults | RotateCCW | Destructive / Red Outline | Resets current tab to default values | Yes -- "Reset all [tab name] settings to defaults?" |

### Tab-Specific Actions

| Tab | Actions |
|---|---|
| General | Upload Logo (drag-drop), Remove Logo, Save |
| Branding | Color Picker, Preview Changes, Save, Reset Colors |
| Security | Save, Test Password Policy (shows sample validation) |
| Integrations | Connect, Disconnect, Test Connection, Sync Now, View Logs |
| Feature Flags | Toggle on/off (auto-saves per flag) |
| Data | Export Data, Schedule Export, Delete Old Data (confirmation required) |
| Custom Fields | Add Field, Edit Field, Delete Field, Reorder Fields |
| Webhooks | Add Webhook, Edit, Delete, Test, View Delivery Log |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + S | Save current tab settings |
| Ctrl/Cmd + Z | Undo last field change |
| 1-9 | Switch to tab by number |
| Escape | Discard unsaved changes (with confirmation) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Logo image file | Logo upload zone | Upload and preview logo |
| Custom field row | Other position in field list | Reorder custom fields |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| tenant.settings.changed | { changedBy, section, fields } | If another admin changes settings, show banner: "Settings were updated by [name]" |
| integration.status.changed | { integrationId, newStatus } | Update integration card status badge and border color |
| integration.sync.completed | { integrationId, recordsSynced } | Update last sync time, show success toast |
| integration.sync.failed | { integrationId, error } | Update card to error state, show error toast |

### Live Update Behavior

- **Update frequency:** WebSocket push for settings changes and integration events
- **Visual indicator:** If another admin modifies settings, show amber banner with "Refresh to see changes"
- **Conflict handling:** If saving while another admin has saved, show conflict resolution: "These settings were changed since you started editing. [View Their Changes] [Override with Mine]"

### Polling Fallback

- **When:** WebSocket drops
- **Interval:** Every 120 seconds for integration status checks
- **Visual indicator:** "Live integration status paused"

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Toggle feature flag | Immediately toggle visual state | Revert toggle, show error toast |
| Save settings | Show "Saving..." then "Saved" flash | Show error, keep form in dirty state |
| Connect integration | Show "Connecting..." state | Revert to disconnected, show error |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| tenant-form | src/components/admin/tenant-form.tsx | tenantData, onSave |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| Tabs | shadcn tabs | tabs config |
| Input | shadcn input | standard form inputs |
| Switch | shadcn switch | toggle switches |
| Select | shadcn select | dropdown selectors |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| tenant-form | Basic company info fields (name, address) | Add logo upload zone, business hours scheduler, MC/DOT fields with format validation |
| Tabs | Standard tab navigation | Add unsaved changes indicator per tab (dot badge), more tabs for new sections |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| LogoUploader | Drag-and-drop zone with preview (200x200), crop/resize, remove button, file type/size validation | Medium |
| ColorPicker | Color picker with preset brand colors, hex input, live preview swatch, reset to default | Medium |
| BusinessHoursScheduler | 7-day scheduler with open/close time pickers per day, "Closed" toggle, timezone selector | Medium |
| IntegrationCard | Card component showing integration logo, name, status badge, last sync, connection actions | Medium |
| FeatureFlagList | Toggle list with feature name, description, subscription tier indicator, beta badge | Small |
| DefaultValuesForm | Form sections for payment terms, credit limits, equipment types, document templates | Medium |
| CustomFieldEditor | Modal/form for creating custom fields: name, type selector, options (for dropdown), required toggle, entity assignment | High |
| WebhookEditor | Form for endpoint URL, event multi-select, secret key (generated), test button with response display | Medium |
| DataRetentionConfig | Slider or dropdown per data type (audit logs, orders, contacts) with days/months retention period | Small |
| DataExportPanel | Export button with format selector (JSON/CSV), entity checkboxes, download history list, schedule option | Medium |
| EmailTemplateEditor | WYSIWYG editor for email templates with variable insertion ({company_name}, {load_number}) and preview | High |
| DomainVerificationCard | Card showing domain, verification status, DNS record instructions (TXT record), verify button | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Main settings tab navigation |
| Switch | switch | Feature flags, notification toggles, security toggles |
| Input | input | All text fields |
| Textarea | textarea | Description fields, IP allowlist |
| Select | select | Dropdown fields (timezone, state, session timeout) |
| Slider | slider | Data retention period selection |
| Alert Dialog | alert-dialog | Reset to defaults, data deletion confirmation |
| Tooltip | tooltip | Setting explanations, subscription tier info |
| Separator | separator | Section dividers within tabs |
| Color Picker | custom (no shadcn) | Brand color selection |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/tenant/settings | Fetch all tenant settings | useTenantSettings() |
| 2 | PATCH | /api/v1/tenant/settings/general | Update general settings | useUpdateGeneralSettings() |
| 3 | PATCH | /api/v1/tenant/settings/security | Update security settings | useUpdateSecuritySettings() |
| 4 | PATCH | /api/v1/tenant/settings/notifications | Update notification settings | useUpdateNotificationSettings() |
| 5 | PATCH | /api/v1/tenant/settings/branding | Update branding settings | useUpdateBrandingSettings() |
| 6 | PATCH | /api/v1/tenant/settings/defaults | Update business defaults | useUpdateDefaultSettings() |
| 7 | POST | /api/v1/tenant/logo | Upload company logo | useUploadLogo() |
| 8 | DELETE | /api/v1/tenant/logo | Remove company logo | useRemoveLogo() |
| 9 | GET | /api/v1/integrations | Fetch all integration statuses | useIntegrations() |
| 10 | POST | /api/v1/integrations/:id/connect | Connect an integration | useConnectIntegration() |
| 11 | DELETE | /api/v1/integrations/:id | Disconnect an integration | useDisconnectIntegration() |
| 12 | POST | /api/v1/integrations/:id/test | Test integration connection | useTestIntegration() |
| 13 | POST | /api/v1/integrations/:id/sync | Trigger manual sync | useSyncIntegration() |
| 14 | GET | /api/v1/tenant/feature-flags | Fetch feature flag states | useFeatureFlags() |
| 15 | PATCH | /api/v1/tenant/feature-flags/:flagId | Toggle a feature flag | useToggleFeatureFlag() |
| 16 | GET | /api/v1/tenant/custom-fields | Fetch custom field definitions | useCustomFields() |
| 17 | POST | /api/v1/tenant/custom-fields | Create custom field | useCreateCustomField() |
| 18 | PATCH | /api/v1/tenant/custom-fields/:id | Update custom field | useUpdateCustomField() |
| 19 | DELETE | /api/v1/tenant/custom-fields/:id | Delete custom field | useDeleteCustomField() |
| 20 | GET | /api/v1/tenant/webhooks | Fetch webhook configurations | useWebhooks() |
| 21 | POST | /api/v1/tenant/webhooks | Create webhook | useCreateWebhook() |
| 22 | POST | /api/v1/tenant/webhooks/:id/test | Test webhook delivery | useTestWebhook() |
| 23 | POST | /api/v1/tenant/export | Trigger data export | useExportTenantData() |
| 24 | POST | /api/v1/tenant/domain/verify | Verify email domain | useVerifyDomain() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| tenant:{tenantId} | settings.changed | useSettingsUpdates() -- shows conflict banner if concurrent edit |
| tenant:{tenantId} | integration.status.changed | useIntegrationUpdates() -- updates card statuses |
| tenant:{tenantId} | feature.toggled | useFeatureFlagUpdates() -- updates toggle states |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| PATCH /api/v1/tenant/settings/* | Validation errors shown inline per field | Redirect to login | "Permission Denied" toast | N/A | "Failed to save settings" toast with retry |
| POST /api/v1/tenant/logo | "Invalid file type/size" toast | Redirect to login | "Permission Denied" toast | N/A | "Upload failed" toast with retry |
| POST /api/v1/integrations/:id/connect | "Invalid credentials" toast | Redirect to login | "Permission Denied" toast | "Integration not found" toast | "Connection failed" toast with details |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Tab bar renders immediately. Active tab content shows form field skeletons (label + input placeholder). Integration cards show card skeleton shapes.
- **Progressive loading:** Tabs are clickable immediately; content loads per-tab on selection.
- **Duration threshold:** If loading exceeds 5s, show "Loading settings..." message.

### Empty States

**Integrations (none connected):**
- All cards show "Not Connected" state with "Connect" button
- Info banner: "Connect your integrations to sync data and automate workflows."

**Custom fields (none created):**
- **Headline:** "No custom fields yet"
- **Description:** "Create custom fields to capture additional data specific to your business."
- **CTA:** "+ Add Custom Field" button

**Webhooks (none configured):**
- **Headline:** "No webhooks configured"
- **Description:** "Set up webhooks to notify external systems when events occur in Ultra TMS."
- **CTA:** "+ Add Webhook" button

### Error States

**Full page error:**
- Error icon + "Unable to load settings" + Retry button

**Save error:**
- Red toast with specific validation errors; form highlights invalid fields in red

**Integration connection error:**
- Integration card shows red border, red "Error" badge, error message, "Reconnect" button

### Permission Denied

- **Full page denied:** "You don't have permission to access settings" with dashboard link
- **Partial denied:** Certain tabs hidden (e.g., Feature Flags for non-super-admin); certain fields read-only

### Offline / Degraded

- **Full offline:** "You're offline. Settings changes cannot be saved." All save buttons disabled.
- **Degraded:** Settings viewable from cache; saves queued until reconnection.

---

## 12. Filters, Search & Sort

### Tab Navigation

| # | Tab Label | Content | Icon |
|---|---|---|---|
| 1 | General | Company info, address, business hours | Building |
| 2 | Notifications | Email/SMS notification configuration | Bell |
| 3 | Security | Password policy, MFA, session, IP allowlist | Shield |
| 4 | Branding | Logo, colors, email templates | Palette |
| 5 | Defaults | Payment terms, credit limits, equipment types | Settings |
| 6 | Integrations | Third-party connection management | Plug |
| 7 | Data | Retention policies, backup/export | Database |
| 8 | Custom Fields | Custom field definitions per entity | Layers |
| 9 | Webhooks | Outbound webhook configuration | Globe |

### Search Behavior

- **Settings search (future):** Global search across all tabs to find a specific setting by name
- **Custom fields search:** Filter custom fields by name or entity type
- **Integration search:** Filter integration cards by name

### URL Sync

- Active tab reflected in URL: ?tab=general, ?tab=security, etc.
- Direct navigation to specific tab supported

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Tabs become scrollable horizontal tab bar (overflow scroll)
- Form fields stack to single column where currently side-by-side
- Integration cards: 2 per row instead of 3
- Business hours table stays single column

### Mobile (< 768px)

- Tabs switch to dropdown selector or vertical list
- All form fields stack vertically (full width)
- Integration cards: 1 per row (full width cards)
- Logo upload zone: full width, reduced height
- Color picker: simplified (preset swatches only, no custom hex)
- Save button becomes sticky bottom bar

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout with side-by-side fields |
| Desktop | 1024px - 1439px | Slightly compressed forms |
| Tablet | 768px - 1023px | See tablet notes |
| Mobile | < 768px | See mobile notes |

---

## 14. Stitch Prompt

```
Design a Tenant Settings / Configuration screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar (240px) on the left, white content area on the right. Top has a breadcrumb "Admin > Settings", the title "Settings", and a primary blue "Save Changes" button (disabled state) on the right.

Tab Navigation: Below the header, show a horizontal tab bar with 9 tabs: General (building icon, active), Notifications (bell icon), Security (shield icon), Branding (palette icon), Defaults (gear icon), Integrations (plug icon), Data (database icon), Custom Fields (layers icon), Webhooks (globe icon). Active tab has blue-600 bottom border. Tabs overflow with horizontal scroll.

General Tab Content (active):

Section 1 - "Company Information" with a card-style white background and rounded-lg border:
- Left side: Logo upload zone (160x160px dashed border area with "Drop logo here or click to upload" text and a small image icon, showing a sample company logo placeholder)
- Right side: Form fields in 2-column grid:
  - Company Name: "Ultra Logistics Inc." (text input)
  - Tax ID / EIN: "87-1234567" (masked input)
  - MC Number: "MC-123456" (text input with prefix)
  - DOT Number: "1234567" (numeric input)
  - Phone: "+1 (555) 987-6543" (phone input)
  - Website: "https://ultralogistics.com" (URL input)

Section 2 - "Address" card:
- Street: "123 Freight Boulevard"
- City: "Chicago" | State: "Illinois" (dropdown) | Zip: "60601"
- Country: "United States" (dropdown)

Section 3 - "Business Hours" card:
- 7-row table: Day name | Open Time | Close Time | Status toggle
  - Monday: 06:00 AM | 06:00 PM | Open (green switch)
  - Tuesday: 06:00 AM | 06:00 PM | Open
  - Wednesday: 06:00 AM | 06:00 PM | Open
  - Thursday: 06:00 AM | 06:00 PM | Open
  - Friday: 06:00 AM | 06:00 PM | Open
  - Saturday: 08:00 AM | 12:00 PM | Open (shorter hours)
  - Sunday: --- | --- | Closed (gray switch, time pickers disabled)
- Below: Timezone dropdown showing "America/Chicago (CST/CDT)"

Also show a small preview of the Integrations tab in a side callout: 6 integration cards in a 3x2 grid, each showing an integration logo (HubSpot, QuickBooks, Google Maps, Twilio, SendGrid, Slack), connection status (green "Connected" badge for 3, gray "Not Connected" for 2, red "Error" for 1), and a small "Configure" link.

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Tab bar: white background, border-b border-gray-200, active tab has blue-600 bottom border (2px)
- Form sections: white card background, rounded-lg, border border-gray-200, p-6, mb-4 spacing
- Section headers: 16px semibold, gray-900, with subtle separator below
- Input fields: rounded-md border border-gray-300, focus:ring-2 focus:ring-blue-500
- Switch toggles: green-500 when on, gray-300 when off
- Logo upload zone: dashed border-2 border-gray-300, rounded-lg, gray-50 background, hover: border-blue-400
- Integration cards: white border rounded-lg, 48px integration logo, status badge, border changes color based on status (green-200 connected, gray-200 not connected, red-200 error)
- Modern SaaS aesthetic similar to Vercel project settings or Stripe dashboard settings
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] General settings tab with company name and basic info
- [x] Notification settings tab with email notification toggles
- [x] Security settings tab with password policy (min length, complexity requirements)
- [x] Tabbed navigation between settings sections
- [x] Save per-tab with form validation
- [x] Inline validation error messages

**What needs polish / bug fixes:**
- [ ] No unsaved changes indicator when switching tabs (changes silently lost)
- [ ] Logo upload area is not implemented (placeholder only)
- [ ] No business hours configuration available
- [ ] Security settings lack MFA requirement toggle and session timeout config
- [ ] Tab state not reflected in URL (cannot deep-link to specific tab)

**What to add this wave:**
- [ ] Company branding: logo upload with drag-drop and preview, primary color picker with live preview, email template customization with WYSIWYG editor
- [ ] Business hours configuration: per-day open/close time pickers, timezone selector, holiday calendar
- [ ] Default values: payment terms, credit limit, equipment types, accessorial charges defaults
- [ ] Feature flags: toggle list for tenant-specific feature enablement with subscription tier indicators
- [ ] Integration connections: HubSpot, QuickBooks, Google Maps status cards with connect/disconnect/test actions
- [ ] Email domain verification: DNS record instructions, verification status, trusted sender setup
- [ ] Custom fields manager: create/edit/delete custom fields per entity with type selection
- [ ] Webhook configuration: endpoint management, event selection, secret keys, test and delivery logs
- [ ] Data retention policies: configurable retention periods per data type with compliance warnings
- [ ] Backup/export tenant data: full data export in JSON/CSV with scheduled export option
- [ ] Subscription/billing info (Phase C): current plan, usage meters, upgrade prompts
- [ ] White-label settings (Phase C): custom domain, custom login page, branding removal

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Logo upload and branding | High | Medium | P0 |
| Business hours configuration | Medium | Low | P0 |
| Default values (payment terms, etc.) | High | Low | P0 |
| Integration status cards | High | Medium | P0 |
| Unsaved changes indicator + URL tab sync | Medium | Low | P0 |
| Feature flags per tenant | Medium | Medium | P1 |
| Email domain verification | Medium | Medium | P1 |
| Custom fields manager | High | High | P1 |
| Webhook configuration | Medium | Medium | P1 |
| Data retention policies | Medium | Low | P1 |
| Backup/export tenant data | Medium | Medium | P2 |
| Subscription/billing (Phase C) | High | High | P2 |
| White-label settings (Phase C) | Medium | High | P2 |

### Future Wave Preview

- **Wave 2:** Multi-language settings (tenant-level language and locale), email template builder with drag-drop blocks, automated backup scheduling with cloud storage integration
- **Wave 3:** Self-service subscription management with Stripe integration, white-label configuration with custom domain SSL, tenant onboarding checklist with progress tracking

---
