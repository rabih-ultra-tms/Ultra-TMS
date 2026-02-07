# Lead Import Wizard

> Service: CRM (Service 02) | Wave: 1 | Priority: P1
> Route: /(dashboard)/crm/leads/import | Status: Not Started
> Primary Personas: James Wilson (Sales Agent), Sarah Chen (Ops Manager)
> Roles with Access: sales_agent, sales_manager, admin

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a guided multi-step wizard for bulk importing leads into the CRM from CSV files, Excel spreadsheets, or directly from HubSpot. The wizard walks users through six sequential steps -- Upload File, Map Columns, Preview & Validate, Configure Options, Import, and Results Summary -- ensuring data quality and preventing duplicate records before committing leads to the database.

**Business problem it solves:**
Sales teams frequently receive lead lists from trade shows, purchased databases, marketing campaigns, and partner referrals in spreadsheet format. Without a structured import tool, agents would need to manually enter each lead one by one -- a process that takes 2-3 minutes per lead. For a typical list of 500 leads, manual entry would consume over 16 hours of productive selling time. The import wizard reduces this to under 5 minutes while enforcing data quality through validation, deduplication, and field mapping.

**Key business rules:**
- Only users with `sales_agent`, `sales_manager`, or `admin` roles can access the import wizard
- Maximum file size is 10MB (approximately 50,000 rows for CSV)
- Supported file formats: CSV (.csv), Excel (.xlsx, .xls)
- At least `first_name` and one of `email` or `phone` must be mapped for a valid import
- Duplicate detection runs against existing leads by email (exact match), phone (normalized match), and company_name (fuzzy match with 90% threshold)
- Imported leads default to status `NEW` unless explicitly overridden in options
- Each import creates an audit log entry with the importing user, timestamp, file name, and row counts
- HubSpot imports pull contacts from the connected HubSpot account and follow the same mapping/validation flow
- Import operations are atomic per batch -- if a batch fails, all rows in that batch are rolled back

**Success metric:**
Average time to import a 500-row lead file drops from 16+ hours (manual entry) to under 5 minutes. Import error rate (rows requiring manual correction after import) stays below 2%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Leads List | Click "Import Leads" button in page header actions | None |
| CRM Dashboard | Click "Import Leads" CTA in first-time empty state | None |
| CRM Dashboard | Click "Import Leads" secondary action button | None |
| Direct URL | Bookmark or shared link to /crm/leads/import | None |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Leads List | Click "View Imported Leads" on results summary | ?importId={id}&status=NEW (filtered to show imported leads) |
| Leads List | Click "Back to Leads" at any step (with cancel confirmation) | None |
| Lead Detail | Click individual lead name in results summary | leadId |
| Lead Import Wizard (restart) | Click "Import Another File" on results summary | None (resets wizard) |

**Primary trigger:**
James Wilson (Sales Agent) returns from a freight industry trade show with a spreadsheet of 200 prospect contacts collected from badge scans and booth sign-ups. He navigates to Leads List, clicks "Import Leads," and follows the wizard to bulk-load these contacts into the CRM for follow-up.

**Success criteria (user completes the screen when):**
- User has uploaded a file and confirmed column mapping to CRM fields
- User has reviewed validation results and resolved (or accepted) any errors/warnings
- User has configured duplicate handling and assignment rules
- User has executed the import and received a results summary with counts
- User has downloaded the error report (if applicable) for offline correction

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

**Step Indicator Bar (persistent across all steps):**

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Leads > Import Leads                          |
|  Page Title: "Import Leads"                       [Cancel Import] |
+------------------------------------------------------------------+
|  Step Indicator:                                                   |
|  (1)-----(2)-----(3)-----(4)-----(5)-----(6)                      |
|  Upload   Map    Preview  Options Import  Results                  |
|  [done]  [active] [---]   [---]   [---]   [---]                  |
+------------------------------------------------------------------+
```

**Step 1: Upload File**

```
+------------------------------------------------------------------+
|  Step Indicator Bar (shown above)                                  |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------------------------------------------------+  |
|  |                                                             |  |
|  |    +--------------------------------------------------+    |  |
|  |    |                                                   |    |  |
|  |    |          [Upload Cloud Icon]                      |    |  |
|  |    |                                                   |    |  |
|  |    |     Drag and drop your file here, or              |    |  |
|  |    |           [Browse Files]                          |    |  |
|  |    |                                                   |    |  |
|  |    |     Supported: CSV, XLSX, XLS (max 10MB)         |    |  |
|  |    |                                                   |    |  |
|  |    +--------------------------------------------------+    |  |
|  |                      -- OR --                               |  |
|  |    +--------------------------------------------------+    |  |
|  |    | [HubSpot Logo]  Import from HubSpot              |    |  |
|  |    |  Pull contacts directly from your connected      |    |  |
|  |    |  HubSpot account                    [Connect ->] |    |  |
|  |    +--------------------------------------------------+    |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  +------------------------------------------------------------+  |
|  | Recent Imports:                                              |  |
|  | trade-show-leads.csv    | 342 leads | Jan 15, 2025 | James |  |
|  | marketing-q4-list.xlsx  | 128 leads | Dec 28, 2024 | Sarah |  |
|  | partner-referrals.csv   | 56 leads  | Dec 10, 2024 | James |  |
|  +------------------------------------------------------------+  |
|                                                                    |
+------------------------------------------------------------------+
|                                                     [Next Step ->]|
+------------------------------------------------------------------+
```

**Step 2: Map Columns**

```
+------------------------------------------------------------------+
|  Step Indicator Bar                                                |
+------------------------------------------------------------------+
|  File: trade-show-leads.csv | 342 rows detected | 8 columns       |
|  [Auto-mapped 6 of 8 columns]                    [Reset Mapping]  |
+------------------------------------------------------------------+
|                                                                    |
|  Source Column (CSV)          CRM Field              Status        |
|  +------------------------+  +---------------------+ +----------+ |
|  | "Full Name"            |  | first_name + last.. v| [Mapped]  | |
|  +------------------------+  +---------------------+ +----------+ |
|  | "Email Address"        |  | email              v| [Mapped]   | |
|  +------------------------+  +---------------------+ +----------+ |
|  | "Phone Number"         |  | phone              v| [Mapped]   | |
|  +------------------------+  +---------------------+ +----------+ |
|  | "Company"              |  | company_name       v| [Mapped]   | |
|  +------------------------+  +---------------------+ +----------+ |
|  | "Job Title"            |  | title              v| [Mapped]   | |
|  +------------------------+  +---------------------+ +----------+ |
|  | "Lead Source"          |  | source             v| [Mapped]   | |
|  +------------------------+  +---------------------+ +----------+ |
|  | "Monthly Volume"       |  | -- Select Field -- v| [Unmapped] | |
|  +------------------------+  +---------------------+ +----------+ |
|  | "Notes/Comments"       |  | -- Select Field -- v| [Unmapped] | |
|  +------------------------+  +---------------------+ +----------+ |
|                                                                    |
|  Preview of first 3 rows:                                          |
|  +------+----------+------------------+--------+---------+----+   |
|  | Row  | Full Name| Email Address    | Phone  | Company | .. |   |
|  +------+----------+------------------+--------+---------+----+   |
|  | 1    | John Doe | john@acme.com    | 555-.. | Acme Co | .. |   |
|  | 2    | Jane Sm..| jane@beta.com    | 555-.. | Beta LL | .. |   |
|  | 3    | Bob John | bob@gamma.io     | 555-.. | Gamma   | .. |   |
|  +------+----------+------------------+--------+---------+----+   |
|                                                                    |
+------------------------------------------------------------------+
|  [<- Back]                                          [Next Step ->]|
+------------------------------------------------------------------+
```

**Step 3: Preview & Validate**

```
+------------------------------------------------------------------+
|  Step Indicator Bar                                                |
+------------------------------------------------------------------+
|  Validation Summary:                                               |
|  +-------------+ +-------------+ +-------------+ +--------------+ |
|  | Ready       | | Warnings    | | Errors      | | Duplicates   | |
|  | 298 rows    | | 24 rows     | | 12 rows     | | 8 rows       | |
|  | [green]     | | [yellow]    | | [red]       | | [orange]     | |
|  +-------------+ +-------------+ +-------------+ +--------------+ |
+------------------------------------------------------------------+
|  [Show: All v]  [Search rows...]              [Export Errors CSV] |
+------------------------------------------------------------------+
|  +------+---+----------+------------------+--------+-----------+  |
|  | Stat | # | Name     | Email            | Phone  | Issue     |  |
|  +------+---+----------+------------------+--------+-----------+  |
|  | [ok] | 1 | John Doe | john@acme.com    | 555-.. | --        |  |
|  | [ok] | 2 | Jane Sm..| jane@beta.com    | 555-.. | --        |  |
|  | [!!] | 3 | Bob      | bob@invalid      |        | Invalid   |  |
|  |      |   |          |                  |        | email,    |  |
|  |      |   |          |                  |        | no phone  |  |
|  | [~~] | 4 | Sue Park | sue@acme.com     | 555-.. | Possible  |  |
|  |      |   |          |                  |        | duplicate |  |
|  | [!!] | 5 | (empty)  | (empty)          | (empty)| Missing   |  |
|  |      |   |          |                  |        | required  |  |
|  | [ok] | 6 | Tom Ray  | tom@delta.io     | 555-.. | --        |  |
|  | [~~] | 7 | Amy Lee  | amy@epsilon.com  | 555-.. | Warn:     |  |
|  |      |   |          |                  |        | no company|  |
|  +------+---+----------+------------------+--------+-----------+  |
|  Showing rows 1-25 of 342                   [<] Page 1 of 14 [>] |
+------------------------------------------------------------------+
|  [<- Back]                                          [Next Step ->]|
|  (12 rows with errors will be skipped unless fixed)                |
+------------------------------------------------------------------+
```

**Step 4: Configure Options**

```
+------------------------------------------------------------------+
|  Step Indicator Bar                                                |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------------------------------------------------+  |
|  | Duplicate Handling                                           |  |
|  | When a duplicate is found:                                   |  |
|  |   (o) Skip -- do not import the duplicate row               |  |
|  |   ( ) Update -- merge new data into existing lead            |  |
|  |   ( ) Create New -- import as a separate lead anyway         |  |
|  |                                                              |  |
|  | Match duplicates by:                                         |  |
|  |   [x] Email address (exact match)                            |  |
|  |   [x] Phone number (normalized)                              |  |
|  |   [ ] Company name (fuzzy match, 90% threshold)              |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  +------------------------------------------------------------+  |
|  | Default Values                                               |  |
|  |                                                              |  |
|  | Status:      [NEW               v]                           |  |
|  | Source:      [Trade Show         v] (override unmapped)       |  |
|  | Tags:        [hot-lead, q1-2025   ] (comma-separated)        |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  +------------------------------------------------------------+  |
|  | Assignment Rules                                             |  |
|  |                                                              |  |
|  |   (o) Assign all to me (James Wilson)                        |  |
|  |   ( ) Assign to specific user:  [-- Select User --  v]      |  |
|  |   ( ) Round-robin among team:   [Select Team...     v]      |  |
|  |   ( ) Leave unassigned                                       |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  +------------------------------------------------------------+  |
|  | Error Handling                                               |  |
|  |                                                              |  |
|  |   (o) Skip rows with errors and import valid rows only      |  |
|  |   ( ) Stop entire import if any row has errors               |  |
|  +------------------------------------------------------------+  |
|                                                                    |
+------------------------------------------------------------------+
|  [<- Back]                                        [Start Import ->]|
+------------------------------------------------------------------+
```

**Step 5: Import (Processing)**

```
+------------------------------------------------------------------+
|  Step Indicator Bar                                                |
+------------------------------------------------------------------+
|                                                                    |
|                                                                    |
|  +------------------------------------------------------------+  |
|  |                                                             |  |
|  |              Importing your leads...                        |  |
|  |                                                             |  |
|  |   [========================================--------]        |  |
|  |              247 of 330 rows processed (75%)                |  |
|  |                                                             |  |
|  |   Imported: 231  |  Skipped: 12  |  Errors: 4              |  |
|  |                                                             |  |
|  |   Estimated time remaining: ~15 seconds                     |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|                         [Cancel Import]                            |
|                                                                    |
|  Note: Cancelling will keep leads already imported.               |
|  You can clean up partial imports from the Leads List.            |
|                                                                    |
+------------------------------------------------------------------+
```

**Step 6: Results Summary**

```
+------------------------------------------------------------------+
|  Step Indicator Bar (all complete)                                 |
+------------------------------------------------------------------+
|                                                                    |
|               [Checkmark Icon]                                     |
|          Import Complete!                                          |
|                                                                    |
|  +-------------+ +-------------+ +-------------+ +--------------+ |
|  | Imported    | | Skipped     | | Errors      | | Duplicates   | |
|  | 298         | | 12          | | 8           | | 24           | |
|  | [green]     | | [gray]      | | [red]       | | [orange]     | |
|  +-------------+ +-------------+ +-------------+ +--------------+ |
|                                                                    |
|  +------------------------------------------------------------+  |
|  | Import Details                                               |  |
|  | File: trade-show-leads.csv                                   |  |
|  | Total rows: 342                                              |  |
|  | Imported by: James Wilson                                    |  |
|  | Date: January 15, 2025 at 2:34 PM                           |  |
|  | Duration: 45 seconds                                         |  |
|  | Import ID: IMP-2025-0847                                     |  |
|  | Assignment: All assigned to James Wilson                     |  |
|  | Default status: NEW                                          |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  +------------------------------------------------------------+  |
|  | Errors & Skipped Rows (20 rows)              [Download CSV] |  |
|  +------+----------+------------------+----------------------+  |
|  | Row  | Name     | Email            | Reason               |  |
|  +------+----------+------------------+----------------------+  |
|  | 3    | Bob      | bob@invalid      | Invalid email format |  |
|  | 5    | (empty)  | (empty)          | Missing required     |  |
|  | 14   | Sue Park | sue@acme.com     | Duplicate (email)    |  |
|  | 22   | ...      | ...              | ...                  |  |
|  +------+----------+------------------+----------------------+  |
|                                                                    |
+------------------------------------------------------------------+
|  [View Imported Leads]    [Import Another File]    [Back to Leads]|
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Step indicator, current step content, navigation buttons (Back/Next) | Users must always know where they are in the wizard and what action to take next |
| **Secondary** (visible but less prominent) | Validation summary counts, file metadata (name, row count, columns) | Context about the import data without overwhelming the current step |
| **Tertiary** (available on scroll or expand) | Individual row errors/warnings, preview data table, recent import history | Detail needed for investigation but not for every interaction |
| **Hidden** (behind a click) | Error report download, import audit log, HubSpot connection settings | Deep detail only accessed when troubleshooting or reporting |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | First Name | Lead.first_name | Text, required | Map Columns step - CRM field dropdown, Preview table column |
| 2 | Last Name | Lead.last_name | Text, required | Map Columns step - CRM field dropdown, Preview table column |
| 3 | Email | Lead.email | Email format, validated with regex | Map Columns step - CRM field dropdown, Preview table column |
| 4 | Phone | Lead.phone | Phone format, normalized to E.164 on import | Map Columns step - CRM field dropdown, Preview table column |
| 5 | Company Name | Lead.company_name | Text | Map Columns step - CRM field dropdown, Preview table column |
| 6 | Title | Lead.title | Text (job title) | Map Columns step - CRM field dropdown, Preview table column |
| 7 | Source | Lead.source | Enum dropdown (Trade Show, Website, Referral, Cold Call, Partner, HubSpot, Other) | Map Columns step - CRM field dropdown, Options step default value |
| 8 | Estimated Monthly Volume | Lead.estimated_monthly_volume | Integer, formatted with commas | Map Columns step - CRM field dropdown, Preview table column |
| 9 | Estimated Revenue | Lead.estimated_revenue | Currency $XX,XXX.XX | Map Columns step - CRM field dropdown, Preview table column |
| 10 | Notes | Lead.notes | Text, multi-line, max 2000 chars | Map Columns step - CRM field dropdown |
| 11 | Status | Lead.status | Badge: NEW (default), CONTACTED, QUALIFIED | Options step default value selector |
| 12 | Assigned To | Lead.assigned_to | User select dropdown (user_id reference) | Options step assignment rules |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Total Rows Detected | COUNT(rows) from parsed file, excluding header row | Integer: "342 rows detected" |
| 2 | Columns Detected | COUNT(columns) from parsed file header row | Integer: "8 columns" |
| 3 | Auto-Mapped Count | COUNT(columns) where smart mapping found a match | "Auto-mapped 6 of 8 columns" in green text |
| 4 | Valid Rows | COUNT(rows) passing all validation rules | Integer with green badge |
| 5 | Warning Rows | COUNT(rows) with non-blocking validation issues | Integer with yellow badge |
| 6 | Error Rows | COUNT(rows) failing required validation rules | Integer with red badge |
| 7 | Duplicate Rows | COUNT(rows) matching existing leads by configured criteria | Integer with orange badge |
| 8 | Import Progress | (processed_rows / total_importable_rows) * 100 | Percentage with progress bar |
| 9 | Estimated Time Remaining | (elapsed_time / processed_rows) * remaining_rows | Relative time: "~15 seconds" |
| 10 | Import Duration | end_timestamp - start_timestamp | "45 seconds" or "2 minutes 15 seconds" |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] **File upload with drag-and-drop** -- Accept CSV and Excel files via drag-drop zone or file browser dialog, with file type and size validation
- [ ] **Automatic column detection** -- Parse file headers and detect column names for the mapping step
- [ ] **Smart column mapping suggestions** -- Auto-match source columns to CRM fields using fuzzy name matching (e.g., "Email Address" maps to `email`, "Full Name" splits to `first_name` + `last_name`)
- [ ] **Manual column mapping UI** -- Dropdown selectors for each source column to map to a CRM field, with "Do not import" option
- [ ] **Data preview table** -- Show first 3-5 rows of parsed data below the mapping interface for quick visual verification
- [ ] **Row-level validation** -- Validate each row against CRM field rules (email format, required fields, data types) and display green/yellow/red status indicators
- [ ] **Duplicate detection** -- Check imported rows against existing leads by email (exact), phone (normalized), and company name (fuzzy 90%)
- [ ] **Validation summary dashboard** -- Show counts of valid, warning, error, and duplicate rows with filter toggles
- [ ] **Duplicate handling options** -- User selects Skip, Update existing, or Create new for duplicate rows
- [ ] **Default value configuration** -- Set default status, source, and tags for all imported leads
- [ ] **Assignment rules** -- Assign to self, specific user, round-robin among team, or leave unassigned
- [ ] **Progress bar during import** -- Real-time progress indicator showing rows processed, imported, skipped, and errored
- [ ] **Results summary** -- Final screen showing import outcome with counts and details
- [ ] **Error report download** -- Export skipped/errored rows as CSV with error reasons for offline correction
- [ ] **Cancel import** -- Ability to cancel during processing (keeps already-imported rows)

### Advanced Features (Logistics Expert Recommendations)

- [ ] **HubSpot direct import** -- Pull contacts from connected HubSpot account as an alternative to file upload, with the same mapping/validation flow
- [ ] **Name splitting intelligence** -- Automatically split "Full Name" columns into first_name and last_name using NLP heuristics (handles "Dr. John Smith Jr." patterns)
- [ ] **Phone number normalization** -- Auto-detect and normalize phone formats (US: +1XXXXXXXXXX, international support)
- [ ] **Saved mapping templates** -- Save column mapping configurations for reuse with future imports from the same source
- [ ] **Import scheduling** -- Schedule imports for off-peak hours to avoid system load during business hours
- [ ] **Undo import** -- Ability to roll back an entire import within 24 hours, reverting all created/updated leads
- [ ] **Import history log** -- View past imports with file names, row counts, dates, and users, with re-download of error reports
- [ ] **Smart deduplication preview** -- Show side-by-side comparison of imported row vs. existing lead for each duplicate, allowing per-row override decisions
- [ ] **Auto-enrichment on import** -- Automatically enrich imported leads with company data (industry, size, location) from Clearbit or similar service

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Access import wizard | sales_agent, sales_manager, admin | crm_import | Page redirects to Leads List with "Permission Denied" toast |
| Assign to other users | sales_manager, admin | crm_assign | Only "Assign to me" and "Leave unassigned" options shown |
| Round-robin assignment | sales_manager, admin | team_manage | Option hidden from assignment rules |
| HubSpot import | sales_manager, admin | integration_manage | HubSpot import card hidden; only file upload shown |
| View import history | sales_agent (own), sales_manager (team), admin (all) | crm_import | Sales agents see only their own imports in the recent imports list |
| Undo import | admin | crm_import_admin | "Undo Import" button hidden on results summary |

---

## 6. Status & State Machine

### Wizard Step State Machine

```
[Step 1: Upload] ---(File uploaded + parsed)---> [Step 2: Map Columns]
       |                                                 |
       |                                    (All required fields mapped)
       |                                                 |
       |                                                 v
       |                                     [Step 3: Preview & Validate]
       |                                                 |
       |                                   (User reviewed validation results)
       |                                                 |
       |                                                 v
       |                                     [Step 4: Configure Options]
       |                                                 |
       |                                        (Click "Start Import")
       |                                                 |
       |                                                 v
       |                                     [Step 5: Import Processing]
       |                                                 |
       |                                    (Import completes or cancelled)
       |                                                 |
       |                                                 v
       |                                     [Step 6: Results Summary]
       |                                                 |
       |                              +------------------+------------------+
       |                              |                  |                  |
       v                              v                  v                  v
  [Cancel at any step]         [View Leads]     [Import Another]    [Back to Leads]
  (Confirm dialog)             (Exit wizard)    (Reset to Step 1)   (Exit wizard)
```

### Import Job Status

```
[PENDING] ---(Start import)---> [PROCESSING] ---(All rows done)---> [COMPLETED]
                                      |                                    |
                                      v                                    v
                               [CANCELLED]                         [COMPLETED_WITH_ERRORS]
                         (User clicks cancel;                    (Some rows failed but
                          partial data kept)                      import finished)
```

### Actions Available Per Step

| Step | Available Actions | Restricted Actions |
|---|---|---|
| Step 1: Upload | Browse files, drag-drop file, select HubSpot import, cancel | Next (disabled until file uploaded) |
| Step 2: Map Columns | Change mappings, auto-map, reset mapping, preview data, back, cancel | Next (disabled until required fields mapped) |
| Step 3: Preview & Validate | Filter by status, search rows, export errors, back, cancel | Next (disabled if 0 valid rows) |
| Step 4: Configure Options | Change duplicate handling, set defaults, configure assignment, back, cancel | Start Import (always available if at least 1 valid row) |
| Step 5: Import Processing | Cancel import | Back, change settings (all disabled during processing) |
| Step 6: Results Summary | View imported leads, import another file, back to leads, download error report | Back (disabled -- cannot go back after import) |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| Valid / Ready | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| Warning | yellow-100 | yellow-800 | yellow-300 | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| Error | red-100 | red-800 | red-300 | `bg-red-100 text-red-800 border-red-300` |
| Duplicate | orange-100 | orange-800 | orange-300 | `bg-orange-100 text-orange-800 border-orange-300` |
| Mapped | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| Unmapped | gray-100 | gray-600 | gray-300 | `bg-gray-100 text-gray-600 border-gray-300` |
| Importing | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| Completed | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| Cancelled | gray-100 | gray-600 | gray-300 | `bg-gray-100 text-gray-600 border-gray-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Step Navigation)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Next Step | ArrowRight | Primary / Blue | Advances to next wizard step after validation | No (validation gates the transition) |
| Back | ArrowLeft | Secondary / Outline | Returns to previous wizard step | No |
| Start Import | Play | Primary / Blue (large) | Begins the import processing job | Yes -- "Import 298 leads? This action cannot be undone." |
| Cancel Import | X | Destructive / Red outline | Cancels the wizard and returns to Leads List | Yes -- "Cancel this import? Any uploaded data will be discarded." |

### Step-Specific Actions

| Step | Action Label | Icon | Action | Condition |
|---|---|---|---|---|
| Step 1 | Browse Files | Upload | Opens native file picker dialog | Always available |
| Step 1 | Import from HubSpot | HubSpot logo | Initiates HubSpot contact pull | HubSpot connected + user has integration_manage permission |
| Step 1 | Remove File | X | Clears uploaded file and resets parsing | File is uploaded |
| Step 2 | Auto-Map | Wand/Magic | Runs smart mapping algorithm on unmapped columns | Unmapped columns exist |
| Step 2 | Reset Mapping | RotateCcw | Clears all column mappings | At least one mapping exists |
| Step 2 | Save Template | Save | Saves current mapping configuration for reuse | All required fields mapped |
| Step 2 | Load Template | FolderOpen | Loads a previously saved mapping template | Saved templates exist |
| Step 3 | Export Errors CSV | Download | Downloads CSV of rows with errors/warnings only | Errors or warnings exist |
| Step 3 | Filter by status | Filter toggle | Toggles table to show only valid/warning/error/duplicate rows | Always available |
| Step 4 | Start Import | Play | Begins import processing | At least 1 valid row |
| Step 5 | Cancel Import | Square (stop) | Stops import processing mid-way | Import is in progress |
| Step 6 | View Imported Leads | ExternalLink | Navigates to Leads List filtered by import ID | Import completed with imported rows > 0 |
| Step 6 | Import Another File | Upload | Resets wizard to Step 1 | Always available |
| Step 6 | Download Error Report | Download | Downloads full CSV of all skipped/errored rows with reasons | Errors or skips > 0 |
| Step 6 | Back to Leads | ArrowLeft | Navigates to Leads List (unfiltered) | Always available |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + Enter | Advance to next step (same as "Next Step" button) |
| Escape | Open cancel confirmation dialog |
| Ctrl/Cmd + U | Open file upload dialog (Step 1 only) |
| Ctrl/Cmd + S | Save mapping template (Step 2 only) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| File from desktop/explorer | Upload drop zone (Step 1) | Uploads and parses the dropped file |
| N/A | Column mapping rows (Step 2) | No drag-drop for mapping -- uses dropdown selectors instead |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| import.progress | { importId, processedRows, totalRows, importedCount, skippedCount, errorCount } | Update progress bar percentage, row counters in Step 5 |
| import.completed | { importId, summary: { imported, skipped, errors, duplicates, duration } } | Transition from Step 5 to Step 6 with results summary |
| import.failed | { importId, errorMessage, processedRows } | Show error state in Step 5 with retry option and partial results |
| import.cancelled | { importId, processedRows, importedCount } | Show cancellation confirmation with partial import count |

### Live Update Behavior

- **Update frequency:** WebSocket push every 10 rows processed during import (Step 5) for smooth progress bar animation
- **Visual indicator:** Progress bar animates smoothly between updates; counters (imported/skipped/errors) increment in real-time with subtle scale animation
- **Conflict handling:** Only one import can run per user at a time. If user navigates away and returns, the wizard reconnects to the active import job and resumes showing progress

### Polling Fallback

- **When:** WebSocket connection drops during Step 5 (Import Processing)
- **Interval:** Every 3 seconds
- **Endpoint:** GET /api/v1/crm/imports/{importId}/status
- **Visual indicator:** Show "Live progress updates paused -- polling every 3s..." subtle text below progress bar

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Start Import | Immediately show Step 5 with progress bar at 0% and "Starting..." message | Return to Step 4 with error toast "Failed to start import. Please try again." |
| Cancel Import | Immediately show "Cancelling..." state and disable cancel button | Revert to processing state, show error toast "Failed to cancel. Import is still running." |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title: "Import Leads", breadcrumbs: ["CRM", "Leads", "Import"], actions |
| StatusBadge | src/components/ui/status-badge.tsx | status: string, size: 'sm' (for validation row status) |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination (for preview and validation tables) |
| hubspot-sync-badge | src/components/crm/hubspot-sync-badge.tsx | syncStatus (for HubSpot import option) |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic sort and pagination | Add row-level color coding (green/yellow/red backgrounds), inline error tooltips per cell, column-level validation icons |
| StatusBadge | Supports lead/opportunity statuses | Add import-specific statuses: Mapped, Unmapped, Valid, Warning, Error, Duplicate |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| ImportWizardShell | Wizard container managing step state, navigation, and step transitions with animation | Medium -- state machine, step validation gates, transition animations |
| WizardStepIndicator | Horizontal step progress bar showing 6 steps with active/completed/pending states | Small -- numbered circles with connecting lines, status colors |
| FileDropZone | Drag-and-drop file upload area with file type/size validation and visual feedback | Medium -- drag events, file parsing trigger, preview of uploaded file name/size |
| ColumnMapper | Two-column mapping interface: source columns on left, CRM field dropdowns on right | Large -- dropdown state management, smart mapping algorithm, preview integration |
| ColumnMappingRow | Single row in the mapper: source column label + CRM field dropdown + status badge | Small -- select dropdown, status indicator, validation |
| ValidationSummaryBar | Four stat cards showing valid/warning/error/duplicate counts with toggle filters | Small -- stat cards with click-to-filter behavior |
| ValidationPreviewTable | Data table with row-level validation coloring (green/yellow/red) and error tooltips | Medium -- extends DataTable with validation overlay, cell-level error indicators |
| ImportOptionsForm | Form for duplicate handling, default values, assignment rules, and error handling | Medium -- radio groups, select dropdowns, form state via react-hook-form + Zod |
| ImportProgressCard | Centered progress display with animated progress bar, counters, and time estimate | Medium -- progress bar animation, real-time counter updates, cancel button |
| ImportResultsSummary | Final summary screen with stat cards, import details, error table, and action buttons | Medium -- multiple sections, error table with CSV download |
| HubSpotImportCard | Card for HubSpot import option with connection status and import trigger | Small -- connection check, button with loading state |
| ErrorReportTable | Compact table showing skipped/errored rows with error reason column | Small -- extends DataTable with CSV export functionality |
| RecentImportsTable | Small table showing past 3 imports with file name, count, date, and user | Small -- static table with timestamp formatting |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Progress | progress | Import progress bar in Step 5 |
| Radio Group | radio-group | Duplicate handling and assignment rule options in Step 4 |
| Select | select | CRM field mapping dropdowns in Step 2, default value selectors in Step 4 |
| Checkbox | checkbox | Duplicate matching criteria checkboxes in Step 4 |
| Card | card | Stat cards, option group containers, upload zone container |
| Badge | badge | Validation status badges, mapping status badges |
| Alert Dialog | alert-dialog | Cancel import confirmation, start import confirmation |
| Tooltip | tooltip | Cell-level validation error messages in Step 3 |
| Input | input | Search rows in Step 3, tags input in Step 4 |
| Separator | separator | Visual dividers between option groups in Step 4 |
| Table | table | Preview data table in Step 2, validation table in Step 3, error table in Step 6 |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | POST | /api/v1/crm/imports/upload | Upload and parse CSV/Excel file, return parsed columns and row count | useUploadImportFile() |
| 2 | POST | /api/v1/crm/imports/parse-preview | Get first N rows of parsed data for preview | useImportPreview(fileId, limit) |
| 3 | POST | /api/v1/crm/imports/validate | Run validation on all rows with current mapping, return row-level results | useValidateImport(fileId, mapping) |
| 4 | POST | /api/v1/crm/imports/detect-duplicates | Run duplicate detection against existing leads | useDetectDuplicates(fileId, mapping, criteria) |
| 5 | POST | /api/v1/crm/imports/execute | Start the import job with all options configured | useExecuteImport() |
| 6 | GET | /api/v1/crm/imports/{importId}/status | Poll import job progress | useImportStatus(importId) |
| 7 | POST | /api/v1/crm/imports/{importId}/cancel | Cancel a running import job | useCancelImport() |
| 8 | GET | /api/v1/crm/imports/{importId}/results | Get final import results summary | useImportResults(importId) |
| 9 | GET | /api/v1/crm/imports/{importId}/errors | Get error/skipped rows with reasons (for CSV download) | useImportErrors(importId) |
| 10 | GET | /api/v1/crm/imports/history | Get recent import history for current user/team | useImportHistory() |
| 11 | POST | /api/v1/crm/imports/hubspot | Initiate HubSpot contact pull and parse into import format | useHubSpotImport() |
| 12 | GET | /api/v1/crm/imports/mapping-templates | Get saved mapping templates | useMappingTemplates() |
| 13 | POST | /api/v1/crm/imports/mapping-templates | Save a new mapping template | useSaveMappingTemplate() |
| 14 | GET | /api/v1/users?role=sales_agent,sales_manager | Get users for assignment dropdown | useAssignableUsers() |
| 15 | GET | /api/v1/teams | Get teams for round-robin assignment | useTeams() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| imports:{importId} | import.progress | useImportProgress(importId) -- updates progress bar and counters |
| imports:{importId} | import.completed | useImportProgress(importId) -- transitions to results step |
| imports:{importId} | import.failed | useImportProgress(importId) -- shows error state |
| imports:{importId} | import.cancelled | useImportProgress(importId) -- shows cancellation state |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 413 | 422 | 500 |
|---|---|---|---|---|---|---|---|
| POST /upload | "Invalid file format" toast | Redirect to login | "Permission Denied" toast | N/A | "File too large (max 10MB)" toast | "Could not parse file" toast with details | Error state with retry |
| POST /validate | "Invalid mapping" inline errors | Redirect to login | "Permission Denied" toast | N/A | N/A | Show validation errors per row | Error state with retry |
| POST /execute | "Invalid options" inline errors | Redirect to login | "Permission Denied" toast | N/A | N/A | "Import configuration invalid" toast | Error state in Step 5 with retry |
| GET /status | N/A | Redirect to login | "Permission Denied" toast | "Import not found" -- redirect to Step 1 | N/A | N/A | Show polling error with auto-retry |
| POST /cancel | N/A | Redirect to login | "Permission Denied" toast | "Import not found" toast | N/A | "Cannot cancel -- import already completed" toast | Error toast with retry |
| POST /hubspot | "HubSpot not connected" with setup link | Redirect to login | "Permission Denied" toast | N/A | N/A | "HubSpot sync error" with details | Error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Step 1 (Upload):** Page renders immediately with drop zone ready. Recent imports table shows skeleton rows (3 rows) until history loads.
- **Step 1 (File parsing):** After file drop/selection, show file name with spinning loader and "Parsing file..." text. Drop zone transitions to show file details (name, size, type) with a progress spinner.
- **Step 2 (Column detection):** Show skeleton mapping rows while columns are being detected and auto-mapped. "Analyzing columns..." overlay.
- **Step 3 (Validation):** Show skeleton summary cards (4 gray animated cards) and skeleton table rows while validation runs. "Validating 342 rows..." message with a progress indicator.
- **Step 5 (Import):** Progress bar shows at 0% with "Starting import..." text until first WebSocket update arrives.
- **Step 6 (Results):** Show skeleton summary cards until final results load (typically instant since import.completed event carries summary data).
- **Duration threshold:** If any step's loading exceeds 10 seconds, show "This is taking longer than expected for a file this size..." message.

### Empty States

**First-time empty (no import history):**
- **Illustration:** Spreadsheet-to-database illustration
- **Headline:** "Import your first batch of leads"
- **Description:** "Upload a CSV or Excel file to bulk-import leads into your CRM. You can also pull contacts directly from HubSpot."
- **CTA:** Drop zone is the primary CTA (always visible on Step 1)

**No errors after validation (all rows valid):**
- **Headline:** "All rows passed validation"
- **Description:** "All 342 rows are valid and ready to import. No errors or warnings detected."
- **Visual:** Large green checkmark icon with confetti-like accent

**No results after import (edge case -- file had only errors):**
- **Headline:** "No leads were imported"
- **Description:** "All rows in the file had validation errors. Download the error report to fix the issues and try again."
- **CTA:** "Download Error Report" (primary) | "Import Another File" (secondary)

**HubSpot not connected:**
- **Display:** HubSpot card shows grayed-out state with "HubSpot is not connected" and "Go to Settings" link to integration configuration

### Error States

**File upload error (invalid format or size):**
- **Display:** Drop zone border turns red. Error message below: "This file type is not supported. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file." or "File exceeds the 10MB limit. Try splitting into smaller files."

**File parsing error (corrupted or malformed file):**
- **Display:** Error card replacing the drop zone: "Could not parse this file. It may be corrupted or in an unsupported format." with "Try Another File" button.

**Validation API error:**
- **Display:** Error banner above the validation table: "Validation could not complete. Some rows may not have been checked." with "Retry Validation" button. Show partially validated results if available.

**Import processing error (server failure mid-import):**
- **Display:** Step 5 progress bar turns red. Show: "Import failed after processing 147 of 330 rows. 128 leads were successfully imported before the error." with "View Partial Results" and "Retry Remaining" buttons.

**Network error during import:**
- **Display:** Progress bar pauses with yellow "Connection lost -- reconnecting..." message. Auto-retry connection every 5 seconds. Import continues server-side regardless of client connection.

### Permission Denied

- **Full page denied:** Redirect to /crm/leads with toast: "You don't have permission to import leads. Contact your administrator."
- **Partial denied (HubSpot hidden):** HubSpot import card is not rendered. Only file upload option shown. No indication that HubSpot option exists.
- **Partial denied (assignment limited):** Only "Assign to me" and "Leave unassigned" options shown in Step 4. Round-robin and assign-to-other options hidden.

### Offline / Degraded

- **Full offline (before import starts):** Show banner: "You're offline. File upload and import require an internet connection. Please reconnect to continue."
- **Offline during import (Step 5):** Show banner: "Connection lost. Your import is still running on the server. We'll reconnect automatically and show your results." Progress bar pauses at last known state.
- **Degraded (WebSocket down during import):** Fall back to polling every 3 seconds. Show subtle text: "Live updates paused -- refreshing every 3 seconds."

### Additional Edge Cases

- **Browser tab close during import:** Show native browser "Leave page?" confirmation. Import continues server-side. User can return to /crm/leads/import to see results.
- **Duplicate file upload:** If user uploads same file name as a recent import, show warning: "A file named 'trade-show-leads.csv' was imported on Jan 15. Continue anyway?"
- **Very large file (>10,000 rows):** Show info banner: "Large file detected. Validation and import may take a few minutes." Adjust progress update frequency to every 50 rows.
- **Mixed encoding:** If file encoding cannot be auto-detected (not UTF-8), show encoding selector dropdown: UTF-8, ISO-8859-1, Windows-1252.
- **Empty file:** Show error: "This file appears to be empty. Please check the file and try again."
- **File with only headers (no data rows):** Show error: "This file contains column headers but no data rows."

---

## 12. Filters, Search & Sort

### Filters

Filters apply primarily within Step 3 (Preview & Validate) to help users investigate validation results.

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Validation Status | Toggle button group | All, Valid, Warnings, Errors, Duplicates | All | N/A (client-side only) |
| 2 | Search Rows | Text input | Free text search across all visible columns | Empty | N/A (client-side only) |

### Search Behavior

- **Search field:** Single search input above the validation preview table (Step 3)
- **Searches across:** All mapped column values in the preview data (name, email, phone, company, etc.)
- **Behavior:** Debounced 300ms, minimum 2 characters, highlights matching text in results, client-side filtering only (all data already loaded)
- **URL param:** N/A -- wizard state is not URL-synced (uses React state)

### Sort Options

| Column / Field | Default Direction | Sort Type | Step |
|---|---|---|---|
| Row Number | Ascending | Numeric | Step 3 |
| Validation Status | Errors first, then warnings, then valid | Custom order | Step 3 |
| Name | Ascending (A-Z) | Alphabetic | Step 3 |
| Email | Ascending (A-Z) | Alphabetic | Step 3 |
| Error Reason | Alphabetic | Alphabetic | Step 6 (Error Report) |

**Default sort:** Row number ascending in Step 3 preview. Errors-first as secondary sort when validation status filter is set to "All."

### Saved Filters / Presets

- **System presets:** N/A -- wizard is a transient flow, not a persistent view
- **User-created presets:** N/A
- **URL sync:** Wizard state is NOT synced to URL. The wizard uses internal React state. If the user refreshes the page, they return to Step 1 (with a warning that progress will be lost). The import route /crm/leads/import always starts fresh.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Step indicator bar: All 6 steps visible but with abbreviated labels (e.g., "Upload", "Map", "Preview", "Options", "Import", "Results")
- File drop zone: Full width, same height
- Column mapping (Step 2): Source and CRM field dropdowns stack slightly narrower but remain side by side
- Preview table (Step 2, Step 3): Horizontal scroll enabled for tables wider than viewport; first 2 columns (row number, status) sticky
- Validation summary cards (Step 3): 2 per row (2x2 grid) instead of 4 in a row
- Options form (Step 4): Full width, single column layout
- Results summary (Step 6): Stat cards 2 per row, error table with horizontal scroll

### Mobile (< 768px)

- Step indicator bar: Shows only current step number and name with left/right arrows to see adjacent steps, or collapses to "Step 2 of 6: Map Columns" text
- File drop zone: Full width, reduced height. "Drag and drop" text hidden (mobile does not support drag-drop). "Browse Files" button is prominent.
- Column mapping (Step 2): Each mapping row stacks vertically -- source column label on top, CRM field dropdown below, full width
- Preview table (Step 2): Hidden on mobile -- replaced with "3 rows parsed successfully" text confirmation
- Validation table (Step 3): Switches to card-based layout. Each card shows row number, validation status icon, key fields (name, email), and error message. Tap card to expand full row details.
- Validation summary cards (Step 3): Horizontal scroll (swipeable) or stack 1 per row
- Options form (Step 4): Full width, single column, radio groups use full-width stacked buttons instead of inline radios
- Progress display (Step 5): Centered, full width, no layout changes needed
- Results summary (Step 6): Stacked single column. Stat cards 2 per row. Error table switches to card view.
- Navigation buttons: Sticky bottom bar with "Back" (left) and "Next" (right) buttons, always visible
- Cancel: Moves from top-right to bottom bar as tertiary text link

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Same layout, slightly tighter spacing, preview tables may scroll horizontally |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design a multi-step Lead Import Wizard screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS." Show Step 2 (Map Columns) as the active step.

Layout: Full-width page with a dark slate-900 sidebar (240px) on the left with the "CRM" section expanded, "Leads" sub-item highlighted, and a blue-600 active indicator. White content area on the right. Top of content area has a page header with breadcrumb "CRM > Leads > Import Leads", page title "Import Leads", and a "Cancel Import" ghost button in the top-right.

Step Indicator: Below the header, show a horizontal step progress bar with 6 numbered circles connected by lines. Steps: (1) Upload -- completed with blue checkmark, (2) Map Columns -- active with blue filled circle, (3) Preview -- gray pending, (4) Options -- gray pending, (5) Import -- gray pending, (6) Results -- gray pending. Active step has blue-600 circle, completed has blue-600 with white checkmark, pending has gray-300 outline.

File Summary Bar: Below the step indicator, a subtle gray-50 bar showing "File: trade-show-leads.csv | 342 rows detected | 8 columns" on the left, and "Auto-mapped 6 of 8 columns" in green-600 text with a magic wand icon on the right, plus a "Reset Mapping" ghost button.

Main Content -- Column Mapping: Show 8 mapping rows in a clean card with white background. Each row has three elements in a horizontal layout: (1) a source column label in a gray-100 pill on the left showing the CSV header name, (2) an arrow icon pointing right, (3) a CRM field dropdown selector on the right. Rows: "Full Name" mapped to "first_name + last_name (split)" with a blue "Mapped" badge, "Email Address" mapped to "email" with blue "Mapped" badge, "Phone Number" mapped to "phone" with blue "Mapped" badge, "Company" mapped to "company_name" with blue "Mapped" badge, "Job Title" mapped to "title" with blue "Mapped" badge, "Lead Source" mapped to "source" with blue "Mapped" badge, "Monthly Volume" showing "-- Select CRM Field --" dropdown with gray "Unmapped" badge, "Notes/Comments" showing "-- Select CRM Field --" dropdown with gray "Unmapped" badge. Unmapped rows have a subtle yellow-50 background.

Preview Section: Below the mapping, a smaller section titled "Data Preview (first 3 rows)" showing a compact table with columns matching the mapped fields. Show 3 rows of realistic freight logistics data: Row 1: John Doe, john@acmeshipping.com, (312) 555-0147, Acme Shipping Co., VP Logistics, Trade Show, 150, Looking for FTL rates. Row 2: Jane Smith, jane@betalogistics.com, (415) 555-0238, Beta Logistics LLC, Director of Ops, Trade Show, 200, Interested in LTL. Row 3: Bob Johnson, bob@gammafreight.io, (214) 555-0391, Gamma Freight Inc., Supply Chain Mgr, Trade Show, 85, Needs reefer capacity.

Bottom Navigation: Sticky bottom bar with white background, subtle top border. "Back" outline button on the left, "Next Step" blue-600 primary button on the right with right arrow icon.

Design Specifications: Font is Inter or system sans-serif at 14px base size. Sidebar uses slate-900 background with white text and blue-600 active indicator. Content background is white with gray-50 accents. Primary color is blue-600 for buttons, active states, and mapped badges. Mapping rows have 12px vertical spacing with rounded-lg containers. Dropdowns use shadcn/ui Select styling with gray-200 borders. Status badges are small rounded-full pills. The overall aesthetic is clean, modern SaaS similar to Linear.app or Notion import flows, with generous whitespace and clear visual hierarchy.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Not Started)

**What's built and working:**
- [ ] Nothing -- this is a net-new screen (Wave 2 design, but prioritized to Wave 1 P1)

**What needs design before development:**
- [ ] Finalize smart mapping algorithm logic (fuzzy match thresholds for column name detection)
- [ ] Define exact validation rules per CRM field (email regex, phone format, required combinations)
- [ ] Confirm HubSpot import API contract with integration team
- [ ] Determine batch size for import processing (affects progress bar granularity)
- [ ] Design the "Undo Import" flow (admin-only, within 24 hours)

**What to build this wave:**
- [ ] Complete 6-step wizard shell with step navigation and validation gates
- [ ] File upload with drag-drop (CSV and Excel parsing via papaparse and xlsx libraries)
- [ ] Column mapping UI with smart auto-mapping suggestions
- [ ] Row-level validation with preview table and error/warning indicators
- [ ] Duplicate detection against existing leads (email, phone, company name)
- [ ] Import options form (duplicate handling, defaults, assignment)
- [ ] Import processing with real-time progress via WebSocket
- [ ] Results summary with error report CSV download
- [ ] HubSpot direct import integration

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Core wizard flow (upload, map, validate, import, results) | High | High | P0 |
| Smart auto-mapping suggestions | High | Medium | P0 |
| Duplicate detection (email + phone) | High | Medium | P0 |
| Row-level validation with preview | High | Medium | P0 |
| Progress bar with WebSocket updates | Medium | Medium | P1 |
| Error report CSV download | Medium | Low | P1 |
| HubSpot direct import | Medium | High | P1 |
| Saved mapping templates | Medium | Low | P1 |
| Name splitting intelligence (Full Name to first + last) | Medium | Medium | P1 |
| Assignment round-robin | Low | Medium | P2 |
| Import scheduling (off-peak) | Low | Medium | P2 |
| Undo import (admin rollback) | Low | High | P2 |
| Auto-enrichment via Clearbit | Low | High | P2 |
| Import history with re-downloadable error reports | Low | Low | P2 |

### Future Wave Preview

- **Wave 2:** Saved mapping templates for recurring import sources, import scheduling for off-peak processing, smart deduplication preview with side-by-side comparison, phone number normalization with international format support, undo/rollback capability for admins within 24-hour window
- **Wave 3:** AI-powered column mapping that learns from past imports, auto-enrichment of imported leads via third-party data providers (Clearbit, ZoomInfo), automated post-import workflows (auto-create follow-up tasks, trigger email sequences), import from additional sources (Salesforce, Google Contacts, LinkedIn Sales Navigator export)

---
