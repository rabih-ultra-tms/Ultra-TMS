# 08 - Print & Export Layouts

> All printable and exportable documents in the Ultra TMS system.
> Each document includes layout specifications, field definitions, recipients, and generation triggers.

---

## General Print/Export Standards

- **Default Paper Size:** US Letter (8.5" x 11") unless noted otherwise
- **Default Orientation:** Portrait unless noted otherwise
- **File Formats:** PDF (primary), CSV (data exports), XLSX (financial reports)
- **Branding:** All documents include the brokerage company logo (top-left), company name, address, phone, email, and MC/DOT numbers where applicable
- **Fonts:** Sans-serif for readability (system default: Inter or Helvetica Neue)
- **Margins:** 0.5" on all sides minimum for printer compatibility
- **Footer:** Page number, document ID, and "Generated on [date] at [time]" timestamp on every page
- **Watermark Support:** DRAFT, COPY, VOID watermarks configurable per document type

---

## 1. Bill of Lading (BOL)

### Purpose
The official shipping document that travels with freight. Serves as a receipt of goods, a contract of carriage, and a document of title. Required by law for all interstate freight shipments.

### Layout
- **Size:** 8.5" x 11" (US Letter)
- **Orientation:** Portrait
- **Format:** Standard VICS (Voluntary Interindustry Commerce Solutions) BOL format
- **Pages:** 1-2 (multi-stop loads may extend to 2 pages)

### Key Sections

#### Header
| Field | Description |
|-------|-------------|
| BOL Number | System-generated unique identifier (e.g., BOL-2024-00001) |
| Date | Shipment date |
| Page X of Y | Page numbering for multi-page BOLs |
| Carrier Name | Carrier legal name |
| Carrier SCAC | Standard Carrier Alpha Code |
| Trailer Number | Trailer/container number |
| Seal Number | Seal number(s) applied at origin |

#### Ship From Section (Left Column)
| Field | Description |
|-------|-------------|
| Shipper Name | Origin facility/company name |
| Address | Full street address |
| City, State, ZIP | Location |
| SID# | Shipper ID number |
| FOB | Freight on Board indicator |

#### Ship To Section (Right Column)
| Field | Description |
|-------|-------------|
| Consignee Name | Destination facility/company name |
| Address | Full street address |
| City, State, ZIP | Location |
| CID# | Consignee ID number |
| Delivery Date | Requested delivery date |

#### Third Party Freight Charges Section
| Field | Description |
|-------|-------------|
| Bill To Name | Party responsible for freight charges |
| Address | Full billing address |

#### Commodity Table
| Column | Description |
|--------|-------------|
| Handling Unit Qty | Number of handling units (pallets, crates) |
| Handling Unit Type | Type (pallet, crate, drum, etc.) |
| Package Qty | Number of packages within handling units |
| Package Type | Type of package |
| Weight | Weight in pounds |
| HM (X) | Hazardous material indicator checkbox |
| Commodity Description | Description of freight |
| NMFC# | National Motor Freight Classification number |
| Class | Freight class |

#### Special Instructions Section
| Field | Description |
|-------|-------------|
| Special Instructions | Free-text area for temperature requirements, stacking instructions, appointment details |
| Reference Numbers | PO numbers, order numbers, PRO numbers |

#### Signature Section
| Field | Description |
|-------|-------------|
| Shipper Signature | Signature line with printed name and date |
| Carrier Signature | Driver signature with printed name and date |
| Receiver Signature | Delivery signature with printed name and date |
| Freight Counted | Checkbox: by shipper / by driver / by both |

### Recipients
- **Shipper** (origin facility) - original copy
- **Carrier/Driver** - carrier copy
- **Consignee** (destination facility) - consignee copy
- **Broker** (retained in system) - broker copy

### When Generated
- Automatically when a load status changes to DISPATCHED
- Manually via "Print BOL" button on Load Detail screen
- Bulk print available from Loads list for multiple loads

---

## 2. Rate Confirmation

### Purpose
Legally binding agreement between broker and carrier confirming the load details and agreed-upon rate. Must be signed by carrier before pickup to ensure both parties agree to terms.

### Layout
- **Size:** 8.5" x 11" (US Letter)
- **Orientation:** Portrait
- **Format:** Custom branded template
- **Pages:** 1-2
- **Bilingual Option:** English/Spanish toggle (prints both languages side-by-side or as separate pages)

### Key Sections

#### Header
| Field | Description |
|-------|-------------|
| Rate Confirmation # | System-generated (e.g., RC-2024-00001) |
| Date Issued | Date the rate con was created |
| Load Number | Internal load reference |
| Broker MC# | Broker's Motor Carrier number |
| Broker Company Name | Full legal brokerage name |
| Broker Contact | Dispatcher name, direct phone, email |

#### Carrier Information
| Field | Description |
|-------|-------------|
| Carrier Legal Name | From carrier profile |
| Carrier MC# | Motor Carrier number |
| Carrier DOT# | Department of Transportation number |
| Carrier Contact | Name, phone, email |
| Driver Name | Assigned driver (if known) |
| Driver Phone | Driver cell phone |
| Truck Number | Power unit number |
| Trailer Number | Trailer number |

#### Pickup Information
| Field | Description |
|-------|-------------|
| Pickup Location | Facility name and full address |
| Pickup Date | Scheduled pickup date |
| Pickup Time | Appointment time or window (e.g., 08:00 - 12:00) |
| Pickup Number | Facility pickup reference number |
| Pickup Instructions | Gate procedures, dock assignments, special requirements |

#### Delivery Information
| Field | Description |
|-------|-------------|
| Delivery Location | Facility name and full address |
| Delivery Date | Scheduled delivery date |
| Delivery Time | Appointment time or window |
| Delivery Number | Facility delivery reference number |
| Delivery Instructions | Receiving hours, dock info, special requirements |

#### Multi-Stop Details (if applicable)
| Field | Description |
|-------|-------------|
| Stop Number | Sequential stop number |
| Stop Type | Pickup / Delivery |
| Location | Full address |
| Date/Time | Scheduled date and appointment |
| Reference | Stop-specific reference numbers |

#### Load Details
| Field | Description |
|-------|-------------|
| Commodity | Description of freight |
| Weight | Total weight in lbs |
| Pieces/Pallets | Count and unit type |
| Equipment Type | Van, Reefer, Flatbed, etc. |
| Temperature | Required temperature range (if reefer) |
| Dimensions | Length, width, height if relevant |
| Hazmat | Yes/No and UN number if applicable |

#### Rate Breakdown
| Field | Description |
|-------|-------------|
| Line Haul Rate | Base rate (flat or per mile) |
| Fuel Surcharge | If applicable |
| Detention Pay | Rate and free time |
| Accessorial Charges | Lumper, TONU, layover, etc. |
| Total Carrier Pay | Sum of all charges |
| Payment Terms | Net 30, Quick Pay (2% fee), etc. |

#### Special Instructions
| Field | Description |
|-------|-------------|
| Broker Notes | Any special handling, tracking requirements, communication expectations |
| Required Documents | List of documents carrier must submit (BOL, POD, weight tickets, etc.) |

#### Terms & Conditions
- Standard terms and conditions text (configurable in system settings)
- Typically includes: liability, insurance requirements, payment terms, dispute resolution, no double brokering clause

#### Signature Block
| Field | Description |
|-------|-------------|
| Carrier Representative Name | Printed name |
| Carrier Representative Title | Title |
| Signature | Signature line |
| Date | Date of acceptance |
| Broker Representative Name | Auto-filled from dispatcher profile |

### Recipients
- **Carrier** - sent via email or fax
- **Broker file** - retained in system attached to load

### When Generated
- Automatically when a carrier is assigned to a load (status changes to CARRIER_ASSIGNED)
- Manually via "Send Rate Confirmation" button on Load Detail
- Re-sent after any rate amendments

---

## 3. Customer Invoice

### Purpose
Billing document sent to the customer (shipper) after successful delivery of freight. Serves as the official request for payment and must include all necessary details for customer AP processing.

### Layout
- **Size:** 8.5" x 11" (US Letter)
- **Orientation:** Portrait
- **Format:** Professional branded template
- **Pages:** 1-2

### Key Sections

#### Header
| Field | Description |
|-------|-------------|
| Invoice Number | System-generated sequential (e.g., INV-2024-00001) |
| Invoice Date | Date invoice is issued |
| Due Date | Calculated from payment terms (e.g., Net 30 from invoice date) |
| Payment Terms | Net 15, Net 30, Net 45, etc. |
| Brokerage Logo | Company logo |
| Brokerage Info | Company name, address, phone, email, MC# |

#### Bill To Section
| Field | Description |
|-------|-------------|
| Customer Name | Company legal name |
| Customer Address | Billing address (may differ from shipping address) |
| Attention | AP contact name |
| Customer Account # | Internal customer reference |
| Customer PO# | Customer purchase order number |

#### Shipment Reference Section
| Field | Description |
|-------|-------------|
| Load Number | Internal load reference |
| Order Number | Original order reference |
| BOL Number | Bill of Lading number |
| PRO Number | Carrier PRO number |
| Customer Reference | Any customer-provided reference numbers |

#### Shipment Details
| Field | Description |
|-------|-------------|
| Origin | City, State (full address optional) |
| Destination | City, State (full address optional) |
| Pickup Date | Actual pickup date |
| Delivery Date | Actual delivery date |
| Equipment Type | Type of trailer used |
| Weight | Total shipment weight |
| Pieces | Number of pieces/pallets |
| Miles | Total mileage |

#### Charges Breakdown
| Field | Description |
|-------|-------------|
| Line Item Description | Description of each charge |
| Quantity | Units (miles, hours, etc.) |
| Rate | Per-unit rate |
| Amount | Line total |
| Subtotal | Sum before adjustments |
| Discounts | Any applicable discounts |
| Fuel Surcharge | If applicable |
| Accessorial Charges | Detention, lumper, TONU, etc. |
| **Total Due** | **Grand total amount** |

#### Payment Information
| Field | Description |
|-------|-------------|
| Remit-To Name | Company name for payment |
| Remit-To Address | Mailing address for checks |
| Bank Name | For ACH/wire payments |
| Routing Number | ABA routing number |
| Account Number | Bank account number |
| ACH Email | Email for ACH remittance advice |
| Payment Reference | "Please reference Invoice # on payment" |

#### Footer
| Field | Description |
|-------|-------------|
| Late Payment Terms | Interest rate on overdue balances (e.g., 1.5% per month) |
| Dispute Contact | Email/phone for billing disputes |
| Thank You Note | Optional customer appreciation message |

### Recipients
- **Customer AP Department** - sent via email (PDF attachment) or mailed
- **Broker accounting file** - retained in system

### When Generated
- Automatically when load status changes to DELIVERED and POD is received (configurable)
- Manually via "Generate Invoice" button on Load Detail
- Batch invoice generation from Accounting module (end of day/week)

---

## 4. Carrier Settlement / Pay Statement

### Purpose
Detailed payment statement sent to carrier along with payment (check or ACH). Provides full transparency on rate, deductions, and net payment for carrier record-keeping and reconciliation.

### Layout
- **Size:** 8.5" x 11" (US Letter)
- **Orientation:** Portrait
- **Format:** Statement-style with itemized details
- **Pages:** 1-3 (may include multiple loads per settlement)

### Key Sections

#### Header
| Field | Description |
|-------|-------------|
| Settlement # | System-generated (e.g., SETTLE-2024-00001) |
| Settlement Date | Date payment is issued |
| Check/ACH # | Payment reference number |
| Settlement Period | Date range for loads included |
| Brokerage Info | Company name, address, phone, MC# |

#### Carrier Information
| Field | Description |
|-------|-------------|
| Carrier Legal Name | From carrier profile |
| Carrier MC# / DOT# | Carrier identifiers |
| Remit-To Address | Carrier payment address |
| Tax ID (last 4) | Last 4 digits of EIN for verification |

#### Load Detail Lines (per load)
| Column | Description |
|--------|-------------|
| Load # | Load reference number |
| Pickup Date | Date of pickup |
| Origin | Origin city, state |
| Destination | Destination city, state |
| BOL # | Bill of Lading reference |
| Gross Rate | Agreed carrier rate |
| Accessorials | Additional charges (detention, lumper reimbursement) |
| Subtotal | Gross rate + accessorials |

#### Deductions Section
| Field | Description |
|-------|-------------|
| Quick Pay Fee | Percentage deducted for early payment (e.g., 2% quick pay) |
| Cash Advance | Any cash advances issued to driver |
| Fuel Advance | Fuel advance deductions |
| Chargebacks | Damage claims, shortages |
| Other Deductions | Insurance, cargo claims, etc. |
| Total Deductions | Sum of all deductions |

#### Settlement Summary
| Field | Description |
|-------|-------------|
| Total Gross Pay | Sum of all load subtotals |
| Total Deductions | Sum of all deductions |
| **Net Payment** | **Gross minus deductions (bold, large font)** |
| Payment Method | Check / ACH / Wire |
| Payment Reference | Check number or ACH trace number |

#### Footer
| Field | Description |
|-------|-------------|
| Dispute Contact | Email/phone for settlement disputes |
| Dispute Window | "Disputes must be raised within 30 days of settlement date" |

### Recipients
- **Carrier** - sent via email with payment notification or mailed with check
- **Broker accounting file** - retained in system

### When Generated
- When carrier payment is processed in the Accounting module
- Batch generation for weekly/bi-weekly carrier pay runs
- On-demand for quick pay settlements

---

## 5. Proof of Delivery (POD)

### Purpose
Confirms that freight was delivered to the consignee. Essential for invoicing the customer and serves as legal proof that the carrier fulfilled their obligation. Often required before customer payment is released.

### Layout
- **Size:** 8.5" x 11" (US Letter)
- **Orientation:** Portrait
- **Format:** Structured form with signature capture area
- **Pages:** 1-2 (additional pages for photo attachments)

### Key Sections

#### Header
| Field | Description |
|-------|-------------|
| POD Number | System-generated or linked to BOL number |
| Load Number | Internal load reference |
| BOL Number | Bill of Lading reference |
| Carrier Name | Carrier who made delivery |
| Driver Name | Driver who made delivery |

#### Delivery Details
| Field | Description |
|-------|-------------|
| Delivery Location | Full address of consignee |
| Delivery Date | Actual delivery date |
| Delivery Time | Actual time of delivery |
| Appointment Time | Original scheduled appointment |
| On Time | Yes/No indicator |

#### Freight Verification
| Field | Description |
|-------|-------------|
| Pieces Delivered | Count of pieces/pallets delivered |
| Pieces Expected | Count originally shipped |
| Weight | Weight at delivery |
| Condition of Freight | Good / Damaged / Short / Over |
| Damage Notes | Description of any damage observed |
| Shortage Notes | Description of any shortages |
| Overage Notes | Description of any overages |
| Seal Intact | Yes/No - was the seal intact on arrival |
| Seal Number | Seal number verified at delivery |

#### Receiver Confirmation
| Field | Description |
|-------|-------------|
| Receiver Name | Printed name of person receiving freight |
| Receiver Title | Title/position |
| Receiver Signature | Signature capture (digital or scanned) |
| Date Signed | Date of signature |

#### Photo Attachments
| Field | Description |
|-------|-------------|
| Delivery Photos | Photos of freight at delivery (condition documentation) |
| BOL Photo | Photo of signed BOL |
| Seal Photo | Photo of intact/broken seal |

#### Notes
| Field | Description |
|-------|-------------|
| Driver Notes | Any notes from the driver about the delivery |
| Receiver Notes | Any notes from the receiving party |
| Exception Notes | Details of any exceptions or issues |

### Recipients
- **Broker operations** - uploaded to load file by carrier/driver
- **Customer** - provided on request or with invoice
- **Carrier file** - carrier retains copy

### When Generated
- Captured by driver at delivery via mobile app or paper form
- Uploaded/scanned to system by carrier or broker staff
- Digital POD generated when delivery is confirmed in tracking

---

## 6. Carrier Packet

### Purpose
Comprehensive onboarding document package sent to new carriers during the setup process. Contains all agreements and forms that must be completed before a carrier can be assigned loads. Ensures compliance and establishes the business relationship.

### Layout
- **Size:** 8.5" x 11" (US Letter)
- **Orientation:** Portrait (mixed - some forms may be landscape)
- **Format:** Multi-document package (typically stapled or as combined PDF)
- **Pages:** 8-15 pages total

### Documents Included

#### 1. Carrier-Broker Agreement (3-5 pages)
| Section | Description |
|---------|-------------|
| Parties | Broker and carrier legal names, MC numbers |
| Scope of Services | Transportation services to be provided |
| Independent Contractor | Carrier is independent contractor, not employee |
| Insurance Requirements | Minimum coverage amounts (auto, cargo, general liability) |
| Indemnification | Mutual indemnification clauses |
| Liability | Cargo liability and claims process |
| Payment Terms | Standard payment terms (Net 30, quick pay options) |
| No Double Brokering | Prohibition against re-brokering loads |
| Confidentiality | Non-disclosure of rate and customer information |
| Termination | Terms for ending the agreement |
| Signature Block | Both parties sign with date |

#### 2. W-9 Form (1 page)
| Field | Description |
|-------|-------------|
| Standard IRS W-9 | Request for Taxpayer Identification Number |
| Legal Name | Carrier legal name |
| Business Type | LLC, Corporation, Sole Proprietor, etc. |
| EIN/SSN | Tax identification number |
| Address | Legal address |
| Signature | Carrier authorized signature |

#### 3. Insurance Certificate Request (1 page)
| Field | Description |
|-------|-------------|
| Auto Liability Minimum | $1,000,000 minimum |
| Cargo Insurance Minimum | $100,000 minimum (configurable) |
| General Liability | $1,000,000 minimum |
| Workers Compensation | As required by state law |
| Certificate Holder | Broker must be listed as certificate holder |
| Additional Insured | Broker listed as additional insured |
| 30-Day Cancellation Notice | Required notice period |

#### 4. Payment Information Form (1 page)
| Field | Description |
|-------|-------------|
| Payment Method Preference | Check / ACH / Wire / Quick Pay |
| Bank Name | For ACH setup |
| Routing Number | ABA routing number |
| Account Number | Bank account number |
| Account Type | Checking / Savings |
| Remit-To Address | Address for check payments |
| Factoring Company | If carrier uses factoring (company name, address, NOA) |

#### 5. Contact Information Form (1 page)
| Field | Description |
|-------|-------------|
| Primary Contact | Name, title, phone, email |
| Dispatch Contact | Name, phone, email, after-hours phone |
| Billing Contact | Name, phone, email |
| Safety Contact | Name, phone, email |
| Emergency Contact | 24/7 emergency phone |
| Preferred Communication | Email / Phone / Text |
| ELD Provider | Electronic logging device system used |

#### 6. Equipment List (1 page)
| Field | Description |
|-------|-------------|
| Truck Count | Number of power units |
| Trailer Count | Number of trailers by type |
| Equipment Types | Van, Reefer, Flatbed, Step Deck, etc. |
| Operating Regions | Lanes/regions carrier typically services |

### Recipients
- **New carrier** - sent via email as fillable PDF or via carrier onboarding portal
- **Carrier compliance team** - reviews completed packets
- **Broker file** - retained in carrier profile

### When Generated
- When a new carrier is created in the system (status = PENDING)
- When "Send Carrier Packet" is clicked on the Carrier Detail screen
- Automatically as part of the carrier onboarding workflow

---

## 7. Load Tender Sheet

### Purpose
Printable load tender document that summarizes all load details for carrier reference. Used when tendering a load to a carrier before formal rate confirmation. Can serve as a quick-reference sheet for the driver.

### Layout
- **Size:** 8.5" x 11" (US Letter)
- **Orientation:** Portrait
- **Format:** Single-page summary
- **Pages:** 1

### Key Sections

#### Header
| Field | Description |
|-------|-------------|
| Tender # | System-generated |
| Load # | Internal load reference |
| Date Issued | Tender date |
| Respond By | Deadline for carrier acceptance |
| Broker Contact | Dispatcher name, phone, email |

#### Load Details
| Field | Description |
|-------|-------------|
| Equipment Required | Trailer type and specifications |
| Commodity | Freight description |
| Weight | Total weight in lbs |
| Pieces/Pallets | Count and type |
| Temperature | If reefer (min/max range) |
| Hazmat | Yes/No with class if applicable |
| Miles | Estimated total mileage |

#### Pickup Information
| Field | Description |
|-------|-------------|
| Facility Name | Origin facility |
| Address | Full address |
| Date/Time | Pickup date and appointment window |
| Contact | Facility contact and phone |
| Reference Numbers | PO#, pickup#, etc. |
| Special Instructions | Loading notes, dock info |

#### Delivery Information
| Field | Description |
|-------|-------------|
| Facility Name | Destination facility |
| Address | Full address |
| Date/Time | Delivery date and appointment window |
| Contact | Facility contact and phone |
| Reference Numbers | Delivery#, PO#, etc. |
| Special Instructions | Unloading notes, receiving hours |

#### Rate
| Field | Description |
|-------|-------------|
| Offered Rate | Flat rate or per-mile rate |
| Rate Per Mile | Calculated RPM |
| Fuel Surcharge | If applicable |
| Total | All-in carrier pay |

#### Acceptance
| Field | Description |
|-------|-------------|
| Carrier Name | Carrier company name |
| Authorized Signature | Signature line |
| Printed Name | Printed name line |
| Date | Date line |
| Truck # | Assigned truck number |
| Trailer # | Assigned trailer number |
| Driver Name | Assigned driver name |
| Driver Phone | Driver cell phone |

### Recipients
- **Carrier** - sent via email, fax, or load board
- **Broker operations** - retained in load file

### When Generated
- When a load is tendered to a specific carrier
- When posting a load to a carrier via the dispatch board
- Manually via "Print Tender" on Load Detail screen

---

## 8. Daily Dispatch Report

### Purpose
End-of-day summary report for operations management. Provides a snapshot of all dispatch activity, delivery completions, exceptions, and key financial metrics for the day. Used in daily operations meetings and management review.

### Layout
- **Size:** 8.5" x 11" (US Letter) or 11" x 17" (Tabloid for detailed version)
- **Orientation:** Landscape
- **Format:** Multi-section report with tables and charts
- **Pages:** 2-5

### Key Sections

#### Report Header
| Field | Description |
|-------|-------------|
| Report Title | "Daily Dispatch Report" |
| Report Date | Date of the report |
| Generated By | User who generated the report |
| Generated At | Timestamp |
| Date Range | Reporting period (default: today) |

#### Summary KPI Cards (Top Row)
| Metric | Description |
|--------|-------------|
| Loads Dispatched Today | Count of loads dispatched |
| Loads Delivered Today | Count of loads delivered |
| Loads In Transit | Count of loads currently in transit |
| Exceptions/Issues | Count of loads with exceptions |
| Revenue Today | Sum of customer rates for today's dispatched loads |
| Carrier Cost Today | Sum of carrier rates for today's dispatched loads |
| Margin Today | Revenue minus cost |
| Margin % | Margin as percentage of revenue |

#### Loads Dispatched Table
| Column | Description |
|--------|-------------|
| Load # | Load reference |
| Customer | Customer name |
| Origin | City, State |
| Destination | City, State |
| Carrier | Assigned carrier |
| Pickup Date | Scheduled pickup |
| Delivery Date | Scheduled delivery |
| Customer Rate | Revenue |
| Carrier Rate | Cost |
| Margin | Profit |
| Margin % | Profit percentage |
| Status | Current status |

#### Loads Delivered Table
| Column | Description |
|--------|-------------|
| Load # | Load reference |
| Customer | Customer name |
| Origin → Destination | Lane |
| Carrier | Carrier who delivered |
| Scheduled Delivery | Original delivery date |
| Actual Delivery | Actual delivery date/time |
| On Time | Yes/No |
| POD Received | Yes/No |
| Customer Rate | Revenue |

#### Exceptions & Issues Table
| Column | Description |
|--------|-------------|
| Load # | Load reference |
| Exception Type | Late pickup, late delivery, detention, damage, etc. |
| Description | Details of the issue |
| Dispatcher | Assigned dispatcher |
| Resolution Status | Open / In Progress / Resolved |

#### Charts Section
| Chart | Description |
|-------|-------------|
| Loads by Status (Pie) | Breakdown of all active loads by status |
| Revenue vs Cost (Bar) | Daily revenue vs carrier cost comparison |
| On-Time Performance (Gauge) | On-time delivery percentage gauge |
| Dispatch Volume (Line) | Trend of daily dispatch volume over past 7 days |

#### Dispatcher Performance
| Column | Description |
|--------|-------------|
| Dispatcher | Name |
| Loads Dispatched | Count |
| Loads Delivered | Count |
| Revenue | Total revenue |
| Margin % | Average margin |
| Exceptions | Count of exceptions |

### Recipients
- **Operations Manager** - daily review
- **Dispatchers** - team performance review
- **Executive team** - management dashboard

### When Generated
- Automatically at end of business day (configurable time, e.g., 6:00 PM)
- On-demand via "Generate Report" in the Reports module
- Scheduled email delivery to configured recipients

---

## 9. AR Aging Report

### Purpose
Accounts Receivable aging report that shows outstanding customer invoices grouped by aging buckets. Essential for credit management, collections prioritization, and cash flow forecasting. Used by accounting and management to monitor customer payment behavior.

### Layout
- **Size:** 8.5" x 11" (US Letter) or 11" x 17" (Tabloid for detailed version)
- **Orientation:** Landscape
- **Format:** Tabular report with summary and detail views
- **Pages:** 2-10+ (depends on number of customers)

### Key Sections

#### Report Header
| Field | Description |
|-------|-------------|
| Report Title | "Accounts Receivable Aging Report" |
| As-Of Date | Date the aging is calculated from |
| Generated By | User who generated the report |
| Generated At | Timestamp |
| Filter Applied | Customer, sales rep, date range, or "All" |

#### Summary Section (Top)
| Metric | Description |
|--------|-------------|
| Total AR Outstanding | Grand total of all unpaid invoices |
| Current (0-30 days) | Total for invoices 0-30 days old |
| 31-60 Days | Total for invoices 31-60 days old |
| 61-90 Days | Total for invoices 61-90 days old |
| 90+ Days | Total for invoices over 90 days old |
| DSO (Days Sales Outstanding) | Average collection period |
| Number of Customers with Balance | Count of customers with open invoices |

#### Aging Summary by Customer
| Column | Description |
|--------|-------------|
| Customer Name | Company name |
| Account # | Customer account number |
| Sales Rep | Assigned sales representative |
| Credit Limit | Customer credit limit |
| Current (0-30) | Amount in 0-30 day bucket |
| 31-60 Days | Amount in 31-60 day bucket |
| 61-90 Days | Amount in 61-90 day bucket |
| 90+ Days | Amount in 90+ day bucket |
| Total Outstanding | Sum of all buckets |
| Last Payment Date | Date of most recent payment received |
| Last Payment Amount | Amount of most recent payment |

#### Detail View (per Customer)
| Column | Description |
|--------|-------------|
| Invoice # | Invoice reference number |
| Invoice Date | Date invoice was issued |
| Due Date | Payment due date |
| Load # | Associated load reference |
| Original Amount | Invoice total |
| Payments Applied | Payments received to date |
| Balance Due | Remaining balance |
| Days Outstanding | Number of days since invoice date |
| Aging Bucket | Current, 31-60, 61-90, 90+ |
| Notes | Collection notes or dispute status |

#### Charts
| Chart | Description |
|-------|-------------|
| AR by Aging Bucket (Stacked Bar) | Visual breakdown of AR by bucket |
| AR Trend (Line) | Outstanding AR over past 6 months |
| Top 10 Customers by Balance (Horizontal Bar) | Largest outstanding balances |

#### Footer
| Field | Description |
|-------|-------------|
| Report Totals | Column totals for all financial fields |
| Aging Distribution % | Percentage of total AR in each bucket |

### Recipients
- **Accounting/AR team** - daily collections management
- **CFO/Controller** - financial oversight
- **Sales reps** - customer credit awareness
- **Executive team** - cash flow visibility

### When Generated
- Weekly automated report (configurable: Monday morning)
- On-demand from the Accounting module
- Monthly for management financial review
- Triggered when customer exceeds credit limit (alert + report)

---

## 10. Carrier Scorecard Report

### Purpose
Performance evaluation report for individual carriers or carrier fleet. Tracks key metrics including on-time performance, claim rates, compliance, and communication scores. Used for carrier reviews, tier assignments, and relationship management.

### Layout
- **Size:** 8.5" x 11" (US Letter)
- **Orientation:** Portrait
- **Format:** Scorecard with metrics, charts, and narrative sections
- **Pages:** 2-3

### Key Sections

#### Report Header
| Field | Description |
|-------|-------------|
| Report Title | "Carrier Scorecard Report" |
| Carrier Name | Carrier legal name |
| Carrier MC# / DOT# | Carrier identifiers |
| Report Period | Date range (e.g., "Q4 2024" or "Jan 2024 - Dec 2024") |
| Generated By | User who generated the report |
| Generated At | Timestamp |
| Carrier Tier | Current tier assignment (Platinum, Gold, Silver, Bronze) |

#### Overall Score Section
| Metric | Description |
|--------|-------------|
| Overall Score | Weighted composite score out of 100 |
| Tier Recommendation | Suggested tier based on score |
| Previous Period Score | Comparison to last period |
| Trend | Improving / Stable / Declining |

#### Performance Metrics Table
| Metric | Weight | Score | Value | Target | Status |
|--------|--------|-------|-------|--------|--------|
| On-Time Pickup % | 20% | X/100 | XX% | 95% | Green/Yellow/Red |
| On-Time Delivery % | 25% | X/100 | XX% | 95% | Green/Yellow/Red |
| Tender Acceptance Rate | 10% | X/100 | XX% | 80% | Green/Yellow/Red |
| Claim Rate | 15% | X/100 | XX% | <2% | Green/Yellow/Red |
| Communication Score | 10% | X/100 | XX/5 | 4/5 | Green/Yellow/Red |
| Document Compliance % | 10% | X/100 | XX% | 100% | Green/Yellow/Red |
| Check Call Compliance % | 10% | X/100 | XX% | 90% | Green/Yellow/Red |

#### Load Volume Statistics
| Metric | Description |
|--------|-------------|
| Total Loads (Period) | Number of loads completed |
| Total Revenue Paid | Sum of carrier payments |
| Average Rate Per Mile | Average RPM across all loads |
| Top Lanes | Most frequently serviced lanes |
| Equipment Used | Breakdown by equipment type |

#### Charts
| Chart | Description |
|-------|-------------|
| Performance Radar Chart | Spider/radar chart showing all metric scores |
| On-Time Trend (Line) | Monthly on-time % over the reporting period |
| Load Volume Trend (Bar) | Monthly load count over the reporting period |
| Score Trend (Line) | Overall score trend over past 4 quarters |

#### Issue Summary
| Column | Description |
|--------|-------------|
| Date | Date of incident |
| Load # | Load reference |
| Issue Type | Late delivery, claim, communication failure, etc. |
| Description | Brief description |
| Resolution | How it was resolved |
| Impact | Financial impact if any |

#### Compliance Status
| Field | Description |
|-------|-------------|
| Insurance Status | Active / Expiring Soon / Expired |
| Insurance Expiration | Date of earliest expiring policy |
| Authority Status | Active / Pending / Revoked |
| Safety Rating | Satisfactory / Conditional / Unsatisfactory |
| Last SAFER Check | Date of most recent FMCSA check |

#### Notes & Recommendations
| Field | Description |
|-------|-------------|
| Period Summary | Free-text narrative summarizing carrier performance |
| Recommendations | Actions to improve (e.g., "Improve check call compliance") |
| Tier Change | If tier is being changed, note previous and new tier with reason |

### Recipients
- **Carrier relations team** - carrier management
- **Carrier** - provided during quarterly reviews
- **Operations management** - carrier fleet oversight
- **Procurement** - carrier selection decisions

### When Generated
- Quarterly automated generation for all active carriers
- On-demand from the Carrier Detail screen
- When carrier tier change is being evaluated
- Annual carrier review cycle

---

## Export Format Options

All documents support the following export formats:

| Format | Use Case | Notes |
|--------|----------|-------|
| PDF | Primary print/email format | Branded, formatted, print-ready |
| CSV | Data export for analysis | Raw data, no formatting |
| XLSX | Spreadsheet export | Formatted with headers, suitable for Excel |
| HTML | Email body | Inline-styled HTML for email rendering |

## Print Queue & Batch Printing

- **Print Queue:** Users can add multiple documents to a print queue and print all at once
- **Batch Operations:** Bulk print rate confirmations, invoices, or BOLs from list views
- **Print Preview:** Always show print preview before sending to printer
- **Email as PDF:** Option to email any document as PDF attachment directly from the system
- **Template Customization:** Admin can customize templates (logo, colors, terms) in Settings > Print Templates

## Document Storage

- All generated documents are stored as PDFs in the document management system
- Linked to the parent entity (load, carrier, customer, invoice)
- Versioned: amended documents create new versions while retaining originals
- Retention policy: Configurable per document type (default: 7 years for financial documents)
