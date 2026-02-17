/**
 * Status Color System — TypeScript Constants
 *
 * Single source of truth for mapping entity statuses to their visual tokens.
 * All colors are defined in globals.css as CSS custom properties.
 * These TypeScript maps provide type-safe lookups for components.
 */

// ---------------------------------------------------------------------------
// Load Status
// ---------------------------------------------------------------------------
export const LOAD_STATUSES = {
  transit: { label: "In Transit", color: "transit", order: 0 },
  unassigned: { label: "Unassigned", color: "unassigned", order: 1 },
  tendered: { label: "Tendered", color: "tendered", order: 2 },
  dispatched: { label: "Dispatched", color: "dispatched", order: 3 },
  delivered: { label: "Delivered", color: "delivered", order: 4 },
  atrisk: { label: "At Risk", color: "atrisk", order: 5 },
} as const;

export type LoadStatus = keyof typeof LOAD_STATUSES;

// ---------------------------------------------------------------------------
// Order Status
// ---------------------------------------------------------------------------
export const ORDER_STATUSES = {
  draft: { label: "Draft", color: "unassigned" },
  pending: { label: "Pending", color: "unassigned" },
  confirmed: { label: "Confirmed", color: "info" },
  in_progress: { label: "In Progress", color: "dispatched" },
  completed: { label: "Completed", color: "delivered" },
  cancelled: { label: "Cancelled", color: "atrisk" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

// ---------------------------------------------------------------------------
// Carrier Status
// ---------------------------------------------------------------------------
export const CARRIER_STATUSES = {
  active: { label: "Active", color: "delivered" },
  inactive: { label: "Inactive", color: "unassigned" },
  pending: { label: "Pending Review", color: "tendered" },
  suspended: { label: "Suspended", color: "atrisk" },
  blacklisted: { label: "Blacklisted", color: "atrisk" },
} as const;

export type CarrierStatus = keyof typeof CARRIER_STATUSES;

// ---------------------------------------------------------------------------
// Document Status
// ---------------------------------------------------------------------------
export const DOCUMENT_STATUSES = {
  complete: { label: "Complete", color: "delivered" },
  pending: { label: "Pending", color: "tendered" },
  missing: { label: "Missing", color: "atrisk" },
  expiring: { label: "Expiring", color: "unassigned" },
  expired: { label: "Expired", color: "atrisk" },
} as const;

export type DocumentStatus = keyof typeof DOCUMENT_STATUSES;

// ---------------------------------------------------------------------------
// Insurance Status
// ---------------------------------------------------------------------------
export const INSURANCE_STATUSES = {
  active: { label: "Active", color: "delivered" },
  expiring: { label: "Expiring", color: "unassigned" },
  expired: { label: "Expired", color: "atrisk" },
} as const;

export type InsuranceStatus = keyof typeof INSURANCE_STATUSES;

// ---------------------------------------------------------------------------
// Priority Levels
// ---------------------------------------------------------------------------
export const PRIORITIES = {
  urgent: { label: "Urgent", color: "atrisk" },
  high: { label: "High", color: "unassigned" },
  normal: { label: "Normal", color: "dispatched" },
  low: { label: "Low", color: "delivered" },
} as const;

export type Priority = keyof typeof PRIORITIES;

// ---------------------------------------------------------------------------
// Quote Status
// ---------------------------------------------------------------------------
export const QUOTE_STATUSES = {
  DRAFT: { label: "Draft", status: undefined as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: "bg-gray-100 text-gray-700 border-gray-300" },
  SENT: { label: "Sent", status: "transit" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  VIEWED: { label: "Viewed", status: "tendered" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  ACCEPTED: { label: "Accepted", status: "delivered" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  CONVERTED: { label: "Converted", status: undefined as StatusColorToken | undefined, intent: "success" as Intent | undefined, className: undefined as string | undefined },
  REJECTED: { label: "Rejected", status: "atrisk" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  EXPIRED: { label: "Expired", status: "unassigned" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
} as const;

export type QuoteStatusToken = keyof typeof QUOTE_STATUSES;

// ---------------------------------------------------------------------------
// Invoice Status
// ---------------------------------------------------------------------------
export const INVOICE_STATUSES = {
  DRAFT: { label: "Draft", status: undefined as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: "bg-gray-100 text-gray-700 border-gray-300" },
  PENDING: { label: "Pending", status: "unassigned" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  SENT: { label: "Sent", status: "transit" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  VIEWED: { label: "Viewed", status: "tendered" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  PARTIAL: { label: "Partial", status: undefined as StatusColorToken | undefined, intent: "warning" as Intent | undefined, className: undefined as string | undefined },
  PAID: { label: "Paid", status: "delivered" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  OVERDUE: { label: "Overdue", status: "atrisk" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  VOID: { label: "Void", status: undefined as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: "bg-gray-100 text-gray-500 border-gray-300 line-through" },
} as const;

export type InvoiceStatusToken = keyof typeof INVOICE_STATUSES;

// ---------------------------------------------------------------------------
// Payment Status
// ---------------------------------------------------------------------------
export const PAYMENT_STATUSES = {
  PENDING: { label: "Pending", status: "unassigned" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  APPLIED: { label: "Applied", status: "delivered" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  PARTIAL: { label: "Partial", status: undefined as StatusColorToken | undefined, intent: "warning" as Intent | undefined, className: undefined as string | undefined },
  VOIDED: { label: "Voided", status: undefined as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: "bg-gray-100 text-gray-500 border-gray-300 line-through" },
} as const;

export type PaymentStatusToken = keyof typeof PAYMENT_STATUSES;

// ---------------------------------------------------------------------------
// Payable Status (Carrier Payables — amounts owed to carriers)
// ---------------------------------------------------------------------------
export const PAYABLE_STATUSES = {
  PENDING: { label: "Pending", status: "unassigned" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  ELIGIBLE: { label: "Eligible", status: "tendered" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  PROCESSING: { label: "Processing", status: "transit" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  PAID: { label: "Paid", status: "delivered" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
} as const;

export type PayableStatusToken = keyof typeof PAYABLE_STATUSES;

// ---------------------------------------------------------------------------
// Settlement Status (carrier settlement payouts)
// ---------------------------------------------------------------------------
export const SETTLEMENT_STATUSES = {
  CREATED: { label: "Created", status: "unassigned" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  APPROVED: { label: "Approved", status: "tendered" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  PROCESSED: { label: "Processed", status: "transit" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
  PAID: { label: "Paid", status: "delivered" as StatusColorToken | undefined, intent: undefined as Intent | undefined, className: undefined as string | undefined },
} as const;

export type SettlementStatusToken = keyof typeof SETTLEMENT_STATUSES;

// ---------------------------------------------------------------------------
// Intent (semantic meaning, not entity-specific)
// ---------------------------------------------------------------------------
export type Intent = "success" | "warning" | "danger" | "info";

// ---------------------------------------------------------------------------
// Status Color Token (the 6 status colors defined in CSS)
// ---------------------------------------------------------------------------
export type StatusColorToken =
  | "transit"
  | "unassigned"
  | "tendered"
  | "dispatched"
  | "delivered"
  | "atrisk";

// ---------------------------------------------------------------------------
// Utility: get Tailwind classes for a status color token
// ---------------------------------------------------------------------------
export function getStatusClasses(token: StatusColorToken) {
  return {
    text: `text-status-${token}` as const,
    bg: `bg-status-${token}-bg` as const,
    border: `border-status-${token}-border` as const,
    dot: `bg-status-${token}` as const,
  };
}

export function getIntentClasses(intent: Intent) {
  return {
    text: `text-${intent}` as const,
    bg: `bg-${intent}-bg` as const,
    border: `border-${intent}-border` as const,
  };
}
