# TMS Orders Components

**Location:** `apps/web/components/tms/orders/`
**Component count:** 16

## Components

### OrderForm (Multi-Step Wizard)
- **File:** `order-form.tsx`
- **Props:** Initial data, onSubmit, mode (create/edit)
- **Used by:** Order create/edit pages
- **Description:** Multi-step order creation wizard. Orchestrates the step components below. Uses React Hook Form with Zod schema validation.

### OrderFormSchema
- **File:** `order-form-schema.ts`
- **Props:** N/A (Zod schema definition)
- **Description:** Zod validation schema for the order form. Defines all field validations, conditional requirements, and type coercions.

### OrderCustomerStep
- **File:** `order-customer-step.tsx`
- **Props:** Form control, customers data
- **Description:** Step 1: Customer selection with searchable dropdown, billing address, contact selection.

### OrderCargoStep
- **File:** `order-cargo-step.tsx`
- **Props:** Form control, cargo items
- **Description:** Step 2: Cargo details including commodity, weight, dimensions, piece count, hazmat flags, and temperature requirements.

### OrderRateStep
- **File:** `order-rate-step.tsx`
- **Props:** Form control
- **Description:** Step 3: Rate entry with linehaul, fuel surcharge, accessorial charges, and total calculation.

### OrderReviewStep
- **File:** `order-review-step.tsx`
- **Props:** Form values
- **Description:** Step 4: Final review before submission. Shows all entered data in read-only format with edit links back to each step.

### OrderStopsBuilder
- **File:** `order-stops-builder.tsx`
- **Props:** Stops array, onChange
- **Description:** Dynamic stops builder allowing add/remove/reorder of pickup and delivery stops. Each stop includes address (via AddressAutocomplete), appointment window, and contact.

### OrderColumns
- **File:** `order-columns.tsx`
- **Props:** N/A (column definitions)
- **Description:** TanStack Table column definitions for the orders list table. Defines status, order number, customer, origin, destination, dates, and rate columns.

### OrderFilters
- **File:** `order-filters.tsx`
- **Props:** Active filters, onChange
- **Description:** Filter controls for the orders list page.

### OrderDetailOverview
- **File:** `order-detail-overview.tsx`
- **Props:** Order data
- **Used by:** Order detail page
- **Description:** Overview tab of order detail showing customer info, route summary, financial summary, and order metadata.

### OrderDocumentsTab
- **File:** `order-documents-tab.tsx`
- **Props:** Order ID
- **Description:** Documents tab for order detail page.

### OrderItemsTab
- **File:** `order-items-tab.tsx`
- **Props:** Order items array
- **Description:** Tab showing order line items/cargo details.

### OrderLoadsTab
- **File:** `order-loads-tab.tsx`
- **Props:** Order ID, loads
- **Description:** Tab showing loads created from this order with status and links.

### OrderNotesTab
- **File:** `order-notes-tab.tsx`
- **Props:** Order ID
- **Description:** Tab for viewing and adding notes to an order.

### OrderStopsTab
- **File:** `order-stops-tab.tsx`
- **Props:** Order stops data
- **Description:** Tab showing order stops with addresses, appointment windows, and status.

### OrderTimelineTab
- **File:** `order-timeline-tab.tsx`
- **Props:** Order ID
- **Description:** Timeline of all order events.
